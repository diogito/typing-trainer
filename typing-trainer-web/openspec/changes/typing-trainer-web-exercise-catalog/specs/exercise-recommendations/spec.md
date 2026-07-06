# Exercise Recommendations Specification

## Purpose

Provide rule-based training recommendations from session metrics.

## Requirements

### REQ-1: Recommendation engine exists

A new function or module `getRecommendations(metrics: SessionMetrics): TrainingRecommendation[]` MUST be created that returns 1-2 recommendations based on session performance rules.

#### Scenario: Returns 1-2 recommendations

- GIVEN valid SessionMetrics
- WHEN getRecommendations is called
- THEN the result array length is between 1 and 2 inclusive

#### Scenario: Returns empty for null metrics

- GIVEN null SessionMetrics
- WHEN getRecommendations is called
- THEN an empty array is returned

### REQ-2: Low accuracy triggers precision recommendation

When accuracy is below 90%, the recommendation MUST suggest improving precision.

#### Scenario: Accuracy 85%

- GIVEN metrics with accuracy=85
- WHEN getRecommendations is called
- THEN a recommendation with title containing "precision" or "accuracy" is returned

#### Scenario: Accuracy exactly 90%

- GIVEN metrics with accuracy=90
- WHEN getRecommendations is called
- THEN the precision recommendation is NOT triggered (boundary)

#### Scenario: Accuracy above 90%

- GIVEN metrics with accuracy=95
- WHEN getRecommendations is called
- THEN the precision recommendation is NOT triggered

### REQ-3: Symbol errors trigger symbol exercise recommendation

When the session contains symbol errors, the recommendation MUST suggest a symbols exercise.

#### Scenario: Session has symbol errors

- GIVEN metrics where errors.byKey contains keys that are symbols (e.g., '@', '#', '!')
- WHEN getRecommendations is called
- THEN a recommendation referencing a symbols exercise is returned

#### Scenario: Session has no symbol errors

- GIVEN metrics where all errors are on alphabetic keys
- WHEN getRecommendations is called
- THEN no symbols recommendation is returned

### REQ-4: High accuracy triggers level advancement

When accuracy is above 95% and WPM is above 30, the recommendation MUST suggest advancing to the next difficulty level.

#### Scenario: High WPM, high accuracy

- GIVEN metrics with accuracy=97 and wpm=40
- WHEN getRecommendations is called
- THEN a level advancement recommendation is returned

#### Scenario: High accuracy, low WPM

- GIVEN metrics with accuracy=98 and wpm=15
- WHEN getRecommendations is called
- THEN a level advancement recommendation is NOT triggered

### REQ-5: Recommendation priority

Each recommendation MUST include a `priority` field: 'high' for precision issues, 'medium' for level advancement, 'low' for maintenance.

#### Scenario: Low accuracy is high priority

- GIVEN metrics with accuracy=80
- WHEN getRecommendations is called
- THEN the returned recommendation has priority='high'

#### Scenario: Level advancement is medium priority

- GIVEN metrics with accuracy=97 and wpm=40
- WHEN getRecommendations is called
- THEN the returned recommendation has priority='medium'

## Non-goals

- AI-generated personalized recommendations
- Historical trend analysis for recommendations
- A/B testing recommendation effectiveness

## Constraints

- Rule-based only (no ML or external services)
- Returns TrainingRecommendation[] matching the type in `src/types/index.ts`
- Pure function — no side effects

## Success Criteria

- [ ] getRecommendations returns 1-2 recommendations
- [ ] Accuracy < 90% triggers precision recommendation with 'high' priority
- [ ] Symbol errors trigger symbols exercise recommendation
- [ ] Accuracy > 95% AND WPM > 30 triggers level advancement with 'medium' priority
- [ ] Accuracy = 90 exactly does NOT trigger precision recommendation
- [ ] Null metrics returns empty array
- [ ] All recommendations have valid priority values
