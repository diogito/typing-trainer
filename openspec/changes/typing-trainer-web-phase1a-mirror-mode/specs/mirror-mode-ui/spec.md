# Delta for Mirror Mode UI

## ADDED Requirements

### Requirement: Mirror Mode Toggle

The system SHALL provide a toggle control on the TrainingPage that enables or disables Mirror Mode. The toggle MUST use a shadcn/ui Switch component. Mirror Mode MUST be OFF by default.

#### Scenario: Toggle appears on TrainingPage

- GIVEN the user is on the Training page
- WHEN the page renders
- THEN a "Mirror Mode" Switch toggle MUST be visible in the page header or controls area
- AND the toggle MUST be in the OFF position by default

#### Scenario: Toggle enables Mirror Mode

- GIVEN Mirror Mode is OFF
- WHEN the user toggles the Switch ON
- THEN Mirror Mode MUST become active
- AND a progress bar MUST appear below the toggle

#### Scenario: Toggle disables Mirror Mode

- GIVEN Mirror Mode is ON with any progress value
- WHEN the user toggles the Switch OFF
- THEN the keyboard MUST immediately return to full opacity (1.0)
- AND the progress bar MUST be hidden

### Requirement: Progress Bar Display

The system SHALL display a progress bar when Mirror Mode is active. The progress bar MUST use a shadcn/ui Progress component and show the current progress as a percentage (0–100%).

#### Scenario: Progress bar shows 0% initially

- GIVEN Mirror Mode is just enabled
- WHEN the progress bar renders
- THEN it MUST display 0% progress
- AND the keyboard opacity MUST be 1.0

#### Scenario: Progress bar updates smoothly

- GIVEN Mirror Mode is active with progress at 40%
- WHEN the user types correct keystrokes
- THEN the progress bar MUST animate smoothly toward the new percentage
- AND the visual transition MUST NOT be jarring

### Requirement: Progress Bar Visibility

The progress bar MUST be visible only when Mirror Mode is enabled. When Mirror Mode is OFF, the progress bar area MUST be hidden entirely (not just showing 0%).

#### Scenario: Progress bar hidden when mode is OFF

- GIVEN Mirror Mode is OFF
- WHEN the TrainingPage renders
- THEN no progress bar element MUST be visible on the page

## REMOVED Requirements

None.

## RENAMED Requirements

None.
