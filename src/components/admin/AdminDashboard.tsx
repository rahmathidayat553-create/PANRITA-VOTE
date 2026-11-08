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

// Vibrant theme colors for Paslon candidate bars with emerald and orange presence
const BAR_COLORS = [
  '#f97316', // Orange
  '#10b981', // Emerald
  '#38bdf8', // Sky
  '#fbbf24', // Amber
  '#a855f7', // Purple
  '#f43f5e', // Rose
];

// Custom HUD Glassmorphism Tooltip for the Recharts Bar Chart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#021810]/95 backdrop-blur-xl border border-orange-500/40 text-white p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs font-sans min-w-[210px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
          <span className="font-mono font-bold text-orange-400 text-[11px] uppercase tracking-wider">
            {data.nomorUrut}
          </span>
          <span className="font-mono text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-400/40 font-bold">
            {data.persentase}% Suara
          </span>
        </div>
        <p className="font-bold text-white text-xs mb-1.5">
          {data.fullName}
        </p>
        <div className="flex items-center justify-between text-emerald-200/80 font-mono text-[11px] pt-1">
          <span>Perolehan Suara:</span>
          <span className="font-bold text-orange-300 text-sm">
            {data.suara} <span className="text-[10px] text-emerald-300 font-normal">suara</span>
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
      <div className="p-5 rounded-3xl bg-[#042017]/90 backdrop-blur-xl border border-emerald-500/25 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
            [ACCESS_RESTRICTED // COMMITTEE_ONLY]
          </span>
          <h2 className="text-base font-bold text-white mt-1">
            Hasil Pemilihan & Monitoring Real-Time
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            Data perolehan suara ini tersinkronisasi langsung dari database awan Firestore.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#02130c]/80 border border-emerald-500/40 text-xs font-semibold text-emerald-300 self-start sm:self-auto shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[11px]">STATUS: {pengaturan.status.toUpperCase()}</span>
        </div>
      </div>

      {/* 4 KPI Cards with 3D Hover Depth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-emerald-300/70 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total DPT</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {totalDPT}
          </div>
          <span className="text-[11px] text-emerald-300/60 mt-1 block">Pemilih Terdaftar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-orange-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(249,115,22,0.22)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-orange-300/80 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suara Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-400/30">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono tabular-nums">
            {sudahMemilihCount}
          </div>
          <span className="text-[11px] text-orange-300/70 font-medium mt-1 block">
            Telah Menggunakan Hak
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-emerald-300/70 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Belum Memilih</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-100 font-mono tabular-nums">
            {belumMemilihCount}
          </div>
          <span className="text-[11px] text-emerald-300/60 mt-1 block">Menunggu Pemilihan</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#042017]/85 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-emerald-300/70 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Partisipasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {persentasePartisipasi}%
          </div>
          <span className="text-[11px] text-emerald-300/60 mt-1 block">Tingkat Kehadiran Siswa</span>
        </div>
      </div>

      {/* Visualisasi Grafik Batang Real-Time Recharts & Detail Perolehan */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <h3 className="text-base font-bold text-white">
                Grafik Batang Perolehan Suara Paslon (Real-Time)
              </h3>
            </div>
            <p className="text-xs text-emerald-200/70 mt-0.5">
              Visualisasi perolehan suara sah terkumpul:{' '}
              <strong className="text-orange-400 font-mono">{totalSuaraSah} suara</strong> ({persentasePartisipasi}% partisipasi DPT).
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* View switcher buttons */}
            <div className="flex items-center bg-[#02130c]/80 p-1 rounded-xl text-xs font-semibold text-emerald-200/80 border border-emerald-500/20">
              <button
                onClick={() => setChartView('both')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'both'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-950/40'
                    : 'hover:text-white'
                }`}
              >
                Grafik & Rincian
              </button>
              <button
                onClick={() => setChartView('chart')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'chart'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-950/40'
                    : 'hover:text-white'
                }`}
              >
                Grafik
              </button>
              <button
                onClick={() => setChartView('cards')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'cards'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-950/40'
                    : 'hover:text-white'
                }`}
              >
                Rincian
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-semibold font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">LIVE SYNC</span>
            </div>
          </div>
        </div>

        {paslonList.length === 0 ? (
          <div className="py-12 text-center text-emerald-300/60 text-xs space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto text-emerald-500/40 stroke-1" />
            <p className="font-bold text-white text-sm">Belum Ada Data Pasangan Calon</p>
            <p className="text-emerald-300/70 max-w-sm mx-auto">
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
                        stroke="rgba(16, 185, 129, 0.12)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="shortLabel"
                        tick={{ fill: '#a7f3d0', fontSize: 12, fontWeight: 700 }}
                        axisLine={{ stroke: 'rgba(16, 185, 129, 0.3)' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#6ee7b7', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(16, 185, 129, 0.3)' }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
                      />
                      <Bar
                        dataKey="suara"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={64}
                        animationDuration={600}
                      >
                        <LabelList
                          dataKey="suara"
                          position="top"
                          formatter={(val: any) => `${val ?? 0} suara`}
                          style={{
                            fill: '#fbbf24',
                            fontWeight: 700,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          }}
                        />
                        {chartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={entry.color}
                            stroke={entry.suara === maxVote && maxVote > 0 ? '#f97316' : undefined}
                            strokeWidth={entry.suara === maxVote && maxVote > 0 ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate Legend Under Bar Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-emerald-500/20">
                  {chartData.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#02130c]/70 border border-emerald-500/20 text-xs hover:border-orange-500/40 transition-colors"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate">
                            {item.nomorUrut}
                          </span>
                          <span className="font-mono font-bold text-orange-400 text-[11px]">
                            {item.suara} suara ({item.persentase}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-300/70 truncate">
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
                  <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                    Rincian Persentase Suara Per Paslon
                  </h4>
                  {totalSuaraSah > 0 && maxVote > 0 && (
                    <span className="text-[11px] font-semibold text-orange-300 bg-orange-500/20 px-2.5 py-0.5 rounded-md border border-orange-400/40 flex items-center gap-1 font-mono">
                      <Award className="w-3 h-3 text-orange-400" />
                      UNGGUL SEMENTARA
                    </span>
                  )}
                </div>

                <div className="space-y-3">
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
                        className={`p-4 rounded-2xl border transition-all ${
                          isLeading
                            ? 'bg-[#021810] border-orange-500/40 shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
                            : 'bg-[#02130c]/70 border-emerald-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md font-mono"
                              style={{ backgroundColor: barColor }}
                            >
                              {paslon.nomorUrut}
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-white block truncate text-xs sm:text-sm">
                                {paslon.namaKetua} & {paslon.namaWakil}
                              </span>
                              <span className="text-[10px] text-emerald-300/60">
                                {paslon.kelasKetua} · {paslon.kelasWakil}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-emerald-200/80 font-mono tabular-nums text-xs">
                              {paslon.suaraPerolehan} suara
                            </span>
                            <span className="font-bold font-mono tabular-nums text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-[#042017] text-orange-400 border border-emerald-500/30">
                              {persentase}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar with Paslon Color */}
                        <div className="w-full h-3 bg-[#02130c] rounded-full overflow-hidden border border-emerald-500/20">
                          <div
                            className="h-full rounded-full transition-all duration-500 shadow-md"
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
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Aktivitas Terbaru Sistem</span>
        </h3>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-4 text-center text-emerald-300/60 text-xs">
              Belum ada catatan aktivitas di database.
            </div>
          ) : (
            logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-2.5 border-b border-emerald-500/15 last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-100 font-medium">{log.aksi}</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-300/60 font-mono text-[11px] shrink-0">
                  <span className="bg-[#02130c]/80 px-2 py-0.5 rounded border border-emerald-500/20">{log.pengguna}</span>
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
