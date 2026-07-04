import { create } from 'zustand';
import type { UserPreferences } from '@/types';
import { FINGER_COLORS } from '@/types';

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'createdAt' | 'updatedAt'> = {
  selectedLayoutId: 'qwerty-es',
  fingerColorScheme: { ...FINGER_COLORS },
  customFingerMap: null,
  fontSize: 16,
  showLayerIndicator: true,
  theme: 'light',
};

interface UISlice {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

export const useUISlice = create<UISlice>((set) => ({
  preferences: {
    ...DEFAULT_PREFERENCES,
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
        ...DEFAULT_PREFERENCES,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
  },
}));
