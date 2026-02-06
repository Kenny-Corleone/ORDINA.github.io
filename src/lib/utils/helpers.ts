/**
 * Helper utilities for ORDINA application
 * Provides common helper functions for UI and data manipulation
 */

import { logger } from './logger';

/**
 * Safely gets a nested property from an object
 * @param obj - Object to get property from
 * @param path - Dot-separated path to property
 * @param defaultValue - Default value if property not found
 * @returns Property value or default value
 */
export function safeGet<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue: T | null = null
): T | null {
  try {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = (result as Record<string, unknown>)[key];
    }
    return result != null ? result as T : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Shows a toast notification
 * @param message - Message to display
 * @param type - Toast type ('success', 'error', 'warning')
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' = 'success'
): void {
  try {
    const containerId = 'ordina-toast-container';
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'fixed inset-x-0 top-4 z-[9999] flex flex-col items-center space-y-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const baseClasses = 'pointer-events-auto px-4 py-2 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-opacity duration-300';
    const typeClasses = 
      type === 'error'
        ? 'bg-red-600 text-white'
        : type === 'warning'
          ? 'bg-amber-500 text-white'
          : 'bg-emerald-600 text-white';

    toast.className = `${baseClasses} ${typeClasses}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  } catch (e) {
    logger.error('showToast error', e);
  }
}

// Make showToast available globally for error handler
(window as any).showToast = showToast;

/**
 * Escapes HTML content
 * Properly handles Unicode characters and emojis
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(text: unknown): string {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Escapes HTML attribute
 * Properly handles Unicode characters and emojis
 * @param text - Text to escape
 * @returns Escaped attribute string
 */
export function escapeHtmlAttr(text: unknown): string {
  if (text == null) return '';
  const str = String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Truncates a string to maximum length with Unicode support
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default 100)
 * @returns Truncated string
 */
export function truncateUnicode(text: any, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') return '';
  // Use Array.from for proper Unicode character counting (including emojis)
  const chars = Array.from(text);
  if (chars.length <= maxLength) return text;
  return chars.slice(0, maxLength).join('') + '...';
}

/**
 * Loads a script safely with timeout
 * @param src - Script source URL
 * @param options - Loading options
 * @returns Promise that resolves when script loads
 */
export function loadScriptSafely(
  src: string,
  options: { defer?: boolean; timeout?: number } = {}
): Promise<void> {
  const { defer = true, timeout = 8000 } = options;
  
  // Check if already loaded
  const loadedScripts = new Set<string>();
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = src;
      if (defer) script.defer = true;
      
      script.onload = () => {
        loadedScripts.add(src);
        resolve();
      };
      
      script.onerror = (e) => {
        logger.warn('Failed to load script', src, e);
        reject(e);
      };

      const timer = setTimeout(() => {
        logger.warn('Script load timeout', src);
        reject(new Error('Script load timeout'));
      }, timeout);

      script.addEventListener('load', () => clearTimeout(timer));
      script.addEventListener('error', () => clearTimeout(timer));

      document.head.appendChild(script);
    } catch (e) {
      logger.error('loadScriptSafely error', e);
      reject(e);
    }
  });
}

/**
 * Safely evaluates a simple mathematical expression
 * Supports only numbers and operators +, -, *, /
 * @param expression - Expression to evaluate
 * @returns Evaluation result
 */
export function safeEvaluateExpression(
  expression: string
): { valid: boolean; result?: number; error?: string } {
  if (!expression || typeof expression !== 'string') {
    return { valid: false, error: 'Empty expression' };
  }

  // Remove all spaces
  let expr = expression.replace(/\s/g, '');

  // Check for allowed characters only
  if (!/^[0-9+\-*/.()]+$/.test(expr)) {
    return { valid: false, error: 'Invalid characters in expression' };
  }

  // Check balanced parentheses
  let openCount = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') openCount++;
    if (expr[i] === ')') openCount--;
    if (openCount < 0) {
      return { valid: false, error: 'Unbalanced parentheses' };
    }
  }
  if (openCount !== 0) {
    return { valid: false, error: 'Unbalanced parentheses' };
  }

  try {
    // Simple recursive descent parser for safe evaluation
    let pos = 0;

    const parseNumber = (): number | null => {
      let start = pos;
      if (pos < expr.length && expr[pos] === '-') pos++;
      if (pos >= expr.length || !/[0-9]/.test(expr[pos] ?? '')) {
        return null;
      }
      while (pos < expr.length && /[0-9.]/.test(expr[pos] ?? '')) pos++;
      const numStr = expr.substring(start, pos);
      const num = parseFloat(numStr);
      if (isNaN(num) || !isFinite(num)) {
        return null;
      }
      return num;
    };

    const parseFactor = (): number | null => {
      if (pos >= expr.length) return null;

      if (expr[pos] === '(') {
        pos++;
        const result = parseExpression();
        if (pos >= expr.length || expr[pos] !== ')') {
          return null;
        }
        pos++;
        return result;
      }

      if (expr[pos] === '-') {
        pos++;
        const num = parseFactor();
        return num !== null ? -num : null;
      }

      return parseNumber();
    };

    const parseTerm = (): number | null => {
      let result = parseFactor();
      if (result === null) return null;

      while (pos < expr.length) {
        const op = expr[pos];
        if (op === '*' || op === '/') {
          pos++;
          const right = parseFactor();
          if (right === null) return null;
          if (op === '*') {
            result *= right;
          } else {
            if (right === 0) {
              return null; // Division by zero
            }
            result /= right;
          }
        } else {
          break;
        }
      }
      return result;
    };

    const parseExpression = (): number | null => {
      let result = parseTerm();
      if (result === null) return null;

      while (pos < expr.length) {
        const op = expr[pos];
        if (op === '+' || op === '-') {
          pos++;
          const right = parseTerm();
          if (right === null) return null;
          if (op === '+') {
            result += right;
          } else {
            result -= right;
          }
        } else {
          break;
        }
      }
      return result;
    };

    const result = parseExpression();

    if (result === null || pos < expr.length) {
      return { valid: false, error: 'Invalid expression' };
    }

    if (!isFinite(result)) {
      return { valid: false, error: 'Result is not finite' };
    }

    return { valid: true, result };
  } catch (e) {
    return { valid: false, error: 'Evaluation error: ' + (e as Error).message };
  }
}

/**
 * Generates a unique ID
 * @returns Unique ID string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  } catch (error) {
    logger.error('Failed to copy to clipboard', error);
    showToast('Failed to copy to clipboard', 'error');
  }
}

/**
 * Downloads data as a file
 * @param data - Data to download
 * @param filename - Filename
 * @param mimeType - MIME type
 */
export function downloadFile(
  data: string | Blob,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Failed to download file', error);
    showToast('Failed to download file', 'error');
  }
}
