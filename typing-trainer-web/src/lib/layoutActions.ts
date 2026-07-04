import type { KeyboardLayout } from '@/types';
import { layoutRegistry } from '@/core/keyboard/layoutRegistry';
import { parseQMKKeymap } from '@/lib/keymapParser';
import { storageService } from '@/services/storage';

// Known builtin layout IDs
const BUILTIN_IDS = new Set([
  'qwerty-es', 'colemak', 'colemak-dh', 'dvorak', 'custom',
]);

export function isBuiltinLayout(id: string): boolean {
  return BUILTIN_IDS.has(id);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'layout';
}

export interface ImportedLayoutResult {
  success: boolean;
  layout: KeyboardLayout | null;
  name: string;
  error?: string;
}

/**
 * Validate and wrap a parsed QMK keymap JSON into a KeyboardLayout.
 * The parser may produce a layout with defaults (fingerMap: {}, position defaults).
 * We validate the structure and add basic metadata.
 */
export function parseImportedJson(json: unknown): ImportedLayoutResult {
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'Invalid JSON: expected an object', name: '', layout: null as unknown as KeyboardLayout };
  }

  const obj = json as Record<string, unknown>;

  // Must have a 'layout' or 'keymap' field (QMK Configurator format)
  const layoutData = obj.layout ?? obj.keymap;
  if (!layoutData || typeof layoutData !== 'object') {
    return { success: false, error: 'Invalid QMK keymap: missing "layout" or "keymap" field', name: '', layout: null as unknown as KeyboardLayout };
  }

  // Validate it has layers array
  const parsed = layoutData as { layers?: unknown[] };
  if (!parsed.layers || !Array.isArray(parsed.layers) || parsed.layers.length === 0) {
    return { success: false, error: 'Invalid QMK keymap: "layers" must be a non-empty array', name: '', layout: null as unknown as KeyboardLayout };
  }

  try {
    const qmkInput = {
      keyboard: (obj.keyboard as string) ?? 'imported',
      keymap: (obj.keymap as string) ?? 'imported',
      layout: (obj.layout as string) ?? 'qmk',
      layers: parsed.layers as string[][],
    };
    const layout = parseQMKKeymap(qmkInput);
    return {
      success: true,
      layout,
      name: (obj.keymap as string) ?? 'Imported Layout',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to parse QMK keymap',
      name: '',
      layout: null as unknown as KeyboardLayout,
    };
  }
}

/**
 * Export a layout as a downloadable JSON file.
 */
export function exportLayoutAsJson(layout: KeyboardLayout): void {
  const json = JSON.stringify(layout, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(layout.name) || 'layout'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save a custom layout to IndexedDB.
 */
export async function saveLayoutToStorage(layout: KeyboardLayout): Promise<void> {
  try {
    await storageService.saveLayout(layout);
  } catch {
    console.error('[LayoutActions] Failed to save layout to storage');
  }
}

/**
 * Delete a layout from IndexedDB.
 */
export async function deleteLayoutFromStorage(id: string): Promise<void> {
  try {
    await storageService.deleteLayout(id);
  } catch {
    console.error('[LayoutActions] Failed to delete layout from storage');
  }
}
