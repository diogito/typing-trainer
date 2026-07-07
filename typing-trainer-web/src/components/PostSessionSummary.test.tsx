import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostSessionSummary } from './PostSessionSummary';
import type { SessionMetrics, TrainingRecommendation } from '@/types';

function makeMetrics(overrides: Partial<SessionMetrics> = {}): SessionMetrics {
  return {
    wpm: 45.2,
    accuracy: 92.5,
    totalKeystrokes: 200,
    duration: 27,
    errors: { 'BSPC': 5, 'j': 3, 'k': 2 },
    ...overrides,
  };
}

function makeRecommendations(overrides: Partial<TrainingRecommendation>[] = []): TrainingRecommendation[] {
  return overrides.length > 0
    ? overrides.map(o => ({
        title: 'Test recommendation',
        reason: 'Test reason',
        exerciseId: 'home-row-1',
        priority: 'high',
        ...o,
      }))
    : [
        {
          title: 'Focus on accuracy before speed',
          reason: 'Your accuracy is low.',
          exerciseId: 'symbols-2',
          priority: 'high',
        },
        {
          title: 'Reduce backspaces',
          reason: 'Too many backspaces.',
          exerciseId: 'home-row-1',
          priority: 'medium',
        },
      ];
}

describe('PostSessionSummary', () => {
  it('renders null when metrics is null', () => {
    const { container } = render(
      <PostSessionSummary
        metrics={null}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders session stats (WPM, accuracy, keystrokes, duration)', () => {
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('45')).toBeInTheDocument(); // WPM
    expect(screen.getByText('92.5%')).toBeInTheDocument(); // accuracy
    expect(screen.getByText('200')).toBeInTheDocument(); // keystrokes
  });

  it('shows exercise title', () => {
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        exerciseTitle="Home Row Practice"
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Home Row Practice')).toBeInTheDocument();
  });

  it('defaults to Free Mode title', () => {
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Free Mode')).toBeInTheDocument();
  });

  it('renders exercise accuracy when provided', () => {
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        exerciseAccuracy={95.3}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('95.3%')).toBeInTheDocument();
  });

  it('does not render exercise accuracy section when not provided', () => {
    const metrics = makeMetrics();
    const { container } = render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(container.textContent).not.toContain('Exercise Accuracy:');
  });

  it('renders top errors with counts', () => {
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('BSPC')).toBeInTheDocument();
    expect(screen.getByText('5 times')).toBeInTheDocument();
    expect(screen.getByText('j')).toBeInTheDocument();
    expect(screen.getByText('3 times')).toBeInTheDocument();
  });

  it('renders recommendations with priority badges', () => {
    const metrics = makeMetrics();
    const recs = makeRecommendations([
      { priority: 'high', title: 'Accuracy focus needed' },
      { priority: 'medium', title: 'Practice symbols' },
      { priority: 'low', title: 'Good job overall' },
    ]);
    render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={recs}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Accuracy focus needed')).toBeInTheDocument();
    expect(screen.getByText('Practice symbols')).toBeInTheDocument();
    expect(screen.getByText('Good job overall')).toBeInTheDocument();
    // Priority labels
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('close button calls onClose', () => {
    const onClose = vi.fn();
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={onClose}
      />
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders header with "Session Summary" title', () => {
    const metrics = makeMetrics();
    render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
  });

  it('renders no errors section when there are no errors', () => {
    const metrics = makeMetrics({ errors: {} });
    const { container } = render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    // Should not contain error-related content
    expect(container.querySelector('.font-mono')).toBeNull();
  });

  it('renders no recommendations when list is empty', () => {
    const metrics = makeMetrics();
    const { container } = render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
      />
    );
    expect(container.textContent).not.toContain('High');
    expect(container.textContent).not.toContain('Medium');
    expect(container.textContent).not.toContain('Low');
  });

  it('applies custom className', () => {
    const metrics = makeMetrics();
    const { container } = render(
      <PostSessionSummary
        metrics={metrics}
        recommendations={[]}
        onClose={vi.fn()}
        className="my-custom-class"
      />
    );
    const root = container.firstChild;
    expect(root?.className).toContain('my-custom-class');
  });
});
