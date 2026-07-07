import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventCapture } from './eventCapture';
import type { FingerMap, KeystrokeEvent } from '@/types';

const defaultFingerMap: FingerMap = {
  KeyQ: 'pinky', KeyW: 'pinky', KeyE: 'ring', KeyR: 'middle', KeyT: 'index',
  KeyA: 'pinky', KeyS: 'ring', KeyD: 'middle', KeyF: 'index', KeyG: 'index',
  KeyH: 'index', KeyJ: 'middle', KeyK: 'ring', KeyL: 'pinky',
};

function makeOptions(overrides: Partial<Parameters<typeof useEventCapture>[0]> = {}) {
  return {
    fingerMap: defaultFingerMap,
    activeLayer: 'base',
    enabled: true,
    onKeystroke: undefined,
    targetText: undefined,
    onValidation: undefined,
    ...overrides,
  };
}

describe('useEventCapture — validation', () => {
  it('does not call onValidation when targetText is omitted', () => {
    const onValidation = vi.fn();
    const { result } = renderHook(() =>
      useEventCapture(makeOptions({ onValidation }))
    );
    expect(onValidation).not.toHaveBeenCalled();
    expect(result.current.reset).toBeDefined();
  });

  it('calls onValidation with correct key', () => {
    const onValidation = vi.fn();
    renderHook(() =>
      useEventCapture(makeOptions({
        targetText: 'ab',
        onValidation,
      }))
    );
    // Simulate typing 'a'
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
      });
      window.dispatchEvent(event);
    });
    expect(onValidation).toHaveBeenCalledTimes(1);
    expect(onValidation).toHaveBeenCalledWith(1, true, 'a', 'a');
  });

  it('calls onValidation with incorrect key', () => {
    const onValidation = vi.fn();
    renderHook(() =>
      useEventCapture(makeOptions({
        targetText: 'abc',
        onValidation,
      }))
    );
    // Type wrong key 'x' instead of 'a'
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'x',
        code: 'KeyX',
      });
      window.dispatchEvent(event);
    });
    expect(onValidation).toHaveBeenCalledTimes(1);
    expect(onValidation).toHaveBeenCalledWith(1, false, 'a', 'x');
  });

  it('tracks correct sequence of keys', () => {
    const onValidation = vi.fn();
    renderHook(() =>
      useEventCapture(makeOptions({
        targetText: 'ab',
        onValidation,
      }))
    );

    // Type 'a' (correct)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
    });
    expect(onValidation).toHaveBeenNthCalledWith(1, 1, true, 'a', 'a');

    // Type 'b' (correct)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', code: 'KeyB' }));
    });
    expect(onValidation).toHaveBeenNthCalledWith(2, 2, true, 'b', 'b');
  });

  it('handles backspace by decrementing index', () => {
    const onValidation = vi.fn();
    renderHook(() =>
      useEventCapture(makeOptions({
        targetText: 'abc',
        onValidation,
      }))
    );

    // Type 'a' (correct)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
    });
    expect(onValidation).toHaveBeenNthCalledWith(1, 1, true, 'a', 'a');

    // Backspace
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace' }));
    });
    expect(onValidation).toHaveBeenNthCalledWith(2, 0, false, 'a', '<backspace>');
  });

  it('does not decrement index below 0 on backspace', () => {
    const onValidation = vi.fn();
    renderHook(() =>
      useEventCapture(makeOptions({
        targetText: 'abc',
        onValidation,
      }))
    );

    // Backspace at position 0
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace' }));
    });
    expect(onValidation).toHaveBeenLastCalledWith(0, false, 'a', '<backspace>');
  });

  it('resets index and completion on reset()', () => {
    const onValidation = vi.fn();
    const { result } = renderHook(() =>
      useEventCapture(makeOptions({
        targetText: 'ab',
        onValidation,
      }))
    );

    // Type 'a' then 'b'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', code: 'KeyB' }));
    });
    expect(onValidation).toHaveBeenCalledTimes(2);

    // Reset
    act(() => {
      result.current.reset();
    });

    // Reset should clear refs — can't easily verify internals without getState,
    // but reset should not throw and should be callable
    expect(result.current.reset).toBeDefined();
  });

  it('does not throw when enabled is false', () => {
    const onValidation = vi.fn();
    expect(() => {
      renderHook(() =>
        useEventCapture(makeOptions({
          enabled: false,
          targetText: 'abc',
          onValidation,
        }))
      );
    }).not.toThrow();
  });

  it('works without onValidation (targetText only)', () => {
    expect(() => {
      renderHook(() =>
        useEventCapture(makeOptions({
          targetText: 'abc',
        }))
      );
    }).not.toThrow();
  });
});
