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
  const posture = usePostureStore((s) => s.posture);

  const start = useCallback(() => {
    if (!posture.breakEnabled) return;
    setActive(true);
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
    if (posture.breakEnabled && isTyping && active) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          const intervalMs = posture.breakIntervalMinutes * 60 * 1000;
          if (next * 1000 >= intervalMs) {
            onReminder?.();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [posture.breakEnabled, posture.breakIntervalMinutes, isTyping, active, onReminder]);

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
