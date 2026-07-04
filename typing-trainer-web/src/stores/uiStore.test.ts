import { describe, it, expect, beforeEach } from 'vitest';
import { useUISlice } from './uiStore';

// Helper to reset store between tests
function resetStore() {
  useUISlice.setState({
    mirrorMode: { enabled: false, progress: 0 },
  });
}

describe('mirrorMode', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('starts disabled with 0 progress', () => {
      const store = useUISlice.getState();
      expect(store.mirrorMode.enabled).toBe(false);
      expect(store.mirrorMode.progress).toBe(0);
    });
  });

  describe('toggleMirrorMode', () => {
    it('enables mirror mode', () => {
      const store = useUISlice.getState();
      store.toggleMirrorMode();
      // Re-read state after action
      expect(useUISlice.getState().mirrorMode.enabled).toBe(true);
      expect(useUISlice.getState().mirrorMode.progress).toBe(0);
    });

    it('disables mirror mode', () => {
      const store = useUISlice.getState();
      store.toggleMirrorMode(); // enable
      useUISlice.getState().incrementMirrorProgress(); // +2
      store.toggleMirrorMode(); // disable
      expect(useUISlice.getState().mirrorMode.enabled).toBe(false);
    });

    it('resets progress when re-enabling', () => {
      const store = useUISlice.getState();
      store.toggleMirrorMode(); // enable
      // Set progress directly via setState (not mutation)
      useUISlice.setState((s) => ({ mirrorMode: { ...s.mirrorMode, progress: 50 } }));
      store.toggleMirrorMode(); // disable
      store.toggleMirrorMode(); // re-enable — should reset progress
      expect(useUISlice.getState().mirrorMode.progress).toBe(0);
    });
  });

  describe('incrementMirrorProgress', () => {
    it('does nothing when disabled', () => {
      useUISlice.getState().incrementMirrorProgress();
      expect(useUISlice.getState().mirrorMode.progress).toBe(0);
    });

    it('increments progress by 2 when enabled', () => {
      useUISlice.setState({ mirrorMode: { enabled: true, progress: 0 } });
      useUISlice.getState().incrementMirrorProgress();
      expect(useUISlice.getState().mirrorMode.progress).toBe(2);
    });

    it('caps at 100', () => {
      useUISlice.setState({ mirrorMode: { enabled: true, progress: 99 } });
      useUISlice.getState().incrementMirrorProgress();
      expect(useUISlice.getState().mirrorMode.progress).toBe(100);
    });

    it('increments multiple times correctly', () => {
      useUISlice.setState({ mirrorMode: { enabled: true, progress: 0 } });
      const store = useUISlice.getState();
      store.incrementMirrorProgress();
      store.incrementMirrorProgress();
      store.incrementMirrorProgress();
      expect(useUISlice.getState().mirrorMode.progress).toBe(6);
    });

    it('does not decrease progress', () => {
      useUISlice.setState({ mirrorMode: { enabled: true, progress: 50 } });
      const store = useUISlice.getState();
      store.incrementMirrorProgress();
      expect(useUISlice.getState().mirrorMode.progress).toBe(52);
    });
  });

  describe('resetMirrorMode', () => {
    it('resets progress to 0', () => {
      useUISlice.setState({ mirrorMode: { enabled: true, progress: 50 } });
      useUISlice.getState().resetMirrorMode();
      expect(useUISlice.getState().mirrorMode.progress).toBe(0);
    });

    it('preserves enabled state', () => {
      useUISlice.setState({ mirrorMode: { enabled: true, progress: 50 } });
      useUISlice.getState().resetMirrorMode();
      expect(useUISlice.getState().mirrorMode.enabled).toBe(true);
    });
  });

  describe('getMirrorOpacity', () => {
    it('returns 1.0 at progress 0', () => {
      const store = useUISlice.getState();
      expect(store.getMirrorOpacity()).toBeCloseTo(1.0, 10);
    });

    it('returns 0.08 at progress 100', () => {
      useUISlice.setState({ mirrorMode: { enabled: false, progress: 100 } });
      expect(useUISlice.getState().getMirrorOpacity()).toBeCloseTo(0.08, 10);
    });

    it('returns 0.54 at progress 50 (midpoint)', () => {
      useUISlice.setState({ mirrorMode: { enabled: false, progress: 50 } });
      // opacity = 1.0 - (50/100) * (1.0 - 0.08) = 1.0 - 0.46 = 0.54
      expect(useUISlice.getState().getMirrorOpacity()).toBeCloseTo(0.54, 10);
    });

    it('linearly interpolates between 1.0 and 0.08', () => {
      useUISlice.setState({ mirrorMode: { enabled: false, progress: 25 } });
      // opacity = 1.0 - (25/100) * 0.92 = 1.0 - 0.23 = 0.77
      expect(useUISlice.getState().getMirrorOpacity()).toBeCloseTo(0.77, 10);
    });
  });
});
