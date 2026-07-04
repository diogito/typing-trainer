# Capability: Error Heatmap Visualization

## Purpose

Define requirements for rendering error counts as a red visual overlay on the SVG keyboard, enabling users to see which keys have the most errors at a glance.

---

### R-UI-1: Keyboard MUST display red error overlay on keys with errors

The SVG keyboard (`SvgKeyboard`) MUST render a red overlay rectangle on top of each key that has accumulated one or more error count entries in `keyboardStore.fingerErrors`.

**Scenario**: Keyboard with error counts
**Given** `keyboardStore.fingerErrors` contains `{ KC_A: 3, KC_S: 1 }`
**When** `SvgKeyboard` renders
**Then** red overlays appear on the keys for `KC_A` and `KC_S`

---

### R-UI-2: Error overlay opacity MUST be proportional to error count

The red overlay opacity MUST increase linearly with error count — keys with more errors appear redder. Keys with zero errors MUST have no overlay.

**Scenario**: Gradient opacity by error count
**Given** keys with error counts of 1, 3, and 10
**When** `SvgKeyboard` renders
**Then** opacity for count=1 < opacity for count=3 < opacity for count=10

---

### R-UI-3: Keys with 1 error MUST have minimum overlay opacity of 0.15

Keys with exactly one recorded error MUST have a red overlay with opacity of at least `0.15` so the error is visibly noticeable.

**Scenario**: Single error visibility
**Given** `fingerErrors` contains `{ KC_E: 1 }`
**When** `SvgKeyboard` renders
**Then** the red overlay on `KC_E` has opacity >= 0.15

---

### R-UI-4: Keys with 5+ errors MUST have minimum overlay opacity of 0.5

Keys with five or more recorded errors MUST have a red overlay with opacity of at least `0.5` to clearly signal high-error keys.

**Scenario**: High error count visibility
**Given** `fingerErrors` contains `{ KC_R: 7 }`
**When** `SvgKeyboard` renders
**Then** the red overlay on `KC_R` has opacity >= 0.5

---

### R-UI-5: Heatmap overlay MUST be rendered as a separate SVG group layer

The heatmap overlays MUST be rendered as a distinct `<g>` element with class `error-heatmap` positioned as a sibling of the key group in the SVG, separate from key rendering, layer overlays, and finger legends.

**Scenario**: SVG structure contains heatmap layer
**Given** `SvgKeyboard` renders with error counts
**When** the SVG DOM is inspected
**Then** a `<g class="error-heatmap">` element exists as a direct child of `<svg>`
**And** it contains `<rect>` elements for error overlays

---

### R-UI-6: Heatmap overlay MUST NOT interfere with key interaction

Error overlay rectangles MUST have `pointerEvents="none"` so that key press events (pointer down/up) pass through to the underlying key `<g>` elements.

**Scenario**: Typing through heatmap
**Given** `KC_A` has 10 errors and displays a red overlay
**When** the user presses the physical key at position of `KC_A`
**Then** the key press is captured by `KeyboardKey`'s `onPointerDown` handler
**And** the red overlay does not block the event

---
