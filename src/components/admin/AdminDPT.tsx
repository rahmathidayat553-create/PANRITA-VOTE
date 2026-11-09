import React, { useState, useRef } from 'react';
import { Pemilih, generateUniqueToken } from '../../data/dummy';
import { ToastData } from '../Toast';
import {
  Search,
  CheckCircle2,
  Clock,
  UserPlus,
  FileSpreadsheet,
  Download,
  Printer,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Save,
  AlertCircle,
  UploadCloud,
  FileText,
  FileDown,
  ShieldCheck,
  Copy,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  downloadVoterTemplate,
  parseVoterExcel,
  exportVotersToCsv,
} from '../../utils/excelUtils';
import { AdminCardPrinter } from './AdminCardPrinter';

interface AdminDPTProps {
  pemilihList: Pemilih[];
  sekolah: string;
  logoUrl: string;
  onAddPemilih: (voter: Pemilih) => void;
  onUpdatePemilih: (voter: Pemilih) => void;
  onDeletePemilih: (id: string) => void;
  onImportPemilih: (newVoters: Pemilih[]) => void;
  onShowToast?: (data: ToastData) => void;
}

export const AdminDPT: React.FC<AdminDPTProps> = ({
  pemilihList,
  sekolah,
  logoUrl,
  onAddPemilih,
  onUpdatePemilih,
  onDeletePemilih,
  onImportPemilih,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'sudah' | 'belum'>('semua');
  const [jenisFilter, setJenisFilter] = useState<'semua' | 'siswa' | 'guru'>('semua');

  // SubView States: 'list' | 'add' | 'edit' | 'import' | 'export' | 'print'
  type DptSubView = 'list' | 'add' | 'edit' | 'import' | 'export' | 'print';
  const [subView, setSubView] = useState<DptSubView>('list');
  const [editingVoter, setEditingVoter] = useState<Pemilih | null>(null);
  const [deletingVoter, setDeletingVoter] = useState<Pemilih | null>(null);

  // Export CSV State
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Import State
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<Pemilih[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Voter Form State
  const existingTokens = pemilihList.map((p) => p.token);
  const [formJenis, setFormJenis] = useState<'siswa' | 'guru'>('siswa');
  const [formNama, setFormNama] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formKelas, setFormKelas] = useState('');
  const [formToken, setFormToken] = useState(generateUniqueToken(existingTokens));
  const [formError, setFormError] = useState<string | null>(null);

  // Reset Add Form
  const resetAddForm = () => {
    setFormJenis('siswa');
    setFormNama('');
    setFormNisn('');
    setFormKelas('');
    setFormToken(generateUniqueToken(existingTokens));
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setSubView('add');
  };

  const handleRegenerateToken = (isEdit = false) => {
    const newToken = generateUniqueToken(existingTokens);
    if (isEdit && editingVoter) {
      setEditingVoter({ ...editingVoter, token: newToken });
    } else {
      setFormToken(newToken);
    }
    onShowToast?.({
      type: 'info',
      title: 'Token Baru Dibuat',
      message: `Token 5 digit baru [${newToken}] siap digunakan.`,
      code: '[TOKEN_REGENERATED]',
      duration: 2000,
    });
  };

  const handleCopyToken = (voter: Pemilih) => {
    navigator.clipboard.writeText(voter.token).catch(() => {});
    onShowToast?.({
      type: 'success',
      title: 'Token Disalin ke Clipboard',
      message: `Token [${voter.token}] milik ${voter.nama} (${voter.kelas}) berhasil disalin.`,
      code: '[CLIPBOARD_COPIED]',
      duration: 2500,
    });
  };

  // Submit Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNama.trim() || !formNisn.trim() || !formKelas.trim()) {
      const msg = 'Harap lengkapi seluruh kolom isian data pemilih.';
      setFormError(msg);
      onShowToast?.({
        type: 'warning',
        title: 'Form Belum Lengkap',
        message: msg,
        code: '[VALIDATION_FAIL]',
        duration: 3000,
      });
      return;
    }

    if (formToken.length !== 5 || !/^\d{5}$/.test(formToken)) {
      const msg = 'Token harus berupa 5 digit angka.';
      setFormError(msg);
      onShowToast?.({
        type: 'warning',
        title: 'Format Token Salah',
        message: msg,
        code: '[VALIDATION_FAIL]',
        duration: 3000,
      });
      return;
    }

    const newVoter: Pemilih = {
      id: `pem-${Date.now()}`,
      jenis: formJenis,
      nama: formNama.trim(),
      nisn: formNisn.trim(),
      kelas: formKelas.trim(),
      token: formToken.trim(),
      status: 'belum',
    };

    onAddPemilih(newVoter);
    setSubView('list');
    resetAddForm();
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;

    if (!editingVoter.nama.trim() || !editingVoter.nisn.trim() || !editingVoter.kelas.trim()) {
      onShowToast?.({
        type: 'warning',
        title: 'Data Belum Lengkap',
        message: 'Harap lengkapi seluruh kolom data pemilih.',
        code: '[VALIDATION_FAIL]',
        duration: 3000,
      });
      return;
    }

    onUpdatePemilih(editingVoter);
    setEditingVoter(null);
    setSubView('list');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingVoter) {
      onDeletePemilih(deletingVoter.id);
      setDeletingVoter(null);
    }
  };

  // Excel File Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportError(null);

    try {
      const parsed = await parseVoterExcel(file, existingTokens);
      setImportPreview(parsed);
    } catch (err: any) {
      setImportError(err?.message || 'Gagal membaca berkas Excel.');
      setImportPreview(null);
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (importPreview && importPreview.length > 0) {
      onImportPemilih(importPreview);
      setImportPreview(null);
      setSubView('list');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export CSV Handler
  const handleDownloadCsv = (targetScope: 'all' | 'filtered') => {
    const targetList = targetScope === 'all' ? pemilihList : filtered;
    if (targetList.length === 0) {
      onShowToast?.({
        type: 'warning',
        title: 'Data Kosong',
        message: 'Tidak ada data pemilih yang dapat diekspor ke CSV.',
        code: '[EXPORT_EMPTY]',
        duration: 2500,
      });
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const scopeTag = targetScope === 'all' ? 'semua_dpt' : 'terfilter';
    const filename = `backup_dpt_${scopeTag}_smkn9_bulukumba_${dateStr}.csv`;

    exportVotersToCsv(targetList, filename);
    setSubView('list');
    onShowToast?.({
      type: 'success',
      title: 'Berkas CSV Diunduh',
      message: `Berkas cadangan "${filename}" (${targetList.length} pemilih) berhasil diekspor.`,
      code: '[DPT_CSV_EXPORTED]',
      duration: 4000,
    });
    setExportSuccessMessage(
      `Berkas cadangan CSV "${filename}" (${targetList.length} data pemilih) berhasil diunduh untuk arsip & audit manual.`
    );
    setTimeout(() => setExportSuccessMessage(null), 6000);
  };

  // Filtering
  const filtered = pemilihList.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nisn.includes(searchQuery) ||
      p.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'semua' ? true : p.status === statusFilter;

    const matchesJenis =
      jenisFilter === 'semua' ? true : p.jenis === jenisFilter;

    return matchesSearch && matchesStatus && matchesJenis;
  });

  const totalDPT = pemilihList.length;
  const totalSiswa = pemilihList.filter((p) => p.jenis === 'siswa').length;
  const totalGuru = pemilihList.filter((p) => p.jenis === 'guru').length;
  const totalSudah = pemilihList.filter((p) => p.status === 'sudah').length;
  const totalBelum = totalDPT - totalSudah;

  return (
    <div className="space-y-6 max-w-6xl">
      {subView === 'list' && (
        <div className="space-y-6">
          {/* Top Header & Actions Bar (Dark Glassmorphism) */}
          <div className="p-6 rounded-3xl bg-[#042017]/80 backdrop-blur-xl border border-emerald-500/25 shadow-xl shadow-black/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Daftar Pemilih Tetap (DPT) Siswa & Guru
            </h2>
          </div>
          <p className="text-xs text-emerald-200/80 max-w-xl">
            Kelola data pemilih sah, impor Excel (.xlsx), ekspor CSV cadangan, unduh template resmi, dan cetak kartu pemilih PDF ber-token 5 digit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSubView('print');
              onShowToast?.({
                type: 'info',
                title: 'Halaman Cetak Kartu',
                message: 'Menyiapkan modul cetak kartu DPT dengan QR Code & 5 digit token.',
                code: '[PRINT_JOB_PREPARED]',
                duration: 2500,
              });
            }}
            className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:border-orange-500/40"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>Cetak Kartu PDF</span>
          </button>

          <button
            onClick={() => {
              setExportScope(filtered.length !== pemilihList.length ? 'filtered' : 'all');
              setSubView('export');
            }}
            className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:border-orange-500/40"
            title="Ekspor daftar pemilih ke berkas CSV untuk cadangan (backup) dan audit manual"
          >
            <FileDown className="w-3.5 h-3.5 text-orange-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => {
              downloadVoterTemplate();
              onShowToast?.({
                type: 'info',
                title: 'Template Excel Diunduh',
                message: 'Template format DPT (Siswa & Guru) siap diisi.',
                code: '[XLSX_TEMPLATE_READY]',
                duration: 3000,
              });
            }}
            className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:border-orange-500/40"
            title="Unduh contoh template berkas Excel"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Template XLSX</span>
          </button>

          <button
            onClick={() => {
              setImportPreview(null);
              setImportError(null);
              setSubView('import');
            }}
            className="px-3.5 py-2 bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:border-orange-500/40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>Import XLSX</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-950/50 border border-orange-400/40 cursor-pointer hover:-translate-y-0.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Pemilih</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification */}
      {exportSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center shrink-0 text-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-medium">{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs px-2 py-1 rounded-md hover:bg-emerald-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Counters (3D Card Hover Depth) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
        <div className="p-4 rounded-2xl bg-[#042017]/80 backdrop-blur-md border border-emerald-500/25 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40">
          <span className="text-emerald-300/70 text-[11px] block">Total DPT</span>
          <span className="text-2xl font-bold font-mono text-white mt-0.5 block">{totalDPT}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#042017]/80 backdrop-blur-md border border-emerald-500/25 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50">
          <span className="text-emerald-400 text-[11px] block">Pemilih Siswa</span>
          <span className="text-2xl font-bold font-mono text-emerald-300 mt-0.5 block">{totalSiswa}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#042017]/80 backdrop-blur-md border border-emerald-500/25 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/50">
          <span className="text-orange-400 text-[11px] block">Pemilih Guru</span>
          <span className="text-2xl font-bold font-mono text-orange-300 mt-0.5 block">{totalGuru}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#042017]/80 backdrop-blur-md border border-emerald-500/25 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50">
          <span className="text-emerald-400 text-[11px] block">Sudah Memilih</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">{totalSudah}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#042017]/80 backdrop-blur-md border border-emerald-500/25 shadow-lg shadow-black/30 col-span-2 sm:col-span-1 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50">
          <span className="text-amber-400 text-[11px] block">Belum Memilih</span>
          <span className="text-2xl font-bold font-mono text-amber-300 mt-0.5 block">{totalBelum}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#042017]/80 backdrop-blur-md rounded-2xl border border-emerald-500/25 p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NISN/NIP, kelas, atau token..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-emerald-500/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-[#021810] text-white placeholder:text-emerald-300/40"
          />
          <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-2.5" />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Jenis Filter */}
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-emerald-500/20 rounded-xl">
            {(['semua', 'siswa', 'guru'] as const).map((j) => (
              <button
                key={j}
                onClick={() => setJenisFilter(j)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  jenisFilter === j
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 shadow-md border border-orange-500/30'
                    : 'text-emerald-300/70 hover:text-white'
                }`}
              >
                {j === 'semua' ? 'Semua Jenis' : j}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-emerald-500/20 rounded-xl">
            {(['semua', 'sudah', 'belum'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 shadow-md border border-orange-500/30'
                    : 'text-emerald-300/70 hover:text-white'
                }`}
              >
                {s === 'semua'
                  ? 'Semua Status'
                  : s === 'sudah'
                  ? 'Sudah'
                  : 'Belum'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INLINE CONFIRMATION BANNER FOR DELETING VOTER (NO FLOATING MODAL) */}
      {deletingVoter && (
        <div className="p-5 rounded-3xl bg-rose-950/80 border-2 border-rose-500/60 shadow-2xl text-white animate-in fade-in duration-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-900/90 text-rose-300 border border-rose-400/40 flex items-center justify-center shrink-0 shadow-md">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Hapus Pemilih {deletingVoter.nama}?</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 uppercase">
                  KONFIRMASI_HAPUS
                </span>
              </h4>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Anda akan menghapus data pemilih <strong className="text-white font-bold">{deletingVoter.nama}</strong> ({deletingVoter.kelas}) dengan token <span className="font-mono font-bold text-white">{deletingVoter.token}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setDeletingVoter(null)}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-rose-400/30 text-xs font-semibold text-rose-200 hover:bg-rose-900/50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-md cursor-pointer border border-rose-400/40 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Pemilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Main DPT Table (Dark Glassmorphism) */}
      <div className="bg-[#042017]/80 backdrop-blur-xl rounded-3xl border border-emerald-500/25 overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#021810]/90 border-b border-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">No</th>
                <th className="px-4 py-3.5">Jenis</th>
                <th className="px-4 py-3.5">Nomor Induk</th>
                <th className="px-4 py-3.5">Nama Pemilih</th>
                <th className="px-4 py-3.5">Kelas / Jabatan</th>
                <th className="px-4 py-3.5">Token 5 Digit</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-emerald-100">
              {filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-emerald-900/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-emerald-400/60">{index + 1}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.jenis === 'guru'
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-300/80">{item.nisn}</td>
                    <td className="px-4 py-3 font-semibold text-white">{item.nama}</td>
                    <td className="px-4 py-3 text-emerald-200/80">{item.kelas}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleCopyToken(item)}
                        className="inline-flex items-center gap-1.5 font-mono font-bold bg-[#062c20] hover:bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-lg border border-orange-500/30 tracking-wider transition-colors cursor-pointer group shadow-2xs"
                        title="Klik untuk salin token 5 digit"
                      >
                        <span>{item.token}</span>
                        <Copy className="w-3 h-3 text-orange-400/70 group-hover:text-orange-300 transition-colors" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'sudah' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Sudah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingVoter({ ...item });
                            setSubView('edit');
                          }}
                          className="p-1.5 text-emerald-300 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-orange-500/30"
                          title="Ubah data pemilih"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingVoter(item)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                          title="Hapus pemilih"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-emerald-300/70">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-bold text-white text-xs">
                        {pemilihList.length === 0
                          ? 'Daftar Pemilih Tetap (DPT) Masih Kosong'
                          : 'Tidak ada pemilih yang sesuai dengan pencarian atau filter.'}
                      </p>
                      <p className="text-xs text-emerald-400/60">
                        {pemilihList.length === 0
                          ? 'Gunakan tombol "Import XLSX" untuk mengunggah berkas data siswa & guru, atau klik "+ Tambah Pemilih" untuk input manual.'
                          : 'Coba ubah kata kunci pencarian atau sesuaikan filter status dan jenis pemilih.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* ========================================================================= */}
      {/* 1. FULL PAGE: TAMBAH PEMILIH BARU                                         */}
      {/* ========================================================================= */}
      {subView === 'add' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Navigation & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#042017]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/25 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setSubView('list');
                resetAddForm();
              }}
              className="flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-orange-400 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center group-hover:border-orange-500/50">
                <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:text-orange-400" />
              </div>
              <span>Kembali ke Daftar Pemilih (DPT)</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-300/80 uppercase tracking-wider">
                Halaman Penuh · Tambah Pemilih Baru
              </span>
            </div>
          </div>

          {/* Main Form Container */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#042017]/85 backdrop-blur-2xl border border-emerald-500/25 shadow-2xl text-white">
            <div className="flex items-center gap-3 pb-5 border-b border-emerald-500/20 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Formulir Tambah Pemilih Tetap (DPT)
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Lengkapi data pemilih di kolom sebelah kiri dan gunakan panel aksi cepat di sebelah kanan
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Input Fields */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Jenis Pemilih */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                      Kategori Pemilih
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormJenis('siswa')}
                        className={`py-3 px-4 rounded-2xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          formJenis === 'siswa'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-md ring-1 ring-orange-500/30'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white hover:border-emerald-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formJenis === 'siswa' ? 'bg-orange-400' : 'bg-emerald-700'}`} />
                        <span>Siswa / Pelajar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormJenis('guru')}
                        className={`py-3 px-4 rounded-2xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          formJenis === 'guru'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-md ring-1 ring-orange-500/30'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white hover:border-emerald-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formJenis === 'guru' ? 'bg-orange-400' : 'bg-emerald-700'}`} />
                        <span>Guru & Tenaga Kependidikan</span>
                      </button>
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                      Nama Lengkap Pemilih <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      placeholder={formJenis === 'siswa' ? 'Contoh: Ahmad Rizky Pratama' : 'Contoh: Dra. Hj. Siti Aminah, M.Pd.'}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Nomor Induk */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                      {formJenis === 'siswa' ? 'NISN Siswa (10 Digit)' : 'NIP / NUPTK Guru'} <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formNisn}
                      onChange={(e) => setFormNisn(e.target.value)}
                      placeholder={formJenis === 'siswa' ? '10 digit NISN' : '18 digit NIP'}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-500/30 bg-[#06291d] text-white font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Kelas / Jabatan */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                      {formJenis === 'siswa' ? 'Kelas / Jurusan' : 'Jabatan / Mata Pelajaran'} <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formKelas}
                      onChange={(e) => setFormKelas(e.target.value)}
                      placeholder={formJenis === 'siswa' ? 'Contoh: XI TJKT 2' : 'Contoh: Guru Produktif DKV'}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Token Box */}
                  <div className="p-4 bg-[#021810] rounded-2xl border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        Token Autentikasi Pemilih (5 Digit Angka)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRegenerateToken(false)}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Acak Ulang Token</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={5}
                        required
                        value={formToken}
                        onChange={(e) => setFormToken(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        className="w-48 px-4 py-2.5 rounded-xl bg-[#031d14] border border-orange-500/50 text-orange-400 text-xl font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-orange-500/60 shadow-inner"
                      />
                      <span className="text-xs text-emerald-300/70">
                        Token unik yang digunakan pemilih untuk login di bilik suara publik.
                      </span>
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Fast Action Dock & Live Card Preview */}
                <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
                  {/* Fast Action Dock Card */}
                  <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 shadow-xl space-y-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Aksi & Konfirmasi
                    </span>
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all border border-orange-400/40"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Pemilih ke DPT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubView('list');
                        resetAddForm();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-950/50 hover:text-white cursor-pointer transition-all text-center block"
                    >
                      Batal & Kembali
                    </button>
                  </div>

                  {/* Live Voter Card Preview */}
                  <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 space-y-3">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Pratinjau Kartu Pemilih
                    </span>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#042017] to-[#02130c] border border-emerald-500/30 space-y-2 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                        {formJenis === 'siswa' ? 'Siswa' : 'Guru / Staf'}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">
                        {formNama || 'Nama Lengkap Pemilih'}
                      </h4>
                      <p className="text-xs text-emerald-300/80 truncate">
                        {formNisn || 'NISN / NIP'} · {formKelas || 'Kelas / Jabatan'}
                      </p>
                      <div className="pt-2 border-t border-emerald-500/20">
                        <span className="text-[10px] text-emerald-400/70 block uppercase">Token Akses:</span>
                        <span className="text-lg font-mono font-bold text-orange-400 tracking-widest">
                          {formToken || '•••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FULL PAGE: UBAH DATA PEMILIH                                            */}
      {/* ========================================================================= */}
      {subView === 'edit' && editingVoter && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#042017]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/25 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setEditingVoter(null);
                setSubView('list');
              }}
              className="flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-orange-400 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center group-hover:border-orange-500/50">
                <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:text-orange-400" />
              </div>
              <span>Kembali ke Daftar Pemilih (DPT)</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-300/80 uppercase tracking-wider">
                Halaman Penuh · Ubah Data: {editingVoter.nama}
              </span>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#042017]/85 backdrop-blur-2xl border border-emerald-500/25 shadow-2xl text-white">
            <div className="flex items-center gap-3 pb-5 border-b border-emerald-500/20 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/80 text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-lg">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Perbarui Data Pemilih Tetap
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Ubah data pemilih dan simpan perubahan menggunakan panel di sebelah kanan
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Input Fields */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Kategori Pemilih */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                      Kategori Pemilih
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingVoter({ ...editingVoter, jenis: 'siswa' })}
                        className={`py-3 px-4 rounded-2xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          editingVoter.jenis === 'siswa'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-md ring-1 ring-orange-500/30'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${editingVoter.jenis === 'siswa' ? 'bg-orange-400' : 'bg-emerald-700'}`} />
                        <span>Siswa / Pelajar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVoter({ ...editingVoter, jenis: 'guru' })}
                        className={`py-3 px-4 rounded-2xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          editingVoter.jenis === 'guru'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-md ring-1 ring-orange-500/30'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${editingVoter.jenis === 'guru' ? 'bg-orange-400' : 'bg-emerald-700'}`} />
                        <span>Guru & Tenaga Kependidikan</span>
                      </button>
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                      Nama Lengkap Pemilih <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingVoter.nama}
                      onChange={(e) => setEditingVoter({ ...editingVoter, nama: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#06291d] border border-emerald-500/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    />
                  </div>

                  {/* Nomor Induk & Kelas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                        {editingVoter.jenis === 'siswa' ? 'NISN (Nomor Induk Siswa)' : 'NIP / NUPTK Guru'} <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingVoter.nisn}
                        onChange={(e) => setEditingVoter({ ...editingVoter, nisn: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#06291d] border border-emerald-500/30 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                        {editingVoter.jenis === 'siswa' ? 'Kelas & Rombel' : 'Jabatan / Posisi'} <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingVoter.kelas}
                        onChange={(e) => setEditingVoter({ ...editingVoter, kelas: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#06291d] border border-emerald-500/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Token Box */}
                  <div className="p-4 bg-[#021810] rounded-2xl border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        Token Autentikasi Pemilih (5 Digit Angka)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRegenerateToken(true)}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Acak Ulang Token</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={5}
                        required
                        value={editingVoter.token}
                        onChange={(e) =>
                          setEditingVoter({
                            ...editingVoter,
                            token: e.target.value.replace(/\D/g, '').slice(0, 5),
                          })
                        }
                        className="w-48 px-4 py-2.5 rounded-xl bg-[#031d14] border border-orange-500/50 text-orange-400 text-xl font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-orange-500/60 shadow-inner"
                      />
                      <span className="text-xs text-emerald-300/70">
                        Status partisipasi saat ini:{' '}
                        <span
                          className={`font-bold ${
                            editingVoter.status === 'sudah' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {editingVoter.status === 'sudah' ? 'Sudah Memilih' : 'Belum Memilih'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Fast Action Dock */}
                <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
                  <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 shadow-xl space-y-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Aksi & Konfirmasi
                    </span>
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all border border-orange-400/40"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVoter(null);
                        setSubView('list');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-950/50 hover:text-white cursor-pointer transition-all text-center block"
                    >
                      Batal & Kembali
                    </button>
                  </div>

                  {/* Summary Card */}
                  <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 space-y-3">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Ringkasan Data Pemilih
                    </span>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#042017] to-[#02130c] border border-emerald-500/30 space-y-1.5 text-center">
                      <p className="text-sm font-bold text-white truncate">{editingVoter.nama}</p>
                      <p className="text-xs text-emerald-300/80 truncate">
                        {editingVoter.nisn} · {editingVoter.kelas}
                      </p>
                      <div className="pt-2 border-t border-emerald-500/20">
                        <span className="text-[10px] text-emerald-400/70 block uppercase">Token Akses:</span>
                        <span className="text-lg font-mono font-bold text-orange-400 tracking-widest">
                          {editingVoter.token}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULL PAGE: IMPORT DATA DARI EXCEL (.XLSX)                               */}
      {/* ========================================================================= */}
      {subView === 'import' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#042017]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/25 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setSubView('list');
                setImportPreview(null);
                setImportError(null);
              }}
              className="flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-orange-400 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center group-hover:border-orange-500/50">
                <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:text-orange-400" />
              </div>
              <span>Kembali ke Daftar Pemilih (DPT)</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-300/80 uppercase tracking-wider">
                Halaman Penuh · Impor Excel DPT
              </span>
            </div>
          </div>

          {/* Import Main Container */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#042017]/85 backdrop-blur-2xl border border-emerald-500/25 shadow-2xl text-white">
            <div className="flex items-center gap-3 pb-5 border-b border-emerald-500/20 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/80 text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Impor Data Pemilih Tetap dari Berkas Excel (.xlsx)
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Unggah berkas spreadsheet siswa atau guru. Sistem otomatis membuat token unik 5 digit untuk setiap pemilih.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Upload & Preview */}
              <div className="lg:col-span-8 space-y-5">
                {/* Download Template Banner */}
                <div className="p-4 bg-emerald-950/70 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                    <span>Belum memiliki format berkas yang sesuai?</span>
                  </div>
                  <button
                    type="button"
                    onClick={downloadVoterTemplate}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template Excel</span>
                  </button>
                </div>

                {/* Dropzone File Upload */}
                <div className="border-2 border-dashed border-emerald-500/40 rounded-3xl p-8 text-center hover:border-orange-500/60 transition-colors bg-[#021810]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excelFileInputFullPage"
                  />
                  <label
                    htmlFor="excelFileInputFullPage"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mb-3 text-orange-400 group-hover:scale-105 transition-transform shadow-lg">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-bold text-white mb-1">
                      Klik untuk Memilih Berkas Excel (.xlsx / .xls)
                    </span>
                    <span className="text-xs text-emerald-400/70">
                      Format kolom: No, Nama Lengkap, NISN/NIP, Kelas/Jurusan, Jenis (siswa/guru)
                    </span>
                  </label>
                </div>

                {/* Loading state */}
                {importLoading && (
                  <div className="py-6 text-center text-xs text-emerald-300 flex items-center justify-center gap-2.5 bg-[#021810] rounded-2xl border border-emerald-500/20">
                    <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                    <span>Menganalisis lembar kerja dan memverifikasi token 5 digit...</span>
                  </div>
                )}

                {/* Error state */}
                {importError && (
                  <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Preview Table */}
                {importPreview && importPreview.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">
                        Pratinjau Data yang Siap Diimpor:
                      </span>
                      <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs">
                        {importPreview.length} Calon Pemilih
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-xl border border-emerald-500/20 divide-y divide-emerald-500/10">
                      {importPreview.map((p, idx) => (
                        <div key={idx} className="p-3 bg-[#031d14]/60 flex items-center justify-between hover:bg-emerald-950/40 transition-colors text-xs">
                          <div className="truncate pr-3">
                            <span className="font-bold text-white">{p.nama}</span>
                            <span className="text-emerald-400/80 text-[11px] ml-1.5">
                              ({p.kelas} · {p.jenis === 'siswa' ? 'Siswa' : 'Guru'})
                            </span>
                          </div>
                          <span className="font-mono font-bold text-orange-400 bg-[#02130c] px-2.5 py-1 rounded-lg border border-orange-500/30 text-xs shrink-0">
                            {p.token}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Action Dock */}
              <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
                <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 shadow-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Konfirmasi Impor
                  </span>
                  <button
                    type="button"
                    disabled={!importPreview || importPreview.length === 0}
                    onClick={handleConfirmImport}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all ${
                      importPreview && importPreview.length > 0
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white cursor-pointer border border-orange-400/40'
                        : 'bg-emerald-950/50 text-emerald-600 cursor-not-allowed border border-emerald-500/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {importPreview && importPreview.length > 0
                        ? `Impor ${importPreview.length} Data Pemilih`
                        : 'Pilih Berkas Terlebih Dahulu'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubView('list');
                      setImportPreview(null);
                      setImportError(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-950/50 hover:text-white cursor-pointer transition-all text-center block"
                  >
                    Batal & Kembali
                  </button>
                </div>

                {/* Helpful instructions card */}
                <div className="p-5 rounded-2xl bg-[#021810] border border-emerald-500/30 text-xs space-y-2 text-emerald-200/80">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Integritas Data Terjamin</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Sistem mendeteksi dan mencegah token ganda (duplikasi token) antar pemilih untuk menjaga kerahasiaan bilik suara.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.5 Modal Ekspor CSV (Backup & Audit) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-900">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ekspor Data DPT ke CSV
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pencadangan data (backup) & lembar audit manual TPS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Berkas CSV berformat standar UTF-8 dengan pelindung karakter (BOM) sehingga angka NISN/NIP serta token 5 digit tidak terpotong di Microsoft Excel atau Google Sheets.
              </p>

              {/* Scope Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Pilih Cakupan Data yang Ingin Diekspor:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      exportScope === 'all'
                        ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Seluruh DPT</span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-emerald-800">
                        {pemilihList.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 block">
                      Master backup semua data pemilih (Siswa & Guru).
                    </span>
                  </div>

                  <div
                    onClick={() => setExportScope('filtered')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      exportScope === 'filtered'
                        ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Data Terfilter</span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-emerald-800">
                        {filtered.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 block">
                      Sesuai filter aktif (status, jenis, & kata kunci).
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Summary Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Spesifikasi Berkas Audit CSV:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    • Jumlah Baris:{' '}
                    <strong className="text-slate-900">
                      {exportScope === 'all' ? pemilihList.length : filtered.length} Pemilih
                    </strong>
                  </div>
                  <div>
                    • Format:{' '}
                    <strong className="text-slate-900">CSV (UTF-8 with BOM)</strong>
                  </div>
                  <div>
                    • Kolom Token:{' '}
                    <strong className="text-slate-900">5-Digit Siap Audit</strong>
                  </div>
                  <div>
                    • Status Suara:{' '}
                    <strong className="text-slate-900">SUDAH / BELUM</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCsv(exportScope)}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    Unduh Berkas CSV ({exportScope === 'all' ? pemilihList.length : filtered.length} Data)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Cetak Kartu Pemilih PDF */}
      {isPrinterOpen && (
        <AdminCardPrinter
          pemilihList={pemilihList}
          sekolah={sekolah}
          logoUrl={logoUrl}
          onClose={() => setIsPrinterOpen(false)}
        />
      )}
    </div>
  );
};
