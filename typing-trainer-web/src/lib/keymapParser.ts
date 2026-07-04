import { getKcCodeFromDomCode, KC_CODE_MAP } from './kcCodeMap';
import { type Finger, type KeyboardLayout, type QMKKeymapInput, type Layer } from '@/types';

/**
 * Parse a QMK keymap.json into a KeyboardLayout.
 * Maps each keycode via the KC_ code map, extracts layers, and produces labels.
 */
export function parseQMKKeymap(json: QMKKeymapInput): KeyboardLayout {
  const { layers, ...meta } = json;

  if (!layers || !Array.isArray(layers) || layers.length === 0) {
    throw new Error('QMK keymap.json must have a non-empty layers array');
  }

  // Collect all keys across layers
  const keySet = new Map<string, { scancode: string; labels: Record<string, string> }>();

  layers.forEach((layer, layerIndex) => {
    const layerName = `layer${layerIndex}`;
    layer.forEach((keycode) => {
      const mapEntry = KC_CODE_MAP[keycode];
      if (!mapEntry) {
        console.warn(`[parseQMKKeymap] Skipping unknown keycode: ${keycode}`);
        return;
      }

      const existing = keySet.get(mapEntry.code);
      if (existing) {
        const label = keycode.startsWith('KC_') ? keycode.slice(3) : keycode;
        existing.labels[layerName] = label;
      } else {
        const label = keycode.startsWith('KC_') ? keycode.slice(3) : keycode;
        keySet.set(mapEntry.code, {
          scancode: mapEntry.code,
          labels: { base: label, [layerName]: label },
        });
      }
    });
  });

  // Build keys array with default positions (linear layout for now)
  const keys = Array.from(keySet.values()).map((entry, index) => {
    const row = Math.floor(index / 13);
    const col = index % 13;

    return {
      scancode: entry.scancode,
      position: {
        col: col + 1,
        row,
        width: 1,
        height: 1,
        x: col * 45 + 2,
        y: row * 55 + 2,
      },
      finger: 'other' as Finger,
      labels: entry.labels,
    };
  });

  const layerDefs: Record<string, Layer> = {};
  layerDefs.base = { name: 'base', label: 'Base', keys: {} };

  return {
    id: meta.keymap || 'imported-keymap',
    name: meta.keymap || 'Imported',
    keys,
    fingerMap: {},
    layers: layerDefs,
  };
}

/**
 * Convert a DOM KeyboardEvent.code to a KC_ scancode string.
 */
export function domCodeToScancode(domCode: string): string {
  return getKcCodeFromDomCode(domCode);
}
