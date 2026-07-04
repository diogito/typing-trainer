import type { Finger, KeystrokeEvent, ErrorCountByCategory, TimingMetrics } from '@/types';

/**
 * Initialize an empty ErrorCountByCategory.
 */
export function createErrorCount(): ErrorCountByCategory {
  return {
    byKey: {},
    byFinger: { pinky: 0, ring: 0, middle: 0, index: 0, thumb: 0, other: 0 },
    byHand: { left: 0, right: 0 },
    byLayer: {},
    byDirection: { down: 0, up: 0 },
  };
}

/**
 * Initialize empty TimingMetrics.
 */
export function createTimingMetrics(): TimingMetrics {
  return {
    avgHoldTime: 0,
    avgInterKeystrokeGap: 0,
    holdTimeP50: 0,
    holdTimeP95: 0,
    interKeystrokeGapP50: 0,
  };
}

/**
 * Record a single error in the count.
 */
export function recordError(
  count: ErrorCountByCategory,
  scancode: string,
  finger: Finger,
  col: number,
  layer: string,
  direction: 'down' | 'up' | undefined,
): void {
  const hand = col <= 4 ? 'left' : 'right';

  // By key
  count.byKey[scancode] = (count.byKey[scancode] || 0) + 1;

  // By finger
  count.byFinger[finger] = (count.byFinger[finger] || 0) + 1;

  // By hand
  count.byHand[hand] = (count.byHand[hand] || 0) + 1;

  // By layer
  count.byLayer[layer] = (count.byLayer[layer] || 0) + 1;

  // By direction
  if (direction === 'down') {
    count.byDirection.down = (count.byDirection.down || 0) + 1;
  } else if (direction === 'up') {
    count.byDirection.up = (count.byDirection.up || 0) + 1;
  }
}

/**
 * Compute timing metrics from an array of keystrokes.
 */
export function computeTimingMetrics(keystrokes: KeystrokeEvent[]): TimingMetrics {
  if (keystrokes.length === 0) {
    return createTimingMetrics();
  }

  const holdDurations = keystrokes
    .map((k) => k.holdDuration)
    .filter((d): d is number => d !== undefined && d > 0);

  const gaps: number[] = [];
  for (let i = 1; i < keystrokes.length; i++) {
    const gap = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
    gaps.push(gap);
  }

  return {
    avgHoldTime: holdDurations.length > 0 ? avg(holdDurations) : 0,
    avgInterKeystrokeGap: gaps.length > 0 ? avg(gaps) : 0,
    holdTimeP50: holdDurations.length > 0 ? percentile(holdDurations, 50) : 0,
    holdTimeP95: holdDurations.length > 0 ? percentile(holdDurations, 95) : 0,
    interKeystrokeGapP50: gaps.length > 0 ? percentile(gaps, 50) : 0,
  };
}

/**
 * Compute session accuracy: (total - errors) / total * 100.
 */
export function computeAccuracy(total: number, errors: number): number {
  if (total === 0) return 100;
  return Math.round(((total - errors) / total) * 10000) / 100;
}

/**
 * Compute session precision: (total - wrongFinger) / total * 100.
 */
export function computePrecision(total: number, wrongFinger: number): number {
  if (total === 0) return 100;
  return Math.round(((total - wrongFinger) / total) * 10000) / 100;
}

/**
 * Compute WPM: 5 characters = 1 word.
 */
export function computeWPM(totalKeystrokes: number, durationSeconds: number): number {
  if (durationSeconds === 0) return 0;
  const words = totalKeystrokes / 5;
  const minutes = durationSeconds / 60;
  return Math.round((words / minutes) * 10) / 10;
}

/**
 * Aggregate metrics across multiple sessions for cumulative stats.
 */
export function aggregateSessionsMetrics(
  sessions: { wpm: number; accuracy: number }[],
): { avgWpm: number; avgAccuracy: number; bestWpm: number } {
  if (sessions.length === 0) {
    return { avgWpm: 0, avgAccuracy: 0, bestWpm: 0 };
  }
  const totalWpm = sessions.reduce((s, sess) => s + sess.wpm, 0);
  const totalAccuracy = sessions.reduce((s, sess) => s + sess.accuracy, 0);
  const bestWpm = Math.max(...sessions.map((s) => s.wpm));
  return {
    avgWpm: Math.round((totalWpm / sessions.length) * 10) / 10,
    avgAccuracy: Math.round((totalAccuracy / sessions.length) * 100) / 100,
    bestWpm,
  };
}

// Helpers
function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
