import React, { useState, useEffect } from 'react';
import {
  initialPaslon,
  initialPemilih,
  initialPengaturan,
  initialLogs,
  Paslon,
  Pemilih,
  PengaturanPemilihan,
  LogAktivitas,
} from './data/dummy';
import {
  subscribePengaturan,
  savePengaturan,
  subscribePaslon,
  addPaslonToDb,
  updatePaslonInDb,
  deletePaslonFromDb,
  subscribePemilih,
  addPemilihToDb,
  updatePemilihInDb,
  deletePemilihFromDb,
  importPemilihBatchToDb,
  executeAtomicVote,
  subscribeLogs,
  addLogToDb,
} from './services/electionService';
import { Toast, ToastData } from './components/Toast';
import { VoterTokenPage } from './components/voter/VoterTokenPage';
import { VoterBallot } from './components/voter/VoterBallot';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminLayout, AdminMenuKey } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPemilihan } from './components/admin/AdminPemilihan';
import { AdminPaslon } from './components/admin/AdminPaslon';
import { AdminDPT } from './components/admin/AdminDPT';
import { AdminRekapitulasi } from './components/admin/AdminRekapitulasi';
import { AdminLog } from './components/admin/AdminLog';

// Session Persistence Keys
const SESSION_ROLE_KEY = 'panritavote_session_role';
const SESSION_ADMIN_MENU_KEY = 'panritavote_session_admin_menu';
const SESSION_VOTER_STEP_KEY = 'panritavote_session_voter_step';
const SESSION_ACTIVE_VOTER_KEY = 'panritavote_session_active_voter';

export default function App() {
  // Global Real Data States (Synced with Firebase Firestore)
  const [paslonList, setPaslonList] = useState<Paslon[]>(initialPaslon);
  const [pemilihList, setPemilihList] = useState<Pemilih[]>(initialPemilih);
  const [pengaturan, setPengaturan] = useState<PengaturanPemilihan>(initialPengaturan);
  const [logs, setLogs] = useState<LogAktivitas[]>(initialLogs);
  const [isDbConnecting, setIsDbConnecting] = useState(true);

  // Main Mode: 'pemilih' (Kiosk/Public) or 'admin' with Session Persistence
  const [currentRole, setCurrentRole] = useState<'pemilih' | 'admin'>(() => {
    try {
      const saved =
        sessionStorage.getItem(SESSION_ROLE_KEY) ||
        localStorage.getItem(SESSION_ROLE_KEY);
      if (saved === 'admin') return 'admin';
    } catch {}
    return 'pemilih';
  });

  // In Voter mode: 'token' (halaman utama input 5 digit), 'coblos' (bilik suara), or 'adminLogin' (login admin setelah token 99999)
  const [voterStep, setVoterStep] = useState<'token' | 'coblos' | 'adminLogin'>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_VOTER_STEP_KEY);
      if (saved === 'adminLogin' || saved === 'coblos') {
        return saved;
      }
    } catch {}
    return 'token';
  });

  // Active Admin Menu with Persistence
  const [adminMenu, setAdminMenu] = useState<AdminMenuKey>(() => {
    try {
      const saved =
        sessionStorage.getItem(SESSION_ADMIN_MENU_KEY) ||
        localStorage.getItem(SESSION_ADMIN_MENU_KEY);
      if (
        saved &&
        ['dashboard', 'pemilihan', 'paslon', 'dpt', 'rekap', 'log'].includes(saved)
      ) {
        return saved as AdminMenuKey;
      }
    } catch {}
    return 'dashboard';
  });

  // Active Voter Session with Persistence
  const [activeVoter, setActiveVoter] = useState<Pemilih | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_ACTIVE_VOTER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Sync session states whenever changed
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_ROLE_KEY, currentRole);
      localStorage.setItem(SESSION_ROLE_KEY, currentRole);
    } catch {}
  }, [currentRole]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_ADMIN_MENU_KEY, adminMenu);
      localStorage.setItem(SESSION_ADMIN_MENU_KEY, adminMenu);
    } catch {}
  }, [adminMenu]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_VOTER_STEP_KEY, voterStep);
    } catch {}
  }, [voterStep]);

  useEffect(() => {
    try {
      if (activeVoter) {
        sessionStorage.setItem(SESSION_ACTIVE_VOTER_KEY, JSON.stringify(activeVoter));
      } else {
        sessionStorage.removeItem(SESSION_ACTIVE_VOTER_KEY);
      }
    } catch {}
  }, [activeVoter]);

  // Smooth Toast Notification State
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (data: ToastData) => {
    setToast(data);
  };

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubPengaturan = subscribePengaturan((newSettings) => {
      setPengaturan(newSettings);
      setIsDbConnecting(false);
    });

    const unsubPaslon = subscribePaslon((list) => {
      setPaslonList(list);
    });

    const unsubPemilih = subscribePemilih((list) => {
      setPemilihList(list);
    });

    const unsubLogs = subscribeLogs((list) => {
      setLogs(list);
    });

    return () => {
      unsubPengaturan();
      unsubPaslon();
      unsubPemilih();
      unsubLogs();
    };
  }, []);

  // 1. Voter Token Verification Handler
  const handleVerifyToken = (voter: Pemilih) => {
    setActiveVoter(voter);

    // Toast feedback: Token valid, entering voting booth
    showToast({
      type: 'success',
      title: 'Token Terverifikasi!',
      message: `Selamat datang, ${voter.nama} (${voter.kelas}). Mengalihkan ke bilik suara...`,
      code: '[AUTH_TOKEN_VERIFIED // 0x2A]',
      duration: 2500,
    });

    // Smooth transition to ballot screen
    setVoterStep('coblos');
  };

  // 2. Cast Vote Handler -> Writes atomic vote to Firestore
  const handleCastVote = async (paslonId: string) => {
    const selected = paslonList.find((p) => p.id === paslonId);
    if (!activeVoter || !selected) return;

    try {
      await executeAtomicVote(activeVoter, selected);

      try {
        sessionStorage.removeItem(SESSION_ACTIVE_VOTER_KEY);
        sessionStorage.setItem(SESSION_VOTER_STEP_KEY, 'token');
      } catch {}

      setActiveVoter(null);
      setVoterStep('token');

      showToast({
        type: 'success',
        title: 'Terima Kasih Sudah Memilih!',
        message: 'Suara Anda telah berhasil direkam secara sah dan rahasia ke database. Bilik suara siap untuk pemilih berikutnya.',
        code: '[VOTE_RECORDED // ENCRYPTED]',
        duration: 5000,
      });
    } catch (err: any) {
      console.error('Gagal mencoblos:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Suara',
        message: 'Terjadi kendala saat merekam suara ke database awan. Silakan hubungi panitia TPS.',
        code: '[VOTE_ERR // SYNC_FAILED]',
        duration: 4000,
      });
    }
  };

  // 3. Admin Flow Handlers
  const handleAdminLoginSuccess = async () => {
    try {
      sessionStorage.setItem(SESSION_ROLE_KEY, 'admin');
      localStorage.setItem(SESSION_ROLE_KEY, 'admin');
    } catch {}
    setCurrentRole('admin');
    setAdminMenu('dashboard');

    const timestamp =
      new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WITA';

    const newLog: LogAktivitas = {
      id: `log-${Date.now()}`,
      waktu: timestamp,
      aksi: 'Admin panitia berhasil masuk sistem',
      pengguna: 'Admin Panitia',
      tipe: 'auth',
    };

    try {
      await addLogToDb(newLog);
    } catch (e) {
      console.error('Gagal mencatat log login:', e);
    }

    showToast({
      type: 'info',
      title: 'Masuk Panel Panitia',
      message: 'Selamat datang di konsol administrasi pemilihan OSIS SMKN 9 Bulukumba.',
      code: '[PANRITAVOTE // SECURE_SESSION]',
      duration: 3000,
    });
  };

  const handleLogoutAdmin = () => {
    try {
      sessionStorage.removeItem(SESSION_ROLE_KEY);
      localStorage.removeItem(SESSION_ROLE_KEY);
      sessionStorage.removeItem(SESSION_ADMIN_MENU_KEY);
      localStorage.removeItem(SESSION_ADMIN_MENU_KEY);
      sessionStorage.removeItem(SESSION_VOTER_STEP_KEY);
      sessionStorage.removeItem(SESSION_ACTIVE_VOTER_KEY);
    } catch {}
    setCurrentRole('pemilih');
    setVoterStep('token');
    setActiveVoter(null);

    showToast({
      type: 'info',
      title: 'Keluar dari Panel Admin',
      message: 'Kembali ke halaman utama bilik suara pemilih.',
      code: '[SESSION_TERMINATED // HUD_RESET]',
      duration: 2500,
    });
  };

  const handleUpdatePengaturan = async (newSettings: PengaturanPemilihan) => {
    try {
      await savePengaturan(newSettings);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Pengaturan pemilihan diperbarui (Status: ${newSettings.status})`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'success',
        title: 'Pengaturan Disimpan',
        message: 'Konfigurasi pemilihan berhasil disimpan ke database awan.',
        code: '[CONFIG_SAVED // LIVE_SYNC]',
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal update pengaturan:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Gagal memperbarui pengaturan ke database.',
        code: '[CONFIG_ERR // SAVE_FAILED]',
        duration: 3000,
      });
    }
  };

  const handleAddPaslon = async (newPaslon: Paslon) => {
    try {
      await addPaslonToDb(newPaslon);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Pasangan Calon No. ${newPaslon.nomorUrut} ditambahkan`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'success',
        title: 'Paslon Ditambahkan',
        message: `Paslon No. ${newPaslon.nomorUrut} (${newPaslon.namaKetua} & ${newPaslon.namaWakil}) berhasil disimpan ke database.`,
        code: '[PASLON_CREATED // CANDIDATE_SAVED]',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Gagal tambah paslon:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Paslon',
        message: 'Terjadi kesalahan saat menyimpan data paslon ke database.',
        code: '[PASLON_ERR // SAVE_FAILED]',
        duration: 3000,
      });
    }
  };

  const handleUpdatePaslon = async (updatedPaslon: Paslon) => {
    try {
      await updatePaslonInDb(updatedPaslon);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Data Paslon No. ${updatedPaslon.nomorUrut} diperbarui`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'success',
        title: 'Paslon Diperbarui',
        message: `Profil Paslon No. ${updatedPaslon.nomorUrut} berhasil diperbarui di database.`,
        code: '[PASLON_UPDATED // PROFILE_SYNC]',
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal update paslon:', err);
      showToast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: 'Gagal menyimpan perubahan paslon ke database.',
        code: '[PASLON_ERR // UPDATE_FAILED]',
        duration: 3000,
      });
    }
  };

  const handleDeletePaslon = async (paslonId: string) => {
    const target = paslonList.find((p) => p.id === paslonId);
    try {
      await deletePaslonFromDb(paslonId);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Paslon No. ${target?.nomorUrut || ''} dihapus`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'info',
        title: 'Paslon Dihapus',
        message: `Data Paslon No. ${target?.nomorUrut || ''} telah dihapus dari database.`,
        code: '[PASLON_DELETED // RECORD_REMOVED]',
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal hapus paslon:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus paslon dari database.',
        code: '[PASLON_ERR // DELETE_FAILED]',
        duration: 3000,
      });
    }
  };

  // Voter CRUD Handlers
  const handleAddPemilih = async (newVoter: Pemilih) => {
    try {
      await addPemilihToDb(newVoter);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Pemilih baru (${newVoter.jenis}) ${newVoter.nama} ditambahkan ke DPT`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'success',
        title: 'Pemilih Ditambahkan',
        message: `${newVoter.nama} (${newVoter.kelas}) berhasil disimpan ke DPT database.`,
        code: '[DPT_VOTER_SAVED // TOKEN_ISSUED]',
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal tambah pemilih:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menambahkan',
        message: 'Gagal menyimpan data pemilih ke database.',
        code: '[DPT_ERR // SAVE_FAILED]',
        duration: 3000,
      });
    }
  };

  const handleUpdatePemilih = async (updatedVoter: Pemilih) => {
    try {
      await updatePemilihInDb(updatedVoter);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Data pemilih ${updatedVoter.nama} diperbarui`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'success',
        title: 'Data Pemilih Disimpan',
        message: `Data ${updatedVoter.nama} berhasil diperbarui di database.`,
        code: '[DPT_VOTER_UPDATED // RECORD_SYNC]',
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal update pemilih:', err);
      showToast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: 'Gagal menyimpan pembaruan pemilih ke database.',
        code: '[DPT_ERR // UPDATE_FAILED]',
        duration: 3000,
      });
    }
  };

  const handleDeletePemilih = async (voterId: string) => {
    const target = pemilihList.find((p) => p.id === voterId);
    try {
      await deletePemilihFromDb(voterId);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Pemilih ${target?.nama || ''} dihapus dari DPT`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'info',
        title: 'Pemilih Dihapus',
        message: `Pemilih ${target?.nama || ''} berhasil dihapus dari database.`,
        code: '[DPT_VOTER_REMOVED // EXPUNGED]',
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal hapus pemilih:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus pemilih dari database.',
        code: '[DPT_ERR // DELETE_FAILED]',
        duration: 3000,
      });
    }
  };

  const handleImportPemilih = async (newVoters: Pemilih[]) => {
    try {
      await importPemilihBatchToDb(newVoters);

      const newLog: LogAktivitas = {
        id: `log-${Date.now()}`,
        waktu:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WITA',
        aksi: `Import massal: ${newVoters.length} pemilih berhasil diimport ke database dari Excel`,
        pengguna: 'Admin Panitia',
        tipe: 'sistem',
      };
      await addLogToDb(newLog);

      showToast({
        type: 'success',
        title: 'Import Berhasil!',
        message: `${newVoters.length} data pemilih (Siswa & Guru) berhasil disimpan ke database DPT.`,
        code: '[DPT_BATCH_SYNC // FIRESTORE_OK]',
        duration: 4000,
      });
    } catch (err: any) {
      console.error('Gagal import pemilih ke Firestore:', err);
      showToast({
        type: 'error',
        title: 'Gagal Import',
        message: 'Terjadi kesalahan saat menyimpan data import ke database.',
        code: '[DPT_BATCH_ERR // SYNC_FAILED]',
        duration: 3500,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-950 flex flex-col">
      {/* Smooth Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* MODE PEMILIH (Halaman Utama Langsung Masukkan Token Pemilih) */}
      {currentRole === 'pemilih' && (
        <div className="flex-1 flex flex-col transition-opacity duration-200">
          {voterStep === 'token' && (
            <VoterTokenPage
              pemilihList={pemilihList}
              paslonList={paslonList}
              pengaturan={pengaturan}
              onVerifyToken={handleVerifyToken}
              onShowToast={showToast}
              onAdminTokenEntered={() => {
                setVoterStep('adminLogin');
                showToast({
                  type: 'info',
                  title: 'Gerbang Panitia Terbuka',
                  message: 'Token 99999 terverifikasi. Silakan masukkan kredensial panitia.',
                  code: '[PANRITAVOTE // GATEWAY_OPEN]',
                  duration: 3500,
                });
              }}
            />
          )}

          {voterStep === 'coblos' && activeVoter && (
            <VoterBallot
              paslonList={paslonList}
              activeVoter={activeVoter}
              onCastVote={handleCastVote}
              onShowToast={showToast}
              onCancel={() => {
                setActiveVoter(null);
                setVoterStep('token');
              }}
            />
          )}

          {voterStep === 'adminLogin' && (
            <AdminLoginPage
              logoUrl={pengaturan.logoUrl}
              sekolah={pengaturan.sekolah}
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToVoter={() => setVoterStep('token')}
              onShowToast={showToast}
            />
          )}
        </div>
      )}

      {/* MODE ADMIN (Panel Panitia) */}
      {currentRole === 'admin' && (
        <AdminLayout
          activeMenu={adminMenu}
          onSelectMenu={(menu) => setAdminMenu(menu)}
          onLogout={handleLogoutAdmin}
          schoolName={pengaturan.sekolah}
        >
          {adminMenu === 'dashboard' && (
            <AdminDashboard
              paslonList={paslonList}
              pemilihList={pemilihList}
              pengaturan={pengaturan}
              logs={logs}
            />
          )}

          {adminMenu === 'pemilihan' && (
            <AdminPemilihan
              pengaturan={pengaturan}
              onUpdatePengaturan={handleUpdatePengaturan}
              onShowToast={showToast}
            />
          )}

          {adminMenu === 'paslon' && (
            <AdminPaslon
              paslonList={paslonList}
              onAddPaslon={handleAddPaslon}
              onUpdatePaslon={handleUpdatePaslon}
              onDeletePaslon={handleDeletePaslon}
              onShowToast={showToast}
            />
          )}

          {adminMenu === 'dpt' && (
            <AdminDPT
              pemilihList={pemilihList}
              sekolah={pengaturan.sekolah}
              logoUrl={pengaturan.logoUrl}
              onAddPemilih={handleAddPemilih}
              onUpdatePemilih={handleUpdatePemilih}
              onDeletePemilih={handleDeletePemilih}
              onImportPemilih={handleImportPemilih}
              onShowToast={showToast}
            />
          )}

          {adminMenu === 'rekap' && (
            <AdminRekapitulasi paslonList={paslonList} />
          )}

          {adminMenu === 'log' && <AdminLog logs={logs} />}
        </AdminLayout>
      )}
    </div>
  );
}
