# Session Engine (Delta)

## Purpose

Add real-time metrics computation to SessionEngine so that partial WPM, accuracy, and duration are available during active sessions, not just at session end.

## Delta Changes

### CHANGED Requirement: Session Metrics

The "Session Metrics" requirement is **CHANGED** to support two modes: live computation during running sessions, and final computation at stop.

(Previously: metrics computed only at session stop)

#### Scenario: Live metrics during running session (NEW behavior)

- GIVEN a running session with 30 keystrokes at t=0
- WHEN `computeLiveMetrics(Date.now())` is called at t=60
- THEN duration MUST be 60s, wpm MUST be computed from 30 keystrokes using the 5-char = 1-word formula, accuracy MUST reflect error count

#### Scenario: Live metrics exclude pause time (NEW behavior)

- GIVEN a running session that was paused for 15s within a 60s span
- WHEN `computeLiveMetrics(endTime)` is called
- THEN duration MUST be 45s (60 - 15 pause), NOT 60s

#### Scenario: Final metrics at stop (unchanged)

- GIVEN 100 keystrokes, 5 errors, 60s active duration
- WHEN the session stops
- THEN accuracy MUST be 95%, wpm MUST be computed from standard formula

### NEW Requirement: Live Metrics Computation Method

The `SessionEngine` MUST expose a `computeLiveMetrics()` method that computes partial `SessionMetrics` from the current keystroke array, start time, and end time — without requiring the session to stop.

```typescript
computeLiveMetrics(endTime: number): Partial<SessionMetrics>
```

The returned object MUST include:
- `duration`: active seconds from `startTime` to `endTime`, excluding pause time
- `totalKeystrokes`: current `this.state.keystrokes.length`
- `wpm`: words per minute using standard formula (5 chars = 1 word)
- `accuracy`: correct percentage (0–100) based on keystrokes with no errors
- `errors`: current `ErrorCountByCategory` aggregated from keystrokes up to `endTime`

The method MUST be a pure function with no side effects — no state mutation, no store updates, no `this.state` writes.

#### Scenario: Pure function — no state mutation

- GIVEN a running session with 10 keystrokes
- WHEN `computeLiveMetrics(Date.now())` is called
- THEN `this.state.metrics` MUST remain unchanged
- AND `this.state.state` MUST remain `running`

#### Scenario: Empty keystrokes

- GIVEN a running session with 0 keystrokes
- WHEN `computeLiveMetrics(Date.now())` is called
- THEN returned object MUST have `totalKeystrokes: 0`, `wpm: 0`, `accuracy: 100`

#### Scenario: Performance — sub-1ms execution

- GIVEN a session with 500 keystrokes (stress test)
- WHEN `computeLiveMetrics()` is called
- THEN execution time MUST be under 1ms on a modern CPU

### NEW Requirement: Metrics Update on Keystroke

The `sessionStore.recordKeystroke()` method MUST call `sessionEngine.computeLiveMetrics()` after appending the keystroke, and update `sessionStore.metrics` with the live result, making it non-null during active sessions.

#### Scenario: Metrics non-null during running

- GIVEN a session is running
- WHEN a keystroke is recorded
- THEN `sessionStore.metrics` MUST be updated with live computed values (non-null)

#### Scenario: Metrics null before first keystroke

- GIVEN a session just started (0 keystrokes)
- WHEN TrainingPage renders
- THEN `sessionStore.metrics` MAY be null or a partial result with zero values

## REMOVED Requirements

None.

## RENAMED Requirements

None.
