import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsPage } from './SettingsPage';
import { layoutRegistry } from '@/core/keyboard/layoutRegistry';
import { useLayoutStore } from '@/stores/layoutStore';

// Mock storageService
vi.mock('@/services/storage', () => ({
  storageService: {
    savePreferences: vi.fn(),
    saveLayout: vi.fn(),
    deleteLayout: vi.fn(),
    loadPreferences: vi.fn(),
  },
}));

// Mock layoutRegistry to return known layouts
const originalGetLayoutIds = layoutRegistry.getLayoutIds.bind(layoutRegistry);
const originalGet = layoutRegistry.get.bind(layoutRegistry);

function mockLayouts(layouts: { id: string; name: string }[]) {
  vi.spyOn(layoutRegistry, 'getLayoutIds').mockImplementation(() =>
    layouts.map(l => l.id)
  );
  vi.spyOn(layoutRegistry, 'get').mockImplementation((id: string) => {
    const found = layouts.find(l => l.id === id);
    return found
      ? { id: found.id, name: found.name, keys: [], layers: { base: { keys: {} } } }
      : null;
  });
}

describe('SettingsPage', () => {
  beforeEach(() => {
    // Reset custom layouts
    useLayoutStore.setState({ customLayouts: {} });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders all layout IDs from registry', () => {
    mockLayouts([
      { id: 'qwerty-es', name: 'QWERTY (ES)' },
      { id: 'colemak', name: 'Colemak' },
      { id: 'colemak-dh', name: 'Colemak DH' },
      { id: 'dvorak', name: 'Dvorak' },
    ]);
    render(<SettingsPage />);
    expect(screen.getByText('QWERTY (ES)')).toBeInTheDocument();
    expect(screen.getByText('Colemak')).toBeInTheDocument();
    expect(screen.getByText('Colemak DH')).toBeInTheDocument();
    expect(screen.getByText('Dvorak')).toBeInTheDocument();
  });

  it('renders layout selector', () => {
    mockLayouts([{ id: 'qwerty-es', name: 'QWERTY (ES)' }]);
    render(<SettingsPage />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('renders custom layouts from store', () => {
    useLayoutStore.setState({
      customLayouts: {
        'my-custom': {
          id: 'my-custom',
          name: 'My Custom',
          keys: [],
          layers: { base: { keys: {} } },
        },
      },
    });
    mockLayouts([{ id: 'qwerty-es', name: 'QWERTY (ES)' }]);
    render(<SettingsPage />);
    // Custom layouts not in layoutRegistry use id as label (fallback)
    expect(screen.getByText('my-custom')).toBeInTheDocument();
  });

  it('deduplicates layouts when custom has same ID as builtin', () => {
    useLayoutStore.setState({
      customLayouts: {
        'qwerty-es': {
          id: 'qwerty-es',
          name: 'Custom QWERTY',
          keys: [],
          layers: { base: { keys: {} } },
        },
      },
    });
    mockLayouts([
      { id: 'qwerty-es', name: 'QWERTY (ES)' },
      { id: 'colemak', name: 'Colemak' },
    ]);
    render(<SettingsPage />);
    // Should show unique layouts only - builtin comes first, custom is deduped
    expect(screen.getByText('QWERTY (ES)')).toBeInTheDocument();
    expect(screen.getByText('Colemak')).toBeInTheDocument();
  });

  it('renders appearance settings', () => {
    mockLayouts([{ id: 'qwerty-es', name: 'QWERTY (ES)' }]);
    render(<SettingsPage />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('Show Layer Indicator')).toBeInTheDocument();
  });

  it('renders keyboard layout section', () => {
    mockLayouts([{ id: 'qwerty-es', name: 'QWERTY (ES)' }]);
    render(<SettingsPage />);
    expect(screen.getByText('Keyboard Layout')).toBeInTheDocument();
    expect(screen.getByText('Selected Layout')).toBeInTheDocument();
  });

  it('renders save and reset buttons', () => {
    mockLayouts([{ id: 'qwerty-es', name: 'QWERTY (ES)' }]);
    render(<SettingsPage />);
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
  });
});
