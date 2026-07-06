# Navigation (Delta)

## Purpose

Define requirements for SPA navigation using TanStack Router `<Link>` component instead of plain `<a href>` tags to prevent full page reloads and preserve session state.

## Delta Changes

### CHANGED Requirement: SPA Navigation

The `LayoutShell` component MUST use TanStack Router's `<Link>` component for all internal navigation (sidebar links, top-bar nav buttons, mobile bottom nav) instead of `<a href>` tags.

(Previously: `SidebarLink` and `NavButton` components used `<a href={href}>` which caused full page reloads and destroyed Zustand store state)

#### Scenario: SPA navigation from training to progress

- GIVEN the app is on /training
- WHEN user clicks "Progress" in sidebar
- THEN the page MUST navigate to /progress WITHOUT a full page reload
- AND session state (Zustand stores) MUST be preserved

#### Scenario: SPA navigation from progress to training

- GIVEN the app is on /progress
- WHEN user clicks "Training" in sidebar
- THEN the page MUST navigate to /training WITHOUT a full page reload

#### Scenario: SPA navigation to settings

- GIVEN the app is on /training
- WHEN user clicks "Settings" in sidebar
- THEN the page MUST navigate to /settings WITHOUT a full page reload

#### Scenario: SPA navigation to layouts

- GIVEN the app is on /training
- WHEN user clicks "Layouts" in sidebar
- THEN the page MUST navigate to /layouts WITHOUT a full page reload

#### Scenario: SPA navigation to posture

- GIVEN the app is on /training
- WHEN user clicks "Posture" in sidebar
- THEN the page MUST navigate to /posture WITHOUT a full page reload

#### Scenario: Mobile bottom nav SPA navigation

- GIVEN the app is on /training on a mobile viewport
- WHEN user taps "Settings" in the bottom nav
- THEN the page MUST navigate to /settings WITHOUT a full page reload

## REMOVED Requirements

None.

## RENAMED Requirements

None.
