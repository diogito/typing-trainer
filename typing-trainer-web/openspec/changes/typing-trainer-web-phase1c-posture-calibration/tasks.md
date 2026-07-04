# Tasks: Phase 1c — Posture Calibration

## Review Workload Forecast

Est: ~600–750 lines | Risk: Medium | Single PR (exception-ok) | No chains.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

---

## Phase 1: Type + Slider Component

### task-42: Add PostureCalibration type
- Files: `src/types/index.ts` | Deps: none | Test: Type shape, default values
- Accept: `armSeparation: number`, `wristHeight: number`, `breakIntervalMinutes: number`, `breakEnabled: boolean` | R-UI-1 | ~8 LOC
- Add `PostureCalibration` interface and `DEFAULT_POSTURE` constant to `src/types/index.ts`

### task-43: Create Slider shadcn component
- Files: `src/components/ui/slider.tsx` | Deps: none | Test: Renders track + thumb + label, value changes on click/drag
- Accept: `<Slider min={1} max={10} defaultValue={5} />` renders, thumb at 50%, click updates value | R-UI-2 | ~60 LOC
- Follow existing shadcn component pattern (cn + class-variance-authority)
- Use native `<input type="range">` styled with Tailwind for accessibility
- Props: `min`, `max`, `defaultValue`, `step?`, `onChange?`, `className?`
- Export as named `Slider`

---

## Phase 2: Storage Layer

### task-44: Bump IndexedDB to version 2 and add POSTURE store
- Files: `src/services/storage.ts` | Deps: none | Test: DB version 2, POSTURE store created on upgrade
- Accept: `upgrade` callback creates POSTURE store with keyPath `id`, existing stores preserved | R-DB-1 | ~10 LOC
- Change `const DB_VERSION = 1` to `const DB_VERSION = 2`
- Add `if (event.oldVersion < 2)` block that creates `POSTURE` object store
- Do NOT delete or modify existing stores (sessions, preferences, layouts)

### task-45: Add POSTURE CRUD methods to storageService
- Files: `src/services/storage.ts` | Deps: task-44 | Test: save + get + delete posture calibration
- Accept: `savePostureCalibration` writes to POSTURE store, `getPostureCalibration` reads, `deletePostureCalibration` clears | R-DB-2 | ~20 LOC
- Methods: `savePostureCalibration(calibration: PostureCalibration)`, `getPostureCalibration(): Promise<PostureCalibration | null>`, `deletePostureCalibration()`
- Use `id` key `'posture-calibration'` (single calibration record)

---

## Phase 3: Posture Store

### task-46: Create postureStore Zustand store
- Files: `src/stores/postureStore.ts` | Deps: task-44,45 | Test: Default values, set values, save to DB, reset
- Accept: `setArmSeparation(n)`, `setWristHeight(n)`, `setBreakInterval(n)`, `toggleBreak()`, `save()`, `load()`, `reset()` | R-UI-4, R-UI-5 | ~30 LOC
- Initialize with defaults from `DEFAULT_POSTURE`
- `load()` calls `storageService.getPostureCalibration()` and sets state
- `save()` calls `storageService.savePostureCalibration()`
- `reset()` clears to defaults and calls `storageService.deletePostureCalibration()`
- Export as `usePostureStore`

---

## Phase 4: Posture Page + Route + Nav

### task-47: Create PosturePage with 3 sliders
- Files: `src/pages/PosturePage.tsx` | Deps: task-42,43,46 | Test: Renders 3 sliders, save calls store.save, reset calls store.reset
- Accept: 3 labeled sliders with correct ranges, Save button calls `postureStore.save()`, Reset button calls `postureStore.reset()`, sliders reflect saved values on load | R-UI-3, R-UI-4, R-UI-5 | ~80 LOC
- Use `useEffect` to call `postureStore.load()` on mount
- Arm Separation: `min=20 max=80 step=1` label "X cm"
- Monitor Height: `min=1 max=10 step=1` label "level Y"
- Break Interval: `min=5 max=120 step=5` label "X min"
- Save and Reset buttons at bottom
- Show success toast/message on save (use existing UI or simple inline feedback)

### task-48: Add /posture route
- Files: `src/routes/posture.tsx` | Deps: task-47 | Test: Route renders PosturePage
- Accept: `/posture` URL renders PosturePage, accessible from nav | ~10 LOC
- Follow existing route file pattern (e.g., `src/routes/settings.tsx`)

### task-49: Add Posture link to LayoutShell navigation
- Files: `src/components/LayoutShell.tsx` | Deps: task-48 | Test: Nav includes Posture link
- Accept: Sidebar + mobile nav show Posture link, links to `/posture` | ~10 LOC
- Add "Posture" to sidebar items and mobile bottom nav
- Add simple icon (can use text label if icon set is limited)

---

## Phase 5: Break Reminder Timer

### task-50: Create BreakReminder timer hook
- Files: `src/hooks/useBreakReminder.ts` (new) | Deps: task-46 | Test: Timer fires after interval, pauses on session idle, resets on dismiss
- Accept: `startTimer(sessionActive: boolean)` starts/stops timer, timer fires after interval, `dismiss()` resets timer | R-Reminder-1, R-Reminder-2, R-Reminder-3 | ~40 LOC
- Hook signature: `useBreakReminder(enabled: boolean, intervalMinutes: number, sessionActive: boolean)` → `{ timer, dismiss, remainingMinutes }`
- Uses `setInterval` with `intervalMinutes * 60 * 1000`
- When `sessionActive` changes to false, pause interval
- When `sessionActive` changes to true, resume from remaining time
- Returns `remainingMinutes` for overlay display
- When timer fires, trigger dismiss callback

### task-51: Create BreakReminderOverlay component
- Files: `src/components/BreakReminderOverlay.tsx` (new) | Deps: task-50 | Test: Shows overlay, dismissible via button + Escape key
- Accept: Full-screen overlay with message, countdown, dismiss button, Escape key dismisses | R-Reminder-2 | ~40 LOC
- Warm/warning color scheme (amber/yellow)
- Shows remaining time, "Take a break!" message
- "Dismiss" button + "I'll take a break" CTA
- `onDismiss` callback passed from PosturePage

---

## Phase 6: Verification

### task-52: Write tests
- Files: `src/components/ui/slider.test.tsx` (new), `src/stores/postureStore.test.ts` (new), `src/services/storage.test.ts` (append POSTURE tests)
- Deps: all tasks | Test: Slider renders/interacts, postureStore CRUD, DB save/get/delete
- Accept: All 13 requirements + scenarios verified. Tests cover: (1) Slider: render, click, drag, value display, (2) postureStore: defaults, set/save/reset, (3) storage: POSTURE CRUD | ~120 LOC

---

## Implementation Order Summary

```
task-42 (PostureCalibration type) ──┐
                                     ├→ task-43 (Slider component) → task-47 (PosturePage)
task-44 (DB v2 upgrade) ───────────┤
                                     ├→ task-45 (POSTURE CRUD) → task-46 (postureStore) → task-47
task-47 (PosturePage) ─────────────┤
                                     ├→ task-48 (/posture route) → task-49 (nav link)
task-46 (postureStore) ────────────┤
                                     ├→ task-50 (useBreakReminder) → task-51 (BreakReminderOverlay)
                                     └→ task-52 (all tests)
```

## Estimated PR Size

| Task | Est. Lines |
|------|-----------|
| task-42 (PostureCalibration type) | ~8 |
| task-43 (Slider component) | ~60 |
| task-44 (DB v2 upgrade) | ~10 |
| task-45 (POSTURE CRUD) | ~20 |
| task-46 (postureStore) | ~30 |
| task-47 (PosturePage) | ~80 |
| task-48 (/posture route) | ~10 |
| task-49 (nav link) | ~10 |
| task-50 (useBreakReminder) | ~40 |
| task-51 (BreakReminderOverlay) | ~40 |
| task-52 (all tests) | ~120 |
| **Total** | **~420** |

**Risk**: ~420 lines is slightly above 400-line budget. Medium risk, acceptable with exception-ok delivery. Main complexity is the Slider component (custom range input with styling) and the BreakReminder timer with pause/resume logic.

## Next Step

Ready for `sdd-apply` (implementation phase).
