# Integrasi Database Real Firebase Firestore & Pembersihan Data Dummy

Integrasi persistensi basis data awan real-time menggunakan Firebase Firestore untuk sistem e-voting pemilihan Ketua & Wakil Ketua OSIS SMKN 9 Bulukumba. Menghapus seluruh data tiruan (dummy), menghapus label uji coba, dan mengawali sistem dalam kondisi data riil bersih dengan status pemilihan belum dibuka (dibuka secara manual oleh panitia).

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pada tahap klarifikasi:
> - **Teknologi Basis Data**: Firebase Firestore (Awan Tersinkronisasi secara Real-Time).
> - **Kondisi Awal Data**: Bersih kosong (*Clean Slate*), siap diisi secara mandiri oleh panitia melalui menu admin (Tambah Paslon, Impor DPT Excel `.xlsx`).
> - **Status Awal Pemilihan**: `belum_dibuka` (Bilik suara pemilih menampilkan status "Pemilihan Belum Dibuka", panitia mengaktifkan pemungutan suara secara manual dari panel Pengaturan Pemilihan saat hari-H).
> - **Eliminasi Uji Coba**: Seluruh data nama pemilih tiruan, paslon tiruan, dan label "uji coba" dihapus seutuhnya dari sistem.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**: Migrasi arsitektur dari *in-memory mock state* ke **Firebase Firestore Real-Time Cloud Database**. Seluruh data pemilihan (Kandidat, DPT Siswa/Guru, Pengaturan Pemilihan, Pencoblosan Suara, dan Log Aktivitas) tersimpan secara persisten di awan dan tersinkronisasi otomatis antar-perangkat.
- **Target Pengguna**:
  - **Siswa & Guru Pemilih**: Mengakses portal bilik suara menggunakan token 5 digit unik, memilih paslon saat status pemilihan aktif, menerima konfirmasi pencoblosan rahasia sekali pakai (*single-use token*).
  - **Panitia / Admin**: Mengakses melalui token gerbang `99999` + autentikasi panitia (`admin` / `admin123`), mengelola DPT riil, kandidat riil, mengendalikan status pemilihan (Buka / Tutup / Selesai), dan memantau rekapitulasi real-time.
- **Nilai Utama**: Keandalan data pemilu bebas manipulasi lokal, multi-perangkat (bisa diakses bersamaan di beberapa bilik tablet/HP di TPS sekolah), dan kerahasiaan suara pemilih terjaga penuh.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Bilik Suara (Portal Pemilih)**:
   - Jika status pemilihan `belum_dibuka`: Pemilih yang memasukkan token 5 digit akan melihat pesan ramah "Pemilihan Belum Dibuka. Silakan tunggu instruksi panitia TPS."
   - Jika status pemilihan `aktif`: Token 5 digit diverifikasi ke database Firestore. Jika valid dan berstatus `belum`, masuk ke bilik suara 1 halaman penuh untuk memilih paslon.
   - Setelah memilih: Token pemilih langsung diubah menjadi `sudah`, suara masuk ke rekapitulasi secara anonim, toast konfirmasi terima kasih muncul, dan otomatis kembali ke layar awal dalam 3 detik.
2. **Kondisi Data Bersih (Empty States yang Elegan)**:
   - Halaman Kandidat: Tampilan status kosong profesional (*"Belum ada kandidat terdaftar. Panitia dapat menambahkan Paslon No. 1 melalui tombol Tambah Paslon"*).
   - Halaman DPT: Tampilan status kosong (*"Belum ada data pemilih. Silakan import dari berkas Excel (.xlsx) atau tambahkan secara manual"*).
3. **Panel Admin (Kendali Pemilihan)**:
   - Panitia dapat mengubah status pemilihan: `belum_dibuka` ➔ `aktif` ➔ `selesai`.
   - Mengisi DPT ribuan siswa/guru menggunakan fitur Import XLSX yang sudah dibuat.
   - Mengisi profil paslon dengan foto joint URL 4:3.

### Visual Identity & Theme
- **Warna Dominan**: Hijau zamrud gelap (*Emerald 900/950*) khas SMKN 9 Bulukumba, putih bersih, dan aksen abu-abu slate netral.
- **Tipografi**: Angka tabular (*font-mono*) untuk NISN, token 5 digit, persentase suara, dan nomor urut kandidat.
- **Zero-Pill Discipline**: Status pemilih, jenis pemilih (Siswa/Guru), dan status pemilihan ditampilkan secara bersih tanpa kapsul static dekoratif yang berlebihan.

---

## 3. Key Product Decisions & Trade-Offs

- **Firestore Real-Time Subscriptions (`onSnapshot`) vs Polling**:
  - *Keputusan*: Menggunakan `onSnapshot` untuk koleksi Paslon, Pengaturan, dan Pemilih.
  - *Alasan*: Setiap suara yang masuk di bilik suara langsung terupdate di dashboard pantau admin tanpa perlu refresh halaman.
- **Token Otentikasi Pemilih**:
  - *Keputusan*: Verifikasi token dilakukan secara atomik langsung ke dokumen Firestore `pemilih` yang dicocokkan dengan field `token`.
  - *Alasan*: Menjamin tidak ada token ganda atau token yang dapat dipakai dua kali (*race condition protection*).
- **Prosedur Inisialisasi Firebase**:
  - Mengikuti protokol skill Firebase AI Studio: memicu UI setup (`show_aistudio_ui`), verifikasi terms, lalu `ProvisionFirebase`.

---

## 4. Technical Architecture & Data Strategy

### Diagram Arsitektur Sistem

```
┌────────────────────────────────────────────────────────┐
│               Klien Web (React + TS + Vite)            │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │     Bilik Pemilih     │   │     Panel Admin       │ │
│  │   (Token Kiosk UI)    │   │  (DPT, Paslon, Rekap) │ │
│  └──────────┬────────────┘   └──────────┬────────────┘ │
└─────────────┼───────────────────────────┼──────────────┘
              │                           │
              ▼                           ▼
┌────────────────────────────────────────────────────────┐
│             Firebase Client SDK (Firestore)            │
│  - onSnapshot (Live Listeners)                         │
│  - runTransaction / writeBatch (Atomic Vote & Updates) │
└─────────────────────────────┬──────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│                 Google Cloud Firestore                 │
│  ├── /pengaturan/pemilihan  (Status, Jadwal, Sekolah) │
│  ├── /paslon/{paslonId}     (Data Kandidat & Suara)    │
│  ├── /pemilih/{pemilihId}   (DPT Siswa & Guru, Token)  │
│  ├── /suara/{suaraId}       (Audit Trail Rahasia)      │
│  └── /logs/{logId}          (Log Aktivitas Sistem)     │
└────────────────────────────────────────────────────────┘
```

### Struktur Dokumen Firestore (`firebase-blueprint.json`):
1. **`pengaturan/pemilihan`**:
   - `namaPemilihan`: string ("Pemilihan Ketua & Wakil Ketua OSIS")
   - `sekolah`: string ("SMKN 9 Bulukumba")
   - `tahunAjaran`: string ("2026/2027")
   - `status`: string ("belum_dibuka" | "aktif" | "selesai")
   - `logoUrl`: string
   - `waktuMulai`: string
   - `waktuSelesai`: string
2. **`paslon/{paslonId}`**:
   - `nomorUrut`: number
   - `namaKetua`: string
   - `kelasKetua`: string
   - `namaWakil`: string
   - `kelasWakil`: string
   - `fotoUrl`: string
   - `visi`: string
   - `misi`: array of string
   - `suaraPerolehan`: number
3. **`pemilih/{pemilihId}`**:
   - `jenis`: string ("siswa" | "guru")
   - `nisn`: string
   - `nama`: string
   - `kelas`: string
   - `token`: string (5 digit unik)
   - `status`: string ("belum" | "sudah")
   - `waktuMemilih`: string (opsional)
4. **`logs/{logId}`**:
   - `waktu`: string
   - `aksi`: string
   - `pengguna`: string
   - `tipe`: string ("auth" | "sistem" | "pemilihan")

---

## 5. Rencana Tahapan Eksekusi

1. **Langkah 1 (Ketentuan Skill Firebase)**: Memanggil `show_aistudio_ui` dengan `ui_type: "firebase_setup"` untuk persetujuan akun Firebase oleh pengguna.
2. **Langkah 2**: Memverifikasi Terms of Service dan memanggil `ProvisionFirebase` via `rpc_action`.
3. **Langkah 3**: Menyiapkan `firebase-blueprint.json` dan aturan keamanan `firestore.rules`.
4. **Langkah 4**: Mengonfigurasi Firebase SDK (`src/lib/firebase.ts`) dan service layer (`src/services/electionService.ts`).
5. **Langkah 5**: Menghapus data tiruan/dummy dari `src/data/dummy.ts` dan menghapus seluruh label uji coba di UI.
6. **Langkah 6**: Mengintegrasikan `App.tsx` ke Firestore (real-time stream, pemungutan suara atomik, empty states).
7. **Langkah 7**: Kompilasi, verifikasi lint, dan pengujian alur data real.
