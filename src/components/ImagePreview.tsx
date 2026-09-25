import React, { useRef } from 'react';
import { Play, RefreshCw, Trash2, AlertTriangle, Layers, Image as ImageIcon, Zap } from 'lucide-react';
import { ImageMetadata, ClassificationModeId } from '../types/index';
import { ClassificationModeSelector } from './ClassificationModeSelector';
import { ACCEPTED_IMAGE_TYPES } from '../utils/imageUtils';

interface ImagePreviewProps {
  imageMeta: ImageMetadata;
  selectedMode: ClassificationModeId;
  onSelectMode: (mode: ClassificationModeId) => void;
  qualityWarning?: string;
  onStartAnalysis: () => void;
  onReplaceImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  isAnalyzing: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageMeta,
  selectedMode,
  onSelectMode,
  qualityWarning,
  onStartAnalysis,
  onReplaceImage,
  onRemoveImage,
  isAnalyzing,
}) => {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full space-y-6">
      {/* Hidden file input for replace action */}
      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={onReplaceImage}
        className="hidden"
      />

      {/* Main Preview Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1630] to-[#070d1e] border border-blue-900/40 p-5 sm:p-7 shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          {/* Image Container with high-tech framing */}
          <div className="relative w-full lg:w-1/2 aspect-video sm:aspect-[4/3] max-h-[380px] rounded-2xl overflow-hidden bg-[#040813] border border-slate-800 flex items-center justify-center group shadow-inner">
            <img
              src={imageMeta.dataUrl}
              alt={imageMeta.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Corner Tech Reticles */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Bottom Status Overlay */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#040714]/80 backdrop-blur-md border border-slate-700/50 text-[11px] font-mono text-slate-300">
              <span className="truncate max-w-[200px]">{imageMeta.name}</span>
              <span className="text-cyan-400 font-semibold">{imageMeta.width} × {imageMeta.height} px</span>
            </div>
          </div>

          {/* Controls & Metadata Panel */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Image Staged For Analysis
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {imageMeta.aspectRatio}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2 truncate" title={imageMeta.name}>
                {imageMeta.name}
              </h2>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 mb-4">
                <div className="p-2.5 rounded-xl bg-[#081126] border border-blue-900/30">
                  <span className="text-[10px] text-slate-400 block mb-0.5">DIMENSIONS</span>
                  <span className="font-semibold text-slate-100">{imageMeta.width} × {imageMeta.height}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#081126] border border-blue-900/30">
                  <span className="text-[10px] text-slate-400 block mb-0.5">FILE SIZE</span>
                  <span className="font-semibold text-slate-100">{imageMeta.sizeFormatted}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#081126] border border-blue-900/30 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">FORMAT</span>
                  <span className="font-semibold text-cyan-300">{imageMeta.type.replace('image/', '').toUpperCase()}</span>
                </div>
              </div>

              {/* Quality Warning if applicable */}
              {qualityWarning && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Quality Advisory:</span>
                    <span className="text-amber-300/90">{qualityWarning}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onStartAnalysis}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/25 transition-all duration-300 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-cyan-300 fill-cyan-300/40" />
                    <span>Analyze Image with AI</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                </button>

                <button
                  type="button"
                  onClick={onRemoveImage}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-950/30 border border-rose-500/20 text-rose-300 hover:bg-rose-900/40 hover:text-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Classification Mode Selector integrated inside staging */}
        <div className="mt-7 pt-6 border-t border-blue-900/30">
          <ClassificationModeSelector
            selectedMode={selectedMode}
            onSelectMode={onSelectMode}
            disabled={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
};
