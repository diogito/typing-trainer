import { describe, it, expect, vi } from 'vitest';
import { parseQMKKeymap, domCodeToScancode } from './keymapParser';

describe('parseQMKKeymap', () => {
  it('parses a simple 4-key layer', () => {
    const input = {
      keyboard: 'test',
      keymap: 'test-keymap',
      layout: 'test',
      layers: [['KC_Q', 'KC_W', 'KC_E', 'KC_R']],
    };
    const result = parseQMKKeymap(input);
    expect(result.id).toBe('test-keymap');
    expect(result.name).toBe('test-keymap');
    expect(result.keys.length).toBe(4);
    expect(result.keys[0].scancode).toBe('KC_Q');
    expect(result.keys[0].labels.base).toBe('Q');
    expect(result.keys[1].scancode).toBe('KC_W');
  });

  it('parses multi-layer keymap', () => {
    const input = {
      keyboard: 'test',
      keymap: 'multi',
      layout: 'test',
      layers: [
        ['KC_A', 'KC_S'],
        ['KC_1', 'KC_2'],
      ],
    };
    const result = parseQMKKeymap(input);
    expect(result.keys.length).toBe(4);
    const aKey = result.keys.find((k) => k.scancode === 'KC_A');
    expect(aKey?.labels).toHaveProperty('base', 'A');
    expect(aKey?.labels).toHaveProperty('layer0');
  });

  it('strips KC_ prefix for labels', () => {
    const input = {
      keyboard: 'test',
      keymap: 'test',
      layout: 'test',
      layers: [['KC_LSHIFT', 'KC_TAB']],
    };
    const result = parseQMKKeymap(input);
    const lsKey = result.keys[0];
    expect(lsKey.labels.base).toBe('LSHIFT');
    const tabKey = result.keys[1];
    expect(tabKey.labels.base).toBe('TAB');
  });

  it('skips unknown codes with warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue();
    const input = {
      keyboard: 'test',
      keymap: 'test',
      layout: 'test',
      layers: [['KC_Q', 'KC_UNKNOWN', 'KC_W']],
    };
    const result = parseQMKKeymap(input);
    expect(result.keys.length).toBe(2); // KC_UNKNOWN skipped
    expect(warnSpy).toHaveBeenCalledWith(
      '[parseQMKKeymap] Skipping unknown keycode: KC_UNKNOWN',
    );
    warnSpy.mockRestore();
  });

  it('throws on empty layers', () => {
    const input = {
      keyboard: 'test',
      keymap: 'test',
      layout: 'test',
      layers: [],
    };
    expect(() => parseQMKKeymap(input)).toThrow(
      'QMK keymap.json must have a non-empty layers array',
    );
  });

  it('throws on missing layers', () => {
    // @ts-expect-error Testing invalid input
    const result = () => parseQMKKeymap({ keyboard: 'test', layout: 'test' });
    expect(result).toThrow();
  });
});

describe('domCodeToScancode', () => {
  it('maps KeyA to KC_A', () => {
    expect(domCodeToScancode('KeyA')).toBe('KC_A');
  });

  it('maps Digit5 to KC_5', () => {
    expect(domCodeToScancode('Digit5')).toBe('KC_5');
  });
});
