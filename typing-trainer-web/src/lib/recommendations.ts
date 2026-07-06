/**
 * Recommendation Engine — Rule-based training recommendations.
 *
 * Takes session metrics and returns 1-2 suggested exercises with priorities.
 * Pure function — no side effects, no store access.
 */

import type { TrainingRecommendation } from '@/types';
import { EXERCISE_CATALOG } from '@/data/exercises';

interface MetricsInput {
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  errors: Record<string, number>;
  exerciseType: string;
}

const SYMBOL_KEYS = new Set(['@', '#', '$', '%', '&', '*', '(', ')', '_', '+', '=', '~', '!', '?', "'", '"', '<', '>', '[', ']', '{', '}', '|', '\\', '/', ':', ';', '`', '^']);

const FINGER_ZONE_THRESHOLD = 5; // number of errors on a single key to flag as finger zone issue

export function generateRecommendations(
  metrics: MetricsInput,
): TrainingRecommendation[] {
  // No recommendations for empty sessions
  if (metrics.totalKeystrokes === 0) {
    return [];
  }

  const recommendations: TrainingRecommendation[] = [];

  // Rule 1: Low accuracy → high priority precision recommendation
  if (metrics.accuracy < 90) {
    recommendations.push({
      title: 'Focus on accuracy before speed',
      reason: `Your accuracy is ${metrics.accuracy.toFixed(0)}%. Slow down and practice carefully to build muscle memory.`,
      exerciseId: 'symbols-2',
      priority: 'high',
    });
  }

  // Rule 2: Backspace count > 10% of keystrokes → high priority
  const backspaceKey = 'BSPC';
  const backspaceCount = metrics.errors[backspaceKey] ?? 0;
  if (metrics.totalKeystrokes > 0 && backspaceCount > metrics.totalKeystrokes * 0.1) {
    recommendations.push({
      title: 'Reduce backspaces by typing more carefully',
      reason: `You pressed backspace ${backspaceCount} times (${((backspaceCount / metrics.totalKeystrokes) * 100).toFixed(0)}% of keystrokes). Slow down and type with more intention.`,
      exerciseId: 'home-row-1',
      priority: 'high',
    });
  }

  // Rule 3: Symbol errors → medium priority
  const hasSymbolErrors = Object.keys(metrics.errors).some(
    (key) => SYMBOL_KEYS.has(key),
  );
  if (hasSymbolErrors) {
    recommendations.push({
      title: 'Practice symbol exercises',
      reason: 'You made errors on symbol keys. Symbol exercises will help build familiarity.',
      exerciseId: 'symbols-1',
      priority: 'medium',
    });
  }

  // Rule 4: Finger zone errors → medium priority
  const fingerZoneErrors = Object.entries(metrics.errors).filter(
    ([, count]) => count >= FINGER_ZONE_THRESHOLD,
  );
  if (fingerZoneErrors.length > 0) {
    const [key] = fingerZoneErrors[0];
    recommendations.push({
      title: 'Work on finger zone transitions',
      reason: `You made ${fingerZoneErrors[0][1]} errors on key "${key}". Practice finger zone transitions to improve consistency.`,
      exerciseId: 'code-1',
      priority: 'medium',
    });
  }

  // Rule 5: High accuracy + low WPM → low priority speed suggestion
  if (metrics.accuracy > 90 && metrics.wpm < 20) {
    recommendations.push({
      title: "You're accurate but slow — try timed drills",
      reason: `Your accuracy is ${metrics.accuracy.toFixed(0)}% but WPM is ${metrics.wpm.toFixed(0)}. Timed drills can help you increase speed without losing accuracy.`,
      exerciseId: 'letters-2',
      priority: 'low',
    });
  }

  // Rule 6: High accuracy + high WPM → level advancement
  if (metrics.accuracy > 95 && metrics.wpm > 30) {
    recommendations.push({
      title: 'Ready for the next level',
      reason: `Excellent performance: ${metrics.accuracy.toFixed(0)}% accuracy at ${metrics.wpm.toFixed(0)} WPM. Try a more challenging exercise.`,
      exerciseId: findNextLevelExercise(metrics.exerciseType),
      priority: 'medium',
    });
  }

  // If no rules triggered, return a maintenance recommendation
  if (recommendations.length === 0) {
    return [];
  }

  return recommendations.slice(0, 3); // Cap at 3 recommendations
}

/** Find the next-difficulty exercise of the same type, or fall back to a harder type. */
function findNextLevelExercise(currentType: string): string {
  const levelOrder: Record<string, number> = {
    beginner: 0,
    basic: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const currentLevel = levelOrder[currentType] ?? 0;
  const nextLevel = Math.min(4, currentLevel + 1);

  const nextLabel = Object.entries(levelOrder).find(
    ([, v]) => v === nextLevel,
  )?.[0];

  if (nextLabel) {
    const match = EXERCISE_CATALOG.find(
      (e) => e.level === nextLabel && e.type !== 'free',
    );
    if (match) return match.id;
  }

  // Fallback: pick the first non-free exercise
  return EXERCISE_CATALOG.find((e) => e.type !== 'free')?.id ?? 'home-row-1';
}
