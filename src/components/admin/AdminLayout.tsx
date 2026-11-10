import React from 'react';
import {
  LayoutDashboard,
  Settings,
  Users2,
  ListChecks,
  BarChart3,
  ScrollText,
  LogOut,
  Shield,
  ExternalLink,
  UserCog,
} from 'lucide-react';

export type AdminMenuKey =
  | 'dashboard'
  | 'pemilihan'
  | 'paslon'
  | 'dpt'
  | 'rekap'
  | 'pengguna'
  | 'log';

interface AdminLayoutProps {
  activeMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  onLogout: () => void;
  children: React.ReactNode;
  schoolName: string;
}

const navItems: { key: AdminMenuKey; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'pemilihan', label: 'Pemilihan', icon: Settings },
  { key: 'paslon', label: 'Pasangan Calon', icon: Users2 },
  { key: 'dpt', label: 'Daftar Pemilih', icon: ListChecks },
  { key: 'rekap', label: 'Rekapitulasi', icon: BarChart3 },
  { key: 'pengguna', label: 'Manajemen Pengguna', icon: UserCog },
  { key: 'log', label: 'Log Aktivitas', icon: ScrollText },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeMenu,
  onSelectMenu,
  onLogout,
  children,
  schoolName,
}) => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row text-slate-100 relative z-10">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-[#021810]/90 backdrop-blur-xl text-white shrink-0 flex flex-col border-r border-emerald-500/20 shadow-2xl">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-orange-950/50 border border-orange-400/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block tracking-wide">
                Panel Panitia
              </span>
              <span className="text-[11px] text-emerald-300/80 truncate max-w-[150px] block font-medium">
                {schoolName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectMenu(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-900/95 to-emerald-950/90 text-orange-400 shadow-md shadow-black/40 border border-orange-500/40 ring-1 ring-orange-500/20'
                    : 'text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white hover:border hover:border-emerald-500/20'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-orange-400' : 'text-emerald-400/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar with Logout */}
        <div className="p-4 border-t border-emerald-500/20 bg-emerald-950/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span>Keluar ke Mode Pemilih</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-black/20">
        {/* Top Header inside Admin */}
        <header className="bg-[#031e15]/80 backdrop-blur-md border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
              Menu /
            </span>
            <h1 className="text-base sm:text-lg font-bold text-white capitalize flex items-center gap-2">
              <span>{navItems.find((n) => n.key === activeMenu)?.label || activeMenu}</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-emerald-200 hover:text-orange-400 flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/20 hover:border-orange-500/40"
            >
              <span>Lihat Halaman Pemilih</span>
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>
        </header>

        {/* Dynamic Menu Viewport */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
