/**
 * Performance optimization utilities for ORDINA application
 * Provides debounce, throttle, and memoization functions
 */

/**
 * Creates a debounced version of a function
 * 
 * Debouncing delays execution until after a wait time has passed since the last call.
 * This is useful for expensive operations that shouldn't run on every event.
 * 
 * Use cases in ORDINA:
 * - Search input: Wait for user to stop typing before searching
 * - Notes editing: Wait for user to stop typing before saving to Firestore
 * - Window resize: Wait for resize to finish before recalculating layout
 * 
 * How it works:
 * 1. When function is called, start a timer
 * 2. If called again before timer expires, cancel old timer and start new one
 * 3. When timer expires, execute the function
 * 4. Result: Function only executes after user stops calling it for 'delay' ms
 * 
 * Example:
 * ```typescript
 * // Without debounce: saves on every keystroke (100+ times)
 * input.addEventListener('input', saveNotes);
 * 
 * // With debounce: saves only after user stops typing for 300ms
 * input.addEventListener('input', debounce(saveNotes, 300));
 * ```
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds (default 300)
 * @param immediate - Execute immediately on first call, then debounce subsequent calls
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeoutId = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    };
    
    const callNow = immediate && timeoutId === null;
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(later, delay);
    
    if (callNow) {
      fn.apply(this, args);
    }
  };
}

/**
 * Creates a throttled version of a function
 * 
 * Throttling limits execution to once per time interval, regardless of how many times called.
 * This is useful for events that fire rapidly but don't need to be handled every time.
 * 
 * Use cases in ORDINA:
 * - Scroll events: Update UI at most once per 100ms during scrolling
 * - Window resize: Recalculate layout at most once per 150ms during resize
 * - Mouse move: Track position at most once per 50ms
 * 
 * How it works:
 * 1. When function is called, execute it immediately
 * 2. Set a flag to prevent execution for 'limit' ms
 * 3. Ignore all calls during the limit period
 * 4. After limit expires, next call will execute
 * 5. Result: Function executes at most once per 'limit' ms
 * 
 * Difference from debounce:
 * - Debounce: Waits for quiet period, then executes once
 * - Throttle: Executes immediately, then enforces minimum time between executions
 * 
 * Example:
 * ```typescript
 * // Without throttle: fires 100+ times per second during scroll
 * window.addEventListener('scroll', updateScrollPosition);
 * 
 * // With throttle: fires at most 10 times per second (once per 100ms)
 * window.addEventListener('scroll', throttle(updateScrollPosition, 100));
 * ```
 * 
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds (default 300)
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Creates a memoized version of a function
 * 
 * Memoization caches function results based on arguments to avoid redundant calculations.
 * This is useful for expensive pure functions (same input always produces same output).
 * 
 * Use cases in ORDINA:
 * - Currency formatting: Cache formatted values for repeated amounts
 * - Date formatting: Cache formatted dates for repeated date strings
 * - Complex calculations: Cache results of expensive computations
 * 
 * How it works:
 * 1. When function is called, generate a cache key from arguments
 * 2. Check if result exists in cache for this key
 * 3. If cached, return cached result (fast)
 * 4. If not cached, execute function, cache result, then return it
 * 5. Result: Expensive function only runs once per unique input
 * 
 * Important: Only use for pure functions (no side effects, deterministic output)
 * 
 * Example:
 * ```typescript
 * // Without memoization: recalculates every time
 * const formatted = formatCurrency(100, 'USD', 1.7); // Calculates
 * const formatted2 = formatCurrency(100, 'USD', 1.7); // Calculates again
 * 
 * // With memoization: calculates once, returns cached result
 * const memoizedFormat = memoize(formatCurrency);
 * const formatted = memoizedFormat(100, 'USD', 1.7); // Calculates
 * const formatted2 = memoizedFormat(100, 'USD', 1.7); // Returns cached
 * ```
 * 
 * @param fn - Function to memoize (should be pure)
 * @param keyGenerator - Optional custom key generator function
 * @returns Memoized function with cache property
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T & { cache: Map<string, ReturnType<T>> } {
  const cache = new Map<string, ReturnType<T>>();
  
  const memoizedFn = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator 
      ? keyGenerator(...args) 
      : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T & { cache: Map<string, ReturnType<T>> };
  
  memoizedFn.cache = cache;
  
  return memoizedFn;
}

/**
 * Clears the cache of a memoized function
 * @param memoizedFn - Memoized function with cache property
 */
export function clearMemoCache<T extends { cache?: Map<any, any> }>(
  memoizedFn: T
): void {
  if (memoizedFn && memoizedFn.cache) {
    memoizedFn.cache.clear();
  }
}

/**
 * Creates a function that will only execute once
 * @param fn - Function to execute once
 * @returns Function that executes only once
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  } as T;
}

/**
 * Delays execution by specified milliseconds
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
