# Design: Exercise Catalog

## Technical Approach

Add exercise-driven training to the existing keyboard-training app. A new `exerciseStore` (Zustand) owns exercise state; `useEventCapture` gets optional target-validation props; `TrainingPage` wires the exercise UI layer (selector, display, post-session overlay); `SettingsPage` switches to dynamic layout list; `sessionStore.stop()` annotates persisted sessions with exercise fields.

**Key principle**: exercise flow is additive — the existing keyboard-training flow continues working without `targetText` on `useEventCapture`. The exercise mode is opt-in via `exerciseStore.currentExerciseId`.

## Architecture Decisions

### Decision: exerciseStore is independent of sessionStore

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Merge exercise state into sessionStore | Simpler wiring but couples exercises to session lifecycle; harder to select exercise before starting | **Separate stores** — exercises are a concern orthogonal to session timing |

**Rationale**: Exercises can be selected, reset, and viewed before the session starts. `sessionStore.start()` should check whether an exercise is active and enable target validation; `sessionStore.stop()` reads exercise fields from `exerciseStore`.

### Decision: Validation is side-channel only

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Validation modifies `KeystrokeEvent.error` field | Tightly couples exercise validation to finger-detection; validation errors and finger errors are conceptually different | **Side-channel `onValidation` callback** — validation results flow to `exerciseStore`, not `KeystrokeEvent` |

**Rationale**: Finger-detection errors and target-validation errors serve different purposes. The spec requires "validation doesn't modify keystroke". `onValidation` fires before `onKeystroke`, both callbacks run.

### Decision: Exercise catalog as static module

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Fetch from API | Flexibility but adds network dependency and loading states | **`src/data/exercises.ts`** — 9 exercises, no API, no new deps |

**Rationale**: The spec is about 9 static exercises. No dynamic creation, no per-user personalization. Static array is simpler and 0 dependencies.

### Decision: Character-level progress in exerciseStore

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Compute from keystrokes in sessionStore | Tightly coupled, sessionStore would need target text awareness | **exerciseStore owns `characterProgress[]`** — exerciseStore advances on `onValidation` callback from TrainingPage |

**Rationale**: Exercise progress (character states) is exercise-domain state, not session-domain state. The `exerciseStore` manages it directly via a `handleValidation` method.

### Decision: PostSessionSummary as inline overlay in TrainingPage

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Modal dialog (portal) | Requires additional UI primitives, focus trapping | **Absolute-positioned overlay** in TrainingPage — uses existing Card/Button primitives, simpler to test, no portal needed |

**Rationale**: The app already uses inline overlays (BreakReminderOverlay). Consistency with existing patterns.

## Data Flow

```
ExerciseSelector ──selectExercise(id)──→ exerciseStore
exerciseStore.selectExercise(id)
  ├─ reads exercise from catalog (imported)
  ├─ sets currentExerciseId, targetText, characterProgress[]
  └─ sets currentIndex = 0, completed = false

TrainingPage
  ├─ exerciseStore → ExerciseSelector (pass exercises, selectedId)
  ├─ exerciseStore → ExerciseDisplay (target, characterStates, currentIndex)
  ├─ exerciseStore.handleValidation(idx, correct, exp, act)
  └─ onValidation → exerciseStore.handleValidation(...)

useEventCapture
  ├─ targetText from exerciseStore.targetText
  ├─ onValidation(idx, correct, exp, act) → exerciseStore.handleValidation(...)
  └─ onKeystroke → sessionStore.recordKeystroke(...)

sessionStore.stop()
  ├─ reads exerciseStore.currentExerciseId
  ├─ reads exerciseStore.exerciseResult?.accuracy
  └─ persists PersistedSession with exerciseId + exerciseAccuracy
```

## File Changes

### New Files

| File | Description |
|------|-------------|
| `src/data/exercises.ts` | Exercise catalog: 9 Exercise objects with target text, types, levels, focus areas |
| `src/stores/exerciseStore.ts` | Zustand store: current exercise, target text, character progress, result, exercises |
| `src/components/ExerciseSelector.tsx` | Grid of exercise cards with type/level filters |
| `src/components/ExerciseDisplay.tsx` | Target text with character-level rendering (pending/current/correct/incorrect/corrected + cursor) |
| `src/components/PostSessionSummary.tsx` | Post-training overlay: WPM, accuracy, errors, top 3 errors, recommendations |
| `src/lib/recommendations.ts` | Pure function: `getRecommendations(metrics): TrainingRecommendation[]` |
| `src/lib/exerciseValidation.ts` | Pure function: validate character against target text (used by exerciseStore) |

### Modified Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `exerciseId: string \| null` and `exerciseAccuracy: number \| null` to `PersistedSession`. Add `"expected-finger-zone-error"` to `ErrorType` union (keep `"wrong-finger"` as deprecated alias). |
| `src/core/capture/eventCapture.ts` | Add `targetText?: string` and `onValidation?: (index: number, correct: boolean, expected: string, actual: string) => void` to `UseEventCaptureOptions`. Track `currentIndexRef`. On keydown: if `targetText`, validate `event.key === targetText[currentIndexRef.current]`. On backspace: decrement if > 0. Call `onValidation` before `onKeystroke`. |
| `src/pages/TrainingPage.tsx` | Add exercise flow: ExerciseSelector, ExerciseDisplay, stats row (exercise accuracy), controls wired to exerciseStore, PostSessionSummary overlay. Pass `targetText` and `onValidation` to `useEventCapture` when exercise is active. |
| `src/pages/SettingsPage.tsx` | Replace hardcoded layout options with dynamic list from `layoutRegistry.getLayoutIds()` + `useLayoutStore.getState().customLayouts`. Deduplicate. Show all in Select. |
| `src/stores/sessionStore.ts` | On `stop()`: read `exerciseId` and `exerciseAccuracy` from `exerciseStore`, include in `PersistedSession`. |
| `src/core/session/sessionEngine.ts` | No changes — exercise validation is separate from finger detection. |
| `src/core/analytics/metrics.ts` | No changes — exercise accuracy is computed in exerciseStore, not session engine. |

## Interfaces / Contracts

### exerciseStore.ts

```ts
interface ExerciseResult {
  correctCount: number;
  incorrectCount: number;
  totalTyped: number;
  accuracy: number;
  errors: { charIndex: number; expected: string; typed: string }[];
}

interface ExerciseSlice {
  currentExerciseId: string | null;
  currentExercise: Exercise | null;
  targetText: string;
  characterProgress: TargetCharState[];
  currentIndex: number;
  result: ExerciseResult | null;
  completed: boolean;

  selectExercise(id: string): void;
  resetExercise(): void;
  handleValidation(charIndex: number, correct: boolean, expected: string, actual: string): void;
  completeExercise(): void;
  getExercise(): Exercise | null;
  getExerciseAccuracy(): number | null;
  resetAll(): void;
}
```

### ExerciseDisplay.tsx

```tsx
interface ExerciseDisplayProps {
  target: string;
  characterStates: TargetCharState[];
  currentIndex: number;
  className?: string;
}
// Renders: <span> per character, each styled by state.
// Current char: cursor indicator (underline + blink animation)
// Correct: green text
// Incorrect: red text
// Corrected: yellow/green (backspaced then re-typed correct)
// Pending: muted gray
```

### ExerciseSelector.tsx

```tsx
interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}
// Renders: grid of cards (type + level filter dropdowns above).
// Each card: title, description (truncated), level Badge, type Badge, click handler.
// Filters use local state (presentational component).
```

### PostSessionSummary.tsx

```tsx
interface PostSessionSummaryProps {
  metrics: SessionMetrics | null;
  exerciseId: string | null;
  exerciseAccuracy: number | null;
  recommendations: TrainingRecommendation[];
  onClose: () => void;
  onNewExercise: () => void;
}
// Renders: overlay with Card grid showing WPM, accuracy, keystrokes, error count,
// top 3 errors by key (with counts), top 3 finger zones (with counts),
// recommendation cards, "New Exercise" and "Settings" buttons.
```

### useEventCapture extension

```ts
interface UseEventCaptureOptions {
  onKeystroke?: (event: KeystrokeEvent) => void;
  fingerMap: FingerMap;
  activeLayer: string;
  enabled: boolean;
  // NEW (both optional):
  targetText?: string;
  onValidation?: (index: number, correct: boolean, expected: string, actual: string) => void;
}
```

### Recommendations

```ts
function getRecommendations(
  metrics: SessionMetrics | null,
  exercises: Exercise[]
): TrainingRecommendation[];
// Rules:
// 1. accuracy < 90% → precision recommendation (high priority)
// 2. errors.byKey contains symbols (non-alphanumeric) → symbols exercise (medium)
// 3. accuracy > 95% AND wpm > 30 → level advancement (medium)
// Returns 1-2 recommendations max, never 0 if metrics is non-null
// Returns [] if metrics is null
```

## Component Tree

```
TrainingPage
├── ExerciseSelector          ← new: browse & select exercises
│   ├── Select (type filter)
│   ├── Select (level filter)
│   └── Card × N (exercise cards)
├── ExerciseDisplay           ← new: target text with cursor
│   └── span × target.length (character-level spans)
├── StatsRow                  ← modified: add exercise accuracy stat
│   ├── StatCard: WPM
│   ├── StatCard: Accuracy (session)
│   ├── StatCard: Exercise Accuracy (new)
│   ├── StatCard: Keystrokes
│   └── StatCard: Time
├── Controls                  ← modified: exercise-aware state transitions
│   ├── Start/Restart button
│   ├── Pause/Resume button
│   └── Stop button
├── Keyboard SVG              ← unchanged
├── PostSessionSummary        ← new: modal overlay
│   ├── Metrics grid
│   ├── Error summary
│   ├── Recommendations list
│   ├── New Exercise button
│   └── Settings button
└── BreakReminderOverlay      ← unchanged
```

## State Management

| State | Store | Reason |
|-------|-------|--------|
| `currentExerciseId`, `characterProgress[]`, `currentIndex` | `exerciseStore` | Exercise lifecycle, independent of session |
| `session.state`, `metrics`, `keystrokes` | `sessionStore` | Session lifecycle (unchanged) |
| `layoutId`, `activeLayer` | `layoutStore` | Layout state (unchanged) |
| `mirrorMode`, `preferences` | `uiStore` | UI state (unchanged) |
| `fingerErrors`, `activeScancodes` | `keyboardStore` | Keyboard state (unchanged) |
| `breakReminder` | `useBreakReminder` hook | Break state (unchanged) |

**Cross-store communication**:
- `TrainingPage` reads both stores, wires them together
- `sessionStore.stop()` reads from `exerciseStore` via `useExerciseStore.getState()`
- `useEventCapture` fires `onValidation` → `TrainingPage` calls `exerciseStore.handleValidation()`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit: exerciseStore** | selectExercise sets state; handleValidation advances index & marks chars; resetExercise clears; completeExercise sets result | Zustand store testing with `useExerciseStore.setState()` assertions |
| **Unit: exerciseValidation.ts** | Correct char → correct=true; incorrect → correct=false; case-sensitive; backspace at 0 no-op; backspace at N decrements | Pure function tests |
| **Unit: recommendations.ts** | accuracy<90 → precision; accuracy>95+wpm>30 → advance; symbol errors → symbols; null → []; exactly 90 → no precision | Pure function tests |
| **Unit: exercise catalog** | 9 exercises exported; unique IDs; 4+ types; 4+ levels; non-empty targets | Import + assertions |
| **Unit: useEventCapture** | No validation when targetText omitted; validation fires before onKeystroke; backspace doesn't fire validation; multiple instances isolated | vi.fn() spies on callbacks, fire synthetic events |
| **Component: ExerciseSelector** | Renders N cards; filters by type/level; click calls onSelect; click same re-selects | @testing-library/react, click, queryByText |
| **Component: ExerciseDisplay** | Renders target chars with correct CSS classes per state; cursor on current char | Render, assert className per span |
| **Component: PostSessionSummary** | Shows WPM/accuracy/errors; shows top 3 errors; shows recommendations; buttons call callbacks | Render, assert text, click buttons, spy |
| **Integration: TrainingPage** | Exercise flow: select → display target → type → see feedback → stop → see summary | Full page render with mocked stores |
| **Regression: all 171** | Existing tests pass | `npm test` |

**New test files** (estimated 9):
- `src/stores/exerciseStore.test.ts`
- `src/lib/exerciseValidation.test.ts`
- `src/lib/recommendations.test.ts`
- `src/components/ExerciseSelector.test.tsx`
- `src/components/ExerciseDisplay.test.tsx`
- `src/components/PostSessionSummary.test.tsx`
- `src/data/exercises.test.ts`
- `src/core/capture/eventCapture.validation.test.ts` (new validation tests for eventCapture)
- `src/pages/TrainingPage.exercise.test.tsx` (exercise flow tests)

## ErrorType Extension

```ts
// types/index.ts line 14 — MODIFIED:
export type ErrorType = 'wrong-finger' | 'wrong-key' | 'missed' | 'double' | 'expected-finger-zone-error';
// 'wrong-finger' kept for backward compatibility, deprecated.
```

In `metrics.ts` aggregation, old `'wrong-finger'` errors are counted in `byFinger` as before. The new `'expected-finger-zone-error'` is a distinct category for finger-zone mismatches. If a future refactor migrates old data, a simple map can be applied.

## PersistedSession Extension

```ts
// types/index.ts — MODIFIED:
export interface PersistedSession {
  id: string;
  layoutId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  totalKeystrokes: number;
  wpm: number;
  accuracy: number;
  precision: number;
  errors: ErrorCountByCategory;
  createdAt: number;
  // NEW:
  exerciseId?: string | null;
  exerciseAccuracy?: number | null;
}
```

Both fields are optional (no DB migration needed). Existing IndexedDB sessions without these fields will read with `undefined`, which the UI handles as "no exercise".

## Settings Dynamic Layout List

```tsx
// SettingsPage.tsx — MODIFIED:
const layoutOptions = useMemo(() => {
  const builtin = layoutRegistry.getLayoutIds(); // ['qwerty-es', 'colemak', 'colemak-dh', 'dvorak', 'custom']
  const custom = Object.keys(useLayoutStore.getState().customLayouts);
  const all = [...builtin, ...custom];
  // Deduplicate while preserving order
  const seen = new Set<string>();
  return all.filter(id => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}, []);
// Pass to Select: layoutOptions.map(id => ({ value: id, label: id }))
```

## Open Questions

- [ ] Exercise completion: should exercise auto-complete when all characters are typed correctly, or does the user need to press Stop? **Recommendation**: auto-complete when `currentIndex === targetText.length` AND all chars are correct. User can still press Stop for partial sessions.
- [ ] What happens to the existing keyboard-training flow (no exercise)? The `useEventCapture` without `targetText` works as before. TrainingPage should show the existing keyboard-only UI when no exercise is selected, or always show exercise mode. **Recommendation**: Exercise mode is the new default; keyboard-only mode remains accessible via Settings (select "free" exercise type or no exercise = keyboard training).

## Review Workload Guard

**400-line budget risk**: Medium — exercise flow touches TrainingPage (existing 257 lines), adds ~5 new files (~600 LOC total).
- **Decision needed before apply**: No — design is complete.
- **Chained PRs recommended**: Yes — split into: (1) exercise store + catalog + types, (2) event capture extension + ExerciseDisplay, (3) TrainingPage wiring + ExerciseSelector, (4) PostSessionSummary + recommendations + Settings fix + session persistence extension.
- **Estimated total changes**: ~5 new files + 5 modified files, ~600-800 LOC additions, ~50 LOC modifications.
