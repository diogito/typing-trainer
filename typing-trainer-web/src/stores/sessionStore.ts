import { create } from 'zustand';
import type {
  SessionState,
  SessionMetrics,
  KeystrokeEvent,
  PersistedSession,
} from '@/types';
import { SessionEngine } from '@/core/session/sessionEngine';
import { useKeyboardStore } from './keyboardStore';
import { useLayoutStore } from './layoutStore';
import { storageService } from '@/services/storage';

interface SessionSlice {
  state: SessionState;
  metrics: SessionMetrics | null;
  engine: SessionEngine | null;
  sessionSaved: boolean;
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
  sessionSaved: false,

  init: (layoutId: string) => {
    const layout = useLayoutStore.getState().getLayout();
    const keyColumns = layout
      ? Object.fromEntries(layout.keys.map((k): [string, number] => [k.scancode, k.position.col]))
      : {};
    const engine = new SessionEngine(layoutId, keyColumns);
    const state = engine.getState();
    useKeyboardStore.getState().resetErrors();
    set({ state, engine, metrics: null, sessionSaved: false });
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

    // Guard against double-save
    if (get().sessionSaved) return;

    const state = engine.stop();
    const metrics = engine.getMetrics();

    // Build and persist session record
    if (metrics && state.startTime) {
      const persistedSession: PersistedSession = {
        id: state.id,
        layoutId: state.layoutId,
        startTime: state.startTime,
        endTime: Date.now(),
        duration: metrics.duration,
        totalKeystrokes: metrics.totalKeystrokes,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        precision: metrics.precision,
        errors: metrics.errors,
        createdAt: state.startTime,
      };

      set({ state, metrics, sessionSaved: true });

      // Persist asynchronously — don't await
      storageService.saveSession(persistedSession).catch((err) => {
        console.error('[sessionStore] Failed to persist session:', err);
      });
    } else {
      set({ state, metrics, sessionSaved: true });
    }
  },

  recordKeystroke: (event: KeystrokeEvent) => {
    const { engine } = get();
    if (!engine) return;
    const state = engine.recordKeystroke(event);
    const liveMetrics = engine.computeLiveMetrics(Date.now()) as SessionMetrics;
    set({ state, metrics: liveMetrics });
  },

  loadFromStorage: (saved: SessionState) => {
    set({ state: saved, metrics: saved.metrics });
  },
}));
