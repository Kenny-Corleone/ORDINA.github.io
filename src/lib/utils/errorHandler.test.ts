/**
 * Tests for Error Handler
 * 
 * Tests comprehensive error detection and handling functionality
 * including global error handlers, Firebase error handling, and
 * memory leak detection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initGlobalErrorHandler,
  handleFirebaseError,
  getErrorStats,
  resetErrorStats,
  trackComponentLifecycle,
  getMemoryLeakReport,
  memoryLeakDetector
} from './errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    resetErrorStats();
    vi.clearAllMocks();
  });

  describe('Global Error Handler', () => {
    it('should initialize and cleanup global error handler', () => {
      const cleanup = initGlobalErrorHandler();
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should track error statistics', () => {
      const cleanup = initGlobalErrorHandler();
      
      // Trigger an error
      const error = new Error('Test error');
      window.dispatchEvent(new ErrorEvent('error', { error }));
      
      const stats = getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
      
      cleanup();
    });

    it('should handle unhandled promise rejections', () => {
      const cleanup = initGlobalErrorHandler();
      
      // Trigger a promise rejection
      const reason = new Error('Promise rejection');
      const promise = Promise.reject(reason);
      promise.catch(() => {});
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
        promise,
        reason
      }));
      
      const stats = getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
      
      cleanup();
    });
  });

  describe('Firebase Error Handling', () => {
    it('should handle permission-denied error', () => {
      const error = {
        code: 'permission-denied',
        message: 'Missing or insufficient permissions'
      };
      
      expect(() => {
        handleFirebaseError(error, {
          module: 'test',
          action: 'test-action'
        });
      }).not.toThrow();
      
      const stats = getErrorStats();
      expect(stats.errorsByType['firebase-error']).toBe(1);
    });

    it('should handle not-found error', () => {
      const error = {
        code: 'not-found',
        message: 'Document not found'
      };
      
      handleFirebaseError(error, {
        module: 'test',
        action: 'test-action'
      });
      
      const stats = getErrorStats();
      expect(stats.errorsByType['firebase-error']).toBe(1);
    });

    it('should handle network errors', () => {
      const error = new Error('Network request failed');
      
      handleFirebaseError(error, {
        module: 'test',
        action: 'test-action'
      });
      
      const stats = getErrorStats();
      expect(stats.errorsByType['firebase-error']).toBe(1);
    });

    it('should handle timeout errors', () => {
      const error = {
        code: 'deadline-exceeded',
        message: 'Deadline exceeded'
      };
      
      handleFirebaseError(error, {
        module: 'test',
        action: 'test-action'
      });
      
      const stats = getErrorStats();
      expect(stats.errorsByType['firebase-error']).toBe(1);
    });

    it('should handle unavailable errors', () => {
      const error = {
        code: 'unavailable',
        message: 'Service unavailable'
      };
      
      handleFirebaseError(error, {
        module: 'test',
        action: 'test-action'
      });
      
      const stats = getErrorStats();
      expect(stats.errorsByType['firebase-error']).toBe(1);
    });
  });

  describe('Memory Leak Detection', () => {
    beforeEach(() => {
      // Clear the memory leak detector state completely
      const report = getMemoryLeakReport();
      // Unmount all active components
      Object.keys(report.activeComponents).forEach(name => {
        const count = report.activeComponents[name] ?? 0;
        for (let i = 0; i < count; i++) {
          memoryLeakDetector.registerUnmount(name);
        }
      });
      // Clear any remaining state by creating a fresh test component
      memoryLeakDetector.registerMount('_TestCleanup');
      memoryLeakDetector.registerUnmount('_TestCleanup');
    });

    it('should track component lifecycle', () => {
      const cleanup = trackComponentLifecycle('TestComponent');
      
      const report = getMemoryLeakReport();
      expect(report.activeComponents['TestComponent']).toBe(1);
      
      cleanup();
      
      const reportAfter = getMemoryLeakReport();
      expect(reportAfter.activeComponents['TestComponent']).toBeUndefined();
    });

    it('should track multiple component instances', () => {
      const cleanup1 = trackComponentLifecycle('TestComponent');
      const cleanup2 = trackComponentLifecycle('TestComponent');
      
      const report = getMemoryLeakReport();
      expect(report.activeComponents['TestComponent']).toBe(2);
      
      cleanup1();
      
      const reportAfter = getMemoryLeakReport();
      expect(reportAfter.activeComponents['TestComponent']).toBe(1);
      
      cleanup2();
    });

    it('should detect leaked listeners', () => {
      memoryLeakDetector.registerMount('TestComponent2');
      memoryLeakDetector.registerListener('TestComponent2', 'click-handler');
      memoryLeakDetector.registerUnmount('TestComponent2');
      
      const report = getMemoryLeakReport();
      expect(report.potentialLeaks.length).toBeGreaterThan(0);
      expect(report.potentialLeaks[0]).toContain('leaked listeners');
    });

    it('should detect leaked timers', () => {
      memoryLeakDetector.registerMount('TestComponent3');
      memoryLeakDetector.registerTimer('TestComponent3', 123);
      memoryLeakDetector.registerUnmount('TestComponent3');
      
      const report = getMemoryLeakReport();
      expect(report.potentialLeaks.length).toBeGreaterThan(0);
      // Check that at least one leak is reported (could be timer or listener)
      const hasTimerLeak = report.potentialLeaks.some(leak => leak.includes('leaked timers'));
      expect(hasTimerLeak).toBe(true);
    });

    it('should not report leaks when properly cleaned up', () => {
      memoryLeakDetector.registerMount('TestComponent4');
      memoryLeakDetector.registerListener('TestComponent4', 'click-handler');
      memoryLeakDetector.registerTimer('TestComponent4', 456);
      memoryLeakDetector.unregisterListener('TestComponent4', 'click-handler');
      memoryLeakDetector.unregisterTimer('TestComponent4', 456);
      memoryLeakDetector.registerUnmount('TestComponent4');
      
      const report = getMemoryLeakReport();
      // Filter out leaks from other test components
      const component4Leaks = report.potentialLeaks.filter(leak => leak.includes('TestComponent4'));
      expect(component4Leaks.length).toBe(0);
    });
  });

  describe('Error Statistics', () => {
    it('should track total errors', () => {
      const cleanup = initGlobalErrorHandler();
      
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('Test 1') }));
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('Test 2') }));
      
      const stats = getErrorStats();
      expect(stats.totalErrors).toBe(2);
      
      cleanup();
    });

    it('should track errors by type', () => {
      const cleanup = initGlobalErrorHandler();
      
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('Test') }));
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject('Test').catch(() => {}),
        reason: 'Test'
      }));
      
      const stats = getErrorStats();
      expect(stats.errorsByType['uncaught-error']).toBeGreaterThan(0);
      expect(stats.errorsByType['unhandled-rejection']).toBeGreaterThan(0);
      
      cleanup();
    });

    it('should reset error statistics', () => {
      const cleanup = initGlobalErrorHandler();
      
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('Test') }));
      
      let stats = getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
      
      resetErrorStats();
      
      stats = getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(Object.keys(stats.errorsByType).length).toBe(0);
      
      cleanup();
    });

    it('should track last error timestamp', () => {
      const cleanup = initGlobalErrorHandler();
      
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('Test') }));
      
      const stats = getErrorStats();
      expect(stats.lastError).toBeInstanceOf(Date);
      
      cleanup();
    });
  });
});
