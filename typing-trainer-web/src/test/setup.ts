import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Global test setup
// Mock window.matchMedia for happy-dom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Expose testing utilities globally in test files
// (we use vitest globals, not jest globals)
