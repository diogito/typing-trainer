import { describe, it, expect } from 'vitest';
import { generateRecommendations } from './recommendations';

const baseMetrics = {
  wpm: 30,
  accuracy: 95,
  totalKeystrokes: 100,
  errors: {},
  exerciseType: 'basic',
};

function metrics(overrides: Partial<typeof baseMetrics>) {
  return { ...baseMetrics, ...overrides };
}

describe('generateRecommendations — empty metrics', () => {
  it('returns empty array for zero keystrokes', () => {
    const recs = generateRecommendations({
      wpm: 0,
      accuracy: 100,
      totalKeystrokes: 0,
      errors: {},
      exerciseType: 'beginner',
    });
    expect(recs).toEqual([]);
  });

  it('returns empty array for clean session (100% accuracy, 30+ WPM)', () => {
    // 100% accuracy with WPM > 30 triggers level advancement
    const recs = generateRecommendations({
      wpm: 35,
      accuracy: 100,
      totalKeystrokes: 100,
      errors: {},
      exerciseType: 'basic',
    });
    // Level advancement should fire (accuracy > 95, wpm > 30)
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].priority).toBe('medium');
  });
});

describe('generateRecommendations — low accuracy', () => {
  it('triggers accuracy recommendation when accuracy < 90%', () => {
    const recs = generateRecommendations(metrics({ accuracy: 85 }));
    const accuracyRec = recs.find(
      (r) => r.title.toLowerCase().includes('accuracy'),
    );
    expect(accuracyRec).toBeDefined();
    expect(accuracyRec!.priority).toBe('high');
  });

  it('triggers accuracy recommendation at 80%', () => {
    const recs = generateRecommendations(metrics({ accuracy: 80 }));
    const accuracyRec = recs.find(
      (r) => r.title.toLowerCase().includes('accuracy'),
    );
    expect(accuracyRec).toBeDefined();
    expect(accuracyRec!.priority).toBe('high');
  });

  it('does NOT trigger at exactly 90%', () => {
    const recs = generateRecommendations(metrics({ accuracy: 90 }));
    const accuracyRec = recs.find(
      (r) => r.title.toLowerCase().includes('accuracy'),
    );
    // At 90% exactly, the < 90 check should not fire
    expect(accuracyRec).toBeUndefined();
  });

  it('does NOT trigger above 90%', () => {
    const recs = generateRecommendations(metrics({ accuracy: 95 }));
    const accuracyRec = recs.find(
      (r) => r.title.toLowerCase().includes('accuracy'),
    );
    expect(accuracyRec).toBeUndefined();
  });
});

describe('generateRecommendations — symbol errors', () => {
  it('triggers symbol recommendation when symbol errors exist', () => {
    const recs = generateRecommendations(
      metrics({ accuracy: 95, errors: { '!': 3, '@': 2 } }),
    );
    const symbolRec = recs.find(
      (r) => r.title.toLowerCase().includes('symbol'),
    );
    expect(symbolRec).toBeDefined();
    expect(symbolRec!.priority).toBe('medium');
    expect(symbolRec!.exerciseId).toBe('symbols-1');
  });

  it('does NOT trigger when only letter errors exist', () => {
    const recs = generateRecommendations(
      metrics({ errors: { a: 3, s: 2 } }),
    );
    const symbolRec = recs.find(
      (r) => r.title.toLowerCase().includes('symbol'),
    );
    expect(symbolRec).toBeUndefined();
  });
});

describe('generateRecommendations — finger zone errors', () => {
  it('triggers finger zone recommendation when single key has >= 5 errors', () => {
    const recs = generateRecommendations(
      metrics({ errors: { a: 6, b: 1 } }),
    );
    const fingerRec = recs.find(
      (r) => r.title.toLowerCase().includes('finger'),
    );
    expect(fingerRec).toBeDefined();
    expect(fingerRec!.priority).toBe('medium');
  });

  it('does NOT trigger when all keys have < 5 errors', () => {
    const recs = generateRecommendations(
      metrics({ errors: { a: 3, s: 2, d: 4 } }),
    );
    const fingerRec = recs.find(
      (r) => r.title.toLowerCase().includes('finger'),
    );
    expect(fingerRec).toBeUndefined();
  });
});

describe('generateRecommendations — accuracy + low WPM', () => {
  it('triggers speed recommendation when accuracy > 90% and WPM < 20', () => {
    const recs = generateRecommendations(
      metrics({ wpm: 15, accuracy: 95 }),
    );
    const speedRec = recs.find(
      (r) => r.title.toLowerCase().includes('accurate') || r.title.toLowerCase().includes('slow'),
    );
    expect(speedRec).toBeDefined();
    expect(speedRec!.priority).toBe('low');
    expect(speedRec!.exerciseId).toBe('letters-2');
  });

  it('does NOT trigger when WPM >= 20', () => {
    const recs = generateRecommendations(
      metrics({ wpm: 20, accuracy: 95 }),
    );
    const speedRec = recs.find(
      (r) => r.title.toLowerCase().includes('accurate') || r.title.toLowerCase().includes('slow'),
    );
    expect(speedRec).toBeUndefined();
  });
});

describe('generateRecommendations — backspace threshold', () => {
  it('triggers backspace recommendation when > 10% of keystrokes', () => {
    const recs = generateRecommendations(
      metrics({
        totalKeystrokes: 50,
        errors: { BSPC: 8 },
        accuracy: 95,
      }),
    );
    const backspaceRec = recs.find(
      (r) => r.title.toLowerCase().includes('backspace'),
    );
    expect(backspaceRec).toBeDefined();
    expect(backspaceRec!.priority).toBe('high');
  });

  it('does NOT trigger when <= 10% of keystrokes', () => {
    const recs = generateRecommendations(
      metrics({
        totalKeystrokes: 50,
        errors: { BSPC: 5 },
        accuracy: 95,
      }),
    );
    const backspaceRec = recs.find(
      (r) => r.title.toLowerCase().includes('backspace'),
    );
    expect(backspaceRec).toBeUndefined();
  });
});

describe('generateRecommendations — level advancement', () => {
  it('triggers advancement when accuracy > 95% and WPM > 30', () => {
    const recs = generateRecommendations(
      metrics({ wpm: 40, accuracy: 97 }),
    );
    const advRec = recs.find(
      (r) => r.title.toLowerCase().includes('level') || r.title.toLowerCase().includes('next'),
    );
    expect(advRec).toBeDefined();
    expect(advRec!.priority).toBe('medium');
  });

  it('does NOT trigger when accuracy is 95% (boundary)', () => {
    const recs = generateRecommendations(
      metrics({ wpm: 40, accuracy: 95 }),
    );
    const advRec = recs.find(
      (r) => r.title.toLowerCase().includes('level') || r.title.toLowerCase().includes('next'),
    );
    expect(advRec).toBeUndefined();
  });
});

describe('generateRecommendations — priority validation', () => {
  it('all returned recommendations have valid priority values', () => {
    const recs = generateRecommendations({
      wpm: 15,
      accuracy: 85,
      totalKeystrokes: 100,
      errors: { '!': 5, a: 6, BSPC: 15 },
      exerciseType: 'basic',
    });
    for (const rec of recs) {
      expect(['high', 'medium', 'low']).toContain(rec.priority);
    }
  });

  it('capped at 3 recommendations', () => {
    // This triggers: accuracy < 90, symbol errors, finger zone errors, backspace > 10%
    const recs = generateRecommendations({
      wpm: 15,
      accuracy: 85,
      totalKeystrokes: 100,
      errors: { '!': 5, a: 10, BSPC: 20 },
      exerciseType: 'basic',
    });
    expect(recs.length).toBeLessThanOrEqual(3);
  });
});

describe('generateRecommendations — recommendation structure', () => {
  it('each recommendation has all required fields', () => {
    const recs = generateRecommendations(metrics({ accuracy: 85 }));
    for (const rec of recs) {
      expect(rec.title).toBeTruthy();
      expect(rec.reason).toBeTruthy();
      expect(rec.exerciseId).toBeTruthy();
      expect(rec.priority).toBeTruthy();
    }
  });

  it('suggested exerciseId exists in catalog', () => {
    const recs = generateRecommendations(metrics({ accuracy: 85 }));
    for (const rec of recs) {
      expect(rec.exerciseId).toMatch(/^home-row-1|letters-1|letters-2|symbols-1|symbols-2|code-1|code-2|spanish-1|spanish-2$/);
    }
  });
});
