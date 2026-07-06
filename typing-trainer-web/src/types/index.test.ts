import { describe, it, expect } from 'vitest';
import { FINGER_COLORS, type Finger, type Hand, type ErrorType, type PersistedSession } from './index';

describe('FINGER_COLORS', () => {
  it('defines colors for all fingers', () => {
    expect(FINGER_COLORS.pinky).toBe('#ef4444');
    expect(FINGER_COLORS.ring).toBe('#f97316');
    expect(FINGER_COLORS.middle).toBe('#eab308');
    expect(FINGER_COLORS.index).toBe('#22c55e');
    expect(FINGER_COLORS.thumb).toBe('#3b82f6');
    expect(FINGER_COLORS.other).toBe('#6b7280');
  });

  it('all values are valid hex colors', () => {
    const hex = /^#[0-9a-f]{6}$/i;
    for (const [, color] of Object.entries(FINGER_COLORS)) {
      expect(hex.test(color)).toBe(true);
    }
  });
});

describe('Type exports', () => {
  it('Finger is a valid type', () => {
    const finger: Finger = 'pinky';
    expect(finger).toBe('pinky');
  });

  it('Hand is a valid type', () => {
    const hand: Hand = 'left';
    expect(hand).toBe('left');
  });

  it('ErrorType includes all variants', () => {
    const err: ErrorType = 'wrong-finger';
    expect(err).toBe('wrong-finger');

    const errZone: ErrorType = 'wrong-finger-zone';
    expect(errZone).toBe('wrong-finger-zone');

    const errKey: ErrorType = 'wrong-key';
    expect(errKey).toBe('wrong-key');

    const errMissed: ErrorType = 'missed';
    expect(errMissed).toBe('missed');

    const errDouble: ErrorType = 'double';
    expect(errDouble).toBe('double');
  });

  it('PersistedSession has optional exerciseId and exerciseAccuracy', () => {
    const session: PersistedSession = {
      id: 'test-1',
      layoutId: 'qwerty-es',
      startTime: Date.now(),
      duration: 60,
      totalKeystrokes: 100,
      wpm: 30,
      accuracy: 95,
      precision: 92,
      errors: { byKey: {}, byFinger: {}, byHand: {}, byLayer: {}, byDirection: {} },
      exerciseId: 'home-row-1',
      exerciseAccuracy: 90,
      createdAt: Date.now(),
    };
    expect(session.exerciseId).toBe('home-row-1');
    expect(session.exerciseAccuracy).toBe(90);
  });

  it('PersistedSession fields are optional', () => {
    const session: PersistedSession = {
      id: 'test-2',
      layoutId: 'qwerty-es',
      startTime: Date.now(),
      duration: 60,
      totalKeystrokes: 100,
      wpm: 30,
      accuracy: 95,
      precision: 92,
      errors: { byKey: {}, byFinger: {}, byHand: {}, byLayer: {}, byDirection: {} },
      createdAt: Date.now(),
    };
    // exerciseId and exerciseAccuracy are optional — absence is valid
    expect(session.exerciseId).toBeUndefined();
    expect(session.exerciseAccuracy).toBeUndefined();
  });
});
