# Tasks: Phase 1e — Break Reminder Integration

## Review Workload Forecast
- Estimated changed lines: ~80-120
- 400-line budget risk: Low
- Chained PRs recommended: No
- Suggested split: Single PR

## Tasks

### task-1: Integrate useBreakReminder into TrainingPage
- **File**: `src/pages/TrainingPage.tsx`
- **Description**: Import and use `useBreakReminder` hook in TrainingPage. Derive `isTyping` from `session.state === 'running'`. Call `handleStart` → `breakReminder.start()`, `handleStop` → `breakReminder.reset()`. Wire `onReminder` callback to show overlay.
- **Lines**: ~20

### task-2: Wire BreakReminderOverlay into TrainingPage JSX
- **File**: `src/pages/TrainingPage.tsx`
- **Description**: Render `BreakReminderOverlay` inside TrainingPage's return JSX. Pass `active={breakReminder.active}`, `remaining={breakReminder.remaining}`, `formattedRemaining={breakReminder.formattedRemaining}`, `onDismiss={breakReminder.dismiss}`, `onPause={breakReminder.pause}`. The overlay auto-hides when not active.
- **Lines**: ~10

### task-3: Handle pause/resume for break timer
- **File**: `src/pages/TrainingPage.tsx`
- **Description**: When session pauses (`handlePause` with `session.state === 'running'`), call `breakReminder.pause()`. When session resumes, the `useBreakReminder` hook's `isTyping` dependency naturally pauses/resumes the timer via its interval effect — no additional call needed. Just verify the hook's `isTyping` prop drives the timer correctly.
- **Lines**: ~10

### task-4: Add tests
- **File**: `src/pages/TrainingPage.test.tsx` (new)
- **Description**: Create integration tests for break reminder in TrainingPage:
  - Timer starts when session starts
  - Timer pauses when session pauses
  - Timer resets when session stops
  - BreakReminderOverlay appears after interval
  - Dismiss hides overlay and resets timer
  - Break reminder respects `breakEnabled` setting
- **Lines**: ~50

### task-5: Fix BreakReminderOverlay remaining display
- **File**: `src/components/BreakReminderOverlay.tsx`
- **Description**: The overlay currently computes remaining as `remaining / 60` which is wrong when interval > 1 minute. Fix to use `remaining / (posture.breakIntervalMinutes * 60)` for the progress bar. Since the hook already provides `formattedRemaining` as a string, use that instead of computing in the component.
- **Lines**: ~10

### task-6: Run tests and verify build
- **Description**: Run `pnpm run test:run` and `pnpm run build`. Verify all tests pass and build is clean.
- **Lines**: N/A (verification)
