import React from 'react';
import { Paslon } from '../../data/dummy';
import { BarChart3, Trophy, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminRekapitulasiProps {
  paslonList: Paslon[];
}

export const AdminRekapitulasi: React.FC<AdminRekapitulasiProps> = ({
  paslonList,
}) => {
  const totalSuara = paslonList.reduce((acc, curr) => acc + curr.suaraPerolehan, 0);

  // Sort descending by vote count for ranking
  const sortedPaslon = [...paslonList].sort(
    (a, b) => b.suaraPerolehan - a.suaraPerolehan
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span>Rekapitulasi Suara Resmi (Internal Panitia)</span>
          </h2>
          <p className="text-xs text-emerald-200/70 mt-0.5">
            Hasil perhitungan perolehan suara sah pemilihan Ketua dan Wakil Ketua OSIS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-[#042017]/90 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 font-mono shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>REKAP_TERENKRIPSI</span>
          </div>
        </div>
      </div>

      {/* Summary Stat Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] hover:-translate-y-1 transition-all duration-300">
          <span className="text-[11px] font-bold text-emerald-300/70 uppercase tracking-wider block mb-1">
            Total Suara Masuk
          </span>
          <div className="text-3xl font-black text-white font-mono tabular-nums">
            {totalSuara}
          </div>
          <span className="text-[11px] text-emerald-300/60 mt-1 block">Surat Suara Digital</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-orange-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(249,115,22,0.22)] hover:-translate-y-1 transition-all duration-300">
          <span className="text-[11px] font-bold text-orange-300/80 uppercase tracking-wider block mb-1">
            Suara Sah (Valid)
          </span>
          <div className="text-3xl font-black text-orange-400 font-mono tabular-nums">
            {totalSuara} (100%)
          </div>
          <span className="text-[11px] text-orange-300/70 font-medium mt-1 block">Tervalidasi Sistem Cloud</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] hover:-translate-y-1 transition-all duration-300">
          <span className="text-[11px] font-bold text-emerald-300/70 uppercase tracking-wider block mb-1">
            Suara Rusak / Batal
          </span>
          <div className="text-3xl font-black text-emerald-500/40 font-mono tabular-nums">
            0 (0%)
          </div>
          <span className="text-[11px] text-emerald-300/60 mt-1 block font-mono">ZERO_INVALID_RATE</span>
        </div>
      </div>

      {/* Official Recapitulation Table */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">
              Tabel Rincian Perolehan Suara Pasangan Calon
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#02130c]/90 border-b border-emerald-500/20 text-emerald-300/70 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Peringkat</th>
                <th className="px-5 py-3.5">No. Urut</th>
                <th className="px-5 py-3.5">Nama Pasangan Calon</th>
                <th className="px-5 py-3.5 text-right">Jumlah Suara</th>
                <th className="px-5 py-3.5 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/15 text-emerald-100 font-medium">
              {sortedPaslon.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-emerald-300/60">
                    Belum ada pasangan calon terdaftar di database.
                  </td>
                </tr>
              ) : (
                sortedPaslon.map((paslon, index) => {
                  const persentase =
                    totalSuara > 0
                      ? ((paslon.suaraPerolehan / totalSuara) * 100).toFixed(2)
                      : '0.00';
                  const isLeading = index === 0 && paslon.suaraPerolehan > 0;

                  return (
                    <tr
                      key={paslon.id}
                      className={`hover:bg-emerald-900/30 transition-colors ${
                        isLeading ? 'bg-[#021810]' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        {isLeading ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-400/40 shadow-[0_0_10px_rgba(249,115,22,0.25)] font-mono">
                            <Trophy className="w-3.5 h-3.5 text-orange-400" />
                            UNGGUL #{index + 1}
                          </span>
                        ) : (
                          <span className="font-mono text-emerald-400/80 pl-3">#{index + 1}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black flex items-center justify-center text-xs shadow-md font-mono">
                          {paslon.nomorUrut}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">
                          {paslon.namaKetua}
                        </div>
                        <div className="text-[11px] text-emerald-300/70">
                          Wakil: {paslon.namaWakil}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-white tabular-nums text-sm">
                        {paslon.suaraPerolehan} <span className="text-xs text-emerald-300/70 font-normal">suara</span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-orange-400 tabular-nums text-sm">
                        {persentase}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300">Perhatian Panitia:</strong> Sesuai ketentuan, data rekapitulasi ini bersifat tertutup selama masa pencoblosan dan hanya dipublikasikan secara resmi setelah waktu pemungutan suara ditutup oleh pihak sekolah.
        </div>
      </div>
    </div>
  );
};
