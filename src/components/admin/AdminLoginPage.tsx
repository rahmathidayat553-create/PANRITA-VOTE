import React, { useState } from 'react';
import { Shield, KeyRound, User, AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { SafeImage } from '../SafeImage';

interface AdminLoginPageProps {
  logoUrl: string;
  sekolah: string;
  onLoginSuccess: () => void;
  onBackToVoter: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  logoUrl,
  sekolah,
  onLoginSuccess,
  onBackToVoter,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Valid credentials per specification: user: admin, pass: admin123
      if (username.trim() === 'admin' && password === 'admin123') {
        onLoginSuccess();
      } else {
        setError('Username atau password admin salah. Silakan periksa kembali kredensial Anda.');
      }
    }, 250);
  };

  const handleFillCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBackToVoter}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 hover:text-emerald-700 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bilik Suara Siswa</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {/* Header branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center mb-3 shadow-sm p-2">
              <SafeImage
                src={logoUrl}
                alt="Logo SMKN 9 Bulukumba"
                fallbackInitial="9B"
                className="w-10 h-10 object-contain"
                containerClassName="w-full h-full flex items-center justify-center"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Portal Otorisasi Panitia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Login Admin Pemilihan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {sekolah} · Masuk untuk mengelola data & melihat rekap suara
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
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
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                  autoComplete="username"
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password Panitia
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="admin123"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                  autoComplete="current-password"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-300" />
                  <span>Masuk ke Panel Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Panduan Kredensial Panitia */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Kredensial Akses Panitia:
              </span>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                Isi Kredensial
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 flex items-center justify-between">
              <span>user: <strong className="text-slate-900">admin</strong></span>
              <span className="text-slate-300">|</span>
              <span>pass: <strong className="text-slate-900">admin123</strong></span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Akses panel dibatasi hanya untuk Panitia Pemilihan OSIS SMKN 9 Bulukumba.
        </div>
      </div>
    </div>
  );
};
