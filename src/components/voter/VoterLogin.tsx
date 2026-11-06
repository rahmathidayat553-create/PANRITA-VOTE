import React, { useState } from 'react';
import { Pemilih } from '../../data/dummy';
import { KeyRound, ShieldAlert, ArrowLeft, CheckCircle2, User, Sparkles } from 'lucide-react';

interface VoterLoginProps {
  pemilihList: Pemilih[];
  onLoginSuccess: (voter: Pemilih) => void;
  onBack: () => void;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({
  pemilihList,
  onLoginSuccess,
  onBack,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      setErrorMessage('Harap masukkan kode pemilih yang Anda miliki.');
      return;
    }

    const matched = pemilihList.find(
      (p) => p.token.toUpperCase() === cleanToken
    );

    if (!matched) {
      setErrorMessage(
        'Kode pemilih tidak terdaftar dalam Daftar Pemilih Tetap (DPT). Mohon periksa kembali atau hubungi panitia pemilihan.'
      );
      return;
    }

    if (matched.status === 'sudah') {
      setErrorMessage(
        `Kode pemilih atas nama "${matched.nama}" (${matched.kelas}) sudah digunakan untuk mencoblos pada ${matched.waktuMemilih || 'sesi sebelumnya'}. Satu pemilih hanya dapat memberikan satu suara.`
      );
      return;
    }

    // Success!
    onLoginSuccess(matched);
  };

  const handleQuickFill = (token: string) => {
    setTokenInput(token);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 mx-auto">
            <KeyRound className="w-6 h-6 text-emerald-800" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Masuk Bilik Suara
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Masukkan kode pemilih resmi Anda untuk mengakses surat suara digital.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tokenInput"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Kode Pemilih (Token Siswa)
              </label>
              <input
                id="tokenInput"
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: VOTE-9A-003"
                className="w-full px-4 py-3 text-center text-lg font-mono font-bold tracking-wider rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400"
                autoComplete="off"
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              Verifikasi & Buka Surat Suara
            </button>
          </form>

          {/* Quick simulation helper for tester */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulasi Uji Coba Cepat:</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('VOTE-9A-003')}
                className="text-left px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-medium transition-colors flex items-center justify-between"
              >
                <span>Dimas Saputra (Belum Memilih)</span>
                <span className="font-mono font-bold text-emerald-700">VOTE-9A-003</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('VOTE-9A-001')}
                className="text-left px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-between"
              >
                <span>Ahmad Rizky (Sudah Memilih)</span>
                <span className="font-mono text-slate-500">VOTE-9A-001</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Kerahasiaan pilihan dijamin penuh oleh sistem PanritaVote OSIS.
        </div>
      </div>
    </div>
  );
};
