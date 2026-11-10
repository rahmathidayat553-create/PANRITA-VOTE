# Rencana Implementasi: Manajemen Pengguna & Keamanan Kredensial Admin

## Gambaran Perubahan
Berdasarkan permintaan dan jawaban klarifikasi pengguna:
1. **Pembersihan Halaman Login Admin**: Menghapus seluruh label, teks bantuan panduan kredensial default (`admin` & `admin123`), dan tombol auto-fill pada halaman login admin agar kredensial tetap privat dan aman.
2. **Manajemen Pengguna (Menu Tersendiri di Navigasi Admin)**:
   - Membuat halaman penuh (*full-page*, tanpa popup modal) untuk menu **"Manajemen Pengguna"** di navbar admin.
   - Fitur penggantian **Username Admin** dan **Password Admin** (dilengkapi verifikasi password lama, konfirmasi password baru, dan toggle intip/sembunyikan password).
   - Fitur penggantian **PIN Khusus Gerbang Login Bilik Suara** tepat 5 digit angka (default: `99999`) yang digunakan untuk berpindah dari bilik suara ke portal admin.
3. **Penyimpanan Terpusat & Sinkronisasi Real-time (Firestore)**:
   - Data kredensial baru (`adminUsername`, `adminPassword`, `pinGerbangLogin`) disimpan dalam dokumen konfigurasi `pengaturan` di Firestore, sehingga perubahan tersinkronisasi ke seluruh perangkat panitia secara instan.
   - Integrasi ke `VoterTokenPage.tsx` agar verifikasi PIN gerbang login langsung membaca nilai dinamis terbaru dari Firestore.

---

## Rincian File yang Akan Dimodifikasi & Dibuat

### 1. `src/data/dummy.ts`
- Memperluas interface `PengaturanPemilihan` dengan atribut baru:
  - `adminUsername?: string;` (default `'admin'`)
  - `adminPassword?: string;` (default `'admin123'`)
  - `pinGerbangLogin?: string;` (default `'99999'`)
- Memperbarui objek `initialPengaturan` dengan nilai default tersebut.

### 2. `src/components/admin/AdminLoginPage.tsx`
- Menghapus kotak panduan kredensial ("Kredensial Akses Panitia", label user/password, tombol "Gunakan Kredensial Ini").
- Menyesuaikan validasi autentikasi login agar memeriksa kredensial dinamis yang diterima dari properti `pengaturan` (dengan fallback aman ke default jika belum disetel).

### 3. `src/components/voter/VoterTokenPage.tsx`
- Mengganti kode hardcoded `codeToVerify === '99999'` agar membaca `codeToVerify === (pengaturan?.pinGerbangLogin || '99999')`.
- Memastikan token pemilih dan PIN gerbang 5-digit terverifikasi secara akurat.

### 4. `src/components/admin/AdminPengguna.tsx` *(Komponen Baru)*
- Dibuat dengan gaya layout **halaman penuh (full-page)** konsisten dengan tema hijau tua emerald gelap, aksen orange menyala, dan glassmorphism modern (tanpa floating modal).
- **Kartu Profil & Informasi Akun**: Menampilkan status akun aktif, tanggal pembaruan terakhir, dan indikator sinkronisasi Firestore.
- **Formulir Penggantian Username & Password Admin**:
  - Input Username Baru.
  - Input Password Lama (sebagai validasi keamanan sebelum mengubah).
  - Input Password Baru & Konfirmasi Password Baru dengan indikator kekuatan kata sandi dan tombol show/hide password.
- **Formulir Penggantian PIN Khusus Gerbang (5 Digit)**:
  - Input 5 digit angka dengan validasi presisi (hanya angka dan tepat 5 digit).
  - Penjelasan fungsi PIN untuk keamanan bilik pemilih.
- **Bilah Aksi Samping (Side Action Dock)**:
  - Tombol Simpan Perubahan Kredensial dengan efek loading dan konfirmasi sukses interaktif.
  - Opsi reset ke pengaturan pabrik jika diperlukan darurat (dengan konfirmasi).

### 5. `src/App.tsx`
- Menambahkan tab `'pengguna'` pada tipe navigasi admin `activeTab`.
- Menambahkan item menu baru **"Pengguna"** atau **"Manajemen Akun"** lengkap dengan ikon `UserCheck` / `ShieldCheck` di bilah navigasi admin.
- Merender komponen `AdminPengguna` saat tab `'pengguna'` aktif dan meneruskan fungsi `onUpdatePengaturan` untuk sinkronisasi otomatis ke Firestore.

---

## Verifikasi & Pengujian
1. **Verifikasi Kompilasi & Lint**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada error TypeScript atau impor yang tertinggal.
2. **Pengujian Fungsional**:
   - Memeriksa tampilan login admin: memastikan tidak ada lagi teks bantuan username dan password.
   - Mencoba login dengan username/password yang telah diubah di menu Manajemen Pengguna.
   - Mencoba memasukkan PIN khusus baru 5 digit di bilik suara untuk membuka login admin.
   - Memastikan data tersimpan di Firestore dan tetap bertahan saat halaman dimuat ulang.
