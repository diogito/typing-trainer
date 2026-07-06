# Exercise Selection Specification

## Purpose

Provide UI for browsing, filtering, and selecting exercises from the catalog.

## Requirements

### REQ-1: ExerciseSelector component exists

A new component `ExerciseSelector` MUST be created at `src/components/ExerciseSelector.tsx` that renders a grid of exercise cards.

#### Scenario: Component renders exercise cards

- GIVEN the ExerciseSelector component is mounted with an exercise catalog
- WHEN the component renders
- THEN one card is displayed per exercise in the catalog

#### Scenario: Card displays exercise info

- GIVEN an exercise card is rendered
- WHEN the card is inspected
- THEN it displays the exercise title, description, level, and type

### REQ-2: Filter by exercise type and level

The ExerciseSelector MUST provide filter controls for ExerciseType and TrainingLevel.

#### Scenario: Filtering by type

- GIVEN an ExerciseSelector with 9 exercises of mixed types
- WHEN the user selects "symbols" type filter
- THEN only exercises with type "symbols" are displayed

#### Scenario: Filtering by level

- GIVEN an ExerciseSelector with 9 exercises of mixed levels
- WHEN the user selects "beginner" level filter
- THEN only exercises with level "beginner" are displayed

#### Scenario: Combined filters

- GIVEN an ExerciseSelector with exercises of mixed types and levels
- WHEN the user selects type "code" and level "intermediate"
- THEN only exercises matching BOTH filters are displayed

#### Scenario: Clearing filters

- GIVEN filtered results are displayed
- WHEN the user clears all filters
- THEN all 9 exercises are displayed again

### REQ-3: Exercise selection sets current exercise

When the user clicks an exercise card, the exercise store's `selectExercise()` action MUST be called with the selected exercise.

#### Scenario: Click exercise card

- GIVEN an ExerciseSelector is rendered with an exercise catalog
- WHEN the user clicks an exercise card
- THEN the exercise store's `currentExercise` is set to the selected exercise

#### Scenario: Click selected exercise

- GIVEN an exercise is already selected
- WHEN the user clicks the same exercise card
- THEN the exercise store's `resetExercise()` is called (restarts the exercise)

## Non-goals

- Drag-and-drop exercise reordering
- Exercise favorites or bookmarks
- Preview mode (typing the exercise without starting a session)

## Constraints

- ExerciseSelector is a presentational component — no store mutation directly
- Must use existing UI primitives (Card, Badge, etc.)
- Must use Zustand `exerciseStore` actions

## Success Criteria

- [ ] ExerciseSelector renders at least one card per exercise
- [ ] Type and level filters work independently and combined
- [ ] Clearing filters restores full catalog
- [ ] Clicking a card calls `exerciseStore.selectExercise()`
- [ ] Clicking already-selected card calls `exerciseStore.resetExercise()`
