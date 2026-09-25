export type ClassificationModeId =
  | 'general'
  | 'animals'
  | 'food'
  | 'vehicles'
  | 'plants'
  | 'everyday';

export interface ClassificationMode {
  id: ClassificationModeId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  exampleCategories: string[];
}

export interface AlternativePrediction {
  label: string;
  confidence: number;
}

export interface ClassificationResult {
  primaryLabel: string;
  confidence: number; // 0 to 100
  category: string;
  isSupported: boolean;
  isUncertain: boolean;
  uncertaintyReason?: string;
  description: string;
  visualEvidence: string[];
  hasMultipleObjects: boolean;
  detectedObjects?: string[];
  alternatives: AlternativePrediction[];
  classificationMode: ClassificationModeId;
  processingTimeMs: number;
  timestamp: number;
  modelName?: string;
}

export interface ImageMetadata {
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: string;
  dataUrl: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageName: string;
  thumbnailDataUrl: string;
  imageWidth: number;
  imageHeight: number;
  fileSize: string;
  mode: ClassificationModeId;
  result: ClassificationResult;
}

export interface ClassificationStats {
  totalAnalyzed: number;
  successfulCount: number;
  uncertainCount: number;
  averageConfidence: number;
  averageProcessingTimeMs: number;
  categoryDistribution: { name: string; count: number; percentage: number }[];
  modeDistribution: { mode: ClassificationModeId; count: number }[];
}

export type AppTab = 'dashboard' | 'history' | 'statistics' | 'about';
