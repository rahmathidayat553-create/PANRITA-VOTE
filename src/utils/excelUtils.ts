import * as XLSX from 'xlsx';
import { Pemilih, generateUniqueToken } from '../data/dummy';

export interface ExcelRow {
  'Jenis (siswa / guru)'?: string;
  'Nomor Induk (NISN / NIP)'?: string | number;
  'Nama Lengkap'?: string;
  'Kelas / Jabatan'?: string;
  'Jenis'?: string;
  'NISN / NIP'?: string | number;
  'NISN'?: string | number;
  'NIP'?: string | number;
  'Nama'?: string;
  'Kelas'?: string;
}

/**
 * Downloads a pre-formatted Excel template (.xlsx) for voter data input
 */
export function downloadVoterTemplate() {
  const sampleData = [
    {
      'Jenis (siswa / guru)': 'siswa',
      'Nomor Induk (NISN / NIP)': '0061234509',
      'Nama Lengkap': 'Alya Zahra',
      'Kelas / Jabatan': 'X DKV 1',
    },
    {
      'Jenis (siswa / guru)': 'siswa',
      'Nomor Induk (NISN / NIP)': '0061234510',
      'Nama Lengkap': 'Bagas Pratama',
      'Kelas / Jabatan': 'XI TJKT 2',
    },
    {
      'Jenis (siswa / guru)': 'guru',
      'Nomor Induk (NISN / NIP)': '198003152008011005',
      'Nama Lengkap': 'Drs. H. Syamsuddin, M.M',
      'Kelas / Jabatan': 'Guru Bimbingan Konseling',
    },
    {
      'Jenis (siswa / guru)': 'guru',
      'Nomor Induk (NISN / NIP)': '198807122015022003',
      'Nama Lengkap': 'Nurul Fitriani, S.Pd',
      'Kelas / Jabatan': 'Guru Matematika',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 22 }, // Jenis
    { wch: 26 }, // Nomor Induk
    { wch: 30 }, // Nama Lengkap
    { wch: 26 }, // Kelas / Jabatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pemilih SMKN 9');

  XLSX.writeFile(workbook, 'template_dpt_smkn9_bulukumba.xlsx');
}

/**
 * Parses an uploaded .xlsx file and generates unique 5-digit tokens
 */
export async function parseVoterExcel(
  file: File,
  currentTokens: string[]
): Promise<Pemilih[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Get first sheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Berkas Excel tidak memiliki lembar kerja (sheet).');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

  if (jsonData.length === 0) {
    throw new Error('Lembar kerja Excel kosong atau tidak memiliki data pemilih.');
  }

  const existingTokens = [...currentTokens];
  const newVoters: Pemilih[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];

    // Extract fields with fallbacks for flexible header names
    const rawJenis = (
      row['Jenis (siswa / guru)'] ||
      row['Jenis'] ||
      'siswa'
    ).toString().toLowerCase();

    const jenis: 'siswa' | 'guru' = rawJenis.includes('guru') ? 'guru' : 'siswa';

    const nama = (
      row['Nama Lengkap'] ||
      row['Nama'] ||
      ''
    ).toString().trim();

    const nisn = (
      row['Nomor Induk (NISN / NIP)'] ||
      row['NISN / NIP'] ||
      row['NISN'] ||
      row['NIP'] ||
      ''
    ).toString().trim();

    const kelas = (
      row['Kelas / Jabatan'] ||
      row['Kelas'] ||
      (jenis === 'guru' ? 'Guru' : 'Siswa')
    ).toString().trim();

    // Skip empty rows
    if (!nama && !nisn) continue;

    // Generate unique 5-digit numeric token
    const token = generateUniqueToken(existingTokens);
    existingTokens.push(token);

    newVoters.push({
      id: `pem-import-${Date.now()}-${i}`,
      jenis,
      nama: nama || `Pemilih ${i + 1}`,
      nisn: nisn || `${Date.now()}${i}`,
      kelas: kelas || (jenis === 'guru' ? 'Guru' : 'Siswa'),
      token,
      status: 'belum',
    });
  }

  return newVoters;
}

/**
 * Exports voter list to CSV format with UTF-8 BOM for backup and manual auditing
 */
export function exportVotersToCsv(
  voters: Pemilih[],
  customFilename?: string
): void {
  const headers = [
    'No',
    'Jenis Pemilih',
    'Nomor Induk (NISN / NIP)',
    'Nama Lengkap',
    'Kelas / Jabatan',
    'Token Akses (5 Digit)',
    'Status Hak Suara',
  ];

  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = voters.map((voter, index) => [
    index + 1,
    voter.jenis === 'guru' ? 'Guru' : 'Siswa',
    `'${voter.nisn}`, // Prepend apostrophe so Excel preserves leading zeros in NISN/NIP
    voter.nama,
    voter.kelas,
    voter.token,
    voter.status === 'sudah' ? 'SUDAH MEMILIH' : 'BELUM MEMILIH',
  ]);

  const csvContent =
    '\uFEFF' +
    [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const dateStr = new Date().toISOString().slice(0, 10);
  a.download =
    customFilename || `dpt_backup_smkn9_bulukumba_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

