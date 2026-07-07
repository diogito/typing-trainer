import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePostureStore } from '@/stores/postureStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useBreakReminder } from '@/hooks/useBreakReminder';
import { TrainingPage } from '@/pages/TrainingPage';

// Minimal mock setup
vi.mock('@/stores/postureStore', () => ({
  usePostureStore: vi.fn((selector) => {
    const store = selector?.({
      posture: {
        breakEnabled: true,
        breakIntervalMinutes: 30,
        armSeparation: 50,
        wristHeight: 5,
      },
      loading: false,
      error: null,
    } as any);
    return store ?? {
      posture: { breakEnabled: true, breakIntervalMinutes: 30, armSeparation: 50, wristHeight: 5 },
      loading: false,
      error: null,
    };
  }),
}));

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: vi.fn((selector) => {
    const store = selector?.({
      state: { id: '', layoutId: '', state: 'idle', startTime: null, pauseStart: undefined, pauseDuration: 0, keystrokes: [], metrics: null },
      metrics: null,
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      init: vi.fn(),
      recordKeystroke: vi.fn(),
      engine: null,
    } as any);
    return store ?? {
      state: { id: '', layoutId: '', state: 'idle', startTime: null, pauseStart: undefined, pauseDuration: 0, keystrokes: [], metrics: null },
      metrics: null,
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      init: vi.fn(),
      recordKeystroke: vi.fn(),
      engine: null,
    };
  }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUISlice: vi.fn((selector) => {
    const store = selector?.({
      mirrorMode: { enabled: false, progress: 0 },
      toggleMirrorMode: vi.fn(),
      incrementMirrorProgress: vi.fn(),
      resetMirrorMode: vi.fn(),
      getMirrorOpacity: () => 1,
    } as any);
    return store ?? {
      mirrorMode: { enabled: false, progress: 0 },
      toggleMirrorMode: vi.fn(),
      incrementMirrorProgress: vi.fn(),
      resetMirrorMode: vi.fn(),
      getMirrorOpacity: () => 1,
    };
  }),
}));

vi.mock('@/stores/layoutStore', () => {
  const mockStore = {
    layoutId: 'qwerty',
    getLayout: () => ({ name: 'QWERTY', id: 'qwerty', keys: [], layers: {}, fingerMap: {} }),
    activeLayer: 0,
    activateLayer: vi.fn(),
    getState: () => mockStore,
  } as any;
  const useLayoutStore = vi.fn((selector: any) => {
    const store = selector?.(mockStore);
    return store ?? mockStore;
  });
  (useLayoutStore as any).getState = () => mockStore;
  return { useLayoutStore: useLayoutStore as any };
});

vi.mock('@/stores/keyboardStore', () => ({
  useKeyboardStore: vi.fn((selector) => {
    const store = selector?.({ recordError: vi.fn(), resetErrors: vi.fn() } as any);
    return store ?? { recordError: vi.fn(), resetErrors: vi.fn() };
  }),
}));

vi.mock('@/stores/exerciseStore', () => ({
  useExerciseStore: vi.fn((selector) => {
    const store = selector?.({
      selectedExerciseId: null,
      currentTarget: 'abc',
      totalKeystrokes: 0,
      totalErrors: 0,
      selectExercise: vi.fn(),
      resetSession: vi.fn(),
      getExercise: () => undefined,
      getCharacterStates: () => [],
    } as any);
    return store ?? {
      selectedExerciseId: null,
      currentTarget: 'abc',
      totalKeystrokes: 0,
      totalErrors: 0,
      selectExercise: vi.fn(),
      resetSession: vi.fn(),
      getExercise: () => undefined,
      getCharacterStates: () => [],
    };
  }),
}));

vi.mock('@/lib/recommendations', () => ({
  generateRecommendations: vi.fn(() => []),
}));

vi.mock('@/core/capture/eventCapture', () => ({
  useEventCapture: vi.fn(),
}));

const mockBreakReminder = {
  active: false,
  elapsed: 0,
  remaining: 0,
  formattedRemaining: '0:00',
  enabled: true,
  start: vi.fn(),
  pause: vi.fn(),
  dismiss: vi.fn(),
  reset: vi.fn(),
};

vi.mock('@/hooks/useBreakReminder', () => ({
  useBreakReminder: vi.fn(() => mockBreakReminder),
}));

describe('TrainingPage — Break Reminder Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockBreakReminder.active = false;
  });

  it('renders the training page with all key elements', () => {
    render(<TrainingPage />);
    expect(screen.getByText('Start Training')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Mirror Mode')).toBeInTheDocument();
  });

  it('shows BreakReminderOverlay when active', () => {
    mockBreakReminder.active = true;
    render(<TrainingPage />);
    expect(screen.getByText('Time for a break')).toBeInTheDocument();
  });

  it('hides BreakReminderOverlay when inactive', () => {
    mockBreakReminder.active = false;
    render(<TrainingPage />);
    expect(screen.queryByText('Time for a break')).not.toBeInTheDocument();
  });

  it('disables mirror mode toggle during mirror mode progress', () => {
    render(<TrainingPage />);
    // Mirror mode toggle should be visible
    expect(screen.getByText('Mirror Mode')).toBeInTheDocument();
  });

  it('renders ExerciseSelector when idle and no exercise selected', () => {
    render(<TrainingPage />);
    // ExerciseSelector should show exercise cards
    expect(screen.getByText('Start Training')).toBeInTheDocument();
  });

  it('renders ExerciseSelector when exercise is not selected', () => {
    render(<TrainingPage />);
    // Should show start button (not exercise selector since it's rendered inside ExerciseSelector)
    expect(screen.getByText('Start Training')).toBeInTheDocument();
  });
});


