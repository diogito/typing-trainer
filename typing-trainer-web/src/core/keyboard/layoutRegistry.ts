import type { KeyboardLayout } from '@/types';
import qwertyES from './layouts/qwerty-es.json' assert { type: 'json' };
import colemak from './layouts/colemak.json' assert { type: 'json' };
import colemakDH from './layouts/colemak-dh.json' assert { type: 'json' };
import dvorak from './layouts/dvorak.json' assert { type: 'json' };
import customTemplate from './layouts/custom-template.json' assert { type: 'json' };

const BUILTIN_LAYOUTS: Record<string, KeyboardLayout> = {
  'qwerty-es': qwertyES as unknown as KeyboardLayout,
  'colemak': colemak as unknown as KeyboardLayout,
  'colemak-dh': colemakDH as unknown as KeyboardLayout,
  'dvorak': dvorak as unknown as KeyboardLayout,
  'custom': customTemplate as unknown as KeyboardLayout,
};

const customLayouts: Record<string, KeyboardLayout> = {};

/**
 * Layout registry — manages available layouts, layer switching, and schema validation.
 */
export class LayoutRegistry {
  private layouts: Map<string, KeyboardLayout> = new Map();

  constructor() {
    // Register all built-in layouts
    for (const [id, layout] of Object.entries(BUILTIN_LAYOUTS)) {
      this.validateLayout(layout);
      this.layouts.set(id, layout);
    }
    // Register any custom layouts
    for (const [id, layout] of Object.entries(customLayouts)) {
      this.validateLayout(layout);
      this.layouts.set(id, layout);
    }
  }

  /**
   * Get a layout by ID. Returns null if not found.
   */
  get(id: string): KeyboardLayout | null {
    return this.layouts.get(id) ?? null;
  }

  /**
   * Get all registered layout IDs.
   */
  getLayoutIds(): string[] {
    return Array.from(this.layouts.keys());
  }

  /**
   * Register a new layout. Throws if ID already exists.
   */
  register(layout: KeyboardLayout): void {
    this.validateLayout(layout);
    if (this.layouts.has(layout.id)) {
      throw new Error(`Layout with id "${layout.id}" already exists`);
    }
    this.layouts.set(layout.id, layout);
  }

  /**
   * Delete a custom layout. Built-in layouts cannot be deleted.
   */
  delete(id: string): void {
    if (!BUILTIN_LAYOUTS[id]) {
      this.layouts.delete(id);
    }
  }

  /**
   * Get all layout entries as an array.
   */
  getAll(): KeyboardLayout[] {
    return Array.from(this.layouts.values());
  }

  /**
   * Get a label for a scancode in a specific layer.
   * Falls back to base layer label if layer-specific label is undefined.
   */
  getLabel(layout: KeyboardLayout, scancode: string, layerName: string): string {
    const key = layout.keys.find((k) => k.scancode === scancode);
    if (!key) return scancode;

    const layer = layout.layers[layerName];
    if (layer && layer.keys[scancode]) {
      return layer.keys[scancode];
    }
    return key.labels[layerName] || key.labels.base || scancode;
  }

  private validateLayout(layout: KeyboardLayout): void {
    if (!layout.id) throw new Error('Layout must have an id');
    if (!layout.name) throw new Error('Layout must have a name');
    if (!Array.isArray(layout.keys) || layout.keys.length === 0) {
      throw new Error('Layout must have at least one key');
    }
  }
}

// Singleton instance
export const layoutRegistry = new LayoutRegistry();
