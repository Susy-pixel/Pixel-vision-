import { ClassificationResult, ImageMetadata } from '../types/index';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export interface QualityCheckResult {
  isValid: boolean;
  errorMessage?: string;
  hasQualityWarning: boolean;
  qualityWarningMessage?: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getAspectRatioString(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const wRatio = width / divisor;
  const hRatio = height / divisor;

  // If complex fraction, show decimal approximation
  if (wRatio > 20 || hRatio > 20) {
    const ratioVal = (width / height).toFixed(2);
    return `${ratioVal}:1`;
  }
  return `${wRatio}:${hRatio}`;
}

export async function validateAndInspectImage(
  file: File,
  dataUrl: string
): Promise<QualityCheckResult> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      errorMessage: 'Unsupported image format. Please provide a JPG, PNG, or WEBP image.',
      hasQualityWarning: false,
      width: 0,
      height: 0,
      aspectRatio: '0:0',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: `File exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE_BYTES)}.`,
      hasQualityWarning: false,
      width: 0,
      height: 0,
      aspectRatio: '0:0',
    };
  }

  if (file.size < 100) {
    return {
      isValid: false,
      errorMessage: 'The uploaded file appears to be empty or corrupted.',
      hasQualityWarning: false,
      width: 0,
      height: 0,
      aspectRatio: '0:0',
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const aspectRatio = getAspectRatioString(width, height);

      let hasQualityWarning = false;
      let qualityWarningMessage: string | undefined;

      if (width < 200 || height < 200) {
        hasQualityWarning = true;
        qualityWarningMessage =
          'Image resolution is very low (< 200px). Visual feature extraction may be less reliable.';
      }

      // Check contrast / variance on an offscreen canvas
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
          const imgData = ctx.getImageData(0, 0, 64, 64);
          const data = imgData.data;

          // Compute mean and variance of brightness
          let sum = 0;
          const totalPixels = 64 * 64;
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            sum += gray;
          }
          const mean = sum / totalPixels;

          let varianceSum = 0;
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            varianceSum += Math.pow(gray - mean, 2);
          }
          const variance = varianceSum / totalPixels;

          if (variance < 80 && !hasQualityWarning) {
            hasQualityWarning = true;
            qualityWarningMessage =
              'Image appears to have very low contrast or is exceptionally dark/flat. Classification accuracy may be reduced.';
          }
        }
      } catch {
        // Non-blocking quality check failure
      }

      resolve({
        isValid: true,
        hasQualityWarning,
        qualityWarningMessage,
        width,
        height,
        aspectRatio,
      });
    };

    img.onerror = () => {
      resolve({
        isValid: false,
        errorMessage: 'Unable to decode image. The file may be corrupt or damaged.',
        hasQualityWarning: false,
        width: 0,
        height: 0,
        aspectRatio: '0:0',
      });
    };

    img.src = dataUrl;
  });
}

export async function createThumbnail(dataUrl: string, maxDim = 160): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function prepareImageForAnalysis(
  dataUrl: string,
  maxDimension = 1600
): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension && !dataUrl.startsWith('data:image/svg')) {
        const mime = dataUrl.startsWith('data:image/png')
          ? 'image/png'
          : dataUrl.startsWith('data:image/webp')
          ? 'image/webp'
          : 'image/jpeg';
        resolve({ dataUrl, mimeType: mime });
        return;
      }

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#050914';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const optimized = canvas.toDataURL('image/jpeg', 0.88);
        resolve({ dataUrl: optimized, mimeType: 'image/jpeg' });
      } else {
        resolve({ dataUrl, mimeType: 'image/jpeg' });
      }
    };
    img.onerror = () => resolve({ dataUrl, mimeType: 'image/jpeg' });
    img.src = dataUrl;
  });
}

export function generateReportText(
  result: ClassificationResult,
  imageMeta: ImageMetadata
): string {
  const timestampStr = new Date(result.timestamp).toLocaleString();
  const sep = '='.repeat(64);
  const subSep = '-'.repeat(64);

  return `${sep}
PIXELVISION AI — INTELLIGENT IMAGE CLASSIFICATION REPORT
${sep}

Report Timestamp   : ${timestampStr}
System Engine      : Google Gemini Vision (gemini-3.8-flash)
Analysis Duration  : ${result.processingTimeMs} ms
Classification Mode: ${result.classificationMode.toUpperCase()}

${subSep}
1. PRIMARY IDENTIFICATION
${subSep}
Prediction Label   : ${result.primaryLabel}
Confidence Score   : ${result.confidence}%
Category           : ${result.category}
Status             : ${
    result.isUncertain
      ? 'UNCERTAIN (Evidence Insufficient)'
      : !result.isSupported
      ? 'UNSUPPORTED IN CURRENT MODE'
      : 'SUCCESSFUL / CONFIDENT'
  }
Multiple Subjects  : ${result.hasMultipleObjects ? 'YES' : 'NO'}
${
  result.hasMultipleObjects && result.detectedObjects?.length
    ? `Other Detected   : ${result.detectedObjects.join(', ')}\n`
    : ''
}${
    result.uncertaintyReason
      ? `Uncertainty Note   : ${result.uncertaintyReason}\n`
      : ''
  }
${subSep}
2. AI RATIONALE & OBSERVATIONS
${subSep}
Explanation:
${result.description}

Visual Evidence Points:
${result.visualEvidence.map((ev, i) => `  [${i + 1}] ${ev}`).join('\n')}

${subSep}
3. ALTERNATIVE PREDICTIONS
${subSep}
${
  result.alternatives && result.alternatives.length > 0
    ? result.alternatives
        .map((alt) => `  • ${alt.label.padEnd(28)} : ${alt.confidence}% confidence`)
        .join('\n')
    : '  None identified'
}

${subSep}
4. SOURCE IMAGE METADATA
${subSep}
File Name          : ${imageMeta.name}
Dimensions         : ${imageMeta.width} x ${imageMeta.height} px
Aspect Ratio       : ${imageMeta.aspectRatio}
File Size          : ${imageMeta.sizeFormatted}
MIME Type          : ${imageMeta.type}

${sep}
CONFIDENTIALITY & ETHICS NOTICE:
PixelVision AI predictions are probabilistic algorithmic classifications.
Confidence scores represent neural model certainty based on visible pixels.
${sep}`;
}

export function copyResultToClipboard(
  result: ClassificationResult,
  imageMeta: ImageMetadata
): string {
  return `PixelVision AI Analysis:
• Subject: ${result.primaryLabel} (${result.confidence}% confidence)
• Category: ${result.category}
• Mode: ${result.classificationMode}
• Status: ${result.isUncertain ? 'Uncertain' : 'Confident'}
• Evidence: ${result.visualEvidence.join('; ')}
• Image: ${imageMeta.name} (${imageMeta.width}x${imageMeta.height}px)`;
}
