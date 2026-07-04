import { useCallback, useMemo } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';
import { useKeyboardStore } from '@/stores/keyboardStore';

/**
 * Compute SVG keyboard content for a given layout.
 * Returns an array of key elements and layout metadata.
 */
export function useKeyboardContent() {
  const layout = useLayoutStore((s) => s.getLayout());
  const activeScancodes = useKeyboardStore((s) => s.activeScancodes);
  const fingerColorScheme = useKeyboardStore((s) => s.fingerColorScheme);

  const keys = useMemo(() => {
    if (!layout) return [];

    const activeLayer = useLayoutStore.getState().activeLayer;
    const allLayers = layout.layers;
    const layerDef = allLayers[activeLayer];

    return layout.keys.map((key) => {
      const isActive = activeScancodes.has(key.scancode);
      const finger = key.finger ?? 'other';
      const color = fingerColorScheme[finger] ?? fingerColorScheme.other;

      // Determine the label to show
      let label = key.labels.base || key.scancode;
      if (layerDef && layerDef.keys && layerDef.keys[key.scancode]) {
        label = layerDef.keys[key.scancode];
      }

      // Special rendering for space
      const isSpace = key.scancode === 'KC_SPC' || key.scancode === 'KC_SPACE';
      const displayLabel = isSpace && !label ? '' : label;

      return {
        ...key,
        isActive,
        color,
        finger,
        displayLabel,
      };
    });
  }, [layout, activeScancodes, fingerColorScheme]);

  const keyboardWidth = useMemo(() => {
    if (!layout) return 900;
    const max = Math.max(...layout.keys.map((k) => k.position.x + k.position.width * 44));
    return Math.max(max, 900);
  }, [layout]);

  const keyboardHeight = useMemo(() => {
    if (!layout) return 300;
    const max = Math.max(...layout.keys.map((k) => k.position.y + k.position.height * 44));
    return Math.max(max, 300);
  }, [layout]);

  const keyDown = useCallback((scancode: string) => {
    useKeyboardStore.getState().keyDown(scancode);
  }, []);

  const keyUp = useCallback((scancode: string) => {
    useKeyboardStore.getState().keyUp(scancode);
  }, []);

  return {
    keys,
    keyboardWidth,
    keyboardHeight,
    keyDown,
    keyUp,
  };
}
