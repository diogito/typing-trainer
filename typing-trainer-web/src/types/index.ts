// Finger assigned to a key (columnar typing technique)
export type Finger =
  | 'pinky'
  | 'ring'
  | 'middle'
  | 'index'
  | 'thumb'
  | 'other';

// Which hand the finger belongs to
export type Hand = 'left' | 'right';

// Types of errors detected during typing
export type ErrorType = 'wrong-finger' | 'wrong-key' | 'missed' | 'double';

// Physical keyboard key definition
export interface KeyboardKey {
  scancode: string;
  position: {
    col: number;
    row: number;
    width: number;
    height: number;
    x: number;
    y: number;
  };
  finger: Finger;
  labels: Record<string, string>; // layer name -> display label
  hasWashers?: boolean; // for ISO/JIS special keys
}

// Finger map: scancode -> expected finger
export type FingerMap = Record<string, Finger>;

// Named layer for multi-layer layouts (like numbers layer)
export interface Layer {
  name: string;
  label: string;
  keys: Record<string, string>; // sparse scancode -> label override
}

// Complete keyboard layout definition
export interface KeyboardLayout {
  id: string;
  name: string;
  keys: KeyboardKey[];
  fingerMap: FingerMap;
  layers: Record<string, Layer>;
}

// Error count aggregation
export interface ErrorCountByCategory {
  byKey: Record<string, number>;
  byFinger: Record<Finger, number>;
  byHand: Record<Hand, number>;
  byLayer: Record<string, number>;
  byDirection: Record<'down' | 'up', number>;
}

// Timing metrics from a session
export interface TimingMetrics {
  avgHoldTime: number;
  avgInterKeystrokeGap: number;
  holdTimeP50: number;
  holdTimeP95: number;
  interKeystrokeGapP50: number;
}

// Individual keystroke event captured from keyboard
export interface KeystrokeEvent {
  code: string; // event.code (physical position)
  key: string; // event.key (produced character)
  scancode: string; // internal scancode (QMK format)
  timestamp: number; // press time (DOMHighResTimeStamp)
  releaseTime?: number;
  holdDuration?: number;
  finger: Finger; // expected finger
  actualFinger?: Finger | 'unknown';
  isModifier: boolean;
  modifiers: string[]; // held modifier codes
  layer: string; // active layer name
  error?: ErrorType;
  direction?: 'down' | 'up' | 'neutral'; // key position relative to home row
}

// Per-session session metrics
export interface SessionMetrics {
  duration: number;
  totalKeystrokes: number;
  wpm: number;
  accuracy: number;
  precision: number;
  errors: ErrorCountByCategory;
  timing: TimingMetrics | null;
}

// Active session state
export interface SessionState {
  id: string;
  layoutId: string;
  state: 'idle' | 'running' | 'paused';
  startTime: number | null;
  pauseStart?: number;
  pauseDuration: number;
  keystrokes: KeystrokeEvent[];
  metrics: SessionMetrics | null;
}

// Completed session record (persisted to IndexedDB)
export interface PersistedSession {
  id: string;
  layoutId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  totalKeystrokes: number;
  wpm: number;
  accuracy: number;
  precision: number;
  errors: ErrorCountByCategory;
  createdAt: number;
}

// Finger color scheme for rendering
export type FingerColorScheme = {
  [K in Finger]: string;
};

// User preferences stored in IndexedDB
export interface UserPreferences {
  selectedLayoutId: string;
  fingerColorScheme: FingerColorScheme;
  customFingerMap: FingerMap | null;
  fontSize: number;
  showLayerIndicator: boolean;
  theme: 'light' | 'dark';
  createdAt: number;
  updatedAt: number;
}

// QMK keymap.json input format (for import)
export interface QMKKeymapInput {
  keyboard: string;
  keymap: string;
  layout: string;
  layers: string[][];
}

// Finger color constants
export const FINGER_COLORS: Record<Finger, string> = {
  pinky: '#ef4444',
  ring: '#f97316',
  middle: '#eab308',
  index: '#22c55e',
  thumb: '#3b82f6',
  other: '#6b7280',
};


