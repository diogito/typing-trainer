import { describe, it, expect } from 'vitest';
import { validateKeystroke } from './exerciseValidation';

describe('validateKeystroke — correct match', () => {
  it('returns correct=true for exact match', () => {
    const result = validateKeystroke('a', 'a', 'KeyA');
    expect(result.correct).toBe(true);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('a');
  });

  it('matches uppercase correctly', () => {
    const result = validateKeystroke('A', 'A', 'Shift+A');
    expect(result.correct).toBe(true);
    expect(result.expected).toBe('A');
    expect(result.actual).toBe('A');
  });

  it('matches space character', () => {
    const result = validateKeystroke(' ', ' ', 'Space');
    expect(result.correct).toBe(true);
    expect(result.expected).toBe(' ');
    expect(result.actual).toBe(' ');
  });

  it('matches special characters', () => {
    const result = validateKeystroke('!', '!', 'Shift+1');
    expect(result.correct).toBe(true);
    expect(result.expected).toBe('!');
    expect(result.actual).toBe('!');
  });
});

describe('validateKeystroke — case sensitivity', () => {
  it('A !== a', () => {
    const result = validateKeystroke('a', 'A', 'KeyA');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('A');
  });

  it('a !== A', () => {
    const result = validateKeystroke('A', 'a', 'KeyA');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('A');
    expect(result.actual).toBe('a');
  });

  it('1 !== !', () => {
    const result = validateKeystroke('1', '!', 'Shift+1');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('1');
    expect(result.actual).toBe('!');
  });
});

describe('validateKeystroke — incorrect keys', () => {
  it('different letter returns correct=false', () => {
    const result = validateKeystroke('a', 'b', 'KeyB');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('b');
  });

  it('letter vs number returns correct=false', () => {
    const result = validateKeystroke('a', '1', 'Digit1');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('1');
  });

  it('empty key returns correct=false', () => {
    const result = validateKeystroke('a', '', 'KeyA');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('');
  });
});

describe('validateKeystroke — backspace', () => {
  it('Backspace scancode returns correct=false', () => {
    const result = validateKeystroke('a', '', 'Backspace');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('<backspace>');
  });

  it('scancode containing BSPC returns correct=false', () => {
    const result = validateKeystroke('a', '', 'BSPC');
    expect(result.correct).toBe(false);
    expect(result.expected).toBe('a');
    expect(result.actual).toBe('<backspace>');
  });
});

describe('validateKeystroke — special characters', () => {
  it('handles accented characters', () => {
    const result = validateKeystroke('á', 'á', 'KeyA');
    expect(result.correct).toBe(true);
  });

  it('handles ñ character', () => {
    const result = validateKeystroke('ñ', 'ñ', 'KeyN');
    expect(result.correct).toBe(true);
  });

  it('handles quotes', () => {
    const result = validateKeystroke('"', '"', 'Quote');
    expect(result.correct).toBe(true);
  });
});
