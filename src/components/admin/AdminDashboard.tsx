import React, { useState, useEffect } from 'react';
import { Paslon, Pemilih, PengaturanPemilihan, LogAktivitas } from '../../data/dummy';
import { ToastData } from '../Toast';
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
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  X,
  ShieldAlert,
  Eye,
  Check,
  CheckCircle2,
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
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  paslonList: Paslon[];
  pemilihList: Pemilih[];
  pengaturan: PengaturanPemilihan;
  logs: LogAktivitas[];
  onUnlockHasilSuara?: (pin: string) => Promise<{ success: boolean; message: string; remainingQuota?: number; expiresAt?: string }>;
  onLockHasilSuara?: () => Promise<void>;
  onShowToast?: (data: ToastData) => void;
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

// Custom HUD Glassmorphism Tooltip for the Recharts Candidate Bar Chart
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

// Custom Tooltip for Voter Turnout Chart (Sudah Memilih vs Total DPT)
const CustomParticipationTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#021810]/95 backdrop-blur-xl border border-emerald-500/40 text-white p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs font-sans min-w-[210px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
          <span className="font-bold text-white text-[12px]">
            {data.name}
          </span>
          <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 font-bold">
            {data.persentase}% DPT
          </span>
        </div>
        <div className="flex items-center justify-between text-emerald-200/80 font-mono text-[11px] pt-1">
          <span>Jumlah Pemilih:</span>
          <span className="font-bold text-orange-400 text-sm">
            {data.jumlah} <span className="text-[10px] text-emerald-300 font-normal">orang</span>
          </span>
        </div>
        {data.sublabel && (
          <p className="text-[10px] text-emerald-300/60 mt-1.5 italic">
            {data.sublabel}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Grouped Category Chart
const CustomGroupedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#021810]/95 backdrop-blur-xl border border-emerald-500/40 text-white p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs font-sans min-w-[210px]">
        <div className="font-bold text-white text-[12px] pb-1.5 border-b border-white/10 mb-2">
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between py-1 font-mono text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">
              {entry.value} orang
            </span>
          </div>
        ))}
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
  onUnlockHasilSuara,
  onLockHasilSuara,
  onShowToast,
}) => {
  const [chartView, setChartView] = useState<'both' | 'chart' | 'cards'>('both');
  const [participationMode, setParticipationMode] = useState<'comparison' | 'category'>('comparison');

  // Metrik Makro Partisipasi Pemilih
  const totalDPT = pemilihList.length;
  const sudahMemilihCount = pemilihList.filter((p) => p.status === 'sudah').length;
  const belumMemilihCount = totalDPT - sudahMemilihCount;
  const persentasePartisipasi =
    totalDPT > 0 ? Math.round((sudahMemilihCount / totalDPT) * 100) : 0;
  const totalSuaraSah = paslonList.reduce((acc, curr) => acc + curr.suaraPerolehan, 0);

  // Segmentasi Pemilih: Siswa vs Guru/Staf
  const totalSiswa = pemilihList.filter((p) => p.jenis === 'siswa').length;
  const siswaSudah = pemilihList.filter((p) => p.jenis === 'siswa' && p.status === 'sudah').length;
  const siswaPersen = totalSiswa > 0 ? Math.round((siswaSudah / totalSiswa) * 100) : 0;

  const totalGuru = pemilihList.filter((p) => p.jenis === 'guru').length;
  const guruSudah = pemilihList.filter((p) => p.jenis === 'guru' && p.status === 'sudah').length;
  const guruPersen = totalGuru > 0 ? Math.round((guruSudah / totalGuru) * 100) : 0;

  // Data 1: Komparasi Utama Sudah Memilih vs Total Target DPT vs Belum Memilih
  const participationChartData = [
    {
      name: 'Sudah Memilih',
      shortLabel: 'Sudah Memilih',
      jumlah: sudahMemilihCount,
      persentase: persentasePartisipasi,
      color: '#f97316', // Radiant orange
      sublabel: 'Hak suara sah telah dicoblos di bilik',
    },
    {
      name: 'Belum Memilih',
      shortLabel: 'Belum Memilih',
      jumlah: belumMemilihCount,
      persentase: totalDPT > 0 ? Math.round((belumMemilihCount / totalDPT) * 100) : 0,
      color: '#10b981', // Emerald
      sublabel: 'Pemilih menunggu giliran ke TPS',
    },
    {
      name: 'Total Target DPT',
      shortLabel: 'Total Target DPT',
      jumlah: totalDPT,
      persentase: 100,
      color: '#38bdf8', // Sky cyan
      sublabel: 'Total seluruh pemilih terdaftar resmi',
    },
  ];

  // Data 2: Komparasi Berdasarkan Kategori Siswa vs Guru/Staf
  const categoryChartData = [
    {
      kategori: 'Seluruh DPT',
      'Sudah Memilih': sudahMemilihCount,
      'Total DPT': totalDPT,
      persen: persentasePartisipasi,
    },
    {
      kategori: 'Pemilih Siswa',
      'Sudah Memilih': siswaSudah,
      'Total DPT': totalSiswa,
      persen: siswaPersen,
    },
    {
      kategori: 'Pemilih Guru & Staf',
      'Sudah Memilih': guruSudah,
      'Total DPT': totalGuru,
      persen: guruPersen,
    },
  ];

  // Status Kerahasiaan & Intip Suara 2 Menit / Kuota 2x
  const isElectionActive = pengaturan.status === 'aktif';
  const expiresAtMs = pengaturan.intipAktifSampai ? Date.parse(pengaturan.intipAktifSampai) : 0;
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isPeekActive = isElectionActive && expiresAtMs > nowMs;
  const isResultsLocked = isElectionActive && !isPeekActive;
  const kuotaIntip = typeof pengaturan.kuotaIntipSuara === 'number' ? pengaturan.kuotaIntipSuara : 2;

  // Sisa waktu dalam detik
  const secondsRemaining = isPeekActive ? Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000)) : 0;

  // Auto lock callback when timer hits 0
  useEffect(() => {
    if (isElectionActive && expiresAtMs > 0 && nowMs >= expiresAtMs && onLockHasilSuara) {
      onLockHasilSuara();
    }
  }, [isElectionActive, expiresAtMs, nowMs, onLockHasilSuara]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // State Modal PIN Khusus
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOpenPinModal = () => {
    if (kuotaIntip <= 0) {
      onShowToast?.({
        type: 'warning',
        title: 'Batas Kuota Habis',
        message: 'Kesempatan intip hasil suara telah terpakai 2 kali. Hasil akan terbuka penuh setelah pemilihan ditutup.',
        code: '[QUOTA_DEPLETED // 0x00]',
        duration: 4000,
      });
      return;
    }
    setPinInput('');
    setPinError(null);
    setIsPinModalOpen(true);
  };

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length !== 6) {
      setPinError('PIN khusus harus terdiri dari 6 digit angka.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }

    if (!onUnlockHasilSuara) return;

    setIsVerifying(true);
    setPinError(null);

    try {
      const res = await onUnlockHasilSuara(pinInput.trim());
      if (res.success) {
        setIsPinModalOpen(false);
        setPinInput('');
        onShowToast?.({
          type: 'success',
          title: 'Hasil Suara Terbuka (2 Menit)',
          message: res.message,
          code: '[RESULTS_UNLOCKED // 120S_ACTIVE]',
          duration: 4000,
        });
      } else {
        setPinError(res.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 700);
        onShowToast?.({
          type: 'error',
          title: 'Gagal Membuka Kunci',
          message: res.message,
          code: '[PIN_AUTH_FAILED]',
          duration: 4000,
        });
      }
    } catch (err: any) {
      setPinError('Terjadi kesalahan saat memverifikasi PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualLock = async () => {
    if (onLockHasilSuara) {
      await onLockHasilSuara();
      onShowToast?.({
        type: 'info',
        title: 'Hasil Suara Dikunci Kembali',
        message: 'Tampilan perolehan suara paslon telah berhasil ditutup dan dirahasiakan kembali.',
        code: '[RESULTS_LOCKED // SHIELD_ACTIVE]',
        duration: 3000,
      });
    }
  };

  // Format data for Recharts Candidate BarChart
  const candidateChartData = paslonList.map((paslon, idx) => {
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
            {isElectionActive
              ? 'Pemilihan sedang berlangsung. Sesuai kebijakan Luber Jurdil, perolehan suara paslon dirahasiakan kecuali bagi panitia dengan PIN khusus (2 menit & kuota 2x).'
              : 'Data perolehan suara dan progres partisipasi DPT tersinkronisasi langsung dari database awan Firestore.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#02130c]/80 border border-emerald-500/40 text-xs font-semibold text-emerald-300 shadow-inner">
            <span
              className={`w-2 h-2 rounded-full ${
                pengaturan.status === 'aktif'
                  ? 'bg-emerald-400 animate-pulse'
                  : pengaturan.status === 'ditutup'
                  ? 'bg-rose-400'
                  : 'bg-amber-400'
              }`}
            ></span>
            <span className="font-mono text-[11px]">STATUS: {pengaturan.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards with 3D Hover Depth (TETAP TERLIHAT PENUH SESUAI ASAS TRANSPARANSI TPS) */}
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

      {/* 1. VISUALISASI DATA RECHARTS: PROGRES PARTISIPASI REAL-TIME (SUDAH MEMILIH VS TOTAL DPT) */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-orange-400" />
              <h3 className="text-base font-bold text-white">
                Grafik Partisipasi: Pemilih Sudah Memilih vs Total DPT
              </h3>
            </div>
            <p className="text-xs text-emerald-200/70 mt-0.5">
              Monitoring dinamika kehadiran pemilih secara real-time:{' '}
              <strong className="text-orange-400 font-mono">{sudahMemilihCount} pemilih</strong> dari total{' '}
              <strong className="text-white font-mono">{totalDPT} DPT</strong> telah memberikan suara ({persentasePartisipasi}%).
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Switcher Mode: Komparasi Utama vs Kategori Siswa/Guru */}
            <div className="flex items-center bg-[#02130c]/80 p-1 rounded-xl text-xs font-semibold text-emerald-200/80 border border-emerald-500/20">
              <button
                onClick={() => setParticipationMode('comparison')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  participationMode === 'comparison'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-950/40'
                    : 'hover:text-white'
                }`}
              >
                Perbandingan Utama
              </button>
              <button
                onClick={() => setParticipationMode('category')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  participationMode === 'category'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-950/40'
                    : 'hover:text-white'
                }`}
              >
                Siswa vs Guru
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-orange-300 bg-orange-500/15 px-3 py-1.5 rounded-xl border border-orange-400/30 font-semibold font-mono">
              <span>{persentasePartisipasi}% TERCAPAI</span>
            </div>
          </div>
        </div>

        {totalDPT === 0 ? (
          <div className="py-10 text-center text-emerald-300/60 text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-emerald-500/40 stroke-1" />
            <p className="font-bold text-white text-sm">Belum Ada Data Pemilih (DPT)</p>
            <p className="text-emerald-300/70 max-w-sm mx-auto">
              Silakan tambahkan atau import data DPT siswa dan guru untuk melihat grafik batang partisipasi.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recharts BarChart View */}
            {participationMode === 'comparison' ? (
              <div className="w-full">
                <div className="h-[260px] sm:h-[300px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={participationChartData}
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
                        content={<CustomParticipationTooltip />}
                        cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
                      />
                      <Bar
                        dataKey="jumlah"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={70}
                        animationDuration={600}
                      >
                        <LabelList
                          dataKey="jumlah"
                          position="top"
                          formatter={(val: any) => `${val ?? 0} pemilih`}
                          style={{
                            fill: '#fbbf24',
                            fontWeight: 700,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          }}
                        />
                        {participationChartData.map((entry, index) => (
                          <Cell
                            key={`part-cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="h-[260px] sm:h-[300px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 25, right: 20, left: -10, bottom: 25 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(16, 185, 129, 0.12)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="kategori"
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
                        content={<CustomGroupedTooltip />}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: '10px' }}
                      />
                      <Bar
                        dataKey="Sudah Memilih"
                        fill="#f97316"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={45}
                        animationDuration={600}
                      >
                        <LabelList
                          dataKey="Sudah Memilih"
                          position="top"
                          formatter={(val: any) => `${val}`}
                          style={{
                            fill: '#f97316',
                            fontWeight: 700,
                            fontSize: 10,
                            fontFamily: 'monospace',
                          }}
                        />
                      </Bar>
                      <Bar
                        dataKey="Total DPT"
                        fill="#38bdf8"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={45}
                        animationDuration={600}
                      >
                        <LabelList
                          dataKey="Total DPT"
                          position="top"
                          formatter={(val: any) => `${val}`}
                          style={{
                            fill: '#38bdf8',
                            fontWeight: 700,
                            fontSize: 10,
                            fontFamily: 'monospace',
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Info Card Strip di Bawah Grafik Partisipasi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-500/20">
              <div className="p-3 bg-[#02130c]/70 rounded-2xl border border-orange-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 block">
                    SUDAH MEMILIH
                  </span>
                  <span className="text-lg font-black text-white font-mono">{sudahMemilihCount} <span className="text-xs text-orange-300 font-normal">pemilih</span></span>
                </div>
                <span className="text-sm font-bold font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-400/30">
                  {persentasePartisipasi}%
                </span>
              </div>

              <div className="p-3 bg-[#02130c]/70 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                    PARTISIPASI SISWA
                  </span>
                  <span className="text-lg font-black text-white font-mono">{siswaSudah} / {totalSiswa}</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-400/30">
                  {siswaPersen}%
                </span>
              </div>

              <div className="p-3 bg-[#02130c]/70 rounded-2xl border border-sky-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block">
                    PARTISIPASI GURU & STAF
                  </span>
                  <span className="text-lg font-black text-white font-mono">{guruSudah} / {totalGuru}</span>
                </div>
                <span className="text-sm font-bold font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-400/30">
                  {guruPersen}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. VISUALISASI GRAFIK BATANG & RINCIAN SUARA PASLON (DILENGKAPI FITUR SENSOR KERAHASIAAN) */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] relative overflow-hidden">
        {/* Active Countdown Timer Header Banner saat Sesi Intip Suara Berjalan */}
        {isPeekActive && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-950/90 via-[#042017] to-amber-950/80 border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Unlock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider font-mono">
                    SESI INTIP HASIL SUARA AKTIF
                  </span>
                  <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-400/30">
                    Sisa Kuota: {kuotaIntip}/2
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Tampilan hasil paslon akan otomatis terkunci kembali setelah waktu 2 menit habis.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Countdown Digits */}
              <div className="px-3.5 py-1.5 rounded-xl bg-[#02130c] border border-orange-400/50 text-white font-mono font-black text-base flex items-center gap-2 shadow-inner">
                <Clock className="w-4 h-4 text-orange-400 animate-spin" />
                <span className="text-orange-300 tabular-nums">{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={handleManualLock}
                className="px-3 py-1.5 bg-[#02130c]/80 hover:bg-rose-950/70 text-emerald-200 hover:text-white text-xs font-semibold rounded-xl border border-emerald-500/30 hover:border-rose-500/40 transition-all cursor-pointer"
              >
                Kunci Sekarang
              </button>
            </div>
          </div>
        )}

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
            {!isResultsLocked && (
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
            )}

            <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-semibold font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">LIVE SYNC</span>
            </div>
          </div>
        </div>

        {/* KONDISI 1: HASIL DIKUNCI / DIRAHASIAKAN SELAMA PEMILIHAN BERLANGSUNG */}
        {isResultsLocked ? (
          <div className="py-12 px-4 sm:px-8 text-center bg-[#02130c]/80 rounded-2xl border-2 border-dashed border-emerald-500/30 flex flex-col items-center justify-center space-y-4 shadow-inner">
            <div className="w-16 h-16 rounded-3xl bg-orange-500/15 border border-orange-400/40 text-orange-400 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.3)]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                [HASIL_PASLON_DIRAHASIAKAN // SESUAI_KEBIJAKAN_TPS]
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white">
                Perolehan Suara Paslon Disembunyikan
              </h4>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Demi menjaga netralitas dan kerahasiaan pemilihan yang sedang berlangsung, perincian suara paslon disensor. Seluruh perolehan suara sah akan otomatis terbuka penuh saat status pemilihan disetel ke <strong>"Ditutup"</strong>.
              </p>
            </div>

            {/* Indikator Kuota & Tombol Buka Kunci */}
            <div className="p-4 rounded-2xl bg-[#042017] border border-emerald-500/30 w-full max-w-md text-xs space-y-3">
              <div className="flex items-center justify-between text-emerald-200/90">
                <span className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                  Kesempatan Intip Panitia:
                </span>
                <span className="font-mono font-bold text-orange-400">
                  {kuotaIntip} / 2 Kali
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#02130c] rounded-full overflow-hidden border border-emerald-500/20">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                  style={{ width: `${(kuotaIntip / 2) * 100}%` }}
                />
              </div>

              {kuotaIntip > 0 ? (
                !isPinModalOpen ? (
                  <button
                    type="button"
                    onClick={handleOpenPinModal}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Buka Kunci Sementara (2 Menit)</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleSubmitPin}
                    className={`space-y-3 pt-1 ${isShaking ? 'animate-earthquake' : ''}`}
                  >
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                      Masukkan <strong className="text-orange-400">PIN 6 digit khusus</strong> untuk membuka suara selama 2 menit:
                    </p>

                    <input
                      type="password"
                      maxLength={6}
                      autoFocus
                      placeholder="6 Digit PIN"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (pinError) setPinError(null);
                      }}
                      className="w-full px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest rounded-xl border border-orange-500/40 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-[#02130c] text-orange-400 shadow-inner"
                    />

                    {pinError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{pinError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPinModalOpen(false);
                          setPinError(null);
                        }}
                        className="py-2.5 px-3 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-[#02130c] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={pinInput.length !== 6 || isVerifying}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs shadow-md disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer border border-orange-400/30"
                      >
                        {isVerifying ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Memverifikasi...</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Buka Kunci</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/30 text-rose-300 text-[11px] font-medium leading-relaxed">
                  Batas kuota 2x intip hasil suara telah habis. Hasil resmi paslon akan dibuka otomatis setelah pemilihan resmi ditutup oleh panitia.
                </div>
              )}
            </div>
          </div>
        ) : paslonList.length === 0 ? (
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
                      data={candidateChartData}
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
                        {candidateChartData.map((entry) => (
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
                  {candidateChartData.map((item) => (
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
