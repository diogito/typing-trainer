import { useCallback, useMemo } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';
import { useKeyboardStore } from '@/stores/keyboardStore';

/**
 * Compute SVG keyboard content for a given layout.
 * Returns an array of key elements, layout metadata, and error data.
 */
export function useKeyboardContent() {
  const layout = useLayoutStore((s) => s.getLayout());
  const activeScancodes = useKeyboardStore((s) => s.activeScancodes);
  const fingerColorScheme = useKeyboardStore((s) => s.fingerColorScheme);
  const fingerErrors = useKeyboardStore((s) => s.fingerErrors);

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

  const keyPositions = useMemo(() => {
    if (!layout) return new Map<string, { x: number; y: number; width: number; height: number }>();
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
    for (const key of layout.keys) {
      const kWidth = key.position.width * 44;
      const kHeight = key.position.height * 44;
      positions.set(key.scancode, {
        x: key.position.x,
        y: key.position.y,
        width: kWidth,
        height: kHeight,
      });
    }
    return positions;
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
    keyPositions,
    fingerErrors,
    keyDown,
    keyUp,
  };
}
