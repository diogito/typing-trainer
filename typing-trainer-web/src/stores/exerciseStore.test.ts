import { describe, it, expect, beforeEach } from 'vitest';
import { useExerciseStore } from './exerciseStore';
import { EXERCISE_CATALOG } from '@/data/exercises';

// Helper to reset store between tests
function resetStore() {
  useExerciseStore.getState().selectExercise(EXERCISE_CATALOG[0].id);
  useExerciseStore.getState().resetSession();
}

function getState() {
  return useExerciseStore.getState();
}

describe('exerciseStore — selectExercise', () => {
  beforeEach(() => resetStore());

  it('sets selectedExerciseId and initializes charStates', () => {
    const exercise = EXERCISE_CATALOG[3]; // symbols-1
    getState().selectExercise(exercise.id);

    const s = getState();
    expect(s.selectedExerciseId).toBe(exercise.id);
    expect(s.currentTarget).toBe(exercise.target);
    expect(s.currentIndex).toBe(0);
    expect(s.charStates.length).toBe(exercise.target.length);
    expect(s.charStates.every((st) => st === 'pending')).toBe(true);
    expect(s.totalErrors).toBe(0);
    expect(s.totalKeystrokes).toBe(0);
  });

  it('ignores invalid exercise IDs', () => {
    const beforeId = getState().selectedExerciseId;
    getState().selectExercise('non-existent');
    expect(getState().selectedExerciseId).toBe(beforeId);
  });

  it('resets counters on select', () => {
    // Simulate some activity
    getState().totalErrors = 5;
    getState().totalKeystrokes = 10;
    getState().currentIndex = 3;

    // Re-select the same exercise
    const exerciseId = getState().selectedExerciseId!;
    getState().selectExercise(exerciseId);

    const s = getState();
    expect(s.totalErrors).toBe(0);
    expect(s.totalKeystrokes).toBe(0);
    expect(s.currentIndex).toBe(0);
  });
});

describe('exerciseStore — onKeystroke correct', () => {
  beforeEach(() => resetStore());

  it('marks character as correct on match', () => {
    const exercise = getState().getExercise()!;
    const firstChar = exercise.target[0];

    // Type the exact first character
    const result = getState().onKeystroke('KeyA', firstChar);

    const s = getState();
    expect(result).not.toBeNull();
    expect(result!.correct).toBe(true);
    expect(s.currentIndex).toBe(1);
    expect(s.charStates[0]).toBe('correct');
    expect(s.totalKeystrokes).toBe(1);
    expect(s.totalErrors).toBe(0);
  });

  it('advances index on each correct keystroke', () => {
    const exercise = getState().getExercise()!;

    // Type first 5 characters correctly using actual target chars
    for (let i = 0; i < 5; i++) {
      const char = exercise.target[i];
      const scancode = char === ' ' ? 'Space' : `Key${char.toUpperCase()}`;
      getState().onKeystroke(scancode, char);
    }

    const s = getState();
    expect(s.currentIndex).toBe(5);
    expect(s.charStates.slice(0, 5).every((st) => st === 'correct')).toBe(true);
  });
});

describe('exerciseStore — onKeystroke incorrect', () => {
  beforeEach(() => resetStore());

  it('marks character as incorrect on mismatch', () => {
    const exercise = getState().getExercise()!;

    // Type a character that is NOT in the target at position 0
    getState().onKeystroke('KeyZ', 'Z');

    const s = getState();
    expect(s.charStates[0]).toBe('incorrect');
    expect(s.totalErrors).toBe(1);
    expect(s.totalKeystrokes).toBe(1);
    expect(s.currentIndex).toBe(1);
  });

  it('is case-sensitive (A !== a)', () => {
    // home-row-1 target starts with 'a'
    // Press 'A' (uppercase) instead
    const result = getState().onKeystroke('KeyA', 'A');

    expect(result).not.toBeNull();
    expect(result!.correct).toBe(false);
    expect(result!.expected).toBe('a');
    expect(result!.actual).toBe('A');
    expect(getState().totalErrors).toBe(1);
  });
});

describe('exerciseStore — auto-complete', () => {
  beforeEach(() => resetStore());

  it('marks remaining chars as corrected when exercise completes', () => {
    // Use symbols-1 which has a shorter target for faster testing
    getState().selectExercise('symbols-1');
    getState().resetSession();

    const exercise = getState().getExercise()!;

    // Type the entire target correctly
    for (let i = 0; i < exercise.target.length; i++) {
      const char = exercise.target[i];
      const scancode = char === ' ' ? 'Space' : `Key${char.toUpperCase()}`;
      getState().onKeystroke(scancode, char);
    }

    const s = getState();
    expect(s.currentIndex).toBe(exercise.target.length);
    expect(s.charStates.every((st) => st === 'correct')).toBe(true);

    // Next onKeystroke should return null (exercise done)
    expect(getState().onKeystroke('KeyA', 'a')).toBeNull();
  });
});

describe('exerciseStore — resetSession', () => {
  beforeEach(() => resetStore());

  it('resets charStates to all pending', () => {
    const exercise = getState().getExercise()!;

    // Type a few characters correctly using actual target chars
    getState().onKeystroke('KeyA', exercise.target[0]);
    getState().onKeystroke('KeyS', exercise.target[1]);

    expect(getState().charStates[0]).toBe('correct');
    expect(getState().charStates[1]).toBe('correct');

    // Reset
    getState().resetSession();

    const s = getState();
    expect(s.currentIndex).toBe(0);
    expect(s.totalErrors).toBe(0);
    expect(s.totalKeystrokes).toBe(0);
    expect(s.charStates.every((st) => st === 'pending')).toBe(true);
  });

  it('preserves selectedExerciseId after reset', () => {
    const exerciseId = EXERCISE_CATALOG[2].id;
    getState().selectExercise(exerciseId);
    getState().resetSession();

    expect(getState().selectedExerciseId).toBe(exerciseId);
    expect(getState().currentTarget).not.toBe('');
  });
});

describe('exerciseStore — getExercise', () => {
  it('returns undefined when no exercise selected', () => {
    // Start fresh — no exercise selected
    useExerciseStore.setState({
      selectedExerciseId: null,
      currentTarget: '',
      currentIndex: 0,
      charStates: [],
      totalErrors: 0,
      totalKeystrokes: 0,
    });

    expect(getState().getExercise()).toBeUndefined();
  });

  it('returns the selected exercise object', () => {
    const exercise = EXERCISE_CATALOG[5]; // code-1
    getState().selectExercise(exercise.id);
    getState().resetSession();

    const found = getState().getExercise();
    expect(found).toBeDefined();
    expect(found?.id).toBe(exercise.id);
    expect(found?.title).toBe(exercise.title);
  });
});

describe('exerciseStore — getCharacterStates', () => {
  it('returns current charStates', () => {
    const exercise = getState().getExercise()!;

    // Type one character
    getState().onKeystroke('KeyA', exercise.target[0]);

    const states = getState().getCharacterStates();
    expect(states.length).toBe(exercise.target.length);
    expect(states[0]).toBe('correct');
    expect(states[1]).toBe('pending');
  });
});
