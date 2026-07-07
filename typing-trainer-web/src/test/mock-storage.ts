import { vi } from 'vitest';

// Shared IndexedDB mock store — used by storageService mock across test files
const idbMockStore = new Map<string, any>();

export const mockStorageService = {
  store: idbMockStore,
  saveSession: vi.fn(async (session: any) => {
    idbMockStore.set(session.id, session);
  }),
  getSession: vi.fn(async (id: string) => {
    return idbMockStore.get(id) ?? null;
  }),
  getAllSessions: vi.fn(async () => {
    return Array.from(idbMockStore.values())
      .sort((a: any, b: any) => b.startTime - a.startTime);
  }),
  deleteSession: vi.fn(async (id: string) => {
    idbMockStore.delete(id);
  }),
  savePreferences: vi.fn(async () => {}),
  loadPreferences: vi.fn(async () => null),
  saveLayout: vi.fn(async () => {}),
  getLayout: vi.fn(async () => null),
  getAllLayouts: vi.fn(async () => []),
  deleteLayout: vi.fn(async () => {}),
  savePosture: vi.fn(async () => {}),
  loadPosture: vi.fn(async () => null),
  isAvailable: vi.fn(async () => true),
};

// Reset mock state for each test
export function resetMockStorage() {
  idbMockStore.clear();
  mockStorageService.saveSession.mockClear();
  mockStorageService.getSession.mockClear();
  mockStorageService.getAllSessions.mockClear();
  mockStorageService.deleteSession.mockClear();
  mockStorageService.savePreferences.mockClear();
  mockStorageService.loadPreferences.mockClear();
  mockStorageService.saveLayout.mockClear();
  mockStorageService.getLayout.mockClear();
  mockStorageService.getAllLayouts.mockClear();
  mockStorageService.deleteLayout.mockClear();
  mockStorageService.savePosture.mockClear();
  mockStorageService.loadPosture.mockClear();
  mockStorageService.isAvailable.mockClear();
}
