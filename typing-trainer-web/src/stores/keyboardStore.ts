import { create } from 'zustand';
import type { FingerColorScheme } from '@/types';
import { FINGER_COLORS } from '@/types';

interface KeyboardSlice {
  activeScancodes: Set<string>;
  fingerColorScheme: FingerColorScheme;
  keyboardWidth: number;
  keyboardHeight: number;
  keyDown: (scancode: string) => void;
  keyUp: (scancode: string) => void;
  setColors: (scheme: Partial<FingerColorScheme>) => void;
}

export const useKeyboardStore = create<KeyboardSlice>((set) => ({
  activeScancodes: new Set(),
  fingerColorScheme: { ...FINGER_COLORS },
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
}));
