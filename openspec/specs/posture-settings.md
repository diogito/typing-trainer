# Posture Settings (Delta)

## Purpose

Define requirements for default break reminder settings, ensuring break reminders are enabled by default to promote user health.

## Delta Changes

### CHANGED Requirement: Break Reminder Default

`DEFAULT_POSTURE.breakEnabled` in `src/types/index.ts` MUST be `true` instead of `false`. Break reminders fire after `DEFAULT_POSTURE.breakIntervalMinutes` (default 30 min) when enabled.

(Previously: break reminders were disabled by default — `breakEnabled: false`)

#### Scenario: Break reminders enabled by default

- GIVEN the app is loaded for the first time with no stored preferences
- WHEN `DEFAULT_POSTURE` is read
- THEN `breakEnabled` MUST be `true`

#### Scenario: Break interval defaults to 30 min

- GIVEN the app is loaded with default settings
- WHEN `DEFAULT_POSTURE.breakIntervalMinutes` is read
- THEN it MUST be `30`

#### Scenario: User can disable breaks

- GIVEN the app is loaded with default settings (breakEnabled: true)
- WHEN user navigates to Settings > Posture
- THEN the break reminder toggle MUST be in the ON position by default
- AND user MUST be able to toggle it OFF

#### Scenario: Existing user preferences preserved

- GIVEN an existing user who previously set `breakEnabled: false` in their stored preferences
- WHEN the app loads their saved preferences
- THEN their saved `breakEnabled: false` MUST be respected (default does not override user choice)

## REMOVED Requirements

None.

## RENAMED Requirements

None.
