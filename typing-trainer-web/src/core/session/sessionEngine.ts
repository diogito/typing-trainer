import {
  computeAccuracy,
  computePrecision,
  computeWPM,
  computeTimingMetrics,
  createErrorCount,
  recordError,
} from '../analytics/metrics';
import type {
  SessionState,
  SessionMetrics,
  KeystrokeEvent,
} from '@/types';

let sessionIdCounter = 0;

/**
 * Create a new idle session.
 */
export function createSession(layoutId: string): SessionState {
  return {
    id: `session-${++sessionIdCounter}`,
    layoutId,
    state: 'idle',
    startTime: null,
    pauseStart: undefined,
    pauseDuration: 0,
    keystrokes: [],
    metrics: null,
  };
}

/**
 * Session engine — manages lifecycle state machine.
 * idle → running → paused → running → idle
 */
export class SessionEngine {
  private state: SessionState;
  private keyColumns: Record<string, number>;

  constructor(layoutId: string, keyColumns: Record<string, number> = {}) {
    this.state = createSession(layoutId);
    this.keyColumns = keyColumns;
  }

  /**
   * Start a session.
   */
  start(): SessionState {
    if (this.state.state !== 'idle') return this.state;
    this.state.state = 'running';
    this.state.startTime = Date.now();
    return this.state;
  }

  /**
   * Pause a running session.
   */
  pause(): SessionState {
    if (this.state.state !== 'running') return this.state;
    this.state.state = 'paused';
    this.state.pauseStart = Date.now();
    return this.state;
  }

  /**
   * Resume a paused session.
   */
  resume(): SessionState {
    if (this.state.state !== 'paused') return this.state;
    this.state.state = 'running';
    if (this.state.pauseStart !== undefined) {
      const pauseEnd = Date.now();
      this.state.pauseDuration += pauseEnd - this.state.pauseStart;
      this.state.pauseStart = undefined;
    }
    return this.state;
  }

  /**
   * Stop the session and compute final metrics.
   */
  stop(): SessionState {
    if (this.state.state === 'idle') return this.state;

    const endTime = Date.now();
    if (this.state.pauseStart !== undefined) {
      // Was paused — account for pause duration
      this.state.pauseDuration += endTime - this.state.pauseStart;
      this.state.pauseStart = undefined;
    }

    const totalActiveMs =
      (this.state.startTime ? endTime - this.state.startTime : 0) -
      this.state.pauseDuration;
    const durationSeconds = totalActiveMs / 1000;

    // Compute metrics
    const errorCount = createErrorCount();
    let wrongFingerCount = 0;

    for (const keystroke of this.state.keystrokes) {
      if (keystroke.error) {
        const col = this.keyColumns[keystroke.scancode] ?? 1;
        const dir = keystroke.direction;
        if (dir === 'down' || dir === 'up') {
          recordError(
            errorCount,
            keystroke.scancode,
            keystroke.finger,
            col,
            keystroke.layer,
            dir,
          );
        }
        if (keystroke.error === 'wrong-finger') {
          wrongFingerCount++;
        }
      }
    }

    const totalKeystrokes = this.state.keystrokes.length;
    const totalErrors = this.state.keystrokes.filter((k) => k.error).length;

    this.state.metrics = {
      duration: Math.max(0, durationSeconds),
      totalKeystrokes,
      wpm: computeWPM(totalKeystrokes, Math.max(0.001, durationSeconds)),
      accuracy: computeAccuracy(totalKeystrokes, totalErrors),
      precision: computePrecision(totalKeystrokes, wrongFingerCount),
      errors: errorCount,
      timing: computeTimingMetrics(this.state.keystrokes),
    };

    this.state.state = 'idle';
    this.state.startTime = null;
    return this.state;
  }

  /**
   * Record a keystroke event.
   */
  recordKeystroke(event: KeystrokeEvent): SessionState {
    if (this.state.state !== 'running') return this.state;
    this.state.keystrokes.push(event);
    return this.state;
  }

  /**
   * Get current state.
   */
  getState(): SessionState {
    return this.state;
  }

  /**
   * Get current metrics (null if not stopped).
   */
  getMetrics(): SessionMetrics | null {
    return this.state.metrics;
  }

  /**
   * Check if a keystroke is a modifier (not a training key).
   */
  static isModifier(keycode: string): boolean {
    return [
      'KC_LCTRL', 'KC_RCTRL', 'KC_LSHIFT', 'KC_RSHIFT',
      'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI',
      'KC_CAPSLOCK', 'KC_TAB', 'KC_ESC', 'KC_BSPC',
    ].includes(keycode);
  }
}
