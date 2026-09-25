import { ClassificationResult, ClassificationStats, HistoryItem, ImageMetadata } from '../types/index';
import { createThumbnail } from './imageUtils';

const STORAGE_KEY = 'pixelvision_analysis_history_v1';
const MAX_HISTORY_ITEMS = 50;

export async function saveToHistory(
  result: ClassificationResult,
  imageMeta: ImageMetadata
): Promise<HistoryItem[]> {
  try {
    const thumbnail = await createThumbnail(imageMeta.dataUrl, 160);

    const newItem: HistoryItem = {
      id: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: result.timestamp || Date.now(),
      imageName: imageMeta.name,
      thumbnailDataUrl: thumbnail,
      imageWidth: imageMeta.width,
      imageHeight: imageMeta.height,
      fileSize: imageMeta.sizeFormatted,
      mode: result.classificationMode,
      result: result,
    };

    const existing = getHistory();
    // Keep max items to protect localStorage capacity
    const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (quotaError) {
      // Storage quota exceeded: trim to 20 most recent
      console.warn('LocalStorage quota warning. Trimming older history items.', quotaError);
      const trimmed = updated.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return trimmed;
    }

    return updated;
  } catch (error) {
    console.error('Failed to save analysis to history:', error);
    return getHistory();
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse history from localStorage:', err);
    return [];
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return getHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function calculateStats(items: HistoryItem[]): ClassificationStats {
  if (!items || items.length === 0) {
    return {
      totalAnalyzed: 0,
      successfulCount: 0,
      uncertainCount: 0,
      averageConfidence: 0,
      averageProcessingTimeMs: 0,
      categoryDistribution: [],
      modeDistribution: [],
    };
  }

  const totalAnalyzed = items.length;
  let successfulCount = 0;
  let uncertainCount = 0;
  let totalConfidence = 0;
  let totalProcessingTime = 0;

  const categoryCounts: Record<string, number> = {};
  const modeCounts: Record<string, number> = {};

  for (const item of items) {
    const res = item.result;

    if (res.isUncertain || !res.isSupported) {
      uncertainCount++;
    } else {
      successfulCount++;
    }

    totalConfidence += Number(res.confidence) || 0;
    totalProcessingTime += Number(res.processingTimeMs) || 0;

    // Categories
    const cat = res.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Modes
    const m = res.classificationMode || 'general';
    modeCounts[m] = (modeCounts[m] || 0) + 1;
  }

  const averageConfidence = Math.round(totalConfidence / totalAnalyzed);
  const averageProcessingTimeMs = Math.round(totalProcessingTime / totalAnalyzed);

  const categoryDistribution = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalAnalyzed) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const modeDistribution = Object.entries(modeCounts).map(([mode, count]) => ({
    mode: mode as any,
    count,
  }));

  return {
    totalAnalyzed,
    successfulCount,
    uncertainCount,
    averageConfidence,
    averageProcessingTimeMs,
    categoryDistribution,
    modeDistribution,
  };
}
