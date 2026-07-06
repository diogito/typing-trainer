# Tasks: Platform Stabilization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150-200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (delivery: ask-on-risk) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Live metrics engine + display fixes | PR 1 | Core bug fixes, ~80 lines |
| 2 | Navigation fix | PR 2 | LayoutShell refactor, ~40 lines |
| 3 | Break reminder default + cleanup | PR 3 | Default change + test updates, ~30 lines |

## Phase 1: Live Metrics Engine (CRITICAL)

- [x] task-01: Add `computeLiveMetrics(endTime: number): Partial<SessionMetrics>` to `src/core/session/sessionEngine.ts`
  - Pure function, O(n) over keystrokes, no side effects
  - Computes: duration (active ms excluding pause), totalKeystrokes, wpm, accuracy, errors
  - Duration = (startTime - endTime) - pauseDuration, converted to seconds
  - WPM = (totalKeystrokes / 5) / (durationSeconds / 60)
  - Accuracy = ((totalKeystrokes - errors) / totalKeystrokes) * 100, returns 100 if no errors or 0 keystrokes
  - Errors: count keystrokes where `keystroke.error` is truthy
  - Must NOT mutate `this.state.metrics` or `this.state.state`
  - (~25 lines)

- [x] task-02: Update `src/stores/sessionStore.ts` `recordKeystroke()` to call `computeLiveMetrics(Date.now())`
  - After `engine.recordKeystroke(event)`, call `engine.computeLiveMetrics(Date.now())`
  - Set `metrics` on the store with the returned partial metrics
  - Ensures `sessionStore.metrics` is non-null during running sessions
  - Note: In the Zustand store, engine is accessed via `get().engine`, not `this.engine`
  - (~8 lines)

- [x] task-03: Add unit tests for `computeLiveMetrics()` in `src/core/session/sessionEngine.test.ts`
  - Test: 60 keystrokes in 60s active → wpm = 12 (60/5/1)
  - Test: 10 keystrokes, 2 errors → accuracy = 80%
  - Test: 0 keystrokes → wpm = 0, accuracy = 100
  - Test: verifies `this.state.metrics` remains null (no state mutation)
  - Test: verify duration excludes pause time when session is paused
  - (~60 lines)

## Phase 2: Training Page Display (HIGH)

- [x] task-04: Fix keystroke count display in `src/pages/TrainingPage.tsx`
  - Change `const ks = metrics?.totalKeystrokes ?? 0;` to `const ks = session.keystrokes.length;`
  - Works during running AND idle states without relying on metrics being non-null
  - (~1 line)

- [x] task-05: Fix elapsed time display in `src/pages/TrainingPage.tsx`
  - When `session.state === 'running'`: compute from `Date.now() - session.startTime!`
  - When `session.state !== 'running'`: use `metrics?.duration ?? 0`
  - Use `useEffect` + `setInterval` to update every 1000ms while running
  - Clean up interval on unmount
  - (~15 lines)

- [x] task-06: Fix Stop button visibility condition in `src/pages/TrainingPage.tsx`
  - Changed `{ks > 0 && session.state !== 'idle' && (` to rely on `ks = session.keystrokes.length`
  - Auto-satisfied by task-04 since `ks` now IS `session.keystrokes.length`
  - (~0 lines, implicit fix)

- [x] task-07: Add integration test — live metrics during running session
  - In `src/stores/sessionStore.test.ts` (create new file)
  - Create a minimal session: init → start → record keystrokes
  - Assert `sessionStore.metrics` is non-null after keystrokes
  - Verify wpm > 0 and accuracy is calculated
  - (~40 lines)

## Phase 3: Navigation Fix (HIGH)

- [x] task-08: Replace `<a href>` with TanStack Router `<Link>` in `src/components/LayoutShell.tsx`
  - Import `Link` from `@tanstack/react-router`
  - Import `BarChart, Settings, Monitor` from `lucide-react` (replace inline SVG definitions)
  - Replace `SidebarLink`: `<a href={href}>` → `<Link to={href}>`, remove inline icon defs, use lucide imports
  - Replace `NavButton`: `<a href={href}>` → `<Link to={href}>`, remove inline icon defs, use lucide imports
  - Remove the 3 inline icon functions (BarChart, Settings, Monitor) at bottom of file
  - Verified all route targets exist: `/` (index.tsx), `/progress` (progress.tsx), `/settings` (settings.tsx), `/layouts` (layouts.tsx), `/posture` (posture.tsx)
  - (~15 lines, net -20 due to removal of inline icons)

## Phase 4: Break Reminder Default + Cleanup (MEDIUM)

- [x] task-09: Change `DEFAULT_POSTURE.breakEnabled` from `false` to `true` in `src/types/index.ts`
  - Line 161: `breakEnabled: false,` → `breakEnabled: true,`
  - This is a one-line change with broad impact on break reminder behavior
  - (~1 line)

- [x] task-10: Update `src/hooks/useBreakReminder.test.ts` — "returns default state" test
  - Current test asserts `enabled` is false (line 33). With `breakEnabled: true` in DEFAULT_POSTURE, the default `enabled` will be `true`.
  - Changed `expect(result.current.enabled).toBe(false);` to `expect(result.current.enabled).toBe(true);`
  - (~1 line change)

- [x] task-11: Update `src/stores/postureStore.test.ts` — no breaking assertions
  - This test file references `DEFAULT_POSTURE` and `breakEnabled` but never asserts `breakEnabled` is `false` (line 63 asserts `toBe(true)` and line 37 sets `breakEnabled: true`). No changes needed.
  - (~0 lines)

## Verification

- Run: `cd /mnt/datos/workspaces/personal/random/typing-trainer-web && pnpm test -- --run`
- Verify: All existing tests pass (157+ tests)
- Verify: Build passes: `pnpm build`
- Manual QA: Start session → WPM should update in real-time → Stop button should appear after first keystroke → Navigate sidebar should use SPA routing → Break reminders should fire after 30 min

## Implementation Order Summary

```
Phase 1:
  task-01 (computeLiveMetrics) ──→ task-02 (wire in store) ──→ task-03 (tests)
  └─ Phase 1 must complete before Phase 2 display fixes work

Phase 2:
  task-04 (keystroke count) ──┐
  task-05 (elapsed time) ─────┼── independent of Phase 1
  task-06 (stop button) ──────┘
  task-07 (integration test) ─┘

Phase 3:
  task-08 (Link navigation) ── standalone, no deps

Phase 4:
  task-09 (default true) ──→ task-10 (test update) ── task-11 (verify no changes)
```

## Estimated PR Size

| Task | Est. Lines |
|------|-----------|
| task-01 (computeLiveMetrics) | ~25 |
| task-02 (store wiring) | ~8 |
| task-03 (engine tests) | ~60 |
| task-04 (keystroke count) | ~1 |
| task-05 (elapsed time) | ~15 |
| task-06 (stop button) | ~1 |
| task-07 (integration test) | ~40 |
| task-08 (navigation fix) | ~-5 (net due to icon removal) |
| task-09 (default change) | ~1 |
| task-10 (test update) | ~1 |
| task-11 (verify) | ~0 |
| **Total** | **~150-200** |

**Risk**: ~150-200 lines fits well within 400-line budget. Single PR is safe. Low risk changes — all are wiring/integration fixes with clear acceptance criteria. The only behavioral change beyond bug fixes is `breakEnabled: true` default, which is a deliberate health improvement.

## Next Step

Ready for `sdd-apply` (implementation phase). Ask-on-risk: orchestrator asks before apply since the delivery strategy is `ask-on-risk`.
