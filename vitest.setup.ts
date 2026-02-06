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
  if (typeof URL.revokeObjectURL !== 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = () => {};
  }
}


