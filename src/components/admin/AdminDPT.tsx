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

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Pemilih | null>(null);
  const [deletingVoter, setDeletingVoter] = useState<Pemilih | null>(null);
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);

  // Export CSV State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
    setIsAddModalOpen(true);
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
    setIsAddModalOpen(false);
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
      setIsImportModalOpen(false);
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
    setIsExportModalOpen(false);
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
              setIsPrinterOpen(true);
              onShowToast?.({
                type: 'info',
                title: 'Memuat Lembar Kartu Suara',
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
              setIsExportModalOpen(true);
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
              setIsImportModalOpen(true);
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
                          onClick={() => setEditingVoter({ ...item })}
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

      {/* 1. Modal Tambah Pemilih - GAYA MENYAMPING (Side-by-Side Action Dock) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#031d14]/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-emerald-500/30 text-white my-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/20 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Tambah Pemilih Baru ke DPT
                  </h3>
                  <span className="text-[11px] text-emerald-300/80">
                    Input data di sebelah kiri dan konfirmasi aksi langsung di panel samping kanan
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-400 hover:text-white p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/20 hover:border-orange-500/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Input Fields */}
                <div className="md:col-span-7 space-y-4">
                  {/* Jenis Pemilih */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                      Kategori Pemilih
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormJenis('siswa')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          formJenis === 'siswa'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-sm'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        Siswa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormJenis('guru')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          formJenis === 'guru'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-sm'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        Guru / Staf
                      </button>
                    </div>
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      Nama Lengkap Pemilih
                    </label>
                    <input
                      type="text"
                      required
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      placeholder={formJenis === 'siswa' ? 'Contoh: Nurul Hidayah' : 'Contoh: Ahmad, S.Pd'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Nomor Induk */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      {formJenis === 'siswa' ? 'NISN Siswa (10 Digit)' : 'NIP / NUPTK Guru'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formNisn}
                      onChange={(e) => setFormNisn(e.target.value)}
                      placeholder={formJenis === 'siswa' ? '10 digit NISN' : '18 digit NIP'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Kelas / Jabatan */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      {formJenis === 'siswa' ? 'Kelas / Jurusan' : 'Jabatan / Mata Pelajaran'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formKelas}
                      onChange={(e) => setFormKelas(e.target.value)}
                      placeholder={formJenis === 'siswa' ? 'Contoh: XI TJKT 2' : 'Contoh: Guru Produktif DKV'}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: STICKY SIDEBAR DOCK */}
                <div className="md:col-span-5 bg-[#021810]/90 border border-emerald-500/25 rounded-2xl p-4 space-y-4 md:sticky md:top-2 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                      Aksi & Token Suara
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      LIVE DOCK
                    </span>
                  </div>

                  {/* Top Action Buttons (Always in Plain Sight) */}
                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40 transition-all hover:scale-[1.01]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Pemilih</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-full py-2 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Token Box with Regenerate Button */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                        Token 5 Digit Otomatis
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRegenerateToken(false)}
                        className="text-emerald-300 hover:text-orange-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Acak Ulang</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={5}
                      value={formToken}
                      onChange={(e) => setFormToken(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className="w-full px-3 py-2 font-mono font-bold text-center text-xl rounded-xl border border-orange-500/40 bg-[#062c20] tracking-widest text-orange-400 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <span className="text-[10px] text-emerald-300/60 block text-center">
                      Digunakan pemilih untuk login di bilik suara publik.
                    </span>
                  </div>

                  {/* Miniature Card Preview */}
                  <div className="p-3 bg-[#06291d]/60 rounded-xl border border-emerald-500/20 text-xs space-y-1 text-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Pratinjau Akun Pemilih
                    </span>
                    <p className="font-bold text-white truncate">
                      {formNama || 'Nama Lengkap'}
                    </p>
                    <p className="text-[11px] text-emerald-300/80 truncate">
                      {formNisn || 'NISN'} · {formKelas || 'Kelas'}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Edit Pemilih - GAYA MENYAMPING (Side-by-Side Action Dock) */}
      {editingVoter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#031d14]/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-emerald-500/30 text-white my-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/20 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/80 text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-md">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Ubah Data Pemilih
                  </h3>
                  <span className="text-[11px] text-emerald-300/80">
                    Form input menyamping dengan tombol aksi selalu siap di panel samping
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingVoter(null)}
                className="text-emerald-400 hover:text-white p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/20 hover:border-orange-500/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Input Fields */}
                <div className="md:col-span-7 space-y-4">
                  {/* Jenis Pemilih */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                      Kategori Pemilih
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingVoter({ ...editingVoter, jenis: 'siswa' })}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          editingVoter.jenis === 'siswa'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-sm'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        Siswa
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVoter({ ...editingVoter, jenis: 'guru' })}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          editingVoter.jenis === 'guru'
                            ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-orange-400 border-orange-500/40 shadow-sm'
                            : 'bg-[#021810] text-emerald-300/60 border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        Guru / Staf
                      </button>
                    </div>
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={editingVoter.nama}
                      onChange={(e) => setEditingVoter({ ...editingVoter, nama: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Nomor Induk */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      {editingVoter.jenis === 'guru' ? 'NIP / NUPTK Guru' : 'NISN Siswa'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingVoter.nisn}
                      onChange={(e) => setEditingVoter({ ...editingVoter, nisn: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Kelas / Jabatan */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      {editingVoter.jenis === 'guru' ? 'Jabatan / Mapel' : 'Kelas / Jurusan'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingVoter.kelas}
                      onChange={(e) => setEditingVoter({ ...editingVoter, kelas: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: STICKY SIDEBAR DOCK */}
                <div className="md:col-span-5 bg-[#021810]/90 border border-emerald-500/25 rounded-2xl p-4 space-y-4 md:sticky md:top-2 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                      Aksi & Token
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      EDIT DOCK
                    </span>
                  </div>

                  {/* Top Action Buttons (Always Accessible Beside) */}
                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40 transition-all hover:scale-[1.01]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVoter(null)}
                      className="w-full py-2 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Token Box */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                        Token 5 Digit
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRegenerateToken(true)}
                        className="text-emerald-300 hover:text-orange-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate Baru</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={5}
                      value={editingVoter.token}
                      onChange={(e) =>
                        setEditingVoter({
                          ...editingVoter,
                          token: e.target.value.replace(/\D/g, '').slice(0, 5),
                        })
                      }
                      className="w-full px-3 py-2 font-mono font-bold text-center text-xl rounded-xl border border-orange-500/40 bg-[#062c20] tracking-widest text-orange-400 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Mini Card Preview */}
                  <div className="p-3 bg-[#06291d]/60 rounded-xl border border-emerald-500/20 text-xs space-y-1 text-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Pratinjau Pemilih
                    </span>
                    <p className="font-bold text-white truncate">{editingVoter.nama}</p>
                    <p className="text-[11px] text-emerald-300/80 truncate">
                      {editingVoter.nisn} · {editingVoter.kelas}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Konfirmasi Hapus (Dark Glassmorphism) */}
      {deletingVoter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#031d14] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-500/40 text-center animate-in fade-in duration-150 text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Hapus Data Pemilih?
            </h3>
            <p className="text-xs text-emerald-200/80 mb-5 leading-relaxed">
              Anda akan menghapus pemilih <strong className="text-orange-400">{deletingVoter.nama}</strong> ({deletingVoter.kelas}) dengan token <span className="font-mono font-bold text-white">{deletingVoter.token}</span>.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeletingVoter(null)}
                className="py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-md cursor-pointer border border-rose-400/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Import XLSX (Dark Glassmorphism) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#031d14]/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-500/30 text-white animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/80 text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Import Pemilih dari Berkas Excel (.xlsx)
                  </h3>
                  <span className="text-[11px] text-emerald-300/80">
                    Otomatis generate token 5 digit untuk setiap pemilih
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-emerald-400 hover:text-white p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/20 hover:border-orange-500/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template notice */}
              <div className="p-3.5 bg-emerald-950/70 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                <span>Belum memiliki format berkas yang sesuai?</span>
                <button
                  type="button"
                  onClick={downloadVoterTemplate}
                  className="font-bold underline text-orange-400 hover:text-orange-300 shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template</span>
                </button>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-6 text-center hover:border-orange-500/50 transition-colors bg-[#021810]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excelFileInput"
                />
                <label
                  htmlFor="excelFileInput"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <UploadCloud className="w-10 h-10 text-orange-400 mb-2" />
                  <span className="text-xs font-bold text-white">
                    Pilih Berkas Excel (.xlsx)
                  </span>
                  <span className="text-[11px] text-emerald-400/60 mt-0.5">
                    Klik untuk memilih berkas dari komputer Anda
                  </span>
                </label>
              </div>

              {importLoading && (
                <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
                  <span>Membaca data lembar kerja Excel...</span>
                </div>
              )}

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Import Preview */}
              {importPreview && importPreview.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      Pratinjau Data Ditemukan:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                      {importPreview.length} Data Pemilih Siap
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-200 text-xs">
                    {importPreview.slice(0, 4).map((p, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-900">{p.nama}</span>
                          <span className="text-slate-500 text-[11px] ml-1">({p.kelas})</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] shrink-0">
                          {p.token}
                        </span>
                      </div>
                    ))}
                    {importPreview.length > 4 && (
                      <div className="text-[11px] text-slate-400 py-1 text-center">
                        + {importPreview.length - 4} pemilih lainnya
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!importPreview || importPreview.length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Tambahkan {importPreview ? importPreview.length : 0} Pemilih ke DPT</span>
                </button>
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
