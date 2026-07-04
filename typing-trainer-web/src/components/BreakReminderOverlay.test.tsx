import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { BreakReminderOverlay } from './BreakReminderOverlay';

describe('BreakReminderOverlay', () => {
  it('renders when active', () => {
    render(
      <BreakReminderOverlay
        active
        remaining={300}
        formattedRemaining="5:00"
        onDismiss={() => {}}
        onPause={() => {}}
        onResume={() => {}}
      />,
    );
    expect(screen.getByText('Time for a break')).toBeInTheDocument();
    expect(screen.getByText('5m 0s remaining')).toBeInTheDocument();
  });

  it('renders seconds-only when under 1 minute', () => {
    render(
      <BreakReminderOverlay
        active
        remaining={45}
        formattedRemaining="0:45"
        onDismiss={() => {}}
        onPause={() => {}}
        onResume={() => {}}
      />,
    );
    expect(screen.getByText('45s remaining')).toBeInTheDocument();
  });

  it('does not render when inactive', () => {
    const { container } = render(
      <BreakReminderOverlay
        active={false}
        remaining={0}
        formattedRemaining="0:00"
        onDismiss={() => {}}
        onPause={() => {}}
        onResume={() => {}}
      />,
    );
    expect(screen.queryByText('Time for a break')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });

  it('calls onDismiss on dismiss button click', () => {
    const onDismiss = vi.fn();
    render(
      <BreakReminderOverlay
        active
        remaining={300}
        formattedRemaining="5:00"
        onDismiss={onDismiss}
        onPause={() => {}}
        onResume={() => {}}
      />,
    );
    fireEvent.click(screen.getAllByRole('button')[0]); // dismiss button
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onPause on pause button click', () => {
    const onPause = vi.fn();
    render(
      <BreakReminderOverlay
        active
        remaining={300}
        formattedRemaining="5:00"
        onDismiss={() => {}}
        onPause={onPause}
        onResume={() => {}}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const pauseBtn = buttons[buttons.length - 1]; // pause is last
    fireEvent.click(pauseBtn);
    expect(onPause).toHaveBeenCalled();
  });
});
