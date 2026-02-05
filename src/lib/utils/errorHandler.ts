/**
 * Global Error Handler for ORDINA Application
 * 
 * Provides comprehensive error detection and handling:
 * - Global error handler for uncaught exceptions
 * - Unhandled promise rejection handler
 * - Error logging with context
 * - User-friendly error messages
 * - Memory leak detection
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 12.1, 12.2, 12.5
 */

import { logger, handleError, type ErrorContext } from './logger';

/**
 * Error statistics for monitoring
 */
interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  lastError: Date | null;
}

const errorStats: ErrorStats = {
  totalErrors: 0,
  errorsByType: {},
  lastError: null
};

/**
 * Initialize global error handlers
 * 
 * Sets up handlers for:
 * - Uncaught JavaScript errors
 * - Unhandled promise rejections
 * - Resource loading errors
 * 
 * Validates: Property 25 (Console Error-Free Execution)
 * Validates: Property 26 (Exception-Free Event Handlers)
 */
export function initGlobalErrorHandler(): () => void {
  // Handler for uncaught JavaScript errors
  const handleGlobalError = (event: ErrorEvent) => {
    event.preventDefault(); // Prevent default browser error handling
    
    const context: ErrorContext = {
      module: 'global',
      action: 'uncaught-error',
      showToUser: true,
      userMessage: 'An unexpected error occurred. The application will continue to work.'
    };
    
    handleError(event.error || new Error(event.message), context);
    
    // Update error statistics
    updateErrorStats('uncaught-error');
    
    return false;
  };
  
  // Handler for unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault(); // Prevent default browser error handling
    
    const context: ErrorContext = {
      module: 'global',
      action: 'unhandled-rejection',
      showToUser: true,
      userMessage: 'An operation failed. Please try again.'
    };
    
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    handleError(error, context);
    
    // Update error statistics
    updateErrorStats('unhandled-rejection');
  };
  
  // Handler for resource loading errors (images, scripts, etc.)
  const handleResourceError = (event: Event) => {
    const target = event.target as HTMLElement;
    
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const resourceUrl = (target as any).src || (target as any).href;
      
      logger.warn('Resource failed to load:', {
        type: target.tagName,
        url: resourceUrl
      });
      
      // Don't show to user for resource errors (they're usually non-critical)
      // Just log them for debugging
      updateErrorStats('resource-error');
    }
  };
  
  // Attach event listeners
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleResourceError, true); // Use capture phase for resource errors
  
  logger.info('Global error handler initialized');
  
  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleResourceError, true);
    logger.info('Global error handler cleaned up');
  };
}

/**
 * Update error statistics
 */
function updateErrorStats(errorType: string): void {
  errorStats.totalErrors++;
  errorStats.errorsByType[errorType] = (errorStats.errorsByType[errorType] || 0) + 1;
  errorStats.lastError = new Date();
  
  // Log statistics in development
  if (import.meta.env.DEV) {
    logger.debug('Error statistics:', errorStats);
  }
}

/**
 * Get current error statistics
 */
export function getErrorStats(): Readonly<ErrorStats> {
  return { ...errorStats };
}

/**
 * Reset error statistics
 */
export function resetErrorStats(): void {
  errorStats.totalErrors = 0;
  errorStats.errorsByType = {};
  errorStats.lastError = null;
}

/**
 * Firebase-specific error handler
 * 
 * Provides enhanced error handling for Firebase operations with
 * user-friendly messages for common Firebase errors.
 * 
 * Validates: Property 27 (Graceful Firebase Error Handling)
 */
export function handleFirebaseError(
  error: any,
  context: Omit<ErrorContext, 'userMessage'> = {}
): void {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || String(error);
  
  // Map Firebase error codes to user-friendly messages
  let userMessage = 'An error occurred. Please try again.';
  
  if (errorCode.includes('permission-denied')) {
    userMessage = 'You do not have permission to perform this action.';
  } else if (errorCode.includes('not-found')) {
    userMessage = 'The requested data was not found.';
  } else if (errorCode.includes('already-exists')) {
    userMessage = 'This item already exists.';
  } else if (errorCode.includes('resource-exhausted')) {
    userMessage = 'Storage quota exceeded. Please contact support.';
  } else if (errorCode.includes('unauthenticated')) {
    userMessage = 'Please sign in to continue.';
  } else if (errorCode.includes('unavailable')) {
    userMessage = 'Service temporarily unavailable. Please try again later.';
  } else if (errorCode.includes('deadline-exceeded') || errorCode.includes('timeout')) {
    userMessage = 'Operation timed out. Please check your connection and try again.';
  } else if (errorCode.includes('cancelled')) {
    userMessage = 'Operation was cancelled.';
  } else if (errorCode.includes('invalid-argument')) {
    userMessage = 'Invalid data provided. Please check your input.';
  } else if (errorCode.includes('failed-precondition')) {
    userMessage = 'Operation cannot be performed in the current state.';
  } else if (errorCode.includes('aborted')) {
    userMessage = 'Operation was aborted due to a conflict. Please try again.';
  } else if (errorCode.includes('out-of-range')) {
    userMessage = 'Value is out of valid range.';
  } else if (errorCode.includes('unimplemented')) {
    userMessage = 'This feature is not yet implemented.';
  } else if (errorCode.includes('internal')) {
    userMessage = 'Internal server error. Please try again later.';
  } else if (errorCode.includes('data-loss')) {
    userMessage = 'Data loss detected. Please contact support.';
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    userMessage = 'Network error. Please check your internet connection.';
  }
  
  const fullContext: ErrorContext = {
    ...context,
    module: context.module || 'firebase',
    action: context.action || 'operation',
    showToUser: true,
    userMessage
  };
  
  handleError(error, fullContext);
  updateErrorStats('firebase-error');
}

/**
 * Wrap an async function with Firebase error handling
 * 
 * @param fn - Async function to wrap
 * @param context - Error context
 * @returns Wrapped function that handles Firebase errors
 */
export function withFirebaseErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: Omit<ErrorContext, 'userMessage'> = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleFirebaseError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Memory leak detector for component lifecycle
 * 
 * Tracks component mounts/unmounts and detects potential memory leaks
 * from components that don't properly clean up.
 * 
 * Validates: Property 28 (Memory Leak Prevention)
 */
class MemoryLeakDetector {
  private componentRegistry = new Map<string, number>();
  private listenerRegistry = new Map<string, Set<string>>();
  private timerRegistry = new Map<string, Set<number>>();
  
  /**
   * Register a component mount
   */
  registerMount(componentName: string): void {
    const count = this.componentRegistry.get(componentName) || 0;
    this.componentRegistry.set(componentName, count + 1);
    
    if (!this.listenerRegistry.has(componentName)) {
      this.listenerRegistry.set(componentName, new Set());
    }
    if (!this.timerRegistry.has(componentName)) {
      this.timerRegistry.set(componentName, new Set());
    }
  }
  
  /**
   * Register a component unmount
   */
  registerUnmount(componentName: string): void {
    const count = this.componentRegistry.get(componentName) || 0;
    if (count > 0) {
      this.componentRegistry.set(componentName, count - 1);
    }
    
    // Check for leaked listeners
    const listeners = this.listenerRegistry.get(componentName);
    if (listeners && listeners.size > 0) {
      logger.warn(`Potential memory leak: ${componentName} has ${listeners.size} active listeners after unmount`);
    }
    
    // Check for leaked timers
    const timers = this.timerRegistry.get(componentName);
    if (timers && timers.size > 0) {
      logger.warn(`Potential memory leak: ${componentName} has ${timers.size} active timers after unmount`);
    }
  }
  
  /**
   * Register an event listener
   */
  registerListener(componentName: string, listenerKey: string): void {
    const listeners = this.listenerRegistry.get(componentName);
    if (listeners) {
      listeners.add(listenerKey);
    }
  }
  
  /**
   * Unregister an event listener
   */
  unregisterListener(componentName: string, listenerKey: string): void {
    const listeners = this.listenerRegistry.get(componentName);
    if (listeners) {
      listeners.delete(listenerKey);
    }
  }
  
  /**
   * Register a timer (setTimeout/setInterval)
   */
  registerTimer(componentName: string, timerId: number): void {
    const timers = this.timerRegistry.get(componentName);
    if (timers) {
      timers.add(timerId);
    }
  }
  
  /**
   * Unregister a timer
   */
  unregisterTimer(componentName: string, timerId: number): void {
    const timers = this.timerRegistry.get(componentName);
    if (timers) {
      timers.delete(timerId);
    }
  }
  
  /**
   * Get memory leak report
   */
  getReport(): {
    activeComponents: Record<string, number>;
    potentialLeaks: string[];
  } {
    const activeComponents: Record<string, number> = {};
    const potentialLeaks: string[] = [];
    
    this.componentRegistry.forEach((count, name) => {
      if (count > 0) {
        activeComponents[name] = count;
      }
    });
    
    this.listenerRegistry.forEach((listeners, name) => {
      const componentCount = this.componentRegistry.get(name) || 0;
      if (componentCount === 0 && listeners.size > 0) {
        potentialLeaks.push(`${name}: ${listeners.size} leaked listeners`);
      }
    });
    
    this.timerRegistry.forEach((timers, name) => {
      const componentCount = this.componentRegistry.get(name) || 0;
      if (componentCount === 0 && timers.size > 0) {
        potentialLeaks.push(`${name}: ${timers.size} leaked timers`);
      }
    });
    
    return { activeComponents, potentialLeaks };
  }
}

export const memoryLeakDetector = new MemoryLeakDetector();

/**
 * Component lifecycle tracker for memory leak detection
 * 
 * Usage in Svelte components:
 * ```typescript
 * import { trackComponentLifecycle } from '$lib/utils/errorHandler';
 * 
 * const cleanup = trackComponentLifecycle('MyComponent');
 * onDestroy(cleanup);
 * ```
 */
export function trackComponentLifecycle(componentName: string): () => void {
  memoryLeakDetector.registerMount(componentName);
  
  return () => {
    memoryLeakDetector.registerUnmount(componentName);
  };
}

/**
 * Get memory leak detection report
 */
export function getMemoryLeakReport() {
  return memoryLeakDetector.getReport();
}
