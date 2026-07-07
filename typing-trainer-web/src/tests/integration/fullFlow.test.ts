import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from '../../stores/sessionStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { validateKeystroke } from '../../lib/exerciseValidation';
import { EXERCISE_CATALOG } from '../../data/exercises';
import { FINGER_COLORS, type KeystrokeEvent } from '../../types';

describe('Integration: Full session flow', () => {
  beforeEach(() => {
    // Reset stores
    const { init } = useSessionStore.getState();
    init('qwerty-es');
    useKeyboardStore.setState({ activeScancodes: new Set() });
  });

  it('completes a full session: init → start → record keystrokes → stop → verify metrics', () => {
    const { start, stop, recordKeystroke, metrics, state } = useSessionStore.getState();

    start();
    expect(state.state).toBe('running');

    // Record some keystrokes
    const keystrokes: Omit<KeystrokeEvent, 'error'>[] = [
      {
        code: 'KeyA', key: 'a', scancode: 'KC_A', timestamp: 0,
        finger: 'pinky', actualFinger: 'pinky',
        isModifier: false, modifiers: [], layer: 'base',
      },
      {
        code: 'KeyS', key: 's', scancode: 'KC_S', timestamp: 100,
        finger: 'ring', actualFinger: 'ring',
        isModifier: false, modifiers: [], layer: 'base',
      },
      {
        code: 'KeyD', key: 'd', scancode: 'KC_D', timestamp: 200,
        finger: 'middle', actualFinger: 'middle',
        isModifier: false, modifiers: [], layer: 'base',
      },
    ];

    for (const ks of keystrokes) {
      recordKeystroke(ks as KeystrokeEvent);
    }

    stop();

    const finalMetrics = useSessionStore.getState().metrics;
    expect(finalMetrics).not.toBeNull();
    expect(finalMetrics!.totalKeystrokes).toBe(3);
    expect(finalMetrics!.accuracy).toBe(100);
    expect(finalMetrics!.duration).toBeGreaterThanOrEqual(0);
  });

  it('computes accuracy with errors', () => {
    const { start, stop, recordKeystroke } = useSessionStore.getState();
    start();

    // 4 correct + 1 error = 80% accuracy
    const correctKeys = ['A', 'S', 'D', 'F'];
    for (const key of correctKeys) {
      recordKeystroke({
        code: `Key${key}`, key: key.toLowerCase(), scancode: `KC_${key}`,
        timestamp: 0, finger: 'index', actualFinger: 'index',
        isModifier: false, modifiers: [], layer: 'base',
      } as KeystrokeEvent);
    }

    recordKeystroke({
      code: 'KeyX', key: 'x', scancode: 'KC_X', timestamp: 400,
      finger: 'pinky', actualFinger: 'pinky',
      isModifier: false, modifiers: [], layer: 'base',
      error: 'wrong-key',
    } as KeystrokeEvent);

    stop();
    const metrics = useSessionStore.getState().metrics;
    expect(metrics!.accuracy).toBe(80);
    expect(metrics!.totalKeystrokes).toBe(5);
  });

  it('session starts idle, transitions through states correctly', () => {
    const { init, start, pause, resume, stop, state: idleState } = useSessionStore.getState();
    init('qwerty-es');

    expect(idleState.state).toBe('idle');

    start();
    expect(useSessionStore.getState().state.state).toBe('running');

    pause();
    expect(useSessionStore.getState().state.state).toBe('paused');

    resume();
    expect(useSessionStore.getState().state.state).toBe('running');

    stop();
    expect(useSessionStore.getState().state.state).toBe('idle');
  });
});

describe('Integration: Keyboard interaction', () => {
  it('keyDown adds scancode to active set, keyUp removes it', () => {
    const { keyDown, keyUp } = useKeyboardStore.getState();

    expect(useKeyboardStore.getState().activeScancodes.has('KC_A')).toBe(false);

    keyDown('KC_A');
    expect(useKeyboardStore.getState().activeScancodes.has('KC_A')).toBe(true);

    keyUp('KC_A');
    expect(useKeyboardStore.getState().activeScancodes.has('KC_A')).toBe(false);
  });

  it('handles multiple simultaneous keys', () => {
    const { keyDown, keyUp } = useKeyboardStore.getState();

    keyDown('KC_A');
    keyDown('KC_S');
    keyDown('KC_D');

    const state = useKeyboardStore.getState();
    expect(state.activeScancodes.has('KC_A')).toBe(true);
    expect(state.activeScancodes.has('KC_S')).toBe(true);
    expect(state.activeScancodes.has('KC_D')).toBe(true);

    keyUp('KC_S');
    const state2 = useKeyboardStore.getState();
    expect(state2.activeScancodes.has('KC_S')).toBe(false);
    expect(state2.activeScancodes.has('KC_A')).toBe(true);
    expect(state2.activeScancodes.has('KC_D')).toBe(true);
  });
});

describe('Integration: Layout switching', () => {
  it('switches between built-in layouts', () => {
    const { setLayout, getLayout, layoutId } = useLayoutStore.getState();

    expect(layoutId).toBe('qwerty-es');

    setLayout('colemak');
    const colemak = getLayout();
    expect(colemak?.id).toBe('colemak');

    setLayout('dvorak');
    const dvorak = getLayout();
    expect(dvorak?.id).toBe('dvorak');

    setLayout('qwerty-es');
  });

  it('layer switching works', () => {
    const { activateLayer } = useLayoutStore.getState();
    expect(useLayoutStore.getState().activeLayer).toBe('base');

    activateLayer('numbers');
    expect(useLayoutStore.getState().activeLayer).toBe('numbers');
  });
});

describe('Integration: Finger colors', () => {
  it('returns correct color for each finger', () => {
    expect(FINGER_COLORS.pinky).toBe('#ef4444');
    expect(FINGER_COLORS.ring).toBe('#f97316');
    expect(FINGER_COLORS.middle).toBe('#eab308');
    expect(FINGER_COLORS.index).toBe('#22c55e');
    expect(FINGER_COLORS.thumb).toBe('#3b82f6');
    expect(FINGER_COLORS.other).toBe('#6b7280');
  });
});

describe('Integration: Exercise-based training flow', () => {
  beforeEach(() => {
    const { init } = useSessionStore.getState();
    init('qwerty-es');
    useKeyboardStore.setState({ activeScancodes: new Set() });
    useExerciseStore.setState({
      selectedExerciseId: null,
      currentTarget: '',
      currentIndex: 0,
      totalKeystrokes: 0,
      totalErrors: 0,
    } as any);
  });

  it('full exercise flow: select exercise → onKeystroke × N → verify exercise store state', () => {
    const { selectExercise, onKeystroke, resetSession } = useExerciseStore.getState();

    // Step 1: Select an exercise from catalog
    selectExercise('home-row-1');
    expect(useExerciseStore.getState().selectedExerciseId).toBe('home-row-1');

    const exercise = EXERCISE_CATALOG.find((e) => e.id === 'home-row-1');
    expect(exercise).toBeDefined();
    expect(exercise?.target).toContain('asdf');

    const exerciseText = exercise!.target;

    // Step 2: Type the exercise text using onKeystroke
    for (let i = 0; i < exerciseText.length; i++) {
      const char = exerciseText[i];
      const result = onKeystroke(`KC_${i}`, char);
      if (result === null) {
        // Exercise completed
        break;
      }
      expect(result.expected).toBe(char);
    }

    // Verify exercise store tracked keystrokes
    const exState = useExerciseStore.getState();
    expect(exState.totalKeystrokes).toBeGreaterThan(0);
    expect(exState.currentTarget).toBe(exerciseText);
    expect(exState.totalErrors).toBe(0);

    // Reset for next test
    resetSession();
  });

  it('exercise flow with errors: tracks error count via onKeystroke', () => {
    const { selectExercise, onKeystroke, resetSession } = useExerciseStore.getState();

    selectExercise('home-row-1');
    const exercise = EXERCISE_CATALOG.find((e) => e.id === 'home-row-1')!;
    const exerciseText = exercise.target;

    // Type first 2 keys correctly (indices 0,1)
    onKeystroke('KC_A', exerciseText[0]);
    onKeystroke('KC_S', exerciseText[1]);

    // Introduce wrong keys (indices 2,3 → target 'd' and 'f')
    onKeystroke('KC_X', 'x');  // wrong at index 2 (expecting 'd')
    onKeystroke('KC_Y', 'y');  // wrong at index 3 (expecting 'f')

    // Continue correctly at indices 4,5 (target ' ' and 'j')
    onKeystroke('KC_SPACE', ' ');
    onKeystroke('KC_J', 'j');

    const exState = useExerciseStore.getState();
    expect(exState.totalKeystrokes).toBe(6);
    expect(exState.totalErrors).toBe(2);

    resetSession();
  });

  it('validateKeystroke function works correctly with exercise text', () => {
    const exercise = EXERCISE_CATALOG.find((e) => e.id === 'home-row-1')!;
    const exerciseText = exercise.target;

    // Correct key
    const result1 = validateKeystroke(
      exerciseText[0],
      exerciseText[0],
      'KC_A',
    );
    expect(result1.correct).toBe(true);
    expect(result1.expected).toBe(exerciseText[0]);
    expect(result1.actual).toBe(exerciseText[0]);

    // Wrong key
    const result2 = validateKeystroke(
      exerciseText[0],
      'x',
      'KC_X',
    );
    expect(result2.correct).toBe(false);
    expect(result2.expected).toBe(exerciseText[0]);
    expect(result2.actual).toBe('x');
  });

  it('exercise store and session store work together: select → type → stop → exercise metadata', () => {
    const { selectExercise, resetSession } = useExerciseStore.getState();
    const { init, start, stop, recordKeystroke } = useSessionStore.getState();

    selectExercise('home-row-1');

    // Session store records keystrokes (simulating what TrainingPage does)
    init('qwerty-es');
    start();

    // Simulate 5 correct keystrokes
    for (let i = 0; i < 5; i++) {
      recordKeystroke({
        code: `Key${String.fromCharCode(65 + i)}`,
        key: String.fromCharCode(97 + i),
        scancode: `KC_${String.fromCharCode(65 + i)}`,
        timestamp: Date.now() + i * 100,
        finger: 'index',
        actualFinger: 'index',
        isModifier: false,
        modifiers: [],
        layer: 'base',
      } as KeystrokeEvent);
    }

    stop();

    // Both stores should have state
    const exState = useExerciseStore.getState();
    const metrics = useSessionStore.getState().metrics!;

    expect(exState.selectedExerciseId).toBe('home-row-1');
    expect(exState.totalKeystrokes).toBe(0); // exercise store not called in this test
    expect(metrics.totalKeystrokes).toBe(5);
    expect(metrics.accuracy).toBe(100);

    resetSession();
  });

  // --- T15: Recommendations and storage verification ---

  it('recommendations are generated from exercise session metrics', async () => {
    const { generateRecommendations } = await import('@/lib/recommendations');
    const { selectExercise, resetSession } = useExerciseStore.getState();

    selectExercise('home-row-1');

    // Low accuracy scenario should produce accuracy recommendation
    const recommendations = generateRecommendations({
      wpm: 15,
      accuracy: 80,
      totalKeystrokes: 100,
      errors: { KC_A: 10, KC_S: 10 },
      exerciseType: 'home-row',
    });

    expect(recommendations.length).toBeGreaterThan(0);

    // Find the accuracy recommendation
    const accuracyRec = recommendations.find((r) =>
      r.title.toLowerCase().includes('accuracy')
    );
    expect(accuracyRec).toBeDefined();
    expect(accuracyRec!.priority).toBe('high');

    resetSession();
  });

  it('storage service saveSession is called when session stops', async () => {
    const { init, start, stop, recordKeystroke } = useSessionStore.getState();

    init('qwerty-es');
    start();

    recordKeystroke({
      code: 'KeyA',
      key: 'a',
      scancode: 'KC_A',
      timestamp: Date.now(),
      finger: 'pinky',
      actualFinger: 'pinky',
      isModifier: false,
      modifiers: [],
      layer: 'base',
    } as KeystrokeEvent);

    stop();

    // sessionSaved should be true, meaning saveSession was called
    const { sessionSaved, state } = useSessionStore.getState();
    expect(sessionSaved).toBe(true);
    expect(state.state).toBe('idle');

    // Metrics should be correct for persisted session
    const metrics = useSessionStore.getState().metrics!;
    expect(metrics.totalKeystrokes).toBe(1);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.wpm).toBeGreaterThan(0);
    expect(metrics.duration).toBeGreaterThanOrEqual(0);
  });

  it('full backward compat: free mode session saves correctly without exercise fields', async () => {
    const { init, start, stop, recordKeystroke } = useSessionStore.getState();
    const { resetSession } = useExerciseStore.getState();

    // Ensure no exercise selected
    resetSession();

    init('qwerty-es');
    start();

    recordKeystroke({
      code: 'KeyS',
      key: 's',
      scancode: 'KC_S',
      timestamp: Date.now(),
      finger: 'ring',
      actualFinger: 'ring',
      isModifier: false,
      modifiers: [],
      layer: 'base',
    } as KeystrokeEvent);

    stop();

    // Session saved without exercise metadata
    const { sessionSaved } = useSessionStore.getState();
    expect(sessionSaved).toBe(true);

    // Verify metrics are correct (proxy for persisted session correctness)
    const metrics = useSessionStore.getState().metrics!;
    expect(metrics.totalKeystrokes).toBe(1);
    expect(metrics.accuracy).toBe(100);
  });
});
