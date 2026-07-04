import { describe, it, expect } from 'vitest';
import { FINGER_COLORS, type Finger, type Hand } from './index';

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
});
