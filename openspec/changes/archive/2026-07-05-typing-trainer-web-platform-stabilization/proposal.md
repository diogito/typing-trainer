# Proposal: Platform Stabilization

## Intent

Stabilize the deployed typing-trainer-web application by fixing six critical bugs that break core training feedback, navigation integrity, and default health settings.

## Problem Statement

The deployed application has six bugs discovered during post-launch validation. The core training feedback loop is broken — WPM, accuracy, and keystroke stats never update during active sessions. Navigation uses `<a href>` tags instead of the SPA router, destroying session state on every page change. Break reminders are disabled by default. These are wiring/integration bugs: individual components exist and pass unit tests, but the data flows between them are broken or incomplete.

## Scope

### In Scope
1. Add `computeLiveMetrics()` to `SessionEngine` — pure function computing WPM/accuracy/duration from current keystrokes
2. Wire live metrics into `sessionStore.recordKeystroke()` so metrics are populated during running sessions
3. Fix `TrainingPage.tsx` display: keystroke count from `keystrokes.length`, elapsed time from `startTime`, Stop button from `keystrokes.length > 0`
4. Replace `<a href>` with TanStack Router `<Link>` in `LayoutShell.tsx` (both `SidebarLink` and `NavButton`)
5. Change `DEFAULT_POSTURE.breakEnabled` from `false` to `true` in `src/types/index.ts`
6. Delete root-level `openspec/` directory (canonical location is `typing-trainer-web/openspec/`)
7. Update tests: `useBreakReminder.test.ts`, `postureStore.test.ts` for new default

### Out of Scope
- Error heatmap / wrong-finger detection (fundamental limitation — browser KeyboardEvent provides no finger data)
- New features (posture calibration, mirror mode, analytics are already implemented)
- Physical keyboard positioning or VIA/Vial parser
- Layout default UX polish (Bug 5 was determined to work correctly)

## Capabilities

### Modified Capabilities
- `session-engine`: New requirement — `computeLiveMetrics()` method must compute partial metrics from current keystrokes in <1ms without side effects
- `training-session`: Requirement change — `sessionStore.metrics` must be non-null during active 'running' sessions; Stop button must appear after first keystroke
- `navigation`: Requirement change — all sidebar and top-bar navigation must use TanStack Router `<Link>` for SPA routing; no full page reloads
- `posture-settings`: Requirement change — `DEFAULT_POSTURE.breakEnabled` defaults to `true`; break reminders fire after configurable interval (default 30 min)

## Approach

### Live Metrics Pipeline
```
Keystroke event → eventCapture → recordKeystroke() → sessionEngine.keystrokes[]
                                          → computeLiveMetrics() → sessionStore.metrics (live)
TrainingPage → reads metrics every render → shows live WPM/accuracy/time
```

### Component Changes
1. **`src/core/session/sessionEngine.ts`**: Add `computeLiveMetrics(keystrokes, startTime, endTime)` — pure function, O(n) over keystrokes, returns partial SessionMetrics
2. **`src/stores/sessionStore.ts`**: In `recordKeystroke()`, after pushing keystroke, call `computeLiveMetrics()` and set `metrics` to result
3. **`src/pages/TrainingPage.tsx`**: Use `session.keystrokes.length` for keystroke count; compute elapsed time from `session.startTime` when running; Stop condition: `session.keystrokes.length > 0 && session.state !== 'idle'`
4. **`src/components/LayoutShell.tsx`**: Replace `<a href>` with `<Link to>` from `@tanstack/react-router` in both `SidebarLink` and `NavButton`
5. **`src/types/index.ts`**: Change `DEFAULT_POSTURE.breakEnabled` from `false` to `true`

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `computeLiveMetrics` called frequently during fast typing | Low | Pure function, no side effects, O(n) where n = keystrokes (~50–500 typical), ~0.1–5ms |
| TanStack Router `<Link>` breaks custom styles or routes | Low | `<Link>` is the intended API — all routes exist in `src/routes/`. Tests catch regressions. |
| Break reminders fire on default for users who don't want them | Low | Users can disable in Settings; this is a deliberate default choice for health |
| `sessionStore.metrics` update triggers unnecessary re-renders | Low | Store update only fires on keystroke, not on every render |

## Rollback Plan

1. Revert to pre-change `sessionEngine.ts` — `recordKeystroke()` without `computeLiveMetrics()` call; metrics will be null during running again (old behavior)
2. Revert `LayoutShell.tsx` to `<a href>` — navigation works but reloads pages (old behavior)
3. Revert `DEFAULT_POSTURE.breakEnabled` to `false` — break reminders disabled (old behavior)
4. Re-create `openspec/` if root-level docs are needed — copy from backup
5. All changes are isolated file-level reverts, no data migration needed

## Dependencies

- Existing `src/routes/` route definitions must cover all `to` targets used in `LayoutShell.tsx`
- Existing `@tanstack/react-router` dependency (already in package.json)

## Success Criteria

- [ ] WPM, accuracy, keystroke count, and elapsed time update in real-time during active typing session
- [ ] Stop button appears within one keystroke of session start
- [ ] Break reminders fire after configurable interval (default 30 min) when enabled
- [ ] Navigation between pages is instant (no page reload, session state preserved)
- [ ] All existing tests pass
- [ ] Tests updated for new break reminder default
- [ ] Root `openspec/` deleted

## Next Steps

- [ ] Write delta specs for session-engine, training-session, navigation, posture-settings
- [ ] Create implementation tasks
- [ ] Implement in 3 batches: (1) live metrics + stop button, (2) navigation, (3) break reminders + cleanup
- [ ] Verify with tests and manual QA
