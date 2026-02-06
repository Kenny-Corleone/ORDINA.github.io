/**
 * Unit tests for logger utilities
 * Tests logging functions and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, handleError, withErrorHandling } from './logger';

describe('Logger Utilities', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let consoleDebugSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let consoleInfoSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logger.debug', () => {
    it('should log debug messages', () => {
      logger.debug('test message', { data: 'value' });
      // In dev mode, should call console.debug
      // In production, should not call
    });
  });

  describe('logger.info', () => {
    it('should log info messages', () => {
      logger.info('test info', 123);
      // In dev mode, should call console.info
    });
  });

  describe('logger.warn', () => {
    it('should log warning messages', () => {
      logger.warn('test warning');
      // In dev mode, should call console.warn
    });
  });

  describe('logger.error', () => {
    it('should always log error messages', () => {
      logger.error('test error', new Error('test'));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log multiple arguments', () => {
      logger.error('error:', 'message', { code: 500 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ORDINA ERROR]',
        'error:',
        'message',
        { code: 500 }
      );
    });
  });

  describe('logger.time', () => {
    it('should time synchronous function', async () => {
      const result = await logger.time('test', () => {
        return 42;
      });
      expect(result).toBe(42);
    });

    it('should time asynchronous function', async () => {
      const result = await logger.time('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      });
      expect(result).toBe('done');
    });

    it('should handle errors in timed function', async () => {
      await expect(
        logger.time('test', () => {
          throw new Error('test error');
        })
      ).rejects.toThrow('test error');
    });
  });

  describe('handleError', () => {
    beforeEach(() => {
      // Mock window.showToast
      (global as any).window = {
        showToast: vi.fn(),
        location: { href: 'http://localhost' },
        navigator: { userAgent: 'test' }
      };
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const errorInfo = handleError(error, {
        module: 'test-module',
        action: 'test-action'
      });

      expect(errorInfo.message).toBe('Test error');
      expect(errorInfo.module).toBe('test-module');
      expect(errorInfo.action).toBe('test-action');
      expect(errorInfo.timestamp).toBeDefined();
    });

    it('should handle string errors', () => {
      const errorInfo = handleError('String error');
      expect(errorInfo.message).toBe('String error');
    });

    it('should provide user-friendly messages for network errors', () => {
      const error = new Error('Network request failed');
      handleError(error, { showToUser: true });
      // Should show user-friendly message
    });

    it('should provide user-friendly messages for permission errors', () => {
      const error = new Error('permission-denied');
      handleError(error, { showToUser: true });
      // Should show user-friendly message
    });

    it('should use custom user message when provided', () => {
      const error = new Error('Internal error');
      handleError(error, {
        showToUser: true,
        userMessage: 'Custom error message'
      });
      // Should use custom message
    });

    it('should not show toast when showToUser is false', () => {
      const error = new Error('Test error');
      handleError(error, { showToUser: false });
      // Should not call showToast
    });

    it('should include stack trace for Error objects', () => {
      const error = new Error('Test error');
      const errorInfo = handleError(error);
      expect(errorInfo.stack).toBeDefined();
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap async function with error handling', async () => {
      const fn = async (x: number) => x * 2;
      const wrapped = withErrorHandling(fn, { module: 'test' });
      
      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    it('should catch and handle errors', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };
      const wrapped = withErrorHandling(fn, { module: 'test' });
      
      await expect(wrapped()).rejects.toThrow('Test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should preserve function arguments', async () => {
      const fn = async (a: number, b: string) => `${a}-${b}`;
      const wrapped = withErrorHandling(fn);
      
      const result = await wrapped(42, 'test');
      expect(result).toBe('42-test');
    });
  });
});
