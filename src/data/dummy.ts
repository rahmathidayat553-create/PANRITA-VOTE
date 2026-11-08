export interface Paslon {
  id: string;
  nomorUrut: number;
  namaKetua: string;
  kelasKetua: string;
  namaWakil: string;
  kelasWakil: string;
  fotoUrl: string;
  fotoKetuaUrl: string;
  fotoWakilUrl: string;
  visi: string;
  misi: string[];
  suaraPerolehan: number;
}

export interface Pemilih {
  id: string;
  jenis: 'siswa' | 'guru';
  nisn: string;
  nama: string;
  kelas: string;
  token: string;
  status: 'belum' | 'sudah';
  waktuMemilih?: string;
}

export function generateUniqueToken(existingTokens: string[]): string {
  let token = '';
  const tokenSet = new Set(existingTokens);
  let attempts = 0;
  do {
    const num = Math.floor(10000 + Math.random() * 89999);
    token = num.toString();
    attempts++;
  } while ((tokenSet.has(token) || token === '99999') && attempts < 1000);
  return token;
}

export interface LogAktivitas {
  id: string;
  waktu: string;
  aksi: string;
  pengguna: string;
  tipe: 'auth' | 'vote' | 'sistem';
}

export interface PengaturanPemilihan {
  judul: string;
  subjudul: string;
  sekolah: string;
  logoUrl: string;
  status: 'aktif' | 'ditutup' | 'persiapan';
  tanggalMulai: string;
  tanggalSelesai: string;
  tokenAdmin: string;
  pinHasilSuara?: string; // Default: '789123'
  kuotaIntipSuara?: number; // Maksimal 2x per pemilihan
  intipAktifSampai?: string | null; // ISO timestamp berakhirnya sesi 2 menit
}

export const initialPengaturan: PengaturanPemilihan = {
  judul: "Pemilihan Ketua & Wakil Ketua OSIS",
  subjudul: "Masa Bakti 2026/2027",
  sekolah: "SMKN 9 Bulukumba",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/480px-Logo_Tut_Wuri_Handayani.png",
  status: "persiapan", // Belum dibuka, panitia membuka secara manual saat hari-H
  tanggalMulai: "2026-11-05 08:00 WITA",
  tanggalSelesai: "2026-11-05 14:00 WITA",
  tokenAdmin: "ADMIN-PANRITA-2026",
  pinHasilSuara: "789123",
  kuotaIntipSuara: 2,
  intipAktifSampai: null,
};

export const defaultPengaturan = initialPengaturan;

// Data real bersih kosong - siap diisi oleh panitia melalui menu Admin
export const initialPaslon: Paslon[] = [];
export const initialPemilih: Pemilih[] = [];
export const initialLogs: LogAktivitas[] = [];

export interface ElectionBackup {
  version: string;
  app: string;
  exportedAt: string;
  sekolah: string;
  pengaturan: PengaturanPemilihan;
  paslonList: Paslon[];
  pemilihList: Pemilih[];
  logs?: LogAktivitas[];
}
