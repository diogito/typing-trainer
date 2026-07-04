import { useMemo } from 'react';
import { KeyboardKey } from './KeyboardKey';
import { useKeyboardContent } from './useKeyboardContent';
import type { Finger } from '@/types';
// Layout store is used via useKeyboardContent

/**
 * Compute error overlay opacity from error count.
 * Linear scale: 0 errors = 0, 1 error = 0.15, 5+ errors = 0.5+, capped at 0.7.
 */
function computeErrorOpacity(count: number): number {
  if (count <= 0) return 0;
  return Math.min(count * 0.15, 0.7);
}

interface KeyboardErrorOverlayProps {
  fingerErrors: Record<string, number>;
  keyPositions: Map<string, { x: number; y: number; width: number; height: number }>;
}

/**
 * Renders a red error overlay on keys that have accumulated errors.
 * Opacity is proportional to error count (capped at 0.7).
 * Rendered as a separate SVG layer that does not interfere with key interactions.
 */
export function KeyboardErrorOverlay({ fingerErrors, keyPositions }: KeyboardErrorOverlayProps) {
  const errorScancodes = Object.keys(fingerErrors).filter((sc) => fingerErrors[sc] > 0);
  if (errorScancodes.length === 0) return null;

  return (
    <g className="error-heatmap pointer-events-none">
      {errorScancodes.map((scancode) => {
        const pos = keyPositions.get(scancode);
        if (!pos) return null;
        const opacity = computeErrorOpacity(fingerErrors[scancode]);
        return (
          <rect
            key={`error-${scancode}`}
            x={pos.x}
            y={pos.y}
            width={pos.width}
            height={pos.height}
            rx={6}
            fill="#ef4444"
            fillOpacity={opacity}
            className="pointer-events-none"
            style={{ transition: 'fill-opacity 0.3s ease' }}
          />
        );
      })}
    </g>
  );
}

interface KeyboardLayerOverlayProps {
  activeLayer: string;
  layerMap?: Record<string, { [key: string]: string }>;
}

/**
 * Overlay that dims keys not present on the active layer.
 */
export function KeyboardLayerOverlay({ activeLayer, layerMap }: KeyboardLayerOverlayProps) {
  if (!layerMap || !layerMap[activeLayer]) return null;

  return (
    <g className="layer-overlay" opacity={0.15}>
      {Object.keys(layerMap[activeLayer]).map((scancode) => (
        <rect
          key={`dim-${scancode}`}
          data-scancode={scancode}
          fill="black"
          className="pointer-events-none"
        />
      ))}
    </g>
  );
}

interface LayerIndicatorProps {
  activeLayer: string;
  layerNames: string[];
  onLayerChange: (layer: string) => void;
}

/**
 * Small indicator showing current layer, clickable to switch.
 */
export function LayerIndicator({ activeLayer, layerNames, onLayerChange }: LayerIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Layer:</span>
      <div className="flex gap-1">
        {layerNames.map((name) => (
          <button
            key={name}
            onClick={() => onLayerChange(name)}
            className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
              name === activeLayer
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

interface FingerLegendProps {
  colors: Record<Finger, string>;
}

/**
 * Legend showing finger color mapping.
 */
export function FingerLegend({ colors }: FingerLegendProps) {
  const fingers: Finger[] = ['pinky', 'ring', 'middle', 'index', 'thumb'];
  const labels: Record<Finger, string> = {
    pinky: 'Pinky',
    ring: 'Ring',
    middle: 'Middle',
    index: 'Index',
    thumb: 'Thumb',
    other: 'Other',
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {fingers.map((finger) => (
        <div key={finger} className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: colors[finger] }}
          />
          <span className="text-xs text-muted-foreground">{labels[finger]}</span>
        </div>
      ))}
    </div>
  );
}

interface SvgKeyboardProps {
  className?: string;
  opacity?: number;
}

/**
 * SVG Keyboard — renders all keys from the current layout as an interactive SVG.
 * Supports finger coloring, active key highlighting, layer overlays,
 * error heatmap, and responsive scaling.
 * Accepts an optional opacity for mirror mode.
 */
export function SvgKeyboard({ className = '', opacity }: SvgKeyboardProps) {
  const {
    keys,
    keyboardWidth,
    keyboardHeight,
    keyPositions,
    fingerErrors,
    keyDown,
    keyUp,
  } = useKeyboardContent();

  const scale = useMemo(() => {
    const containerWidth = typeof window !== 'undefined'
      ? Math.min(window.innerWidth - 48, 1000)
      : 900;
    return Math.max(0.5, Math.min(1.2, containerWidth / keyboardWidth));
  }, [keyboardWidth]);

  const isGhost = (opacity ?? 1) < 0.2;

  return (
    <div
      className={`w-full overflow-x-auto transition-opacity duration-300 ease-in-out ${
        isGhost ? 'ghost-mode' : ''
      } ${className}`}
      style={{ opacity: opacity ?? 1 }}
    >
      <svg
        viewBox={`0 0 ${keyboardWidth} ${keyboardHeight}`}
        className="w-full max-w-[1000px] mx-auto"
        style={{ minHeight: 200 }}
      >
        {/* Keys */}
        {keys.map((key) => (
          <KeyboardKey
            key={key.scancode}
            keyData={{
              x: key.position.x,
              y: key.position.y,
              width: key.position.width,
              height: key.position.height,
              scancode: key.scancode,
              displayLabel: key.displayLabel,
              color: key.color,
              finger: key.finger,
              isActive: key.isActive,
              hasWashers: key.hasWashers,
            }}
            onDown={keyDown}
            onUp={keyUp}
            scale={scale}
          />
        ))}

        {/* Error heatmap overlay — sits above keys, does not block interactions */}
        <KeyboardErrorOverlay fingerErrors={fingerErrors} keyPositions={keyPositions} />
      </svg>
    </div>
  );
}
