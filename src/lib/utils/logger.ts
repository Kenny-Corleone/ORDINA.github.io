/**
 * Logging utilities for ORDINA application
 * Provides structured logging with development/production modes
 */

const isDev = import.meta.env.DEV;

/**
 * Logger interface for structured logging
 */
export const logger = {
  /**
   * Debug level logging (only in development)
   * @param args - Arguments to log
   */
  debug: (...args: any[]): void => {
    if (isDev) {
      console.debug('[ORDINA DEBUG]', ...args);
    }
  },

  /**
   * Info level logging (only in development)
   * @param args - Arguments to log
   */
  info: (...args: any[]): void => {
    if (isDev) {
      console.info('[ORDINA INFO]', ...args);
    }
  },

  /**
   * Warning level logging (only in development)
   * @param args - Arguments to log
   */
  warn: (...args: any[]): void => {
    if (isDev) {
      console.warn('[ORDINA WARN]', ...args);
    }
  },

  /**
   * Error level logging (always logged)
   * @param args - Arguments to log
   */
  error: (...args: any[]): void => {
    console.error('[ORDINA ERROR]', ...args);
  },

  /**
   * Performance timing logging
   * @param label - Label for the timing
   * @param fn - Function to time
   * @returns Result of the function
   */
  time: async <T>(label: string, fn: () => T | Promise<T>): Promise<T> => {
    if (isDev) {
      console.time(`[ORDINA TIME] ${label}`);
    }
    try {
      const result = await fn();
      if (isDev) {
        console.timeEnd(`[ORDINA TIME] ${label}`);
      }
      return result;
    } catch (error) {
      if (isDev) {
        console.timeEnd(`[ORDINA TIME] ${label}`);
      }
      throw error;
    }
  }
};

/**
 * Error information interface
 */
export interface ErrorInfo {
  message: string;
  stack?: string;
  module: string;
  action: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * Error handling context
 */
export interface ErrorContext {
  module?: string;
  action?: string;
  showToUser?: boolean;
  userMessage?: string;
}

/**
 * Centralized error handling
 * @param error - Error to handle
 * @param context - Error context
 * @returns Error information object
 */
export function handleError(
  error: Error | string,
  context: ErrorContext = {}
): ErrorInfo {
  const {
    module = 'unknown',
    action = 'unknown',
    showToUser = true,
    userMessage = null
  } = context;

  // Structure error information
  const errorInfo: ErrorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    module,
    action,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  logger.error('Error occurred:', errorInfo);

  // Determine user-friendly message
  let userFriendlyMessage = userMessage;

  if (!userFriendlyMessage) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Handle specific Firebase errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userFriendlyMessage = 'Network error. Please check your internet connection.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('permission-denied')) {
        userFriendlyMessage = 'Permission denied. Please check your access rights.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('resource-exhausted')) {
        userFriendlyMessage = 'Storage quota exceeded. Please free up some space.';
      } else if (errorMessage.includes('unavailable')) {
        userFriendlyMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (errorMessage.includes('invalid-argument')) {
        userFriendlyMessage = 'Invalid data provided. Please check your input.';
      } else if (errorMessage.includes('not-found')) {
        userFriendlyMessage = 'Resource not found.';
      } else if (errorMessage.includes('already-exists')) {
        userFriendlyMessage = 'This item already exists.';
      } else {
        userFriendlyMessage = error.message || 'An unexpected error occurred.';
      }
    } else {
      userFriendlyMessage = String(error) || 'An unexpected error occurred.';
    }
  }

  // Show to user if needed (will be implemented in helpers.ts)
  if (showToUser && userFriendlyMessage) {
    // Toast notification will be called from helpers.ts
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(userFriendlyMessage, 'error');
    }
  }

  // Send to analytics in production
  if (!isDev && typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: false
      });
    } catch (e) {
      // Ignore analytics errors
    }
  }

  return errorInfo;
}

/**
 * Wraps an async function with error handling
 * @param fn - Async function to wrap
 * @param context - Error context
 * @returns Wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error as Error, context);
      throw error;
    }
  }) as T;
}
