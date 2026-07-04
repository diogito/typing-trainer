import { create } from 'zustand';
import type { FingerColorScheme } from '@/types';
import { FINGER_COLORS } from '@/types';

interface KeyboardSlice {
  activeScancodes: Set<string>;
  fingerColorScheme: FingerColorScheme;
  fingerErrors: Record<string, number>;
  keyboardWidth: number;
  keyboardHeight: number;
  keyDown: (scancode: string) => void;
  keyUp: (scancode: string) => void;
  setColors: (scheme: Partial<FingerColorScheme>) => void;
  recordError: (scancode: string) => void;
  getErrorCount: (scancode: string) => number;
  resetErrors: () => void;
}

export const useKeyboardStore = create<KeyboardSlice>((set, get) => ({
  activeScancodes: new Set(),
  fingerColorScheme: { ...FINGER_COLORS },
  fingerErrors: {},
  keyboardWidth: 900,
  keyboardHeight: 300,

  keyDown: (scancode: string) => {
    set((state) => {
      const next = new Set(state.activeScancodes);
      next.add(scancode);
      return { activeScancodes: next };
    });
  },

  keyUp: (scancode: string) => {
    set((state) => {
      const next = new Set(state.activeScancodes);
      next.delete(scancode);
      return { activeScancodes: next };
    });
  },

  setColors: (scheme: Partial<FingerColorScheme>) => {
    set((state) => ({
      fingerColorScheme: { ...state.fingerColorScheme, ...scheme },
    }));
  },

  recordError: (scancode: string) => {
    set((state) => {
      const errors = { ...state.fingerErrors };
      errors[scancode] = (errors[scancode] ?? 0) + 1;
      return { fingerErrors: errors };
    });
  },

  getErrorCount: (scancode: string): number => {
    return get().fingerErrors[scancode] ?? 0;
  },

  resetErrors: () => {
    set({ fingerErrors: {} });
  },
}));
