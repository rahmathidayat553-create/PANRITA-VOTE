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
          <h2 className="text-base font-bold text-slate-900">
            Log Aktivitas Sistem Pemilihan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jejak audit sistem untuk mencatat setiap aktivitas otorisasi, transaksi surat suara, dan perubahan konfigurasi.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi atau pengguna..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['semua', 'vote', 'auth', 'sistem'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Waktu (WITA)</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Deskripsi Aktivitas</th>
                <th className="px-5 py-3">Aktor / Entitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {log.waktu}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {log.tipe === 'vote' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Vote className="w-3 h-3 text-emerald-700" />
                          Suara
                        </span>
                      ) : log.tipe === 'auth' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                          <Shield className="w-3 h-3 text-blue-700" />
                          Otorisasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          <Cpu className="w-3 h-3 text-slate-500" />
                          Sistem
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {log.aksi}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {log.pengguna}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
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
