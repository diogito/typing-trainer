# Finger Assignment

## Purpose

Define how physical keys (identified by scancode) are mapped to fingers using the columnar typing technique. Each column is assigned to one fixed finger; fingers move ONLY vertically on their column.

## Requirements

### Requirement: Columnar Finger Map

The system SHALL assign each scancode to exactly one finger using a columnar model. The columnar map is per-layout: different layouts have different home rows, so finger-to-column mapping shifts.

```
type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' | 'other';

interface FingerMap {
  [scancode: string]: Finger;
}
```

#### Scenario: QWERTY columnar map — left hand

- GIVEN the QWERTY layout is loaded
- WHEN the finger map is queried for scancodes Q, A, Z
- THEN all three MUST be assigned to 'pinky' (same column)

#### Scenario: QWERTY columnar map — left index

- GIVEN the QWERTY layout is loaded
- WHEN the finger map is queried for scancodes R, T, F, G, V, B
- THEN all six MUST be assigned to 'index' (same column, wider index column)

#### Scenario: Colemak columnar map — different home row

- GIVEN the Colemak layout is loaded
- WHEN the finger map assigns home row keys Q, W, E, T
- THEN Q=pinky, W=ring, E=middle, T=index (shifted because home row changed)

### Requirement: Finger-to-Column Mapping Rule

The system SHALL enforce the columnar constraint: a finger is responsible for ALL keys in a single vertical column (same `position.col`) on its assigned side (left/right).

| Column | QWERTY Finger | Side |
|--------|---------------|------|
| 1 | pinky | left |
| 2 | ring | left |
| 3 | middle | left |
| 4 | index | left |
| 5 | index | right |
| 6 | middle | right |
| 7 | ring | right |
| 8 | pinky | right |

#### Scenario: Columnar constraint — pinky column

- GIVEN the QWERTY finger map
- WHEN the finger assigned to column 1 is determined
- THEN ALL keys in column 1 (regardless of row) MUST be assigned to 'pinky'

#### Scenario: Columnar constraint — index columns

- GIVEN the finger map
- WHEN columns 4 and 5 are checked
- THEN ALL keys in both columns MUST be assigned to 'index'

#### Scenario: Out-of-range key

- GIVEN a scancode not defined in any finger map
- WHEN its finger is queried
- THEN it MUST return 'other'

### Requirement: Finger Detection

The system SHALL determine the expected finger for any scancode by looking it up in the current layout's finger map. This is used for error detection in event capture.

#### Scenario: Expected finger lookup

- GIVEN the user is on Colemak layout
- WHEN key 'W' (KC_W) is pressed
- THEN the expected finger MUST be 'ring'

### Requirement: Per-Layout Finger Config

The system SHALL allow finger maps to be overridden per layout. Built-in layouts ship with correct columnar maps; custom layouts default to the QWERTY columnar map but are editable.

#### Scenario: Custom layout finger override

- GIVEN a user is editing their custom layout
- WHEN they reassign KC_T from 'index' to 'middle'
- THEN subsequent event capture MUST treat KC_T presses as expected 'middle' finger

## REMOVED Requirements

None.

## RENAMED Requirements

None.
