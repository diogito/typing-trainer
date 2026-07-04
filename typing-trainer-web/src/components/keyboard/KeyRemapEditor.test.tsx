import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { KeyRemapEditor } from './KeyRemapEditor';
import type { KeyboardLayout } from '@/types';

// Create a minimal test layout
const createTestLayout = (layerKeys: Record<string, string> = {}): KeyboardLayout => ({
  id: 'test-layout',
  name: 'Test Layout',
  keys: [
    {
      scancode: 'KEY_A',
      position: { col: 1, row: 2, width: 1, height: 1, x: 4, y: 88 },
      finger: 'pinky',
      labels: { base: 'a', custom: 'A' },
    },
    {
      scancode: 'KEY_S',
      position: { col: 2, row: 2, width: 1, height: 1, x: 52, y: 88 },
      finger: 'ring',
      labels: { base: 's', custom: 'S' },
    },
    {
      scancode: 'KEY_D',
      position: { col: 3, row: 2, width: 1, height: 1, x: 100, y: 88 },
      finger: 'middle',
      labels: { base: 'd' },
    },
  ],
  fingerMap: { KEY_A: 'pinky', KEY_S: 'ring', KEY_D: 'middle' },
  layers: {
    base: { name: 'base', label: 'Base', keys: {} },
    custom: { name: 'custom', label: 'Custom', keys: layerKeys },
  },
});

describe('KeyRemapEditor', () => {
  it('renders keys with current labels', () => {
    const layout = createTestLayout();
    const { container } = render(<KeyRemapEditor layout={layout} layer="base" onChange={() => {}} />);
    expect(container.textContent).toContain('Click a key to edit');
    // Should show base labels
    expect(screen.getByRole('button', { name: /a/ })).toBeInTheDocument();
  });

  it('shows layer-specific labels when they exist', () => {
    const layout = createTestLayout({ KEY_A: 'Z' });
    const { container } = render(<KeyRemapEditor layout={layout} layer="custom" onChange={() => {}} />);
    // Should show the custom label
    expect(screen.getByRole('button', { name: /Z/ })).toBeInTheDocument();
  });

  it('opens edit input on key click', () => {
    const layout = createTestLayout();
    render(<KeyRemapEditor layout={layout} layer="base" onChange={() => {}} />);
    const button = screen.getByRole('button', { name: /a/ });
    fireEvent.click(button);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('rejects empty label on save', () => {
    const layout = createTestLayout();
    const onChange = vi.fn();
    render(<KeyRemapEditor layout={layout} layer="base" onChange={onChange} />);

    const button = screen.getByRole('button', { name: /a/ });
    fireEvent.click(button);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });

    // Press Enter to try to save empty
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should still show input (not saved)
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('saves valid label and triggers onChange', () => {
    const layout = createTestLayout();
    const onChange = vi.fn();
    render(<KeyRemapEditor layout={layout} layer="base" onChange={onChange} />);

    const button = screen.getByRole('button', { name: /a/ });
    fireEvent.click(button);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'X' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalled();
    // Should go back to button view
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('cancels edit on Escape', () => {
    const layout = createTestLayout();
    render(<KeyRemapEditor layout={layout} layer="base" onChange={() => {}} />);

    const button = screen.getByRole('button', { name: /a/ });
    fireEvent.click(button);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should go back to button view
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('updates label in the updated layout', () => {
    const layout = createTestLayout();
    let updatedLayout: KeyboardLayout | null = null;
    const onChange = (l: KeyboardLayout) => { updatedLayout = l; };

    render(<KeyRemapEditor layout={layout} layer="base" onChange={onChange} />);

    const button = screen.getByRole('button', { name: /a/ });
    fireEvent.click(button);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Z' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(updatedLayout).not.toBeNull();
    // The base layer should have the new label
    expect(updatedLayout!.layers.base.keys.KEY_A).toBe('Z');
  });
});
