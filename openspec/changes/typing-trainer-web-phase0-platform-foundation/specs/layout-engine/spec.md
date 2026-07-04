# Keyboard Layout Engine

## Purpose

Data model and API for keyboard layouts, key definitions, and layer overlays.

## Requirements

### Requirement: Layout Definition

A keyboard layout is an immutable structure with unique ID, name, ordered keys, and per-layer label maps.

```
interface KeyboardLayout {
  id: string; name: string;
  keys: KeyboardKey[]; fingerMap: FingerMap;
  layers: Record<string, KeycapDefinition[]>;
}
```

#### Scenario: Define QWERTY layout

- GIVEN a new QWERTY layout
- WHEN instantiated with 80+ keys
- THEN it MUST have id="qwerty", readable name, and all keys with scancode, position, label

#### Scenario: Layout id uniqueness

- GIVEN two layouts
- WHEN they share the same id
- THEN the second registration MUST throw a validation error

### Requirement: KeyboardKey Model

Each physical key has: scancode, SVG position (x, y, width, height), finger, per-layer labels.

```
interface KeyboardKey {
  scancode: string;
  position: { col: number; row: number; width: number; height: number; x: number; y: number; };
  finger: Finger; labels: Record<string, string>;
}
```

#### Scenario: Standard key

- GIVEN a normal letter key (KC_A)
- THEN it MUST have width=1.0, height=1.0, valid col/row, finger assignment

#### Scenario: Wide key

- GIVEN a spacebar key
- THEN it MUST have width=6.0, height=1.0

#### Scenario: ISO Enter

- GIVEN an ISO Enter key
- THEN it MUST have a custom SVG path, width ≥ 2.0, appropriate height

### Requirement: Layer System

Multiple named layers per layout. Each layer maps scancode → label override. Default layer = "base".

```
interface Layer {
  name: string; label: string;
  keys: Record<string, string>; // sparse scancode → label
}
```

#### Scenario: Activate secondary layer

- GIVEN "base" and "numbers" layers
- WHEN "numbers" activated
- THEN keys MUST display layer-specific labels

#### Scenario: Label inheritance

- GIVEN "numbers" defines only row-2 overrides
- THEN keys NOT in the map MUST fall back to base labels

### Requirement: Built-in Layouts

Five built-in layouts: QWERTY (ES), Colemak, Colemak-DH, Dvorak, Custom (editable).

| Layout | Home Row |
|--------|----------|
| qwerty | ASDF JKLÑ |
| colemak | QWERT YUIOP |
| colemak-dh | QWERT YUIOP |
| dvorak | 'A.OE.IU' ,;LK |
| custom | ASDF JKLÑ (default) |

#### Scenario: Switch to Colemak

- GIVEN Colemak selected
- THEN keycap labels MUST reflect Colemak positions

#### Scenario: Custom defaults to QWERTY

- GIVEN a new custom layout
- THEN it MUST display QWERTY with editable labels

## REMOVED Requirements

None.

## RENAMED Requirements

None.
