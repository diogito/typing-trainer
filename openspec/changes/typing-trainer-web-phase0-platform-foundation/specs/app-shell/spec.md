# App Shell

## Purpose

Application shell with navigation, routing, and page structure. SPA using TanStack Router with fixed header and responsive layout.

## Requirements

### Requirement: SPA Router Configuration

Configure TanStack Router with a root layout and four pages: Layout, Training, Progress, Settings.

| Route | Page |
|-------|------|
| / | Redirects to /training |
| /layout | Layout page |
| /training | Training page |
| /progress | Progress page |
| /settings | Settings page |

#### Scenario: Navigate to pages

- GIVEN the app is mounted
- WHEN user navigates to /training, /layout, /progress, or /settings
- THEN the corresponding page MUST render with the root layout shell

#### Scenario: Default route

- GIVEN user navigates to /
- THEN they MUST redirect to /training

### Requirement: Root Layout Shell

Consistent shell: fixed header (title + 4 nav tabs), main content area, collapsible sidebar (desktop), optional footer.

#### Scenario: Render header

- GIVEN the root layout renders
- THEN it MUST show the app title and 4 navigation tabs

#### Scenario: Active nav tab

- GIVEN user is on Training page
- THEN the Training tab MUST be visually highlighted

#### Scenario: Mobile header

- GIVEN viewport < 768px
- THEN navigation MUST collapse to hamburger or bottom bar

### Requirement: Responsive Layout

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1024px | Sidebar visible |
| 768-1023px | Sidebar collapsible |
| < 768px | Sidebar hidden, bottom nav |

#### Scenario: Desktop

- GIVEN viewport ≥ 1024px
- THEN the sidebar MUST be visible

#### Scenario: Mobile

- GIVEN viewport < 768px
- THEN the sidebar MUST be hidden with bottom navigation

### Requirement: Page Content Contracts

| Page | Required Content |
|------|-----------------|
| Layout | Layout selector, 5 options, active indicator, import |
| Training | SVG keyboard, Start/Pause/Stop, live WPM/accuracy |
| Progress | Session list table, aggregate metrics, date filter |
| Settings | Layout, color scheme, font size, import |

#### Scenario: Layout page

- GIVEN the Layout page renders
- THEN it MUST include a layout selector, active indicator, import option

#### Scenario: Training page

- GIVEN the Training page renders
- THEN it MUST include SVG keyboard, Start/Pause/Stop, live stats

#### Scenario: Progress page

- GIVEN the Progress page renders
- THEN it MUST show session table: date, layout, WPM, accuracy, duration

#### Scenario: Settings page

- GIVEN the Settings page renders
- THEN it MUST include layout, color, font, and import controls

### Requirement: shadcn/ui Components

Use shadcn/ui components for all interactive controls (Button, Select, Input, Tabs, Dialog, Toast, Card).

#### Scenario: Use shadcn Button

- GIVEN the Training page needs a button
- THEN it MUST use the shadcn/ui Button component

### Requirement: Keyboard Focus

Tab order: header → sidebar → main → footer → header. Escape closes dialogs.

#### Scenario: Tab order

- GIVEN the Training page renders
- WHEN Tab is pressed
- THEN focus MUST move: Start button → keyboard → stats → nav links

#### Scenario: Escape closes dialogs

- GIVEN a dialog is open in Settings
- WHEN Escape pressed
- THEN the dialog MUST close

## REMOVED Requirements

None.

## RENAMED Requirements

None.
