import React from 'react';
import { Paslon, Pemilih, PengaturanPemilihan, LogAktivitas } from '../../data/dummy';
import {
  Users,
  Vote,
  UserX,
  PieChart,
  TrendingUp,
  CheckCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface AdminDashboardProps {
  paslonList: Paslon[];
  pemilihList: Pemilih[];
  pengaturan: PengaturanPemilihan;
  logs: LogAktivitas[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  paslonList,
  pemilihList,
  pengaturan,
  logs,
}) => {
  const totalDPT = pemilihList.length;
  const sudahMemilihCount = pemilihList.filter((p) => p.status === 'sudah').length;
  const belumMemilihCount = totalDPT - sudahMemilihCount;
  const persentasePartisipasi = totalDPT > 0 ? Math.round((sudahMemilihCount / totalDPT) * 100) : 0;

  const totalSuaraSah = paslonList.reduce((acc, curr) => acc + curr.suaraPerolehan, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
            Akses Terbatas Panitia
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">
            Hasil Pemilihan & Monitoring Real-Time
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            Data perolehan suara ini hanya dapat dilihat oleh panitia dan tidak ditampilkan pada halaman publik siswa.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700/60 text-xs font-semibold text-emerald-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Status: {pengaturan.status.toUpperCase()}</span>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total DPT</span>
            <Users className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalDPT}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Pemilih Terdaftar</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Suara Masuk</span>
            <Vote className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono tabular-nums">
            {sudahMemilihCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Telah Menggunakan Hak</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Belum Memilih</span>
            <UserX className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">
            {belumMemilihCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Menunggu Pemilihan</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Partisipasi</span>
            <PieChart className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {persentasePartisipasi}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tingkat Kehadiran Siswa</span>
        </div>
      </div>

      {/* Perolehan Suara Pasangan Calon (Hasil Sementara Tertutup) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Perolehan Suara Pasangan Calon (Hasil Sementara)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total perolehan suara sah terkumpul: <strong className="text-slate-900 font-mono">{totalSuaraSah} suara</strong>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold self-start sm:self-auto">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Update Otomatis</span>
          </div>
        </div>

        <div className="space-y-6">
          {paslonList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada data pasangan calon di database. Silakan daftarkan kandidat melalui menu Paslon.
            </div>
          ) : (
            paslonList.map((paslon) => {
              const persentase =
                totalSuaraSah > 0
                  ? ((paslon.suaraPerolehan / totalSuaraSah) * 100).toFixed(1)
                  : '0';
              return (
                <div key={paslon.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-emerald-900 text-white font-bold flex items-center justify-center text-xs">
                        {paslon.nomorUrut}
                      </span>
                      <span className="font-bold text-slate-900">
                        {paslon.namaKetua} & {paslon.namaWakil}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono tabular-nums">
                        {paslon.suaraPerolehan} suara
                      </span>
                      <span className="font-bold text-emerald-900 font-mono tabular-nums text-sm">
                        {persentase}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                      style={{ width: `${persentase}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activity Log Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Aktivitas Terbaru</span>
        </h3>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-xs">
              Belum ada catatan aktivitas di database.
            </div>
          ) : (
            logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-slate-800">{log.aksi}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] shrink-0">
                  <span>{log.pengguna}</span>
                  <span>{log.waktu}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
