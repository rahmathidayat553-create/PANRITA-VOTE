import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Paslon,
  Pemilih,
  PengaturanPemilihan,
  LogAktivitas,
  ElectionBackup,
  defaultPengaturan,
} from '../data/dummy';

// Firestore collection & document keys
const PENGATURAN_DOC_PATH = 'pengaturan/pemilihan';
const PASLON_COLLECTION = 'paslon';
const PEMILIH_COLLECTION = 'pemilih';
const SUARA_COLLECTION = 'suara';
const LOGS_COLLECTION = 'logs';

/**
 * 1. PENGATURAN PEMILIHAN (Real-time listener & update)
 */
export function subscribePengaturan(
  onUpdate: (pengaturan: PengaturanPemilihan) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, PENGATURAN_DOC_PATH);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as PengaturanPemilihan);
      } else {
        // Inisialisasi awal pengaturan bersih jika belum ada di database
        try {
          await setDoc(docRef, defaultPengaturan);
          onUpdate(defaultPengaturan);
        } catch (e: any) {
          console.error('Gagal inisialisasi pengaturan di Firestore:', e);
          onUpdate(defaultPengaturan);
        }
      }
    },
    (error) => {
      console.error('Error subscribePengaturan:', error);
      onError?.(error);
    }
  );
}

export async function savePengaturan(newSettings: PengaturanPemilihan): Promise<void> {
  const docRef = doc(db, PENGATURAN_DOC_PATH);
  await setDoc(docRef, newSettings, { merge: true });
}

/**
 * 2. PASANGAN CALON / KANDIDAT (Real-time listener & CRUD)
 */
export function subscribePaslon(
  onUpdate: (list: Paslon[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, PASLON_COLLECTION), orderBy('nomorUrut', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Paslon[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Paslon), id: docSnap.id });
      });
      onUpdate(list);
    },
    (error) => {
      console.error('Error subscribePaslon:', error);
      onError?.(error);
    }
  );
}

export async function addPaslonToDb(paslon: Paslon): Promise<void> {
  const docRef = doc(db, PASLON_COLLECTION, paslon.id);
  await setDoc(docRef, paslon);
}

export async function updatePaslonInDb(paslon: Paslon): Promise<void> {
  const docRef = doc(db, PASLON_COLLECTION, paslon.id);
  await updateDoc(docRef, { ...paslon });
}

export async function deletePaslonFromDb(id: string): Promise<void> {
  const docRef = doc(db, PASLON_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * 3. DAFTAR PEMILIH TETAP (DPT Siswa & Guru)
 */
export function subscribePemilih(
  onUpdate: (list: Pemilih[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, PEMILIH_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Pemilih[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Pemilih), id: docSnap.id });
      });
      onUpdate(list);
    },
    (error) => {
      console.error('Error subscribePemilih:', error);
      onError?.(error);
    }
  );
}

export async function addPemilihToDb(pemilih: Pemilih): Promise<void> {
  const docRef = doc(db, PEMILIH_COLLECTION, pemilih.id);
  await setDoc(docRef, pemilih);
}

export async function updatePemilihInDb(pemilih: Pemilih): Promise<void> {
  const docRef = doc(db, PEMILIH_COLLECTION, pemilih.id);
  await updateDoc(docRef, { ...pemilih });
}

export async function deletePemilihFromDb(id: string): Promise<void> {
  const docRef = doc(db, PEMILIH_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function importPemilihBatchToDb(voters: Pemilih[]): Promise<void> {
  // Firestore membatasi maksimal 500 operasi per writeBatch
  const chunkSize = 400;
  for (let i = 0; i < voters.length; i += chunkSize) {
    const chunk = voters.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const v of chunk) {
      const docRef = doc(db, PEMILIH_COLLECTION, v.id);
      batch.set(docRef, v);
    }
    await batch.commit();
  }
}

/**
 * 4. PENCABUTAN SUARA / PENCOBLOSAN ATOMIK
 * Menjamin integritas: Paslon bertambah suara, token pemilih berubah menjadi 'sudah',
 * dan audit trail suara anonim tercatat dalam 1 batch transaksi Firestore.
 */
export async function executeAtomicVote(
  voter: Pemilih,
  selectedPaslon: Paslon
): Promise<void> {
  const timestamp =
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WITA';

  const batch = writeBatch(db);

  // 1. Update Pemilih status -> 'sudah'
  const pemilihRef = doc(db, PEMILIH_COLLECTION, voter.id);
  batch.update(pemilihRef, {
    status: 'sudah',
    waktuMemilih: timestamp,
  });

  // 2. Increment suara Paslon
  const paslonRef = doc(db, PASLON_COLLECTION, selectedPaslon.id);
  batch.update(paslonRef, {
    suaraPerolehan: increment(1),
  });

  // 3. Rekam suara anonim untuk audit rekapitulasi
  const voteDocId = `suara-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const suaraRef = doc(db, SUARA_COLLECTION, voteDocId);
  batch.set(suaraRef, {
    paslonId: selectedPaslon.id,
    nomorUrut: selectedPaslon.nomorUrut,
    waktu: timestamp,
  });

  // 4. Catat ke log aktivitas sistem
  const logDocId = `log-${Date.now()}`;
  const logRef = doc(db, LOGS_COLLECTION, logDocId);
  batch.set(logRef, {
    id: logDocId,
    waktu: timestamp,
    aksi: `Satu suara masuk di bilik suara untuk Paslon No. ${selectedPaslon.nomorUrut}`,
    pengguna: 'Bilik Suara (Anonim)',
    tipe: 'vote',
  });

  await batch.commit();
}

/**
 * 5. LOG AKTIVITAS (Real-time listener & add)
 */
export function subscribeLogs(
  onUpdate: (logs: LogAktivitas[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, LOGS_COLLECTION), orderBy('waktu', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: LogAktivitas[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as LogAktivitas), id: docSnap.id });
      });
      onUpdate(list);
    },
    (error) => {
      console.error('Error subscribeLogs:', error);
      onError?.(error);
    }
  );
}

export async function addLogToDb(log: LogAktivitas): Promise<void> {
  const docRef = doc(db, LOGS_COLLECTION, log.id);
  await setDoc(docRef, log);
}

/**
 * 6. RESET DATA & ZONA BAHAYA
 */

// Reset Perolehan Suara Saja (Menolkan suara paslon & mengembalikan status DPT ke 'belum')
export async function resetHasilPemilihanInDb(
  currentPaslon: Paslon[],
  currentPemilih: Pemilih[]
): Promise<void> {
  // 1. Reset perolehan suara paslon -> 0
  if (currentPaslon.length > 0) {
    const batchPaslon = writeBatch(db);
    for (const p of currentPaslon) {
      const pRef = doc(db, PASLON_COLLECTION, p.id);
      batchPaslon.update(pRef, { suaraPerolehan: 0 });
    }
    await batchPaslon.commit();
  }

  // 2. Reset status DPT -> 'belum' & kosongkan waktuMemilih dalam batch 400
  const chunkSize = 400;
  for (let i = 0; i < currentPemilih.length; i += chunkSize) {
    const chunk = currentPemilih.slice(i, i + chunkSize);
    const batchPemilih = writeBatch(db);
    for (const v of chunk) {
      const vRef = doc(db, PEMILIH_COLLECTION, v.id);
      batchPemilih.update(vRef, {
        status: 'belum',
        waktuMemilih: '',
      });
    }
    await batchPemilih.commit();
  }

  // 3. Hapus seluruh data rekaman suara anonim di koleksi suara
  try {
    const suaraSnap = await getDocs(collection(db, SUARA_COLLECTION));
    const suaraDocs = suaraSnap.docs;
    for (let i = 0; i < suaraDocs.length; i += chunkSize) {
      const chunk = suaraDocs.slice(i, i + chunkSize);
      const batchSuara = writeBatch(db);
      for (const d of chunk) {
        batchSuara.delete(d.ref);
      }
      await batchSuara.commit();
    }
  } catch (err) {
    console.warn('Catatan: Koleksi suara mungkin kosong atau tidak dapat diakses:', err);
  }

  // 4. Catat Log Sistem
  const timestamp =
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WITA';
  await addLogToDb({
    id: `log-${Date.now()}`,
    waktu: timestamp,
    aksi: 'Admin mereset seluruh perolehan suara (hasil bilik suara dinolkan kembali)',
    pengguna: 'Admin Panitia',
    tipe: 'sistem',
  });
}

// Reset Total Database (Factory Reset - Hapus semua Paslon & DPT)
export async function resetTotalDatabaseInDb(
  currentPaslon: Paslon[],
  currentPemilih: Pemilih[]
): Promise<void> {
  const chunkSize = 400;

  // 1. Hapus semua paslon
  if (currentPaslon.length > 0) {
    const batchPaslon = writeBatch(db);
    for (const p of currentPaslon) {
      batchPaslon.delete(doc(db, PASLON_COLLECTION, p.id));
    }
    await batchPaslon.commit();
  }

  // 2. Hapus semua pemilih
  for (let i = 0; i < currentPemilih.length; i += chunkSize) {
    const chunk = currentPemilih.slice(i, i + chunkSize);
    const batchPemilih = writeBatch(db);
    for (const v of chunk) {
      batchPemilih.delete(doc(db, PEMILIH_COLLECTION, v.id));
    }
    await batchPemilih.commit();
  }

  // 3. Hapus data suara
  try {
    const suaraSnap = await getDocs(collection(db, SUARA_COLLECTION));
    const suaraDocs = suaraSnap.docs;
    for (let i = 0; i < suaraDocs.length; i += chunkSize) {
      const chunk = suaraDocs.slice(i, i + chunkSize);
      const batchSuara = writeBatch(db);
      for (const d of chunk) {
        batchSuara.delete(d.ref);
      }
      await batchSuara.commit();
    }
  } catch (err) {
    console.warn('Gagal membersihkan suara:', err);
  }

  // 4. Reset pengaturan ke default (Status: persiapan)
  await savePengaturan(defaultPengaturan);

  // 5. Catat Log Sistem
  const timestamp =
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WITA';
  await addLogToDb({
    id: `log-${Date.now()}`,
    waktu: timestamp,
    aksi: 'Admin melakukan Reset Total Database (Factory Reset)',
    pengguna: 'Admin Panitia',
    tipe: 'sistem',
  });
}

/**
 * 7. RESTORE DATA DARI BACKUP JSON
 */
export async function restoreCompleteBackupToDb(
  backup: ElectionBackup,
  existingPaslon: Paslon[],
  existingPemilih: Pemilih[]
): Promise<void> {
  const chunkSize = 400;

  // 1. Hapus data paslon lama
  if (existingPaslon.length > 0) {
    const batchDelPaslon = writeBatch(db);
    for (const p of existingPaslon) {
      batchDelPaslon.delete(doc(db, PASLON_COLLECTION, p.id));
    }
    await batchDelPaslon.commit();
  }

  // 2. Hapus data pemilih lama
  for (let i = 0; i < existingPemilih.length; i += chunkSize) {
    const chunk = existingPemilih.slice(i, i + chunkSize);
    const batchDelPemilih = writeBatch(db);
    for (const v of chunk) {
      batchDelPemilih.delete(doc(db, PEMILIH_COLLECTION, v.id));
    }
    await batchDelPemilih.commit();
  }

  // 3. Masukkan pengaturan dari backup
  if (backup.pengaturan) {
    await savePengaturan(backup.pengaturan);
  }

  // 4. Masukkan paslon dari backup
  if (backup.paslonList && backup.paslonList.length > 0) {
    const batchPaslon = writeBatch(db);
    for (const p of backup.paslonList) {
      batchPaslon.set(doc(db, PASLON_COLLECTION, p.id), p);
    }
    await batchPaslon.commit();
  }

  // 5. Masukkan pemilih dari backup
  if (backup.pemilihList && backup.pemilihList.length > 0) {
    for (let i = 0; i < backup.pemilihList.length; i += chunkSize) {
      const chunk = backup.pemilihList.slice(i, i + chunkSize);
      const batchPemilih = writeBatch(db);
      for (const v of chunk) {
        batchPemilih.set(doc(db, PEMILIH_COLLECTION, v.id), v);
      }
      await batchPemilih.commit();
    }
  }

  // 6. Catat log pemulihan
  const timestamp =
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WITA';
  await addLogToDb({
    id: `log-${Date.now()}`,
    waktu: timestamp,
    aksi: `Pemulihan data (Restore) berhasil dari cadangan (${backup.exportedAt})`,
    pengguna: 'Admin Panitia',
    tipe: 'sistem',
  });
}
