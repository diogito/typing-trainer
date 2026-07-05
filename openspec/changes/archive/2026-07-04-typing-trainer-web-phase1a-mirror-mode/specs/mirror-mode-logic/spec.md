# Delta for Mirror Mode Logic

## ADDED Requirements

### Requirement: Progress State

The system SHALL maintain Mirror Mode state including enabled flag and progress percentage (0–100) in the UI store. The state MUST include a minimum opacity configuration value.

The state structure MUST contain:
- `enabled`: boolean — whether Mirror Mode is active
- `progress`: number — current progress percentage (0 to 100)
- `minOpacity`: number — minimum keyboard opacity when progress reaches 100%

#### Scenario: Initial state defaults

- GIVEN the UI store initializes
- WHEN Mirror Mode state is read
- THEN `enabled` MUST be `false`, `progress` MUST be `0`, and `minOpacity` MUST be `0.08`

#### Scenario: Progress increments on correct keystroke

- GIVEN Mirror Mode is enabled and progress is at 30%
- WHEN the user types a correct keystroke
- THEN progress MUST increase by a fixed amount (e.g., 2% per keystroke)
- AND the new progress MUST NOT exceed 100%

#### Scenario: Incorrect keystroke does not advance progress

- GIVEN Mirror Mode is enabled and progress is at 50%
- WHEN the user types an incorrect keystroke
- THEN progress MUST NOT change

### Requirement: Progress Reset

The system SHALL reset Mirror Mode progress to 0% and disable Mirror Mode when a new training session starts or when the layout changes.

#### Scenario: Reset on new session

- GIVEN Mirror Mode is ON with progress at 60%
- WHEN the user stops the current session and starts a new one
- THEN Mirror Mode MUST be disabled and progress MUST reset to 0%

#### Scenario: Reset on layout change

- GIVEN Mirror Mode is ON with progress at 40%
- WHEN the user switches to a different keyboard layout
- THEN Mirror Mode MUST be disabled and progress MUST reset to 0%

#### Scenario: Progress survives pause

- GIVEN Mirror Mode is ON with progress at 50%
- WHEN the user pauses the session
- THEN Mirror Mode state (enabled + progress) MUST be preserved
- AND resuming the session MUST continue from the same progress value

### Requirement: Opacity Calculation

The system SHALL compute keyboard opacity from the current progress value using a linear mapping: `opacity = max(minOpacity, 1.0 - (progress / 100) * (1.0 - minOpacity))`.

#### Scenario: Opacity at 0% progress

- GIVEN minOpacity is 0.08 and progress is 0%
- WHEN opacity is calculated
- THEN the result MUST be 1.0

#### Scenario: Opacity at 50% progress

- GIVEN minOpacity is 0.08 and progress is 50%
- WHEN opacity is calculated
- THEN the result MUST be approximately 0.54

#### Scenario: Opacity at 100% progress

- GIVEN minOpacity is 0.08 and progress is 100%
- WHEN opacity is calculated
- THEN the result MUST be 0.08

### Requirement: Keystroke Correctness Integration

The system MUST receive keystroke correctness signals from the session engine and only advance Mirror Mode progress for correct keystrokes. The integration point SHOULD be the existing `recordKeystroke` callback or a new correctness-checking middleware.

#### Scenario: Progress advances only on correct keystroke

- GIVEN Mirror Mode is enabled with progress at 20%
- WHEN the user types a correct keystroke
- THEN progress MUST increase by the configured increment

#### Scenario: Progress stays on error

- GIVEN Mirror Mode is enabled with progress at 20%
- WHEN the user types an incorrect keystroke
- THEN progress MUST NOT change

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
