# Exercise Catalog Specification

## Purpose

Provide a static catalog of typing exercises that users can browse and select for training sessions.

## Requirements

### REQ-1: Exercise data structure

The system MUST define an `Exercise` type with the following fields: `id` (string), `title` (string), `description` (string), `level` (TrainingLevel), `type` (ExerciseType), `target` (string — the text to type), `focus` (TrainingFocus array), and `estimatedDurationSec` (number, optional).

#### Scenario: Exercise type has valid values

- GIVEN a module exports Exercise objects
- WHEN an exercise's `type` field is inspected
- THEN it is one of: 'home-row', 'letters', 'symbols', 'code', 'spanish', 'free'

#### Scenario: Exercise level has valid values

- GIVEN a module exports Exercise objects
- WHEN an exercise's `level` field is inspected
- THEN it is one of: 'beginner', 'basic', 'intermediate', 'advanced', 'expert'

### REQ-2: Exercise catalog contains 9 exercises

The module `src/data/exercises.ts` MUST export an array of exactly 9 Exercise objects covering at least 4 different ExerciseType values and 4 different TrainingLevel values.

#### Scenario: Catalog has 9 exercises

- GIVEN the exercise catalog module is imported
- WHEN the exported array length is checked
- THEN it equals 9

#### Scenario: Catalog covers diverse types and levels

- GIVEN the exercise catalog is loaded
- WHEN the set of unique ExerciseType values is computed
- THEN the set contains at least 4 distinct types

### REQ-3: Exercise target text is non-empty

Each exercise's `target` field MUST be a non-empty string.

#### Scenario: Empty target is rejected

- GIVEN a function validates an Exercise
- WHEN an exercise with `target: ""` is validated
- THEN the validation fails

#### Scenario: Target with whitespace passes

- GIVEN a function validates an Exercise
- WHEN an exercise with `target: " "` is validated
- THEN the validation passes

### REQ-4: Exercise IDs are unique

All exercise `id` values in the catalog MUST be unique (no duplicates).

#### Scenario: Duplicate ID detected

- GIVEN the exercise catalog array
- WHEN all `id` values are collected into a Set
- THEN the Set size equals the array length

## Non-goals

- Dynamic exercise creation (user-generated exercises)
- Exercise difficulty auto-adjustment
- Multi-language exercise content

## Constraints

- No new dependencies
- TypeScript strict mode enforced
- `Exercise` type already exists in `src/types/index.ts`

## Success Criteria

- [ ] `src/data/exercises.ts` exports array of exactly 9 Exercise objects
- [ ] Each exercise has all required fields
- [ ] All exercise IDs are unique
- [ ] At least 4 ExerciseType values covered
- [ ] At least 4 TrainingLevel values covered
