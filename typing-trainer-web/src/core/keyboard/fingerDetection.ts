import type { FingerMap, Finger, KeystrokeEvent, ErrorType } from '@/types';

/**
 * Determine the expected finger for a scancode.
 */
export function getExpectedFinger(scancode: string, fingerMap: FingerMap): Finger {
  return fingerMap[scancode] ?? 'other';
}

/**
 * Detect if a keystroke has an error.
 * Compares actualFinger against expectedFinger and returns 'wrong-finger'
 * when they differ and actualFinger is known.
 */
export function detectError(event: KeystrokeEvent, expectedFinger: Finger): ErrorType | undefined {
  if (event.isModifier) return undefined;
  if (event.error) return event.error;

  if (event.actualFinger && event.actualFinger !== 'unknown') {
    if (!isCorrectFinger(event.actualFinger, expectedFinger)) {
      return 'wrong-finger';
    }
  }

  return undefined;
}

/**
 * Check if a finger is the expected finger for a scancode.
 */
export function isCorrectFinger(actualFinger: Finger | 'unknown', expectedFinger: Finger): boolean {
  if (actualFinger === 'unknown') return false;
  return actualFinger === expectedFinger;
}

/**
 * Get the hand side for a finger based on column.
 */
export function getHandForColumn(col: number): 'left' | 'right' {
  return col <= 4 ? 'left' : 'right';
}

/**
 * Map finger to hand.
 */
export function fingerToHand(_finger: Finger, col: number): 'left' | 'right' {
  if (col <= 4) return 'left';
  return 'right';
}
