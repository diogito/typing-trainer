import { create } from 'zustand';
import { storageService } from '@/services/storage';
import { DEFAULT_POSTURE, type PostureCalibration } from '@/types';

interface PostureState {
  posture: PostureCalibration;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  update: (updates: Partial<PostureCalibration>) => Promise<void>;
  reset: () => Promise<void>;
}

export const usePostureStore = create<PostureState>((set) => ({
  posture: { ...DEFAULT_POSTURE },
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const stored = await storageService.loadPosture();
      set({ posture: stored ?? { ...DEFAULT_POSTURE }, loading: false });
    } catch {
      set({ error: 'Failed to load posture settings', loading: false });
    }
  },

  update: async (updates) => {
    set((s) => ({
      posture: { ...s.posture, ...updates },
    }));
    await storageService.savePosture({ ...usePostureStore.getState().posture, ...updates });
  },

  reset: async () => {
    set({ posture: { ...DEFAULT_POSTURE } });
    await storageService.savePosture({ ...DEFAULT_POSTURE });
  },
}));
