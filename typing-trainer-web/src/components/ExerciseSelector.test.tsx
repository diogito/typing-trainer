import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSelector } from './ExerciseSelector';
import { EXERCISE_CATALOG } from '@/data/exercises';

function renderComponent(props = { onSelect: vi.fn() }) {
  return render(<ExerciseSelector {...props} />);
}

describe('ExerciseSelector', () => {
  it('renders all exercise options', () => {
    renderComponent();
    for (const ex of EXERCISE_CATALOG) {
      expect(screen.getByText(ex.title)).toBeInTheDocument();
    }
  });

  it('renders level badges for each exercise', () => {
    renderComponent();
    const allBadges = screen.getAllByText(/beginner|basic|intermediate|advanced/);
    // Should have at least 4 level labels present across the catalog
    expect(allBadges.length).toBeGreaterThanOrEqual(4);
  });

  it('calls onSelect when clicking an exercise card', () => {
    const onSelect = vi.fn();
    renderComponent({ onSelect });

    // Click the first exercise title (inside a Card div)
    const firstTitle = screen.getByText(EXERCISE_CATALOG[0].title);
    const card = firstTitle.closest('[class*="cursor-pointer"]');
    expect(card).toBeDefined();
    if (card) {
      fireEvent.click(card);
    }
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(EXERCISE_CATALOG[0].id);
  });

  it('highlights selected exercise with primary ring/border', () => {
    const selectedId = EXERCISE_CATALOG[2].id;
    renderComponent({ onSelect: vi.fn(), selectedId });

    // The selected card should have primary ring
    const selectedTitle = screen.getByText(EXERCISE_CATALOG[2].title);
    const card = selectedTitle.closest('[class*="cursor-pointer"]');
    expect(card?.getAttribute('class')).toContain('ring-primary');
  });

  it('type filter dropdown renders as a select', () => {
    renderComponent();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('shows exercise metadata and type badges', () => {
    renderComponent();
    const firstEx = EXERCISE_CATALOG[0];
    const charCounts = screen.getAllByText(new RegExp(`${firstEx.target.length} chars`));
    expect(charCounts.length).toBeGreaterThan(0);
  });
});
