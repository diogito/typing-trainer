import type { FingerMap, Finger, KeyboardLayout } from '@/types';

/**
 * Columnar finger map generator.
 * Each physical column maps to one fixed finger.
 * Fingers move ONLY vertically on their column.
 */

// Column-to-finger mapping for left and right halves
const COLUMN_FINGER_LEFT: Record<number, Finger> = {
  1: 'pinky',
  2: 'ring',
  3: 'middle',
  4: 'index',
};

const COLUMN_FINGER_RIGHT: Record<number, Finger> = {
  1: 'index',
  2: 'middle',
  3: 'ring',
  4: 'pinky',
};

/**
 * Generate a finger map from a keyboard layout using the columnar model.
 * Each key's column determines its finger assignment.
 */
export function generateFingerMap(layout: KeyboardLayout): FingerMap {
  const map: FingerMap = {};

  for (const key of layout.keys) {
    const col = key.position.col;
    const finger = getFingerForColumn(col);
    map[key.scancode] = finger;
  }

  return map;
}

/**
 * Get the finger for a given column number.
 */
function getFingerForColumn(col: number): Finger {
  if (col <= 4) {
    return COLUMN_FINGER_LEFT[col] ?? 'other';
  }
  if (col >= 5) {
    return COLUMN_FINGER_RIGHT[col - 4] ?? 'other';
  }
  return 'other';
}

/**
 * Get finger color for rendering.
 */
export function getFingerColor(finger: Finger): string {
  const colors: Record<Finger, string> = {
    pinky: '#ef4444',
    ring: '#f97316',
    middle: '#eab308',
    index: '#22c55e',
    thumb: '#3b82f6',
    other: '#6b7280',
  };
  return colors[finger] ?? colors.other;
}

/**
 * Map a finger to its hand side.
 */
export function fingerToHand(_finger: Finger, col: number): 'left' | 'right' {
  if (col <= 4) return 'left';
  return 'right';
}
