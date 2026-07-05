# Capability: Layout Customization

## Purpose

Define requirements for allowing users to customize keyboard layouts: remap key labels, export custom layouts as JSON, and import QMK keymap.json files. This extends the existing layout system with user-driven customization.

---

### R-Layout-1: Key Remap Editor MUST allow editing key labels per layer

The key remap editor component MUST allow the user to click on any key in the keyboard preview and edit its label for the currently active layer. Changes MUST be reflected in the store and stored to IndexedDB.

**Scenario**: Edit a key label
**Given** the user is viewing a layout with the key `KC_A` labeled "a" in the base layer
**When** the user clicks the key, edits the label to "A", and confirms
**Then** the key's `labels.base` is updated to "A"
**And** the keyboard preview re-renders with the new label

**Scenario**: Edit fails — empty label not allowed
**Given** the user is editing a key label
**When** the user clears the label and confirms
**Then** the label remains unchanged
**And** an error message is shown

---

### R-Layout-2: Layer Selector MUST allow switching between base and custom layers

The layout page MUST include a layer selector (tabs or dropdown) that allows switching between the base layer and any custom layers defined in the layout. The key remap editor operates on the selected layer.

**Scenario**: Switch to custom layer
**Given** a layout with a `numbers` custom layer
**When** the user selects the `numbers` layer tab
**Then** the key remap editor shows the labels for the `numbers` layer
**And** edits apply to the `numbers` layer, not the base

---

### R-Layout-3: Custom Layout Save MUST persist to IndexedDB

When the user saves a custom layout, the layout MUST be stored in the `layouts` IndexedDB store with a unique ID and the user-provided name. The layout MUST be immediately available in the layout selector.

**Scenario**: Save custom layout
**Given** the user has made edits to the current layout
**When** the user enters a name "My Layout" and clicks Save
**Then** a new layout is stored in IndexedDB with id `my-layout-<timestamp>`
**And** the layout appears in the layout selector
**And** switching to it shows the edited keys

---

### R-Layout-4: Layout Export MUST produce a downloadable JSON file

The layout export feature MUST generate a JSON representation of the current layout (keys, positions, finger map, layers) and trigger a browser download with a `.json` filename derived from the layout name.

**Scenario**: Export layout as JSON
**Given** the user is viewing a custom layout with edits
**When** the user clicks "Export JSON"
**Then** a file named `<layout-name>.json` is downloaded
**And** the file contains valid JSON with `id`, `name`, `keys`, `fingerMap`, and `layers` fields

---

### R-Layout-5: Layout Import MUST parse QMK keymap.json format

The layout import feature MUST accept a `keymap.json` file from QMK Configurator, parse it using `parseQMKKeymap`, create a new custom layout in the store, and persist it to IndexedDB.

**Scenario**: Import QMK keymap
**Given** a valid QMK `keymap.json` file with 2 layers
**When** the user uploads the file and enters a name "Colemak Mod"
**Then** a new custom layout is created
**And** the layout contains keys from both layers with correct labels
**And** the layout is saved to IndexedDB and appears in the selector

**Scenario**: Import fails — invalid file
**Given** a JSON file that is not a valid QMK keymap
**When** the user attempts to import
**Then** an error message is shown
**And** no new layout is created

---

### R-Layout-6: Layout Delete MUST remove from IndexedDB

The layout delete feature MUST remove a custom (non-builtin) layout from both the Zustand store and IndexedDB. The user MUST confirm before deletion.

**Scenario**: Delete custom layout
**Given** a user-created custom layout in the selector
**When** the user clicks Delete and confirms
**Then** the layout is removed from IndexedDB
**And** it is removed from the layout selector
**And** if it was the active layout, the selector reverts to the default

**Scenario**: Cannot delete builtin layout
**Given** a built-in layout (e.g., "QWERTY (ES)")
**When** the user tries to delete it
**Then** the delete action is disabled or hidden
**And** no deletion occurs

---

### R-Layout-7: Remapped keys MUST integrate with typing session

When a user is in a typing session with a custom layout that has remapped keys, the displayed text hints on the keyboard preview MUST show the remapped labels, not the original labels. The typing engine uses `event.code` (physical position), not visual labels.

**Scenario**: Typing with remapped labels
**Given** a layout where `KC_S` is remapped from "s" to "z" in the base layer
**When** the user starts a typing session
**Then** the keyboard preview shows "z" on the physical S key position
**And** typing correctly matches characters by `event.key`, not by key label
