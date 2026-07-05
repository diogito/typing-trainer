# Layout System

## Purpose

Import, parse, and manage keyboard layouts including QMK/VIA/Vial keymap JSON files. The layout system is responsible for loading built-in layouts and user-imported layouts, extracting named layers, and providing a unified `KeyboardLayout` data structure.

## Requirements

### Requirement: QMK keymap.json Parser

The system SHALL parse QMK/VIA/Vial `keymap.json` files and convert them into the internal `KeyboardLayout` format. The parser MUST:

1. Accept JSON with a `layers` key (array of arrays of keycodes).
2. Map each keycode (e.g., `KC_A`, `KC_ESC`, `KC_LCTRL`) to a scancode.
3. Extract named layers from the layer arrays.
4. Generate keycap labels from keycode names (stripping the `KC_` prefix).

```
function parseQMKKeymap(json: QMKKeymapInput): KeyboardLayout;
```

#### Scenario: Parse simple QWER keymap

- GIVEN a QMK keymap.json with one layer containing ["KC_Q","KC_W","KC_E","KC_R"]
- WHEN parseQMKKeymap is called
- THEN the result MUST be a KeyboardLayout with 4 keys, each mapping the correct scancode

#### Scenario: Parse multi-layer keymap

- GIVEN a QMK keymap.json with two layers: ["KC_A","KC_S"] and ["KC_1","KC_2"]
- WHEN parseQMKKeymap is called
- THEN the result MUST have 2 named layers, each with 2 keys and correct label overrides

#### Scenario: Parse with KC_ prefix

- GIVEN a keycode "KC_LSHIFT"
- WHEN it is processed by the parser
- THEN it MUST map to the scancode "KC_LSHIFT" and produce label "LSHIFT"

### Requirement: KC_ Code to Scancode Mapping

The system SHALL maintain a comprehensive mapping from QMK KC_ codes to DOM `event.code` values and internal scancodes. This map MUST cover at minimum:

- All alpha keys (KC_A through KC_Z)
- Number row (KC_1 through KC_0)
- Common modifiers (KC_LSHIFT, KC_RSHIFT, KC_LCTRL, KC_RCTRL, KC_LALT, KC_LGUI)
- Navigation cluster (KC_HOME, KC_END, KC_PGUP, KC_PGDN, KC_INS, KC_DEL)
- Function row (KC_F1 through KC_F12)
- Enter/Backspace (KC_ENTER, KC_BSPC, KC_TAB)
- Punctuation (KC_DOT, KC_COMMA, KC_SLASH, KC_SEMICOLON, KC_QUOTE, KC_HASH, KC_LBRC, KC_RBRC, KC_BSLS)
- Spanish-specific (KC_NNO, KC_ACCENT_GRAVE)

#### Scenario: KC_A maps correctly

- GIVEN the KC_ code map
- WHEN KC_A is looked up
- THEN it MUST return scancode "KeyA" and DOM code "KeyA"

#### Scenario: Unknown KC_ code

- GIVEN an unrecognized KC_ code (e.g., KC_AAA)
- WHEN it is encountered in a keymap.json
- THEN the parser MUST skip it with a warning and NOT crash

### Requirement: Built-in Layout Definitions

The system SHALL ship with five pre-defined built-in layouts (QWERTY, Colemak, Colemak-DH, Dvorak, Custom Template) stored as JSON data files. Each built-in layout MUST include complete key definitions and finger maps.

#### Scenario: Load Colemak built-in

- GIVEN the app initializes
- WHEN the Colemak layout is requested
- THEN the system MUST return a complete KeyboardLayout with Colemak key positions and finger map

### Requirement: Custom Layout CRUD

The system SHALL allow users to create, edit, and delete custom layouts. Custom layouts are stored in IndexedDB (see data-persistence spec).

#### Scenario: Create a custom layout

- GIVEN the user opens the layout editor
- WHEN they modify KC_T label to "Ñ" and save
- THEN the custom layout MUST persist with the modified label

#### Scenario: Delete a custom layout

- GIVEN a user-created custom layout exists
- WHEN the user deletes it
- THEN it MUST be removed from IndexedDB and the layout list

### Requirement: Layout Import

The system SHALL provide a UI control to import a QMK keymap.json file. Imported layouts are saved as user layouts with a generated name.

#### Scenario: Import keymap.json

- GIVEN the user clicks "Import keymap.json" and selects a file
- WHEN the parser succeeds
- THEN a new user layout MUST be created with the file's layers and added to the layout list

#### Scenario: Import fails

- GIVEN the user selects a malformed JSON file
- WHEN the import is attempted
- THEN the system MUST display an error message and NOT create a layout

## REMOVED Requirements

None.

## RENAMED Requirements

None.
