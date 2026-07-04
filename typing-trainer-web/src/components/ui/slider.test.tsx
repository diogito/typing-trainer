import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Slider } from './slider';

describe('Slider', () => {
  it('renders with default value', () => {
    render(<Slider />);
    const input = screen.getByRole('slider');
    expect(input).toHaveValue('0');
  });

  it('displays current value', () => {
    const { container } = render(<Slider value={50} min={0} max={100} />);
    // Value label is next to the slider
    expect(container.textContent).toContain('50');
  });

  it('calls onChange on input change', () => {
    const onChange = vi.fn();
    render(<Slider value={0} min={0} max={100} onChange={onChange} />);
    const input = screen.getByRole('slider');

    fireEvent.change(input, { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('respects min and max', () => {
    render(<Slider min={10} max={50} defaultValue={20} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('min', '10');
    expect(input).toHaveAttribute('max', '50');
  });

  it('respects step', () => {
    render(<Slider min={0} max={1} step={0.1} defaultValue={0.5} />);
    expect(screen.getByRole('slider')).toHaveValue('0.5');
  });
});
