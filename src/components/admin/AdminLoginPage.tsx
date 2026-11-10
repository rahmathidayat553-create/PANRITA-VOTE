import React, { useState } from 'react';
import { Shield, KeyRound, User, AlertCircle, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { ToastData } from '../Toast';
import { PengaturanPemilihan } from '../../data/dummy';

interface AdminLoginPageProps {
  logoUrl: string;
  sekolah: string;
  pengaturan?: PengaturanPemilihan;
  onLoginSuccess: () => void;
  onBackToVoter: () => void;
  onShowToast?: (data: ToastData) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  logoUrl,
  sekolah,
  pengaturan,
  onLoginSuccess,
  onBackToVoter,
  onShowToast,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const validUsername = (pengaturan?.adminUsername || 'admin').trim();
    const validPassword = (pengaturan?.adminPassword || 'admin123').trim();

    setTimeout(() => {
      setIsLoading(false);
      if (username.trim() === validUsername && password.trim() === validPassword) {
        onLoginSuccess();
      } else {
        const msg = 'Username atau password admin salah. Silakan periksa kembali kredensial Anda.';
        setError(msg);
        onShowToast?.({
          type: 'error',
          title: 'Kredensial Ditolak',
          message: msg,
          code: '[AUTH_REJECT // ACCESS_DENIED]',
          duration: 4000,
        });
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative z-10">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBackToVoter}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-orange-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bilik Suara Siswa</span>
        </button>

        <div className="bg-[#042017]/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.65)] p-6 sm:p-8">
          {/* Header branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#021810] border border-orange-500/40 text-white flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(249,115,22,0.25)] p-2">
              <SafeImage
                src={logoUrl}
                alt="Logo SMKN 9 Bulukumba"
                fallbackInitial="9B"
                className="w-11 h-11 object-contain"
                containerClassName="w-full h-full flex items-center justify-center"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-orange-400/40 font-mono">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>PORTAL OTORISASI PANITIA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Login Admin Pemilihan
            </h2>
            <p className="text-xs text-emerald-200/70 mt-1">
              {sekolah} · Masuk untuk mengelola data & memantau rekap suara
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1.5"
              >
                Username Panitia
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan username admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-emerald-700/60"
                  autoComplete="username"
                  autoFocus
                />
                <User className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1.5"
              >
                Password Panitia
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan password admin"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-emerald-500/30 bg-[#02130c]/80 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-emerald-700/60"
                  autoComplete="current-password"
                />
                <KeyRound className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-emerald-400 hover:text-orange-400 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:from-orange-600 active:to-amber-700 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer mt-2 border border-orange-400/40"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  <span>Masuk ke Panel Admin</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-emerald-300/60 font-mono">
          PANRITAVOTE // SMKN 9 BULUKUMBA
        </div>
      </div>
    </div>
  );
};
