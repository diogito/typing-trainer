# Target Validation Specification

## Purpose

Validate user keystrokes against the exercise target text character-by-character using `event.key`.

## Requirements

### REQ-1: useEventCapture accepts target validation props

The `useEventCapture` hook MUST accept optional `targetText: string` and `onValidation?: (index, correct, expected, actual) => void` parameters.

#### Scenario: Hook called without target text

- GIVEN useEventCapture is called with no targetText
- WHEN a keystroke is captured
- THEN no target validation is performed and onValidation is not called

#### Scenario: Hook called with target text

- GIVEN useEventCapture is called with `targetText: "hello"`
- WHEN a keystroke is captured
- THEN onValidation is called with the expected and actual characters

### REQ-2: Character-by-character validation

Validation MUST compare `event.key` against `targetText[currentIndex]` where `currentIndex` tracks the position in the target text.

#### Scenario: Correct character typed

- GIVEN targetText is "hello" and currentIndex is 0
- WHEN the user presses 'h'
- THEN onValidation is called with correct=true, expected='h', actual='h'

#### Scenario: Incorrect character typed

- GIVEN targetText is "hello" and currentIndex is 0
- WHEN the user presses 'x'
- THEN onValidation is called with correct=false, expected='h', actual='x'

#### Scenario: Case-sensitive validation

- GIVEN targetText is "Hello" and currentIndex is 0
- WHEN the user presses 'h' (lowercase)
- THEN onValidation is called with correct=false, expected='H', actual='h'

### REQ-3: Backspace support

When the user presses backspace, the currentIndex MUST decrement to the previous 'pending' character if one exists.

#### Scenario: Backspace advances cursor

- GIVEN targetText is "hello" and currentIndex is 3 (3 chars completed)
- WHEN the user presses backspace
- THEN currentIndex becomes 2

#### Scenario: Backspace at start

- GIVEN targetText is "hello" and currentIndex is 0
- WHEN the user presses backspace
- THEN currentIndex remains 0

### REQ-4: Target validation is backward compatible

Adding target validation to useEventCapture MUST NOT break existing callers that do not pass `targetText`.

#### Scenario: Existing caller without targetText

- GIVEN existing code calls useEventCapture without targetText
- WHEN a keystroke is captured
- THEN the existing onKeystroke callback is still called with the KeystrokeEvent

#### Scenario: No behavior change for existing callers

- GIVEN existing code calls useEventCapture without targetText
- WHEN the hook is upgraded to accept targetText
- THEN all existing test assertions still pass

## Non-goals

- Scancode-based validation (use event.key only)
- Multi-language character validation
- Phonetic/autocorrect-assisted validation

## Constraints

- Must use `event.key` not `event.code` or `event.data`
- Backward compatible — all new props are optional
- Existing 171 tests must pass

## Success Criteria

- [ ] useEventCapture accepts optional targetText and onValidation
- [ ] Correct keystrokes produce correct=true
- [ ] Incorrect keystrokes produce correct=false with expected/actual
- [ ] Backspace decrements currentIndex
- [ ] Backspace at index 0 is no-op
- [ ] Existing callers without targetText still work
