import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  RotateCcw,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import {
  AppTab,
  ClassificationModeId,
  ClassificationResult,
  HistoryItem,
  ImageMetadata,
} from './types/index';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { ImagePreview } from './components/ImagePreview';
import { PixelAnalysisAnimation } from './components/PixelAnalysisAnimation';
import { ResultCard } from './components/ResultCard';
import { CameraCapture } from './components/CameraCapture';
import { SampleImagesModal } from './components/SampleImagesModal';
import { HistoryPanel } from './components/HistoryPanel';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { AboutSection } from './components/AboutSection';
import { Toast, ToastMessage } from './components/Toast';
import {
  getHistory,
  saveToHistory,
  deleteHistoryItem,
  clearAllHistory,
  calculateStats,
} from './utils/historyStorage';
import { SampleImage } from './utils/sampleImages';
import { validateAndInspectImage, formatBytes, prepareImageForAnalysis } from './utils/imageUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [currentImage, setCurrentImage] = useState<ImageMetadata | null>(null);
  const [selectedMode, setSelectedMode] = useState<ClassificationModeId>('general');
  const [qualityWarning, setQualityWarning] = useState<string | undefined>();

  // Analysis workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<ClassificationResult | null>(null);
  const [analysisError, setAnalysisError] = useState<{
    userMessage: string;
    errorType: string;
    technicalDetails?: string;
  } | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Modals & notifications
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Request lock to prevent duplicate concurrent calls from double taps or repeated clicks
  const isRequestLockedRef = useRef(false);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // History & stats
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const stats = calculateStats(historyItems);

  const showToast = (t: { title: string; message?: string; type: 'success' | 'error' | 'info' }) => {
    setToast({
      id: Math.random().toString(),
      ...t,
    });
  };

  const handleImageSelected = (meta: ImageMetadata, warning?: string) => {
    setCurrentImage(meta);
    setQualityWarning(warning);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setIsRetrying(false);
    setApiDone(false);
    isRequestLockedRef.current = false;
  };

  const handleSampleSelected = (sample: SampleImage, meta: ImageMetadata) => {
    setCurrentImage(meta);
    setSelectedMode(sample.suggestedMode);
    setQualityWarning(undefined);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setIsRetrying(false);
    setApiDone(false);
    isRequestLockedRef.current = false;
    showToast({
      type: 'info',
      title: `Sample Loaded: ${sample.title}`,
      message: `Suggested Mode: ${sample.suggestedMode.toUpperCase()}`,
    });
  };

  const handleCameraPhoto = (meta: ImageMetadata) => {
    setIsCameraOpen(false);
    setCurrentImage(meta);
    setQualityWarning(undefined);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setIsRetrying(false);
    setApiDone(false);
    isRequestLockedRef.current = false;
    showToast({
      type: 'success',
      title: 'Photo Captured',
      message: 'Image is staged for AI analysis.',
    });
  };

  const handleStartAnalysis = async () => {
    // Step 2: Guarantee that ONE click on "Analyze Image" produces only ONE active analysis request
    if (!currentImage || isAnalyzing || isRequestLockedRef.current) {
      return;
    }

    isRequestLockedRef.current = true;
    setIsAnalyzing(true);
    setApiDone(false);
    setIsRetrying(false);
    setRetryAttempt(1);
    setAnalysisError(null);
    setAnalysisResult(null);
    setShowTechnicalDetails(false);

    // Schedule progressive retry awareness if request takes longer (due to backoff delays)
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      setIsRetrying(true);
      setRetryAttempt(2);
      retryTimerRef.current = setTimeout(() => {
        setRetryAttempt(3);
        retryTimerRef.current = setTimeout(() => {
          setRetryAttempt(4);
        }, 4000);
      }, 3000);
    }, 2500);

    try {
      // Step 8: Prepare and optimize image payload before sending
      const { dataUrl: payloadDataUrl, mimeType: payloadMime } = await prepareImageForAnalysis(
        currentImage.dataUrl,
        1600
      );

      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: payloadDataUrl,
          mimeType: payloadMime,
          mode: selectedMode,
          filename: currentImage.name,
        }),
      });

      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      const data = await response.json();

      if (!response.ok) {
        setAnalysisError({
          userMessage: data.error || 'AI analysis could not be completed. Please try again.',
          errorType: data.errorType || (response.status === 429 ? 'RATE_LIMIT' : 'SERVER_ERROR'),
          technicalDetails: data.technicalDetails || `HTTP ${response.status}: ${response.statusText}`,
        });
        setIsAnalyzing(false);
        setIsRetrying(false);
        setApiDone(false);
        isRequestLockedRef.current = false;
        return;
      }

      setAnalysisResult(data);
      setApiDone(true);
      setIsRetrying(false);

      // Persist to local history
      const updatedHistory = await saveToHistory(data, currentImage);
      setHistoryItems(updatedHistory);

      showToast({
        type: 'success',
        title: 'Analysis Complete',
        message: `Identified as "${data.primaryLabel}" (${data.confidence}% confidence)`,
      });
    } catch (err: any) {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      console.error('Classification request failed:', err);
      setIsAnalyzing(false);
      setIsRetrying(false);
      setApiDone(false);
      isRequestLockedRef.current = false;

      setAnalysisError({
        userMessage: 'Unable to connect to the AI service.',
        errorType: 'NETWORK_ERROR',
        technicalDetails: err?.message || 'Network fetch connection error.',
      });

      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to the AI service. Please check your network.',
      });
    } finally {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      isRequestLockedRef.current = false;
    }
  };

  const handleAnimationComplete = () => {
    setIsAnalyzing(false);
    setIsRetrying(false);
    isRequestLockedRef.current = false;
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) return;

        const check = await validateAndInspectImage(file, dataUrl);
        if (!check.isValid) {
          showToast({
            type: 'error',
            title: 'Invalid Image',
            message: check.errorMessage,
          });
          return;
        }

        const meta: ImageMetadata = {
          name: file.name,
          sizeFormatted: formatBytes(file.size),
          sizeBytes: file.size,
          type: file.type || 'image/jpeg',
          width: check.width,
          height: check.height,
          aspectRatio: check.aspectRatio,
          dataUrl: dataUrl,
        };

        handleImageSelected(meta, check.hasQualityWarning ? check.qualityWarningMessage : undefined);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setCurrentImage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setApiDone(false);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    const meta: ImageMetadata = {
      name: item.imageName,
      sizeFormatted: item.fileSize,
      sizeBytes: 0,
      type: 'image/jpeg',
      width: item.imageWidth,
      height: item.imageHeight,
      aspectRatio: `${item.imageWidth}:${item.imageHeight}`,
      dataUrl: item.thumbnailDataUrl,
    };

    setCurrentImage(meta);
    setAnalysisResult(item.result);
    setSelectedMode(item.mode);
    setIsAnalyzing(false);
    setApiDone(true);
    setActiveTab('dashboard');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    showToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Analysis record was deleted from local history.',
    });
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistoryItems([]);
    showToast({
      type: 'info',
      title: 'History Cleared',
      message: 'All local records and statistics have been reset.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050914] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background visual glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Hero Section (Visible when no image is staged or when starting fresh) */}
            {!currentImage && !isAnalyzing && (
              <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-6 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a152e] border border-cyan-500/25 text-xs font-mono text-cyan-300 shadow-lg shadow-cyan-500/10">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Next-Generation Neural Vision</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
                  See Beyond the{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Pixels.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Upload an image and let AI analyze, classify, and explain what it sees.
                  Featuring uncertainty detection and grounded visual evidence.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      input?.click();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-xl shadow-blue-600/25 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Analyze Image</span>
                    <ArrowRight className="w-4 h-4 text-cyan-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-[#091126] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white cursor-pointer transition-all"
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>View History ({historyItems.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner if analysis failed */}
            {analysisError && (
              <div className="p-5 rounded-2xl bg-[#140b17] border border-rose-500/40 shadow-xl space-y-3 text-xs text-rose-200 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">
                        {analysisError.userMessage}
                      </span>
                      <p className="text-slate-300">
                        {analysisError.errorType === 'AUTH_MISSING' || analysisError.errorType === 'AUTH_ERROR'
                          ? 'Please verify your API key in the environment secrets panel.'
                          : analysisError.errorType === 'RATE_LIMIT'
                          ? 'Please wait a moment and try again.'
                          : 'The image analysis request could not be completed.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer transition-all shrink-0 active:scale-95"
                  >
                    Try Again
                  </button>
                </div>

                {/* Expandable Technical Details Section */}
                {analysisError.technicalDetails && (
                  <div className="pt-2 border-t border-rose-500/20">
                    <button
                      type="button"
                      onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-rose-300 hover:text-white cursor-pointer transition-colors"
                    >
                      <span>Technical details ({analysisError.errorType})</span>
                      <span>{showTechnicalDetails ? '▲' : '▼'}</span>
                    </button>
                    {showTechnicalDetails && (
                      <div className="mt-2 p-3 rounded-xl bg-[#09050d] border border-rose-950 font-mono text-[11px] text-slate-300 break-all leading-relaxed">
                        <span className="text-rose-400 font-bold block mb-1">
                          Status Code / Type: {analysisError.errorType}
                        </span>
                        {analysisError.technicalDetails}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stage 1: Upload Zone */}
            {!currentImage && !isAnalyzing && (
              <UploadZone
                onImageSelected={handleImageSelected}
                onOpenSamples={() => setIsSampleModalOpen(true)}
                onOpenCamera={() => setIsCameraOpen(true)}
              />
            )}

            {/* Stage 2: Staged Image Preview & Mode Selector */}
            {currentImage && !isAnalyzing && !analysisResult && (
              <ImagePreview
                imageMeta={currentImage}
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                qualityWarning={qualityWarning}
                onStartAnalysis={handleStartAnalysis}
                onReplaceImage={handleReplaceImage}
                onRemoveImage={handleRemoveImage}
                isAnalyzing={isAnalyzing}
              />
            )}

            {/* Stage 3: Cinematic Pixel Analysis Animation during AI call */}
            {isAnalyzing && currentImage && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Mathematical Pixel Matrix Analysis
                  </span>
                  <h2 className="text-2xl font-bold text-white">
                    {isRetrying
                      ? 'AI service is temporarily busy...'
                      : 'PixelVision is examining the visual patterns...'}
                  </h2>
                </div>

                <PixelAnalysisAnimation
                  imageSrc={currentImage.dataUrl}
                  isComplete={apiDone}
                  isRetrying={isRetrying}
                  retryAttempt={retryAttempt}
                  onAnimationComplete={handleAnimationComplete}
                />
              </div>
            )}

            {/* Stage 4: Result Screen */}
            {analysisResult && currentImage && !isAnalyzing && (
              <ResultCard
                result={analysisResult}
                imageMeta={currentImage}
                onAnalyzeAnother={handleRemoveImage}
                onShowToast={showToast}
              />
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <HistoryPanel
            historyItems={historyItems}
            onSelectHistoryItem={handleSelectHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
            onStartNewAnalysis={() => {
              handleRemoveImage();
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <StatisticsDashboard
            stats={stats}
            onStartAnalysis={() => {
              handleRemoveImage();
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* About AI Tab */}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Live Camera Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handleCameraPhoto}
      />

      {/* Curated Sample Images Modal */}
      <SampleImagesModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSampleSelected}
      />
    </div>
  );
}
