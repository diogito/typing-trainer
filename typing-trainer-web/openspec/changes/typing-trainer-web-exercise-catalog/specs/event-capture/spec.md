# Event Capture Specification (Target Validation Extension)

## Purpose

Extend `useEventCapture` with optional target text validation while maintaining backward compatibility.

## Requirements

### REQ-1: useEventCapture signature extended

The `UseEventCaptureOptions` interface MUST gain two optional fields: `targetText?: string` and `onValidation?: (index: number, correct: boolean, expected: string, actual: string) => void`.

#### Scenario: Hook compiles with old options

- GIVEN existing code passes `{ onKeystroke, fingerMap, activeLayer, enabled }`
- WHEN the hook's interface is extended with optional fields
- THEN the code compiles without errors

#### Scenario: Hook compiles with new options

- GIVEN code passes `{ onKeystroke, fingerMap, activeLayer, enabled, targetText: "test" }`
- WHEN the hook processes the options
- THEN targetText is available for validation

### REQ-2: Validation callback is called on each keystroke

When `targetText` is provided and the user presses a key, `onValidation` MUST be called BEFORE `onKeystroke`.

#### Scenario: Validation fires before keystroke

- GIVEN targetText is "abc" and currentIndex is 0
- WHEN the user presses 'a'
- THEN onValidation(0, true, 'a', 'a') is called
- AND onKeystroke is called after onValidation

#### Scenario: Validation with backspace

- GIVEN targetText is "abc" and currentIndex is 2
- WHEN the user presses backspace
- THEN onValidation is NOT called (backspace is not a character press)
- AND currentIndex is decremented

### REQ-3: Index tracking across keystrokes

A currentIndex reference MUST track the current position in the target text. The index advances on correct/incorrect character input and decrements on backspace.

#### Scenario: Index advances on input

- GIVEN targetText is "test" and currentIndex is 0
- WHEN the user types 't', 'e', 's', 't' in order
- THEN currentIndex becomes 4 after the last character

#### Scenario: Index stays within bounds

- GIVEN targetText is "ab" and currentIndex is 1
- WHEN the user types a character
- THEN currentIndex becomes 2 (last char)

### REQ-4: Validation state is isolated per hook instance

Each `useEventCapture` hook MUST maintain its own currentIndex state, independent of other instances.

#### Scenario: Multiple hook instances

- GIVEN two useEventCapture instances with different targetText
- WHEN the user types in both
- THEN each maintains its own currentIndex independently

### REQ-5: No side effects from validation

The `onValidation` callback is side-channel only — it does not affect the `onKeystroke` event or the session store.

#### Scenario: Validation doesn't modify keystroke

- GIVEN targetText is "abc" and onValidation is provided
- WHEN the user types 'x' (incorrect)
- THEN the KeystrokeEvent passed to onKeystroke is unchanged from normal behavior

#### Scenario: Validation doesn't modify finger detection

- GIVEN targetText is "abc" and onValidation is provided
- WHEN the user types 'x' (incorrect)
- THEN finger detection and error detection proceed normally

## Non-goals

- Exercise store integration (handled by ExerciseDisplay and TrainingPage)
- Validation error styling (handled by ExerciseDisplay)
- Multi-target validation (one target text per hook instance)

## Constraints

- All new options are optional — backward compatible
- Existing 171 tests must pass
- Validation is side-channel only — no store mutation

## Success Criteria

- [ ] UseEventCaptureOptions has optional targetText and onValidation
- [ ] onValidation called before onKeystroke for each keystroke
- [ ] Backspace does not trigger onValidation
- [ ] currentIndex advances correctly
- [ ] Multiple hook instances are isolated
- [ ] Validation has no side effects on KeystrokeEvent
- [ ] All 171 existing tests pass
