import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../utils/sampleImages';
import { ImageMetadata, ClassificationModeId } from '../types/index';
import { formatBytes } from '../utils/imageUtils';

interface SampleImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleImage, meta: ImageMetadata) => void;
}

export const SampleImagesModal: React.FC<SampleImagesModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  const handlePick = (sample: SampleImage) => {
    // Render the SVG into a high-resolution raster PNG canvas so Gemini Vision receives standard PNG bytes
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#050914';
        ctx.fillRect(0, 0, 800, 600);
        ctx.drawImage(img, 0, 0, 800, 600);
        const pngDataUrl = canvas.toDataURL('image/png');
        const byteLength = Math.round((pngDataUrl.length * 3) / 4);

        const metadata: ImageMetadata = {
          name: sample.fileName,
          sizeFormatted: formatBytes(byteLength),
          sizeBytes: byteLength,
          type: 'image/png',
          width: 800,
          height: 600,
          aspectRatio: '4:3',
          dataUrl: pngDataUrl,
        };

        onSelectSample(sample, metadata);
        onClose();
      }
    };

    img.onerror = () => {
      // Fallback
      const metadata: ImageMetadata = {
        name: sample.fileName,
        sizeFormatted: '184 KB',
        sizeBytes: 188416,
        type: 'image/png',
        width: 800,
        height: 600,
        aspectRatio: '4:3',
        dataUrl: sample.dataUrl,
      };
      onSelectSample(sample, metadata);
      onClose();
    };

    img.src = sample.dataUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040814]/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#091126] border border-blue-900/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
              <div className="w-full h-full bg-[#070c1e] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select a Curated Sample Image</h3>
              <p className="text-xs text-slate-400">
                Test multi-class accuracy, mode filtering, and multi-object scenarios with real AI analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handlePick(sample)}
              className="group relative rounded-2xl bg-[#060c1d] border border-slate-800 hover:border-cyan-500/50 p-3.5 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-0.5"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-slate-800/60 mb-3">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#050b1a]/85 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                    {sample.badge}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors mb-1 line-clamp-1">
                  {sample.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                  {sample.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-400">
                  Target: <strong className="text-slate-200">{sample.suggestedMode}</strong>
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                  Load &amp; Classify <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/40 bg-[#060c1d] flex items-center justify-between text-xs text-slate-400">
          <span>* Real Gemini 3.8 vision engine will process the selected sample</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
