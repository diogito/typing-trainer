import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SvgKeyboard } from './SvgKeyboard';

describe('SvgKeyboard', () => {
  it('renders without crashing', () => {
    const { container } = render(<SvgKeyboard />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SvgKeyboard className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies inline opacity when provided', () => {
    const { container } = render(<SvgKeyboard opacity={0.5} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: '0.5' });
  });

  it('does not apply opacity inline when not provided', () => {
    const { container } = render(<SvgKeyboard />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveStyle({ opacity: '0.5' });
  });

  it('applies ghost-mode class when opacity < 0.2', () => {
    const { container } = render(<SvgKeyboard opacity={0.1} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('ghost-mode');
  });

  it('does not apply ghost-mode class when opacity >= 0.2', () => {
    const { container } = render(<SvgKeyboard opacity={0.2} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveClass('ghost-mode');
  });

  it('does not apply ghost-mode class when opacity is undefined', () => {
    const { container } = render(<SvgKeyboard />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveClass('ghost-mode');
  });

  it('applies transition-opacity when opacity is provided', () => {
    const { container } = render(<SvgKeyboard opacity={0.7} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('transition-opacity');
    expect(wrapper).toHaveClass('duration-300');
    expect(wrapper).toHaveClass('ease-in-out');
  });
});
