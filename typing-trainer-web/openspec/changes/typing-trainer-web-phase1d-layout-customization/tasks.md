# Tasks: Phase 1d — Layout Customization

## Review Workload Forecast

Est: ~500–650 lines | Risk: Medium | Single PR (exception-ok) | No chains.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

---

## Phase 1: Remap Editor Component

### task-60: Create KeyRemapEditor component
- Files: `src/components/keyboard/KeyRemapEditor.tsx` (new) | Deps: none | Test: Renders key grid with editable labels, editing state per key
- Accept: `<KeyRemapEditor layout={layout} layer="base" onChange={fn} />` renders keys with current labels. Clicking a key opens inline input. Validating empty input, saving updates state, triggering `onChange` callback | R-Layout-1 | ~80 LOC
- Props: `layout: KeyboardLayout`, `layer: string`, `onChange: (updatedLayout: KeyboardLayout) => void`
- Inline editing: clicking a key toggles an `<input>` overlay on the key SVG element
- Validation: reject empty/whitespace-only labels
- State: local `editingKey: string | null`, `editValue: string`
- On save: create shallow copy of layout, update `layerKeys[scancode] = newValue` in the appropriate layer object
- Export as named `KeyRemapEditor`

---

## Phase 2: Layer Selector Component

### task-61: Create LayerSelector component
- Files: `src/components/keyboard/LayerSelector.tsx` (new) | Deps: none | Test: Renders tabs for base + each custom layer, switching layer updates state
- Accept: `<LayerSelector layers={layerList} activeLayer={name} onSelect={fn} />` renders one tab per layer. Active tab highlighted. Click selects | R-Layout-2 | ~30 LOC
- Use existing shadcn `Tabs` component
- `layers` prop: `{ name: string; label: string }[]` derived from `layout.layers`
- Export as named `LayerSelector`

---

## Phase 3: Layout Action Buttons

### task-62: Add Save, Export, Delete action buttons to LayoutPage
- Files: `src/pages/LayoutPage.tsx` (edit) | Deps: task-60,61 | Test: Buttons render, Save triggers save flow, Export triggers download, Delete shows confirmation
- Accept: Three buttons appear above the keyboard preview. Save button triggers a modal/input for layout name then calls `useLayoutStore.registerCustomLayout()`. Export button generates downloadable JSON. Delete button is hidden for builtin layouts | R-Layout-3, R-Layout-4, R-Layout-6 | ~60 LOC
- Save: prompt user for layout name (use `<Input>` + `<Button>` inline or simple `<input>` element), call `useLayoutStore.registerCustomLayout(modifiedLayout)`, persist via `storageService.saveLayout()`
- Export: `new Blob([JSON.stringify(layout, null, 2)])` → `URL.createObjectURL` → `<a download>` → click → revoke
- Delete: confirm dialog (simple `window.confirm` for now), call `useLayoutStore.deleteCustomLayout(id)`, persist via `storageService.deleteLayout()`
- Builtin check: `layoutRegistry.get(id)` returns truthy for builtin, store tracks `isBuiltin: true/false`

---

## Phase 4: Layout Import Feature

### task-63: Add file import input to LayoutPage
- Files: `src/pages/LayoutPage.tsx` (edit) | Deps: none | Test: File input accepts .json, parseQMKKeymap parses correctly, new layout registered
- Accept: File input accepts `.json` files. On selection, reads file as text, parses with `parseQMKKeymap`. If valid, prompts for name and registers. If invalid, shows error | R-Layout-5 | ~40 LOC
- Use `<input type="file" accept=".json">`
- `FileReader.readAsText()` → `parseQMKKeymap(JSON.parse(text))`
- On success: prompt for name, create layout ID from name (slugify), register via `useLayoutStore.registerCustomLayout()`
- On error: show inline error message
- Export as part of LayoutPage (no separate component needed)

---

## Phase 5: LayoutStore Persistence

### task-64: Persist custom layouts to IndexedDB on every change
- Files: `src/stores/layoutStore.ts` (edit) | Deps: none | Test: registerCustomLayout saves to DB, deleteCustomLayout deletes from DB
- Accept: After `registerCustomLayout`, call `storageService.saveLayout(customLayout)`. After `deleteCustomLayout`, call `storageService.deleteLayout(id)` | ~15 LOC
- Add `storageService` import
- Ensure `registerCustomLayout` and `deleteCustomLayout` are async or fire-and-forget (use try/catch)
- On store initialization, load any custom layouts from IndexedDB

---

## Phase 6: Integration with Typing Session

### task-65: Wire remapped key labels into SvgKeyboard component
- Files: `src/components/keyboard/SvgKeyboard.tsx` (edit) | Deps: task-60 | Test: Remapped labels appear on SVG keys
- Accept: When a layout has remapped labels in the active layer, the SVG key renders the remapped label instead of the base label | R-Layout-7 | ~20 LOC
- Pass `activeLayer` from layoutStore to SvgKeyboard
- In the SVG rendering, use `layoutRegistry.getLabel(layout, scancode, activeLayer)` instead of `key.labels[activeLayer]`
- This is already handled by `layoutRegistry.getLabel()` — just ensure `activeLayer` is passed

---

## Phase 7: Verification

### task-66: Write tests
- Files: `src/components/keyboard/KeyRemapEditor.test.tsx` (new), `src/components/keyboard/LayerSelector.test.tsx` (new) | Deps: all tasks | Test: (1) KeyRemapEditor: render, edit label, empty label rejected, (2) LayerSelector: render tabs, switch layer | ~80 LOC

---

## Implementation Order Summary

```
task-60 (KeyRemapEditor) ──┐
task-61 (LayerSelector) ───┤
                            ├→ task-62 (LayoutPage actions) → task-64 (persistence)
task-63 (Layout import) ───┤
                            ├→ task-65 (SvgKeyboard wiring)
task-64 (persistence) ─────┘
                            └→ task-66 (all tests)
```

## Estimated PR Size

| Task | Est. Lines |
|------|-----------|
| task-60 (KeyRemapEditor) | ~80 |
| task-61 (LayerSelector) | ~30 |
| task-62 (LayoutPage actions) | ~60 |
| task-63 (Layout import) | ~40 |
| task-64 (LayoutStore persistence) | ~15 |
| task-65 (SvgKeyboard wiring) | ~20 |
| task-66 (all tests) | ~80 |
| **Total** | **~325** |

**Risk**: ~325 lines, under 400-line budget. Low-medium risk. Main complexity is the inline key editing in KeyRemapEditor (SVG overlay positioning) and the file import parsing pipeline.

## Next Step

Ready for `sdd-apply` (implementation phase).
