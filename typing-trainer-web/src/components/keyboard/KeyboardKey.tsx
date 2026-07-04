import React from 'react';
import type { Finger } from '@/types';

interface KeyboardKeyProps {
  keyData: {
    x: number;
    y: number;
    width: number;
    height: number;
    scancode: string;
    displayLabel: string;
    color: string;
    finger: Finger;
    isActive: boolean;
    hasWashers?: boolean;
  };
  onDown: (scancode: string) => void;
  onUp: (scancode: string) => void;
  scale: number;
}

export function KeyboardKey({ keyData, onDown, onUp, scale }: KeyboardKeyProps) {
  const { x, y, width, height, scancode, displayLabel, color, isActive, hasWashers } = keyData;
  const kWidth = width * 44;
  const kHeight = height * 44;

  // Round up height for enter key (spans 2 rows)
  const renderHeight = hasWashers ? kHeight * 2 : kHeight;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onDown(scancode);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onUp(scancode);
  };

  const handlePointerLeave = () => {
    onUp(scancode);
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      data-scancode={scancode}
    >
      {/* Key shadow */}
      <rect
        x={2}
        y={3}
        width={kWidth}
        height={renderHeight}
        rx={6}
        fill="rgba(0,0,0,0.15)"
      />
      {/* Key body */}
      <rect
        x={0}
        y={0}
        width={kWidth}
        height={renderHeight}
        rx={6}
        fill={color}
        fillOpacity={isActive ? 1 : 0.7}
        stroke={isActive ? '#fff' : 'rgba(255,255,255,0.15)'}
        strokeWidth={isActive ? 2 : 1}
        style={{
          transition: 'fill-opacity 0.05s, stroke 0.05s',
        }}
      />
      {/* Key label */}
      <text
        x={kWidth / 2}
        y={renderHeight / 2 + (displayLabel.length > 4 ? 6 : 4)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={Math.max(10, 14 * scale)}
        fontWeight={600}
        style={{
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {displayLabel || ' '}
      </text>
      {/* Sub-label for wider keys */}
      {kWidth > 60 && displayLabel && displayLabel.length > 0 && (
        <text
          x={kWidth / 2}
          y={renderHeight / 2 - (displayLabel.length > 4 ? 6 : 8)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={Math.max(8, 10 * scale)}
          style={{ pointerEvents: 'none' }}
        >
          {displayLabel.length > 8 ? displayLabel.slice(0, 8) : displayLabel}
        </text>
      )}
    </g>
  );
}
