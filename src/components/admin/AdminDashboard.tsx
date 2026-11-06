import React, { useState } from 'react';
import { Paslon, Pemilih, PengaturanPemilihan, LogAktivitas } from '../../data/dummy';
import {
  Users,
  Vote,
  UserX,
  PieChart as PieIcon,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';

interface AdminDashboardProps {
  paslonList: Paslon[];
  pemilihList: Pemilih[];
  pengaturan: PengaturanPemilihan;
  logs: LogAktivitas[];
}

// Modern vibrant palette for Paslon candidate bars
const BAR_COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#0d9488', // Teal
];

// Custom HUD Glassmorphism Tooltip for the Recharts Bar Chart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 text-white p-3 rounded-xl shadow-xl text-xs font-sans min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
          <span className="font-mono font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
            {data.nomorUrut}
          </span>
          <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
            {data.persentase}% Suara
          </span>
        </div>
        <p className="font-bold text-white text-xs mb-1">
          {data.fullName}
        </p>
        <div className="flex items-center justify-between text-slate-300 font-mono text-[11px] pt-1">
          <span>Perolehan Suara:</span>
          <span className="font-bold text-emerald-300 text-sm">
            {data.suara} <span className="text-[10px] text-slate-400 font-normal">suara</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  paslonList,
  pemilihList,
  pengaturan,
  logs,
}) => {
  const [chartView, setChartView] = useState<'both' | 'chart' | 'cards'>('both');

  const totalDPT = pemilihList.length;
  const sudahMemilihCount = pemilihList.filter((p) => p.status === 'sudah').length;
  const belumMemilihCount = totalDPT - sudahMemilihCount;
  const persentasePartisipasi =
    totalDPT > 0 ? Math.round((sudahMemilihCount / totalDPT) * 100) : 0;

  const totalSuaraSah = paslonList.reduce((acc, curr) => acc + curr.suaraPerolehan, 0);

  // Format data for Recharts BarChart
  const chartData = paslonList.map((paslon, idx) => {
    const persentase =
      totalSuaraSah > 0
        ? Number(((paslon.suaraPerolehan / totalSuaraSah) * 100).toFixed(1))
        : 0;

    return {
      id: paslon.id,
      index: idx,
      nomorUrut: `No. ${paslon.nomorUrut}`,
      shortLabel: `Paslon ${paslon.nomorUrut}`,
      fullName: `${paslon.namaKetua} & ${paslon.namaWakil}`,
      suara: paslon.suaraPerolehan,
      persentase,
      color: BAR_COLORS[idx % BAR_COLORS.length],
    };
  });

  // Calculate highest vote for highlighting
  const maxVote = Math.max(0, ...paslonList.map((p) => p.suaraPerolehan));

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
            Data perolehan suara ini tersinkronisasi langsung dari database awan Firestore.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700/60 text-xs font-semibold text-emerald-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Telah Menggunakan Hak
          </span>
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
            <PieIcon className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {persentasePartisipasi}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tingkat Kehadiran Siswa</span>
        </div>
      </div>

      {/* Visualisasi Grafik Batang Real-Time Recharts & Detail Perolehan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-800" />
              <h3 className="text-base font-bold text-slate-900">
                Grafik Batang Perolehan Suara Paslon (Real-Time)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi perolehan suara sah terkumpul:{' '}
              <strong className="text-slate-900 font-mono">{totalSuaraSah} suara</strong> ({persentasePartisipasi}% partisipasi DPT).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View switcher buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setChartView('both')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartView === 'both' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Grafik & Rincian
              </button>
              <button
                onClick={() => setChartView('chart')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartView === 'chart' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Grafik
              </button>
              <button
                onClick={() => setChartView('cards')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartView === 'cards' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Rincian
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Sync</span>
            </div>
          </div>
        </div>

        {paslonList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="font-bold text-slate-700">Belum Ada Data Pasangan Calon</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Silakan daftarkan pasangan calon Ketua & Wakil Ketua melalui menu Paslon untuk memunculkan visualisasi grafik.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. The Recharts BarChart Component */}
            {(chartView === 'both' || chartView === 'chart') && (
              <div className="w-full">
                <div className="h-[280px] sm:h-[320px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 25, right: 20, left: -10, bottom: 25 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="shortLabel"
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                      />
                      <Bar
                        dataKey="suara"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={64}
                        animationDuration={600}
                      >
                        <LabelList
                          dataKey="suara"
                          position="top"
                          formatter={(val: any) => `${val ?? 0} suara`}
                          style={{
                            fill: '#0f172a',
                            fontWeight: 700,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          }}
                        />
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={entry.color}
                            stroke={entry.suara === maxVote && maxVote > 0 ? '#10b981' : undefined}
                            strokeWidth={entry.suara === maxVote && maxVote > 0 ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate Legend Under Bar Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  {chartData.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">
                            {item.nomorUrut}
                          </span>
                          <span className="font-mono font-bold text-emerald-800 text-[11px]">
                            {item.suara} suara ({item.persentase}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.fullName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Detailed Progress Breakdown Cards */}
            {(chartView === 'both' || chartView === 'cards') && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rincian Persentase Suara Per Paslon
                  </h4>
                  {totalSuaraSah > 0 && maxVote > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-700" />
                      Unggul Sementara
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {paslonList.map((paslon, idx) => {
                    const persentase =
                      totalSuaraSah > 0
                        ? ((paslon.suaraPerolehan / totalSuaraSah) * 100).toFixed(1)
                        : '0';
                    const isLeading = paslon.suaraPerolehan === maxVote && maxVote > 0;
                    const barColor = BAR_COLORS[idx % BAR_COLORS.length];

                    return (
                      <div
                        key={paslon.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isLeading
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-6 h-6 rounded-md text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs"
                              style={{ backgroundColor: barColor }}
                            >
                              {paslon.nomorUrut}
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate">
                                {paslon.namaKetua} & {paslon.namaWakil}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {paslon.kelasKetua} & {paslon.kelasWakil}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-slate-600 font-mono tabular-nums text-xs font-medium">
                              {paslon.suaraPerolehan} suara
                            </span>
                            <span className="font-bold font-mono tabular-nums text-sm px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                              {persentase}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar with Paslon Color */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 shadow-xs"
                            style={{
                              width: `${persentase}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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
