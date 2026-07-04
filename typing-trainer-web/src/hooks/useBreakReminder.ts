import { useCallback, useEffect, useRef, useState } from 'react';
import { usePostureStore } from '@/stores/postureStore';

interface UseBreakReminderOptions {
  onReminder?: () => void;
  isTyping?: boolean;
}

export function useBreakReminder({ onReminder, isTyping = false }: UseBreakReminderOptions = {}) {
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onReminderRef = useRef(onReminder);
  const posture = usePostureStore((s) => s.posture);

  // Keep onReminderRef current to avoid stale closures
  useEffect(() => {
    onReminderRef.current = onReminder;
  }, [onReminder]);

  const start = useCallback(() => {
    if (!posture.breakEnabled) return;
    // active = true only when reminder fires, not when timer starts
    setElapsed(0);
  }, [posture.breakEnabled]);

  const pause = useCallback(() => {
    setActive(false);
  }, []);

  const dismiss = useCallback(() => {
    setActive(false);
    setElapsed(0);
  }, []);

  const reset = useCallback(() => {
    setActive(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (!posture.breakEnabled || !isTyping) return;
    // Timer runs while typing, regardless of active (overlay) state
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        const intervalMs = posture.breakIntervalMinutes * 60 * 1000;
        if (next * 1000 >= intervalMs) {
          // Fire reminder — set active to show overlay
          setActive(true);
          onReminderRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [posture.breakEnabled, posture.breakIntervalMinutes, isTyping]);

  const remaining = posture.breakEnabled
    ? Math.max(0, posture.breakIntervalMinutes * 60 - elapsed)
    : 0;

  const formattedRemaining = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`;

  return {
    active,
    elapsed,
    remaining,
    formattedRemaining,
    start,
    pause,
    dismiss,
    reset,
    enabled: posture.breakEnabled,
  };
}
