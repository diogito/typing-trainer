import { describe, it, expect, beforeEach } from 'vitest';
import { useKeyboardStore } from './keyboardStore';

function getStore() {
  // Reset store to clean state
  useKeyboardStore.getState().resetErrors();
  return useKeyboardStore;
}

describe('keyboardStore fingerErrors', () => {
  beforeEach(() => {
    useKeyboardStore.getState().resetErrors();
  });

  it('initializes fingerErrors as empty object', () => {
    const state = useKeyboardStore.getState();
    expect(state.fingerErrors).toEqual({});
  });

  it('increments error count on recordError', () => {
    const { recordError, getErrorCount } = useKeyboardStore.getState();
    recordError('KC_A');
    expect(getErrorCount('KC_A')).toBe(1);
    recordError('KC_A');
    expect(getErrorCount('KC_A')).toBe(2);
  });

  it('creates new entry on first recordError for unknown scancode', () => {
    const { recordError, getErrorCount } = useKeyboardStore.getState();
    recordError('KC_Z');
    expect(getErrorCount('KC_Z')).toBe(1);
  });

  it('tracks errors for multiple keys independently', () => {
    const { recordError, getErrorCount } = useKeyboardStore.getState();
    recordError('KC_A');
    recordError('KC_S');
    recordError('KC_A');
    expect(getErrorCount('KC_A')).toBe(2);
    expect(getErrorCount('KC_S')).toBe(1);
    expect(getErrorCount('KC_Z')).toBe(0);
  });

  it('returns 0 for non-existent scancode', () => {
    const { getErrorCount } = useKeyboardStore.getState();
    expect(getErrorCount('KC_NONEXIST')).toBe(0);
  });

  it('clears all errors on resetErrors', () => {
    const { recordError, resetErrors, getErrorCount } = useKeyboardStore.getState();
    recordError('KC_A');
    recordError('KC_S');
    resetErrors();
    expect(getErrorCount('KC_A')).toBe(0);
    expect(getErrorCount('KC_S')).toBe(0);
  });

  it('resetErrors clears to empty object', () => {
    const { recordError, resetErrors } = useKeyboardStore.getState();
    recordError('KC_A');
    resetErrors();
    expect(useKeyboardStore.getState().fingerErrors).toEqual({});
  });
});
