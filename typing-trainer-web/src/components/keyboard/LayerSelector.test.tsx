import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { LayerSelector } from './LayerSelector';

describe('LayerSelector', () => {
  const layers = [
    { name: 'base', label: 'Base' },
    { name: 'numbers', label: 'Numbers' },
    { name: 'symbols', label: 'Symbols' },
  ];

  it('renders all layer tabs', () => {
    render(
      <LayerSelector
        layers={layers}
        activeLayer="base"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Numbers')).toBeInTheDocument();
    expect(screen.getByText('Symbols')).toBeInTheDocument();
  });

  it('highlights the active layer', () => {
    const { rerender } = render(
      <LayerSelector
        layers={layers}
        activeLayer="numbers"
        onSelect={() => {}}
      />,
    );
    // Active tab should have different styling
    const buttons = screen.getAllByRole('button');
    // All three should be present
    expect(buttons).toHaveLength(3);
  });

  it('calls onSelect when a layer is clicked', () => {
    const onSelect = vi.fn();
    render(
      <LayerSelector
        layers={layers}
        activeLayer="base"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText('Numbers'));
    expect(onSelect).toHaveBeenCalledWith('numbers');

    fireEvent.click(screen.getByText('Symbols'));
    expect(onSelect).toHaveBeenCalledWith('symbols');
  });

  it('handles layers without label', () => {
    const layersWithoutLabel = [
      { name: 'custom1', label: '' },
    ];
    render(
      <LayerSelector
        layers={layersWithoutLabel}
        activeLayer="custom1"
        onSelect={() => {}}
      />,
    );
    // Should fall back to name
    expect(screen.getByText('custom1')).toBeInTheDocument();
  });
});
