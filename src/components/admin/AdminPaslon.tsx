import React, { useState } from 'react';
import { Paslon } from '../../data/dummy';
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
  Link,
  Eye,
  Camera,
} from 'lucide-react';

/**
 * Petunjuk ukuran dan rasio foto kandidat paslon
 */
const PhotoGuidanceBox: React.FC = () => (
  <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs space-y-2">
    <div className="flex items-center gap-1.5 font-bold text-amber-900">
      <Camera className="w-4 h-4 text-amber-700 shrink-0" />
      <span>Petunjuk Ukuran Foto Kandidat yang Disarankan:</span>
    </div>
    <ul className="text-[11px] text-amber-900/90 space-y-1.5 pl-4 list-disc">
      <li>
        <strong>Rasio Aspek Terbaik:</strong>{' '}
        <span className="font-semibold text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-amber-300">
          4:3 (Landscape)
        </span>{' '}
        atau{' '}
        <span className="font-semibold text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-amber-300">
          1:1 (Persegi)
        </span>{' '}
        agar calon Ketua dan Wakil tampil berdampingan seimbang tanpa terpotong di layar bilik suara.
      </li>
      <li>
        <strong>Dimensi / Resolusi Optimal:</strong> Disarankan{' '}
        <strong className="font-mono text-emerald-900">800 × 600 px</strong> (atau 600 × 600 px), maksimum 1200 px. Foto beresolusi pas akan tampil tajam sekaligus sangat cepat dimuat di bilik suara pemilih.
      </li>
      <li>
        <strong>Format Berkas:</strong> Tautan langsung HTTPS publik berekstensi{' '}
        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px] text-amber-900 border border-amber-200">.jpg</code>,{' '}
        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px] text-amber-900 border border-amber-200">.png</code>, atau{' '}
        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px] text-amber-900 border border-amber-200">.webp</code>.
      </li>
      <li>
        <strong>Komposisi Subjek:</strong> Foto bersama Ketua & Wakil setengah badan (*medium close-up*), posisi wajah di area tengah (*centered*) dengan seragam OSIS / almamater rapi berlatar polos (merah/biru/putih).
      </li>
    </ul>
  </div>
);

interface AdminPaslonProps {
  paslonList: Paslon[];
  onAddPaslon: (paslon: Paslon) => void;
  onUpdatePaslon: (updated: Paslon) => void;
  onDeletePaslon: (id: string) => void;
}

export const AdminPaslon: React.FC<AdminPaslonProps> = ({
  paslonList,
  onAddPaslon,
  onUpdatePaslon,
  onDeletePaslon,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
  const [formMisi, setFormMisi] = useState<string[]>(['Meningkatkan kedisiplinan dan literasi digital siswa.']);
  const [formError, setFormError] = useState<string | null>(null);

  const resetAddForm = () => {
    const nextNo =
      paslonList.length > 0 ? Math.max(...paslonList.map((p) => p.nomorUrut)) + 1 : 1;
    setFormNomor(nextNo);
    setFormFotoUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80');
    setFormNamaKetua('');
    setFormKelasKetua('');
    setFormNamaWakil('');
    setFormKelasWakil('');
    setFormVisi('');
    setFormMisi(['Meningkatkan kedisiplinan dan keaktifan organisasi siswa.']);
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setIsAddModalOpen(true);
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

    if (
      !formNamaKetua.trim() ||
      !formKelasKetua.trim() ||
      !formNamaWakil.trim() ||
      !formKelasWakil.trim() ||
      !formVisi.trim()
    ) {
      setFormError('Harap lengkapi nama ketua, wakil, kelas, dan visi.');
      return;
    }

    const cleanMisi = formMisi.filter((m) => m.trim().length > 0);
    if (cleanMisi.length === 0) {
      setFormError('Harap isi minimal 1 poin misi.');
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
    setIsAddModalOpen(false);
    setSuccessMessage(`Pasangan Calon No. ${newPaslon.nomorUrut} berhasil ditambahkan.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaslon) return;

    onUpdatePaslon(editingPaslon);
    setSuccessMessage(`Data Pasangan Calon No. ${editingPaslon.nomorUrut} berhasil diperbarui.`);
    setEditingPaslon(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingPaslon) {
      onDeletePaslon(deletingPaslon.id);
      setSuccessMessage(`Pasangan Calon No. ${deletingPaslon.nomorUrut} berhasil dihapus.`);
      setDeletingPaslon(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Manajemen Pasangan Calon (Kandidat)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data kandidat Ketua & Wakil Ketua, foto resmi surat suara, visi, dan misi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {successMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Paslon</span>
          </button>
        </div>
      </div>

      {/* Quick Photo Tip Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-200/80 flex items-center justify-center text-emerald-900 shrink-0">
            <Camera className="w-4 h-4 text-emerald-800" />
          </div>
          <span>
            <strong>Panduan Foto Surat Suara:</strong> Disarankan foto berdua rasio <strong>4:3 (Landscape)</strong> resolusi <strong>800 × 600 px</strong> dengan seragam rapi dan wajah di tengah agar pas 1 layar di bilik suara.
          </span>
        </div>
      </div>

      {/* Grid of Paslon Cards */}
      {paslonList.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <Users2 className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Pasangan Calon Terdaftar</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Sistem database telah aktif dan bersih. Silakan daftarkan Paslon No. 1 untuk pemilihan OSIS SMKN 9 Bulukumba.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Paslon Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paslonList.map((paslon) => (
          <div
            key={paslon.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Card Header with Nomor Urut & Actions */}
              <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500 text-emerald-950 font-black flex items-center justify-center text-sm shadow-xs">
                    {paslon.nomorUrut}
                  </span>
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider">
                      Nomor Urut
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-white">
                      Paslon {paslon.nomorUrut}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPaslon({ ...paslon, misi: [...paslon.misi] })}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    title="Ubah paslon"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPaslon(paslon)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    title="Hapus paslon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Single Joint Candidate Photo */}
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-300 shadow-2xs mb-2">
                  <SafeImage
                    src={paslon.fotoUrl}
                    alt={`Paslon ${paslon.nomorUrut}: ${paslon.namaKetua} & ${paslon.namaWakil}`}
                    fallbackInitial={`P${paslon.nomorUrut}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {paslon.namaKetua} (Ketua)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 block truncate">
                    & {paslon.namaWakil} (Wakil)
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    {paslon.kelasKetua} · {paslon.kelasWakil}
                  </span>
                </div>
              </div>

              {/* Visi & Misi */}
              <div className="p-4 text-xs space-y-3">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px] mb-1">
                    Visi:
                  </span>
                  <p className="text-slate-600 line-clamp-2 italic">"{paslon.visi}"</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px] mb-1">
                    Misi ({paslon.misi.length} poin):
                  </span>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {paslon.misi.slice(0, 2).map((m, idx) => (
                      <li key={idx} className="line-clamp-1">{m}</li>
                    ))}
                    {paslon.misi.length > 2 && (
                      <li className="text-slate-400 list-none">+ {paslon.misi.length - 2} misi lainnya</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Perolehan Suara Internal:</span>
              <span className="font-mono font-bold text-slate-900">{paslon.suaraPerolehan} suara</span>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* 1. Modal Tambah Paslon Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-emerald-800" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Pasangan Calon Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Nomor Urut & Foto URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Urut
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formNomor}
                    onChange={(e) => setFormNomor(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-center text-sm focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Link URL Foto Paslon (Berdua / HTTPS)
                  </label>
                  <input
                    type="url"
                    required
                    value={formFotoUrl}
                    onChange={(e) => setFormFotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Petunjuk Ukuran Foto yang Disarankan */}
              <PhotoGuidanceBox />

              {/* Live Preview Foto jika URL diisi */}
              {formFotoUrl && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="w-20 h-15 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-white">
                    <SafeImage
                      src={formFotoUrl}
                      alt="Pratinjau Foto Paslon"
                      fallbackInitial={`P${formNomor}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">
                      Pratinjau Tampilan Foto (Rasio 4:3 Bilik Suara)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pastikan wajah calon ketua dan wakil tampil jelas berdampingan di tengah bingkai.
                    </span>
                  </div>
                </div>
              )}

              {/* Ketua & Wakil Identitas */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-2">
                    Calon Ketua
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Ketua"
                      value={formNamaKetua}
                      onChange={(e) => setFormNamaKetua(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Kelas Ketua (contoh: XI TJKT)"
                      value={formKelasKetua}
                      onChange={(e) => setFormKelasKetua(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-2">
                    Calon Wakil Ketua
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Wakil"
                      value={formNamaWakil}
                      onChange={(e) => setFormNamaWakil(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Kelas Wakil (contoh: X AKL)"
                      value={formKelasWakil}
                      onChange={(e) => setFormKelasWakil(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Visi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Visi Pasangan Calon
                </label>
                <textarea
                  rows={2}
                  required
                  value={formVisi}
                  onChange={(e) => setFormVisi(e.target.value)}
                  placeholder="Ketik visi program kerja paslon..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {/* Misi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Poin-Poin Misi
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddMissionField(false)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Misi</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formMisi.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => handleMissionChange(idx, e.target.value, false)}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                        placeholder={`Misi ${idx + 1}`}
                      />
                      {formMisi.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMissionField(idx, false)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Paslon Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Edit Paslon */}
      {editingPaslon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-slate-900">
                  Ubah Paslon No. {editingPaslon.nomorUrut}
                </h3>
              </div>
              <button
                onClick={() => setEditingPaslon(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Foto URL Paslon */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                    Link URL Foto Pasangan Calon (Berdua / Surat Suara)
                  </label>
                  <input
                    type="url"
                    value={editingPaslon.fotoUrl}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, fotoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                    placeholder="https://..."
                  />
                </div>

                {/* Petunjuk Ukuran Foto yang Disarankan */}
                <PhotoGuidanceBox />

                {/* Pratinjau Foto Live */}
                {editingPaslon.fotoUrl && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="w-20 h-15 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-50">
                      <SafeImage
                        src={editingPaslon.fotoUrl}
                        alt="Pratinjau Foto Paslon"
                        fallbackInitial={`P${editingPaslon.nomorUrut}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">
                        Pratinjau Tampilan Foto Paslon No. {editingPaslon.nomorUrut} (Rasio 4:3)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pastikan kedua calon tampak seimbang di tengah bingkai surat suara.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Ketua */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  Data Calon Ketua
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editingPaslon.namaKetua}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, namaKetua: e.target.value })
                    }
                    placeholder="Nama Ketua"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={editingPaslon.kelasKetua}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, kelasKetua: e.target.value })
                    }
                    placeholder="Kelas Ketua"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Data Wakil */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  Data Calon Wakil Ketua
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editingPaslon.namaWakil}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, namaWakil: e.target.value })
                    }
                    placeholder="Nama Wakil"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={editingPaslon.kelasWakil}
                    onChange={(e) =>
                      setEditingPaslon({ ...editingPaslon, kelasWakil: e.target.value })
                    }
                    placeholder="Kelas Wakil"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Visi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Visi Paslon
                </label>
                <textarea
                  rows={2}
                  value={editingPaslon.visi}
                  onChange={(e) =>
                    setEditingPaslon({ ...editingPaslon, visi: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {/* Misi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Poin-Poin Misi
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddMissionField(true)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Misi</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {editingPaslon.misi.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => handleMissionChange(idx, e.target.value, true)}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                        placeholder={`Misi ${idx + 1}`}
                      />
                      {editingPaslon.misi.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMissionField(idx, true)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPaslon(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Konfirmasi Hapus Paslon */}
      {deletingPaslon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Hapus Pasangan Calon?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Anda akan menghapus <strong className="text-slate-900">Paslon No. {deletingPaslon.nomorUrut}</strong> ({deletingPaslon.namaKetua} & {deletingPaslon.namaWakil}). Data perolehan suara paslon ini juga akan terhapus.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeletingPaslon(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
