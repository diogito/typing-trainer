# Capability: Finger Accuracy Detection

## Purpose

Define requirements for detecting wrong-finger errors during typing sessions by comparing the expected finger against the actual finger used. This forms the detection layer of the finger accuracy subsystem.

---

### R-Quality-1: detectError MUST compare actualFinger against expectedFinger

The `detectError()` function in `src/core/keyboard/fingerDetection.ts` MUST compare the `actualFinger` field of a `KeystrokeEvent` against the `expectedFinger` parameter and return `'wrong-finger'` when they differ.

**Scenario**: Correct finger press
**Given** a keystroke event where `actualFinger` is `'index'` and `expectedFinger` is `'index'`
**When** `detectError(event, 'index')` is called
**Then** the function returns `undefined`

---

### R-Quality-2: detectError MUST return 'wrong-finger' for mismatched fingers

The `detectError()` function MUST return `'wrong-finger'` when `actualFinger` is known (not `'unknown'`) and does not equal `expectedFinger`.

**Scenario**: Wrong finger press
**Given** a keystroke event where `actualFinger` is `'pinky'` and `expectedFinger` is `'ring'`
**When** `detectError(event, 'ring')` is called
**Then** the function returns `'wrong-finger'`

---

### R-Quality-3: detectError MUST return undefined when actualFinger is unknown

The `detectError()` function MUST return `undefined` when `actualFinger` is `'unknown'`, since finger mismatch cannot be determined.

**Scenario**: Unknown finger — no detection possible
**Given** a keystroke event where `actualFinger` is `'unknown'`
**When** `detectError(event, 'index')` is called
**Then** the function returns `undefined`

---

### R-Quality-4: eventCapture MUST populate actualFinger using optimistic model

The `useEventCapture` hook MUST set `actualFinger` on every `KeystrokeEvent` using the optimistic model — defaulting to `expectedFinger` so the data pipeline is complete and `detectError()` has a value to compare.

**Scenario**: Keystroke with optimistic actualFinger
**Given** a user presses a key whose expected finger is `'middle'`
**When** `useEventCapture` emits the keystroke event
**Then** `event.actualFinger` is set to `'middle'`

---

### R-Quality-5: sessionEngine.stop() MUST use real layout column for error tracking

The `sessionEngine.stop()` method MUST pass the actual column from the keyboard layout to `recordError()`, replacing the current `col=1` placeholder, so that `byHand` aggregation in error counts is correct.

**Scenario**: Stop session with errors — column from layout
**Given** a session with a wrong-finger error on a key at column 7 (right half)
**When** `sessionEngine.stop()` is called
**Then** `recordError()` receives `col=7` (not `col=1`)
**And** `errorCount.byHand.right` is incremented

---
