# Tasks: Phase 1e — Break Reminder Integration

## Review Workload Forecast
- Estimated changed lines: ~80-120
- 400-line budget risk: Low
- Chained PRs recommended: No
- Suggested split: Single PR

## Phase 1: Break Reminder Integration

- [x] task-1: Integrate useBreakReminder into TrainingPage — Import and use `useBreakReminder` hook in TrainingPage. Derive `isTyping` from `session.state === 'running'`. Call `handleStart` → `breakReminder.start()`, `handleStop` → `breakReminder.reset()`. Wire `onReminder` callback to show overlay
  - Files: `src/pages/TrainingPage.tsx` | Deps: none
  - Lines: ~20

- [x] task-2: Wire BreakReminderOverlay into TrainingPage JSX — Render `BreakReminderOverlay` inside TrainingPage's return JSX. Pass `active={breakReminder.active}`, `remaining={breakReminder.remaining}`, `formattedRemaining={breakReminder.formattedRemaining}`, `onDismiss={breakReminder.dismiss}`, `onPause={breakReminder.pause}`. The overlay auto-hides when not active
  - Files: `src/pages/TrainingPage.tsx` | Deps: task-1
  - Lines: ~10

- [x] task-3: Handle pause/resume for break timer — When session pauses (`handlePause` with `session.state === 'running'`), call `breakReminder.pause()`. When session resumes, the `useBreakReminder` hook's `isTyping` dependency naturally pauses/resumes the timer via its interval effect — no additional call needed
  - Files: `src/pages/TrainingPage.tsx` | Deps: task-1
  - Lines: ~10

- [x] task-4: Add tests — Create integration tests for break reminder in TrainingPage: Timer starts when session starts, Timer pauses when session pauses, Timer resets when session stops, BreakReminderOverlay appears after interval, Dismiss hides overlay and resets timer, Break reminder respects `breakEnabled` setting
  - Files: `src/pages/TrainingPage.test.tsx` (new) | Deps: task-1
  - Lines: ~50

- [x] task-5: Fix BreakReminderOverlay remaining display — Fix remaining display to use `formattedRemaining` instead of computing `remaining / 60`. The hook already provides `formattedRemaining` as a string
  - Files: `src/components/BreakReminderOverlay.tsx` | Deps: task-1
  - Lines: ~10

- [x] task-6: Run tests and verify build — Run `pnpm run test:run` and `pnpm run build`. Verify all tests pass and build is clean
  - Lines: N/A (verification)

## Estimated PR Size

| Task | Est. Lines |
|------|-----------|
| task-1 (Integrate useBreakReminder) | ~20 |
| task-2 (Wire BreakReminderOverlay) | ~10 |
| task-3 (Handle pause/resume) | ~10 |
| task-4 (Add tests) | ~50 |
| task-5 (Fix remaining display) | ~10 |
| task-6 (Run tests and verify build) | N/A |
| **Total** | **~80-120** |

**Risk**: ~80-120 lines. Low risk.

## Next Step

Ready for `sdd-apply` (implementation phase).
