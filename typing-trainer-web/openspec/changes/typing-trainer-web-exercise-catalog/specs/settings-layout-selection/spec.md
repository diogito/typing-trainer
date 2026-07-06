# Settings Layout Selection Specification (Dynamic Layout List)

## Purpose

Replace the hardcoded layout options in SettingsPage with a dynamic list from `layoutRegistry.getLayoutIds()`.

## Requirements

### REQ-1: SettingsPage uses layoutRegistry for layout options

The SettingsPage component MUST call `layoutRegistry.getLayoutIds()` to populate the layout selector options.

#### Scenario: All built-in layouts appear

- GIVEN layoutRegistry contains qwerty-es, colemak, colemak-dh, dvorak, custom
- WHEN SettingsPage renders the layout selector
- THEN 5 options are displayed

#### Scenario: Custom layouts appear

- GIVEN a custom layout is registered with layoutRegistry
- WHEN SettingsPage renders the layout selector
- THEN the custom layout ID appears in the options

### REQ-2: Layout selection persists selected layout

When the user selects a layout from the dropdown, `useLayoutStore.setLayout()` MUST be called with the selected layout ID.

#### Scenario: Layout selection updates store

- GIVEN SettingsPage is rendered with layout "qwerty-es" currently selected
- WHEN the user selects "colemak" from the dropdown
- THEN useLayoutStore.setLayout("colemak") is called

#### Scenario: Selected value reflects store state

- GIVEN useLayoutStore has layoutId set to "colemak-dh"
- WHEN SettingsPage renders
- THEN the dropdown shows "colemak-dh" as selected

### REQ-3: Backward compatibility with hardcoded layout list

Existing SettingsPage behavior (setting layout by name string) MUST be preserved.

#### Scenario: Text input still works

- GIVEN the layout selector accepts text input
- WHEN the user types "dvorak" and saves
- THEN the layout is set to "dvorak"

## Non-goals

- Layout preview in settings
- Layout upload/import in settings
- Layout deletion in settings

## Constraints

- layoutRegistry singleton already exists at `src/core/keyboard/layoutRegistry.ts`
- Must use existing Select component
- Existing SettingsPage tests must pass

## Success Criteria

- [ ] SettingsPage calls layoutRegistry.getLayoutIds() to populate options
- [ ] All 5 built-in layouts appear in dropdown
- [ ] Registering a custom layout adds it to the dropdown
- [ ] Selecting a layout calls useLayoutStore.setLayout()
- [ ] Existing layout selection behavior is preserved
- [ ] All existing tests pass
