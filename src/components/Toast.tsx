import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
      <div
        className={`pointer-events-auto rounded-2xl shadow-xl p-4 border transition-all transform duration-300 ease-out flex items-start gap-3.5 ${
          isSuccess
            ? 'bg-emerald-950 text-white border-emerald-700/80 shadow-emerald-950/30'
            : isError
            ? 'bg-rose-950 text-white border-rose-700/80 shadow-rose-950/30'
            : 'bg-slate-900 text-white border-slate-700/80 shadow-slate-950/30'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-300'
              : isError
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-slate-500/20 text-slate-300'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Info className="w-5 h-5 text-slate-300" />
          )}
        </div>

        <div className="flex-1 pt-0.5 min-w-0">
          <h4 className="text-sm font-bold tracking-tight text-white">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
