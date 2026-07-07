import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseDisplay } from './ExerciseDisplay';

function renderComponent(
  targetText: string,
  charStates: ('pending' | 'current' | 'correct' | 'incorrect' | 'corrected')[]
) {
  return render(
    <ExerciseDisplay
      targetText={targetText}
      charStates={charStates}
    />
  );
}

describe('ExerciseDisplay', () => {
  it('renders all characters from target text', () => {
    const { container } = renderComponent('abc', Array(3).fill('pending'));
    // Each char wrapper span has 'relative inline-block'
    const charSpans = container.querySelectorAll('.relative.inline-block');
    expect(charSpans.length).toBe(3);
  });

  it('renders spaces as non-breaking spaces', () => {
    const { container } = renderComponent('a b', Array(3).fill('pending'));
    const charSpans = container.querySelectorAll('.relative.inline-block');
    expect(charSpans.length).toBe(3);
    expect(charSpans[1].textContent).toBe('\u00A0');
  });

  it('applies pending (dim) color to untyped characters', () => {
    const { container } = renderComponent('abc', Array(3).fill('pending'));
    const charSpans = container.querySelectorAll('.relative.inline-block');
    charSpans.forEach(span => {
      expect(span.className).toContain('text-gray-400');
    });
  });

  it('applies correct (green) color to correct characters', () => {
    const { container } = renderComponent('abc', ['correct', 'correct', 'correct']);
    const charSpans = container.querySelectorAll('.relative.inline-block');
    charSpans.forEach(span => {
      expect(span.className).toContain('text-green-500');
    });
  });

  it('applies incorrect (red) color to wrong characters', () => {
    const { container } = renderComponent('ab', ['incorrect', 'incorrect']);
    const charSpans = container.querySelectorAll('.relative.inline-block');
    charSpans.forEach(span => {
      expect(span.className).toContain('text-red-500');
    });
  });

  it('applies corrected (green dim) color to corrected mistakes', () => {
    const { container } = renderComponent('a', ['corrected']);
    const charSpans = container.querySelectorAll('.relative.inline-block');
    expect(charSpans.length).toBe(1);
    expect(charSpans[0].className).toContain('text-green-500/50');
  });

  it('marks current character as bold with cursor', () => {
    const { container } = renderComponent('abc', ['correct', 'current', 'pending']);
    const charSpans = container.querySelectorAll('.relative.inline-block');
    expect(charSpans[1].className).toContain('font-bold');
    // Check cursor indicator exists
    const cursors = container.querySelectorAll('.bg-blue-500');
    expect(cursors.length).toBe(1);
  });

  it('shows no cursor when not on current character', () => {
    const { container } = renderComponent('abc', ['correct', 'correct', 'pending']);
    const cursors = container.querySelectorAll('.bg-blue-500');
    expect(cursors.length).toBe(0);
  });

  it('uses provided className', () => {
    const { container } = render(
      <ExerciseDisplay
        targetText="abc"
        charStates={Array(3).fill('pending')}
        className="my-custom"
      />
    );
    const root = container.querySelector('[class*="flex flex-wrap"]');
    expect(root?.className).toContain('my-custom');
  });

  it('handles empty target text', () => {
    const { container } = render(
      <ExerciseDisplay targetText="" charStates={[]} />
    );
    expect(container.textContent).toBe('');
  });
});
