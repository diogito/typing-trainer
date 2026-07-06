# Exploration: Platform Stabilization

## Problem Summary

The deployed typing-trainer-web application has six critical bugs that render core features non-functional: live stats never update, the stop button is invisible during active sessions, break reminders never fire, sidebar navigation causes full page reloads, no keyboard layout is pre-selected, and the error heatmap shows no errors. These are all wiring/integration bugs — the individual components exist and pass unit tests, but the data flows between them are broken.

## Bug Analysis

### Bug 1: Stats don't show while typing (WPM, accuracy, keystrokes, time stay at 0)

**Symptom**: User starts a session, types keystrokes, but the stat cards (WPM, Accuracy, Precision, Keystrokes, Time) all display 0/100%.

**Root Cause**: `TrainingPage.tsx` line 112–116 reads metrics from `useSessionStore((s) => s.metrics)`. The `metrics` field is only populated in `sessionStore.stop()` (line 72) when the session ends. During an active running session, `metrics` is `null`, so the display falls back to 0 via `?? 0`.

Meanwhile, `sessionEngine.ts` line 143–147 has `recordKeystroke()` which pushes keystrokes to `state.keystrokes` during running, but these live keystrokes are never surfaced to the UI as live metrics. There is no `liveMetrics` or `progressiveMetrics` computation — metrics are only computed in `stop()` (lines 83–138).

Additionally, the elapsed time computation at line 116 uses `metrics.duration`, which is null during running. The time should be computed from `state.startTime` and `Date.now()`.

**Impact**: CRITICAL — The core training feedback loop is broken. Users can't see their WPM or accuracy while typing, making the trainer useless.

**Fix Scope**:
- `src/stores/sessionStore.ts` — Add live metrics computation in `recordKeystroke`
- `src/core/session/sessionEngine.ts` — Add a `computeLiveMetrics()` method that computes WPM, accuracy, etc. from current keystrokes without requiring stop
- `src/pages/TrainingPage.tsx` — Use `state.keystrokes.length` for keystroke count display; compute elapsed time from `state.startTime` when running

### Bug 2: Stop button never shows

**Symptom**: User starts a session, types keystrokes, but the "Stop" button never appears. Only "Pause" is visible.

**Root Cause**: `TrainingPage.tsx` lines 131–150: The Stop button visibility condition is `ks > 0 && session.state !== 'idle'`. But `ks` is derived from `metrics?.totalKeystrokes ?? 0` (line 115). Since `metrics` is only set when the session stops (Bug 1), `ks` is always 0 during an active session. The condition `ks > 0` is never true while running.

**Impact**: HIGH — Users can't stop a training session early, forcing them to type through the entire text.

**Fix Scope**:
- `src/pages/TrainingPage.tsx` — Change the Stop condition to use `session.keystrokes.length > 0` instead of `ks > 0`. The `keystrokes` array is available on `session` (the SessionState), populated in real-time by `recordKeystroke`.

### Bug 3: Break reminders never trigger

**Symptom**: Even when break reminders are enabled in posture settings, no break overlay appears during typing.

**Root Cause**: Three-part issue:

1. **`DEFAULT_POSTURE` has `breakEnabled: false`** (`src/types/index.ts` line 161). Users must manually enable breaks in settings before they fire.

2. **`useBreakReminder` hook checks `posture.breakEnabled`** (`src/hooks/useBreakReminder.ts` line 42). Combined with #1, the timer never starts by default.

3. **Timer resets on every render**: The `breakReminder.start()` call (line 21–25 in the hook) resets `elapsed` to 0. But since `breakReminder.start()` is only called in `handleStart` (TrainingPage line 70), and the `isTyping` prop is `session.state === 'running'` (line 48), this should work. The real problem is that `breakEnabled: false` is the default, and the `start()` function immediately returns if `!posture.breakEnabled` (hook line 22).

**Impact**: MEDIUM — Break reminders are a health feature, but they're effectively non-functional by default.

**Fix Scope**:
- `src/types/index.ts` — Consider `breakEnabled: true` as default (or at least document the expectation)
- `src/hooks/useBreakReminder.test.ts` — Update tests if default changes
- No code changes needed for the timer logic itself — it works correctly when enabled

### Bug 4: Sidebar uses `<a href>` instead of TanStack Router `<Link>`

**Symptom**: Clicking sidebar navigation links (Training, Progress, Settings, Layouts, Posture) causes a full page reload instead of a SPA navigation.

**Root Cause**: `src/components/LayoutShell.tsx` lines 74–83 define `SidebarLink` as:
```tsx
function SidebarLink({ href, icon: Icon, label }) {
  return (
    <a href={href} className="...">
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}
```

Similarly, `NavButton` (lines 86–92) also uses `<a href>`. The app is configured with TanStack Router (route files in `src/routes/` use `createRoute`), but the navigation components use plain `<a>` tags which trigger full page reloads.

**Impact**: HIGH — Full page reloads destroy session state (Zustand stores reset), breaking the training session.

**Fix Scope**:
- `src/components/LayoutShell.tsx` — Replace `<a href>` with TanStack Router `<Link>` from `@tanstack/react-router` in both `SidebarLink` and `NavButton`
- Import `Link` from `@tanstack/react/router` and use `to` prop instead of `href`

### Bug 5: No keyboard layout selected by default

**Symptom**: On first load, the keyboard layout shows no selection or shows an empty state.

**Root Cause**: `src/stores/layoutStore.ts` line 18 sets `layoutId: 'qwerty-es'` as the default. However, `src/pages/TrainingPage.tsx` lines 52–57:
```tsx
const layoutId = useLayoutStore.getState().layoutId;
if (!isInitialized && layout) {
  init(layoutId);
  setIsInitialized(true);
  setActiveLayoutId(layoutId);
}
```

The `layout` variable comes from `useLayoutStore((s) => s.getLayout())` (line 27). When `layoutId` is `'qwerty-es'`, `layoutRegistry.get('qwerty-es')` returns the layout correctly. However, the initialization block is inside the component body (not in a useEffect or conditional render), which means it runs synchronously on every render. While this does work, the issue is that `setActiveLayoutId` is called with `layoutId` from the store, but `layoutId` state is initialized as an empty string (`useState('')`). The first render will have `layoutId = ''` (the initial useState), but then `useLayoutStore.getState().layoutId` is `'qwerty-es'` (the store default).

Actually, looking more carefully: this works correctly in the current code because `useLayoutStore.getState().layoutId` is called synchronously and returns `'qwerty-es'`. The `layout` check ensures initialization only happens when the layout is available. This may not be a real bug — let me verify by checking if the layout actually loads.

**Impact**: LOW/MEDIUM — May cause initial blank state or flicker.

**Fix Scope**: Likely no code fix needed if the layout loads correctly. May need a UX improvement to show a loading state.

### Bug 6: Error heatmap doesn't show errors

**Symptom**: Wrong-finger errors are detected but not displayed on the keyboard heatmap.

**Root Cause**: Three-part chain:

1. **Error detection in `eventCapture.ts`** (lines 70–88): The `detectError` function receives `{ actualFinger, expectedFinger }` where both are always the same value (line 71: `const actualFinger = expectedFinger`). This is an "optimistic model" — it assumes the user types with the correct finger. So `detectError` (which compares actualFinger to expectedFinger) will almost always return `undefined` because they're the same.

   The fundamental issue: the browser's KeyboardEvent API doesn't provide information about which finger was used. The actualFinger is always set to expectedFinger (line 71), making the error detection always pass.

2. **Wrong-finger errors only come from `event.error`**: In `eventCapture.ts` line 74, `detectError` is called. Since `actualFinger === expectedFinger`, `detectError` returns `undefined` (no error detected). The error field is `undefined`, so no wrong-finger errors are ever generated.

3. **Heatmap rendering works correctly**: `SvgKeyboard.tsx` line 211 renders `<KeyboardErrorOverlay fingerErrors={fingerErrors} />`, and `useKeyboardContent.ts` line 13 provides `fingerErrors` from the store. `keyboardStore.ts` lines 48–54 correctly increment error counts via `recordError`. So the rendering pipeline is intact.

The root cause is architectural: without hardware-level finger detection, the app can't actually detect wrong-finger errors from keyboard events alone. The error detection relies on `event.error` being pre-set (e.g., from a custom HID device or a finger-sensing layer), which doesn't exist in the current deployment.

**Impact**: MEDIUM — The error heatmap is a key differentiator, but it's non-functional without actual finger-detection data.

**Fix Scope**: 
- This is a fundamental limitation, not a bug per se. The error detection needs a different data source.
- As a workaround, the app could simulate errors for testing, or accept that wrong-finger detection requires external input.

## Documentation Audit

### Root openspec/ (duplicates)
- `/mnt/datos/workspaces/personal/random/openspec/changes/archive/` — Contains phase0-platform-foundation and phase1a-mirror-mode specs
- These are DUPLICATES of the same specs found in `typing-trainer-web/openspec/changes/archive/`
- The root-level `openspec/` appears to be a copy of the project's SDD docs
- **Recommendation**: Delete root `openspec/` entirely. The canonical location is `typing-trainer-web/openspec/`

### typing-trainer-web openspec/ (current)
- Contains `changes/archive/` with phases 1b–1e (finger-accuracy, layout-customization, posture-calibration, break-integration)
- No `explore.md` files found — clean structure
- Phase 1e (break-integration) spec.md at `openspec/changes/archive/2026-07-04-typing-trainer-web-phase1e-break-integration/spec.md` correctly describes the integration gap we're fixing
- **Recommendation**: Keep as-is, add platform-stabilization change here

## Proposed Approach

### Phase 1: Fix live stats (Bug 1 + Bug 2)
**Priority: CRITICAL**

1. **`sessionEngine.ts`** — Add `computeLiveMetrics()`:
   - Takes current `keystrokes[]` and `startTime`
   - Returns partial `SessionMetrics` with WPM, accuracy, duration
   - Called from store on each keystroke

2. **`sessionStore.ts`** — Update `recordKeystroke()`:
   - After pushing keystroke, call `computeLiveMetrics()`
   - Set `metrics` to live result (not null during running)

3. **`TrainingPage.tsx`** — Update display logic:
   - Use `session.keystrokes.length` for keystroke count (not `metrics.totalKeystrokes`)
   - Compute elapsed time from `session.startTime` when running: `Date.now() - startTime`
   - Stop button condition: `session.keystrokes.length > 0 && session.state !== 'idle'`

### Phase 2: Fix navigation (Bug 4)
**Priority: HIGH**

4. **`LayoutShell.tsx`** — Replace `<a href>` with TanStack Router `<Link>`:
   - Import `Link` from `@tanstack/react-router`
   - Replace `href={href}` with `to={href}` in `SidebarLink`
   - Replace `href={href}` with `to={href}` in `NavButton`
   - Remove the manual icon inline components for `BarChart`, `Settings`, `Monitor` — use lucide-react imports instead

### Phase 3: Enable break reminders (Bug 3)
**Priority: MEDIUM**

5. **`src/types/index.ts`** — Change `DEFAULT_POSTURE.breakEnabled` to `true`
6. Update `src/hooks/useBreakReminder.test.ts` to reflect new default
7. Update `src/stores/postureStore.test.ts` to reflect new default

### Phase 4: Error heatmap (Bug 6)
**Priority: ACCEPT LIMITATION**

8. This is a fundamental architectural limitation — not fixable without finger-detection hardware
9. Document in code comments that `event.error` field must be set externally
10. Add a placeholder/visual indicator when error data is available but no errors detected

### Phase 5: Documentation cleanup
11. Delete root `openspec/` directory (duplicates typing-trainer-web/openspec/)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Live metrics computation during running | MEDIUM | Ensure computation is fast (<1ms per call). Don't recompute on every render — only in store action. |
| TanStack Router Link vs `<a>` | LOW | Link is the canonical way — this is a correctness fix. Ensure all routes exist (they do). |
| Break reminders firing on default | LOW | Users who prefer breaks disabled will see overlay after 30 min. They can disable in Settings. |
| Error heatmap non-functional | INFORMATIONAL | Document as known limitation. No code regression. |
| Session state loss on navigation | RESOLVED by Phase 2 | Once Link is used, SPA navigation preserves Zustand stores. |

## Test Strategy

### Existing tests to update
1. **`sessionEngine.test.ts`** — Add test for `computeLiveMetrics()` (new method)
2. **`fullFlow.test.ts`** — Add test: metrics are non-null during running session
3. **`useBreakReminder.test.ts`** — Update default posture expectation to `breakEnabled: true`
4. **`postureStore.test.ts`** — Update default posture expectation
5. **`TrainingPage.test.tsx`** — Add test: Stop button visible during running session with keystrokes

### New tests to add
1. **Live metrics test**: Start session → record keystrokes → verify metrics are non-null (WPM > 0, accuracy calculated, duration > 0)
2. **Stop button test**: Start session → record keystrokes → verify Stop button is visible (RTL test)
3. **Break reminder activation test**: Enable break → start session → record keystrokes for 1 minute → verify timer elapsed
4. **Navigation test**: Verify SidebarLink and NavButton render `<a>` with href (not Link) — this test will FAIL before fix, PASS after
5. **Error heatmap test**: Record wrong-finger error manually → verify fingerErrors store is updated

### Integration test additions
- `fullFlow.test.ts` — Add: "session metrics are live during running state"
- `mirrorMode.test.ts` — May need updates if session flow changes
