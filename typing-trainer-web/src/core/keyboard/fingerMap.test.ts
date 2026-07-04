import { describe, it, expect } from 'vitest';
import { generateFingerMap, getFingerColor, fingerToHand } from './fingerMap';
import type { KeyboardLayout } from '@/types';

describe('generateFingerMap', () => {
  it('maps QWERTY keys to correct fingers', () => {
    const layout: KeyboardLayout = {
      id: 'qwerty',
      name: 'QWERTY',
      keys: [
        { scancode: 'KC_Q', position: { col: 1, row: 2, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_R', position: { col: 2, row: 2, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_W', position: { col: 2, row: 1, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_E', position: { col: 3, row: 1, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_A', position: { col: 1, row: 3, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_S', position: { col: 2, row: 3, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_Z', position: { col: 1, row: 4, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_X', position: { col: 2, row: 4, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
      ],
      fingerMap: {},
      layers: {},
    };

    const fingerMap = generateFingerMap(layout);
    // Column 1 → pinky
    expect(fingerMap['KC_Q']).toBe('pinky');
    expect(fingerMap['KC_A']).toBe('pinky');
    expect(fingerMap['KC_Z']).toBe('pinky');
    // Column 2 → ring
    expect(fingerMap['KC_R']).toBe('ring');
    expect(fingerMap['KC_W']).toBe('ring');
    expect(fingerMap['KC_S']).toBe('ring');
    expect(fingerMap['KC_X']).toBe('ring');
    // Column 3 → middle
    expect(fingerMap['KC_E']).toBe('middle');
  });

  it('maps Colemak correctly', () => {
    const layout: KeyboardLayout = {
      id: 'colemak',
      name: 'Colemak',
      keys: [
        { scancode: 'KC_Q', position: { col: 1, row: 2, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_W', position: { col: 2, row: 1, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_E', position: { col: 3, row: 1, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_T', position: { col: 4, row: 1, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_Y', position: { col: 5, row: 1, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
      ],
      fingerMap: {},
      layers: {},
    };

    const fingerMap = generateFingerMap(layout);
    // QWERTY: Q=pinky, W=ring, E=middle, T=index (left)
    // Colemak: Q=pinky (col1), W=ring (col2), E=middle (col3), T=index (col4)
    expect(fingerMap['KC_Q']).toBe('pinky');
    expect(fingerMap['KC_W']).toBe('ring');
    expect(fingerMap['KC_E']).toBe('middle');
    expect(fingerMap['KC_T']).toBe('index');
    // Y is on the right half
    expect(fingerMap['KC_Y']).toBe('index');
  });

  it('assigns "other" for out-of-range columns', () => {
    const layout: KeyboardLayout = {
      id: 'test',
      name: 'Test',
      keys: [
        { scancode: 'KC_TEST', position: { col: 0, row: 0, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
        { scancode: 'KC_TEST2', position: { col: 9, row: 0, width: 1, height: 1, x: 0, y: 0 }, finger: 'other', labels: {} },
      ],
      fingerMap: {},
      layers: {},
    };

    const fingerMap = generateFingerMap(layout);
    expect(fingerMap['KC_TEST']).toBe('other');
    expect(fingerMap['KC_TEST2']).toBe('other');
  });
});

describe('getFingerColor', () => {
  it('returns correct colors for each finger', () => {
    expect(getFingerColor('pinky')).toBe('#ef4444');
    expect(getFingerColor('ring')).toBe('#f97316');
    expect(getFingerColor('middle')).toBe('#eab308');
    expect(getFingerColor('index')).toBe('#22c55e');
    expect(getFingerColor('thumb')).toBe('#3b82f6');
    expect(getFingerColor('other')).toBe('#6b7280');
  });
});

describe('fingerToHand', () => {
  it('maps column 1-4 to left hand', () => {
    expect(fingerToHand('pinky', 1)).toBe('left');
    expect(fingerToHand('ring', 2)).toBe('left');
    expect(fingerToHand('middle', 3)).toBe('left');
    expect(fingerToHand('index', 4)).toBe('left');
  });

  it('maps column 5-8 to right hand', () => {
    expect(fingerToHand('index', 5)).toBe('right');
    expect(fingerToHand('middle', 6)).toBe('right');
    expect(fingerToHand('ring', 7)).toBe('right');
    expect(fingerToHand('pinky', 8)).toBe('right');
  });
});
