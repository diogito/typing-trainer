# Session Persistence Specification (Exercise Fields)

## Purpose

Extend `PersistedSession` with exercise tracking fields.

## Requirements

### REQ-1: PersistedSession gains exerciseId field

The `PersistedSession` interface in `src/types/index.ts` MUST include a new field `exerciseId: string | null`.

#### Scenario: exerciseId is optional

- GIVEN the PersistedSession interface includes `exerciseId: string | null`
- WHEN a session is created without an active exercise
- THEN `exerciseId` is null

#### Scenario: exerciseId is set when exercise was active

- GIVEN the PersistedSession interface includes `exerciseId: string | null`
- WHEN a session is created with exercise "home-row-1" active
- THEN `exerciseId` is "home-row-1"

### REQ-2: PersistedSession gains exerciseAccuracy field

The `PersistedSession` interface in `src/types/index.ts` MUST include a new field `exerciseAccuracy: number | null`.

#### Scenario: exerciseAccuracy is optional

- GIVEN the PersistedSession interface includes `exerciseAccuracy: number | null`
- WHEN a session is created without an active exercise
- THEN `exerciseAccuracy` is null

#### Scenario: exerciseAccuracy is set when exercise completed

- GIVEN the PersistedSession interface includes `exerciseAccuracy: number | null`
- WHEN a session is created with exercise accuracy of 92.5%
- THEN `exerciseAccuracy` is 92.5

### REQ-3: Backward compatibility with existing sessions

Existing persisted sessions in IndexedDB MUST NOT break when read without `exerciseId` and `exerciseAccuracy`.

#### Scenario: Legacy session reads

- GIVEN a session persisted before this change (no exerciseId/exerciseAccuracy fields)
- WHEN the session is loaded from IndexedDB
- THEN the session is returned with exerciseId=null and exerciseAccuracy=null

#### Scenario: No DB schema migration needed

- GIVEN existing sessions in IndexedDB
- WHEN the app is upgraded
- THEN all existing sessions are readable without errors

### REQ-4: Session store includes exercise fields on stop

When `sessionStore.stop()` is called, the `PersistedSession` object MUST include `exerciseId` and `exerciseAccuracy` from the exercise store.

#### Scenario: Session stopped with exercise

- GIVEN an exercise is active and the session is stopped
- WHEN sessionStore.stop() persists the session
- THEN the persisted session includes the exercise's id and accuracy

#### Scenario: Session stopped without exercise

- GIVEN no exercise is active and the session is stopped
- WHEN sessionStore.stop() persists the session
- THEN the persisted session includes exerciseId=null and exerciseAccuracy=null

## Non-goals

- Migration script for existing IndexedDB data
- Exercise-specific accuracy benchmarks
- Exercise-level historical trends

## Constraints

- No IndexedDB schema migration required (optional fields)
- TypeScript strict mode enforced
- Existing sessionStore tests must pass

## Success Criteria

- [ ] PersistedSession interface includes `exerciseId: string | null`
- [ ] PersistedSession interface includes `exerciseAccuracy: number | null`
- [ ] Existing sessions without these fields read successfully (null fallback)
- [ ] sessionStore.stop() includes exerciseId/exerciseAccuracy when exercise was active
- [ ] All 171 existing tests still pass
