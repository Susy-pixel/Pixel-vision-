import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-[#081717]/95 shadow-emerald-500/10',
    error: 'border-rose-500/30 bg-[#1a0b12]/95 shadow-rose-500/10',
    info: 'border-cyan-500/30 bg-[#081224]/95 shadow-cyan-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-subtle">
      <div
        className={`flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 pr-2">
          <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
