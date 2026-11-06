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
} from 'lucide-react';

export type AdminMenuKey =
  | 'dashboard'
  | 'pemilihan'
  | 'paslon'
  | 'dpt'
  | 'rekap'
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
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-emerald-950 text-white shrink-0 flex flex-col border-r border-emerald-900">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black">
              <Shield className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Panel Panitia
              </span>
              <span className="text-[11px] text-emerald-300 truncate max-w-[150px] block">
                {schoolName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectMenu(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs border border-emerald-600/50'
                    : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-400/80'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar with Logout */}
        <div className="p-4 border-t border-emerald-900">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar ke Mode Pemilih</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header inside Admin */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu /
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
              {navItems.find((n) => n.key === activeMenu)?.label || activeMenu}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="text-xs font-medium text-slate-600 hover:text-emerald-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Lihat Halaman Pemilih</span>
              <ExternalLink className="w-3.5 h-3.5" />
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
