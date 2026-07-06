# Training Session (Delta)

## Purpose

Define requirements for real-time display of session metrics during active training sessions, including live WPM, accuracy, keystroke count, and elapsed time.

## Delta Changes

### CHANGED Requirement: Real-Time Metrics Display

The `TrainingPage` component MUST display live metrics during active sessions, using `computeLiveMetrics()` results from `sessionStore.metrics` instead of relying on final metrics computed at stop.

(Previously: WPM, accuracy, and keystroke stats were 0 during active sessions because `metrics` was null until stop)

#### Scenario: Live WPM display

- GIVEN a running session with 60 keystrokes over 60 seconds
- THEN the WPM card MUST display the computed WPM (not 0)

#### Scenario: Live accuracy display

- GIVEN a running session with 100 keystrokes and 5 errors
- THEN the Accuracy card MUST display 95% (not 100% from fallback)

#### Scenario: Live precision display

- GIVEN a running session with 100 keystrokes and 3 wrong-finger errors
- THEN the Precision card MUST display the computed precision percentage

### CHANGED Requirement: Keystroke Count Display

The Keystrokes card MUST use `session.keystrokes.length` for display instead of `metrics?.totalKeystrokes`.

(Previously: keystroke count was 0 during running sessions because metrics were null)

#### Scenario: Live keystroke count

- GIVEN a running session with 25 keystrokes
- THEN the Keystrokes card MUST display 25 (not 0 or from null metrics)

### CHANGED Requirement: Elapsed Time Display

When `session.state === 'running'`, elapsed time MUST be computed live from `Date.now() - session.startTime`. When `session.state` is not `'running'`, time is displayed from `metrics.duration`.

(Previously: time was always 0 during running sessions because `metrics.duration` was null)

#### Scenario: Elapsed time during running

- GIVEN a session started at t=0, current time is t=45
- WHEN the session is running
- THEN the Time card MUST display 45s (not 0)

#### Scenario: Elapsed time after stop

- GIVEN a session that was running for 120 seconds and then stopped
- WHEN TrainingPage renders
- THEN the Time card MUST display 120s (from `metrics.duration`)

### CHANGED Requirement: Stop Button Visibility

The Stop button visibility condition is CHANGED from `metrics.totalKeystrokes > 0 && session.state !== 'idle'` to `session.keystrokes.length > 0 && session.state !== 'idle'`. This ensures the Stop button appears after the first keystroke, regardless of metrics state.

(Previously: Stop button required `metrics.totalKeystrokes > 0` which was null during running sessions)

#### Scenario: Stop button visible after first keystroke

- GIVEN a running session with 1 keystroke
- WHEN TrainingPage renders
- THEN the Stop button MUST be visible

#### Scenario: Stop button hidden before first keystroke

- GIVEN a session that was started but has no keystrokes
- WHEN TrainingPage renders
- THEN the Stop button MUST NOT be visible

## REMOVED Requirements

None.

## RENAMED Requirements

None.
