/**
 * Property-based tests for performance utilities
 * Feature: ordina-svelte-migration
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { debounce, throttle, memoize } from './performance';

describe('Performance Utilities - Property-Based Tests', () => {
  /**
   * Property 21: Debounce Behavior
   * For any debounced function, N rapid calls should execute once
   * Validates: Requirements 10.3
   */
  it('Feature: ordina-svelte-migration, Property 21: Debounce Behavior', async () => {
    vi.useFakeTimers();
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }), // number of calls
        fc.integer({ min: 50, max: 200 }), // delay
        async (numCalls, delay) => {
          let executionCount = 0;
          const debouncedFn = debounce(() => {
            executionCount++;
          }, delay);

          // Call function numCalls times rapidly
          for (let i = 0; i < numCalls; i++) {
            debouncedFn();
          }

          // Wait for debounce delay + buffer
          await vi.advanceTimersByTimeAsync(delay + 50);

          // Should execute exactly once
          return executionCount === 1;
        }
      ),
      { numRuns: 100 }
    );
    vi.useRealTimers();
  });

  /**
   * Property 22: Throttle Behavior
   * For any throttled function, N calls in interval T should execute once
   * Validates: Requirements 10.4
   */
  it('Feature: ordina-svelte-migration, Property 22: Throttle Behavior', async () => {
    vi.useFakeTimers();
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }), // number of calls
        fc.integer({ min: 50, max: 200 }), // limit
        async (numCalls, limit) => {
          let executionCount = 0;
          const throttledFn = throttle(() => {
            executionCount++;
          }, limit);

          // Call function numCalls times rapidly (within the limit interval)
          for (let i = 0; i < numCalls; i++) {
            throttledFn();
          }

          // Wait a bit to ensure throttle has settled
          await vi.advanceTimersByTimeAsync(50);

          // Should execute exactly once (first call)
          return executionCount === 1;
        }
      ),
      { numRuns: 100 }
    );
    vi.useRealTimers();
  });

  // Additional unit tests for debounce
  it('debounce executes after delay', async () => {
    let executed = false;
    const debouncedFn = debounce(() => {
      executed = true;
    }, 100);

    debouncedFn();
    expect(executed).toBe(false);

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(executed).toBe(true);
  });

  it('debounce with immediate flag executes immediately', () => {
    let executed = false;
    const debouncedFn = debounce(() => {
      executed = true;
    }, 100, true);

    debouncedFn();
    expect(executed).toBe(true);
  });

  // Additional unit tests for throttle
  it('throttle executes immediately on first call', () => {
    let executed = false;
    const throttledFn = throttle(() => {
      executed = true;
    }, 100);

    throttledFn();
    expect(executed).toBe(true);
  });

  it('throttle prevents execution within limit', async () => {
    let executionCount = 0;
    const throttledFn = throttle(() => {
      executionCount++;
    }, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(executionCount).toBe(1);

    // Wait for throttle to reset
    await new Promise(resolve => setTimeout(resolve, 150));

    throttledFn();
    expect(executionCount).toBe(2);
  });

  // Additional unit tests for memoize
  it('memoize caches function results', () => {
    let callCount = 0;
    const expensiveFn = (x: number) => {
      callCount++;
      return x * 2;
    };

    const memoizedFn = memoize(expensiveFn);

    expect(memoizedFn(5)).toBe(10);
    expect(callCount).toBe(1);

    expect(memoizedFn(5)).toBe(10);
    expect(callCount).toBe(1); // Should not call again

    expect(memoizedFn(10)).toBe(20);
    expect(callCount).toBe(2); // New argument, should call
  });

  it('memoize with custom key generator', () => {
    let callCount = 0;
    const fn = (obj: { id: number; name: string }) => {
      callCount++;
      return obj.id * 2;
    };

    const memoizedFn = memoize(fn, (obj) => String(obj.id));

    expect(memoizedFn({ id: 5, name: 'test' })).toBe(10);
    expect(callCount).toBe(1);

    expect(memoizedFn({ id: 5, name: 'different' })).toBe(10);
    expect(callCount).toBe(1); // Same id, should use cache
  });
});
