import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from '../stores/sessionStore';
import { useLayoutStore } from '../stores/layoutStore';

describe('sessionStore', () => {
  beforeEach(() => {
    // Reset stores to clean state
    const layout = {
      id: 'qwerty-es',
      name: 'QWERTY (ES)',
      rows: [] as any[],
      keys: [] as any[],
      layers: {} as any,
      fingerMap: {} as any,
    };
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
    });
  });

  it('initializes with null metrics', () => {
    const state = useSessionStore.getState();
    expect(state.metrics).toBeNull();
    expect(state.state.state).toBe('idle');
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
});
