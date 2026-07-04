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

// Synchronous initial posture from localStorage fallback
function getInitialPosture(): PostureCalibration {
  try {
    const stored = localStorage.getItem('posture');
    if (stored) {
      return { ...DEFAULT_POSTURE, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_POSTURE };
}

export const usePostureStore = create<PostureState>((set) => {
  const initialPosture = getInitialPosture();

  return {
    posture: initialPosture,
    loading: false,
    error: null,

    load: async () => {
      set({ loading: true, error: null });
      try {
        const stored = await storageService.loadPosture();
        set({ posture: stored ?? initialPosture, loading: false });
      } catch {
        set({ error: 'Failed to load posture settings', loading: false });
      }
    },

    update: async (updates) => {
      set((s) => {
        const newPosture = { ...s.posture, ...updates };
        // Also persist to localStorage for synchronous access
        try {
          localStorage.setItem('posture', JSON.stringify(newPosture));
        } catch {
          // ignore
        }
        return { posture: newPosture };
      });
      await storageService.savePosture({ ...usePostureStore.getState().posture, ...updates });
    },

    reset: async () => {
      set({ posture: { ...DEFAULT_POSTURE } });
      await storageService.savePosture({ ...DEFAULT_POSTURE });
    },
  };
});
