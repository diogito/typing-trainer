# Proposal: typing-trainer-web-exercise-catalog

## Intent

Convert typing-trainer-web from a keyboard-demo to a real typing trainer: select exercise → type target → live feedback → recommendations → persist.

## Scope

### In Scope
- Exercise catalog: 9 exercises (`src/data/exercises.ts`)
- Exercise store: `src/stores/exerciseStore.ts` — current exercise, target text, character progress, completed, result
- Target validation: `useEventCapture` optional `targetText` + `onValidation` callback
- ExerciseDisplay: target text with character-level correct/incorrect/cursor
- ExerciseSelector: filterable exercise grid
- PostSessionSummary: modal with metrics, errors, recs
- Recommendation engine: rule-based from `SessionMetrics`
- `PersistedSession` extension: `exerciseId`, `exerciseAccuracy`
- Settings: dynamic layout list via `layoutRegistry.getLayoutIds()`

### Out of Scope
WPM graph, dark mode, social/rankings, AI, camera, gamification, streaks, custom exercises, multi-language.

## Capabilities

### New Capabilities
- `exercise-catalog`: Static `Exercise[]` data
- `exercise-selection`: Exercise browsing and selection UI
- `target-validation`: Character-by-character `event.key` validation
- `post-session-summary`: Post-training modal with metrics and recs
- `exercise-recommendations`: Rule-based from session metrics

### Modified Capabilities
- `session-persistence`: `PersistedSession` gains `exerciseId: string | null`, `exerciseAccuracy: number | null`
- `settings-layout-selection`: `SettingsPage` uses `layoutRegistry.getLayoutIds()`
- `event-capture`: `useEventCapture` gains optional `targetText`, `onValidation` props

## Approach

**New files:**
- `src/data/exercises.ts` — `Exercise[]` array, ~9 exercises
- `src/stores/exerciseStore.ts` — Zustand, independent. State: `currentExercise`, `targetText`, `characterProgress[]`, `completed`, `exerciseResult`. Actions: `selectExercise()`, `resetExercise()`, `advanceCharacter()`, `completeExercise()`
- `src/components/ExerciseSelector.tsx` — Grid cards, filters type/level, click → `selectExercise()`
- `src/components/ExerciseDisplay.tsx` — `<span>` per char: pending/current/correct/incorrect/corrected, blinking cursor
- `src/components/PostSessionSummary.tsx` — Modal: WPM, accuracy, errors, top 3 key/finger, recs, buttons

**Modified files:**
- `src/core/capture/eventCapture.ts` — Optional `targetText?: string`, `onValidation?: (idx, correct, exp, act) => void`. Validate `event.key === targetText[index]`, backspace → prev 'pending'. Side-channel only.
- `src/types/index.ts` — Add `exerciseId: string | null`, `exerciseAccuracy: number | null` to `PersistedSession`. No DB schema change.
- `src/pages/TrainingPage.tsx` — Wire exercise store, target display, post-session overlay.
- `src/pages/SettingsPage.tsx` — Dynamic layout list via `layoutRegistry.getLayoutIds()`.
- `src/stores/sessionStore.ts` — On stop: include `exerciseId`, `exerciseAccuracy` in `PersistedSession`

**Recommendations:** accuracy < 90% → precision; symbol errors → symbols; finger concentration → zone; high accuracy → next level.

## Risks
- TrainingPage god component (High): Extract components, TrainingPage = wiring only
- Character/key mismatch (Medium): Use `event.key` (layout-aware), not `event.code`
- Breaking existing tests (Medium): All new props optional

## Rollback Plan
1. Remove new files: `exercises.ts`, `exerciseStore.ts`, `ExerciseSelector.tsx`, `ExerciseDisplay.tsx`, `PostSessionSummary.tsx`
2. Revert `eventCapture.ts`, `TrainingPage.tsx`, `SettingsPage.tsx`
3. Remove `exerciseId`/`exerciseAccuracy` from `PersistedSession` (IndexedDB backward-compatible)
4. All 171 existing tests should pass

## Success Criteria
- [ ] Exercise selection → type target → live feedback → post-session → persist
- [ ] Character-by-character rendering with correct/incorrect/cursor
- [ ] Recommendations match session performance
- [ ] Sessions persisted with exerciseId/exerciseAccuracy
- [ ] Settings lists all layouts including custom
- [ ] All 171 existing tests pass
