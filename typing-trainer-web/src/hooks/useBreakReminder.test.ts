import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as Storage from '@/services/storage';
import { usePostureStore } from '../stores/postureStore';
import { useBreakReminder } from './useBreakReminder';
import { DEFAULT_POSTURE, type PostureCalibration } from '@/types';

vi.mock('@/services/storage', () => ({
  storageService: {
    loadPosture: vi.fn(),
    savePosture: vi.fn(),
  },
}));

describe('useBreakReminder', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE },
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns default state', () => {
    const { result } = renderHook(() => useBreakReminder());
    expect(result.current.active).toBe(false);
    expect(result.current.elapsed).toBe(0);
    expect(result.current.enabled).toBe(true);
  });

  it('starts timer when enabled and typing', () => {
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE, breakEnabled: true, breakIntervalMinutes: 1 },
    });

    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useBreakReminder({ isTyping: true }),
    );

    act(() => result.current.start());
    // start() resets elapsed but does NOT set active (active only when timer fires)
    expect(result.current.active).toBe(false);
    expect(result.current.elapsed).toBe(0);

    // After 60 seconds, timer fires and sets active to true
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.active).toBe(true);

    vi.useRealTimers();
  });

  it('does not start when break is disabled', () => {
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE, breakEnabled: false },
    });

    const { result } = renderHook(() =>
      useBreakReminder({ isTyping: true }),
    );

    act(() => result.current.start());
    expect(result.current.active).toBe(false);
  });

  it('dismisses and resets the timer', () => {
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE, breakEnabled: true },
    });

    const { result } = renderHook(() =>
      useBreakReminder({ isTyping: true }),
    );

    act(() => result.current.start());
    act(() => result.current.dismiss());
    expect(result.current.active).toBe(false);
    expect(result.current.elapsed).toBe(0);
  });

  it('pauses and resumes', () => {
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE, breakEnabled: true, breakIntervalMinutes: 1 },
    });

    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useBreakReminder({ isTyping: true }),
    );

    act(() => result.current.start());
    expect(result.current.active).toBe(false);
    expect(result.current.elapsed).toBe(0);

    // Advance time — timer fires, active becomes true
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.active).toBe(true);

    // Pause (dismiss the active overlay)
    act(() => result.current.pause());
    expect(result.current.active).toBe(false);

    // Start a new interval — resets but does not immediately activate
    act(() => result.current.start());
    expect(result.current.active).toBe(false);
    expect(result.current.elapsed).toBe(0);

    // Advance time again — should fire again
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.active).toBe(true);

    vi.useRealTimers();
  });

  it('calls onReminder when interval elapses', () => {
    usePostureStore.setState({
      posture: { ...DEFAULT_POSTURE, breakEnabled: true, breakIntervalMinutes: 1 },
    });

    vi.useFakeTimers();
    const onReminder = vi.fn();

    const { result } = renderHook(() =>
      useBreakReminder({ onReminder, isTyping: true }),
    );

    act(() => result.current.start());

    // Advance 60 seconds
    act(() => vi.advanceTimersByTime(60_000));

    expect(onReminder).toHaveBeenCalled();
  });
});
