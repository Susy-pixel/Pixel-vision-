import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 25MB limit
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    primaryLabel: {
      type: Type.STRING,
      description:
        'The exact, precise classification label (e.g. "Bengal Tiger", "Margherita Pizza", "Vintage Chronograph Watch", "Monstera Deliciosa", "Sports Coupe"). Never force a tiger to "cat" or a car to "bus". If unsupported or uncertain, state clearly.',
    },
    confidence: {
      type: Type.NUMBER,
      description:
        'Confidence percentage between 0 and 100 based on visible evidence. Never claim 100. If ambiguous or low quality, must be below 50.',
    },
    category: {
      type: Type.STRING,
      description:
        'Broad category classification (e.g. "Mammal / Felidae", "Italian Cuisine", "Timepieces", "Tropical Houseplant", "Automotive").',
    },
    isSupported: {
      type: Type.BOOLEAN,
      description:
        'True if the main subject belongs to the user-selected classification mode; False if the image is outside the chosen mode (e.g. car in Animal mode).',
    },
    isUncertain: {
      type: Type.BOOLEAN,
      description:
        'True if visual evidence is too low, blurry, obstructed, or ambiguous to make a reliable prediction.',
    },
    uncertaintyReason: {
      type: Type.STRING,
      description:
        'Detailed explanation if isUncertain or isSupported is false; otherwise an empty string or brief observation.',
    },
    description: {
      type: Type.STRING,
      description:
        'Clear, concise rationale explaining why this classification was determined, citing specific visible characteristics.',
    },
    visualEvidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        '2 to 4 concrete, factual visual attributes directly observable in the image (e.g., striped fur pattern, dual exhaust, bezel markers, serrated leaf margins).',
    },
    hasMultipleObjects: {
      type: Type.BOOLEAN,
      description:
        'True if multiple prominent, distinct subjects or objects are present in the frame.',
    },
    detectedObjects: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'List of secondary recognizable subjects if multiple objects are detected (e.g. ["Domestic Dog (Foreground)", "Bicycle (Background)", "Park Bench"]).',
    },
    alternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ['label', 'confidence'],
      },
      description:
        '1 to 3 plausible alternative candidate classifications with realistic confidence percentages.',
    },
  },
  required: [
    'primaryLabel',
    'confidence',
    'category',
    'isSupported',
    'isUncertain',
    'description',
    'visualEvidence',
    'hasMultipleObjects',
    'alternatives',
  ],
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  general: 'General Object Recognition (Broad multi-domain classification across all standard real-world entities).',
  animals: 'Animals Only (Mammals, birds, reptiles, fish, amphibians, insects, marine life). If the image is not an animal (e.g. vehicle, food, landscape), mark isSupported = false.',
  food: 'Food & Culinary Items Only (Prepared dishes, fruits, vegetables, baked goods, beverages). If the image is not food, mark isSupported = false.',
  vehicles: 'Vehicles Only (Automobiles, motorcycles, bicycles, aircraft, watercraft, trains). If the image is not a vehicle, mark isSupported = false.',
  plants: 'Plants & Flora Only (Trees, flowers, shrubs, indoor houseplants, fungi, foliage). If the image is not botanical/fungal, mark isSupported = false.',
  everyday: 'Everyday Household Objects & Tools (Furniture, electronics, kitchenware, personal accessories, stationery). If the image is not an everyday physical object, mark isSupported = false.',
};

// Error categorization helper adhering strictly to STEP 5
function categorizeApiError(err: any): {
  errorType: 'AUTH_MISSING' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'BAD_REQUEST' | 'SERVER_UNAVAILABLE' | 'NETWORK_ERROR' | 'UNKNOWN';
  userMessage: string;
  statusCode: number;
  technicalDetails: string;
} {
  const msg = (err?.message || '').toLowerCase();
  const rawStatus = err?.status || err?.code || 500;
  const statusNum = typeof rawStatus === 'number' ? rawStatus : parseInt(rawStatus, 10) || 500;

  // 1. Missing or unconfigured API key
  if (!apiKey || msg.includes('api key not found') || msg.includes('api_key_missing')) {
    return {
      errorType: 'AUTH_MISSING',
      userMessage: 'AI configuration is incomplete. Please configure the Gemini API key.',
      statusCode: 401,
      technicalDetails: 'GEMINI_API_KEY environment variable is not defined or is empty in the project environment.',
    };
  }

  // 2. Authentication or Authorization invalid (401 / 403)
  if (statusNum === 401 || statusNum === 403 || msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('permission_denied')) {
    return {
      errorType: 'AUTH_ERROR',
      userMessage: 'AI authorization is not configured correctly.',
      statusCode: statusNum === 401 ? 401 : 403,
      technicalDetails: `HTTP ${statusNum}: ${err?.message || 'Invalid or unauthorized API key provided to Gemini service.'}`,
    };
  }

  // 3. 429 / RESOURCE_EXHAUSTED
  if (statusNum === 429 || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
    const isQuotaExhausted = msg.includes('quota') || msg.includes('exceeded your current quota');
    return {
      errorType: 'RATE_LIMIT',
      userMessage: isQuotaExhausted
        ? 'Gemini API quota is currently unavailable for this project.'
        : 'AI service is temporarily busy. Please try again later.',
      statusCode: 429,
      technicalDetails: `HTTP 429 RESOURCE_EXHAUSTED: ${err?.message || 'Rate limit or free-tier quota ceiling reached.'}`,
    };
  }

  // 4. 400 Bad Request
  if (statusNum === 400 || msg.includes('invalid_argument') || msg.includes('bad request') || msg.includes('unable to process input image')) {
    return {
      errorType: 'BAD_REQUEST',
      userMessage: 'The image request could not be processed.',
      statusCode: 400,
      technicalDetails: `HTTP 400 INVALID_ARGUMENT: ${err?.message || 'Malformed image format, corrupted payload, or unsupported image dimensions.'}`,
    };
  }

  // 5. 5xx Server Error / Temporary Unavailable
  if (statusNum >= 500 && statusNum < 600) {
    return {
      errorType: 'SERVER_UNAVAILABLE',
      userMessage: 'AI service is temporarily unavailable.',
      statusCode: statusNum,
      technicalDetails: `HTTP ${statusNum}: ${err?.message || 'Google AI model capacity or backend server error.'}`,
    };
  }

  // 6. Network socket disconnects / timeouts
  if (msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('fetch failed') || msg.includes('network')) {
    return {
      errorType: 'NETWORK_ERROR',
      userMessage: 'Unable to connect to the AI service.',
      statusCode: 503,
      technicalDetails: `NETWORK_ERROR: ${err?.message || 'Connection closed, socket timeout, or unreachable endpoint.'}`,
    };
  }

  // 7. Unknown / Fallback
  return {
    errorType: 'UNKNOWN',
    userMessage: 'Something went wrong during analysis.',
    statusCode: 500,
    technicalDetails: `UNKNOWN_ERROR: ${err?.message || 'Unexpected exception during model inference.'}`,
  };
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'PixelVision AI Classification Engine',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Image Classification endpoint
app.post('/api/classify', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    const { imageBase64, mimeType = 'image/jpeg', mode = 'general' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({
        error: 'The image request could not be processed.',
        errorType: 'BAD_REQUEST',
        technicalDetails: 'Missing or empty imageBase64 payload in request body.',
      });
      return;
    }

    // Step 4: Strict API Key check
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(401).json({
        error: 'AI configuration is incomplete. Please configure the Gemini API key.',
        errorType: 'AUTH_MISSING',
        technicalDetails: 'GEMINI_API_KEY environment secret is not configured.',
      });
      return;
    }

    // Step 8: Clean base64 payload & ensure valid raster MIME type
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    let safeMimeType = (mimeType || 'image/jpeg').toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(safeMimeType)) {
      safeMimeType = 'image/jpeg';
    }

    const modePrompt = MODE_DESCRIPTIONS[mode] || MODE_DESCRIPTIONS.general;

    const systemInstruction = `You are PixelVision AI, a state-of-the-art computer vision and visual feature classification system.
Your mission is to perform rigorous, honest, and highly accurate image classification.

CRITICAL RULES & SAFETY SAFEGUARDS:
1. SPECIFICITY OVER GENERIC LABELS:
   - If the subject is a Tiger, classify it as "Tiger" (e.g., "Bengal Tiger" or "Panthera tigris"), NEVER degrade it to "Cat".
   - If the subject is a Golden Retriever, identify it specifically, not just "Animal".
   - If the subject is an Electric Sports Coupe, classify accurately rather than just "Car".
   - Do NOT convert: Tiger -> Cat, Lion -> Dog, Car -> Bus, Apple -> Orange.

2. CLASSIFICATION MODE COMPLIANCE:
   - The user has selected the Mode: "${mode.toUpperCase()}": ${modePrompt}
   - If the image contains a subject completely outside this mode (for example: user selected Animals, but the image is a sports car, or user selected Food, but the image is a shoe):
     - Set "isSupported" = false.
     - Set "primaryLabel" = "Unsupported Subject (" + actual recognized category + ")".
     - Set "uncertaintyReason" = "This image does not belong to the selected classification mode (${mode}). Please switch mode or upload an image matching ${mode}."
     - Still provide accurate visual evidence of what is actually seen.

3. UNCERTAINTY & LOW CONFIDENCE SAFEGUARD:
   - Never force a prediction when evidence is insufficient.
   - If the image is blurry, heavily degraded, poorly lit, ambiguous, or lacks distinct visual features:
     - Set "isUncertain" = true.
     - Set "confidence" to a realistic low score (< 50).
     - Set "primaryLabel" = "Unable to classify with sufficient confidence".
     - Set "description" = "The image does not provide enough reliable visual evidence for a confident classification."
     - Set "uncertaintyReason" = "Visual features are obstructed, blurry, or insufficient for definitive recognition."

4. MULTIPLE OBJECTS DETECTION:
   - If multiple major entities or subjects exist in the image (e.g. a dog sitting beside a bicycle and a person):
     - Set "hasMultipleObjects" = true.
     - Classify the most prominent focal subject in "primaryLabel".
     - List the other identified items in "detectedObjects".

5. CONFIDENCE CALIBRATION:
   - Never claim 100% confidence. Probabilistic computer vision models are never 100% infallible.
   - Clear, well-lit single subject: typically 85% to 97%.
   - Challenging, partially obscured, or stylized subject: 55% to 80%.
   - Ambiguous / low evidence: < 50%.
   - Ensure "alternatives" contain realistic, logically related options with sensible secondary confidence scores.

6. VISUAL EVIDENCE:
   - Provide 2 to 4 crisp, factual, observable bullet points directly visible in the image.
   - Never fabricate details not visibly discernible.`;

    const promptText = `Perform deep visual feature analysis and image classification for this image.
Requested Mode: ${mode} (${modePrompt})
Analyze all geometric patterns, textures, colors, anatomical or mechanical structures, and prominent subjects.
Return your classification in the specified structured JSON format.`;

    // Step 3: Supported vision model selection.
    // gemini-3.5-flash-lite is active and supported with available quota, backed by gemini-flash-lite-latest and gemini-3.8-flash.
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];

    let response: any;
    let lastError: any;

    // Step 6: Rate limit retry rules
    // Only retry genuine temporary 429 errors or transient 503 unavailable
    // Maximum 3 retries with exponential backoff: ~2s, ~4s, ~8s
    const RETRY_DELAYS = [2000, 4000, 8000];
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // Rotate candidate models across attempts if needed
      const modelToTry = candidateModels[Math.min(attempt, candidateModels.length - 1)];

      try {
        response = await ai.models.generateContent({
          model: modelToTry,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: safeMimeType,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.1,
          },
        });

        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        const categorized = categorizeApiError(err);
        console.warn(
          `[PixelVision AI] Model "${modelToTry}" attempt ${attempt + 1} failed: [${categorized.errorType}] ${err?.message?.slice(0, 120)}`
        );

        // DO NOT retry 401, 403, 400, invalid API key, malformed request
        const isRetryable =
          categorized.errorType === 'RATE_LIMIT' ||
          categorized.errorType === 'SERVER_UNAVAILABLE' ||
          categorized.errorType === 'NETWORK_ERROR';

        if (!isRetryable || attempt >= MAX_RETRIES) {
          // Break immediately on permanent errors or when retry ceiling reached
          break;
        }

        // Exponential backoff wait: 2s, 4s, 8s (with ±15% jitter)
        const baseDelay = RETRY_DELAYS[attempt] || 4000;
        const jitter = (Math.random() * 0.3 - 0.15) * baseDelay;
        const waitMs = Math.round(baseDelay + jitter);

        console.log(`[PixelVision AI] Retrying in ${waitMs}ms (attempt ${attempt + 2}/${MAX_RETRIES + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('No content returned from AI vision model');
    }

    const rawText = response.text.trim();
    const parsedResult = JSON.parse(rawText);
    const processingTimeMs = Date.now() - startTime;

    // Normalize confidence percentage to 0 - 100 if model returned decimal (e.g. 0.95 -> 95)
    let normalizedConfidence = Number(parsedResult.confidence) || 0;
    if (normalizedConfidence > 0 && normalizedConfidence <= 1.0) {
      normalizedConfidence = Math.round(normalizedConfidence * 100);
    } else {
      normalizedConfidence = Math.min(99, Math.max(1, Math.round(normalizedConfidence)));
    }

    // Normalize alternative confidences
    const normalizedAlternatives = Array.isArray(parsedResult.alternatives)
      ? parsedResult.alternatives.map((alt: any) => {
          let c = Number(alt.confidence) || 0;
          if (c > 0 && c <= 1.0) c = Math.round(c * 100);
          return {
            label: String(alt.label || 'Alternative'),
            confidence: Math.min(99, Math.max(1, Math.round(c))),
          };
        })
      : [];

    res.json({
      ...parsedResult,
      confidence: normalizedConfidence,
      alternatives: normalizedAlternatives,
      classificationMode: mode,
      processingTimeMs,
      timestamp: Date.now(),
      modelName: 'gemini-3.5-flash-lite',
    });
  } catch (error: any) {
    const processingTimeMs = Date.now() - startTime;
    const categorized = categorizeApiError(error);

    console.error(`[PixelVision AI] Classification failed [${categorized.errorType}]:`, categorized.technicalDetails);

    res.status(categorized.statusCode).json({
      error: categorized.userMessage,
      errorType: categorized.errorType,
      technicalDetails: categorized.technicalDetails,
      processingTimeMs,
      timestamp: Date.now(),
    });
  }
});

// Full-stack Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PixelVision AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PixelVision AI] Server startup failed:', err);
  process.exit(1);
});
