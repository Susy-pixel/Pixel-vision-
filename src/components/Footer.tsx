import React from 'react';
import { Eye, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-blue-900/30 bg-[#040714] py-8 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200 tracking-wide">
            PixelVision AI <span className="text-slate-600 font-normal">•</span> Intelligent Image Classification
          </span>
        </div>

        {/* Engine metadata */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Powered by Gemini 3.8 Flash Vision</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Uncertainty Guardrails Active</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
