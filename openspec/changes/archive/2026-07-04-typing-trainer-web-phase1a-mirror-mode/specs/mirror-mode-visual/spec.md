# Delta for Mirror Mode Visual

## ADDED Requirements

### Requirement: Keyboard Opacity

The system SHALL progressively reduce the SVG keyboard opacity as the user types correct keystrokes in Mirror Mode. The keyboard MUST start at full opacity (1.0) and decrease with each correct keystroke until reaching a minimum opacity threshold.

#### Scenario: Keyboard starts fully opaque

- GIVEN Mirror Mode is ON with 0% progress
- WHEN the keyboard renders
- THEN the SVG keyboard MUST have full opacity (1.0)

#### Scenario: Keyboard fades on correct keystrokes

- GIVEN Mirror Mode is ON with progress at 50%
- WHEN the user types a correct keystroke
- THEN the keyboard opacity MUST decrease
- AND the progress value MUST increase

#### Scenario: Keyboard reaches minimum opacity

- GIVEN Mirror Mode is ON with progress at 96%
- WHEN the user types a correct keystroke
- THEN the keyboard opacity MUST reach its minimum value (no lower than 0.08)
- AND the progress MUST reach 100%

### Requirement: Ghost Mode Class

When the keyboard opacity falls below 0.2, the system SHALL apply a "ghost mode" CSS class to the keyboard container. In ghost mode, keys remain visible as faint outlines — the keyboard becomes a non-distracting visual reference.

#### Scenario: Ghost mode activates at threshold

- GIVEN the keyboard opacity is at 0.18
- WHEN the keyboard renders
- THEN the "ghost-mode" CSS class MUST be applied to the keyboard container

#### Scenario: Ghost mode deactivates on toggle

- GIVEN Mirror Mode is ON with progress at 90% (ghost mode active)
- WHEN the user toggles Mirror Mode OFF
- THEN the "ghost-mode" class MUST be removed from the keyboard container

### Requirement: Smooth CSS Transition

The keyboard opacity change MUST use a CSS transition for visual smoothness. The transition duration SHOULD be between 200ms and 500ms to balance responsiveness with visual continuity.

#### Scenario: Opacity transition is smooth

- GIVEN the keyboard is rendering with Mirror Mode ON
- WHEN the user types a correct keystroke
- THEN the opacity change MUST animate via CSS transition (not a sudden jump)

## MODIFIED Requirements

### Requirement: Responsive Sizing

(Previously: SVG keyboard sized to fit container without opacity control)

The system SHALL size the SVG keyboard to fit its container while maintaining aspect ratio. The keyboard MUST be usable on screens ≥ 320px width and fill available space on desktop. Additionally, when Mirror Mode is active, the keyboard opacity MUST be controlled externally via a CSS opacity style that overrides the default rendering.

#### Scenario: Desktop sizing with mirror mode

- GIVEN a container 800px wide and Mirror Mode is active at 40% progress
- WHEN the keyboard renders
- THEN the SVG MUST fill the container width AND have an opacity of 0.62

#### Scenario: Mobile sizing with mirror mode

- GIVEN a container 360px wide and Mirror Mode is active
- WHEN the keyboard renders
- THEN all keys MUST remain legible (minimum touch target 28px) AND opacity MUST reflect current progress

## REMOVED Requirements

None.

## RENAMED Requirements

None.
