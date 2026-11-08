import React from 'react';
import { Pemilih } from '../../data/dummy';
import { CheckCircle2, ShieldCheck, Home, Lock } from 'lucide-react';

interface VoterThankYouProps {
  voter: Pemilih | null;
  onFinish: () => void;
}

export const VoterThankYou: React.FC<VoterThankYouProps> = ({
  voter,
  onFinish,
}) => {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-6 relative z-10">
      <div className="max-w-lg w-full bg-[#042017]/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-10 text-center text-white">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.4)] animate-success-pop">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-400/40 font-mono">
          SUARA SAH TELAH TERCATAT
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
          Terima Kasih!
        </h1>

        <p className="text-sm text-emerald-200/80 mb-6 leading-relaxed max-w-md mx-auto">
          Partisipasi Anda sangat berarti untuk kemajuan OSIS SMKN 9 Bulukumba. Pilihan Anda telah dienkripsi dan dijamin kerahasiaannya.
        </p>

        {/* Verification receipt box */}
        <div className="bg-[#02130c]/80 rounded-2xl p-4 border border-emerald-500/25 text-left mb-6 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
            <span className="text-emerald-300/70">STATUS PEMILIH</span>
            <span className="font-bold text-orange-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              SUDAH MEMILIH
            </span>
          </div>
          {voter && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300/70">NAMA SISWA</span>
                <span className="font-bold text-white">{voter.nama}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300/70">KELAS / UNIT</span>
                <span className="text-emerald-200">{voter.kelas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300/70">KODE TOKEN</span>
                <span className="font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-400/30">
                  {voter.token}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-emerald-300/70">WAKTU PENCOBLOSAN</span>
            <span className="text-emerald-300">
              {voter?.waktuMemilih || new Date().toLocaleTimeString('id-ID') + ' WITA'}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-[#021810] rounded-xl border border-emerald-500/25 text-emerald-200/80 text-xs flex items-center justify-center gap-2 mb-8">
          <Lock className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Hasil resmi perolehan suara akan diumumkan oleh Panitia Pemilihan OSIS.</span>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer text-sm border border-orange-400/40"
        >
          <Home className="w-4 h-4" />
          <span>Selesai & Kembali ke Bilik Suara</span>
        </button>
      </div>
    </div>
  );
};
