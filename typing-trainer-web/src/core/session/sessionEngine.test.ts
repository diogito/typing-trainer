import { describe, it, expect, beforeEach } from 'vitest';
import { SessionEngine, createSession } from './sessionEngine';
import type { KeystrokeEvent } from '@/types';

describe('createSession', () => {
  it('creates an idle session', () => {
    const session = createSession('qwerty-es');
    expect(session.state).toBe('idle');
    expect(session.layoutId).toBe('qwerty-es');
    expect(session.startTime).toBeNull();
    expect(session.keystrokes).toEqual([]);
    expect(session.metrics).toBeNull();
  });
});

describe('SessionEngine lifecycle', () => {
  let engine: SessionEngine;

  beforeEach(() => {
    engine = new SessionEngine('qwerty-es');
  });

  it('starts from idle → running', () => {
    engine.start();
    expect(engine.getState().state).toBe('running');
    expect(engine.getState().startTime).not.toBeNull();
  });

  it('cannot start twice', () => {
    engine.start();
    const firstStart = engine.getState().startTime;
    engine.start();
    expect(engine.getState().state).toBe('running');
    expect(engine.getState().startTime).toBe(firstStart);
  });

  it('pauses a running session', () => {
    engine.start();
    engine.pause();
    expect(engine.getState().state).toBe('paused');
  });

  it('cannot pause an idle session', () => {
    engine.pause();
    expect(engine.getState().state).toBe('idle');
  });

  it('resumes a paused session', () => {
    engine.start();
    engine.pause();
    engine.resume();
    expect(engine.getState().state).toBe('running');
  });

  it('cannot resume a running session', () => {
    engine.start();
    engine.resume();
    expect(engine.getState().state).toBe('running');
  });

  it('stops and computes metrics', () => {
    engine.start();
    engine.stop();
    expect(engine.getState().state).toBe('idle');
    const metrics = engine.getMetrics();
    expect(metrics).not.toBeNull();
    expect(metrics!.duration).toBeGreaterThanOrEqual(0);
    expect(metrics!.totalKeystrokes).toBe(0);
    expect(metrics!.wpm).toBe(0);
    expect(metrics!.accuracy).toBe(100);
  });

  it('computes accuracy correctly: 100 keystrokes, 5 errors = 95%', () => {
    engine.start();
    for (let i = 0; i < 95; i++) {
      engine.recordKeystroke({
        code: 'KeyA',
        key: 'a',
        scancode: 'KC_A',
        timestamp: i * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
      } as KeystrokeEvent);
    }
    for (let i = 0; i < 5; i++) {
      engine.recordKeystroke({
        code: 'KeyX',
        key: 'x',
        scancode: 'KC_X',
        timestamp: (95 + i) * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
        error: 'wrong-key',
      } as KeystrokeEvent);
    }
    engine.stop();
    const metrics = engine.getMetrics()!;
    expect(metrics.accuracy).toBe(95);
    expect(metrics.totalKeystrokes).toBe(100);
  });

  it('excludes pause duration from total duration', () => {
    // Simulate: start at 0, pause at 30, resume at 45, stop at 90
    // Expected active duration: 30 (first run) + 45 (second run) = 75s
    const start1 = Date.now();
    engine.start();

    const pauseAt = start1 + 30000;
    // Mock Date.now for pause
    const originalDateNow = global.Date.now;

    // Simulate pause at 30s
    global.Date.now = () => pauseAt;
    engine.pause();

    // Resume at 45s
    const resumeAt = start1 + 45000;
    global.Date.now = () => resumeAt;
    engine.resume();

    // Stop at 90s
    const stopAt = start1 + 90000;
    global.Date.now = () => stopAt;
    engine.stop();

    global.Date.now = originalDateNow;

    const metrics = engine.getMetrics()!;
    // First active: 30s, second active: 90-45=45s, total: 75s
    expect(Math.round(metrics.duration)).toBe(75);
  });

  it('returns null metrics before stop', () => {
    engine.start();
    expect(engine.getMetrics()).toBeNull();
  });
});

describe('sessionEngine stop() column tracking', () => {
  it('uses real column from keyColumns for error hand aggregation', () => {
    // Key at column 7 → right hand
    const engine = new SessionEngine('qwerty-es', { KC_R: 7, KC_S: 2 });
    engine.start();

    for (let i = 0; i < 80; i++) {
      engine.recordKeystroke({
        code: 'KeyA',
        key: 'a',
        scancode: 'KC_A',
        timestamp: i * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
      } as KeystrokeEvent);
    }

    // 10 errors on KC_R (col 7 → right)
    for (let i = 0; i < 10; i++) {
      engine.recordKeystroke({
        code: 'KeyR',
        key: 'r',
        scancode: 'KC_R',
        timestamp: (80 + i) * 100,
        finger: 'index',
        actualFinger: 'index',
        isModifier: false,
        modifiers: [],
        layer: 'base',
        error: 'wrong-key',
        direction: 'down',
      } as KeystrokeEvent);
    }

    // 10 errors on KC_S (col 2 → left)
    for (let i = 0; i < 10; i++) {
      engine.recordKeystroke({
        code: 'KeyS',
        key: 's',
        scancode: 'KC_S',
        timestamp: (90 + i) * 100,
        finger: 'ring',
        actualFinger: 'ring',
        isModifier: false,
        modifiers: [],
        layer: 'base',
        error: 'wrong-key',
        direction: 'down',
      } as KeystrokeEvent);
    }

    engine.stop();
    const metrics = engine.getMetrics()!;
    expect(metrics.errors.byHand.right).toBe(10);
    expect(metrics.errors.byHand.left).toBe(10);
  });

  it('defaults to column 1 when keyColumns is empty', () => {
    const engine = new SessionEngine('qwerty-es', {});
    engine.start();

    for (let i = 0; i < 95; i++) {
      engine.recordKeystroke({
        code: 'KeyA',
        key: 'a',
        scancode: 'KC_A',
        timestamp: i * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
      } as KeystrokeEvent);
    }

    for (let i = 0; i < 5; i++) {
      engine.recordKeystroke({
        code: 'KeyX',
        key: 'x',
        scancode: 'KC_X',
        timestamp: (95 + i) * 100,
        finger: 'pinky',
        actualFinger: 'pinky',
        isModifier: false,
        modifiers: [],
        layer: 'base',
        error: 'wrong-key',
        direction: 'down',
      } as KeystrokeEvent);
    }

    engine.stop();
    const metrics = engine.getMetrics()!;
    // col=1 (default) → left hand
    expect(metrics.errors.byHand.left).toBe(5);
    expect(metrics.errors.byHand.right).toBe(0);
  });
});

describe('SessionEngine.isModifier', () => {
  it('identifies modifier keycodes', () => {
    expect(SessionEngine.isModifier('KC_LCTRL')).toBe(true);
    expect(SessionEngine.isModifier('KC_RSHIFT')).toBe(true);
    expect(SessionEngine.isModifier('KC_LALT')).toBe(true);
  });

  it('does not identify normal keys as modifiers', () => {
    expect(SessionEngine.isModifier('KC_A')).toBe(false);
    expect(SessionEngine.isModifier('KC_N')).toBe(false);
  });
});
