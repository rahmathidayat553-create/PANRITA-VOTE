import React, { useState, useEffect } from 'react';
import { Paslon, PengaturanPemilihan } from '../../data/dummy';
import { ToastData } from '../Toast';
import {
  BarChart3,
  Trophy,
  ShieldCheck,
  AlertCircle,
  Lock,
  Unlock,
  KeyRound,
  Clock,
  X,
  AlertTriangle,
} from 'lucide-react';

interface AdminRekapitulasiProps {
  paslonList: Paslon[];
  pengaturan?: PengaturanPemilihan;
  onUnlockHasilSuara?: (pin: string) => Promise<{ success: boolean; message: string; remainingQuota?: number; expiresAt?: string }>;
  onLockHasilSuara?: () => Promise<void>;
  onShowToast?: (data: ToastData) => void;
}

export const AdminRekapitulasi: React.FC<AdminRekapitulasiProps> = ({
  paslonList,
  pengaturan,
  onUnlockHasilSuara,
  onLockHasilSuara,
  onShowToast,
}) => {
  const totalSuara = paslonList.reduce((acc, curr) => acc + curr.suaraPerolehan, 0);

  // Status Kerahasiaan Pemilihan
  const isElectionActive = pengaturan?.status === 'aktif';
  const expiresAtMs = pengaturan?.intipAktifSampai ? Date.parse(pengaturan.intipAktifSampai) : 0;
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isPeekActive = isElectionActive && expiresAtMs > nowMs;
  const isResultsLocked = isElectionActive && !isPeekActive;
  const kuotaIntip = typeof pengaturan?.kuotaIntipSuara === 'number' ? pengaturan.kuotaIntipSuara : 2;
  const secondsRemaining = isPeekActive ? Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000)) : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // State PIN Modal
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
        message: 'Kesempatan intip hasil suara telah terpakai 2 kali. Hasil resmi akan terbuka setelah pemilihan ditutup.',
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
          title: 'Hasil Rekapitulasi Terbuka (2 Menit)',
          message: res.message,
          code: '[REKAP_UNLOCKED // 120S_ACTIVE]',
          duration: 4000,
        });
      } else {
        setPinError(res.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 700);
      }
    } catch (err: any) {
      setPinError('Terjadi kesalahan verifikasi PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

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

      {/* Summary Stat Box (TETAP TERBUKA PENUH) */}
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

      {/* Official Recapitulation Table / Locked Shield */}
      <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {/* Active Peek Countdown Banner */}
        {isPeekActive && (
          <div className="p-3.5 bg-gradient-to-r from-orange-950 via-[#042017] to-amber-950 border-b border-orange-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-orange-300 font-mono font-bold">
              <Unlock className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>SESI INTIP AKTIF: {formatTimer(secondsRemaining)}</span>
              <span className="text-emerald-400/80 hidden sm:inline">(Sisa Kuota: {kuotaIntip}/2)</span>
            </div>
            {onLockHasilSuara && (
              <button
                type="button"
                onClick={onLockHasilSuara}
                className="px-2.5 py-1 bg-[#02130c] hover:bg-rose-950/70 text-emerald-200 hover:text-white rounded-lg border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
              >
                Kunci Kembali
              </button>
            )}
          </div>
        )}

        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">
              Tabel Rincian Perolehan Suara Pasangan Calon
            </h3>
          </div>
        </div>

        {isResultsLocked ? (
          <div className="py-12 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-400/40 text-orange-400 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.25)]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-white">
                Rincian Perolehan Suara Paslon Dirahasiakan
              </h4>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Hasil suara masing-masing paslon terkunci selama pemilihan berlangsung demi kerahasiaan pemilihan.
              </p>
            </div>

            <div className={`p-4 sm:p-5 bg-[#02130c] rounded-2xl border border-emerald-500/25 max-w-md w-full space-y-3 text-xs ${isShaking ? 'animate-earthquake border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]' : ''}`}>
              <div className="flex items-center justify-between text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                  Kesempatan Intip Panitia:
                </span>
                <span className="font-mono font-bold text-orange-400">{kuotaIntip} / 2 Kali</span>
              </div>

              {kuotaIntip > 0 ? (
                !isPinModalOpen ? (
                  <button
                    type="button"
                    onClick={handleOpenPinModal}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-orange-400/40"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Kunci (PIN 6 Digit)</span>
                  </button>
                ) : (
                  <form onSubmit={handleSubmitPin} className="space-y-3 pt-1">
                    <p className="text-[11px] text-emerald-300/80">
                      Masukkan PIN 6 digit panitia (Durasi buka: 2 menit):
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
                      className="w-full px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest rounded-xl border border-orange-500/40 focus:ring-2 focus:ring-orange-500 bg-[#042017] text-orange-400"
                    />

                    {pinError && (
                      <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-500/40 text-rose-200 text-[11px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
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
                        className="py-2 px-3 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-[#042017] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={pinInput.length !== 6 || isVerifying}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs shadow-md disabled:opacity-40 cursor-pointer"
                      >
                        {isVerifying ? 'Memverifikasi...' : 'Buka Kunci'}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-[11px]">
                  Batas kuota 2x habis. Hasil akan terbuka setelah pemilihan ditutup.
                </div>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300">Perhatian Panitia:</strong> Sesuai ketentuan, data perolehan suara masing-masing paslon bersifat tertutup selama masa pencoblosan dan hanya dipublikasikan secara resmi setelah waktu pemungutan suara ditutup oleh pihak sekolah.
        </div>
      </div>
    </div>
  );
};
