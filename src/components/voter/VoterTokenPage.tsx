import React, { useState, useRef, useEffect } from 'react';
import { Pemilih, Paslon, PengaturanPemilihan } from '../../data/dummy';
import { ToastData } from '../Toast';
import { SafeImage } from '../SafeImage';
import {
  Lock,
  Vote,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';

interface VoterTokenPageProps {
  pemilihList: Pemilih[];
  paslonList: Paslon[];
  pengaturan: PengaturanPemilihan;
  onVerifyToken: (voter: Pemilih) => void;
  onAdminTokenEntered: () => void;
  onShowToast?: (data: ToastData) => void;
}

export const VoterTokenPage: React.FC<VoterTokenPageProps> = ({
  pemilihList,
  paslonList,
  pengaturan,
  onVerifyToken,
  onAdminTokenEntered,
  onShowToast,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [verifiedVoter, setVerifiedVoter] = useState<Pemilih | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on load
    inputRef.current?.focus();
  }, []);

  const triggerError = (
    msg: string,
    code: string,
    type: 'warning' | 'error' | 'info' = 'error',
    duration = 4500
  ) => {
    setErrorMessage(msg);
    setIsShaking(true);

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 150]);
      }
    } catch {}

    onShowToast?.({
      type,
      title: type === 'warning' ? 'Perhatian' : 'Verifikasi Gagal',
      message: msg,
      code,
      duration,
    });

    setTimeout(() => {
      setIsShaking(false);
      setTokenInput('');
      inputRef.current?.focus();
    }, 700);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept up to 5 digits (0-9)
    const val = e.target.value.replace(/\D/g, '').slice(0, 5);
    setTokenInput(val);
    if (errorMessage) setErrorMessage(null);

    // Auto submit if 5 digits are completed
    if (val.length === 5) {
      validateAndSubmit(val);
    }
  };

  const validateAndSubmit = (codeToVerify: string) => {
    if (isVerifying || verifiedVoter) return;

    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      if (codeToVerify.length !== 5) {
        triggerError(
          'Harap masukkan 5 digit angka token pemilih secara lengkap.',
          '[AUTH_ERR // TOKEN_INCOMPLETE]',
          'warning',
          3000
        );
        return;
      }

      // Deteksi Token Khusus Gerbang Admin: 99999
      if (codeToVerify === '99999') {
        onAdminTokenEntered();
        return;
      }

      // Periksa apakah status pemilihan sedang aktif
      if (pengaturan.status !== 'aktif') {
        const isClosed = pengaturan.status === 'ditutup';
        const msg = isClosed
          ? 'Pemungutan suara telah selesai / ditutup oleh panitia.'
          : 'Pemilihan belum dibuka oleh panitia. Silakan tunggu pembukaan resmi bilik suara di TPS.';
        triggerError(
          msg,
          isClosed ? '[SYS_OFFLINE // POLL_CLOSED]' : '[SYS_STANDBY // PRE_POLL]',
          isClosed ? 'info' : 'warning',
          4500
        );
        return;
      }

      const matched = pemilihList.find((p) => p.token === codeToVerify);

      if (!matched) {
        triggerError(
          'Token 5 digit tidak terdaftar di DPT. Mohon periksa kembali atau minta token baru ke panitia.',
          '[AUTH_FAIL // UNREGISTERED_TOKEN]',
          'error',
          4500
        );
        return;
      }

      if (matched.status === 'sudah') {
        triggerError(
          `Token ${matched.token} milik ${matched.nama} (${matched.kelas}) sudah digunakan untuk mencoblos. Hak suara hanya berlaku satu kali.`,
          '[AUTH_DENIED // VOTE_EXPENDED]',
          'error',
          5000
        );
        return;
      }

      // Valid! Tampilkan modal/toast ceklis tepat di tengah & otomatis masuk bilik suara
      setVerifiedVoter(matched);

      onShowToast?.({
        type: 'success',
        title: 'Token Terverifikasi!',
        message: `Hak suara aktif untuk ${matched.nama} (${matched.kelas}). Membuka bilik suara...`,
        code: '[AUTH_TOKEN_VERIFIED // 0x2A]',
        duration: 2500,
      });

      // Otomatis pindah ke bilik suara tanpa menekan tombol lagi
      setTimeout(() => {
        onVerifyToken(matched);
      }, 900);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmit(tokenInput);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-emerald-950/10 flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-900/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-800/20 flex items-center justify-center shrink-0">
              <SafeImage
                src={pengaturan.logoUrl}
                alt="Logo Sekolah"
                fallbackInitial="9B"
                className="w-8 h-8 object-contain"
                containerClassName="w-full h-full flex items-center justify-center"
              />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-emerald-950 leading-tight">
                PanritaVote
              </h1>
              <p className="text-xs text-emerald-800/80 font-medium">
                {pengaturan.sekolah}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCandidateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-800" />
              <span>Profil Paslon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Kiosk Voting Portal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className={`max-w-md w-full bg-white rounded-3xl border p-6 sm:p-8 text-center transition-all ${
            isShaking
              ? 'animate-earthquake border-rose-500 ring-4 ring-rose-400/50 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
              : 'border-slate-200/90 shadow-xl shadow-emerald-950/5'
          }`}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Bilik Suara Digital Terbuka</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Masukkan Token Pemilih
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
            Ketik <strong className="text-emerald-900 font-bold">5 digit angka</strong> kode pemilih yang Anda terima dari panitia untuk membuka bilik suara.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              {/* Hidden Real Input for Accessibility & Mobile Keypad */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={tokenInput}
                onChange={handleInputChange}
                className="sr-only"
                autoComplete="off"
                aria-label="Token Pemilih 5 Digit"
              />

              {/* 5-Digit Visual Digit Boxes */}
              <div
                onClick={() => inputRef.current?.focus()}
                className="flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer py-2 select-none"
              >
                {[0, 1, 2, 3, 4].map((idx) => {
                  const digit = tokenInput[idx] || '';
                  const isCurrent = tokenInput.length === idx;
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-black font-mono transition-all duration-150 ${
                        isShaking
                          ? 'bg-rose-50 text-rose-700 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          : digit
                          ? 'bg-emerald-900 text-white border-2 border-emerald-800 shadow-sm scale-102'
                          : isCurrent
                          ? 'bg-emerald-50 text-emerald-950 border-2 border-emerald-600 ring-4 ring-emerald-100'
                          : 'bg-slate-50 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {digit || (isCurrent ? <span className="animate-pulse">|</span> : '·')}
                    </div>
                  );
                })}
              </div>

              <span className="block text-[11px] text-slate-400 mt-2">
                Sentuh kotak angka di atas untuk mengetik ({tokenInput.length}/5 digit)
              </span>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 text-left animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={tokenInput.length !== 5 || isVerifying}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                tokenInput.length === 5 && !isVerifying
                  ? 'bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white shadow-emerald-950/20 active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Token...</span>
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4" />
                  <span>Buka Bilik Suara Sekarang</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preview Candidates Button (Mobile) */}
          {paslonList.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsCandidateModalOpen(true);
                  onShowToast?.({
                    type: 'info',
                    title: 'Direktori Pasangan Calon',
                    message: `Menampilkan profil & visi-misi ${paslonList.length} pasangan calon OSIS.`,
                    code: '[DIR_LOOKUP // CANDIDATE_INDEX]',
                    duration: 2500,
                  });
                }}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Profil {paslonList.length} Pasangan Calon</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info (Bersih dari link admin) */}
      <footer className="py-4 px-4 text-center text-xs text-slate-500 flex items-center justify-center">
        <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Kerahasiaan Suara Dijamin Penuh (Asas Luber Jurdil)</span>
        </div>
      </footer>

      {/* Toast Ceklis Tepat di Bagian Tengah Layar (Glassmorphism HUD Center Modal) */}
      {verifiedVoter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
        >
          <div className="relative max-w-sm sm:max-w-md w-full bg-slate-950/95 border border-emerald-400/80 shadow-[0_0_60px_rgba(16,185,129,0.55)] rounded-3xl p-6 sm:p-8 text-center text-white overflow-hidden animate-success-pop">
            {/* HUD Corner Tech Brackets */}
            <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />

            {/* Glowing Big Center Checkmark */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_35px_#10b981] mb-4">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 animate-success-pop" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>[SYS_OK // TOKEN_TERVERIFIKASI]</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              HAK SUARA AKTIF
            </h3>

            {/* Voter Data Card */}
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-emerald-500/30 font-mono text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Nama Pemilih:</span>
                <strong className="text-white font-bold">{verifiedVoter.nama}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Kelas / Unit:</span>
                <strong className="text-emerald-300">{verifiedVoter.kelas}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Token Valid:</span>
                <span className="font-bold text-white bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50">
                  {verifiedVoter.token}
                </span>
              </div>
            </div>

            {/* Auto-redirect status indicator */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-mono text-emerald-300">
              <div className="w-3.5 h-3.5 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
              <span>Membuka bilik suara secara otomatis...</span>
            </div>

            {/* Progress laser line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-950 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 animate-[pulse_1s_infinite] shadow-[0_0_10px_#10b981]" />
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal to preview profiles */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Pasangan Calon Ketua & Wakil Ketua OSIS
                </h3>
                <p className="text-xs text-slate-500">
                  SMKN 9 Bulukumba Periode 2026/2027
                </p>
              </div>
              <button
                onClick={() => setIsCandidateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto pr-1">
              {paslonList.map((paslon) => (
                <div
                  key={paslon.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="bg-emerald-900 text-white p-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500 text-emerald-950 font-black text-sm flex items-center justify-center">
                      {paslon.nomorUrut}
                    </span>
                    <span className="text-xs font-bold truncate">
                      Paslon No. {paslon.nomorUrut}
                    </span>
                  </div>

                  <div className="p-3 border-b border-slate-200 bg-white">
                    <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-200 mb-2">
                      <SafeImage
                        src={paslon.fotoUrl}
                        alt={`Paslon ${paslon.nomorUrut}: ${paslon.namaKetua} & ${paslon.namaWakil}`}
                        fallbackInitial={`P${paslon.nomorUrut}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {paslon.namaKetua}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 block truncate">
                        & {paslon.namaWakil}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {paslon.kelasKetua} · {paslon.kelasWakil}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 text-xs space-y-2 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                        Visi:
                      </span>
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        "{paslon.visi}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                        Misi Utama:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {paslon.misi.slice(0, 2).map((m, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCandidateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Tutup & Kembali ke Masukkan Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
