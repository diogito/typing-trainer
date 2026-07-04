import { openDB, type IDBPDatabase } from 'idb';
import type { PersistedSession, UserPreferences, KeyboardLayout } from '@/types';

const DB_NAME = 'typing-trainer';
const DB_VERSION = 1;

const STORES = {
  SESSIONS: 'sessions',
  PREFERENCES: 'preferences',
  LAYOUTS: 'layouts',
} as const;

const MAX_SESSIONS = 50;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tx = ReturnType<IDBPDatabase['transaction']>;

async function openDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const store = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('startTime', 'startTime');
      }
      if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
        db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.LAYOUTS)) {
        const store = db.createObjectStore(STORES.LAYOUTS, { keyPath: 'id' });
        store.createIndex('name', 'name');
      }
    },
  });
}

export const storageService = {
  async saveSession(session: PersistedSession): Promise<void> {
    try {
      const db = await openDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = (db as any).transaction(STORES.SESSIONS, 'readwrite');
      await tx.objectStore(STORES.SESSIONS).put(session);

      // Enforce 50-session retention
      const allSessions = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db as any).transaction(STORES.SESSIONS, 'readonly') as Tx
      ).objectStore(STORES.SESSIONS).getAll() as PersistedSession[];

      if (allSessions.length > MAX_SESSIONS) {
        allSessions.sort((a, b) => a.startTime - b.startTime);
        const toDelete = allSessions.slice(0, allSessions.length - MAX_SESSIONS);
        const writeTx = (db as any).transaction(STORES.SESSIONS, 'readwrite');
        for (const s of toDelete) {
          await writeTx.objectStore(STORES.SESSIONS).delete(s.id);
        }
        await writeTx.done;
      }
      await tx.done;
    } catch (err) {
      console.error('[IndexedDB] Failed to save session:', err);
    }
  },

  async getSession(id: string): Promise<PersistedSession | null> {
    try {
      const db = await openDatabase();
      const tx = (db as any).transaction(STORES.SESSIONS, 'readonly') as Tx;
      const session = await tx.objectStore(STORES.SESSIONS).get(id) as PersistedSession | undefined;
      return session ?? null;
    } catch {
      return null;
    }
  },

  async getAllSessions(): Promise<PersistedSession[]> {
    try {
      const db = await openDatabase();
      const tx = (db as any).transaction(STORES.SESSIONS, 'readonly') as Tx;
      const sessions = await tx.objectStore(STORES.SESSIONS).getAll() as PersistedSession[];
      return sessions.sort((a, b) => b.startTime - a.startTime);
    } catch {
      return [];
    }
  },

  async deleteSession(id: string): Promise<void> {
    try {
      const db = await openDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).transaction(STORES.SESSIONS, 'readwrite').objectStore(STORES.SESSIONS).delete(id);
    } catch {
      // Silently fail
    }
  },

  async savePreferences(prefs: UserPreferences): Promise<void> {
    try {
      const db = await openDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).transaction(STORES.PREFERENCES, 'readwrite').objectStore(STORES.PREFERENCES).put({
        key: 'userPrefs',
        ...prefs,
      });
    } catch (err) {
      console.error('[IndexedDB] Failed to save preferences:', err);
    }
  },

  async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const db = await openDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prefs = await (db as any)
        .transaction(STORES.PREFERENCES, 'readonly')
        .objectStore(STORES.PREFERENCES)
        .get('userPrefs') as UserPreferences | undefined;
      return prefs ?? null;
    } catch {
      return null;
    }
  },

  async saveLayout(layout: KeyboardLayout): Promise<void> {
    try {
      const db = await openDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).transaction(STORES.LAYOUTS, 'readwrite').objectStore(STORES.LAYOUTS).put(layout);
    } catch (err) {
      console.error('[IndexedDB] Failed to save layout:', err);
    }
  },

  async getLayout(id: string): Promise<KeyboardLayout | null> {
    try {
      const db = await openDatabase();
      return await (db as any)
        .transaction(STORES.LAYOUTS, 'readonly')
        .objectStore(STORES.LAYOUTS)
        .get(id);
    } catch {
      return null;
    }
  },

  async getAllLayouts(): Promise<KeyboardLayout[]> {
    try {
      const db = await openDatabase();
      return await (db as any)
        .transaction(STORES.LAYOUTS, 'readonly')
        .objectStore(STORES.LAYOUTS)
        .getAll();
    } catch {
      return [];
    }
  },

  async deleteLayout(id: string): Promise<void> {
    try {
      const db = await openDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).transaction(STORES.LAYOUTS, 'readwrite').objectStore(STORES.LAYOUTS).delete(id);
    } catch {
      // Silently fail
    }
  },

  async isAvailable(): Promise<boolean> {
    try {
      await openDatabase();
      return true;
    } catch {
      return false;
    }
  },
};
