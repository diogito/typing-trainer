/**
 * Mapping from QMK KC_ codes to DOM KeyboardEvent.code values.
 * This is the authoritative lookup for physical key positions.
 */

type ScancodeMap = Record<string, { code: string; domCode: string }>;

export const KC_CODE_MAP: ScancodeMap = {
  // Alpha keys
  KC_A: { code: 'KC_A', domCode: 'KeyA' },
  KC_B: { code: 'KC_B', domCode: 'KeyB' },
  KC_C: { code: 'KC_C', domCode: 'KeyC' },
  KC_D: { code: 'KC_D', domCode: 'KeyD' },
  KC_E: { code: 'KC_E', domCode: 'KeyE' },
  KC_F: { code: 'KC_F', domCode: 'KeyF' },
  KC_G: { code: 'KC_G', domCode: 'KeyG' },
  KC_H: { code: 'KC_H', domCode: 'KeyH' },
  KC_I: { code: 'KC_I', domCode: 'KeyI' },
  KC_J: { code: 'KC_J', domCode: 'KeyJ' },
  KC_K: { code: 'KC_K', domCode: 'KeyK' },
  KC_L: { code: 'KC_L', domCode: 'KeyL' },
  KC_M: { code: 'KC_M', domCode: 'KeyM' },
  KC_N: { code: 'KC_N', domCode: 'KeyN' },
  KC_O: { code: 'KC_O', domCode: 'KeyO' },
  KC_P: { code: 'KC_P', domCode: 'KeyP' },
  KC_Q: { code: 'KC_Q', domCode: 'KeyQ' },
  KC_R: { code: 'KC_R', domCode: 'KeyR' },
  KC_S: { code: 'KC_S', domCode: 'KeyS' },
  KC_T: { code: 'KC_T', domCode: 'KeyT' },
  KC_U: { code: 'KC_U', domCode: 'KeyU' },
  KC_V: { code: 'KC_V', domCode: 'KeyV' },
  KC_W: { code: 'KC_W', domCode: 'KeyW' },
  KC_X: { code: 'KC_X', domCode: 'KeyX' },
  KC_Y: { code: 'KC_Y', domCode: 'KeyY' },
  KC_Z: { code: 'KC_Z', domCode: 'KeyZ' },

  // Numbers
  KC_1: { code: 'KC_1', domCode: 'Digit1' },
  KC_2: { code: 'KC_2', domCode: 'Digit2' },
  KC_3: { code: 'KC_3', domCode: 'Digit3' },
  KC_4: { code: 'KC_4', domCode: 'Digit4' },
  KC_5: { code: 'KC_5', domCode: 'Digit5' },
  KC_6: { code: 'KC_6', domCode: 'Digit6' },
  KC_7: { code: 'KC_7', domCode: 'Digit7' },
  KC_8: { code: 'KC_8', domCode: 'Digit8' },
  KC_9: { code: 'KC_9', domCode: 'Digit9' },
  KC_0: { code: 'KC_0', domCode: 'Digit0' },

  // Modifiers — Left side
  KC_LCTRL: { code: 'KC_LCTRL', domCode: 'ControlLeft' },
  KC_LSHIFT: { code: 'KC_LSHIFT', domCode: 'ShiftLeft' },
  KC_LALT: { code: 'KC_LALT', domCode: 'AltLeft' },
  KC_LGUI: { code: 'KC_LGUI', domCode: 'MetaLeft' },
  KC_RCTRL: { code: 'KC_RCTRL', domCode: 'ControlRight' },
  KC_RSHIFT: { code: 'KC_RSHIFT', domCode: 'ShiftRight' },
  KC_RALT: { code: 'KC_RALT', domCode: 'AltRight' },
  KC_RGUI: { code: 'KC_RGUI', domCode: 'MetaRight' },
  KC_CAPSLOCK: { code: 'KC_CAPSLOCK', domCode: 'CapsLock' },

  // Navigation cluster
  KC_ESC: { code: 'KC_ESC', domCode: 'Escape' },
  KC_BSPC: { code: 'KC_BSPC', domCode: 'Backspace' },
  KC_TAB: { code: 'KC_TAB', domCode: 'Tab' },
  KC_ENTER: { code: 'KC_ENTER', domCode: 'Enter' },
  KC_INS: { code: 'KC_INS', domCode: 'Insert' },
  KC_DELETE: { code: 'KC_DELETE', domCode: 'Delete' },
  KC_DEL: { code: 'KC_DEL', domCode: 'Delete' },
  KC_BACKSPACE: { code: 'KC_BACKSPACE', domCode: 'Backspace' },
  KC_INSERT: { code: 'KC_INSERT', domCode: 'Insert' },
  KC_HOME: { code: 'KC_HOME', domCode: 'Home' },
  KC_END: { code: 'KC_END', domCode: 'End' },
  KC_PGUP: { code: 'KC_PGUP', domCode: 'PageUp' },
  KC_PGDN: { code: 'KC_PGDN', domCode: 'PageDown' },
  KC_PGDOWN: { code: 'KC_PGDOWN', domCode: 'PageDown' },
  KC_UP: { code: 'KC_UP', domCode: 'ArrowUp' },
  KC_DOWN: { code: 'KC_DOWN', domCode: 'ArrowDown' },
  KC_LEFT: { code: 'KC_LEFT', domCode: 'ArrowLeft' },
  KC_RIGHT: { code: 'KC_RIGHT', domCode: 'ArrowRight' },

  // Function row
  KC_F1: { code: 'KC_F1', domCode: 'F1' },
  KC_F2: { code: 'KC_F2', domCode: 'F2' },
  KC_F3: { code: 'KC_F3', domCode: 'F3' },
  KC_F4: { code: 'KC_F4', domCode: 'F4' },
  KC_F5: { code: 'KC_F5', domCode: 'F5' },
  KC_F6: { code: 'KC_F6', domCode: 'F6' },
  KC_F7: { code: 'KC_F7', domCode: 'F7' },
  KC_F8: { code: 'KC_F8', domCode: 'F8' },
  KC_F9: { code: 'KC_F9', domCode: 'F9' },
  KC_F10: { code: 'KC_F10', domCode: 'F10' },
  KC_F11: { code: 'KC_F11', domCode: 'F11' },
  KC_F12: { code: 'KC_F12', domCode: 'F12' },

  // Punctuation
  KC_MINUS: { code: 'KC_MINUS', domCode: 'Minus' },
  KC_EQUAL: { code: 'KC_EQUAL', domCode: 'Equal' },
  KC_LBRC: { code: 'KC_LBRC', domCode: 'BracketLeft' },
  KC_RBRC: { code: 'KC_RBRC', domCode: 'BracketRight' },
  KC_BSLS: { code: 'KC_BSLS', domCode: 'Backslash' },
  KC_NUHS: { code: 'KC_NUHS', domCode: 'NonUSHash' },
  KC_SCOLON: { code: 'KC_SCOLON', domCode: 'Semicolon' },
  KC_SEMICOLON: { code: 'KC_SEMICOLON', domCode: 'Semicolon' },
  KC_QUOTE: { code: 'KC_QUOTE', domCode: 'Quote' },
  KC_GRAVE: { code: 'KC_GRAVE', domCode: 'Backquote' },
  KC_ACCENT_GRAVE: { code: 'KC_ACCENT_GRAVE', domCode: 'Backquote' },
  KC_COMMA: { code: 'KC_COMMA', domCode: 'Comma' },
  KC_DOT: { code: 'KC_DOT', domCode: 'Period' },
  KC_SLASH: { code: 'KC_SLASH', domCode: 'Slash' },
  KC_TILDE: { code: 'KC_TILDE', domCode: 'Backquote' },

  // Spanish-specific keys
  KC_NNO: { code: 'KC_NNO', domCode: 'IntlHash' },
  KC_RO: { code: 'KC_RO', domCode: 'IntlRo' },

  // Space
  KC_SPC: { code: 'KC_SPC', domCode: 'Space' },
  KC_SPACE: { code: 'KC_SPACE', domCode: 'Space' },

  // Lock / Media
  KC_NUMLOCK: { code: 'KC_NUMLOCK', domCode: 'NumLock' },
  KC_KBSPC: { code: 'KC_KBSPC', domCode: 'Space' },
  KC_MUTE: { code: 'KC_MUTE', domCode: 'AudioVolumeMute' },
  KC_VOLUP: { code: 'KC_VOLUP', domCode: 'AudioVolumeUp' },
  KC_VOLDN: { code: 'KC_VOLDN', domCode: 'AudioVolumeDown' },
};

/**
 * Look up a KC_ code. Returns the mapping or null if unknown.
 * Logs a warning for unknown codes.
 */
export function getScancode(kcCode: string): { code: string; domCode: string } | null {
  const entry = KC_CODE_MAP[kcCode];
  if (entry) {
    return entry;
  }

  // Try stripping the KC_ prefix and looking up
  const base = kcCode.startsWith('KC_') ? kcCode.slice(3) : kcCode;
  const full = `KC_${base}`;
  const fallback = KC_CODE_MAP[full];
  if (fallback) {
    return fallback;
  }

  // Unknown code — warn and return a generic mapping
  console.warn(`[KC_CODE_MAP] Unknown keycode: ${kcCode}`);
  return { code: kcCode, domCode: kcCode };
}

/**
 * Map a DOM KeyboardEvent.code to a KC_ scancode.
 * Inverse lookup of the code map.
 */
export function getKcCodeFromDomCode(domCode: string): string {
  for (const [kcCode, entry] of Object.entries(KC_CODE_MAP)) {
    if (entry.domCode === domCode) {
      return kcCode;
    }
  }
  console.warn(`[KC_CODE_MAP] No mapping for DOM code: ${domCode}`);
  return domCode;
}
