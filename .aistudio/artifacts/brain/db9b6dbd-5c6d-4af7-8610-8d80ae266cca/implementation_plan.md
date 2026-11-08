# Proteksi & Kerahasiaan Hasil Suara Paslon dengan PIN Khusus 2 Menit & Kuota 2x

Sistem perlindungan kerahasiaan hasil suara pasangan calon (paslon) selama proses pemilihan OSIS SMKN 9 Bulukumba berlangsung. Metrik makro (total DPT, total suara masuk, dan persentase partisipasi) tetap dipantau secara real-time, namun visualisasi grafik batang dan perolehan suara kandidat dikunci secara ketat dan hanya dapat diintip oleh panitia menggunakan PIN khusus dengan durasi 2 menit dan kuota maksimal 2 kali.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi Berdasarkan Klarifikasi Pengguna:**
> - **PIN Khusus Intip Suara**: PIN 6 digit dengan nilai default `789123` yang dapat dikonfigurasi/diubah secara fleksibel oleh panitia melalui menu **Pengaturan Pemilihan**.
> - **Penyimpanan Kuota 2x**: Kuota 2 kali kesempatan intip suara tersimpan dan tersinkronisasi di database awan **Firebase Firestore** (`kuotaIntipSuara`) sehingga berlaku secara universal untuk seluruh panitia (bukan sekadar sesi browser lokal).
> - **Data yang Tetap Terbuka**: Metrik total suara yang masuk, jumlah DPT yang sudah memilih, dan tingkat partisipasi kehadiran **TETAP TERLIHAT** di Dashboard dan Rekapitulasi agar panitia tetap dapat memonitor kelancaran TPS.
> - **Otomatisasi Pembukaan**: Saat status pemilihan diubah menjadi `ditutup`, hasil perolehan suara paslon langsung terbuka penuh tanpa memerlukan PIN atau kuota lagi.

---

## 1. Overview & Core Concept

### A. Alur Kerja Perlindungan Suara
```
┌────────────────────────────────────────────────────────────────────────┐
│ STATUS PEMILIHAN: SEDANG BERLANGSUNG ('aktif')                         │
├────────────────────────────────────────────────────────────────────────┤
│ • Total DPT & Total Suara Masuk: TERBUKA (Live Monitoring Partisipasi) │
│ • Perolehan Suara & Grafik Paslon: TERKUNCI DENGAN OVERLAY KEAMANAN    │
│                                                                        │
│            [ Tombol: Buka Kunci Sementara (2 Menit) ]                  │
│                                │                                       │
│                       Input PIN 6 Digit                                │
│                     (Default: 789123)                                  │
│                                │                                       │
│             ┌──────────────────┴──────────────────┐                    │
│             ▼                                     ▼                    │
│      PIN Salah / Kuota 0                    PIN Benar & Kuota > 0      │
│      • Getar Error Gempa                    • Kuota berkurang 1 (max 2)│
│      • Akses Ditolak                        • Timer aktif 120s         │
│                                             • Grafik Paslon TERBUKA    │
│                                                   │                    │
│                                             Waktu Habis (00:00)        │
│                                                   ▼                    │
│                                             Terkunci Otomatis          │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Manfaat & Integritas
1. **Mencegah Penggiringan Opini / Bandwagon Effect**: Suara kandidat tidak bocor selama TPS dibuka sehingga asas pemilihan langsung, umum, bebas, dan rahasia (Luber Jurdil) terjaga sempurna.
2. **Fleksibilitas Pengawasan Panitia**: Panitia inti tetap dapat melakukan audit sewaktu-waktu (maksimal 2 kali selama 2 menit) dalam kondisi darurat pengawasan.
3. **Transparansi Operasional TPS**: Panitia tetap dapat memantau berapa banyak siswa/guru yang sudah hadir mencoblos tanpa terhalang.

---

## 2. User Experience & Visual Design

### A. Tampilan Kunci Keamanan (Locked State Overlay)
- Menggunakan panel glassmorphism gelap (`bg-[#042017]/90 backdrop-blur-md border border-emerald-500/30`) yang menutupi komponen grafik Recharts dan kartu persentase paslon.
- Lencana status HUD: `[KERAHASIAAN_AKTIF // HASIL_PASLON_DISEMBUNYIKAN]`.
- Ikon gembok bercahaya dengan indikator kuota: `Sisa Kesempatan Intip: X / 2 Kali`.
- Tombol aksi utama: `Buka Kunci Sementara (2 Menit)` dengan gradasi oranye-amber (`#f97316` ke `#ea580c`).

### B. Modal Input PIN Khusus (6 Digit Cyber HUD)
- Dialog modal menyamping responsif dengan 6 kotak digit PIN bernuansa glassmorphism.
- Animasi getar gempa (*earthquake animation*) jika PIN yang dimasukkan tidak cocok.
- Tampilan sisa kuota yang jelas sebelum eksekusi pembukaan.

### C. HUD Countdown Timer 2 Menit (Active State)
- Saat PIN terverifikasi, banner atas menampilkan timer digital menyala:
  `WAKTU INTIP SUARA TERSISA: 01:59` dengan progress bar menyusut secara real-time.
- Tombol manual: `Kunci Sekarang (Selesai Tinjau)` jika admin ingin menutup kembali sebelum 2 menit berakhir.
- Saat countdown mencapai `00:00`, UI secara instan mengunci kembali dan grafik paslon disembunyikan tanpa perlu refresh halaman.

### D. Tampilan Kuota Habis (Quota Depleted State)
- Jika kuota sudah `0`, tombol kunci otomatis nonaktif (*disabled*):
  `Kuota Intip Habis (2/2 Terpakai) · Hasil Paslon Terbuka Otomatis Saat Pemilihan Ditutup`.

---

## 3. Key Product Decisions & Trade-Offs

### A. Arsitektur Sinkronisasi Firestore
- **Penyimpanan Parameter**: Kolom baru pada dokumen `pengaturan/pemilihan`:
  - `pinHasilSuara: string` (default: `'789123'`)
  - `kuotaIntipSuara: number` (default: `2`)
  - `intipAktifSampai: string | null` (timestamp ISO akhir masa 2 menit)
- **Mengapa di Database Awan?**: Mencegah celah manipulasi di mana admin me-refresh browser atau membuka browser berbeda untuk mengakali kuota 2 kali. Seluruh perangkat panitia tunduk pada kuota 2x yang sama.
- **Audit Logging**: Setiap kali PIN berhasil dimasukkan, dicatat log aktivitas di Firestore:
  `[Otorisasi] Admin membuka akses intip hasil suara paslon (Sisa kuota: X/2)`.

### B. Konfigurasi di Menu Pengaturan Pemilihan
- Di tab **Pengaturan Umum**, ditambahkan field khusus:
  - Input **PIN Khusus Intip Suara (6 Digit)** dengan opsi visibilitas tampil/sembunyi.
  - Kartu kontrol **Status Kuota Intip Suara (Tersisa: X/2)** dengan tombol `Reset Kuota ke 2x` khusus bila terjadi gladi bersih.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FIRESTORE (pengaturan/pemilihan)                │
│  - status: 'persiapan' | 'aktif' | 'ditutup'                           │
│  - pinHasilSuara: "789123"                                             │
│  - kuotaIntipSuara: 2                                                  │
│  - intipAktifSampai: "2026-11-08T14:32:00.000Z" | null                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ onSnapshot (Realtime Sync)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           APP STATE / CONTEXT                          │
│  • isElectionActive = status === 'aktif'                               │
│  • isPeekActive = intipAktifSampai && now < parse(intipAktifSampai)    │
│  • isResultsLocked = isElectionActive && !isPeekActive                 │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   AdminDashboard.tsx   │       │  AdminRekapitulasi.tsx │
       ├────────────────────────┤       ├────────────────────────┤
       │ • KPI DPT: Terbuka     │       │ • Suara Masuk: Terbuka │
       │ • Suara Masuk: Terbuka │       │ • Tabel Paslon: Blur / │
       │ • Recharts: Terkunci   │       │   Terkunci jika aktif  │
       │   dengan Overlay PIN   │       │   dan belum di-unlock  │
       └────────────────────────┘       └────────────────────────┘
```

### Rencana File yang Akan Diperbarui:
1. `src/data/dummy.ts`: Menambahkan `pinHasilSuara`, `kuotaIntipSuara`, dan `intipAktifSampai` ke interface `PengaturanPemilihan` dan `defaultPengaturan`.
2. `src/services/electionService.ts`: Menambahkan fungsi `verifyAndUnlockHasilSuara(pin, currentPengaturan)`, `lockHasilSuaraNow()`, dan `resetKuotaIntipSuara()`.
3. `src/components/admin/AdminDashboard.tsx`: Menerapkan HUD overlay gembok hasil suara, modal PIN 6 digit, timer countdown 2:00, dan tombol kunci cepat.
4. `src/components/admin/AdminRekapitulasi.tsx`: Menerapkan proteksi sensor suara paslon serupa selama pemilihan aktif.
5. `src/components/admin/AdminPemilihan.tsx`: Menambahkan kontrol pengaturan PIN 6 digit dan informasi kuota intip suara.

---

## Verification Plan

### Automated Build & Lint Verification
1. Jalankan `compile_applet` untuk memastikan semua tipedata TypeScript baru (`pinHasilSuara`, `kuotaIntipSuara`, `intipAktifSampai`) tervalidasi dengan sempurna.
2. Jalankan `lint_applet` untuk menjamin tidak ada import atau variabel tak terpakai.

### Manual Functional Testing
1. **Kondisi Pemilihan Aktif**:
   - Set status pemilihan ke `Sedang Berlangsung (Aktif)`.
   - Buka menu **Hasil & Monitoring (Dashboard)**.
   - Verifikasi bahwa KPI Total DPT, Suara Masuk, Belum Memilih, dan Partisipasi tetap tampil normal dengan angka akurat.
   - Verifikasi bahwa Grafik Batang Recharts dan Rincian Paslon tertutup oleh overlay pengaman gembok.
2. **Uji Validasi PIN & Timer 2 Menit**:
   - Masukkan PIN yang salah (misal `111111`) -> periksa efek getar gempa dan penolakan.
   - Masukkan PIN yang benar (`789123`) -> periksa bahwa kuota berkurang dari 2 menjadi 1, countdown timer 02:00 muncul, dan grafik paslon terbuka penuh.
   - Tunggu timer selesai atau klik "Kunci Sekarang" -> pastikan grafik paslon tertutup kembali secara otomatis.
3. **Uji Batas Kuota 2 Kali**:
   - Ulangi proses intip kedua -> kuota menjadi 0.
   - Setelah selesai, verifikasi tombol intip terkunci (*disabled*) dengan pemberitahuan kuota habis.
4. **Uji Status Pemilihan Ditutup**:
   - Ubah status pemilihan menjadi `Pemilihan Ditutup`.
   - Buka Dashboard dan Rekapitulasi -> hasil seluruh paslon otomatis terbuka bebas tanpa memerlukan PIN.
