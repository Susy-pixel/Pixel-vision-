import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { HistoryItem, ClassificationResult, ImageMetadata } from '../types/index';

interface HistoryPanelProps {
  historyItems: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onStartNewAnalysis: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  historyItems,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
  onStartNewAnalysis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterMode, setSelectedFilterMode] = useState<string>('all');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Filter history
  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.result.primaryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode =
      selectedFilterMode === 'all' || item.mode === selectedFilterMode;

    return matchesSearch && matchesMode;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091126] border border-blue-900/40 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Classification History
            </h2>
            <p className="text-xs text-slate-400">
              Locally cached inference telemetry and predictions ({historyItems.length} records)
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      {historyItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-[#070e22] border border-slate-800/80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by label, image name, or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050914] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedFilterMode}
              onChange={(e) => setSelectedFilterMode(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#050914] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="general">General</option>
              <option value="animals">Animals</option>
              <option value="food">Food</option>
              <option value="vehicles">Vehicles</option>
              <option value="plants">Plants</option>
              <option value="everyday">Everyday Objects</option>
            </select>
          </div>
        </div>
      )}

      {/* History Items List */}
      {historyItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#091126]/60 border border-slate-800/80 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">No analysis data yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Upload an image or try a sample to see detailed neural classifications, confidence metrics, and visual explanations stored here.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-violet-500 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classify an Image Now</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#070e22] border border-slate-800 text-slate-400 text-xs">
          No history items match your search filter "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleString();
            const isUncertain = item.result.isUncertain || item.result.confidence < 50;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#070e22] border border-slate-800/90 hover:border-cyan-500/40 p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Thumbnail */}
                    <div
                      onClick={() => onSelectHistoryItem(item)}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-black/60 border border-slate-800 shrink-0 cursor-pointer group-hover:border-cyan-500/50 transition-colors"
                    >
                      <img
                        src={item.thumbnailDataUrl}
                        alt={item.imageName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/20 text-cyan-300 truncate">
                          {item.mode.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.result.processingTimeMs}ms
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectHistoryItem(item)}
                        className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate cursor-pointer"
                        title={item.result.primaryLabel}
                      >
                        {item.result.primaryLabel}
                      </h3>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.result.category}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {item.imageName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer status & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-xs ${
                        isUncertain ? 'text-amber-400' : 'text-cyan-400'
                      }`}
                    >
                      {item.result.confidence}%
                    </span>
                    <span className="text-[10px] text-slate-500">{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectHistoryItem(item)}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="View Analysis"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to Clear All History */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#091126] border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">Clear Entire History?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will delete all saved classification records and statistics from your browser's local storage. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClearOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
