import React from 'react';
import { FileText, Maximize2, Ratio, HardDrive, Timer, Cpu, Image as ImageIcon } from 'lucide-react';
import { ImageMetadata, ClassificationResult } from '../types/index';

interface ImageDetailsProps {
  imageMeta: ImageMetadata;
  result: ClassificationResult;
}

export const ImageDetails: React.FC<ImageDetailsProps> = ({ imageMeta, result }) => {
  const details = [
    {
      label: 'FILE NAME',
      value: imageMeta.name,
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
    },
    {
      label: 'RESOLUTION',
      value: `${imageMeta.width} × ${imageMeta.height} px`,
      icon: <Maximize2 className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'ASPECT RATIO',
      value: imageMeta.aspectRatio,
      icon: <Ratio className="w-4 h-4 text-violet-400" />,
    },
    {
      label: 'FILE SIZE',
      value: imageMeta.sizeFormatted,
      icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'ANALYSIS LATENCY',
      value: `${result.processingTimeMs} ms`,
      icon: <Timer className="w-4 h-4 text-amber-400" />,
    },
    {
      label: 'MIME FORMAT',
      value: imageMeta.type,
      icon: <ImageIcon className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div className="rounded-2xl bg-[#091124]/70 border border-blue-900/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-sm font-bold text-white tracking-wide">Image & Telemetry Details</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {details.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-[#060c1d] border border-slate-800/80 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5 text-slate-400 text-[10px] font-mono font-semibold tracking-wider">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <p className="text-xs font-semibold text-slate-100 truncate font-mono" title={item.value}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
