import { useCallback, useRef, useEffect } from 'react';
import type { FingerMap, KeystrokeEvent } from '@/types';
import { getScancode, getKcCodeFromDomCode, KC_CODE_MAP } from '@/lib/kcCodeMap';
import { getExpectedFinger } from '@/core/keyboard/fingerDetection';

interface UseEventCaptureOptions {
  onKeystroke?: (event: KeystrokeEvent) => void;
  fingerMap: FingerMap;
  activeLayer: string;
  enabled: boolean;
}

const MODIFIER_KEYS = new Set([
  'KC_LCTRL', 'KC_RCTRL', 'KC_LSHIFT', 'KC_RSHIFT',
  'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI',
]);

const PASS_THROUGH_KEYS = new Set(['Escape', 'Tab']);

/**
 * Hook to capture keyboard events for the training system.
 * Attaches keydown/keyup listeners on mount, removes on unmount.
 * Maps event.code → scancode, detects wrong-finger errors,
 * skips modifier-only keystrokes.
 */
export function useEventCapture({
  onKeystroke,
  fingerMap,
  activeLayer,
  enabled,
}: UseEventCaptureOptions) {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const pressTimesRef = useRef<Map<string, number>>(new Map());
  const modifiersRef = useRef<string[]>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const domCode = event.code;
      const kcCode = getKcCodeFromDomCode(domCode);

      // Track modifiers
      if (MODIFIER_KEYS.has(kcCode)) {
        if (!modifiersRef.current.includes(kcCode)) {
          modifiersRef.current.push(kcCode);
        }
        event.preventDefault();
        return;
      }

      // Allow Escape and Tab through
      if (PASS_THROUGH_KEYS.has(domCode)) {
        return;
      }

      const mapEntry = KC_CODE_MAP[kcCode];
      if (!mapEntry) return;

      const sc = getScancode(kcCode);
      if (!sc) return;

      const pressTime = performance.now();
      pressTimesRef.current.set(kcCode, pressTime);
      pressedKeysRef.current.add(kcCode);

      // Determine expected finger
      const expectedFinger = getExpectedFinger(kcCode, fingerMap);

      // Detect wrong finger (simplified — actual finger detection needs more context)
      let error: KeystrokeEvent['error'] | undefined;

      const keystroke: KeystrokeEvent = {
        code: domCode,
        key: event.key,
        scancode: sc.code,
        timestamp: pressTime,
        finger: expectedFinger,
        actualFinger: 'unknown',
        isModifier: false,
        modifiers: [...modifiersRef.current],
        layer: activeLayer,
        error,
      };

      onKeystroke?.(keystroke);
      event.preventDefault();
    },
    [enabled, fingerMap, activeLayer, onKeystroke],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const domCode = event.code;
      const kcCode = getKcCodeFromDomCode(domCode);

      const releaseTime = performance.now();
      pressTimesRef.current.set(kcCode, releaseTime);

      // Record hold duration
      const keystroke: KeystrokeEvent = {
        code: domCode,
        key: event.key,
        scancode: kcCode,
        timestamp: pressTimesRef.current.get(kcCode) ?? releaseTime,
        releaseTime,
        holdDuration: releaseTime - (pressTimesRef.current.get(kcCode) ?? releaseTime),
        finger: 'other',
        actualFinger: 'unknown',
        isModifier: false,
        modifiers: [],
        layer: activeLayer,
        direction: 'up',
      };

      onKeystroke?.(keystroke);

      pressedKeysRef.current.delete(kcCode);
      modifiersRef.current = modifiersRef.current.filter((m) => m !== kcCode);
    },
    [enabled, activeLayer, onKeystroke],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  // Return reset for starting a new session
  const reset = useCallback(() => {
    pressedKeysRef.current.clear();
    pressTimesRef.current.clear();
    modifiersRef.current = [];
  }, []);

  return { reset };
}
