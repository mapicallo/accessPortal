import type { FontSizeId, HistoryMode, ProfileId } from '../profiles/types.js';
import type { Locale } from '../storage.js';

const DB_NAME = 'accessportal';
const DB_VERSION = 1;
const PREFS_KEY = 'user';
const MAX_HISTORY = 50;

export type UserPreferences = {
  locale: Locale;
  profile: ProfileId;
  fontSize: FontSizeId;
};

export type HistoryEntry = {
  id: number;
  createdAt: number;
  profile: ProfileId;
  mode: HistoryMode;
  title: string;
  sourceText: string;
  resultText: string;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  locale: 'en',
  profile: 'cognitive',
  fontSize: 'normal',
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error ?? new Error('IDB_OPEN_FAILED'));
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences');
      }
      if (!db.objectStoreNames.contains('history')) {
        const store = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IDB_TX_FAILED'));
    tx.onabort = () => reject(tx.error ?? new Error('IDB_TX_ABORTED'));
  });
}

function reqResult<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IDB_REQ_FAILED'));
  });
}

export async function initDb(): Promise<void> {
  await openDb();
}

export async function hasPreferencesRecord(): Promise<boolean> {
  const db = await openDb();
  const tx = db.transaction('preferences', 'readonly');
  const saved = await reqResult(tx.objectStore('preferences').get(PREFS_KEY));
  await txDone(tx);
  return saved !== undefined;
}

export async function loadPreferences(): Promise<UserPreferences> {
  const db = await openDb();
  const tx = db.transaction('preferences', 'readonly');
  const store = tx.objectStore('preferences');
  const saved = await reqResult(store.get(PREFS_KEY));
  await txDone(tx);

  if (saved && typeof saved === 'object') {
    const p = saved as Partial<UserPreferences>;
    return {
      locale: p.locale === 'es' ? 'es' : 'en',
      profile: p.profile === 'visual' || p.profile === 'motor' ? p.profile : 'cognitive',
      fontSize:
        p.fontSize === 'large' || p.fontSize === 'xlarge' ? p.fontSize : 'normal',
    };
  }

  return { ...DEFAULT_PREFERENCES };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('preferences', 'readwrite');
  tx.objectStore('preferences').put(prefs, PREFS_KEY);
  await txDone(tx);
}

export async function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'createdAt'>,
): Promise<HistoryEntry> {
  const db = await openDb();
  const record: Omit<HistoryEntry, 'id'> = {
    ...entry,
    createdAt: Date.now(),
  };

  const tx = db.transaction('history', 'readwrite');
  const store = tx.objectStore('history');
  const id = await reqResult(store.add(record));
  await txDone(tx);

  await trimHistory(MAX_HISTORY);

  return { ...record, id: id as number };
}

async function trimHistory(max: number): Promise<void> {
  const entries = await listHistory();
  if (entries.length <= max) return;

  const toDelete = entries.slice(max);
  const db = await openDb();
  const tx = db.transaction('history', 'readwrite');
  const store = tx.objectStore('history');
  for (const entry of toDelete) {
    store.delete(entry.id);
  }
  await txDone(tx);
}

export async function listHistory(): Promise<HistoryEntry[]> {
  const db = await openDb();
  const tx = db.transaction('history', 'readonly');
  const store = tx.objectStore('history');
  const index = store.index('createdAt');
  const all = await reqResult(index.getAll());
  await txDone(tx);

  return (all as HistoryEntry[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteHistoryEntry(id: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('history', 'readwrite');
  tx.objectStore('history').delete(id);
  await txDone(tx);
}

export async function clearHistory(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('history', 'readwrite');
  tx.objectStore('history').clear();
  await txDone(tx);
}

export function historyTitleFromText(text: string, locale: Locale): string {
  const line = text.split(/\r?\n/).find((l) => l.trim())?.trim() ?? '';
  if (line.length > 72) return `${line.slice(0, 69)}…`;
  if (line) return line;
  return locale === 'es' ? 'Texto adaptado' : 'Adapted text';
}
