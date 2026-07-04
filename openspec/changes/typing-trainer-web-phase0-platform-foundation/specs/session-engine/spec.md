# Session Engine

## Purpose

Manage training session lifecycle, record keystrokes, compute per-session statistics, and coordinate with analytics.

## Requirements

### Requirement: Session Lifecycle

The system SHALL support four states with explicit transitions:

```
idle --[start]--> running --[pause]--> paused --[resume]--> running
running/paused --[stop]--> idle
```

| Transition | From → To | Condition |
|------------|-----------|-----------|
| start | idle → running | User clicks "Start" |
| pause | running → paused | User clicks "Pause" or Escape |
| resume | paused → running | User clicks "Resume" |
| stop | running/paused → idle | User clicks "Stop" |

#### Scenario: Start a session

- GIVEN the session is in idle state
- WHEN the user clicks "Start"
- THEN the session MUST transition to running and record the start timestamp

#### Scenario: Pause then resume

- GIVEN the session is running
- WHEN the user clicks "Pause"
- THEN the session MUST transition to paused and freeze the keystroke timer
- WHEN the user clicks "Resume"
- THEN the session MUST transition back to running

#### Scenario: Stop a session

- GIVEN the session is running with 50 keystrokes
- WHEN the user clicks "Stop"
- THEN the session MUST transition to idle and retain 50 keystrokes

### Requirement: Keystroke Recording

The system SHALL append keystroke events from event capture to the session's array. Each keystroke MUST include scancode, timing, finger, and error data.

```
interface SessionState {
  id: string; layoutId: string; state: 'idle' | 'running' | 'paused';
  startTime: number | null; keystrokes: KeystrokeEvent[];
  metrics: SessionMetrics | null;
}
```

#### Scenario: Record a valid keystroke

- GIVEN a running session
- WHEN a KeystrokeEvent arrives
- THEN it MUST be appended to the `keystrokes` array

#### Scenario: Record an errored keystroke

- GIVEN a running session
- WHEN a KeystrokeEvent arrives with error 'wrong-finger'
- THEN it MUST be appended with the error attached

### Requirement: Session Metrics

The system SHALL compute metrics at stop (or on-demand):

| Metric | Description |
|--------|-------------|
| `duration` | Active seconds (excludes pauses) |
| `totalKeystrokes` | Keystroke count |
| `wpm` | Words/min (5 chars = 1 word) |
| `accuracy` | Correct % (0-100) |
| `errors` | ErrorCountByCategory |

#### Scenario: Compute metrics

- GIVEN 100 keystrokes, 5 errors, 60s duration
- WHEN the session stops
- THEN accuracy MUST be 95%, wpm MUST be computed from standard formula

#### Scenario: Zero keystrokes

- GIVEN a session started and immediately stopped
- WHEN metrics are computed
- THEN wpm MUST be 0, accuracy MUST be 100%

### Requirement: Error Aggregation

The system SHALL aggregate errors into `ErrorCountByCategory`: `byKey`, `byFinger`, `byHand`, `byLayer`, `byDirection`.

#### Scenario: Aggregate finger errors

- GIVEN 3 left-pinky and 2 right-index wrong-finger errors
- WHEN metrics are computed
- THEN byFinger.pinky MUST be 3, byFinger.index MUST be 2

#### Scenario: Aggregate by key

- GIVEN KC_A had 5 errors, KC_S had 3
- WHEN metrics are computed
- THEN byKey.KC_A MUST be 5, byKey.KC_S MUST be 3

### Requirement: Pause/Resume Timing

The system SHALL exclude pause time from duration.

#### Scenario: Account for pause time

- GIVEN session starts t=0, pauses t=30, resumes t=45, stops t=90
- WHEN duration is computed
- THEN duration MUST be 75s (90-45+30), NOT 90s

## REMOVED Requirements

None.

## RENAMED Requirements

None.
