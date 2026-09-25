import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number; // 0 to 100
  isUncertain?: boolean;
  size?: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  isUncertain = false,
  size = 180,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, Math.round(confidence)));
    if (end === 0) {
      setAnimatedValue(0);
      return;
    }

    const duration = 1200; // ms
    const stepTime = 20; // ms
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [confidence]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  // Determine color scheme based on confidence
  let colorGradient = {
    start: '#06b6d4', // cyan-500
    end: '#3b82f6', // blue-500
    glow: 'rgba(6, 182, 212, 0.4)',
    text: 'text-cyan-400',
    label: 'High Certainty',
    icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
  };

  if (isUncertain || animatedValue < 50) {
    colorGradient = {
      start: '#f43f5e', // rose-500
      end: '#e11d48', // rose-600
      glow: 'rgba(244, 63, 94, 0.4)',
      text: 'text-rose-400',
      label: 'Uncertain Signal',
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
    };
  } else if (animatedValue < 80) {
    colorGradient = {
      start: '#f59e0b', // amber-500
      end: '#d97706', // amber-600
      glow: 'rgba(245, 158, 11, 0.4)',
      text: 'text-amber-400',
      label: 'Moderate Certainty',
      icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
    };
  }

  const gradientId = `confidence-grad-${Math.round(confidence)}`;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorGradient.start} />
              <stop offset="100%" stopColor={colorGradient.end} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={colorGradient.glow} />
            </filter>
          </defs>

          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-0.5">
            Confidence
          </span>
          <span className={`text-4xl font-black tracking-tight font-mono ${colorGradient.text}`}>
            {animatedValue}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
            {isUncertain ? 'Ambiguous' : 'Calibrated'}
          </span>
        </div>
      </div>

      {/* Qualitative Label Badge */}
      <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081226] border border-slate-800 text-xs font-semibold text-slate-200">
        {colorGradient.icon}
        <span>{colorGradient.label}</span>
      </div>
    </div>
  );
};
