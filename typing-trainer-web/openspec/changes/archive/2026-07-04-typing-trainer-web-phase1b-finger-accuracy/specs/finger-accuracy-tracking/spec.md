# Capability: Finger Error Tracking

## Purpose

Define requirements for tracking per-key error counts, providing the data layer that powers the error heatmap and displaying a Precision metric in the training interface.

---

### R-Track-1: keyboardStore MUST track per-key error counts

The `keyboardStore` MUST maintain a `fingerErrors: Record<string, number>` field that maps scancodes to their accumulated error count.

**Scenario**: Error tracking initialized
**Given** the app loads
**When** `useKeyboardStore` is accessed
**Then** `state.fingerErrors` exists as `Record<string, number>`
**And** all scancodes map to `0` or are absent from the record

---

### R-Track-2: keyboardStore MUST provide recordError method

The `keyboardStore` MUST expose a `recordError(scancode: string): void` method that increments the error count for the given scancode, creating the entry with value `1` if it does not exist.

**Scenario**: Record first error
**Given** `fingerErrors` is `{}`
**When** `recordError('KC_A')` is called
**Then** `fingerErrors['KC_A']` becomes `1`

**Scenario**: Record second error for same key
**Given** `fingerErrors` is `{ KC_A: 2 }`
**When** `recordError('KC_A')` is called
**Then** `fingerErrors['KC_A']` becomes `3`

---

### R-Track-3: keyboardStore MUST provide getErrorCount method

The `keyboardStore` MUST expose a `getErrorCount(scancode: string): number` method that returns the current error count for the given scancode, defaulting to `0` if the scancode has no recorded errors.

**Scenario**: Query existing error count
**Given** `fingerErrors` is `{ KC_S: 1 }`
**When** `getErrorCount('KC_S')` is called
**Then** the result is `1`

**Scenario**: Query non-existent error count
**Given** `fingerErrors` is `{}`
**When** `getErrorCount('KC_Z')` is called
**Then** the result is `0`

---

### R-Track-4: keyboardStore MUST provide resetErrors method

The `keyboardStore` MUST expose a `resetErrors(): void` method that clears all error counts by setting `fingerErrors` to an empty object.

**Scenario**: Reset all error counts
**Given** `fingerErrors` is `{ KC_A: 3, KC_S: 1, KC_E: 5 }`
**When** `resetErrors()` is called
**Then** `fingerErrors` becomes `{}`

---

### R-Track-5: TrainingPage MUST display Precision stat card

The `TrainingPage` MUST render a stat card showing the session's `precision` value from `sessionStore.metrics`, positioned alongside the existing WPM, Accuracy, Keystrokes, and Time cards.

**Scenario**: Precision card visible after session
**Given** a session has been stopped with `metrics.precision = 85`
**When** `TrainingPage` renders
**Then** a stat card labeled "Precision" displays `85%`

---

### R-Track-6: Precision stat MUST show 0% when metrics is null

When no session has been completed, the Precision stat card MUST display `0%` rather than an error or blank value.

**Scenario**: Precision before any session
**Given** no session has been started or stopped
**When** `TrainingPage` renders
**Then** Precision card displays `0%`

---

### R-Track-7: Error counts MUST reset on new session

When `sessionStore.init()` is called (starting a new session), the `keyboardStore` MUST reset all error counts to ensure fresh tracking for the new session.

**Scenario**: Error counts cleared on init
**Given** `fingerErrors` is `{ KC_A: 3, KC_S: 1 }`
**When** `sessionStore.init('new-layout')` is called
**Then** `keyboardStore.fingerErrors` is reset to `{}`

---
