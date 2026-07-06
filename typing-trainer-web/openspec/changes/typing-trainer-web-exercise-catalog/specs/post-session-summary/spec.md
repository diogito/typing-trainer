# Post-Session Summary Specification

## Purpose

Display post-training summary with metrics, errors, and recommendations.

## Requirements

### REQ-1: PostSessionSummary component exists

A new component `PostSessionSummary` MUST be created at `src/components/PostSessionSummary.tsx` that renders a modal overlay with session results.

#### Scenario: Component renders with session data

- GIVEN PostSessionSummary is rendered with SessionMetrics
- WHEN the component renders
- THEN WPM, accuracy, and total keystrokes are displayed

#### Scenario: Component renders error summary

- GIVEN PostSessionSummary is rendered with SessionMetrics containing errors
- WHEN the component renders
- THEN top 3 errors by key are displayed

### REQ-2: Metrics display

The modal MUST display: WPM, accuracy percentage, total keystrokes, error count, and top 3 errors by key.

#### Scenario: WPM is displayed

- GIVEN SessionMetrics with wpm=45.5
- WHEN PostSessionSummary renders
- THEN "45.5 wpm" is displayed

#### Scenario: Accuracy is displayed

- GIVEN SessionMetrics with accuracy=92.3
- WHEN PostSessionSummary renders
- THEN "92.3%" accuracy is displayed

#### Scenario: Top errors are displayed

- GIVEN SessionMetrics with errors.byKey: {'a': 5, 'e': 3, 'r': 2, 's': 1}
- WHEN PostSessionSummary renders
- THEN the top 3 keys ('a', 'e', 'r') are listed with counts

### REQ-3: Recommendation display

The modal MUST display 1-2 text recommendations based on session performance.

#### Scenario: Low accuracy recommendation

- GIVEN SessionMetrics with accuracy=85
- WHEN PostSessionSummary renders
- THEN a recommendation about improving precision is displayed

#### Scenario: High accuracy recommendation

- GIVEN SessionMetrics with accuracy=98
- WHEN PostSessionSummary renders
- THEN a recommendation about advancing level is displayed

### REQ-4: User actions

The modal MUST provide buttons to: start a new exercise and go to settings.

#### Scenario: New exercise button

- GIVEN PostSessionSummary is rendered
- WHEN the user clicks "New Exercise"
- THEN the modal closes and the user is taken to exercise selection

#### Scenario: Settings button

- GIVEN PostSessionSummary is rendered
- WHEN the user clicks "Settings"
- THEN the modal closes and the user navigates to Settings page

## Non-goals

- Animated chart rendering
- Export/share results
- Session history comparison

## Constraints

- Uses existing UI primitives (Card, Button)
- Uses TanStack Router for navigation
- No new dependencies

## Success Criteria

- [ ] PostSessionSummary renders WPM, accuracy, keystrokes
- [ ] Top 3 errors by key are displayed
- [ ] 1-2 recommendations displayed
- [ ] New Exercise and Settings buttons present and functional
- [ ] Modal can be dismissed
