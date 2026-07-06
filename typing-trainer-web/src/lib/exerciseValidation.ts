/**
 * Exercise Validation — Pure function for keystroke validation against target text.
 *
 * Case-sensitive: 'A' !== 'a'.
 * Backspace (BSPC) is always an error.
 * Special characters (non-printable) are compared directly.
 */

export interface ValidationRule {
  correct: boolean;
  expected: string;
  actual: string;
}

export function validateKeystroke(
  targetChar: string,
  pressedKey: string,
  scancode: string,
): ValidationRule {
  // Backspace is always incorrect
  if (scancode === 'Backspace' || scancode.includes('BSPC')) {
    return {
      correct: false,
      expected: targetChar,
      actual: '<backspace>',
    };
  }

  // Case-sensitive exact match
  if (pressedKey === targetChar) {
    return {
      correct: true,
      expected: targetChar,
      actual: pressedKey,
    };
  }

  return {
    correct: false,
    expected: targetChar,
    actual: pressedKey,
  };
}
