import { describe, it, expect, vi } from 'vitest';
import { getScancode, getKcCodeFromDomCode } from './kcCodeMap';

describe('getScancode', () => {
  it('maps KC_A to KeyA', () => {
    const result = getScancode('KC_A');
    expect(result).toEqual({ code: 'KC_A', domCode: 'KeyA' });
  });

  it('maps KC_LSHIFT to ShiftLeft', () => {
    const result = getScancode('KC_LSHIFT');
    expect(result).toEqual({ code: 'KC_LSHIFT', domCode: 'ShiftLeft' });
  });

  it('maps KC_NNO for Spanish nino', () => {
    const result = getScancode('KC_NNO');
    expect(result).toEqual({ code: 'KC_NNO', domCode: 'IntlHash' });
  });

  it('maps KC_ENTER to Enter', () => {
    const result = getScancode('KC_ENTER');
    expect(result).toEqual({ code: 'KC_ENTER', domCode: 'Enter' });
  });

  it('maps KC_BSPC to Backspace', () => {
    const result = getScancode('KC_BSPC');
    expect(result).toEqual({ code: 'KC_BSPC', domCode: 'Backspace' });
  });

  it('maps all alpha keys A-Z', () => {
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      const result = getScancode(`KC_${letter}`);
      expect(result?.code).toBe(`KC_${letter}`);
      expect(result?.domCode).toBe(`Key${letter}`);
    }
  });

  it('maps number keys 1-0', () => {
    expect(getScancode('KC_1')?.domCode).toBe('Digit1');
    expect(getScancode('KC_5')?.domCode).toBe('Digit5');
    expect(getScancode('KC_0')?.domCode).toBe('Digit0');
  });

  it('maps F1-F12', () => {
    expect(getScancode('KC_F1')?.domCode).toBe('F1');
    expect(getScancode('KC_F12')?.domCode).toBe('F12');
  });

  it('maps navigation cluster keys', () => {
    expect(getScancode('KC_HOME')?.domCode).toBe('Home');
    expect(getScancode('KC_END')?.domCode).toBe('End');
    expect(getScancode('KC_PGUP')?.domCode).toBe('PageUp');
    expect(getScancode('KC_PGDN')?.domCode).toBe('PageDown');
    expect(getScancode('KC_INS')?.domCode).toBe('Insert');
    expect(getScancode('KC_DEL')?.domCode).toBe('Delete');
  });

  it('maps punctuation keys', () => {
    expect(getScancode('KC_DOT')?.domCode).toBe('Period');
    expect(getScancode('KC_COMMA')?.domCode).toBe('Comma');
    expect(getScancode('KC_SEMICOLON')?.domCode).toBe('Semicolon');
    expect(getScancode('KC_QUOTE')?.domCode).toBe('Quote');
    expect(getScancode('KC_LBRC')?.domCode).toBe('BracketLeft');
    expect(getScancode('KC_RBRC')?.domCode).toBe('BracketRight');
    expect(getScancode('KC_BSLS')?.domCode).toBe('Backslash');
    expect(getScancode('KC_MINUS')?.domCode).toBe('Minus');
    expect(getScancode('KC_EQUAL')?.domCode).toBe('Equal');
  });

  it('maps space variants', () => {
    expect(getScancode('KC_SPC')?.domCode).toBe('Space');
    expect(getScancode('KC_SPACE')?.domCode).toBe('Space');
  });

  it('warns on unknown code and returns it as-is', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue();
    const result = getScancode('KC_AAA');
    expect(result).toEqual({ code: 'KC_AAA', domCode: 'KC_AAA' });
    expect(warnSpy).toHaveBeenCalledWith('[KC_CODE_MAP] Unknown keycode: KC_AAA');
    warnSpy.mockRestore();
  });
});

describe('getKcCodeFromDomCode', () => {
  it('maps KeyA to KC_A', () => {
    expect(getKcCodeFromDomCode('KeyA')).toBe('KC_A');
  });

  it('maps ShiftLeft to KC_LSHIFT', () => {
    expect(getKcCodeFromDomCode('ShiftLeft')).toBe('KC_LSHIFT');
  });

  it('warns on unknown DOM code', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue();
    const result = getKcCodeFromDomCode('UnknownKey');
    expect(result).toBe('UnknownKey');
    expect(warnSpy).toHaveBeenCalledWith(
      '[KC_CODE_MAP] No mapping for DOM code: UnknownKey',
    );
    warnSpy.mockRestore();
  });
});
