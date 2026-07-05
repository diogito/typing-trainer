# Tasks: typing-trainer-web Phase 0 — Platform Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1200-1600 |
| 400-line budget risk | High |
| Chained PRs recommended | No (delivery: exception-ok) |
| Suggested split | Single PR (size:exception accepted) |
| Delivery strategy | exception-ok |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

## Phase 1: Project Scaffolding & Foundation

- [x] task-01: Scaffold Vite 8 + React 19 + TypeScript 6 + Tailwind 4 (Vite plugin) + shadcn/ui + Vitest 4 + TanStack Router + Zustand; configure ESLint, Prettier, globals.css, directory structure (src/core/, src/features/, src/stores/, src/lib/, src/services/, src/hooks/, src/app/, src/types/, src/styles/)
  - Files: package.json, pnpm-lock.yaml, vite.config.ts, tsconfig.json, tailwind.config.ts, postcss (none!), .eslintrc, .prettierrc, index.html, src/main.tsx, src/vite-env.d.ts
  - Dependencies: none
  - Testing: `pnpm build` succeeds, `pnpm test` runs with zero errors
  - Acceptance: Project starts with `pnpm dev`, loads in browser

- [x] task-02: Define all core TypeScript types — Finger, ErrorType, KeyboardKey, KeyboardLayout, FingerMap, KeystrokeEvent, TrainingSession, SessionMetrics, ErrorCountByCategory, TimingMetrics, SessionState, PersistedSession, QMKKeymapInput
  - Files: src/types/index.ts
  - Dependencies: task-01
  - Testing: TypeScript strict mode compiles with zero errors
  - Acceptance: All types export cleanly, used by downstream tasks

## Phase 2: Layout System & Built-in Layouts

- [x] task-03: Implement KC_ code mapping table — comprehensive map from QMK KC_ codes to DOM event.code values and internal scancodes covering alphas (A-Z), numbers (1-0), modifiers, navigation cluster, function row (F1-F12), Enter/Backspace/Tab, punctuation, Spanish-specific (KC_NNO, KC_ACCENT_GRAVE); include unknown-code warning path
  - Files: src/lib/kcCodeMap.ts
  - Dependencies: task-02
  - Testing: unit tests for KC_A→KeyA, KC_LSHIFT→ShiftLeft, KC_NNO→ñ mapping, unknown code warning
  - Acceptance: 100+ KC_ codes mapped, no crashes on unknown

- [x] task-04: Implement QMK keymap.json parser — accepts JSON with `layers` key (array of arrays of keycodes), maps each keycode via KC_ code map, extracts named layers, generates keycap labels (strip KC_ prefix), skips unknown codes with warnings, produces KeyboardLayout
  - Files: src/lib/keymapParser.ts
  - Dependencies: task-03
  - Testing: parse simple 4-key layer, parse multi-layer 2-layer keymap, parse with KC_ prefix, parse malformed input gracefully
  - Acceptance: QMK keymap.json converts to unified KeyboardLayout with named layers

- [x] task-05: Create 5 built-in layout JSON data files — QWERTY-ES (with Ñ), Colemak, Colemak-DH, Dvorak, Custom Template; each with complete key definitions (80+ keys), positions, finger maps, and base labels
  - Files: src/core/keyboard/layouts/qwerty-es.json, colemak.json, colemak-dh.json, dvorak.json, custom-template.json
  - Dependencies: task-02
  - Testing: each file loads as valid JSON, has required fields (id, keys, fingerMap, layers), all scancodes exist in KC_ code map
  - Acceptance: 5 layout files, each with 80+ keys, correct finger assignments

- [x] task-06: Implement layout registry — register built-in layouts, schema validation (id uniqueness, required fields), runtime layout switching, layer activation/deactivation with label inheritance (undefined keys fall back to base labels)
  - Files: src/core/keyboard/layoutRegistry.ts
  - Dependencies: task-04, task-05
  - Testing: register QWERTY, register duplicate throws, activate "numbers" layer shows overrides, unknown keys fall back to base
  - Acceptance: Layout registry loads all 5 built-in layouts, switching at runtime works

## Phase 3: Finger Assignment & Columnar Mapping

- [x] task-07: Implement columnar finger map generator — per-layout columnar model, each physical column maps to one fixed finger (QWERTY: col1=pinky, col2=ring, col3=middle, col4=index, col5=index, col6=middle, col7=ring, col8=pinky), fingers move only vertically
  - Files: src/core/keyboard/fingerMap.ts
  - Dependencies: task-02, task-05
  - Testing: QWERTY Q/A/Z → pinky, R/T/F/G/V/B → index, Colemak Q=pinky W=ring E=middle T=index, out-of-range → 'other'
  - Acceptance: Columnar constraint enforced, per-layout finger maps correct

- [x] task-08: Implement finger detection and override — expected finger lookup for any scancode, wrong-finger error detection, per-layout finger map override support (custom layouts editable), finger → hand mapping for analytics (left/right)
  - Files: src/core/keyboard/fingerDetection.ts
  - Dependencies: task-07
  - Testing: QWERTY KC_A → pinky, Colemak KC_W → ring, finger override reassignment, left/right hand derivation
  - Acceptance: Finger detection accurate, overrides persist correctly

## Phase 4: Analytics Primitives & Session Engine

- [x] task-09: Implement analytics primitives — ErrorCountByCategory tracking (byKey, byFinger, byHand, byLayer, byDirection), timing metrics (avgHoldTime, avgInterKeystrokeGap, holdTimeP50/P95, interKeystrokeGapP50), accuracy = (total-errors)/total*100, precision = (total-wrongFinger)/total*100, cumulative progress aggregation across sessions
  - Files: src/core/analytics/metrics.ts
  - Dependencies: task-02, task-08
  - Testing: 100 keystrokes/5 errors → 95% accuracy, 3 wrong-finger/2 wrong-key → 97% precision, zero keystrokes → 100%, percentile computation, cumulative aggregation [30,35,40] → avgWpm=35
  - Acceptance: All metric computations correct, heatmap-ready data retained per keystroke

- [x] task-10: Implement session engine — lifecycle state machine (idle→running→paused→running→idle), start/stop/pause/resume with timestamps, keystroke recording (append to array with scancode, timing, finger, error), metrics computation at stop (duration excludes pause, wpm formula, accuracy), zero-keystroke edge case (wpm=0, accuracy=100%)
  - Files: src/core/session/sessionEngine.ts
  - Dependencies: task-09
  - Testing: start→pause→resume→stop lifecycle, record valid+errored keystrokes, 100 keystrokes/5 errors/60s → 95% acc, pause at 30/resume at 45/stop at 90 → duration=75s, start+immediate stop → wpm=0
  - Acceptance: Session lifecycle transitions correct, metrics accurate

## Phase 5: Event Capture

- [x] task-11: Implement event capture hook (`useEventCapture`) — attach/detach keydown/keyup listeners on window mount/unmount, event.code→scancode mapping, press/release timing (DOMHighResTimeStamp), wrong-finger/wrong-key detection via fingerMap, modifier key handling (Shift/Ctrl/Alt/Gui tracked separately, NOT training keystrokes), preventDefault for training keys, Escape/pause passes through
  - Files: src/core/capture/eventCapture.ts
  - Dependencies: task-08, task-03
  - Testing: listener attach on mount, detach on unmount, KC_A press/release timing, KC_Q above home → byDirection.down, Shift+A recorded with modifier, Ctrl+C skipped, preventDefault on training keys, Escape propagates
  - Acceptance: All event scenarios pass, no browser default behavior interference for training keys

## Phase 6: State Management (Zustand Stores)

- [x] task-12: Implement layout store slice — current layout ID, active layer name, layout switching, layer activation, custom layout CRUD (create/edit/delete from IndexedDB), persist selectedLayoutId and custom layouts
  - Files: src/stores/layoutStore.ts
  - Dependencies: task-06, task-08
  - Testing: switch layout updates store, activate layer changes labels, create custom layout persists, delete removes from store
  - Acceptance: Layout store fully manages layout state, custom CRUD works

- [x] task-13: Implement keyboard store slice — active scancodes Set, key highlight state, finger color scheme state, keyboard dimensions and responsive sizing state
  - Files: src/stores/keyboardStore.ts
  - Dependencies: task-02
  - Testing: key press adds to active set, key release removes, color scheme update reflects in store
  - Acceptance: Keyboard store manages active key visualization state

- [x] task-14: Implement session store slice — session state (SessionState), start/stop/pause/resume actions, keystroke recording from event capture, metrics computation trigger, persisted session loading
  - Files: src/stores/sessionStore.ts
  - Dependencies: task-10, task-11
  - Testing: start→running, pause→paused, resume→running, stop→idle+metrics, keystrokes append correctly
  - Acceptance: Session store coordinates session lifecycle and keystroke recording

- [x] task-15: Implement UI store slice — user preferences (selectedLayoutId, fingerColorScheme, customFingerMap, fontSize, showLayerIndicator), color scheme customization, font size, load on init from IndexedDB
  - Files: src/stores/uiStore.ts
  - Dependencies: task-02
  - Testing: update preferences persist, load on init restores saved values, color scheme override applies
  - Acceptance: UI store manages all user preference state

## Phase 7: SVG Keyboard Rendering

- [x] task-16: Implement SVGKeyboard component — single SVG element with `<g>` per key, `<rect>` for normal keys, `<path>` for ISO Enter/spacebar, CSS classes for finger color (pinky=#ef4444, ring=#f97316, middle=#eab308, index=#22c55e, thumb=#3b82f6, other=#6b7280), active key highlight (white stroke/darker bg), layer label overlay, responsive sizing (fits container, min 28px touch target on mobile), key shape fidelity (spacebar ~6x, Shift ≥1.5x, ISO Enter taller), React.memo on key components
  - Files: src/features/keyboard/components/SVGKeyboard.tsx, src/features/keyboard/components/KeyboardKey.tsx
  - Dependencies: task-12, task-13
  - Testing: renders 80 keys for QWERTY, ISO Enter has custom path, KC_Q has finger-pinky class, active key highlighted, numbers layer shows "1 2 3 4 5", responsive at 360px and 800px
  - Acceptance: Keyboard renders correctly for all 5 layouts, finger colors, active states, and layer overlays

## Phase 8: IndexedDB Persistence

- [x] task-17: Implement IndexedDB storage service — `sessions` store (persisted sessions with unique ID, timestamp, layout ID, full keystroke data), `preferences` store (selectedLayoutId, color scheme, font size, etc.), `layouts` store (user-created layouts), Date serializer, 50-session retention (oldest evicted)
  - Files: src/services/storage.ts
  - Dependencies: task-02
  - Testing: store session → load by ID, persist preferences → load on init, save custom layout → load, delete layout → removed, 51st session evicts oldest
  - Acceptance: All stores work, Date fields survive serialization round-trip

- [x] task-18: Implement Zustand persist middleware with IndexedDB adapter — wrap stores with persist + indexeddb adapter, auto-save on stop (sessions), error handling (IndexedDB failure → in-memory fallback, toast for session saves, private browsing banner)
  - Files: src/services/persistence.ts, src/stores/layoutStore.ts (update), src/stores/sessionStore.ts (update), src/stores/uiStore.ts (update)
  - Dependencies: task-17, task-12, task-13, task-14, task-15
  - Testing: save session → IndexedDB, app reload restores session, IndexedDB failure → in-memory + toast, private browsing → non-crashing degraded mode
  - Acceptance: All stores persist and restore correctly, error handling graceful

## Phase 9: App Shell & Pages

- [x] task-19: Implement root router configuration — TanStack Router with root layout, 4 routes: `/` (redirect to `/training`), `/layout`, `/training`, `/progress`, `/settings`; configure RouterProvider in App
  - Files: src/app/router.tsx, src/app/routes.ts
  - Dependencies: task-01
  - Testing: navigate to / → redirect to /training, /layout → LayoutPage, /training → TrainingPage, /progress → ProgressPage, /settings → SettingsPage
  - Acceptance: All routes work, redirect functions

- [x] task-20: Implement app shell layout — fixed header with app title + 4 nav tabs (active highlight), collapsible sidebar (desktop), responsive breakpoints (≥1024 sidebar visible, 768-1023 collapsible, <768 hidden + bottom nav), Tab order (header→sidebar→main→footer), Escape closes dialogs
  - Files: src/app/components/AppShell.tsx, src/app/components/Header.tsx, src/app/components/Sidebar.tsx
  - Dependencies: task-19
  - Testing: header renders with 4 tabs, active tab highlighted, responsive at 3 breakpoints, tab order correct
  - Acceptance: Shell renders consistently across breakpoints, nav integration with Zustand

- [x] task-21: Implement Layout page — layout selector (5 options), active indicator, import button (QMK keymap.json), custom layout CRUD buttons, integrates with layoutStore
  - Files: src/app/pages/LayoutPage.tsx
  - Dependencies: task-12, task-20
  - Testing: selector shows 5 layouts, active layout highlighted, import opens file picker, custom layout creation works
  - Acceptance: Layout page fully functional, integrates with layout store and storage

- [x] task-22: Implement Training page — SVGKeyboard component, Start/Pause/Stop buttons, live WPM/accuracy stats display, integrates with sessionStore and eventCapture, Escape pauses session
  - Files: src/app/pages/TrainingPage.tsx
  - Dependencies: task-11, task-14, task-16, task-20
  - Testing: keyboard renders, start→running, pause→paused, stop→idle, WPM/accuracy update live, Escape pauses
  - Acceptance: Training page is fully interactive with real-time feedback

- [x] task-23: Implement Progress page — session list table (date, layout, WPM, accuracy, duration), aggregate metrics (avgWpm, avgAccuracy, bestWpm, totalSessions), date filter, loads from IndexedDB
  - Files: src/app/pages/ProgressPage.tsx
  - Dependencies: task-17, task-19
  - Testing: empty state when no sessions, populated table with sessions, aggregate metrics correct, date filter works
  - Acceptance: Progress page shows complete session history with aggregation

- [x] task-24: Implement Settings page — layout selector, color scheme picker, font size control, import keymap.json, load/save preferences to IndexedDB via uiStore
  - Files: src/app/pages/SettingsPage.tsx
  - Dependencies: task-15, task-17, task-20
  - Testing: settings form renders, changes persist to IndexedDB, reload restores settings, font size change applies
  - Acceptance: Settings page manages all user preferences with persistence

## Phase 10: Integration Testing & Verification

- [x] task-25: Write integration test — complete flow: select layout → start session → simulate keypresses with timing → verify metrics computation → stop session → verify IndexedDB persistence → reload → verify restoration
  - Files: src/**/*.test.tsx or src/**/*.test.ts (integration test suite)
  - Dependencies: all tasks
  - Testing: full lifecycle test, unit tests for all core functions, coverage target >80% on core/
  - Acceptance: All 9 spec requirements verifiable, >80% coverage on core/

## Implementation Order Summary

```
task-01 (Scaffold)
  → task-02 (Types)
    → task-03 (KC_ Map) → task-04 (Parser) → task-06 (Registry) ← task-05 (Layout JSONs)
    → task-07 (Finger Map) → task-08 (Finger Detection)
    → task-09 (Analytics) → task-10 (Session Engine)
    → task-11 (Event Capture)
    → task-12 (Layout Store) ← task-06, task-08
    → task-13 (Keyboard Store)
    → task-14 (Session Store) ← task-10, task-11
    → task-15 (UI Store)
    → task-16 (SVG Keyboard) ← task-12, task-13
    → task-17 (IndexedDB)
    → task-18 (Zustand Persist) ← task-17, task-12-15
    → task-19 (Router) → task-20 (App Shell)
      → task-21 (Layout Page) ← task-12, task-20
      → task-22 (Training Page) ← task-11, task-14, task-16, task-20
      → task-23 (Progress Page) ← task-17, task-19
      → task-24 (Settings Page) ← task-15, task-17, task-20
    → task-25 (Integration Tests) ← all
```

## Estimated PR Size

| Phase | Tasks | Est. Lines |
|-------|-------|-----------|
| 1. Scaffolding & Foundation | 2 | ~80-120 |
| 2. Layout System & Built-in Layouts | 4 | ~250-350 |
| 3. Finger Assignment & Columnar Mapping | 2 | ~80-120 |
| 4. Analytics Primitives & Session Engine | 2 | ~150-200 |
| 5. Event Capture | 1 | ~120-160 |
| 6. State Management (Zustand Stores) | 4 | ~200-280 |
| 7. SVG Keyboard Rendering | 1 | ~150-200 |
| 8. IndexedDB Persistence | 2 | ~120-160 |
| 9. App Shell & Pages | 6 | ~250-350 |
| 10. Integration Testing & Verification | 1 | ~150-200 |
| **Total** | **25** | **~1400-1940** |

**Risk**: Estimated ~1400-1940 lines significantly exceeds 400-line review budget. Delivery strategy is exception-ok, so proceed as single PR with size:exception.

## Next Step

Ready for `sdd-apply` (implementation phase).
