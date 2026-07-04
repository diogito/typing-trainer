# Data Persistence

## Purpose

Persist training sessions, user preferences, and custom layouts to IndexedDB via Zustand's `persist` middleware with the `indexeddb` adapter.

## Requirements

### Requirement: IndexedDB Storage

The system SHALL use IndexedDB as persistent storage via Zustand `persist` + `indexeddb` adapter. All data MUST be JSON-serializable (or use custom serializer for Date).

#### Scenario: Store a session

- GIVEN a completed TrainingSession
- WHEN it is saved
- THEN it MUST be stored in IndexedDB under the `sessions` store

#### Scenario: Load a session

- GIVEN a session was previously saved
- WHEN the app reloads and requests it by ID
- THEN it MUST be returned with all fields intact

### Requirement: Session Storage

Completed sessions MUST be persisted with unique ID, timestamp, layout ID, and full keystroke data.

```
interface PersistedSession {
  id: string; layoutId: string; startTime: number;
  duration: number; totalKeystrokes: number;
  accuracy: number; wpm: number;
  errors: ErrorCountByCategory; createdAt: number;
}
```

#### Scenario: Auto-save on stop

- GIVEN a session stops with metrics
- WHEN the stop transition completes
- THEN the session MUST be written to IndexedDB

#### Scenario: Limit stored sessions

- GIVEN 100 sessions stored
- WHEN a new session is saved
- THEN only the 50 most recent MUST be retained (oldest evicted)

### Requirement: Preferences Storage

The system SHALL persist: `selectedLayoutId` (default "qwerty"), `fingerColorScheme` ("default"), `customFingerMap` (null), `fontSize` (16), `showLayerIndicator` (true).

#### Scenario: Persist layout preference

- GIVEN the user selects Colemak
- WHEN saved
- THEN `selectedLayoutId` MUST be "colemak" in IndexedDB

#### Scenario: Load preferences on init

- GIVEN preferences exist in IndexedDB
- WHEN the app initializes
- THEN the selected layout MUST be the saved one

### Requirement: Layout Profile Storage

User-created layouts MUST be stored in a `layouts` store, fully self-contained (keys, finger map, layers).

#### Scenario: Save custom layout

- GIVEN a custom layout with modified labels
- WHEN saved
- THEN it MUST be stored with a unique ID and user-provided name

#### Scenario: Delete persisted layout

- GIVEN a custom layout exists
- WHEN the user deletes it
- THEN it MUST be removed from IndexedDB

### Requirement: Storage Error Handling

On IndexedDB failure (private browsing, quota), the system MUST: (1) log silently, (2) fall back to in-memory state, (3) show a toast for session saves.

#### Scenario: IndexedDB unavailable

- GIVEN IndexedDB write fails
- WHEN the user stops a session
- THEN metrics MUST still display (in-memory) AND a toast MUST explain

#### Scenario: Private browsing

- GIVEN IndexedDB is blocked (Safari private)
- WHEN the app initializes
- THEN it MUST start in degraded mode without crashing AND show a non-intrusive banner

## REMOVED Requirements

None.

## RENAMED Requirements

None.
