import React, { useState } from 'react';
import { Pemilih } from '../../data/dummy';
import { Printer, X, Filter, CheckCircle2, Shield, Scissors, ArrowLeft } from 'lucide-react';
import { SafeImage } from '../SafeImage';

interface AdminCardPrinterProps {
  pemilihList: Pemilih[];
  sekolah: string;
  logoUrl: string;
  onClose: () => void;
}

export const AdminCardPrinter: React.FC<AdminCardPrinterProps> = ({
  pemilihList,
  sekolah,
  logoUrl,
  onClose,
}) => {
  const [filterJenis, setFilterJenis] = useState<'semua' | 'siswa' | 'guru'>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'belum' | 'sudah'>('belum'); // Default to belum memilih so cards ready for distribution

  const cardsToPrint = pemilihList.filter((p) => {
    const matchesJenis = filterJenis === 'semua' || p.jenis === filterJenis;
    const matchesStatus = filterStatus === 'semua' || p.status === filterStatus;
    return matchesJenis && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-in fade-in">
      {/* Top Breadcrumb & Back Bar (Hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#042017]/90 backdrop-blur-xl border border-emerald-500/25 text-white shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#021810] border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-orange-500/50 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar DPT</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Cetak Lembar Kartu Pemilih
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                HALAMAN PENUH
              </span>
            </div>
            <p className="text-xs text-emerald-300/80">
              Format lembar A4 hemat kertas (8 kartu per lembar dengan garis potong dan token unik).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            disabled={cardsToPrint.length === 0}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-orange-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-orange-400/40"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF ({cardsToPrint.length} Kartu)</span>
          </button>
        </div>
      </div>

      {/* Container */}
      <div className="bg-white rounded-3xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">

        {/* Filter Controls (Hidden in print) */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter Cetak:
            </span>
            <div className="inline-flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              {(['semua', 'siswa', 'guru'] as const).map((j) => (
                <button
                  key={j}
                  onClick={() => setFilterJenis(j)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-colors cursor-pointer ${
                    filterJenis === j
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {j === 'semua' ? 'Semua Jenis' : j}
                </button>
              ))}
            </div>

            <div className="inline-flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 ml-1">
              {(['semua', 'belum', 'sudah'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-colors cursor-pointer ${
                    filterStatus === s
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === 'belum'
                    ? 'Hanya Belum Memilih'
                    : s === 'sudah'
                    ? 'Sudah Memilih'
                    : 'Semua Status'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-500 text-xs">
            Menampilkan <strong className="font-mono text-slate-900">{cardsToPrint.length}</strong> kartu
          </div>
        </div>

        {/* Preview & Print Sheet Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200 print:bg-white print:p-0">
          {cardsToPrint.length > 0 ? (
            <div className="max-w-[210mm] mx-auto bg-white p-4 sm:p-6 shadow-md print:shadow-none print:p-0 rounded-2xl print:rounded-none">
              {/* Grid of Pocket Cards (2 columns on mobile/preview, 2 columns on print A4 = 8 cards per page) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 print:grid-cols-2 print:gap-3">
                {cardsToPrint.map((pemilih) => (
                  <div
                    key={pemilih.id}
                    className="border-2 border-dashed border-slate-300 print:border-slate-400 p-3.5 rounded-xl bg-white relative flex flex-col justify-between break-inside-avoid shadow-2xs print:shadow-none"
                  >
                    {/* Cut icon decoration */}
                    <div className="absolute -top-2.5 -right-2 text-slate-300 print:text-slate-400">
                      <Scissors className="w-3.5 h-3.5 transform rotate-90" />
                    </div>

                    {/* Card Header */}
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-800/20 flex items-center justify-center shrink-0 overflow-hidden">
                        <SafeImage
                          src={logoUrl}
                          alt="Logo SMKN 9 Bulukumba"
                          fallbackInitial="9B"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black tracking-wider text-emerald-950 uppercase block truncate">
                          KARTU PEMILIH RESMI OSIS
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold truncate block">
                          {sekolah} · Periode 2026/2027
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          pemilih.jenis === 'guru'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {pemilih.jenis}
                      </span>
                    </div>

                    {/* Voter Identity */}
                    <div className="py-2.5 space-y-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Nama Pemilih
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {pemilih.nama}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                            {pemilih.jenis === 'guru' ? 'NIP / NUPTK' : 'NISN'}
                          </span>
                          <span className="font-mono text-slate-700 truncate block">
                            {pemilih.nisn}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                            {pemilih.jenis === 'guru' ? 'Jabatan' : 'Kelas'}
                          </span>
                          <span className="text-slate-700 truncate block font-medium">
                            {pemilih.kelas}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Token Box */}
                    <div className="p-2 rounded-xl bg-emerald-50 border-2 border-emerald-700/60 text-center flex items-center justify-between px-3">
                      <div className="text-left">
                        <span className="text-[9px] font-extrabold text-emerald-900 uppercase block leading-none">
                          KODE TOKEN SUARA
                        </span>
                        <span className="text-[8px] text-emerald-700 leading-tight block">
                          Gunakan saat mencoblos
                        </span>
                      </div>
                      <span className="text-xl font-black font-mono tracking-widest text-emerald-950">
                        {pemilih.token}
                      </span>
                    </div>

                    {/* Footer Warning */}
                    <div className="pt-2 mt-1 text-[8px] text-slate-400 text-center flex items-center justify-center gap-1 border-t border-slate-100">
                      <Shield className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                      <span>Rahasiakan kode token. Satu orang satu kali memilih.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              Tidak ada kartu pemilih yang sesuai dengan filter yang dipilih.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
