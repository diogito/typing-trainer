# Proposal: Phase 0 — Platform Foundation

## Intent

Build the complete foundational platform for the typing-trainer-web: project scaffolding, SVG keyboard rendering, layout/finger/layer systems, event capture, session engine, IndexedDB persistence, analytics primitives, and navigable app shell. This is the bedrock for all 10 training levels.

## Scope

### In Scope
- Vite 8 + React 19 + TS 6 + Tailwind 4 (Vite plugin) + shadcn/ui + Vitest 4 + TanStack Router + Zustand
- 2D SVG keyboard with finger-colored keys, 5 layouts (QWERTY, Colemak, Colemak-DH, Dvorak, custom)
- QMK/VIA/Vial `keymap.json` parser with layer extraction and named layers
- Finger assignment per physical key (event.code → finger)
- Keyboard event capture: press/release/hold timing, error detection
- Training session engine: start/stop/pause, keystroke tracking, basic stats
- IndexedDB persistence (sessions, preferences, layout profiles) via Zustand persist
- Analytics primitives: errors by key/finger/hand/layer/direction, accuracy/precision metrics
- App shell: Layout, Training, Progress, Settings pages

### Out of Scope
- Training exercises (levels 1-10), 3D keyboard, mirror mode, metronome, fatigue detection, VS Code plugin, backend

## Capabilities

### New Capabilities
- `keyboard-rendering`: SVG 2D keyboard, finger-color coding, key labels, layer overlay
- `layout-system`: Multi-layout support, QMK/VIA/Vial JSON parsing, named layers
- `event-capture`: In-tab capture, physical key → finger mapping, timing, error detection
- `session-engine`: Session lifecycle, keystroke recording, per-session stats
- `persistence`: IndexedDB via Zustand persist — sessions, preferences, profiles
- `analytics-primitives`: Error tracking by key/finger/hand/layer/direction, accuracy/precision
- `app-shell`: SPA with TanStack Router (4 pages)

### Modified Capabilities
None — greenfield project.

## Approach

### Architecture

```
src/
├── app/          Router, providers
├── core/
│   ├── keyboard/ layouts/, keyboard.ts, fingers.ts, types.ts
│   ├── capture/ eventCapture.ts
│   ├── session/ sessionEngine.ts
│   └── analytics/ metrics.ts
├── features/keyboard/ components/, hooks/useLayout.ts
├── stores/       layoutStore, keyboardStore, sessionStore, uiStore
├── lib/ keymapParser.ts
├── services/ storage.ts
├── components/ui/ shadcn/ui
├── hooks/ useKeyboard.ts
├── types/ index.ts
└── styles/ globals.css
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data model key | `scancode` (e.g., `KC_A`) | QMK/VIA use scancodes; consistent across layouts |
| Finger assignment | Per-layout, per-key | Different layouts have different home-row mappings |
| Rendering | SVG `<rect>` per key | React-friendly, CSS styling, accessible, easy finger-color |
| Event capture | `window.addEventListener` in app shell | In-tab is sufficient; no extension needed |
| Layout schema | Custom, mirrors QMK keymap.json | Easier import; custom layouts share same structure |
| Persistence | Zustand `persist` with IndexedDB | Zero extra deps; handles serialization |
| State slices | 4 stores (layout, keyboard, session, ui) | Separates concerns |

### Core Types

```typescript
type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' | 'other';
type ErrorType = 'wrong-finger' | 'wrong-key' | 'missed';

interface KeyboardKey { scancode: string; position: KeyPosition; labels: Record<string, string>; }
interface KeyboardLayout { id: string; name: string; keys: KeyboardKey[]; fingerMap: Map<string, Finger>; layers: Layer[]; }
interface KeystrokeEvent { scancode: string; code: string; key: string; pressTime: number; releaseTime?: number; expectedFinger: Finger; actualFinger: Finger; error?: ErrorType; }
interface TrainingSession { id: string; layoutId: string; state: 'idle' | 'running' | 'paused'; keystrokes: KeystrokeEvent[]; metrics: SessionMetrics; }
interface SessionMetrics { duration: number; totalKeystrokes: number; accuracy: number; errors: ErrorCountByCategory; }
interface ErrorCountByCategory { byKey: Record<string, number>; byFinger: Record<Finger, number>; byHand: Record<'left' | 'right', number>; byLayer: Record<string, number>; }
```

### Rendering Strategy
- Normalized 0-1 SVG coords per key; CSS classes for finger color
- Active key highlight via `keyboardStore.activeKeys` Set
- ISO Enter handled via custom `width`/`colspan` attributes

### QMK Parser Strategy
- Input: array of layer arrays → map keycode to scancode → extract layers
- Output: unified `KeyboardLayout` with named layers and finger map

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| QMK format variance | Medium | High | Support common format first; validate with real Sofle keymaps |
| Finger assignment accuracy | Medium | High | Start with standard Dvorak-based map; make editable later |
| SVG performance | Low | Medium | ~80-100 keys is trivial; `React.memo` on Key |
| IndexedDB edge cases | Low | Medium | Zustand `persist` handles serialization; error boundary on init |

## Success Criteria

- [ ] App boots with `pnpm dev`
- [ ] SVG keyboard renders with finger colors for 5 layouts
- [ ] QMK `keymap.json` import works
- [ ] Finger assignments correct (ASDF → pinky/ring/middle/index, JKLÑ → index/middle/ring/pinky)
- [ ] Event capture with timing (press/release)
- [ ] Error detection: wrong finger, wrong key, missed
- [ ] Session lifecycle: start → type → pause → stop → stats
- [ ] IndexedDB persists across reloads
- [ ] Analytics tracks errors by all categories
- [ ] 4 navigable pages
- [ ] >80% coverage on `core/`

## Forecast

- **Scope**: ~800-1200 lines (6-8 deliverable units)
- **Review Risk**: High — exceeds 400-line budget; **chained PRs required**
- **PR Strategy**: Feature Branch Chain (4 PRs)

| PR | Scope | Lines |
|----|-------|-------|
| #1 | Scaffolding + layout system + keyboard model | ~200 |
| #2 | SVG rendering + finger coloring | ~250 |
| #3 | Event capture + session engine + analytics | ~350 |
| #4 | Persistence + app shell + pages + tests | ~400 |

Each PR is independently buildable and testable.

## Rollback Plan

- Each PR targets a feature branch; revert individual PRs if needed
- Platform isolated from training exercise code (Phase 1+)
- IndexedDB schema versioning for safe migrations

## Dependencies

None. Requires Node.js 20+, pnpm 11.3.
