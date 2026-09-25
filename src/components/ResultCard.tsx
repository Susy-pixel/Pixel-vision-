import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Users,
  Eye,
  Bookmark,
} from 'lucide-react';
import { ClassificationResult, ImageMetadata } from '../types/index';
import { ConfidenceMeter } from './ConfidenceMeter';
import { AlternativePredictions } from './AlternativePredictions';
import { AIExplanation } from './AIExplanation';
import { ImageDetails } from './ImageDetails';
import { generateReportText, copyResultToClipboard } from '../utils/imageUtils';

interface ResultCardProps {
  result: ClassificationResult;
  imageMeta: ImageMetadata;
  onAnalyzeAnother: () => void;
  onShowToast: (toast: { title: string; message?: string; type: 'success' | 'error' | 'info' }) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  imageMeta,
  onAnalyzeAnother,
  onShowToast,
}) => {
  const handleCopy = () => {
    const text = copyResultToClipboard(result, imageMeta);
    navigator.clipboard.writeText(text).then(
      () => {
        onShowToast({
          type: 'success',
          title: 'Result Copied to Clipboard',
          message: 'Summary text is ready to paste anywhere.',
        });
      },
      () => {
        onShowToast({
          type: 'error',
          title: 'Copy Failed',
          message: 'Clipboard access was blocked.',
        });
      }
    );
  };

  const handleDownloadReport = () => {
    const reportText = generateReportText(result, imageMeta);
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeLabel = result.primaryLabel.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.href = url;
    link.download = `pixelvision_report_${safeLabel}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast({
      type: 'info',
      title: 'Report Downloaded',
      message: 'Full telemetry report saved as a text file.',
    });
  };

  const isUnsupported = !result.isSupported;
  const isUncertain = result.isUncertain || result.confidence < 50;

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#0c1836] via-[#09132d] to-[#0a1024] border border-blue-900/40 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#060c1d] rounded-[15px] flex items-center justify-center">
              {isUnsupported ? (
                <XCircle className="w-6 h-6 text-rose-400" />
              ) : isUncertain ? (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                AI Analysis Complete
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                Mode: {result.classificationMode.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isUnsupported
                ? 'Out-of-Scope Classification'
                : isUncertain
                ? 'Ambiguous Signal Detected'
                : 'Primary Object Identified'}
            </h2>
          </div>
        </div>

        {/* Action button: Analyze another image */}
        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white transition-all cursor-pointer shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Analyze Another Image</span>
        </button>
      </div>

      {/* Multiple Objects Detected Warning Banner */}
      {result.hasMultipleObjects && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5 text-xs text-indigo-200">
          <Users className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block mb-1 text-white">
              Multiple Major Subjects Detected
            </span>
            <p className="leading-relaxed">
              This scene contains more than one distinct focal entity. The primary subject is{' '}
              <strong className="text-cyan-300">"{result.primaryLabel}"</strong>.
              {result.detectedObjects && result.detectedObjects.length > 0 && (
                <span className="block mt-1 font-mono text-[11px] text-indigo-300">
                  Additional co-occurring entities: {result.detectedObjects.join(', ')}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Out of Mode / Unsupported Safeguard Banner */}
      {isUnsupported && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-4 text-xs text-rose-200">
          <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm text-white block">
              Unsupported in Current Mode
            </span>
            <p className="leading-relaxed">
              {result.uncertaintyReason ||
                `The detected subject does not belong to the selected "${result.classificationMode}" mode. In accordance with PixelVision accuracy safeguards, out-of-mode subjects are never forced into inaccurate classes.`}
            </p>
            <p className="font-medium text-rose-300/80 pt-1">
              Tip: Switch the classification mode to <strong>General Recognition</strong> or a mode matching the object, then re-analyze.
            </p>
          </div>
        </div>
      )}

      {/* Uncertainty Safeguard Banner */}
      {isUncertain && !isUnsupported && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-4 text-xs text-amber-200">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm text-white block">
              Unable to classify with sufficient confidence
            </span>
            <p className="leading-relaxed">
              {result.description ||
                'The image does not provide enough reliable visual evidence for a confident classification.'}
            </p>
            <p className="font-medium text-amber-300/80 pt-1">
              Tip: Ensure the subject is sharply focused, well-lit, unobstructed, and positioned near the center of the frame.
            </p>
          </div>
        </div>
      )}

      {/* Main Classification Spotlight Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1630] to-[#070e22] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient background accent light */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8">
          {/* Left Column: Image preview thumbnail + category badges */}
          <div className="w-full lg:w-5/12 flex flex-col items-center sm:items-start justify-between">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#040814] border border-slate-800 shadow-inner relative group">
              <img
                src={imageMeta.dataUrl}
                alt={imageMeta.name}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-[#050914]/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300">
                {imageMeta.name}
              </div>
            </div>

            <div className="w-full mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mode: <strong className="text-slate-200">{result.classificationMode}</strong></span>
              </span>
              <span>
                Taxonomy: <strong className="text-cyan-300">{result.category}</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Prediction Title, Confidence Meter, Core Metric */}
          <div className="w-full lg:w-7/12 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-xs font-mono font-semibold text-cyan-300">
                  {result.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {result.processingTimeMs}ms latency
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                {result.primaryLabel}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                {result.description}
              </p>
            </div>

            {/* Confidence Gauge & Progress Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#060c1d] border border-slate-800/80">
              <ConfidenceMeter
                confidence={result.confidence}
                isUncertain={isUncertain}
                size={140}
              />

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">PROBABILISTIC CERTAINTY</span>
                  <span className="font-bold text-white">{result.confidence}%</span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isUncertain
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, result.confidence))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">
                  Predictions represent empirical Bayesian posteriors derived from multi-scale
                  visual embeddings.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Result</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download Report</span>
              </button>

              <button
                type="button"
                onClick={onAnalyzeAnother}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Explanation & Visual Evidence */}
      <AIExplanation
        description={result.description}
        visualEvidence={result.visualEvidence}
        primaryLabel={result.primaryLabel}
      />

      {/* Alternative Predictions Component */}
      <AlternativePredictions
        alternatives={result.alternatives}
        primaryLabel={result.primaryLabel}
      />

      {/* Technical Image & Analysis Latency Details */}
      <ImageDetails imageMeta={imageMeta} result={result} />
    </div>
  );
};
