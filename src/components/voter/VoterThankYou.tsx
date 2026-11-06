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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6 shadow-xs border-2 border-emerald-300">
          <CheckCircle2 className="w-12 h-12 text-emerald-700" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
          Suara Sah Telah Tercatat
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Terima Kasih!
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
          Partisipasi Anda sangat berarti untuk kemajuan OSIS SMKN 9 Bulukumba. Pilihan Anda telah dienkripsi dan dijamin kerahasiaannya.
        </p>

        {/* Verification receipt box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-8 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Status Pemilih</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sudah Memilih
            </span>
          </div>
          {voter && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nama Siswa</span>
                <span className="font-semibold text-slate-800">{voter.nama}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kelas / Jurusan</span>
                <span className="text-slate-700">{voter.kelas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kode Token</span>
                <span className="font-mono font-bold text-slate-700">{voter.token}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500">Waktu Pencoblosan</span>
            <span className="font-mono text-slate-700">
              {voter?.waktuMemilih || new Date().toLocaleTimeString('id-ID') + ' WITA'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-center justify-center gap-2 mb-8">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Hasil resmi perolehan suara akan diumumkan oleh Panitia Pemilihan OSIS.</span>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Selesai & Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
};
