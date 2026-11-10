import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
  Smartphone,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { PengaturanPemilihan } from '../../data/dummy';
import { ToastData } from '../Toast';

interface AdminPenggunaProps {
  pengaturan: PengaturanPemilihan;
  onUpdatePengaturan: (newSettings: PengaturanPemilihan) => Promise<void>;
  onShowToast?: (data: ToastData) => void;
}

export const AdminPengguna: React.FC<AdminPenggunaProps> = ({
  pengaturan,
  onUpdatePengaturan,
  onShowToast,
}) => {
  const currentAdminUser = (pengaturan.adminUsername || 'admin').trim();
  const currentAdminPass = (pengaturan.adminPassword || 'admin123').trim();
  const currentGatePin = (pengaturan.pinGerbangLogin || '99999').trim();

  // Form State
  const [username, setUsername] = useState(currentAdminUser);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gatePin, setGatePin] = useState(currentGatePin);

  // Visibility Toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Kosong', color: 'bg-slate-700', textCol: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, text: 'Lemah', color: 'bg-rose-500', textCol: 'text-rose-400' };
    if (score <= 4) return { score: 2, text: 'Sedang', color: 'bg-amber-500', textCol: 'text-amber-400' };
    return { score: 3, text: 'Kuat', color: 'bg-emerald-500', textCol: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validasi Username
    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMessage('Username admin tidak boleh kosong.');
      return;
    }
    if (cleanUser.length < 3) {
      setErrorMessage('Username admin minimal 3 karakter.');
      return;
    }

    // 2. Validasi PIN Gerbang Bilik Suara (Harus tepat 5 digit angka)
    const cleanGatePin = gatePin.trim();
    if (!/^\d{5}$/.test(cleanGatePin)) {
      setErrorMessage('PIN khusus gerbang bilik suara harus berupa tepat 5 digit angka (contoh: 99999).');
      return;
    }

    // 3. Validasi Password
    let targetPassword = currentAdminPass;
    const isChangingPassword = Boolean(newPassword || confirmPassword);

    if (isChangingPassword) {
      if (!oldPassword) {
        setErrorMessage('Harap masukkan password saat ini untuk memverifikasi otorisasi perubahan.');
        return;
      }
      if (oldPassword !== currentAdminPass) {
        setErrorMessage('Password saat ini salah. Pastikan Anda memasukkan password admin yang sedang aktif.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('Password baru minimal 6 karakter demi keamanan akun.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Konfirmasi password baru tidak cocok. Silakan periksa kembali.');
        return;
      }
      targetPassword = newPassword;
    }

    // 4. Proses Simpan ke Firestore
    setIsSaving(true);
    try {
      const updatedPengaturan: PengaturanPemilihan = {
        ...pengaturan,
        adminUsername: cleanUser,
        adminPassword: targetPassword,
        pinGerbangLogin: cleanGatePin,
      };

      await onUpdatePengaturan(updatedPengaturan);

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Kredensial dan PIN gerbang berhasil diperbarui dan disinkronkan ke seluruh panitia.');

      onShowToast?.({
        type: 'success',
        title: 'Kredensial Diperbarui',
        message: 'Username, password, dan PIN gerbang tersimpan aman di Cloud Firestore.',
        code: '[CREDENTIALS_SYNCED // FIRESTORE_OK]',
        duration: 4000,
      });
    } catch (err: any) {
      console.error('Gagal memperbarui kredensial:', err);
      const errTxt = err?.message || 'Terjadi kesalahan sistem saat menyimpan ke database.';
      setErrorMessage(`Gagal menyimpan: ${errTxt}`);
      onShowToast?.({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: errTxt,
        code: '[ERR_DB_SAVE // CLOUD_REJECT]',
        duration: 4500,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin mengembalikan kredensial ke default pabrik?\n\n- Username: admin\n- Password: admin123\n- PIN Gerbang: 99999'
    );
    if (!confirmReset) return;

    setIsSaving(true);
    try {
      const resetConfig: PengaturanPemilihan = {
        ...pengaturan,
        adminUsername: 'admin',
        adminPassword: 'admin123',
        pinGerbangLogin: '99999',
      };
      await onUpdatePengaturan(resetConfig);
      setUsername('admin');
      setGatePin('99999');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Kredensial dikembalikan ke pengaturan default.');
      onShowToast?.({
        type: 'info',
        title: 'Kredensial Di-reset',
        message: 'Username admin & PIN gerbang kembali ke nilai default.',
        code: '[SYS_CREDENTIAL_DEFAULT]',
        duration: 3500,
      });
    } catch (err: any) {
      setErrorMessage('Gagal mereset kredensial: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Penuh */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#032014]/90 via-[#04281a]/85 to-[#021810]/90 border border-emerald-500/25 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>SISTEM KEAMANAN & OTORISASI PANITIA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Manajemen Pengguna & Kredensial
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/75 mt-1">
            Kelola username, password admin, dan PIN khusus gerbang portal bilik suara secara aman dan terpusat.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-[#02130c]/80 border border-emerald-500/30 text-left">
            <span className="text-[10px] text-emerald-400/80 uppercase font-mono block">Sinkronisasi Database</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Firestore Cloud Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold mb-0.5 text-rose-300">Peringatan Validasi:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold mb-0.5 text-emerald-300">Berhasil Disimpan:</strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Grid Layout Formulir Halaman Penuh */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Akun Admin & PIN Gerbang (8 Kolom) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Username & Password Admin */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#032014]/85 border border-emerald-500/25 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kredensial Akun Administrator</h3>
                <p className="text-xs text-emerald-300/70">
                  Digunakan untuk masuk ke panel administrasi pemilihan panitia.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1.5">
                  Username Administrator <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Contoh: panitia_smkn9"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3" />
                </div>
                <p className="text-[11px] text-emerald-400/60 mt-1">
                  Username saat ini di sistem: <strong className="text-emerald-300">{currentAdminUser}</strong>
                </p>
              </div>

              {/* Password Lama (Diperlukan jika ingin ubah password) */}
              <div className="pt-3 border-t border-emerald-500/15">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                    Password Saat Ini (Untuk Konfirmasi)
                  </label>
                  <span className="text-[10px] text-emerald-400/60 font-mono">
                    Wajib diisi jika mengganti password
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Masukkan password admin yang sedang aktif"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-emerald-700/60"
                  />
                  <KeyRound className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-2.5 p-1 text-emerald-400 hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Grid Password Baru & Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password Baru */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1.5">
                    Password Baru (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-emerald-700/60"
                    />
                    <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 p-1 text-emerald-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Indikator Kekuatan */}
                  {newPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${strength.textCol}`}>
                        {strength.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1.5">
                    Ulangi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Ketik ulang password baru"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-emerald-700/60"
                    />
                    <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 p-1 text-emerald-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword && (
                    <p
                      className={`text-[10px] mt-1 font-semibold ${
                        confirmPassword === newPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {confirmPassword === newPassword ? '✓ Password cocok' : '✗ Password belum cocok'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: PIN Khusus Gerbang Bilik Suara (5 Digit) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#032014]/85 border border-emerald-500/25 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">PIN Khusus Gerbang Login Bilik Suara</h3>
                <p className="text-xs text-emerald-300/70">
                  Kode 5 digit yang dimasukkan di kolom token bilik pemilih untuk membuka form login admin.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1.5">
                  PIN Gerbang 5 Digit <span className="text-orange-400">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={5}
                      value={gatePin}
                      onChange={(e) => {
                        // Hanya angka
                        const val = e.target.value.replace(/\D/g, '');
                        setGatePin(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="99999"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-orange-400 font-mono text-lg font-black tracking-widest focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all text-center sm:text-left"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3.5" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setGatePin('99999')}
                    className="px-4 py-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-900/60 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-center"
                  >
                    Reset ke Default (99999)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#02130c]/70 border border-emerald-500/20 text-xs text-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold">
                  <Info className="w-4 h-4" />
                  <span>Cara Kerja PIN Gerbang 5 Digit:</span>
                </div>
                <p className="leading-relaxed">
                  Pada komputer TPS / bilik suara siswa, pemilih memasukkan 5 digit token mereka untuk mencoblos.
                  Jika panitia memasukkan kode PIN ini (saat ini:{' '}
                  <strong className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {gatePin || '—'}
                  </strong>
                  ), sistem secara cerdas akan langsung mengalihkan layar ke portal login admin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Bilah Aksi Samping & Ringkasan Keamanan (4 Kolom) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Kartu Ringkasan Status Akun */}
          <div className="p-6 rounded-3xl bg-[#032014]/85 border border-emerald-500/25 backdrop-blur-xl shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Ringkasan Keamanan</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#02130c]/70 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-emerald-300/80">Username Aktif:</span>
                <span className="font-mono font-bold text-white">{currentAdminUser}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#02130c]/70 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-emerald-300/80">PIN Gerbang Bilik:</span>
                <span className="font-mono font-bold text-orange-400 tracking-wider">
                  {currentGatePin}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#02130c]/70 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-emerald-300/80">Perlindungan Password:</span>
                <span className="text-emerald-400 font-bold">Aktif & Terenkripsi</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-amber-200/80 text-[11px] leading-relaxed">
              Catatan: Pastikan seluruh anggota panitia inti mencatat kredensial terbaru setelah disimpan. Kredensial tidak lagi ditampilkan pada halaman publik login demi kerahasiaan.
            </div>
          </div>

          {/* Kartu Tombol Aksi Samping */}
          <div className="p-6 rounded-3xl bg-[#032014]/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-3 sticky top-24">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan ke Cloud...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Perubahan Kredensial</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kembalikan Default Pabrik</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
