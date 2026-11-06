import React, { useState } from 'react';
import { Paslon, Pemilih } from '../../data/dummy';
import { ToastData } from '../Toast';
import { SafeImage } from '../SafeImage';
import {
  Vote,
  ShieldCheck,
  ArrowLeft,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';

interface VoterBallotProps {
  paslonList: Paslon[];
  activeVoter: Pemilih;
  onCastVote: (paslonId: string) => void;
  onCancel: () => void;
  onShowToast?: (data: ToastData) => void;
}

export const VoterBallot: React.FC<VoterBallotProps> = ({
  paslonList,
  activeVoter,
  onCastVote,
  onCancel,
  onShowToast,
}) => {
  const [selectedPaslon, setSelectedPaslon] = useState<Paslon | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSelect = (paslon: Paslon) => {
    setSelectedPaslon(paslon);
    setIsConfirmOpen(true);
    onShowToast?.({
      type: 'info',
      title: `Paslon No. ${paslon.nomorUrut} Dipilih`,
      message: `Target terpilih: ${paslon.namaKetua} & ${paslon.namaWakil}. Silakan tekan tombol konfirmasi coblos.`,
      code: '[BALLOT_TARGET_LOCKED]',
      duration: 3000,
    });
  };

  const handleCancelSession = () => {
    onShowToast?.({
      type: 'warning',
      title: 'Sesi Bilik Dibatalkan',
      message: 'Keluar dari bilik suara tanpa mencoblos. Hak pilih belum digunakan.',
      code: '[SESSION_ABORTED]',
      duration: 3000,
    });
    onCancel();
  };

  const handleConfirmVote = () => {
    if (selectedPaslon) {
      onCastVote(selectedPaslon.id);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col p-2 sm:p-4 bg-slate-100 select-none">
      {/* 1. Header Ringkas (Single-Row Bar, Height ~48px) */}
      <header className="bg-white rounded-xl border border-slate-200 px-3 sm:px-4 py-2 shrink-0 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <Vote className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider whitespace-nowrap">
                Surat Suara Digital
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold bg-emerald-50 text-emerald-900 px-1.5 py-0.2 rounded border border-emerald-200">
                Token: {activeVoter.token}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {activeVoter.nama} ({activeVoter.kelas})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pilihan Rahasia</span>
          </div>
          <button
            onClick={handleCancelSession}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Batal dan kembali ke layar awal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* 2. Petunjuk 1 Baris */}
      <div className="text-center py-1 sm:py-1.5 shrink-0">
        <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
          Sentuh <strong className="text-emerald-950 font-bold">foto kandidat</strong> atau <strong className="text-emerald-950 font-bold">nomor urutnya</strong> untuk mencoblos.
        </p>
      </div>

      {/* 3. Area Surat Suara: Kolom Responsif Penuh Pas 1 Halaman Tanpa Scroll */}
      {paslonList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 my-auto">
          <Vote className="w-12 h-12 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Daftar Pasangan Calon Belum Ditetapkan</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Panitia pemilihan belum mendaftarkan data kandidat ke sistem database.
          </p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Kembali ke Layar Awal
          </button>
        </div>
      ) : (
        <main
          className={`flex-1 min-h-0 grid gap-2 sm:gap-4 pb-1 ${
            paslonList.length === 1
              ? 'grid-cols-1 max-w-md mx-auto w-full'
              : paslonList.length === 2
              ? 'grid-cols-2 max-w-3xl mx-auto w-full'
              : 'grid-cols-3'
          }`}
        >
          {paslonList.map((paslon) => (
            <div
              key={paslon.id}
              onClick={() => handleSelect(paslon)}
              className="h-full flex flex-col justify-between bg-white rounded-xl sm:rounded-2xl border-2 border-slate-300 hover:border-emerald-600 active:border-emerald-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer group relative"
            >
            {/* Header Kartu: Tombol Nomor Urut Besar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(paslon);
              }}
              className="w-full py-1.5 sm:py-2.5 bg-emerald-950 group-hover:bg-emerald-800 text-white font-black text-center flex items-center justify-center gap-1 sm:gap-2 transition-colors shrink-0 cursor-pointer"
            >
              <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-black flex items-center justify-center shadow-xs">
                {paslon.nomorUrut}
              </span>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase">
                Coblos No. {paslon.nomorUrut}
              </span>
            </button>

            {/* Foto Berdua Ketua & Wakil (Mengisi sisa ruang vertikal tanpa overflow) */}
            <div className="flex-1 min-h-0 relative w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              <SafeImage
                src={paslon.fotoUrl}
                alt={`Paslon ${paslon.nomorUrut}: ${paslon.namaKetua} & ${paslon.namaWakil}`}
                fallbackInitial={`P${paslon.nomorUrut}`}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                containerClassName="w-full h-full relative overflow-hidden bg-emerald-950/5 flex items-center justify-center"
              />

              {/* Hover / Active Badge Stamp */}
              <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Vote className="w-4 h-4" />
                  Coblos
                </span>
              </div>
            </div>

            {/* Strip Nama Calon Ketua & Wakil */}
            <div className="p-1.5 sm:p-2.5 bg-slate-50 border-t border-slate-200 text-center shrink-0">
              <span className="text-[9px] sm:text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider block">
                Paslon #{paslon.nomorUrut}
              </span>
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                {paslon.namaKetua}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate">
                & {paslon.namaWakil}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5">
                {paslon.kelasKetua} · {paslon.kelasWakil}
              </div>
            </div>
          </div>
        ))}
      </main>
    )}

      {/* 4. Modal Konfirmasi Pilihan Sederhana: "Ya" atau "Tidak" */}
      {isConfirmOpen && selectedPaslon && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-2xl flex items-center justify-center mx-auto mb-3 border-2 border-emerald-300">
              {selectedPaslon.nomorUrut}
            </div>

            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Konfirmasi Pilihan
            </span>

            {/* Pertanyaan Persis Sesuai Permintaan */}
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-2 text-balance">
              Yakin Anda memilih No. Urut {selectedPaslon.nomorUrut} {selectedPaslon.namaKetua} & {selectedPaslon.namaWakil}?
            </h3>

            <p className="text-xs text-slate-500 mb-6">
              Pilihan bersifat rahasia dan suara sah Anda akan langsung dicatat.
            </p>

            {/* Tombol YA atau TIDAK */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="py-3 px-4 rounded-xl border-2 border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tidak</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmVote}
                className="py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Ya</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
