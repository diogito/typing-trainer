import { describe, it, expect, beforeEach } from 'vitest';
import { useUISlice } from '../../stores/uiStore';
import { useSessionStore } from '../../stores/sessionStore';
import type { KeystrokeEvent } from '../../types';

describe('Integration: Mirror Mode', () => {
  beforeEach(() => {
    // Reset stores
    const { init } = useSessionStore.getState();
    init('qwerty-es');
    useUISlice.setState({
      mirrorMode: { enabled: false, progress: 0 },
    });
  });

  it('toggles mirror mode on/off', () => {
    const store = useUISlice.getState();
    expect(store.mirrorMode.enabled).toBe(false);

    store.toggleMirrorMode();
    expect(useUISlice.getState().mirrorMode.enabled).toBe(true);

    store.toggleMirrorMode();
    expect(useUISlice.getState().mirrorMode.enabled).toBe(false);
  });

  it('progress increments on correct keystrokes when mirror mode is enabled', () => {
    useUISlice.setState({ mirrorMode: { enabled: true, progress: 0 } });
    useUISlice.getState().incrementMirrorProgress();
    expect(useUISlice.getState().mirrorMode.progress).toBe(2);
    useUISlice.getState().incrementMirrorProgress();
    expect(useUISlice.getState().mirrorMode.progress).toBe(4);
  });

  it('progress does NOT increment when mirror mode is disabled', () => {
    useUISlice.getState().incrementMirrorProgress();
    expect(useUISlice.getState().mirrorMode.progress).toBe(0);
  });

  it('progress resets when starting a new session', () => {
    useUISlice.setState({ mirrorMode: { enabled: true, progress: 50 } });
    // Simulate session restart
    useUISlice.getState().resetMirrorMode();
    expect(useUISlice.getState().mirrorMode.progress).toBe(0);
    expect(useUISlice.getState().mirrorMode.enabled).toBe(true);
  });

  it('ghost mode class is applied when opacity < 0.2', () => {
    // At progress 85: opacity = 1.0 - (85/100) * 0.92 = 0.218 (not ghost)
    useUISlice.setState({ mirrorMode: { enabled: false, progress: 85 } });
    expect(useUISlice.getState().getMirrorOpacity()).toBeGreaterThan(0.2);

    // At progress 95: opacity = 1.0 - (95/100) * 0.92 = 0.126 (ghost!)
    useUISlice.setState({ mirrorMode: { enabled: false, progress: 95 } });
    expect(useUISlice.getState().getMirrorOpacity()).toBeLessThan(0.2);
  });

  it('50 correct keystrokes reaches 100% progress', () => {
    useUISlice.setState({ mirrorMode: { enabled: true, progress: 0 } });
    const store = useUISlice.getState();
    for (let i = 0; i < 50; i++) {
      store.incrementMirrorProgress();
    }
    expect(useUISlice.getState().mirrorMode.progress).toBe(100);
  });
});

describe('Integration: Mirror mode with session lifecycle', () => {
  beforeEach(() => {
    const { init } = useSessionStore.getState();
    init('qwerty-es');
    useUISlice.setState({
      mirrorMode: { enabled: false, progress: 0 },
    });
  });

  it('mirror mode state persists independently of session state', () => {
    const uiStore = useUISlice.getState();
    const sessionStore = useSessionStore.getState();

    useUISlice.setState({ mirrorMode: { enabled: true, progress: 20 } });
    const { start, stop, recordKeystroke } = sessionStore;
    start();

    // Record correct keystroke — session engine records it (no error field)
    recordKeystroke({
      code: 'KeyA', key: 'a', scancode: 'KC_A',
      timestamp: 0, finger: 'pinky', actualFinger: 'pinky',
      isModifier: false, modifiers: [], layer: 'base',
    } as KeystrokeEvent);

    // Session engine doesn't auto-increment mirror progress.
    // The UI layer (TrainingPage.handleKeystroke) is responsible for calling
    // incrementMirrorProgress when event.error is undefined.
    // Here we verify the store methods work independently of the session.
    expect(useSessionStore.getState().state.state).toBe('running');

    // Manually simulate the UI-layer increment that TrainingPage does
    uiStore.incrementMirrorProgress();
    expect(useUISlice.getState().mirrorMode.progress).toBe(22);

    stop();
    // Progress should still be 22 after session ends
    expect(useUISlice.getState().mirrorMode.progress).toBe(22);
  });

  it('layout change resets mirror mode progress', () => {
    useUISlice.setState({ mirrorMode: { enabled: true, progress: 30 } });
    // Simulate layout change (same as TrainingPage does)
    useUISlice.getState().resetMirrorMode();
    expect(useUISlice.getState().mirrorMode.progress).toBe(0);
    expect(useUISlice.getState().mirrorMode.enabled).toBe(true);
  });
});
