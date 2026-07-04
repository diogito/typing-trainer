/**
 * Zustand storage adapter for IndexedDB.
 * Wraps the storageService to conform to Zustand's persist middleware interface.
 *
 * Keys are stored under the "userPrefs" document in the preferences object store,
 * serialized as JSON fields.
 *
 * Usage:
 *   import { create } from 'zustand';
 *   import { idbStorage } from '@/lib/idbStorage';
 *
 *   const useMyStore = create<MyState>()(
 *     persist(
 *       (set, get) => ({ ... }),
 *       { name: 'my-store', storage: idbStorage }
 *     )
 *   );
 */

import type { StateStorage } from 'zustand/middleware';
import { storageService } from '@/services/storage';
import type { UserPreferences } from '@/types';

export const idbStorage: StateStorage = {
  async getItem(name: string) {
    try {
      const raw = await localStorage.getItem(name);
      if (raw) return raw;

      // Fallback: IndexedDB
      const prefs = await storageService.loadPreferences();
      if (!prefs) return null;
      // Store the entire Zustand slice as JSON in the prefs
      const json = (prefs as unknown as Record<string, unknown>)['__zustand__' + name] as string | undefined;
      return json ?? null;
    } catch {
      return null;
    }
  },

  async setItem(name: string, value: string) {
    try {
      // Try localStorage first (synchronous, fast)
      localStorage.setItem(name, value);

      // Also persist to IndexedDB for durability
      const prefs = await storageService.loadPreferences() ?? {};
      const updated = {
        ...prefs,
        ['__zustand__' + name]: value,
        updatedAt: Date.now(),
      } as UserPreferences;
      await storageService.savePreferences(updated);
    } catch {
      console.error(`[idbStorage] Failed to persist "${name}":`, value);
    }
  },

  async removeItem(name: string) {
    try {
      localStorage.removeItem(name);
      const prefs = await storageService.loadPreferences() ?? {};
      const { ['__zustand__' + name]: _, ...rest } = prefs as Record<string, unknown>;
      if (Object.keys(rest).length > 0) {
        await storageService.savePreferences(rest as unknown as UserPreferences);
      }
    } catch {
      console.error(`[idbStorage] Failed to remove "${name}":`, name);
    }
  },
};
