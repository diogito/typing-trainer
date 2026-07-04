# Event Capture

## Purpose

Capture raw keyboard events, map physical keys to fingers, track timing, and detect errors.

## Requirements

### Requirement: DOM Event Listening

Attach `keydown`/`keyup` listeners to `window` on Training page mount, remove on unmount. Listeners MUST capture `KeyboardEvent.code` (physical position), NOT `event.key`.

#### Scenario: Listener attaches on mount

- GIVEN the Training page mounts
- WHEN the component initializes
- THEN window MUST have keydown and keyup listeners

#### Scenario: Listener detaches on unmount

- GIVEN listeners are attached
- WHEN the user navigates away
- THEN the listeners MUST be removed

### Requirement: Physical Key to Scancode Mapping

Map `event.code` to internal scancode format, one-to-one (e.g., `KeyA` → `KC_A`, `ShiftLeft` → `KC_LSHIFT`).

#### Scenario: Press A key

- GIVEN the user presses A
- WHEN keydown fires
- THEN event.code MUST be "KeyA" mapped to "KC_A"

#### Scenario: Modifier key press

- GIVEN the user presses Shift+A
- WHEN keydown fires for Shift
- THEN event.code MUST be "ShiftLeft"/"ShiftRight" mapped to "KC_LSHIFT"/"KC_RSHIFT"

### Requirement: Press/Release Timing

Record per-event: `event.code`, `scancode`, `key`, `pressTime` (DOMHighResTimeStamp), `releaseTime` (undefined if held), `holdDuration` (ms).

#### Scenario: Record full key stroke

- GIVEN user presses/releases KC_A
- WHEN keydown at t=1000, keyup at t=1050
- THEN KeystrokeEvent MUST have pressTime=1000, releaseTime=1050, holdDuration=50

#### Scenario: Record held key

- GIVEN user presses KC_A without releasing
- WHEN another keydown fires
- THEN releaseTime MUST be undefined, holdDuration undefined

### Requirement: Expected Finger Detection

Look up expected finger for each scancode using the current layout's finger map.

#### Scenario: QWERTY KC_A expects pinky

- GIVEN QWERTY active, KC_A pressed
- THEN expectedFinger MUST be 'pinky'

#### Scenario: Colemak KC_W expects ring

- GIVEN Colemak active, KC_W pressed
- THEN expectedFinger MUST be 'ring'

### Requirement: Error Detection

Detect three error types:

| Error Type | Condition |
|------------|-----------|
| `wrong-finger` | Finger ≠ expected for scancode |
| `wrong-key` | event.key ≠ expected character for layout |
| `missed` | Expected key not pressed within 2000ms |

#### Scenario: Wrong finger

- GIVEN QWERTY KC_A expects 'pinky'
- WHEN KC_A pressed by 'ring'
- THEN error MUST be 'wrong-finger'

#### Scenario: No error

- GIVEN Colemak KC_W expects 'ring'
- WHEN KC_W pressed by 'ring'
- THEN error MUST be undefined

#### Scenario: Wrong key

- GIVEN QWERTY KC_A expects 'a'
- WHEN event.key differs
- THEN error MUST be 'wrong-key'

#### Scenario: Missed key

- GIVEN training requires KC_S next
- WHEN 2000ms pass without press
- THEN 'missed' error MUST be recorded

### Requirement: Modifier Key Handling

Track modifiers (Shift, Ctrl, Alt, GUI) separately. They affect character but are NOT training keystrokes.

#### Scenario: Shift+A tracked

- GIVEN Shift held, KC_A pressed
- THEN keystroke MUST be recorded with modifier state, character 'A'

#### Scenario: Ctrl+C skipped

- GIVEN a session running
- WHEN Ctrl+C pressed
- THEN NOT counted as training keystroke

### Requirement: Prevent Default for Training

Call `event.preventDefault()` for training keys, allow Escape (pause) and Tab (navigation) through.

#### Scenario: Prevent training keys

- GIVEN user is in training area
- WHEN they press A-Z
- THEN the event MUST be prevented

#### Scenario: Escape passes through

- GIVEN user presses Escape
- THEN the system MUST pause AND allow propagation

## REMOVED Requirements

None.

## RENAMED Requirements

None.
