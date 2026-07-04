# Tasks: typing-trainer-web Phase 1a — Mirror Mode

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250-320 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (delivery: exception-ok) |
| Delivery strategy | exception-ok |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: uiStore slice + Progress component | PR 1 | Infrastructure + UI primitive |
| 2 | Keyboard fade: opacity prop on SvgKeyboard | PR 2 | Visual layer, depends on PR 1 state |
| 3 | TrainingPage wiring: toggle + progress bar + logic | PR 3 | Integration layer, depends on PR 1-2 |
| 4 | Verification: integration test | — | Tests all phases |

## Phase 1: Foundation — Progress Component + uiStore

- [ ] task-26: Create `src/components/ui/progress.tsx` — shadcn Progress component with `indicator` slot, `transition-all` on indicator bar, accepts `value` number prop (0-100), uses `cn()` from utils. Export as named `Progress`. Test renders at 0%, 50%, 100%. (~40 lines)
  - Files: `src/components/ui/progress.tsx` (new)
  - Dependencies: none
  - Testing: renders bar with correct width for value prop, accessible `role="progressbar"`
  - Acceptance: `<Progress value={50}>` shows 50% filled bar, zero TypeScript errors

- [ ] task-27: Add mirrorMode state to `src/stores/uiStore.ts` — add `mirrorMode: { enabled: boolean; progress: number }` to UISlice with defaults `{ enabled: false, progress: 0 }`, methods: `toggleMirrorMode()` (toggles enabled), `incrementMirrorProgress()` (adds 2%, caps at 100), `resetMirrorMode()` (enabled=false, progress=0), `setMirrorOpacity()` (not needed — opacity computed inline). Add `MIN_OPACITY = 0.08` constant. (~30 lines)
  - Files: `src/stores/uiStore.ts` (modify)
  - Dependencies: none
  - Testing: toggle flips enabled, incrementProgress goes 0→2→4...→100, reset restores defaults, progress caps at 100
  - Acceptance: All 4 methods work correctly, type-checks, mirrorMode accessible via `useUISlice`

## Phase 2: Keyboard Fade — Opacity Prop

- [ ] task-28: Add `opacity` prop to `src/components/keyboard/SvgKeyboard.tsx` — accept `opacity?: number` in `SvgKeyboardProps`, apply `style={{ opacity }}` to the root `<div>` wrapper (not the SVG itself, so key interactions still work), add `transition-opacity duration-300` className, apply `ghost-mode` class when opacity < 0.2. Keep existing className prop. (~20 lines)
  - Files: `src/components/keyboard/SvgKeyboard.tsx` (modify)
  - Dependencies: task-26, task-27
  - Testing: opacity prop passed as style, ghost-mode class applied when opacity < 0.2, no class when >= 0.2
  - Acceptance: Keyboard fades smoothly, ghost-mode class applied correctly, no layout shift

## Phase 3: TrainingPage Integration

- [ ] task-29: Update `src/pages/TrainingPage.tsx` — add Mirror Mode toggle (Switch from ui/switch.tsx) in stats bar or controls area, add Progress bar below toggle (visible only when enabled), connect keyboard opacity via `opacity = max(0.08, 1.0 - progress/100 * (1.0 - 0.08))`, wire `incrementMirrorProgress` on correct keystroke (when `event.error` is undefined), reset mirror mode on `init()` (new session) and `setLayout()` (layout change). Use Zustand selector to subscribe to `mirrorMode` state. Add layoutId change detection via effect comparing `useLayoutStore.getState().layoutId`. (~80 lines)
  - Files: `src/pages/TrainingPage.tsx` (modify)
  - Dependencies: task-27, task-28
  - Testing: toggle enables/disables mode, progress bar visible only when enabled, opacity calculated correctly at 0/50/100% progress, resets on session init and layout change
  - Acceptance: Full UI wire-up works, keyboard fades in real-time, correct keystrokes advance progress, errors don't, layout switch resets

## Phase 4: Verification

- [ ] task-30: Write integration test — test mirror mode toggle on/off, progress increments on correct keystrokes (`error === undefined`), progress stays unchanged on incorrect keystrokes (`error === 'wrong-key'`), reset on layout change, reset on new session, ghost-mode class applied at opacity < 0.2, ghost-mode removed when mode disabled. Use vitest + @testing-library/react. (~80-100 lines)
  - Files: `src/pages/TrainingPage.test.tsx` (new)
  - Dependencies: task-29
  - Testing: all scenarios from mirror-mode-ui, mirror-mode-visual, mirror-mode-logic specs
  - Acceptance: All spec scenarios pass, no TypeScript errors, test runs in CI

## Implementation Order Summary

```
task-26 (Progress component) ──┐
task-27 (uiStore mirrorMode) ──┤
                                 → task-28 (SvgKeyboard opacity) → task-29 (TrainingPage wiring) → task-30 (Integration test)
task-28 depends on 26, 27      │
task-29 depends on 27, 28      │
task-30 depends on 29          │
```

## Estimated PR Size

| Task | Est. Lines |
|------|-----------|
| task-26 (Progress component) | ~40 |
| task-27 (uiStore mirrorMode) | ~30 |
| task-28 (SvgKeyboard opacity) | ~20 |
| task-29 (TrainingPage wiring) | ~80 |
| task-30 (Integration test) | ~80-100 |
| **Total** | **~250-270** |

**Risk**: ~250-270 lines fits within 400-line budget comfortably. Single PR is safe. Medium risk from the opacity formula correctness and the correct-keystroke detection integration (the event capture already records `error` field, so this should be straightforward).

## Next Step

Ready for `sdd-apply` (implementation phase).
