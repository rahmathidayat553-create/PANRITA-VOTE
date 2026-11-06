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

export default function App() {
  // Global Real Data States (Synced with Firebase Firestore)
  const [paslonList, setPaslonList] = useState<Paslon[]>(initialPaslon);
  const [pemilihList, setPemilihList] = useState<Pemilih[]>(initialPemilih);
  const [pengaturan, setPengaturan] = useState<PengaturanPemilihan>(initialPengaturan);
  const [logs, setLogs] = useState<LogAktivitas[]>(initialLogs);
  const [isDbConnecting, setIsDbConnecting] = useState(true);

  // Main Mode: 'pemilih' (Kiosk/Public) or 'admin'
  const [currentRole, setCurrentRole] = useState<'pemilih' | 'admin'>('pemilih');

  // In Voter mode: 'token' (halaman utama input 5 digit), 'coblos' (bilik suara), or 'adminLogin' (login admin setelah token 99999)
  const [voterStep, setVoterStep] = useState<'token' | 'coblos' | 'adminLogin'>('token');

  // Active Admin Menu
  const [adminMenu, setAdminMenu] = useState<AdminMenuKey>('dashboard');

  // Active Voter Session
  const [activeVoter, setActiveVoter] = useState<Pemilih | null>(null);

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

      setActiveVoter(null);
      setVoterStep('token');

      showToast({
        type: 'success',
        title: 'Terima Kasih Sudah Memilih!',
        message: 'Suara Anda telah berhasil direkam secara sah dan rahasia ke database. Bilik suara siap untuk pemilih berikutnya.',
        duration: 5000,
      });
    } catch (err: any) {
      console.error('Gagal mencoblos:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Suara',
        message: 'Terjadi kendala saat merekam suara ke database awan. Silakan hubungi panitia TPS.',
        duration: 4000,
      });
    }
  };

  // 3. Admin Flow Handlers
  const handleAdminLoginSuccess = async () => {
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
      duration: 3000,
    });
  };

  const handleLogoutAdmin = () => {
    setCurrentRole('pemilih');
    setVoterStep('token');

    showToast({
      type: 'info',
      title: 'Keluar dari Panel Admin',
      message: 'Kembali ke halaman utama bilik suara pemilih.',
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
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal update pengaturan:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Gagal memperbarui pengaturan ke database.',
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
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Gagal tambah paslon:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Paslon',
        message: 'Terjadi kesalahan saat menyimpan data paslon ke database.',
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
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal update paslon:', err);
      showToast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: 'Gagal menyimpan perubahan paslon ke database.',
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
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal hapus paslon:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus paslon dari database.',
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
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal tambah pemilih:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menambahkan',
        message: 'Gagal menyimpan data pemilih ke database.',
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
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal update pemilih:', err);
      showToast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: 'Gagal menyimpan pembaruan pemilih ke database.',
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
        duration: 2500,
      });
    } catch (err: any) {
      console.error('Gagal hapus pemilih:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus pemilih dari database.',
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
        duration: 4000,
      });
    } catch (err: any) {
      console.error('Gagal import pemilih ke Firestore:', err);
      showToast({
        type: 'error',
        title: 'Gagal Import',
        message: 'Terjadi kesalahan saat menyimpan data import ke database.',
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
              onAdminTokenEntered={() => {
                setVoterStep('adminLogin');
                showToast({
                  type: 'info',
                  title: 'Gerbang Panitia Terbuka',
                  message: 'Token 99999 terverifikasi. Silakan masukkan username dan password admin.',
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
            />
          )}

          {adminMenu === 'paslon' && (
            <AdminPaslon
              paslonList={paslonList}
              onAddPaslon={handleAddPaslon}
              onUpdatePaslon={handleUpdatePaslon}
              onDeletePaslon={handleDeletePaslon}
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
