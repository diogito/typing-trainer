import { create } from 'zustand';
import type { TargetCharState } from '@/types';
import type { Exercise } from '@/types';
import { EXERCISE_CATALOG } from '@/data/exercises';
import { validateKeystroke } from '@/lib/exerciseValidation';

// --- Types ---

interface KeystrokeResult {
  correct: boolean;
  expected: string;
  actual: string;
}

interface ExerciseSlice {
  selectedExerciseId: string | null;
  currentTarget: string;
  currentIndex: number;
  charStates: TargetCharState[];
  totalErrors: number;
  totalKeystrokes: number;
  selectExercise: (id: string) => void;
  onKeystroke: (scancode: string, key: string) => KeystrokeResult | null;
  resetSession: () => void;
  getExercise: () => Exercise | undefined;
  getCharacterStates: () => TargetCharState[];
}

// --- Store ---

export const useExerciseStore = create<ExerciseSlice>((set, get) => ({
  selectedExerciseId: null,
  currentTarget: '',
  currentIndex: 0,
  charStates: [] as TargetCharState[],
  totalErrors: 0,
  totalKeystrokes: 0,

  selectExercise: (id: string) => {
    const exercise = EXERCISE_CATALOG.find((e) => e.id === id);
    if (!exercise) return;

    const charStates: TargetCharState[] = Array.from({
      length: exercise.target.length,
    }, () => 'pending');

    set({
      selectedExerciseId: exercise.id,
      currentTarget: exercise.target,
      currentIndex: 0,
      charStates,
      totalErrors: 0,
      totalKeystrokes: 0,
    });
  },

  onKeystroke: (scancode: string, key: string) => {
    const state = get();
    if (!state.currentTarget || state.currentIndex >= state.currentTarget.length) {
      return null;
    }

    const targetChar = state.currentTarget[state.currentIndex];
    const result = validateKeystroke(targetChar, key, scancode);

    // Update character state
    const newCharStates = [...state.charStates];
    newCharStates[state.currentIndex] = result.correct ? 'correct' : 'incorrect';

    const nextIndex = state.currentIndex + 1;
    const completed = nextIndex >= state.currentTarget.length;

    if (result.correct) {
      set({
        currentIndex: nextIndex,
        totalKeystrokes: state.totalKeystrokes + 1,
        charStates: completed
          ? newCharStates.map((s, i) => (i < nextIndex ? s : 'corrected'))
          : newCharStates,
      });
    } else {
      set({
        currentIndex: nextIndex,
        totalErrors: state.totalErrors + 1,
        totalKeystrokes: state.totalKeystrokes + 1,
        charStates: completed
          ? newCharStates.map((s, i) => (i < nextIndex ? s : 'corrected'))
          : newCharStates,
      });
    }

    if (completed) {
      return null;
    }

    return result;
  },

  resetSession: () => {
    const state = get();
    const charStates: TargetCharState[] = Array.from({
      length: state.currentTarget.length,
    }, () => 'pending');

    set({
      currentIndex: 0,
      charStates,
      totalErrors: 0,
      totalKeystrokes: 0,
    });
  },

  getExercise: () => {
    const state = get();
    return EXERCISE_CATALOG.find((e) => e.id === state.selectedExerciseId);
  },

  getCharacterStates: () => {
    return get().charStates;
  },
}));
