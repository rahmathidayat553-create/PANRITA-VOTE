import React, { useState, useRef } from 'react';
import {
  PengaturanPemilihan,
  Paslon,
  Pemilih,
  LogAktivitas,
  ElectionBackup,
} from '../../data/dummy';
import { SafeImage } from '../SafeImage';
import { ToastData } from '../Toast';
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Link,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Database,
  HardDrive,
  FileText,
  X,
  AlertOctagon,
  ShieldAlert,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AdminPemilihanProps {
  pengaturan: PengaturanPemilihan;
  paslonList?: Paslon[];
  pemilihList?: Pemilih[];
  logs?: LogAktivitas[];
  onUpdatePengaturan: (newSettings: PengaturanPemilihan) => void;
  onResetVotes?: () => Promise<void>;
  onResetFactory?: () => Promise<void>;
  onRestoreData?: (backup: ElectionBackup) => Promise<void>;
  onShowToast?: (data: ToastData) => void;
}

type TabKey = 'umum' | 'backup' | 'reset';

export const AdminPemilihan: React.FC<AdminPemilihanProps> = ({
  pengaturan,
  paslonList = [],
  pemilihList = [],
  logs = [],
  onUpdatePengaturan,
  onResetVotes,
  onResetFactory,
  onRestoreData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('umum');
  const [form, setForm] = useState<PengaturanPemilihan>({ ...pengaturan });
  const [isSaved, setIsSaved] = useState(false);

  // Backup & Restore states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedBackup, setParsedBackup] = useState<ElectionBackup | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Reset Modal states
  const [resetModalType, setResetModalType] = useState<'votes' | 'factory' | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [isProcessingReset, setIsProcessingReset] = useState(false);

  // Submit General Settings
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePengaturan(form);
    setIsSaved(true);
    onShowToast?.({
      type: 'success',
      title: 'Pengaturan Disimpan',
      message: 'Parameter pemilihan telah berhasil diperbarui di database.',
      code: '[SYS_CONFIG // SYNCED]',
      duration: 3000,
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  // 1. Ekspor & Unduh Backup JSON
  const handleExportBackup = () => {
    try {
      const nowStr = new Date().toISOString();
      const backupData: ElectionBackup = {
        version: '1.0',
        app: 'PanritaVote-SMKN9Bulukumba',
        exportedAt: nowStr,
        sekolah: pengaturan.sekolah,
        pengaturan: { ...pengaturan },
        paslonList: [...paslonList],
        pemilihList: [...pemilihList],
        logs: [...logs],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const safeDate = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `backup_panritavote_smkn9_${safeDate}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onShowToast?.({
        type: 'success',
        title: 'Cadangan Berhasil Diunduh',
        message: `Berkas cadangan JSON berhasil diunduh (${paslonList.length} paslon, ${pemilihList.length} pemilih).`,
        code: '[BACKUP_DOWNLOAD // OK]',
        duration: 3500,
      });
    } catch (err: any) {
      console.error('Gagal unduh backup:', err);
      onShowToast?.({
        type: 'error',
        title: 'Gagal Membuat Cadangan',
        message: 'Terjadi kesalahan saat memproses data cadangan JSON.',
        code: '[BACKUP_EXPORT_ERR]',
        duration: 3500,
      });
    }
  };

  // 2. Baca File Restore JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);

        if (!json.version || !json.pengaturan || !Array.isArray(json.paslonList) || !Array.isArray(json.pemilihList)) {
          throw new Error('Format berkas tidak sesuai standar cadangan PanritaVote.');
        }

        setParsedBackup(json as ElectionBackup);
        onShowToast?.({
          type: 'info',
          title: 'Berkas Cadangan Terbaca',
          message: `Ditemukan ${json.paslonList.length} paslon & ${json.pemilihList.length} DPT. Tinjau dan klik Pulihkan.`,
          code: '[BACKUP_PARSED // READY]',
          duration: 3500,
        });
      } catch (err: any) {
        setParsedBackup(null);
        onShowToast?.({
          type: 'error',
          title: 'Berkas Cadangan Tidak Valid',
          message: err.message || 'Gagal membaca berkas JSON.',
          code: '[BACKUP_INVALID_FORMAT]',
          duration: 4000,
        });
      }
    };
    reader.readAsText(file);
  };

  // 3. Eksekusi Restore
  const handleExecuteRestore = async () => {
    if (!parsedBackup || !onRestoreData) return;
    setIsRestoring(true);
    try {
      await onRestoreData(parsedBackup);
      setParsedBackup(null);
      setRestoreFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Gagal restore:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  // 4. Eksekusi Reset
  const handleExecuteReset = async () => {
    if (confirmInput.trim().toUpperCase() !== 'RESET') {
      onShowToast?.({
        type: 'warning',
        title: 'Konfirmasi Belum Sesuai',
        message: 'Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi tindakan.',
        code: '[CONFIRMATION_MISMATCH]',
        duration: 3000,
      });
      return;
    }

    setIsProcessingReset(true);
    try {
      if (resetModalType === 'votes' && onResetVotes) {
        await onResetVotes();
      } else if (resetModalType === 'factory' && onResetFactory) {
        await onResetFactory();
      }
      setResetModalType(null);
      setConfirmInput('');
    } catch (err: any) {
      console.error('Gagal reset:', err);
    } finally {
      setIsProcessingReset(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('umum')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'umum'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-950/40 border border-orange-400/40'
              : 'bg-[#042017]/70 text-emerald-200/80 hover:text-white hover:bg-emerald-900/50 border border-emerald-500/20'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Umum</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-950/40 border border-orange-400/40'
              : 'bg-[#042017]/70 text-emerald-200/80 hover:text-white hover:bg-emerald-900/50 border border-emerald-500/20'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Backup & Restore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reset')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reset'
              ? 'bg-rose-700 text-white shadow-lg shadow-rose-950/40 border border-rose-500/40'
              : 'bg-[#042017]/70 text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-rose-500/20'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Reset Data (Zona Bahaya)</span>
        </button>
      </div>

      {/* TAB 1: PENGATURAN UMUM DENGAN GAYA DOCK SAMPING */}
      {activeTab === 'umum' && (
        <form onSubmit={handleSubmit} className="animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Form Fields */}
            <div className="lg:col-span-8 bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-400" />
                    <span>Parameter Identitas & Pemilihan</span>
                  </h2>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    Konfigurasi judul, nama sekolah, jadwal, logo, dan status bilik suara.
                  </p>
                </div>
                {isSaved && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-400/40 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tersimpan</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                    Judul Pemilihan
                  </label>
                  <input
                    type="text"
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/70 text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                    Subjudul / Periode
                  </label>
                  <input
                    type="text"
                    value={form.subjudul}
                    onChange={(e) => setForm({ ...form, subjudul: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/70 text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={form.sekolah}
                    onChange={(e) => setForm({ ...form, sekolah: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/70 text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                    Status Pemilihan
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'aktif' | 'ditutup' | 'persiapan';
                      setForm({
                        ...form,
                        status: newStatus,
                      });
                      onShowToast?.({
                        type: newStatus === 'aktif' ? 'success' : 'warning',
                        title: `Status Disetel: ${newStatus.toUpperCase()}`,
                        message: `Bilik suara disetel ke "${newStatus}". Klik Simpan Pengaturan di samping untuk menerapkan ke Firestore.`,
                        code: '[SYS_STATUS // PENDING_SAVE]',
                        duration: 3000,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/90 text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="aktif">Sedang Berlangsung (Aktif)</option>
                    <option value="persiapan">Tahap Persiapan (Belum Dibuka)</option>
                    <option value="ditutup">Pemilihan Ditutup</option>
                  </select>
                </div>
              </div>

              {/* Logo URL Input with Live SafeImage Preview */}
              <div className="p-4 rounded-2xl bg-[#02130c]/60 border border-emerald-500/25">
                <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                  Link URL Logo Sekolah (Tautan HTTPS)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      value={form.logoUrl}
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                      placeholder="https://domain.com/logo.png"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-xs sm:text-sm font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                    />
                    <Link className="w-4 h-4 text-emerald-500/60 absolute left-3 top-3" />
                  </div>

                  {/* Preview Box */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-emerald-300/70">Pratinjau:</span>
                    <div className="w-12 h-12 rounded-xl border border-emerald-500/40 bg-[#021810] p-1 flex items-center justify-center overflow-hidden shadow-inner">
                      <SafeImage
                        src={form.logoUrl}
                        alt="Logo SMKN 9 Bulukumba"
                        fallbackInitial="9B"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-300/60 mt-2">
                  Tautan gambar publik berprotokol HTTPS langsung ditampilkan tanpa penyimpanan lokal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                    Waktu Mulai Pemilihan
                  </label>
                  <input
                    type="text"
                    value={form.tanggalMulai}
                    onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/70 text-white text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                    Waktu Selesai Pemilihan
                  </label>
                  <input
                    type="text"
                    value={form.tanggalSelesai}
                    onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/70 text-white text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                  Token Khusus Admin / Panitia
                </label>
                <input
                  type="text"
                  value={form.tokenAdmin}
                  onChange={(e) => setForm({ ...form, tokenAdmin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 font-mono text-sm uppercase font-bold text-orange-400 bg-[#02130c]/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                />
                <p className="text-[11px] text-emerald-300/60 mt-1">
                  Ketik token ini pada bilik suara publik (default: 99999) untuk langsung membuka portal login panitia.
                </p>
              </div>
            </div>

            {/* Kolom Kanan: Sticky Sidebar Action Dock (Gaya Form Menyamping) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-[#042017]/90 backdrop-blur-xl rounded-3xl border border-emerald-500/25 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                  [ACTION_DOCK // SYSTEM_CONFIG]
                </span>

                <button
                  type="submit"
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...pengaturan })}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-[#02130c]/60 hover:bg-emerald-950 text-emerald-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Batal / Reset Nilai Awal
                </button>

                <div className="pt-3 border-t border-emerald-500/20 text-xs space-y-2 text-emerald-200/70">
                  <div className="flex items-center justify-between">
                    <span>Status Saat Ini:</span>
                    <span className="font-mono font-bold text-orange-400 uppercase">{form.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DPT Aktif:</span>
                    <span className="font-mono font-bold text-white">{pemilihList.length} Pemilih</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Paslon Terdaftar:</span>
                    <span className="font-mono font-bold text-white">{paslonList.length} Pasangan</span>
                  </div>
                </div>
              </div>

              {/* Status Ringkas Keamanan */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 text-xs text-emerald-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Perubahan pengaturan tersimpan secara instan di Firebase Firestore dan akan langsung memengaruhi seluruh perangkat bilik suara.
                </span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card Ekspor Backup */}
          <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                  <Download className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Cadangkan Data Sistem (Backup JSON)
                  </h3>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    Unduh snapshot lengkap database saat ini ke berkas JSON lokal untuk arsip pengawasan dan audit.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/40 transition-all flex items-center gap-2 cursor-pointer shrink-0 border border-orange-400/40"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan (.JSON)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3.5 bg-[#02130c]/70 rounded-2xl border border-emerald-500/20">
                <span className="text-emerald-300/60 block text-[11px]">Paslon Terdaftar</span>
                <span className="font-mono font-bold text-white text-base mt-0.5 block">{paslonList.length} paslon</span>
              </div>
              <div className="p-3.5 bg-[#02130c]/70 rounded-2xl border border-emerald-500/20">
                <span className="text-emerald-300/60 block text-[11px]">Daftar Pemilih (DPT)</span>
                <span className="font-mono font-bold text-white text-base mt-0.5 block">{pemilihList.length} pemilih</span>
              </div>
              <div className="p-3.5 bg-[#02130c]/70 rounded-2xl border border-emerald-500/20">
                <span className="text-emerald-300/60 block text-[11px]">Status Pemilihan</span>
                <span className="font-mono font-bold text-orange-400 text-base mt-0.5 block uppercase">{pengaturan.status}</span>
              </div>
              <div className="p-3.5 bg-[#02130c]/70 rounded-2xl border border-emerald-500/20">
                <span className="text-emerald-300/60 block text-[11px]">Log Audit Tersimpan</span>
                <span className="font-mono font-bold text-white text-base mt-0.5 block">{logs.length} riwayat</span>
              </div>
            </div>
          </div>

          {/* Card Impor / Restore */}
          <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-emerald-500/20">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Pulihkan Data dari Berkas Cadangan (Restore JSON)
                </h3>
                <p className="text-xs text-emerald-200/70 mt-0.5">
                  Unggah berkas cadangan JSON resmi PanritaVote untuk memulihkan seluruh struktur data.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#02130c]/60 border border-dashed border-emerald-500/40 rounded-2xl text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-emerald-950/40 cursor-pointer transition-all border border-emerald-400/30"
              >
                <FileText className="w-4 h-4 text-emerald-200" />
                <span>{restoreFileName ? 'Ganti Berkas Cadangan' : 'Pilih Berkas Cadangan (.JSON)'}</span>
              </label>
              {restoreFileName && (
                <p className="text-xs font-mono font-medium text-orange-400">
                  Berkas terpilih: {restoreFileName}
                </p>
              )}
            </div>

            {/* Preview Cadangan Sebelum Restore */}
            {parsedBackup && (
              <div className="p-5 bg-[#021810] border border-orange-500/30 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                    <Database className="w-4 h-4 text-orange-400" />
                    <span>Pratinjau Data Cadangan:</span>
                  </div>
                  <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-400/40 px-2.5 py-0.5 rounded-full font-bold">
                    VERSI {parsedBackup.version}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 bg-[#042017]/70 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-300/60 text-[10px] block">Waktu Cadangan:</span>
                    <span className="font-mono text-[11px] font-bold text-white truncate block">
                      {parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleString('id-ID') : '-'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#042017]/70 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-300/60 text-[10px] block">Sekolah:</span>
                    <span className="text-[11px] font-bold text-white truncate block">
                      {parsedBackup.sekolah || '-'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#042017]/70 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-300/60 text-[10px] block">Total Paslon:</span>
                    <span className="font-mono text-[11px] font-bold text-orange-400 block">
                      {parsedBackup.paslonList?.length || 0} paslon
                    </span>
                  </div>
                  <div className="p-3 bg-[#042017]/70 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-300/60 text-[10px] block">Total DPT:</span>
                    <span className="font-mono text-[11px] font-bold text-orange-400 block">
                      {parsedBackup.pemilihList?.length || 0} pemilih
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peringatan Pemulihan:</strong> Memulihkan cadangan ini akan menimpa data paslon, DPT, dan pengaturan saat ini dengan data dari berkas cadangan.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedBackup(null);
                      setRestoreFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-200 hover:bg-emerald-950/60 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isRestoring}
                    onClick={handleExecuteRestore}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/40 flex items-center gap-2 cursor-pointer border border-orange-400/40"
                  >
                    {isRestoring ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memulihkan Database...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pulihkan Database Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RESET DATA (ZONA BAHAYA) */}
      {activeTab === 'reset' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-start gap-3.5 shadow-[0_8px_30px_rgba(244,63,94,0.15)]">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-rose-300">
                Zona Bahaya: Reset Database Pemilihan
              </h3>
              <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                Tindakan di halaman ini bersifat destruktif dan akan mengubah data pada cloud Firestore secara permanen. Pastikan Anda telah mengunduh berkas cadangan (Backup JSON) sebelum melanjutkan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* OPSI 1: RESET SUARA SAJA */}
            <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col justify-between space-y-4 hover:shadow-[0_12px_36px_rgba(245,158,11,0.15)] transition-all">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Reset Perolehan Suara Saja</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Menolkan kembali perolehan suara setiap paslon dan mengembalikan status seluruh DPT menjadi <strong className="text-white">"Belum Memilih"</strong>.
                </p>
                <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-500/25 rounded-2xl text-[11px] text-amber-200 space-y-1.5">
                  <p className="font-semibold text-amber-300">Direkomendasikan untuk:</p>
                  <p>• Setelah gladi bersih / simulasi bilik suara sebelum hari pemilihan resmi dibuka.</p>
                  <p>• Data Pasangan Calon & Akun Token DPT <strong className="text-white">TETAP UTUH</strong> (tidak terhapus).</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmInput('');
                  setResetModalType('votes');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Hasil Suara Saja</span>
              </button>
            </div>

            {/* OPSI 2: RESET TOTAL / FACTORY RESET */}
            <div className="bg-[#042017]/85 backdrop-blur-xl rounded-3xl border border-rose-500/30 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col justify-between space-y-4 hover:shadow-[0_12px_36px_rgba(244,63,94,0.15)] transition-all">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Reset Total Database (Factory Reset)</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Menghapus <strong className="text-white">seluruh data kandidat paslon</strong>, menghapus <strong className="text-white">seluruh data pemilih (DPT)</strong>, menghapus seluruh rekaman suara, dan mengembalikan status ke <strong className="text-white">Tahap Persiapan</strong>.
                </p>
                <div className="mt-4 p-3.5 bg-rose-950/40 border border-rose-500/25 rounded-2xl text-[11px] text-rose-200 space-y-1.5">
                  <p className="font-semibold text-rose-300">Akibat Tindakan:</p>
                  <p>• Database kembali bersih kosong seperti awal mula instalasi sistem.</p>
                  <p>• Semua token pemilih akan terhapus dan harus di-import ulang.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmInput('');
                  setResetModalType('factory');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Total Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI GANDA RESET (GAYA FORM MENYAMPING DENGAN SIDE ACTION DOCK) */}
      {resetModalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#042017]/95 rounded-3xl max-w-2xl w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-rose-500/30 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Kolom Kiri: Deskripsi & Input */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      resetModalType === 'votes'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-400/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-400/40'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {resetModalType === 'votes'
                        ? 'Konfirmasi Reset Hasil Suara'
                        : 'Konfirmasi Reset Total Database'}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                      [TINDAKAN_DESTRUKTIF // KRITIKAL]
                    </span>
                  </div>
                </div>

                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  {resetModalType === 'votes' ? (
                    <>
                      Seluruh perolehan suara paslon akan <strong className="text-white">dinolkan</strong> dan status{' '}
                      <strong className="text-orange-400">{pemilihList.length} pemilih</strong> akan dikembalikan menjadi{' '}
                      <em>"Belum Memilih"</em>.
                    </>
                  ) : (
                    <>
                      Tindakan ini akan <strong className="text-rose-400 font-bold">menghapus permanen</strong> seluruh{' '}
                      <strong className="text-white">{paslonList.length} pasangan calon</strong> dan{' '}
                      <strong className="text-white">{pemilihList.length} akun pemilih DPT</strong> dari Firestore.
                    </>
                  )}
                </p>

                <div className="p-3.5 bg-[#02130c]/80 border border-rose-500/30 rounded-2xl">
                  <label className="block text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1.5">
                    Ketik kata <span className="text-rose-400 font-mono font-black">RESET</span> untuk melanjutkan:
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ketik RESET"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-center text-sm font-mono font-bold uppercase rounded-xl border border-rose-500/40 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-[#02130c] text-white"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Tombol Eksekusi di Bagian Samping (Side Dock) */}
              <div className="md:col-span-5 bg-[#021810] p-4 rounded-2xl border border-rose-500/25 flex flex-col justify-center space-y-3">
                <span className="text-[10px] font-mono text-center uppercase tracking-widest text-emerald-400 font-bold block">
                  KONFIRMASI EKSEKUSI
                </span>

                <button
                  type="button"
                  disabled={confirmInput.trim().toUpperCase() !== 'RESET' || isProcessingReset}
                  onClick={handleExecuteReset}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    confirmInput.trim().toUpperCase() === 'RESET' && !isProcessingReset
                      ? resetModalType === 'votes'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950/40 border border-amber-400/40'
                        : 'bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white shadow-rose-950/40 border border-rose-400/40'
                      : 'bg-[#02130c] text-emerald-700/50 border border-emerald-900/40 cursor-not-allowed'
                  }`}
                >
                  {isProcessingReset ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses Reset...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Eksekusi</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isProcessingReset}
                  onClick={() => {
                    setResetModalType(null);
                    setConfirmInput('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-[#02130c] cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
