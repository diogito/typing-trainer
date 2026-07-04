import { create } from 'zustand';
import type { SessionState, SessionMetrics, KeystrokeEvent } from '@/types';
import { SessionEngine } from '@/core/session/sessionEngine';


interface SessionSlice {
  state: SessionState;
  metrics: SessionMetrics | null;
  engine: SessionEngine | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  recordKeystroke: (event: KeystrokeEvent) => void;
  init: (layoutId: string) => void;
  loadFromStorage: (saved: SessionState) => void;
}

export const useSessionStore = create<SessionSlice>((set, get) => ({
  state: {
    id: '',
    layoutId: '',
    state: 'idle',
    startTime: null,
    pauseStart: undefined,
    pauseDuration: 0,
    keystrokes: [],
    metrics: null,
  },
  metrics: null,
  engine: null,

  init: (layoutId: string) => {
    const engine = new SessionEngine(layoutId);
    const state = engine.getState();
    set({ state, engine, metrics: null });
  },

  start: () => {
    const { engine } = get();
    if (!engine) return;
    const state = engine.start();
    set({ state });
  },

  pause: () => {
    const { engine } = get();
    if (!engine) return;
    const state = engine.pause();
    set({ state });
  },

  resume: () => {
    const { engine } = get();
    if (!engine) return;
    const state = engine.resume();
    set({ state });
  },

  stop: () => {
    const { engine } = get();
    if (!engine) return;
    const state = engine.stop();
    const metrics = engine.getMetrics();
    set({ state, metrics });
  },

  recordKeystroke: (event: KeystrokeEvent) => {
    const { engine } = get();
    if (!engine) return;
    const state = engine.recordKeystroke(event);
    set({ state });
  },

  loadFromStorage: (saved: SessionState) => {
    set({ state: saved, metrics: saved.metrics });
  },
}));
