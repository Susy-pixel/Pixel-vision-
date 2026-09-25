import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, CheckCircle, Eye, Search } from 'lucide-react';

interface AIExplanationProps {
  description: string;
  visualEvidence: string[];
  primaryLabel: string;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({
  description,
  visualEvidence,
  primaryLabel,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-[#091124]/70 border border-blue-900/30 overflow-hidden transition-all">
      {/* Header Accordion Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Why did AI classify this as "{primaryLabel}"?
            </h4>
            <p className="text-xs text-slate-400">
              Explainable neural feature rationale & visible evidence
            </p>
          </div>
        </div>

        <div className="p-1 rounded-lg bg-slate-800/50 text-slate-300">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60 animate-fadeIn">
          {/* Main narrative rationale */}
          <div className="p-4 rounded-xl bg-[#060c1d] border border-slate-800/80 text-sm text-slate-200 leading-relaxed">
            <p>{description}</p>
          </div>

          {/* Concrete Visual Evidence Points */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              <span>Visible Visual Evidence ({visualEvidence.length} Points)</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {visualEvidence.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#070e22] border border-blue-950 hover:border-cyan-500/30 transition-colors text-xs text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <span className="leading-relaxed flex-1">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
