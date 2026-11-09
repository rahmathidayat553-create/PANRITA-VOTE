import React, { useState } from 'react';
import { Paslon } from '../../data/dummy';
import { ToastData } from '../Toast';
import { SafeImage } from '../SafeImage';
import {
  Users2,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Plus,
  Trash2,
  UserPlus,
  AlertTriangle,
  Camera,
  Lock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

/**
 * Petunjuk ukuran dan rasio foto kandidat paslon
 */
const PhotoGuidanceBox: React.FC = () => (
  <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-500/30 text-orange-200 text-xs space-y-2">
    <div className="flex items-center gap-1.5 font-bold text-orange-400">
      <Camera className="w-4 h-4 text-orange-400 shrink-0" />
      <span>Petunjuk Ukuran Foto Kandidat Resmi:</span>
    </div>
    <ul className="text-[11px] text-orange-200/90 space-y-1.5 pl-4 list-disc">
      <li>
        <strong>Rasio Aspek Terbaik:</strong>{' '}
        <span className="font-semibold text-white bg-orange-900/60 px-1.5 py-0.5 rounded border border-orange-500/40">
          4:3 (Landscape)
        </span>{' '}
        atau{' '}
        <span className="font-semibold text-white bg-orange-900/60 px-1.5 py-0.5 rounded border border-orange-500/40">
          1:1 (Persegi)
        </span>{' '}
        agar calon Ketua & Wakil tampil seimbang tanpa terpotong di bilik suara.
      </li>
      <li>
        <strong>Dimensi Optimal:</strong> Disarankan{' '}
        <strong className="font-mono text-orange-300">800 × 600 px</strong> (maks 1200 px). Ringan & cepat dimuat di TPS.
      </li>
      <li>
        <strong>Format:</strong> Tautan langsung HTTPS publik berekstensi{' '}
        <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px] text-orange-300 border border-orange-500/30">.jpg</code>,{' '}
        <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px] text-orange-300 border border-orange-500/30">.png</code>, atau{' '}
        <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px] text-orange-300 border border-orange-500/30">.webp</code>.
      </li>
    </ul>
  </div>
);

interface AdminPaslonProps {
  paslonList: Paslon[];
  isElectionActive?: boolean;
  statusPemilihan?: 'aktif' | 'ditutup' | 'persiapan';
  onAddPaslon: (paslon: Paslon) => void;
  onUpdatePaslon: (updated: Paslon) => void;
  onDeletePaslon: (id: string) => void;
  onShowToast?: (data: ToastData) => void;
}

export const AdminPaslon: React.FC<AdminPaslonProps> = ({
  paslonList,
  isElectionActive = false,
  statusPemilihan,
  onAddPaslon,
  onUpdatePaslon,
  onDeletePaslon,
  onShowToast,
}) => {
  const isLocked = isElectionActive || statusPemilihan === 'aktif';

  // Subview states: 'list' | 'add' | 'edit'
  const [subView, setSubView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingPaslon, setEditingPaslon] = useState<Paslon | null>(null);
  const [deletingPaslon, setDeletingPaslon] = useState<Paslon | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Paslon Form State
  const nextNomorUrut =
    paslonList.length > 0 ? Math.max(...paslonList.map((p) => p.nomorUrut)) + 1 : 1;

  const [formNomor, setFormNomor] = useState<number>(nextNomorUrut);
  const [formFotoUrl, setFormFotoUrl] = useState('');
  const [formNamaKetua, setFormNamaKetua] = useState('');
  const [formKelasKetua, setFormKelasKetua] = useState('');
  const [formNamaWakil, setFormNamaWakil] = useState('');
  const [formKelasWakil, setFormKelasWakil] = useState('');
  const [formVisi, setFormVisi] = useState('');
  const [formMisi, setFormMisi] = useState<string[]>([
    'Meningkatkan kedisiplinan dan literasi digital siswa.',
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const resetAddForm = () => {
    const nextNo =
      paslonList.length > 0 ? Math.max(...paslonList.map((p) => p.nomorUrut)) + 1 : 1;
    setFormNomor(nextNo);
    setFormFotoUrl(
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
    );
    setFormNamaKetua('');
    setFormKelasKetua('');
    setFormNamaWakil('');
    setFormKelasWakil('');
    setFormVisi('');
    setFormMisi(['Meningkatkan kedisiplinan dan keaktifan organisasi siswa.']);
    setFormError(null);
  };

  const handleOpenAdd = () => {
    if (isLocked) {
      onShowToast?.({
        type: 'warning',
        title: 'Aksi Kandidat Terkunci',
        message:
          'Pemilihan sedang berlangsung (Status: Aktif). Penambahan kandidat dikunci demi integritas suara.',
        code: '[LOCK_ACTIVE // ELECTION_RUNNING]',
        duration: 3500,
      });
      return;
    }
    resetAddForm();
    setSubView('add');
  };

  const handleAddMissionField = (isEdit = false) => {
    if (isEdit && editingPaslon) {
      setEditingPaslon({
        ...editingPaslon,
        misi: [...editingPaslon.misi, ''],
      });
    } else {
      setFormMisi([...formMisi, '']);
    }
  };

  const handleRemoveMissionField = (index: number, isEdit = false) => {
    if (isEdit && editingPaslon) {
      setEditingPaslon({
        ...editingPaslon,
        misi: editingPaslon.misi.filter((_, i) => i !== index),
      });
    } else {
      setFormMisi(formMisi.filter((_, i) => i !== index));
    }
  };

  const handleMissionChange = (index: number, val: string, isEdit = false) => {
    if (isEdit && editingPaslon) {
      const nextMisi = [...editingPaslon.misi];
      nextMisi[index] = val;
      setEditingPaslon({ ...editingPaslon, misi: nextMisi });
    } else {
      const nextMisi = [...formMisi];
      nextMisi[index] = val;
      setFormMisi(nextMisi);
    }
  };

  // Submit Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isLocked) {
      const msg = 'Penambahan kandidat dikunci saat pemilihan berlangsung.';
      setFormError(msg);
      onShowToast?.({
        type: 'error',
        title: 'Operasi Ditolak',
        message: msg,
        code: '[LOCK_DENIED // ELECTION_RUNNING]',
        duration: 3500,
      });
      return;
    }

    if (
      !formNamaKetua.trim() ||
      !formKelasKetua.trim() ||
      !formNamaWakil.trim() ||
      !formKelasWakil.trim() ||
      !formVisi.trim()
    ) {
      const msg = 'Harap lengkapi nama ketua, wakil, kelas, dan visi.';
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

    const cleanMisi = formMisi.filter((m) => m.trim().length > 0);
    if (cleanMisi.length === 0) {
      const msg = 'Harap isi minimal 1 poin misi program kerja.';
      setFormError(msg);
      onShowToast?.({
        type: 'warning',
        title: 'Misi Masih Kosong',
        message: msg,
        code: '[VALIDATION_FAIL]',
        duration: 3000,
      });
      return;
    }

    const newPaslon: Paslon = {
      id: `paslon-${Date.now()}`,
      nomorUrut: formNomor,
      namaKetua: formNamaKetua.trim(),
      kelasKetua: formKelasKetua.trim(),
      namaWakil: formNamaWakil.trim(),
      kelasWakil: formKelasWakil.trim(),
      fotoUrl:
        formFotoUrl.trim() ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
      fotoKetuaUrl: formFotoUrl.trim() || '',
      fotoWakilUrl: formFotoUrl.trim() || '',
      visi: formVisi.trim(),
      misi: cleanMisi,
      suaraPerolehan: 0,
    };

    onAddPaslon(newPaslon);
    setSubView('list');
    setSuccessMessage(`Paslon No. ${newPaslon.nomorUrut} berhasil ditambahkan.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaslon) return;

    if (isLocked) {
      onShowToast?.({
        type: 'error',
        title: 'Operasi Ditolak',
        message: 'Kandidat tidak dapat diubah saat pemilihan aktif.',
        code: '[LOCK_DENIED // ELECTION_RUNNING]',
        duration: 3500,
      });
      return;
    }

    onUpdatePaslon(editingPaslon);
    setSuccessMessage(`Data Paslon No. ${editingPaslon.nomorUrut} berhasil diperbarui.`);
    setEditingPaslon(null);
    setSubView('list');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (isLocked) {
      onShowToast?.({
        type: 'error',
        title: 'Operasi Ditolak',
        message: 'Kandidat tidak dapat dihapus saat pemilihan aktif.',
        code: '[LOCK_DENIED // ELECTION_RUNNING]',
        duration: 3500,
      });
      setDeletingPaslon(null);
      return;
    }

    if (deletingPaslon) {
      onDeletePaslon(deletingPaslon.id);
      setSuccessMessage(`Paslon No. ${deletingPaslon.nomorUrut} berhasil dihapus.`);
      setDeletingPaslon(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {subView === 'list' && (
        <div className="space-y-6">
          {/* Top Header Card (Dark Emerald Glassmorphism) */}
          <div className="p-6 rounded-3xl bg-[#042017]/80 backdrop-blur-xl border border-emerald-500/25 shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Manajemen Pasangan Calon (Kandidat)
                </h2>
              </div>
              <p className="text-xs text-emerald-200/80 max-w-xl">
                Kelola data kandidat Ketua & Wakil Ketua OSIS, foto resmi surat suara 4:3, visi, dan rincian program kerja.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {successMessage && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/40 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                onClick={handleOpenAdd}
                disabled={isLocked}
                title={isLocked ? 'Penambahan kandidat dikunci saat pemilihan berlangsung' : 'Tambah Paslon'}
                className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2 ${
                  isLocked
                    ? 'bg-emerald-950/40 text-emerald-600 border border-emerald-900 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white cursor-pointer shadow-orange-950/40 border border-orange-400/40 hover:-translate-y-0.5'
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4 text-orange-400" /> : <UserPlus className="w-4 h-4" />}
                <span>{isLocked ? 'Terkunci (Pemilihan Aktif)' : '+ Tambah Paslon'}</span>
              </button>
            </div>
          </div>

          {/* Lock Notice Banner when Election is Active */}
          {isLocked && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-emerald-950/80 border border-orange-500/40 backdrop-blur-md text-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/40">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/40 shadow-xs">
                  <Lock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-orange-300">
                      Data Paslon Dikunci (Pemilihan Sedang Aktif)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/30 text-orange-300 border border-orange-400/40">
                      STATUS: AKTIF
                    </span>
                  </div>
                  <p className="text-xs text-orange-200/90 mt-0.5">
                    Penambahan, pengeditan, dan penghapusan kandidat dinonaktifkan demi integritas suara bilik suara. Untuk mengedit, ubah status pemilihan ke <strong>Tahap Persiapan</strong> atau <strong>Ditutup</strong> di menu Pengaturan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INLINE CONFIRMATION BANNER FOR DELETION (NO FLOATING MODAL) */}
          {deletingPaslon && (
            <div className="p-5 rounded-3xl bg-rose-950/80 border-2 border-rose-500/60 shadow-2xl text-white animate-in fade-in duration-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-900/90 text-rose-300 border border-rose-400/40 flex items-center justify-center shrink-0 shadow-md">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Hapus Paslon No. {deletingPaslon.nomorUrut}?</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 uppercase">
                      KONFIRMASI_HAPUS
                    </span>
                  </h4>
                  <p className="text-xs text-rose-200/90 mt-0.5">
                    Anda akan menghapus data <strong className="text-white font-bold">{deletingPaslon.namaKetua} & {deletingPaslon.namaWakil}</strong>. Data perolehan suara paslon ini juga akan terhapus.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setDeletingPaslon(null)}
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
                  <span>Ya, Hapus Paslon</span>
                </button>
              </div>
            </div>
          )}

          {/* Grid of Paslon Cards (3D Hover Depth Glassmorphism) */}
          {paslonList.length === 0 ? (
        <div className="p-10 text-center bg-[#042017]/70 backdrop-blur-md rounded-3xl border border-dashed border-emerald-500/30 space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Users2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Belum Ada Pasangan Calon Terdaftar</h3>
            <p className="text-xs text-emerald-300/70 max-w-sm mx-auto mt-1">
              Sistem database telah aktif dan siap diisi. Silakan daftarkan Paslon No. 1 untuk pemilihan OSIS SMKN 9 Bulukumba.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            disabled={isLocked}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 ${
              isLocked
                ? 'bg-emerald-950/40 text-emerald-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white cursor-pointer border border-orange-400/40'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4 text-orange-400" /> : <UserPlus className="w-4 h-4" />}
            <span>{isLocked ? 'Kandidat Terkunci' : '+ Tambah Paslon Pertama'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paslonList.map((paslon) => (
            <div
              key={paslon.id}
              className="group bg-[#042017]/75 backdrop-blur-md rounded-3xl border border-emerald-500/25 overflow-hidden shadow-xl shadow-black/50 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/40"
            >
              <div>
                {/* Card Header with Nomor Urut & Actions */}
                <div className="bg-gradient-to-r from-emerald-950/90 to-[#031d14]/90 p-4 flex items-center justify-between border-b border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-orange-950/50 border border-orange-400/40">
                      {paslon.nomorUrut}
                    </span>
                    <div>
                      <span className="text-[10px] text-orange-400 font-bold uppercase block tracking-wider">
                        Nomor Urut
                      </span>
                      <span className="font-bold text-sm text-white">
                        Paslon {paslon.nomorUrut}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={isLocked}
                      onClick={() => {
                        if (isLocked) {
                          onShowToast?.({
                            type: 'warning',
                            title: 'Aksi Kandidat Terkunci',
                            message: 'Kandidat tidak dapat diubah saat pemilihan berlangsung.',
                            code: '[LOCK_ACTIVE // ELECTION_RUNNING]',
                            duration: 3000,
                          });
                          return;
                        }
                        setEditingPaslon({ ...paslon, misi: [...paslon.misi] });
                        setSubView('edit');
                      }}
                      className={`p-2 rounded-xl text-xs font-medium transition-all ${
                        isLocked
                          ? 'bg-emerald-950/40 text-emerald-800 cursor-not-allowed'
                          : 'bg-emerald-900/60 hover:bg-orange-500/20 hover:text-orange-300 text-emerald-300 border border-emerald-500/20 cursor-pointer'
                      }`}
                      title={isLocked ? 'Kandidat dikunci saat pemilihan berlangsung' : 'Ubah paslon'}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5 text-emerald-700" /> : <Edit3 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      disabled={isLocked}
                      onClick={() => {
                        if (isLocked) {
                          onShowToast?.({
                            type: 'warning',
                            title: 'Aksi Kandidat Terkunci',
                            message: 'Kandidat tidak dapat dihapus saat pemilihan berlangsung.',
                            code: '[LOCK_ACTIVE // ELECTION_RUNNING]',
                            duration: 3000,
                          });
                          return;
                        }
                        setDeletingPaslon(paslon);
                      }}
                      className={`p-2 rounded-xl text-xs font-medium transition-all ${
                        isLocked
                          ? 'bg-emerald-950/40 text-emerald-800 cursor-not-allowed'
                          : 'bg-emerald-900/60 hover:bg-rose-900/60 hover:text-rose-300 text-rose-400 border border-emerald-500/20 cursor-pointer'
                      }`}
                      title={isLocked ? 'Kandidat dikunci saat pemilihan berlangsung' : 'Hapus paslon'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Candidate Joint Photo */}
                <div className="p-4 bg-black/20 border-b border-emerald-500/15">
                  <div className="w-full aspect-4/3 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md mb-3 bg-[#02130c]">
                    <SafeImage
                      src={paslon.fotoUrl}
                      alt={`Paslon ${paslon.nomorUrut}: ${paslon.namaKetua} & ${paslon.namaWakil}`}
                      fallbackInitial={`P${paslon.nomorUrut}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-white block truncate">
                      {paslon.namaKetua} (Ketua)
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-300/90 block truncate">
                      & {paslon.namaWakil} (Wakil)
                    </span>
                    <span className="text-[10px] text-emerald-400/60 block truncate mt-0.5">
                      {paslon.kelasKetua} · {paslon.kelasWakil}
                    </span>
                  </div>
                </div>

                {/* Visi & Misi */}
                <div className="p-4 text-xs space-y-3">
                  <div>
                    <span className="font-bold text-orange-400 uppercase tracking-wider block text-[10px] mb-1">
                      Visi:
                    </span>
                    <p className="text-emerald-100/90 line-clamp-2 italic text-[11px]">
                      "{paslon.visi}"
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px] mb-1">
                      Misi ({paslon.misi.length} poin):
                    </span>
                    <ul className="space-y-1 text-emerald-200/80 list-disc list-inside text-[11px]">
                      {paslon.misi.slice(0, 2).map((m, idx) => (
                        <li key={idx} className="line-clamp-1">{m}</li>
                      ))}
                      {paslon.misi.length > 2 && (
                        <li className="text-orange-400/80 list-none font-medium">
                          + {paslon.misi.length - 2} misi lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/40 border-t border-emerald-500/15 flex items-center justify-between text-xs text-emerald-300/80">
                <span>Perolehan Suara:</span>
                <span className="font-mono font-bold text-orange-400 text-sm">
                  {paslon.suaraPerolehan} suara
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      )}

      {/* 1. SUBVIEW TAMBAH PASLON BARU - HALAMAN PENUH */}
      {subView === 'add' && (
        <div className="bg-[#031d14]/95 backdrop-blur-2xl rounded-3xl w-full p-5 sm:p-8 shadow-2xl border border-emerald-500/30 text-white animate-in fade-in duration-200">
          {/* Header Subview & Tombol Kembali */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubView('list');
                  resetAddForm();
                }}
                className="p-2.5 rounded-xl bg-[#021810] border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-orange-500/50 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Paslon</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Tambah Pasangan Calon Baru
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    HALAMAN FORM PENUH
                  </span>
                </div>
                <span className="text-xs text-emerald-300/80">
                  Lengkapi data nomor urut, foto resmi surat suara, calon ketua & wakil, serta visi misi
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubView('list');
                resetAddForm();
              }}
              className="self-start sm:self-auto px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 hover:text-white transition-colors cursor-pointer"
            >
              Batal & Kembali
            </button>
          </div>

          <form onSubmit={handleSaveAdd}>
            {/* TWO-COLUMN FULL-PAGE LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Input Fields */}
              <div className="lg:col-span-7 space-y-5">
                {/* Nomor Urut & URL Foto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1.5">
                      Nomor Urut
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formNomor}
                      onChange={(e) => setFormNomor(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-emerald-500/30 bg-[#06291d] font-mono font-bold text-center text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none shadow-inner"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                      Link URL Foto Paslon (Berdua / HTTPS)
                    </label>
                    <input
                      type="url"
                      required
                      value={formFotoUrl}
                      onChange={(e) => setFormFotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none shadow-inner"
                    />
                  </div>
                </div>

                {/* Identitas Calon Ketua & Wakil */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#06291d]/80 border border-emerald-500/25 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-2">
                      Calon Ketua OSIS
                    </span>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Nama Lengkap Ketua"
                        value={formNamaKetua}
                        onChange={(e) => setFormNamaKetua(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Kelas (cth: XI TJKT 1)"
                        value={formKelasKetua}
                        onChange={(e) => setFormKelasKetua(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-2">
                      Calon Wakil Ketua OSIS
                    </span>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Nama Lengkap Wakil"
                        value={formNamaWakil}
                        onChange={(e) => setFormNamaWakil(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Kelas (cth: X AKL 2)"
                        value={formKelasWakil}
                        onChange={(e) => setFormKelasWakil(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Visi */}
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                    Visi Pasangan Calon
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formVisi}
                    onChange={(e) => setFormVisi(e.target.value)}
                    placeholder="Ketik visi program kerja paslon..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Misi */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      Poin-Poin Misi Program Kerja
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddMissionField(false)}
                      className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Butir Misi</span>
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {formMisi.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={m}
                          onChange={(e) => handleMissionChange(idx, e.target.value, false)}
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                          placeholder={`Misi ${idx + 1}`}
                        />
                        {formMisi.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMissionField(idx, false)}
                            className="p-2 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer bg-rose-950/40 border border-rose-500/20"
                            title="Hapus butir misi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: STICKY SIDEBAR ACTION DOCK */}
              <div className="lg:col-span-5 bg-[#021810]/95 border border-emerald-500/25 rounded-2xl p-5 space-y-5 lg:sticky lg:top-4 shadow-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Panel Aksi Cepat</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    PASLON #{formNomor}
                  </span>
                </div>

                {/* Primary Save & Cancel Buttons Directly Accessible on Side */}
                <div className="space-y-2.5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40 transition-all hover:scale-[1.01]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Paslon Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubView('list');
                      resetAddForm();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 hover:text-white transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Live Card Preview Box */}
                <div className="p-3.5 bg-black/40 rounded-xl border border-emerald-500/20 space-y-2.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Pratinjau Tampilan Surat Suara
                  </span>
                  <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-emerald-500/30 bg-[#06291d]">
                    <SafeImage
                      src={formFotoUrl}
                      alt="Pratinjau Foto Paslon"
                      fallbackInitial={`P${formNomor}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center pt-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {formNamaKetua || 'Nama Calon Ketua'}
                    </span>
                    <span className="text-[11px] font-semibold text-orange-300 block truncate">
                      & {formNamaWakil || 'Nama Calon Wakil'}
                    </span>
                    <span className="text-[10px] text-emerald-300/70 block truncate mt-0.5">
                      {formKelasKetua || 'Kelas Ketua'} · {formKelasWakil || 'Kelas Wakil'}
                    </span>
                  </div>
                </div>

                <PhotoGuidanceBox />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 2. SUBVIEW UBAH PASLON - HALAMAN PENUH */}
      {subView === 'edit' && editingPaslon && (
        <div className="bg-[#031d14]/95 backdrop-blur-2xl rounded-3xl w-full p-5 sm:p-8 shadow-2xl border border-emerald-500/30 text-white animate-in fade-in duration-200">
          {/* Header Subview & Tombol Kembali */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubView('list');
                  setEditingPaslon(null);
                }}
                className="p-2.5 rounded-xl bg-[#021810] border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-orange-500/50 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Paslon</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Ubah Data Paslon No. {editingPaslon.nomorUrut}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    HALAMAN FORM PENUH
                  </span>
                </div>
                <span className="text-xs text-emerald-300/80">
                  Perbarui identitas kandidat, foto surat suara resmi, visi, atau misi program kerja
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubView('list');
                setEditingPaslon(null);
              }}
              className="self-start sm:self-auto px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 hover:text-white transition-colors cursor-pointer"
            >
              Batal & Kembali
            </button>
          </div>

          <form onSubmit={handleSaveEdit}>
            {/* TWO-COLUMN FULL-PAGE LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Input Fields */}
              <div className="lg:col-span-7 space-y-5">
                {/* Foto URL Paslon */}
                <div className="p-4 rounded-2xl bg-[#06291d]/80 border border-emerald-500/20 space-y-2">
                  <label className="block text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                    Link URL Foto Paslon (Berdua / HTTPS)
                  </label>
                  <input
                    type="url"
                    value={editingPaslon.fotoUrl}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, fotoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                {/* Ketua & Wakil */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#06291d]/80 border border-emerald-500/25 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-2">
                      Calon Ketua OSIS
                    </span>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={editingPaslon.namaKetua}
                        onChange={(e) =>
                          setEditingPaslon({ ...editingPaslon, namaKetua: e.target.value })
                        }
                        placeholder="Nama Ketua"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingPaslon.kelasKetua}
                        onChange={(e) =>
                          setEditingPaslon({ ...editingPaslon, kelasKetua: e.target.value })
                        }
                        placeholder="Kelas Ketua"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-2">
                      Calon Wakil Ketua OSIS
                    </span>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={editingPaslon.namaWakil}
                        onChange={(e) =>
                          setEditingPaslon({ ...editingPaslon, namaWakil: e.target.value })
                        }
                        placeholder="Nama Wakil"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingPaslon.kelasWakil}
                        onChange={(e) =>
                          setEditingPaslon({ ...editingPaslon, kelasWakil: e.target.value })
                        }
                        placeholder="Kelas Wakil"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#021810] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Visi */}
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                    Visi Paslon
                  </label>
                  <textarea
                    rows={3}
                    value={editingPaslon.visi}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, visi: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Misi */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      Poin-Poin Misi Program Kerja
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddMissionField(true)}
                      className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Butir Misi</span>
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {editingPaslon.misi.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={m}
                          onChange={(e) => handleMissionChange(idx, e.target.value, true)}
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-500/30 bg-[#06291d] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                          placeholder={`Misi ${idx + 1}`}
                        />
                        {editingPaslon.misi.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMissionField(idx, true)}
                            className="p-2 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer bg-rose-950/40 border border-rose-500/20"
                            title="Hapus butir misi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY SIDEBAR ACTION DOCK */}
              <div className="lg:col-span-5 bg-[#021810]/95 border border-emerald-500/25 rounded-2xl p-5 space-y-5 lg:sticky lg:top-4 shadow-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Panel Aksi Cepat</span>
                  </span>
                  <span className="text-[10px] font-mono text-orange-300 bg-orange-950/80 px-2.5 py-0.5 rounded-full border border-orange-500/40">
                    PASLON #{editingPaslon.nomorUrut}
                  </span>
                </div>

                {/* Primary Save & Cancel Buttons Directly Accessible on Side */}
                <div className="space-y-2.5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40 transition-all hover:scale-[1.01]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubView('list');
                      setEditingPaslon(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/40 hover:text-white transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Live Card Preview Box */}
                <div className="p-3.5 bg-black/40 rounded-xl border border-emerald-500/20 space-y-2.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Pratinjau Hasil Perubahan
                  </span>
                  <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-emerald-500/30 bg-[#06291d]">
                    <SafeImage
                      src={editingPaslon.fotoUrl}
                      alt="Pratinjau Foto Paslon"
                      fallbackInitial={`P${editingPaslon.nomorUrut}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center pt-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {editingPaslon.namaKetua} (Ketua)
                    </span>
                    <span className="text-[11px] font-semibold text-orange-300 block truncate">
                      & {editingPaslon.namaWakil} (Wakil)
                    </span>
                    <span className="text-[10px] text-emerald-300/70 block truncate mt-0.5">
                      {editingPaslon.kelasKetua} · {editingPaslon.kelasWakil}
                    </span>
                  </div>
                </div>

                <PhotoGuidanceBox />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
