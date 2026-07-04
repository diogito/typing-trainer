import { describe, it, expect } from 'vitest';
import { detectError, isCorrectFinger } from './fingerDetection';
import type { KeystrokeEvent } from '@/types';

function makeEvent(overrides: Partial<KeystrokeEvent> = {}): KeystrokeEvent {
  return {
    code: 'KeyA',
    key: 'a',
    scancode: 'KC_A',
    timestamp: 0,
    finger: 'pinky',
    actualFinger: 'unknown',
    isModifier: false,
    modifiers: [],
    layer: 'base',
    ...overrides,
  };
}

describe('detectError', () => {
  it('returns undefined for modifier keys', () => {
    const event = makeEvent({ isModifier: true });
    expect(detectError(event, 'index')).toBeUndefined();
  });

  it('returns existing error from event', () => {
    const event = makeEvent({ error: 'wrong-key' });
    expect(detectError(event, 'index')).toBe('wrong-key');
  });

  it('returns undefined when actualFinger matches expectedFinger', () => {
    const event = makeEvent({ actualFinger: 'index' });
    expect(detectError(event, 'index')).toBeUndefined();
  });

  it('returns wrong-finger when actualFinger differs from expectedFinger', () => {
    const event = makeEvent({ actualFinger: 'pinky' });
    expect(detectError(event, 'ring')).toBe('wrong-finger');
  });

  it('returns undefined when actualFinger is unknown', () => {
    const event = makeEvent({ actualFinger: 'unknown' });
    expect(detectError(event, 'index')).toBeUndefined();
  });

  it('returns undefined when actualFinger is not set (undefined)', () => {
    const event = makeEvent({ actualFinger: undefined });
    expect(detectError(event, 'index')).toBeUndefined();
  });
});

describe('isCorrectFinger', () => {
  it('returns true when fingers match', () => {
    expect(isCorrectFinger('index', 'index')).toBe(true);
  });

  it('returns false when fingers differ', () => {
    expect(isCorrectFinger('pinky', 'ring')).toBe(false);
  });

  it('returns false for unknown finger', () => {
    expect(isCorrectFinger('unknown', 'index')).toBe(false);
  });
});
