import {
  collection,
  doc,
  getDoc,
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
