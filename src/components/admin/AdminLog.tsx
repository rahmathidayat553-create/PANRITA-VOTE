import React, { useState } from 'react';
import { LogAktivitas } from '../../data/dummy';
import { ScrollText, Shield, Vote, Cpu, Search, CheckCircle } from 'lucide-react';

interface AdminLogProps {
  logs: LogAktivitas[];
}

export const AdminLog: React.FC<AdminLogProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<'semua' | 'vote' | 'auth' | 'sistem'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter((log) => {
    const matchesFilter = filterType === 'semua' || log.tipe === filterType;
    const matchesSearch =
      log.aksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.pengguna.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-orange-400" />
            <span>Log Aktivitas Sistem Pemilihan</span>
          </h2>
          <p className="text-xs text-emerald-200/70 mt-0.5">
            Jejak audit sistem untuk mencatat setiap aktivitas otorisasi, transaksi surat suara, dan perubahan konfigurasi.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi atau pengguna..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#02130c]/70 text-white placeholder:text-emerald-700/60 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#02130c]/80 rounded-xl w-full sm:w-auto border border-emerald-500/20">
          {(['semua', 'vote', 'auth', 'sistem'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-950/40 font-bold'
                  : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              {type === 'semua'
                ? 'Semua'
                : type === 'vote'
                ? 'Suara Masuk'
                : type === 'auth'
                ? 'Otorisasi'
                : 'Sistem'}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#02130c]/90 border-b border-emerald-500/20 text-emerald-300/70 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Waktu (WITA)</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Deskripsi Aktivitas</th>
                <th className="px-5 py-3.5">Aktor / Entitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/15 text-emerald-100">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-900/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-emerald-400 whitespace-nowrap">
                      {log.waktu}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {log.tipe === 'vote' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-400/40">
                          <Vote className="w-3 h-3 text-orange-400" />
                          Suara
                        </span>
                      ) : log.tipe === 'auth' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          Otorisasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#021810] text-emerald-300/80 border border-emerald-500/30">
                          <Cpu className="w-3 h-3 text-emerald-400" />
                          Sistem
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      {log.aksi}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-300/80">
                      {log.pengguna}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-emerald-300/60">
                    Tidak ada catatan log aktivitas yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
