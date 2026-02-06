import { beforeAll, afterAll, test, expect } from 'vitest';
import { getCachedNews, CACHE_KEY } from '../src/lib/services/news';

// Simple in-memory localStorage mock for Vitest DOM environment
let originalLocalStorage: any;

beforeAll(() => {
  originalLocalStorage = (global as any).localStorage;
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
      clear: () => storage.clear(),
    },
  });
});

afterAll(() => {
  // Restore original localStorage if needed
  (global as any).localStorage = originalLocalStorage;
});

test('getCachedNews returns cached data when valid', () => {
  // Prepare a valid cache entry
  const now = Date.now();
  const raw = {
    timestamp: now,
    data: [{ title: 'Test', url: 'https://example.com', source: 'Test', publishedAt: now.toString(), desc: '', image: '', categories: [] as any }],
    lang: 'en',
    category: 'all',
  };
  (window.localStorage as any).setItem(CACHE_KEY, JSON.stringify(raw));

  const cached = getCachedNews();
  expect(Array.isArray(cached)).toBe(true);
  expect(cached?.length).toBeGreaterThan(0);
});
