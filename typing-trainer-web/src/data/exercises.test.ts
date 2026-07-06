import { describe, it, expect } from 'vitest';
import { EXERCISE_CATALOG } from './exercises';
import type { ExerciseType, TrainingLevel } from '@/types';

describe('EXERCISE_CATALOG', () => {
  it('contains exactly 9 exercises', () => {
    expect(EXERCISE_CATALOG.length).toBe(9);
  });

  it('all IDs are unique', () => {
    const ids = EXERCISE_CATALOG.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all types are valid ExerciseType values', () => {
    const validTypes: ExerciseType[] = [
      'home-row',
      'letters',
      'symbols',
      'code',
      'spanish',
      'free',
    ];
    for (const exercise of EXERCISE_CATALOG) {
      expect(validTypes).toContain(exercise.type);
    }
  });

  it('all levels are valid TrainingLevel values', () => {
    const validLevels: TrainingLevel[] = [
      'beginner',
      'basic',
      'intermediate',
      'advanced',
      'expert',
    ];
    for (const exercise of EXERCISE_CATALOG) {
      expect(validLevels).toContain(exercise.level);
    }
  });

  it('all targets are non-empty strings', () => {
    for (const exercise of EXERCISE_CATALOG) {
      expect(typeof exercise.target).toBe('string');
      expect(exercise.target.length).toBeGreaterThan(0);
    }
  });

  it('all exercises have required fields', () => {
    for (const exercise of EXERCISE_CATALOG) {
      expect(exercise.id).toBeTruthy();
      expect(exercise.title).toBeTruthy();
      expect(exercise.description).toBeTruthy();
      expect(exercise.focus).toBeInstanceOf(Array);
      expect(exercise.focus.length).toBeGreaterThan(0);
    }
  });

  it('covers at least 4 different ExerciseType values', () => {
    const types = new Set(EXERCISE_CATALOG.map((e) => e.type));
    expect(types.size).toBeGreaterThanOrEqual(4);
  });

  it('covers at least 4 different TrainingLevel values', () => {
    const levels = new Set(EXERCISE_CATALOG.map((e) => e.level));
    expect(levels.size).toBeGreaterThanOrEqual(4);
  });
});
