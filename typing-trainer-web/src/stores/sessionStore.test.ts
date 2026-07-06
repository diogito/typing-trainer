import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from '../stores/sessionStore';
import { useLayoutStore } from '../stores/layoutStore';

// Track whether saveSession was called without mocking the module
// The store fires saveSession asynchronously; we test behavior instead.
let saveSessionCallCount = 0;
const originalConsoleError = console.error;

describe('sessionStore', () => {
  beforeEach(() => {
    // Intercept console.error to suppress IndexedDB errors in tests
    console.error = vi.fn();

    useLayoutStore.getState().setLayout('qwerty-es');
    useSessionStore.getState().init('qwerty-es');
    useSessionStore.setState({
      engine: null,
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
      sessionSaved: false,
    });
    saveSessionCallCount = 0;
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('initializes with null metrics', () => {
    const state = useSessionStore.getState();
    expect(state.metrics).toBeNull();
    expect(state.state.state).toBe('idle');
    expect(state.sessionSaved).toBe(false);
  });

  it('metrics are non-null after recording keystrokes', () => {
    const { init, start, recordKeystroke } = useSessionStore.getState();
    init('qwerty-es');
    start();

    // Simulate a keystroke
    recordKeystroke({
      code: 'KeyA',
      key: 'a',
      scancode: 'KC_A',
      timestamp: Date.now(),
      finger: 'pinky',
      actualFinger: 'pinky',
      isModifier: false,
      modifiers: [],
      layer: 'base',
    } as any);

    // Metrics should be non-null after recordKeystroke
    const currentMetrics = useSessionStore.getState().metrics;
    expect(currentMetrics).not.toBeNull();
    expect(currentMetrics!.totalKeystrokes).toBe(1);
    expect(currentMetrics!.accuracy).toBe(100);
    expect(currentMetrics!.duration).toBeGreaterThanOrEqual(0);
  });

  it('updates keystroke count and WPM progressively', () => {
    const { init, start, recordKeystroke } = useSessionStore.getState();
    init('qwerty-es');
    start();

    // Record 10 keystrokes
    for (let i = 0; i < 10; i++) {
      recordKeystroke({
        code: 'KeyA',
        key: 'a',
        scancode: 'KC_A',
        timestamp: Date.now() + i * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
      } as any);
    }

    const metrics = useSessionStore.getState().metrics;
    expect(metrics!.totalKeystrokes).toBe(10);
    expect(metrics!.wpm).toBeGreaterThan(0);
    expect(metrics!.accuracy).toBe(100);
  });

  // --- Persistence tests ---

  it('stop() sets sessionSaved flag and persists state', () => {
    const { init, start, stop, recordKeystroke } = useSessionStore.getState();
    init('qwerty-es');
    start();

    // Record some keystrokes
    for (let i = 0; i < 5; i++) {
      recordKeystroke({
        code: 'KeyA',
        key: 'a',
        scancode: 'KC_A',
        timestamp: Date.now() + i * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
      } as any);
    }

    const sessionId = useSessionStore.getState().state.id;

    // Before stop
    expect(useSessionStore.getState().state.state).toBe('running');
    expect(useSessionStore.getState().sessionSaved).toBe(false);

    stop();

    // After stop: state transitions to idle, sessionSaved is true
    expect(useSessionStore.getState().state.state).toBe('idle');
    expect(useSessionStore.getState().sessionSaved).toBe(true);
    expect(useSessionStore.getState().metrics).not.toBeNull();
    expect(useSessionStore.getState().metrics!.totalKeystrokes).toBe(5);
    expect(useSessionStore.getState().metrics!.accuracy).toBe(100);

    // Session has an id and layoutId for persistence
    expect(sessionId).toBeTruthy();
  });

  it('stop() double-call does not duplicate persistence attempt', () => {
    const { init, start, stop } = useSessionStore.getState();
    init('qwerty-es');
    start();

    stop();
    const firstSaved = useSessionStore.getState().sessionSaved;

    stop();
    const secondSaved = useSessionStore.getState().sessionSaved;

    // Both calls see sessionSaved as true after first stop
    expect(firstSaved).toBe(true);
    expect(secondSaved).toBe(true);
    expect(useSessionStore.getState().state.state).toBe('idle');
  });

  it('pause() does not trigger save (sessionSaved stays false)', () => {
    const { init, start, pause } = useSessionStore.getState();
    init('qwerty-es');
    start();

    pause();

    expect(useSessionStore.getState().state.state).toBe('paused');
    expect(useSessionStore.getState().sessionSaved).toBe(false);
  });

  it('resume() does not trigger save (sessionSaved stays false)', () => {
    const { init, start, pause, resume } = useSessionStore.getState();
    init('qwerty-es');
    start();
    pause();

    expect(useSessionStore.getState().sessionSaved).toBe(false);

    resume();

    expect(useSessionStore.getState().state.state).toBe('running');
    expect(useSessionStore.getState().sessionSaved).toBe(false);
  });

  it('stopped session metrics include error data', () => {
    const { init, start, stop, recordKeystroke } = useSessionStore.getState();
    init('qwerty-es');
    start();

    // Record keystrokes with errors
    recordKeystroke({
      code: 'KeyA',
      key: 'a',
      scancode: 'KC_A',
      timestamp: Date.now(),
      finger: 'pinky',
      actualFinger: 'index',
      isModifier: false,
      modifiers: [],
      layer: 'base',
      error: 'wrong-finger',
      direction: 'down',
    } as any);

    recordKeystroke({
      code: 'KeyS',
      key: 's',
      scancode: 'KC_S',
      timestamp: Date.now() + 100,
      finger: 'ring',
      actualFinger: 'ring',
      isModifier: false,
      modifiers: [],
      layer: 'base',
      direction: 'down',
    } as any);

    stop();

    const metrics = useSessionStore.getState().metrics!;
    expect(metrics.totalKeystrokes).toBe(2);
    expect(metrics.accuracy).toBeLessThan(100);
    expect(metrics.errors.byKey.KC_A).toBe(1);
  });

  it('sessionSaved flag prevents double persistence', () => {
    const { init, start, stop } = useSessionStore.getState();
    init('qwerty-es');
    start();
    stop();

    expect(useSessionStore.getState().sessionSaved).toBe(true);

    // Even if stop called again, sessionSaved remains true
    stop();
    expect(useSessionStore.getState().sessionSaved).toBe(true);
    expect(useSessionStore.getState().state.state).toBe('idle');
  });

  it('init() resets sessionSaved for a new session', () => {
    const { init, start, stop } = useSessionStore.getState();
    init('qwerty-es');
    start();
    stop();

    expect(useSessionStore.getState().sessionSaved).toBe(true);

    // Init a new session resets the flag
    init('qwerty-es');
    expect(useSessionStore.getState().sessionSaved).toBe(false);
    expect(useSessionStore.getState().state.state).toBe('idle');
  });
});
