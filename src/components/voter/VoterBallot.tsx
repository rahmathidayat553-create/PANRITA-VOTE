import React, { useState } from 'react';
import { Paslon, Pemilih } from '../../data/dummy';
import { ToastData } from '../Toast';
import { SafeImage } from '../SafeImage';
import {
  Vote,
  ShieldCheck,
  ArrowLeft,
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
    <div className="h-screen max-h-screen overflow-hidden flex flex-col p-2 sm:p-4 bg-transparent select-none relative z-10">
      {/* 1. Header Ringkas (Single-Row Bar, Height ~52px) */}
      <header className="bg-[#042017]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/25 px-4 py-2.5 shrink-0 flex items-center justify-between gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            <Vote className="w-4 h-4 text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider whitespace-nowrap font-mono">
                SURAT SUARA DIGITAL
              </span>
              <span className="text-emerald-700">·</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold bg-[#02130c] text-emerald-300 px-2 py-0.2 rounded border border-emerald-500/30">
                TOKEN: {activeVoter.token}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {activeVoter.nama} ({activeVoter.kelas})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-[#02130c]/80 px-2.5 py-1 rounded-xl border border-emerald-500/25 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>PILIHAN RAHASIA</span>
          </div>
          <button
            onClick={handleCancelSession}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-[#02130c]/70 hover:bg-rose-950/60 rounded-xl border border-emerald-500/20 hover:border-rose-500/40 transition-all flex items-center gap-1 cursor-pointer"
            title="Batal dan kembali ke layar awal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* 2. Petunjuk 1 Baris */}
      <div className="text-center py-1 sm:py-1.5 shrink-0">
        <p className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">
          Sentuh <strong className="text-orange-400 font-bold">foto kandidat</strong> atau <strong className="text-orange-400 font-bold">tombol nomor urutnya</strong> untuk mencoblos.
        </p>
      </div>

      {/* 3. Area Surat Suara: Kolom Responsif Penuh Pas 1 Halaman Tanpa Scroll */}
      {paslonList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 my-auto shadow-2xl">
          <Vote className="w-12 h-12 text-emerald-500/40 mb-2" />
          <h3 className="text-sm font-bold text-white">Daftar Pasangan Calon Belum Ditetapkan</h3>
          <p className="text-xs text-emerald-200/70 max-w-sm mt-1">
            Panitia pemilihan belum mendaftarkan data kandidat ke sistem database.
          </p>
          <button
            onClick={onCancel}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-orange-950/40"
          >
            Kembali ke Layar Awal
          </button>
        </div>
      ) : (
        <main
          className={`flex-1 min-h-0 grid gap-2.5 sm:gap-4 pb-1 ${
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
              className="h-full flex flex-col justify-between bg-[#042017]/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 border-emerald-500/25 hover:border-orange-500/80 active:border-orange-600 overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_45px_rgba(249,115,22,0.25)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative"
            >
              {/* Header Kartu: Tombol Nomor Urut Besar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(paslon);
                }}
                className="w-full py-2 sm:py-2.5 bg-[#021810] group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-600 text-white font-black text-center flex items-center justify-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer border-b border-emerald-500/20"
              >
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-orange-500 group-hover:bg-white text-white group-hover:text-orange-600 text-xs sm:text-sm font-black flex items-center justify-center shadow-md font-mono transition-colors">
                  {paslon.nomorUrut}
                </span>
                <span className="text-[10px] sm:text-xs tracking-wider uppercase font-mono font-bold">
                  Coblos No. {paslon.nomorUrut}
                </span>
              </button>

              {/* Foto Berdua Ketua & Wakil (Mengisi sisa ruang vertikal tanpa overflow) */}
              <div className="flex-1 min-h-0 relative w-full overflow-hidden bg-[#02130c] flex items-center justify-center">
                <SafeImage
                  src={paslon.fotoUrl}
                  alt={`Paslon ${paslon.nomorUrut}: ${paslon.namaKetua} & ${paslon.namaWakil}`}
                  fallbackInitial={`P${paslon.nomorUrut}`}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  containerClassName="w-full h-full relative overflow-hidden bg-[#02130c] flex items-center justify-center"
                />

                {/* Hover / Active Badge Stamp */}
                <div className="absolute inset-0 bg-[#021810]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-orange-950/60 flex items-center gap-1.5 border border-orange-300/40">
                    <Vote className="w-4 h-4" />
                    COBLOS
                  </span>
                </div>
              </div>

              {/* Strip Nama Calon Ketua & Wakil */}
              <div className="p-2 sm:p-3 bg-[#02130c]/90 border-t border-emerald-500/20 text-center shrink-0">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest block">
                  PASLON #{paslon.nomorUrut}
                </span>
                <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                  {paslon.namaKetua}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-300/80 truncate">
                  & {paslon.namaWakil}
                </div>
                <div className="text-[9px] sm:text-[10px] text-emerald-400/60 truncate mt-0.5 font-mono">
                  {paslon.kelasKetua} · {paslon.kelasWakil}
                </div>
              </div>
            </div>
          ))}
        </main>
      )}

      {/* 4. Modal Konfirmasi Pilihan Sederhana: "Ya" atau "Tidak" */}
      {isConfirmOpen && selectedPaslon && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#042017]/95 rounded-3xl max-w-sm w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-orange-500/30 text-center text-white">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#021810] text-orange-400 font-mono font-black text-3xl flex items-center justify-center mx-auto mb-3 border-2 border-orange-400/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              {selectedPaslon.nomorUrut}
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block mb-1">
              [KONFIRMASI_PILIHAN // 0x2A]
            </span>

            {/* Pertanyaan Persis Sesuai Permintaan */}
            <h3 className="text-base sm:text-lg font-black text-white leading-snug mb-2 text-balance">
              Yakin Anda memilih No. Urut {selectedPaslon.nomorUrut} {selectedPaslon.namaKetua} & {selectedPaslon.namaWakil}?
            </h3>

            <p className="text-xs text-emerald-200/70 mb-6">
              Pilihan bersifat rahasia dan suara sah Anda akan langsung dicatat ke Firestore.
            </p>

            {/* Tombol YA atau TIDAK */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="py-3 px-4 rounded-xl border border-emerald-500/30 bg-[#02130c]/70 hover:bg-[#02130c] text-emerald-200 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tidak</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmVote}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 text-white font-black text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-orange-950/50 cursor-pointer border border-orange-400/40"
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
