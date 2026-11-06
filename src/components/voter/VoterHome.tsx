import React from 'react';
import { Paslon, PengaturanPemilihan } from '../../data/dummy';
import { SafeImage } from '../SafeImage';
import {
  Vote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface VoterHomeProps {
  paslonList: Paslon[];
  pengaturan: PengaturanPemilihan;
  onStartVoting: () => void;
  onOpenAdminLogin: () => void;
}

export const VoterHome: React.FC<VoterHomeProps> = ({
  paslonList,
  pengaturan,
  onStartVoting,
  onOpenAdminLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-900 to-emerald-950 text-white pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{pengaturan.status === 'aktif' ? 'Pemilihan Sedang Berlangsung' : 'Informasi Pemilihan'}</span>
            <span aria-hidden="true">·</span>
            <span>{pengaturan.subjudul}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 text-balance">
            {pengaturan.judul}
          </h1>

          <p className="text-lg sm:text-xl text-emerald-100 font-medium max-w-2xl mx-auto mb-8 text-balance">
            {pengaturan.sekolah}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={onStartVoting}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-emerald-950 font-bold rounded-xl shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 text-base transition-all transform active:scale-98 cursor-pointer"
            >
              <Vote className="w-5 h-5 text-emerald-950" />
              <span>Gunakan Hak Suara (Coblos)</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </button>
            <a
              href="#profil-paslon"
              className="w-full sm:w-auto px-5 py-3.5 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-100 font-medium rounded-xl text-sm transition-colors text-center"
            >
              Lihat Profil Pasangan Calon
            </a>
          </div>

          {/* Schedule Notice */}
          <div className="mt-8 pt-6 border-t border-emerald-800/60 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/90">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Waktu Pemungutan Suara: {pengaturan.tanggalMulai} s.d {pengaturan.tanggalSelesai}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Asas: Langsung, Umum, Bebas, Rahasia, Jujur & Adil</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Profil Pasangan Calon */}
      <section id="profil-paslon" className="py-14 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
            Kandidat Pemimpin OSIS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Daftar Pasangan Calon
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Kenali visi, misi, dan profil pasangan calon Ketua & Wakil Ketua OSIS sebelum menentukan pilihan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {paslonList.map((paslon) => (
            <div
              key={paslon.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              {/* Header Card dengan Nomor Urut */}
              <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 text-emerald-950 font-black text-lg flex items-center justify-center shadow-xs">
                    {paslon.nomorUrut}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider block">
                      Nomor Urut
                    </span>
                    <span className="text-sm font-bold text-white">
                      Pasangan Calon {paslon.nomorUrut}
                    </span>
                  </div>
                </div>
              </div>

              {/* Foto Calon Ketua & Wakil berdampingan */}
              <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50 border-b border-slate-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden border-2 border-white shadow-xs mb-2">
                    <SafeImage
                      src={paslon.fotoKetuaUrl}
                      alt={paslon.namaKetua}
                      fallbackInitial={paslon.namaKetua}
                      containerClassName="w-full h-full bg-emerald-900/10 flex items-center justify-center"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">Calon Ketua</span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{paslon.namaKetua}</span>
                  <span className="text-[10px] text-slate-500">{paslon.kelasKetua}</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden border-2 border-white shadow-xs mb-2">
                    <SafeImage
                      src={paslon.fotoWakilUrl}
                      alt={paslon.namaWakil}
                      fallbackInitial={paslon.namaWakil}
                      containerClassName="w-full h-full bg-emerald-900/10 flex items-center justify-center"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">Calon Wakil</span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{paslon.namaWakil}</span>
                  <span className="text-[10px] text-slate-500">{paslon.kelasWakil}</span>
                </div>
              </div>

              {/* Visi & Misi */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                      Visi
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-emerald-50/60 p-3 rounded-lg border border-emerald-900/10">
                      "{paslon.visi}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                      Misi Utama
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {paslon.misi.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={onStartVoting}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Pilih Paslon No. {paslon.nomorUrut}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Tata Cara Memilih */}
      <section id="tata-cara" className="py-12 px-4 sm:px-6 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
              Panduan Pemilih
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              4 Langkah Mudah Memberikan Suara
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pastikan Anda sudah menerima kode pemilih resmi dari panitia OSIS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Siapkan Kode Pemilih",
                desc: "Dapatkan kode token unik (contoh: VOTE-9A-001) yang diberikan oleh panitia pemilihan kelas Anda.",
              },
              {
                step: "02",
                title: "Masuk ke Bilik Suara",
                desc: "Klik tombol 'Masuk Bilik Suara' lalu masukkan kode token pemilih Anda untuk verifikasi identitas.",
              },
              {
                step: "03",
                title: "Coblos Paslon Pilihan",
                desc: "Pilih salah satu pasangan calon Ketua dan Wakil Ketua, lalu konfirmasi pilihan Anda pada layar.",
              },
              {
                step: "04",
                title: "Selesai & Rahasia",
                desc: "Suara Anda langsung terenkripsi dan tercatat. Kode pemilih Anda otomatis dinonaktifkan.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col relative"
              >
                <span className="text-2xl font-black text-emerald-800 mb-2">
                  {item.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
            <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Informasi Kerahasiaan Suara:</span>
              Pilihan Anda bersifat rahasia, tertutup, dan tidak dapat dilihat oleh siapapun termasuk panitia. Satu siswa hanya dapat memilih satu kali.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-white font-bold text-sm">PanritaVote OSIS</span>
            <span className="text-slate-400 text-xs">SMKN 9 Bulukumba, Sulawesi Selatan</span>
            <span className="text-slate-500 text-[11px] mt-1">Sistem Pemilihan Ketua & Wakil Ketua OSIS Terintegrasi</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdminLogin}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Panel Panitia / Admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
