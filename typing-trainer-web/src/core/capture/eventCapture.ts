import { useCallback, useRef, useEffect } from 'react';
import type { FingerMap, KeystrokeEvent } from '@/types';
import { getScancode, getKcCodeFromDomCode, KC_CODE_MAP } from '@/lib/kcCodeMap';
import { getExpectedFinger, detectError } from '@/core/keyboard/fingerDetection';

interface UseEventCaptureOptions {
  onKeystroke?: (event: KeystrokeEvent) => void;
  fingerMap: FingerMap;
  activeLayer: string;
  enabled: boolean;
  // NEW (both optional):
  targetText?: string;
  onValidation?: (index: number, correct: boolean, expected: string, actual: string) => void;
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
  targetText,
  onValidation,
}: UseEventCaptureOptions) {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const pressTimesRef = useRef<Map<string, number>>(new Map());
  const modifiersRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const targetCompletedRef = useRef(false);

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

      // Exercise validation: if targetText provided, validate against it
      if (targetText && !targetCompletedRef.current && currentIndexRef.current < targetText.length) {
        const pressedKey = event.key;
        const wasBackspace = domCode === 'Backspace';
        let actualChar = pressedKey;
        let correct = false;

        if (wasBackspace) {
          actualChar = '<backspace>';
          correct = false;
          if (currentIndexRef.current > 0) {
            currentIndexRef.current--;
          }
        } else {
          correct = pressedKey === targetText[currentIndexRef.current];
          currentIndexRef.current++;
        }

        if (currentIndexRef.current >= targetText.length) {
          targetCompletedRef.current = true;
        }

        // Expected char: for backspace it's the char we went back to; for normal keys it's the char we just typed
        const expectedChar = targetText[wasBackspace ? currentIndexRef.current : currentIndexRef.current - 1] || '';

        onValidation?.(currentIndexRef.current, correct, expectedChar, actualChar);
      }

      // Optimistic model: assume user uses the expected finger
      const actualFinger = expectedFinger;

      // Detect wrong-finger by comparing actual vs expected
      const error = detectError(
        {
          code: domCode,
          key: event.key,
          scancode: sc.code,
          timestamp: pressTime,
          finger: expectedFinger,
          actualFinger,
          isModifier: false,
          modifiers: [...modifiersRef.current],
          layer: activeLayer,
          error: undefined,
        } as KeystrokeEvent,
        expectedFinger,
      );

      const keystroke: KeystrokeEvent = {
        code: domCode,
        key: event.key,
        scancode: sc.code,
        timestamp: pressTime,
        finger: expectedFinger,
        actualFinger,
        isModifier: false,
        modifiers: [...modifiersRef.current],
        layer: activeLayer,
        error,
      };

      onKeystroke?.(keystroke);
      event.preventDefault();
    },
    [enabled, fingerMap, activeLayer, onKeystroke, targetText, onValidation],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const domCode = event.code;
      const kcCode = getKcCodeFromDomCode(domCode);

      const releaseTime = performance.now();
      pressTimesRef.current.set(kcCode, releaseTime);

      // Look up expected finger for key-up (optimistic model)
      const mapEntry = KC_CODE_MAP[kcCode];
      const keyScancode = mapEntry ? mapEntry.code : kcCode;
      const expectedFingerUp = keyScancode ? getExpectedFinger(keyScancode, fingerMap) : 'other';
      const actualFingerUp = expectedFingerUp;

      // Record hold duration
      const keystroke: KeystrokeEvent = {
        code: domCode,
        key: event.key,
        scancode: kcCode,
        timestamp: pressTimesRef.current.get(kcCode) ?? releaseTime,
        releaseTime,
        holdDuration: releaseTime - (pressTimesRef.current.get(kcCode) ?? releaseTime),
        finger: expectedFingerUp,
        actualFinger: actualFingerUp,
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
    currentIndexRef.current = 0;
    targetCompletedRef.current = false;
  }, []);

  return { reset };
}
