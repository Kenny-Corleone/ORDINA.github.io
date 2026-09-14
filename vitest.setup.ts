import '@testing-library/jest-dom/vitest';

// ----------------------------------------------------------------------------
// JSDOM polyfills for browser-only APIs used by export/download features
// ----------------------------------------------------------------------------

if (typeof URL !== 'undefined') {
  // Some jsdom environments miss these.
  if (typeof URL.createObjectURL !== 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = () => 'blob:vitest-mock';
  }

  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    });
  }

  if (typeof window !== 'undefined' && !window.localStorage) {
    const values = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
        key: (index: number) => Array.from(values.keys())[index] ?? null,
        get length() { return values.size; },
      },
      configurable: true,
    });
  }
  if (typeof URL.revokeObjectURL !== 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = () => {};
  }
}
