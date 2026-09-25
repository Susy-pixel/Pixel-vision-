import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Timer,
  PieChart,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { ClassificationStats } from '../types/index';

interface StatisticsDashboardProps {
  stats: ClassificationStats;
  onStartAnalysis: () => void;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  stats,
  onStartAnalysis,
}) => {
  if (stats.totalAnalyzed === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#091126]/60 border border-slate-800/80 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white mb-1">No analysis data yet.</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Run image classifications to see real-time performance telemetry, accuracy distributions, and latency benchmarks calculated here.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartAnalysis}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-violet-500 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Analyze an Image</span>
        </button>
      </div>
    );
  }

  const successRate = Math.round(
    (stats.successfulCount / (stats.totalAnalyzed || 1)) * 100
  );

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-[#091126] border border-blue-900/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
            <div className="w-full h-full bg-[#070c1e] rounded-[11px] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Inference &amp; Performance Statistics
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated directly from your stored image classifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#060c1d] border border-slate-800 text-xs font-mono text-cyan-300">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Success Rate: {successRate}%</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Analyzed */}
        <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-950/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-semibold uppercase">Total Analyzed</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-white font-mono">{stats.totalAnalyzed}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Images Processed</span>
          </div>
        </div>

        {/* Confident Classifications */}
        <div className="p-4 rounded-2xl bg-[#070e22] border border-emerald-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-semibold uppercase">Confident</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-300 font-mono">
              {stats.successfulCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">High Certainty</span>
          </div>
        </div>

        {/* Uncertain Results */}
        <div className="p-4 rounded-2xl bg-[#070e22] border border-amber-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-semibold uppercase">Uncertain / Ambiguous</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-amber-300 font-mono">
              {stats.uncertainCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Safeguard Triggered</span>
          </div>
        </div>

        {/* Average Confidence */}
        <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-950/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-semibold uppercase">Avg Confidence</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-blue-300 font-mono">
              {stats.averageConfidence}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Posterior Mean</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-950/80 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-semibold uppercase">Avg Latency</span>
            <Timer className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-violet-300 font-mono">
              {stats.averageProcessingTimeMs}
              <span className="text-base text-slate-400 font-normal">ms</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Gemini 3.8 Inference</span>
          </div>
        </div>
      </div>

      {/* Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="p-6 rounded-3xl bg-[#091126] border border-blue-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Top Recognized Categories</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">By Frequency</span>
          </div>

          {stats.categoryDistribution.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No categories recorded yet.</p>
          ) : (
            <div className="space-y-3.5">
              {stats.categoryDistribution.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono text-slate-400">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mode Distribution */}
        <div className="p-6 rounded-3xl bg-[#091126] border border-blue-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Target Mode Usage</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Selected Modes</span>
          </div>

          {stats.modeDistribution.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No modes recorded yet.</p>
          ) : (
            <div className="space-y-3.5">
              {stats.modeDistribution.map((m, index) => {
                const pct = Math.round((m.count / stats.totalAnalyzed) * 100);
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 uppercase font-mono">
                        {m.mode}
                      </span>
                      <span className="font-mono text-slate-400">
                        {m.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
