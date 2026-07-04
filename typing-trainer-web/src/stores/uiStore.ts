import { create } from 'zustand';
import type { UserPreferences } from '@/types';
import { FINGER_COLORS } from '@/types';

interface MirrorModeState {
  enabled: boolean;
  progress: number; // 0-100, never decreases
}

interface UISlice {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  mirrorMode: MirrorModeState;
  toggleMirrorMode: () => void;
  incrementMirrorProgress: () => void;
  resetMirrorMode: () => void;
  getMirrorOpacity: () => number; // returns 0.08 to 1.0 based on progress
}

// Linear mapping: progress 0 → 1.0, progress 100 → 0.08
function computeOpacity(progress: number): number {
  return 1.0 - (progress / 100) * (1.0 - 0.08);
}

export const useUISlice = create<UISlice>((set, get) => ({
  preferences: {
    ...{
      selectedLayoutId: 'qwerty-es',
      fingerColorScheme: { ...FINGER_COLORS },
      customFingerMap: null,
      fontSize: 16,
      showLayerIndicator: true,
      theme: 'light',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        [key]: value,
        updatedAt: Date.now(),
      },
    }));
  },

  setPreferences: (prefs: Partial<UserPreferences>) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...prefs,
        updatedAt: Date.now(),
      },
    }));
  },

  resetPreferences: () => {
    set({
      preferences: {
        selectedLayoutId: 'qwerty-es',
        fingerColorScheme: { ...FINGER_COLORS },
        customFingerMap: null,
        fontSize: 16,
        showLayerIndicator: true,
        theme: 'light',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
  },

  // --- Mirror Mode ---
  mirrorMode: { enabled: false, progress: 0 },

  toggleMirrorMode: () => {
    set((state) => ({
      mirrorMode: {
        enabled: !state.mirrorMode.enabled,
        // Reset progress when enabling
        progress: state.mirrorMode.enabled ? state.mirrorMode.progress : 0,
      },
    }));
  },

  incrementMirrorProgress: () => {
    set((state) => {
      if (!state.mirrorMode.enabled) return state;
      // +2% per correct keystroke, capped at 100
      const newProgress = Math.min(100, state.mirrorMode.progress + 2);
      return {
        mirrorMode: {
          ...state.mirrorMode,
          progress: newProgress,
        },
      };
    });
  },

  resetMirrorMode: () => {
    set((state) => ({
      mirrorMode: {
        enabled: state.mirrorMode.enabled,
        progress: 0,
      },
    }));
  },

  getMirrorOpacity: () => {
    return computeOpacity(get().mirrorMode.progress);
  },
}));
