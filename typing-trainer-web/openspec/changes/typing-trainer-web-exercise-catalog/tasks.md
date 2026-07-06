# Tasks: Exercise-Based Training Overhaul

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~650–800 LOC additions |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Exercise data, store, validation, recommendations | PR 1 | base: main; tests/docs included |
| 2 | UI components + Settings layout fix | PR 2 | base: PR 1 branch; independent UI |
| 3 | Event capture + TrainingPage integration | PR 3 | base: PR 2 branch; integration |
| 4 | Session persistence + polish + compat | PR 4 | base: PR 3 branch; final glue |

## Phase 1: Foundation (Slice 1 — PR 1)

- [ ] T01 Create exercise catalog data
  - File: `src/data/exercises.ts` (NEW)
  - Export `EXERCISE_CATALOG: readonly Exercise[]` with 9 exercises
  - IDs: `home-row-1`, `letters-1`, `letters-2`, `symbols-1`, `symbols-2`, `code-1`, `code-2`, `spanish-1`, `spanish-2`
  - Each exercise has: id, title, description, level, type, target (target text string), focus array, estimatedDurationSec
  - Types: home-row, letters, symbols, code, spanish
  - Levels: beginner, basic, intermediate, advanced, expert
  - Focus values: left-hand, right-hand, index, middle, ring, pinky, thumb, accuracy, speed, symbols, programming
  - All IDs unique, all types valid ExerciseType, no duplicates
  - Test: `src/data/exercises.test.ts` — catalog has 9 items, all IDs unique, all types in ExerciseType union, all targets non-empty strings

- [ ] T02 Create exercise Zustand store
  - File: `src/stores/exerciseStore.ts` (NEW)
  - Zustand store with slice: `ExerciseSlice`
  - State: `{ selectedExerciseId: string | null; currentTarget: string; currentIndex: number; charStates: TargetCharState[]; totalErrors: number; totalKeystrokes: number }`
  - Actions:
    - `selectExercise(id: string)` — set selectedExerciseId, reset target/text/index/charStates
    - `onKeystroke(scancode: string, key: string)` — validate char at currentIndex, update charStates, increment counters, return `{ correct: boolean; expected: string; actual: string } | null`
    - `resetSession()` — reset charStates, currentIndex, totalErrors, totalKeystrokes
    - `getExercise(): Exercise | undefined` — lookup from EXERCISE_CATALOG
    - `getCharacterStates(): TargetCharState[]` — return current charStates
  - When currentIndex reaches target length, auto-complete: set remaining chars to 'correct', return null from onKeystroke
  - Test: `src/stores/exerciseStore.test.ts` — selectExercise sets state, onKeystroke correct/incorrect updates, resetSession resets state, getExercise returns catalog item, auto-complete works, case-sensitive matching

- [ ] T03 Create exercise validation helper
  - File: `src/lib/exerciseValidation.ts` (NEW)
  - Pure function: `validateKeystroke(targetChar: string, pressedKey: string, scancode: string): { correct: boolean; expected: string; actual: string }`
  - Case-sensitive comparison: targetChar === pressedKey
  - For backspace: if scancode includes 'BSPC', return `{ correct: false, expected: targetChar, actual: '<backspace>' }`
  - Test: `src/lib/exerciseValidation.test.ts` — correct key returns correct=true, incorrect key returns correct=false, case-sensitive (A≠a), backspace returns correct=false, special characters handled

- [ ] T04 Create recommendation engine
  - File: `src/lib/recommendations.ts` (NEW)
  - Pure function: `generateRecommendations(metrics: { wpm: number; accuracy: number; totalKeystrokes: number; errors: Record<string, number>; exerciseType: string }): TrainingRecommendation[]`
  - Rules:
    - accuracy < 90% → "Focus on accuracy before speed" priority high
    - symbol errors detected → "Practice symbol exercises" priority medium
    - finger zone errors (byKey high counts) → "Work on finger zone transitions" priority medium
    - wpm < 20 AND accuracy > 90% → "You're accurate but slow — try timed drills" priority low
    - backspace count > 10% of keystrokes → "Reduce backspaces by typing more carefully" priority high
  - Each recommendation has: title, reason, exerciseId (suggested exercise from catalog), priority
  - Test: `src/lib/recommendations.test.ts` — low accuracy produces accuracy recommendation, symbol errors produce symbol recommendation, high accuracy+low wpm produces speed recommendation, backspace threshold works, empty metrics returns no recommendations

- [ ] T05 Extend types
  - File: `src/types/index.ts` (MODIFIED)
  - Add to `PersistedSession`: `exerciseId?: string; exerciseAccuracy?: number`
  - Add `wrong-finger-zone` to ErrorType union (keep `wrong-finger` as backward-compat alias)
  - ErrorType becomes: `'wrong-finger' | 'wrong-finger-zone' | 'wrong-key' | 'missed' | 'double'`
  - `wrong-finger` remains valid (alias for backward compat in detectError)
  - Test: `src/types/index.test.ts` — add test that PersistedSession has optional exerciseId and exerciseAccuracy, ErrorType includes all variants

## Phase 2: UI Components (Slice 2 — PR 2)

- [ ] T06 Create ExerciseSelector component
  - File: `src/components/ExerciseSelector.tsx` (NEW)
  - Props: `{ onSelect: (id: string) => void; selectedId?: string }`
  - Renders: `<Select>` component populated from EXERCISE_CATALOG
  - Groups exercises by type (home-row, letters, symbols, code, spanish)
  - Shows level badge next to each option
  - On selection, calls onSelect(id)
  - Test: `src/components/ExerciseSelector.test.tsx` — renders all exercise options, onSelect called on selection, selectedId highlights option, groups by type visible

- [ ] T07 Create ExerciseDisplay component
  - File: `src/components/ExerciseDisplay.tsx` (NEW)
  - Props: `{ targetText: string; charStates: TargetCharState[]; className?: string }`
  - Renders: target text with character-level coloring
  - States: pending=default, current=bright highlight + blinking cursor, correct=green, incorrect=red, corrected=dimmed green
  - Cursor: underline or pipe character `|` on current position
  - Uses monospace font, appropriate size
  - Test: `src/components/ExerciseDisplay.test.tsx` — renders target text, correct chars green, incorrect chars red, current position highlighted, cursor visible at position 0

- [ ] T08 Create PostSessionSummary component
  - File: `src/components/PostSessionSummary.tsx` (NEW)
  - Props: `{ wpm: number; accuracy: number; totalKeystrokes: number; errors: Record<string, number>; recommendations: TrainingRecommendation[]; exerciseTitle: string; onClose: () => void }`
  - Renders modal/overlay with:
    - Header: session title + exercise name
    - Stats row: WPM, accuracy %, total keystrokes
    - Error list (top 5 by count) with scancode → friendly label
    - Recommendations list with priority badges (high=red, medium=yellow, low=green)
    - Close button
  - Test: `src/components/PostSessionSummary.test.tsx` — renders stats, renders recommendations, close button calls onClose, error list shows top errors, priority badges rendered

- [ ] T09 Fix SettingsPage layout selector
  - File: `src/pages/SettingsPage.tsx` (MODIFIED)
  - Replace hardcoded layout Select options with dynamic list
  - Import `layoutRegistry.getLayoutIds()` 
  - Map each layout ID to `{ value: id, label: layout.name }`
  - All layouts visible: built-in + custom
  - Safe deletion: built-in layouts cannot be selected for deletion (use `layoutRegistry.delete()` guard)
  - Test: `src/pages/SettingsPage.test.tsx` — add test that Settings renders all layout IDs, custom layouts included in selector

## Phase 3: Integration (Slice 3 — PR 3)

- [ ] T10 Add optional validation props to eventCapture
  - File: `src/core/capture/eventCapture.ts` (MODIFIED)
  - Extend `UseEventCaptureOptions` interface:
    - `targetText?: string` — if provided, exercise mode active
    - `onValidationResult?: (result: { correct: boolean; expected: string; actual: string }) => void` — callback for each keystroke
  - If `targetText` provided:
    - Track current character index
    - On each keydown, validate pressed key against targetText[currentIndex]
    - Call `onValidationResult` with validation result
    - Backspace handling: detect 'Backspace' or 'BSPC', mark as incorrect
    - After correct key, advance index
    - If index reaches end, do NOT advance (free mode behavior preserved)
  - If `targetText` NOT provided: behave exactly as before (free typing)
  - Return `currentIndex` from hook alongside `reset`
  - Test: `src/core/capture/eventCapture.test.ts` — without targetText behaves as before, with targetText validates correct key, with targetText marks incorrect key, backspace handled, backward compat test (no targetText)

- [ ] T11 Wire exercise store into TrainingPage
  - File: `src/pages/TrainingPage.tsx` (MODIFIED)
  - Import exerciseStore: `const { selectedExerciseId, selectExercise, resetSession, getExercise, getCharacterStates, currentTarget, currentIndex } = useExerciseStore()`
  - Import ExerciseSelector component, show above keyboard or in a sidebar
  - Import ExerciseDisplay component, show when exercise is selected
  - Wire onValidationResult to exerciseStore.onKeystroke
  - When exercise active: use exerciseStore for keystroke tracking; when no exercise: use free mode
  - handleStart: if exercise selected, call resetSession() before session start
  - Free mode: no exercise selected, page works exactly as before (existing behavior preserved)
  - Test: `src/pages/TrainingPage.test.tsx` — add test with exercise selected shows selector, add test with exercise shows display, add test without exercise renders as before (backward compat), add test keypress validates against exercise target

- [ ] T12 Add PostSessionSummary overlay in TrainingPage
  - File: `src/pages/TrainingPage.tsx` (MODIFIED, continuation of T11)
  - Import PostSessionSummary component
  - Import recommendations: `import { generateRecommendations } from '@/lib/recommendations'`
  - On session stop (handleStop), compute recommendations from metrics
  - Show PostSessionSummary overlay when: (a) session was exercise-based AND stopped, or (b) user requests to see summary
  - Use a state flag `showSummary: boolean` controlled by onClose in PostSessionSummary
  - Overlay should appear below keyboard, not cover it
  - Test: `src/pages/TrainingPage.test.tsx` — summary appears after stop with exercise, summary can be closed, summary shows correct metrics

## Phase 4: Persistence & Polish (Slice 4 — PR 4)

- [ ] T13 Extend sessionStore.stop() with exercise metadata
  - File: `src/stores/sessionStore.ts` (MODIFIED)
  - Import exerciseStore to check if exercise is active
  - In `stop()`, after building `persistedSession`:
    - If exerciseStore has selectedExerciseId, add `exerciseId` and `exerciseAccuracy` to persistedSession
    - exerciseAccuracy = accuracy (from metrics)
  - Test: `src/stores/sessionStore.test.ts` — add test that stop() with exercise sets exerciseId and exerciseAccuracy in persistedSession

- [ ] T14 Verify persisted session persistence
  - File: `src/stores/sessionStore.test.ts` (MODIFIED, continuation of T13)
  - Add test: persisted session includes exerciseId when exercise was active
  - Add test: persisted session has undefined exerciseId when no exercise was active (backward compat)
  - Add test: legacy sessions without exerciseId are still loadable (read from DB, exerciseId is optional)

- [ ] T15 Integration test: full exercise flow
  - File: `src/tests/integration/exerciseFlow.test.ts` (NEW)
  - Test the complete user flow:
    1. Select exercise from catalog
    2. Start training session
    3. Type correct characters (verify ExerciseDisplay updates)
    4. Type incorrect character (verify error recorded)
    5. Stop session
    6. Verify PersistedSession has exerciseId and exerciseAccuracy
    7. Verify recommendations generated
    8. Verify session appears in storage
  - Test: full flow completes without errors, backward compat (free mode still works)
