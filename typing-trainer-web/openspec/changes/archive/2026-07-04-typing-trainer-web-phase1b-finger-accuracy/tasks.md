# Tasks: Phase 1b — Finger Accuracy

## Review Workload Forecast

Est: ~550–650 lines | Risk: High | Single PR (exception-ok) | No chains.
Units: Phase 1–2→base, Phase 3–4→cont, Phase 5→final.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

## Phase 1: Error Tracking Foundation

- [x] task-31: Add error tracking to keyboardStore
  Files: `src/stores/keyboardStore.ts` | Deps: none | Test: Unit tests for fingerErrors, recordError(), getErrorCount(), resetErrors()
  Accept: `fingerErrors: Record<string,number>` defaults `{}`; recordError(s) increments; getErrorCount(s) returns count (0); resetErrors() clears | R-Track-1–4 | ~20 LOC

- [x] task-32: Wire error reset on session init
  Files: `src/stores/sessionStore.ts` | Deps: task-31 | Test: init() calls keyboardStore.resetErrors()
  Accept: New session clean; no error leak | R-Track-7 | ~3 LOC

## Phase 2: Detection Pipeline

- [x] task-33: Implement detectError comparison logic
  Files: `src/core/keyboard/fingerDetection.ts` | Deps: none | Test: match→undefined, mismatch→'wrong-finger', unknown→undefined
  Accept: Compares actualFinger vs expectedFinger; returns 'wrong-finger' when known & different | R-Quality-1–3 | ~5 LOC

- [x] task-34: Populate actualFinger optimistically in eventCapture
  Files: `src/core/capture/eventCapture.ts` | Deps: task-33 | Test: handleKeyDown/keyup set optimistic expectedFinger
  Accept: Both handlers use optimistic expectedFinger, not 'unknown'/'other' | R-Quality-4 | ~5 LOC

- [x] task-35: Fix sessionEngine stop() column
  Files: `src/core/session/sessionEngine.ts` | Deps: task-34 | Test: Error at col 7 → recordError(col=7) → byHand.right++
  Accept: Replace `col = 1` with col from KeystrokeEvent.column (optional) | R-Quality-5 | ~8 LOC

- [x] task-36: Route detectError in eventCapture
  Files: `src/core/capture/eventCapture.ts` | Deps: task-33,34 | Test: Pipeline complete
  Accept: handleKeyDown calls detectError(keystroke, expectedFinger) | R-Quality-1,2 | ~3 LOC

## Phase 3: Heatmap Visualization

- [x] task-37: Add error overlay in SvgKeyboard
  Files: `src/components/keyboard/SvgKeyboard.tsx` | Deps: task-31 | Test: <g class="error-heatmap"> with rects; opacity=0.15/count=1
  Accept: Subscribe fingerErrors; render <rect> per scancode; opacity=min(count×0.15,0.7); fill=#ef4444; direct <svg> child | R-UI-1–6 | ~30 LOC

- [x] task-38: Expose key positions from useKeyboardContent
  Files: `SvgKeyboard.tsx`, `useKeyboardContent.ts` | Deps: task-37 | Test: Overlay rects align with key positions
  Accept: useKeyboardContent returns keyPositions Map from layout keys × 44px | ~15 LOC

## Phase 4: TrainingPage Integration

- [x] task-39: Add Precision stat card to TrainingPage
  Files: `src/pages/TrainingPage.tsx` | Deps: none | Test: precision=85 → "85%"; no session → "0%"
  Accept: 5th grid item: metrics?.precision ?? 0, label "Precision", suffix "%" | R-Track-5,6 | ~5 LOC

- [x] task-40: Wire live error recording in TrainingPage
  Files: `src/pages/TrainingPage.tsx` | Deps: task-31,33,34 | Test: Wrong-finger → recordError(scancode) → visible
  Accept: After recordKeystroke, check event.error==='wrong-finger' → recordError(scancode) | R-Track-5,6 | ~5 LOC

## Phase 5: Verification

- [x] task-41: Write all tests
  Files: `src/core/keyboard/fingerDetection.test.ts` (new), `src/stores/keyboardStore.test.ts` (new), `src/core/session/sessionEngine.test.ts` (append), `src/components/keyboard/SvgKeyboard.test.tsx` (append), `src/tests/integration/fingerAccuracy.test.ts` (new)
  Deps: all tasks | Test: All spec scenarios — detectError 3 cases, keyboardStore 4 cases, sessionEngine column, SvgKeyboard overlay group/rects/opacity/pointerEvents, integration pipeline
  Accept: All 18 requirements + 20 scenarios verified. Tests cover: (1) fingerDetection: correct/wrong/unknown + modifier, (2) keyboardStore: init/record/get/reset, (3) sessionEngine: col 7 → byHand.right, (4) SvgKeyboard: overlay exists, rect count matches, opacity=min(count×0.15,0.7), pointerEvents=none, (5) integration: Init→wrong-finger→store→stop→precision<100 | ~155 LOC
