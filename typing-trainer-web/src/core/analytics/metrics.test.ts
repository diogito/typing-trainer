import { describe, it, expect } from 'vitest';
import {
  computeAccuracy,
  computePrecision,
  computeWPM,
  aggregateSessionsMetrics,
  createErrorCount,
  computeTimingMetrics,
} from './metrics';
import type { KeystrokeEvent } from '@/types';

describe('computeAccuracy', () => {
  it('returns 95% for 100 keystrokes with 5 errors', () => {
    expect(computeAccuracy(100, 5)).toBe(95);
  });

  it('returns 100% when there are no errors', () => {
    expect(computeAccuracy(50, 0)).toBe(100);
  });

  it('returns 100% with zero keystrokes (edge case)', () => {
    expect(computeAccuracy(0, 0)).toBe(100);
  });

  it('returns 0% for all errors', () => {
    expect(computeAccuracy(10, 10)).toBe(0);
  });
});

describe('computePrecision', () => {
  it('returns 97% for 100 keystrokes with 3 wrong-finger', () => {
    expect(computePrecision(100, 3)).toBe(97);
  });

  it('returns 100% when there are no wrong fingers', () => {
    expect(computePrecision(50, 0)).toBe(100);
  });

  it('returns 100% with zero keystrokes', () => {
    expect(computePrecision(0, 0)).toBe(100);
  });
});

describe('computeWPM', () => {
  it('computes correct WPM: 300 keystrokes in 60s = 60 WPM (300/5 words = 60 words)', () => {
    expect(computeWPM(300, 60)).toBe(60);
  });

  it('computes correct WPM: 50 keystrokes in 60s = 10 WPM', () => {
    expect(computeWPM(50, 60)).toBe(10);
  });

  it('returns 0 for zero duration', () => {
    expect(computeWPM(100, 0)).toBe(0);
  });
});

describe('aggregateSessionsMetrics', () => {
  it('aggregates correctly: [30, 35, 40] → avgWpm=35', () => {
    const result = aggregateSessionsMetrics([
      { wpm: 30, accuracy: 95 },
      { wpm: 35, accuracy: 96 },
      { wpm: 40, accuracy: 97 },
    ]);
    expect(result.avgWpm).toBe(35);
    expect(result.bestWpm).toBe(40);
    expect(result.avgAccuracy).toBe(96);
  });

  it('returns zeros for empty array', () => {
    const result = aggregateSessionsMetrics([]);
    expect(result.avgWpm).toBe(0);
    expect(result.avgAccuracy).toBe(0);
    expect(result.bestWpm).toBe(0);
  });
});

describe('createErrorCount', () => {
  it('returns correct initial state', () => {
    const err = createErrorCount();
    expect(err.byKey).toEqual({});
    expect(err.byFinger).toEqual({ pinky: 0, ring: 0, middle: 0, index: 0, thumb: 0, other: 0 });
    expect(err.byHand).toEqual({ left: 0, right: 0 });
  });
});

describe('computeTimingMetrics', () => {
  it('returns zeros for empty array', () => {
    const result = computeTimingMetrics([]);
    expect(result.avgHoldTime).toBe(0);
    expect(result.avgInterKeystrokeGap).toBe(0);
  });

  it('computes correct avg from hold durations', () => {
    const keystrokes = [
      { timestamp: 0, holdDuration: 100 } as KeystrokeEvent,
      { timestamp: 100, holdDuration: 200 } as KeystrokeEvent,
      { timestamp: 200, holdDuration: 300 } as KeystrokeEvent,
    ];
    const result = computeTimingMetrics(keystrokes);
    expect(result.avgHoldTime).toBe(200);
  });

  it('computes correct percentile from gaps', () => {
    const keystrokes = [
      { timestamp: 0 } as KeystrokeEvent,
      { timestamp: 10 } as KeystrokeEvent,
      { timestamp: 30 } as KeystrokeEvent,
      { timestamp: 60 } as KeystrokeEvent,
    ];
    // gaps: 10, 20, 30
    const result = computeTimingMetrics(keystrokes);
    expect(result.interKeystrokeGapP50).toBe(20);
  });
});
