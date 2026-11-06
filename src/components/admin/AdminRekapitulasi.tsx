import React from 'react';
import { Paslon } from '../../data/dummy';
import { BarChart3, Trophy, ShieldCheck, Download, AlertCircle } from 'lucide-react';

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
          <h2 className="text-base font-bold text-slate-900">
            Rekapitulasi Suara Resmi (Internal Panitia)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hasil perhitungan perolehan suara sah pemilihan Ketua dan Wakil Ketua OSIS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Rekapitulasi Terenkripsi</span>
          </div>
        </div>
      </div>

      {/* Summary Stat Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Suara Masuk
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalSuara}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Surat Suara Digital</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Suara Sah (Valid)
          </span>
          <div className="text-2xl font-black text-emerald-800 font-mono tabular-nums">
            {totalSuara} (100%)
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Tervalidasi Sistem</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Suara Rusak / Batal
          </span>
          <div className="text-2xl font-black text-slate-400 font-mono tabular-nums">
            0 (0%)
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero Invalidation Rate</span>
        </div>
      </div>

      {/* Official Recapitulation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900">
              Tabel Rincian Perolehan Suara Pasangan Calon
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Peringkat</th>
                <th className="px-5 py-3">No. Urut</th>
                <th className="px-5 py-3">Nama Pasangan Calon</th>
                <th className="px-5 py-3 text-right">Jumlah Suara</th>
                <th className="px-5 py-3 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {sortedPaslon.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
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
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLeading ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                    <td className="px-5 py-4">
                      {isLeading ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          Unggul #{index + 1}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-500 pl-3">#{index + 1}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="w-7 h-7 rounded-lg bg-emerald-900 text-white font-bold flex items-center justify-center text-xs">
                        {paslon.nomorUrut}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {paslon.namaKetua}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Wakil: {paslon.namaWakil}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                      {paslon.suaraPerolehan} suara
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-emerald-800 tabular-nums text-sm">
                      {persentase}%
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Perhatian Panitia:</strong> Sesuai ketentuan, data rekapitulasi ini bersifat tertutup selama masa pencoblosan dan hanya dipublikasikan secara resmi setelah waktu pemungutan suara ditutup oleh pihak sekolah.
        </div>
      </div>
    </div>
  );
};
