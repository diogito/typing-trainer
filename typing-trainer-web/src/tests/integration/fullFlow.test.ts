import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../../stores/sessionStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { FINGER_COLORS, type KeystrokeEvent } from '../../types';

describe('Integration: Full session flow', () => {
  beforeEach(() => {
    // Reset stores
    const { init } = useSessionStore.getState();
    init('qwerty-es');
    useKeyboardStore.setState({ activeScancodes: new Set() });
  });

  it('completes a full session: init → start → record keystrokes → stop → verify metrics', () => {
    const { start, stop, recordKeystroke, metrics, state } = useSessionStore.getState();

    start();
    expect(state.state).toBe('running');

    // Record some keystrokes
    const keystrokes: Omit<KeystrokeEvent, 'error'>[] = [
      {
        code: 'KeyA', key: 'a', scancode: 'KC_A', timestamp: 0,
        finger: 'pinky', actualFinger: 'pinky',
        isModifier: false, modifiers: [], layer: 'base',
      },
      {
        code: 'KeyS', key: 's', scancode: 'KC_S', timestamp: 100,
        finger: 'ring', actualFinger: 'ring',
        isModifier: false, modifiers: [], layer: 'base',
      },
      {
        code: 'KeyD', key: 'd', scancode: 'KC_D', timestamp: 200,
        finger: 'middle', actualFinger: 'middle',
        isModifier: false, modifiers: [], layer: 'base',
      },
    ];

    for (const ks of keystrokes) {
      recordKeystroke(ks as KeystrokeEvent);
    }

    stop();

    const finalMetrics = useSessionStore.getState().metrics;
    expect(finalMetrics).not.toBeNull();
    expect(finalMetrics!.totalKeystrokes).toBe(3);
    expect(finalMetrics!.accuracy).toBe(100);
    expect(finalMetrics!.duration).toBeGreaterThanOrEqual(0);
  });

  it('computes accuracy with errors', () => {
    const { start, stop, recordKeystroke } = useSessionStore.getState();
    start();

    // 4 correct + 1 error = 80% accuracy
    const correctKeys = ['A', 'S', 'D', 'F'];
    for (const key of correctKeys) {
      recordKeystroke({
        code: `Key${key}`, key: key.toLowerCase(), scancode: `KC_${key}`,
        timestamp: 0, finger: 'index', actualFinger: 'index',
        isModifier: false, modifiers: [], layer: 'base',
      } as KeystrokeEvent);
    }

    recordKeystroke({
      code: 'KeyX', key: 'x', scancode: 'KC_X', timestamp: 400,
      finger: 'pinky', actualFinger: 'pinky',
      isModifier: false, modifiers: [], layer: 'base',
      error: 'wrong-key',
    } as KeystrokeEvent);

    stop();
    const metrics = useSessionStore.getState().metrics;
    expect(metrics!.accuracy).toBe(80);
    expect(metrics!.totalKeystrokes).toBe(5);
  });

  it('session starts idle, transitions through states correctly', () => {
    const { init, start, pause, resume, stop, state: idleState } = useSessionStore.getState();
    init('qwerty-es');

    expect(idleState.state).toBe('idle');

    start();
    expect(useSessionStore.getState().state.state).toBe('running');

    pause();
    expect(useSessionStore.getState().state.state).toBe('paused');

    resume();
    expect(useSessionStore.getState().state.state).toBe('running');

    stop();
    expect(useSessionStore.getState().state.state).toBe('idle');
  });
});

describe('Integration: Keyboard interaction', () => {
  it('keyDown adds scancode to active set, keyUp removes it', () => {
    const { keyDown, keyUp } = useKeyboardStore.getState();

    expect(useKeyboardStore.getState().activeScancodes.has('KC_A')).toBe(false);

    keyDown('KC_A');
    expect(useKeyboardStore.getState().activeScancodes.has('KC_A')).toBe(true);

    keyUp('KC_A');
    expect(useKeyboardStore.getState().activeScancodes.has('KC_A')).toBe(false);
  });

  it('handles multiple simultaneous keys', () => {
    const { keyDown, keyUp } = useKeyboardStore.getState();

    keyDown('KC_A');
    keyDown('KC_S');
    keyDown('KC_D');

    const state = useKeyboardStore.getState();
    expect(state.activeScancodes.has('KC_A')).toBe(true);
    expect(state.activeScancodes.has('KC_S')).toBe(true);
    expect(state.activeScancodes.has('KC_D')).toBe(true);

    keyUp('KC_S');
    const state2 = useKeyboardStore.getState();
    expect(state2.activeScancodes.has('KC_S')).toBe(false);
    expect(state2.activeScancodes.has('KC_A')).toBe(true);
    expect(state2.activeScancodes.has('KC_D')).toBe(true);
  });
});

describe('Integration: Layout switching', () => {
  it('switches between built-in layouts', () => {
    const { setLayout, getLayout, layoutId } = useLayoutStore.getState();

    expect(layoutId).toBe('qwerty-es');

    setLayout('colemak');
    const colemak = getLayout();
    expect(colemak?.id).toBe('colemak');

    setLayout('dvorak');
    const dvorak = getLayout();
    expect(dvorak?.id).toBe('dvorak');

    setLayout('qwerty-es');
  });

  it('layer switching works', () => {
    const { activateLayer } = useLayoutStore.getState();
    expect(useLayoutStore.getState().activeLayer).toBe('base');

    activateLayer('numbers');
    expect(useLayoutStore.getState().activeLayer).toBe('numbers');
  });
});

describe('Integration: Finger colors', () => {
  it('returns correct color for each finger', () => {
    expect(FINGER_COLORS.pinky).toBe('#ef4444');
    expect(FINGER_COLORS.ring).toBe('#f97316');
    expect(FINGER_COLORS.middle).toBe('#eab308');
    expect(FINGER_COLORS.index).toBe('#22c55e');
    expect(FINGER_COLORS.thumb).toBe('#3b82f6');
    expect(FINGER_COLORS.other).toBe('#6b7280');
  });
});
