# Keyboard Rendering

## Purpose

Render a 2D SVG keyboard that is responsive, interactive, and color-coded by finger assignment. The keyboard component reflects the current layout, layer, and active key states.

## Requirements

### Requirement: SVG Rendering

The system SHALL render the keyboard as a single SVG `<svg>` element containing one `<g>` per key. Each key is a `<rect>` (or `<path>` for wide/ISO keys) with CSS classes for finger color and active state.

```
interface SVGKeyboardProps {
  layout: KeyboardLayout;
  activeScancodes: Set<string>;
  layerName: string;
  onKeydown?: (scancode: string) => void;
  onKeyup?: (scancode: string) => void;
}
```

#### Scenario: Render QWERTY layout

- GIVEN a QWERTY layout with 80 keys
- WHEN the SVGKeyboard component mounts
- THEN the SVG MUST contain 80 key elements positioned according to each key's position property

#### Scenario: Render ISO Enter

- GIVEN a layout with ISO Enter (KC_NON_2)
- WHEN the SVG renders
- THEN the Enter key MUST have a taller/ISO-shaped polygon spanning 2 rows

### Requirement: Finger Color Coding

The system SHALL apply a CSS class to each key based on its finger assignment. The default color palette is:

| Finger | Color |
|--------|-------|
| pinky | `#ef4444` (red) |
| ring | `#f97316` (orange) |
| middle | `#eab308` (yellow) |
| index | `#22c55e` (green) |
| thumb | `#3b82f6` (blue) |
| other | `#6b7280` (gray) |

#### Scenario: Pinky key rendering

- GIVEN the keyboard renders with QWERTY layout
- WHEN the key KC_Q is rendered
- THEN it MUST have a CSS class corresponding to the pinky color (e.g., `finger-pinky`)

#### Scenario: Color override

- GIVEN the user customizes finger colors in Settings
- WHEN the keyboard renders
- THEN the custom colors MUST replace the defaults

### Requirement: Active Key Highlight

The system SHALL highlight pressed keys with a visual overlay (e.g., white stroke, darker background, or drop-shadow) when their scancode is in the active set.

#### Scenario: Key press highlight

- GIVEN the keyboard is rendering
- WHEN a key is pressed and its scancode is in `activeScancodes`
- THEN the key MUST display an active highlight state

#### Scenario: Key release unhighlight

- GIVEN a key is highlighted as active
- WHEN the key is released and removed from `activeScancodes`
- THEN the active highlight MUST be removed

### Requirement: Layer Label Overlay

The system SHALL display layer-specific labels on keys when a non-base layer is active. Base layer shows default labels.

#### Scenario: Numbers layer labels

- GIVEN the "numbers" layer is active
- WHEN the top number row (Q-P) keys render
- THEN they MUST show "1 2 3 4 5 6 7 8 9 0" instead of "Q W E R T Y U I O P"

### Requirement: Responsive Sizing

The system SHALL size the SVG keyboard to fit its container while maintaining aspect ratio. The keyboard MUST be usable on screens ≥ 320px width (mobile) and fill available space on desktop.

#### Scenario: Desktop sizing

- GIVEN a container 800px wide
- WHEN the keyboard renders
- THEN the SVG MUST fill the container width with proportional key sizing

#### Scenario: Mobile sizing

- GIVEN a container 360px wide
- WHEN the keyboard renders
- THEN all keys MUST remain legible (minimum touch target 28px)

### Requirement: Key Shape Fidelity

The system MUST render keys with realistic relative sizes: normal keys (1.0×), spacebar (~6×), Enter (ISO/ANSI variants), Shift (1.75× or 2.25×), Backspace (1.5×), and tab (1.25×).

#### Scenario: Spacebar width

- GIVEN the keyboard renders
- WHEN the spacebar is rendered
- THEN its width MUST be proportional to ~6 normal keys

#### Scenario: Shift key width

- GIVEN the keyboard renders
- WHEN left and right Shift keys are rendered
- THEN each MUST be wider than a normal key (≥ 1.5×)

## REMOVED Requirements

None.

## RENAMED Requirements

None.
