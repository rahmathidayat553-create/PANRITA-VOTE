import React, { useState } from 'react';
import { PengaturanPemilihan } from '../../data/dummy';
import { SafeImage } from '../SafeImage';
import { Settings, Save, CheckCircle2, Shield, Calendar, Link } from 'lucide-react';

interface AdminPemilihanProps {
  pengaturan: PengaturanPemilihan;
  onUpdatePengaturan: (newSettings: PengaturanPemilihan) => void;
}

export const AdminPemilihan: React.FC<AdminPemilihanProps> = ({
  pengaturan,
  onUpdatePengaturan,
}) => {
  const [form, setForm] = useState<PengaturanPemilihan>({ ...pengaturan });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePengaturan(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Umum Pemilihan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola parameter identitas sekolah, periode waktu, status pemungutan suara, dan token admin.
            </p>
          </div>
          {isSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Perubahan Disimpan</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Pemilihan
              </label>
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subjudul / Periode
              </label>
              <input
                type="text"
                value={form.subjudul}
                onChange={(e) => setForm({ ...form, subjudul: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={form.sekolah}
                onChange={(e) => setForm({ ...form, sekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Pemilihan
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as 'aktif' | 'ditutup' | 'persiapan',
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white font-medium"
              >
                <option value="aktif">Sedang Berlangsung (Aktif)</option>
                <option value="persiapan">Tahap Persiapan (Belum Dibuka)</option>
                <option value="ditutup">Pemilihan Ditutup</option>
              </select>
            </div>
          </div>

          {/* Logo URL Input with Live SafeImage Preview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Link URL Logo Sekolah (Tautan HTTPS)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://domain.com/logo.png"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                />
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Preview Box */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">Pratinjau:</span>
                <div className="w-12 h-12 rounded-xl border border-slate-300 bg-white p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                  <SafeImage
                    src={form.logoUrl}
                    alt="Logo SMKN 9 Bulukumba"
                    fallbackInitial="9B"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Sesuai aturan sistem, gambar dimuat dari tautan URL HTTPS langsung tanpa fitur upload file lokal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Waktu Mulai Pemilihan
              </label>
              <input
                type="text"
                value={form.tanggalMulai}
                onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Waktu Selesai Pemilihan
              </label>
              <input
                type="text"
                value={form.tanggalSelesai}
                onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Token Khusus Admin / Panitia
            </label>
            <input
              type="text"
              value={form.tokenAdmin}
              onChange={(e) => setForm({ ...form, tokenAdmin: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase font-bold text-emerald-900 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Token ini digunakan untuk otentikasi masuk ke Panel Admin.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
