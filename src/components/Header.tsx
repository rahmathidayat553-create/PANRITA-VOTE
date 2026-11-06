import React from 'react';
import { Vote, Shield, Lock } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface HeaderProps {
  logoUrl: string;
  sekolah: string;
  onOpenAdminLogin: () => void;
  onGoToBallot: () => void;
  onGoHome: () => void;
  voterStep: string;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl,
  sekolah,
  onOpenAdminLogin,
  onGoToBallot,
  onGoHome,
  voterStep,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-800/20 flex items-center justify-center shrink-0 shadow-xs">
            <SafeImage
              src={logoUrl}
              alt="Logo Sekolah"
              fallbackInitial="9B"
              className="w-8 h-8 object-contain"
              containerClassName="w-full h-full flex items-center justify-center"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
              PanritaVote
            </span>
            <span className="text-xs text-emerald-800/80 font-medium whitespace-nowrap">
              {sekolah}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onGoHome}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-900 ${
              voterStep === 'beranda' ? 'text-emerald-800 font-semibold' : ''
            }`}
          >
            Beranda
          </button>
          <a
            href="#profil-paslon"
            className="transition-colors whitespace-nowrap shrink-0 hover:text-emerald-900"
          >
            Pasangan Calon
          </a>
          <a
            href="#tata-cara"
            className="transition-colors whitespace-nowrap shrink-0 hover:text-emerald-900"
          >
            Tata Cara Memilih
          </a>
        </nav>

        {/* Zone 3: Primary Action & Admin Entry */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenAdminLogin}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            title="Akses Khusus Panitia"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Akses</span> Panitia
          </button>

          <button
            onClick={onGoToBallot}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Vote className="w-4 h-4" />
            <span>Masuk Bilik Suara</span>
          </button>
        </div>
      </div>
    </header>
  );
};
