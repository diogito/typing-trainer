# Exploration: Phase 1 — Calibration

## Current State

Phase 0 is fully built and passing 70 tests. The architecture is clean:
- **Stores**: 4 Zustand slices (layout, keyboard, session, ui) handling state
- **Engine**: `SessionEngine` class with idle→running→paused→idle FSM
- **Capture**: `useEventCapture` hook maps DOM KeyboardEvent → scancode → finger via `KC_CODE_MAP`
- **Rendering**: SVG keyboard in `SvgKeyboard` with finger colors, layer overlays, active key highlighting
- **Storage**: IndexedDB via `idb` with 3 object stores (sessions, preferences, layouts)
- **Layouts**: 5 built-in layouts (QWERTY-ES, Colemak, Colemak-DH, Dvorak, custom template) with columnar finger mapping
- **Types**: Well-defined types in `types/index.ts` including `KeystrokeEvent`, `ErrorCountByCategory`, `KeyboardLayout`
- **Analytics**: `metrics.ts` with WPM, accuracy, precision, timing calculations
- **Routes**: 4 pages (Training, Layouts, Progress, Settings) via TanStack Router
- **UI**: shadcn/ui with Card, Button, Input, Select, Switch, Badge, Tabs, Separator

### Implementation Status

| Phase | Feature | Status | Details |
|-------|---------|--------|---------|
| **1a** | Mirror Mode | ✅ Fully implemented | CSS opacity fade on SVG keyboard, toggle in TrainingPage, tests passing |
| **1b** | Finger Accuracy | ⚠️ Partially implemented | Detection logic + heatmap UI complete, but `actualFinger` always equals `expectedFinger` (optimistic). Heatmap never fires in production. Fix needed: position-based finger inference in `eventCapture.ts`. Tests exist but pass with optimistic data. |
| **1c** | Posture Calibration | ✅ Fully implemented | `PostureCalibration` type (4 fields: armSeparation, wristHeight, completed, updatedAt), IndexedDB POSTURE store, `PosturePage.tsx` with sliders, tests passing |
| **1d** | Layout Customization | ✅ Fully implemented | Key label editing on `LayoutPage`, QMK JSON import via `parseQMKKeymap()`, VIA/Vial parser, tests passing |
| **1e** | Break Integration | ✅ Fully implemented | Break timer + overlay firing during training sessions, tests passing |
| **Platform Stabilization** | Live metrics, SPA nav, defaults | ✅ Fixed | Live WPM/accuracy metrics during training, SPA navigation working, break reminders enabled by default |

### Remaining Gap

Phase 1b (Finger Accuracy) is the **only incomplete phase**. The core issue:
- `eventCapture.ts` sets `actualFinger` from the layout column (same column = same finger = correct), which is optimistic
- Real fix: infer finger from **key position on screen** vs expected finger for that key position
- Until this is fixed, `detectError()` can produce false negatives (user reaches with wrong finger but we think it's correct)

### Notes on Original Design vs. Actual Implementation

- `PostureCalibration` has **4 fields** (armSeparation, wristHeight, completed, updatedAt), **not 6** — `shoulderPosition` and `screenHeight` were dropped during implementation
- `detectError()` is **NOT a stub** — it's implemented in `fingerDetection.ts` and returns real comparisons
- `actualFinger` is NOT always `'unknown'` — it's derived from layout columns but is overly optimistic

## Affected Areas

### Mirror Mode
- `components/keyboard/SvgKeyboard.tsx` — Add `opacity` prop tied to mirror mode state
- `stores/uiStore.ts` — Add `mirrorMode` preference and `fadeProgress` state
- `pages/TrainingPage.tsx` — Wire mirror mode toggle, fade-out logic on keystroke events
- `routes/layouts.tsx` or `stores/layoutStore.ts` — Mirror mode hides keyboard area

### Finger Accuracy Heatmap
- `stores/keyboardStore.ts` — Add `fingerErrors: Record<string, number>` tracking (scancode → count)
- `core/keyboard/fingerDetection.ts` — Implement real `detectError()` using layout data + expected finger
- `core/capture/eventCapture.ts` — Set `actualFinger` from context (at minimum, track `wrong-finger` errors)
- `core/session/sessionEngine.ts` — Pass column data to `recordError()` instead of `col=1`
- `components/keyboard/SvgKeyboard.tsx` — Add heatmap overlay (opacity based on error count)
- `core/analytics/metrics.ts` — Add `computeHeatmapData()` function

### Posture Calibration Page
- `types/index.ts` — New `PostureCalibration` type
- `services/storage.ts` — New `POSTURE` object store, add CRUD methods
- `stores/uiStore.ts` — Add posture state to preferences
- `pages/PosturePage.tsx` — New page with sliders and guides
- `routes/` — New route for `/posture`

### Layout Customization UI
- `stores/layoutStore.ts` — Extend with key editing, layer management
- `lib/keymapParser.ts` — Enhance to support VIA/Vial JSON formats
- `pages/LayoutPage.tsx` — Add key editing UI, import button, layer tabs
- `types/index.ts` — Extend `KeyboardLayout` with editable fields

### New Data Models Needed

```typescript
// Posture calibration data
interface PostureCalibration {
  armSeparation: number;    // 0-100, percentage
  wristHeight: number;      // 0-100, percentage
  shoulderPosition: number; // 0-100, percentage
  screenHeight: number;     // 0-100, percentage
  completed: boolean;
  updatedAt: number;
}

// Heatmap data per session
interface HeatmapEntry {
  scancode: string;
  correctKeystrokes: number;
  wrongFingerKeystrokes: number;
  totalKeystrokes: number;
}

// Mirror mode state
interface MirrorModeState {
  enabled: boolean;
  opacity: number;          // 0 = fully hidden, 1 = visible
  fadeThreshold: number;    // keys pressed before fade starts
}
```

## Approaches

### 1. Mirror Mode

**Recommended: CSS opacity on SVG keyboard with keystroke-driven animation**

The SVG keyboard already uses CSS transitions. We extend this by:
1. Adding `mirrorModeEnabled: boolean` to `uiStore`
2. When enabled, each keystroke decreases `keyboardOpacity` (stored in `uiStore`)
3. `SvgKeyboard` reads opacity from store and applies `style={{ opacity }}`
4. Add a progress indicator showing remaining keyboard visibility
5. Fade resets when session stops or mirror mode toggled off

**Why**: Leverages existing SVG infrastructure. No 3D rendering needed initially. CSS transitions handle smooth animation.

**Alternative**: Completely hide SVG, show only SVG hands overlay (more complex, deferred)

**Effort**: Low

### 2. Finger Accuracy Heatmap

**Recommended: Track per-key error counts in keyboardStore, render as SVG overlay**

1. Implement real `detectError()` using:
   - `fingerMap[scancode]` for expected finger
   - `actualFinger` from layout column analysis
   - Compare actual vs expected → `wrong-finger` error
   
2. Store error counts in `keyboardStore.fingerErrors: Record<string, number>`
3. `SvgKeyboard` renders an overlay with red-tinted rects on error-prone keys
4. Heatmap intensity based on error count (normalized)

**Technical challenge**: `actualFinger` requires knowing which finger the user *actually* used. Without hardware sensors, we infer this from:
- DOM `event.code` → layout position → column → finger mapping
- If the finger from position matches expected → correct
- If different → wrong finger
- This catches "reached with wrong finger" but not "used same finger on wrong key"

**Effort**: Medium-High (requires fixing existing stubs and extending analytics)

### 3. Posture Calibration Page

**Recommended: New page with slider-based calibration + IndexedDB persistence**

1. Add `PostureCalibration` type to `types/index.ts`
2. Add `POSTURE` object store to `storage.ts` (DB version bump to 2)
3. New `PosturePage.tsx` with:
   - 4 sliders (arm separation, wrist height, shoulder position, screen height)
   - Visual guide illustrations (simple SVG or emoji-based)
   - Save/Reset buttons
4. Store data in IndexedDB under POSTURE store
5. Optional: store `mirrorMode` settings alongside posture prefs

**Why**: Straightforward CRUD. Uses existing shadcn UI patterns. Isolated from training flow.

**Effort**: Low-Medium

### 4. Layout Customization UI

**Recommended: Key-by-key editor with QMK JSON import**

1. Extend `LayoutPage` with tabs: "Preset" | "Custom" | "Import"
2. Custom tab: show SVG keyboard where clicking a key opens an edit dialog (input field for label)
3. Import tab: file input that accepts `keymap.json`, runs `parseQMKKeymap()`, registers as custom layout
4. `layoutStore` already has `registerCustomLayout` — wire it up
5. Add VIA/Vial parser extension to `keymapParser.ts`

**Technical challenge**: `parseQMKKeymap()` currently generates **linear positions** for imported layouts. For Sofle-specific layouts, we need the actual physical keymap coordinates. Options:
- Parse Sofle-specific JSON formats that include position data
- Use a separate position mapping file per keyboard model
- Let users manually position keys (complex UX)

**Recommendation**: Start with label editing only (positions stay fixed from layout). Position-based imports are Phase 2.

**Effort**: Medium

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wrong-finger detection needs `actualFinger` but no hardware sensors exist | Heatmap may be inaccurate | Infer from layout position vs expected; document limitation |
| DB version bump (v1→v2) risks data loss on existing installs | Users lose sessions | `idb` handles upgrades atomically; add migration for posture store only |
| SVG keyboard fade-out conflicts with active key animation | Visual glitches | Use separate CSS classes; opacity on parent, fillOpacity on keys |
| QMK import generates bad positions | Custom layouts look broken | Fallback to base layout positions; warn user about approximate layout |
| `useEventCapture` refactoring to support real finger detection | Breaks existing session tracking | Keep backward compatible; new `detectError` function separate from capture hook |

## Phasing Recommendation

### Completed

| Phase | Feature | Status |
|-------|---------|--------|
| 1a | Mirror Mode | ✅ Done — CSS opacity fade, toggle UI, tests |
| 1c | Posture Calibration | ✅ Done — 4-field type, POSTURE store, page, tests |
| 1d | Layout Customization | ✅ Done — label editing, QMK import, parser, tests |
| 1e | Break Integration | ✅ Done — timer + overlay during sessions, tests |
| — | Platform Stabilization | ✅ Done — live metrics, SPA nav, break reminders on |

### Pending

| Phase | Feature | Status | Remaining Work |
|-------|---------|--------|----------------|
| 1b | Finger Accuracy | ⚠️ Partial | Fix `actualFinger` inference in `eventCapture.ts` — need position-based finger detection, not optimistic column match. Update tests with realistic negative cases. |

### Next Recommended Phase

**1b (Finger Accuracy) — fix only.** The detection infrastructure, heatmap rendering, and analytics are already built. The single missing piece is position-based finger inference in `eventCapture.ts`. When `actualFinger` is correctly inferred from key position (not just layout column), the heatmap will begin working in production.

## Ready for Proposal

**Partially.** Four of five phases (1a, 1c, 1d, 1e) plus platform stabilization are fully implemented and production-ready. Only Phase 1b has remaining work.

**Next action:** A targeted fix for `eventCapture.ts` to infer `actualFinger` from key position, not from layout column equality. This is a scoped change (~50-100 lines, one file) that unlocks the heatmap functionality already in place.

**What's already decided and implemented:**
1. Mirror mode = CSS opacity fade ✅
2. Finger detection approach = position-based (inferring finger from key position → column → finger mapping)
3. Heatmap = SVG overlay ✅
4. Posture = simple slider UI (4 fields, not 6) ✅
5. Layout customization = label editing + QMK JSON import ✅
6. Break integration = timer + overlay during sessions ✅

**The exploration document has served its purpose.** It accurately guided the implementation of 4/5 phases. The remaining gap is narrow enough to address with a focused fix rather than a full proposal cycle.
