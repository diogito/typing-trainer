/**
 * Exercise Catalog — Static typing exercise definitions.
 *
 * Each exercise has:
 *  - id: unique identifier
 *  - title: display name
 *  - description: short explanation of focus
 *  - level: TrainingLevel (beginner → expert)
 *  - type: ExerciseType (home-row, letters, symbols, code, spanish)
 *  - target: the exact text the user must type
 *  - focus: array of TrainingFocus values
 *  - estimatedDurationSec: rough duration (optional)
 *
 * This module exports a readonly array. No runtime mutations.
 */

import type { Exercise } from '@/types';

export const EXERCISE_CATALOG: readonly Exercise[] = [
  {
    id: 'home-row-1',
    title: 'Home Row Foundation',
    description:
      'Master the home row keys (asdf jkl;) with repeated patterns that build muscle memory for correct finger placement.',
    level: 'beginner',
    type: 'home-row',
    target:
      'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;',
    focus: ['pinky', 'index', 'ring', 'thumb'],
    estimatedDurationSec: 120,
  },
  {
    id: 'letters-1',
    title: 'Bottom Row Letters',
    description:
      'Practice the bottom row (zxcv) combined with home row to build reach accuracy for lower keys.',
    level: 'beginner',
    type: 'letters',
    target:
      'zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv',
    focus: ['pinky', 'ring', 'middle', 'index'],
    estimatedDurationSec: 90,
  },
  {
    id: 'letters-2',
    title: 'Common Word Patterns',
    description:
      'Type frequently occurring letter combinations in Spanish and English to improve reading-speed typing.',
    level: 'basic',
    type: 'letters',
    target:
      'the and that have for not but this with you my are we an in on it at is me',
    focus: ['accuracy', 'speed'],
    estimatedDurationSec: 150,
  },
  {
    id: 'symbols-1',
    title: 'Number Row Symbols',
    description:
      'Learn the top-row symbol characters (~!@#$%^&*()_+-=) by practicing them in pairs and short sequences.',
    level: 'basic',
    type: 'symbols',
    target:
      '!@# $%^ &*() _+- =!@# $%^ &*() _+- =!@# $%^ &*() _+- =!@# $%^ &*() _+- =',
    focus: ['symbols'],
    estimatedDurationSec: 180,
  },
  {
    id: 'symbols-2',
    title: 'Punctuation & Brackets',
    description:
      'Practice typing punctuation marks and bracket pairs: quotes, brackets, parentheses, slashes, and backslashes.',
    level: 'intermediate',
    type: 'symbols',
    target:
      '[] {} () <> // \\ | : ; " \' ` ~ _ + = - ! ? . , ; : @ # & *',
    focus: ['symbols', 'accuracy'],
    estimatedDurationSec: 200,
  },
  {
    id: 'code-1',
    title: 'Basic Programming Syntax',
    description:
      'Type common programming constructs: variable declarations, function calls, and control flow keywords.',
    level: 'intermediate',
    type: 'code',
    target:
      'let x = 1; const name = "test"; function add(a, b) { return a + b; } if (x > 0) { console.log(x); }',
    focus: ['programming', 'symbols'],
    estimatedDurationSec: 240,
  },
  {
    id: 'code-2',
    title: 'Advanced Code Patterns',
    description:
      'Practice advanced code structures: object literals, array methods, template literals, and async/await.',
    level: 'advanced',
    type: 'code',
    target:
      'const users = data.map(u => u.name.toUpperCase()); const result = await fetch(url); const { id, name } = user;',
    focus: ['programming', 'left-hand', 'right-hand'],
    estimatedDurationSec: 300,
  },
  {
    id: 'spanish-1',
    title: 'Palabras Frecuentes en Español',
    description:
      'Escribe las palabras más comunes del español: artículos, preposiciones, verbos frecuentes y conectores.',
    level: 'basic',
    type: 'spanish',
    target:
      'el la los las de del en que tiene y es son por con su para un como donde esta todo',
    focus: ['accuracy', 'speed'],
    estimatedDurationSec: 180,
  },
  {
    id: 'spanish-2',
    title: 'Párrafos en Español',
    description:
      'Párrafos completos en español con tilde, diéresis, acentuación y puntuación correcta para velocidad real.',
    level: 'advanced',
    type: 'spanish',
    target:
      'El niño corre rápido por el parque mientras su madre lo observa desde el banco. ¿Quieres un café?',
    focus: ['speed', 'accuracy'],
    estimatedDurationSec: 300,
  },
] as const;
