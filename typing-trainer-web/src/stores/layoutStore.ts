import { create } from 'zustand';
import type { KeyboardLayout } from '@/types';
import { layoutRegistry } from '@/core/keyboard/layoutRegistry';

interface LayoutSlice {
  layoutId: string;
  activeLayer: string;
  customLayouts: Record<string, KeyboardLayout>;
  setLayout: (id: string) => void;
  activateLayer: (name: string) => void;
  registerCustomLayout: (layout: KeyboardLayout) => void;
  deleteCustomLayout: (id: string) => void;
  getLayout: () => KeyboardLayout | null;
}

export const useLayoutStore = create<LayoutSlice>((set, get) => ({
  layoutId: 'qwerty-es',
  activeLayer: 'base',
  customLayouts: {},

  setLayout: (id: string) => {
    if (layoutRegistry.get(id)) {
      set({ layoutId: id });
    } else {
      // Check custom layouts
      const custom = get().customLayouts[id];
      if (custom) {
        set({ layoutId: id });
      }
    }
  },

  activateLayer: (name: string) => {
    set({ activeLayer: name });
  },

  registerCustomLayout: (layout: KeyboardLayout) => {
    set((state) => ({
      customLayouts: { ...state.customLayouts, [layout.id]: layout },
      layoutId: layout.id,
    }));
  },

  deleteCustomLayout: (id: string) => {
    set((state) => {
      const newLayouts = { ...state.customLayouts };
      delete newLayouts[id];
      return { customLayouts: newLayouts };
    });
  },

  getLayout: () => {
    const { layoutId, customLayouts } = get();
    return customLayouts[layoutId] ?? layoutRegistry.get(layoutId);
  },
}));
