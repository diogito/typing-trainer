# Phase 1e: Break Reminder Integration

## Problem
Phase 1c implemented `useBreakReminder` hook and `BreakReminderOverlay` component, but the break reminder system was not wired into the typing session. The timer never started when the user began typing, and the overlay never appeared. The break reminder feature was functionally dead code.

### Resolution (resolved by Platform Stabilization, commit 73231323)
The root cause was a `postureStore` sync gap: `breakEnabled` defaulted to `false` and `breakIntervalMinutes` was not properly initialized, so `useBreakReminder` silently skipped timer activation. Platform Stabilization (commit 73231323) corrected the default posture settings and added `postureStore` sync logic. The fix was then wired into TrainingPage with the following integration points:

- `useBreakReminder()` is called in TrainingPage, bound to `isTyping` derived from session state
- `start()` is called on session start, `pause()` on session pause, `reset()` on session stop
- `BreakReminderOverlay` is rendered with `active`/`remaining`/`onDismiss`/`onPause` props
- Break reminders fire after `breakIntervalMinutes` of elapsed typing time when enabled
- `breakEnabled` defaults to `true` as established by Platform Stabilization

All requirements (REQ-1.1 through REQ-4.3) are now satisfied.

## Scope
Integrate the existing `useBreakReminder` hook and `BreakReminderOverlay` component into the `TrainingPage`, so the break reminder activates during active typing sessions and pauses/resets appropriately with session lifecycle.

## Requirements

### 1. Break timer activation
- **REQ-1.1**: When the user clicks "Start Training", the break reminder timer MUST start counting elapsed time
- **REQ-1.2**: The timer MUST only advance while `session.state === 'running'` (not during pauses)
- **REQ-1.3**: The timer MUST reset to zero when the user clicks "Stop" or when the session returns to 'idle'
- **REQ-1.4**: The timer MUST NOT advance when the session is 'paused' or 'idle'

### 2. Break reminder overlay display
- **REQ-2.1**: When the elapsed time reaches `posture.breakIntervalMinutes`, the `BreakReminderOverlay` MUST display
- **REQ-2.2**: The overlay MUST show the remaining countdown from the break interval
- **REQ-2.3**: The overlay MUST have "Dismiss" (hides overlay, resets timer) and "Pause" (pauses overlay timer) actions
- **REQ-2.4**: The overlay MUST NOT block keyboard input (it's a non-modal notification)

### 3. Session lifecycle integration
- **REQ-3.1**: `handleStart` in TrainingPage MUST call `breakReminder.start()`
- **REQ-3.2**: `handleStop` in TrainingPage MUST call `breakReminder.reset()`
- **REQ-3.3**: When session pauses, the break reminder MUST pause its timer via `breakReminder.pause()`
- **REQ-3.4**: When session resumes, the break reminder MUST resume its timer via `breakReminder.dismiss()` or equivalent

### 4. Posture settings dependency
- **REQ-4.1**: The break reminder MUST respect `posture.breakEnabled` — if disabled, no timer runs
- **REQ-4.2**: Changes to `posture.breakIntervalMinutes` MUST be reflected in real-time
- **REQ-4.3**: If posture settings change during a session, the timer interval MUST update dynamically

## Out of Scope
- Audio notification for break reminder
- Break session tracking (how many breaks per day)
- Break reminder scheduling (e.g., only on weekdays)
- Customizable break reminder messages

## Technical Notes
- `useBreakReminder` hook already exists at `src/hooks/useBreakReminder.ts` with `start`, `pause`, `dismiss`, `reset` methods
- `BreakReminderOverlay` component exists at `src/components/BreakReminderOverlay.tsx` with `active`, `remaining`, `formattedRemaining`, `onDismiss`, `onPause`, `onResume` props
- `postureStore` provides `posture.breakEnabled` and `posture.breakIntervalMinutes`
- `sessionStore` provides `session.state` with values: 'idle', 'running', 'paused'
