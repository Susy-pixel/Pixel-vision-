import React from 'react';
import { GitFork, Info } from 'lucide-react';
import { AlternativePrediction } from '../types/index';

interface AlternativePredictionsProps {
  alternatives: AlternativePrediction[];
  primaryLabel: string;
}

export const AlternativePredictions: React.FC<AlternativePredictionsProps> = ({
  alternatives,
  primaryLabel,
}) => {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  // Filter out any accidental duplicate of primary label
  const filtered = alternatives.filter(
    (alt) => alt.label.toLowerCase() !== primaryLabel.toLowerCase()
  );

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-[#091124]/70 border border-blue-900/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GitFork className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Other Candidate Possibilities
            </h4>
            <p className="text-[11px] text-slate-400">
              Alternative classifications considered by neural vision layers
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-md">
          {filtered.length} Candidate{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {filtered.map((alt, index) => {
          const confidence = Math.min(100, Math.max(0, Math.round(alt.confidence)));

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{alt.label}</span>
                <span className="font-mono font-bold text-cyan-300">{confidence}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>Alternative scores reflect conditional Bayesian posterior distribution.</span>
      </div>
    </div>
  );
};
