# Analytics Primitives

## Purpose

Data structures and aggregation functions for typing performance analysis, ready for future heatmap visualization.

## Requirements

### Requirement: Error Tracking by Category

The system SHALL track errors categorized by key, finger, hand, layer, and direction (down/up vs home row).

```
interface ErrorCountByCategory {
  byKey: Record<string, number>; byFinger: Record<Finger, number>;
  byHand: Record<'left' | 'right', number>;
  byLayer: Record<string, number>; byDirection: Record<'down' | 'up', number>;
}
```

Hand derived from finger+column; direction: above home = 'down', below home = 'up', home = neutral.

#### Scenario: Track error by key

- GIVEN KC_A pressed with wrong-finger error
- WHEN analytics records it
- THEN byKey.KC_A MUST increment

#### Scenario: Track error by hand

- GIVEN a right index wrong-finger error
- WHEN analytics aggregates
- THEN byHand.right MUST increment

#### Scenario: Track error by direction

- GIVEN KC_Q (above home) with wrong finger
- WHEN analytics records
- THEN byDirection.down MUST increment

#### Scenario: Home row neutral

- GIVEN KC_A on home row (ASDF)
- WHEN direction is determined
- THEN it MUST NOT be tracked in byDirection

### Requirement: Timing Metrics

The system SHALL compute: `avgHoldTime`, `avgInterKeystrokeGap`, `holdTimeP50`, `holdTimeP95`, `interKeystrokeGapP50`.

#### Scenario: Compute average hold time

- GIVEN hold durations [30, 50, 70] ms
- WHEN avgHoldTime is computed
- THEN the result MUST be 50 ms

#### Scenario: Compute percentile hold time

- GIVEN 100 keystrokes with varying hold times
- WHEN holdTimeP95 is computed
- THEN it MUST return the 95th percentile

### Requirement: Accuracy and Precision

The system SHALL compute per-session:

```
interface SessionMetrics {
  duration: number; totalKeystrokes: number;
  wpm: number; accuracy: number; precision: number;
  errors: ErrorCountByCategory; timing: TimingMetrics | null;
}
```

Accuracy = `(total - errors) / total * 100`; Precision = `(total - wrongFinger) / total * 100`.

#### Scenario: Compute accuracy

- GIVEN 100 keystrokes, 5 errors
- WHEN accuracy is computed
- THEN accuracy MUST be 95%

#### Scenario: Compute precision

- GIVEN 100 keystrokes, 3 wrong-finger, 2 wrong-key
- WHEN precision is computed
- THEN precision MUST be 97% (only wrong-finger counts)

#### Scenario: Zero keystrokes

- GIVEN 0 keystrokes
- WHEN accuracy is computed
- THEN accuracy MUST be 100%

### Requirement: Cumulative Progress Tracking

The system SHALL aggregate across sessions: `totalSessions`, `totalPracticeTime`, `avgWpm`/`avgAccuracy`/`avgPrecision`, `bestWpm`/`bestAccuracy`.

#### Scenario: Aggregate across sessions

- GIVEN 3 sessions: [WPM: 30, Acc: 95], [WPM: 35, Acc: 92], [WPM: 40, Acc: 90]
- WHEN cumulative metrics are computed
- THEN avgWpm MUST be 35, avgAccuracy MUST be 92.3%, bestWpm MUST be 40

### Requirement: Heatmap Readiness

Each keystroke MUST retain `scancode`, `error`, and `holdDuration` for future heatmap visualization.

#### Scenario: Store raw data

- GIVEN a session with keystrokes
- WHEN keystrokes are recorded
- THEN each MUST retain scancode, error type, and hold duration

## REMOVED Requirements

None.

## RENAMED Requirements

None.
