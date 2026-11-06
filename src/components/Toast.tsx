import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Radio,
  Terminal,
} from 'lucide-react';

export interface ToastData {
  id?: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  code?: string; // HUD Telemetry tag, e.g. "[SYS_OK]", "[VOTE_RECORDED]"
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

// Gentle Web Audio API synthesizer for HUD feedback (non-intrusive)
function playHudSound(type: 'success' | 'info' | 'error' | 'warning') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.025, now);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(493.88, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 300);
  } catch {
    // Audio context may be restricted by autoplay policy; fail gracefully
  }
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    // Trigger subtle HUD sound effect
    playHudSound(toast.type);

    const duration = toast.duration || 4000;
    const intervalTime = 30;
    const decrement = (intervalTime / duration) * 100;

    setProgress(100);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    const timeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  // HUD Theme styling variables
  const theme = isSuccess
    ? {
        border: 'border-emerald-500/50',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.35)]',
        accentBg: 'bg-emerald-500/10',
        ledPing: 'bg-emerald-400',
        ledDot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
        tagText: 'text-emerald-400',
        laserBar: 'from-emerald-500 via-teal-400 to-emerald-300',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        defaultCode: '[SYS_OK // SYNC_SUCCESS]',
      }
    : isError
    ? {
        border: 'border-rose-500/60',
        glow: 'shadow-[0_0_30px_rgba(244,63,94,0.38)]',
        accentBg: 'bg-rose-500/10',
        ledPing: 'bg-rose-400',
        ledDot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
        tagText: 'text-rose-400',
        laserBar: 'from-rose-500 via-red-400 to-rose-300',
        icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
        defaultCode: '[ALERT_FAIL // REJECTED]',
      }
    : isWarning
    ? {
        border: 'border-amber-500/60',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.35)]',
        accentBg: 'bg-amber-500/10',
        ledPing: 'bg-amber-400',
        ledDot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
        tagText: 'text-amber-400',
        laserBar: 'from-amber-500 via-yellow-400 to-amber-300',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        defaultCode: '[WARN_ATTN // CHECK_REQ]',
      }
    : {
        border: 'border-cyan-400/50',
        glow: 'shadow-[0_0_30px_rgba(34,211,238,0.35)]',
        accentBg: 'bg-cyan-500/10',
        ledPing: 'bg-cyan-400',
        ledDot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
        tagText: 'text-cyan-400',
        laserBar: 'from-cyan-500 via-sky-400 to-cyan-300',
        icon: <Info className="w-5 h-5 text-cyan-400" />,
        defaultCode: '[SYS_INFO // LOG_EVENT]',
      };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 pointer-events-none transition-all duration-300"
    >
      <div
        className={`pointer-events-auto relative overflow-hidden rounded-xl bg-slate-950/85 backdrop-blur-xl border ${theme.border} ${theme.glow} transition-all duration-300 p-4 sm:p-4.5`}
      >
        {/* HUD Corner Tech Brackets */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white/40 pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white/40 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white/40 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white/40 pointer-events-none" />

        {/* Subtle HUD scanline background texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"
          aria-hidden="true"
        />

        {/* Top Header Row with Pulsing LED and Monospace HUD telemetry */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* LED Pulsing Indicator di Sudut */}
            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.ledPing}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${theme.ledDot}`}
              />
            </span>

            <span
              className={`font-mono text-[10px] tracking-widest uppercase font-semibold ${theme.tagText} flex items-center gap-1`}
            >
              <Terminal className="w-3 h-3 inline" />
              {toast.code || theme.defaultCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-slate-400 tracking-wider hidden sm:inline">
              HUD // PANRITAVOTE
            </span>
            <button
              onClick={onClose}
              aria-label="Tutup notifikasi"
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors hover:bg-white/10 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body Section with Icon, Title, and High-Precision Typography */}
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${theme.accentBg}`}
          >
            {theme.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{toast.title}</span>
            </h4>
            {toast.message && (
              <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
        </div>

        {/* HUD Laser Progress Countdown Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${theme.laserBar} transition-all duration-75 ease-linear shadow-[0_0_8px_currentColor]`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
