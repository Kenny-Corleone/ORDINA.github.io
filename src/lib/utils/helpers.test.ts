/**
 * Unit tests for helper utilities
 * Tests common helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  safeGet,
  escapeHtml,
  escapeHtmlAttr,
  truncateUnicode,
  safeEvaluateExpression,
  generateId
} from './helpers';

describe('Helper Utilities', () => {
  describe('safeGet', () => {
    const testObj = {
      user: {
        name: 'John',
        address: {
          city: 'New York'
        }
      },
      count: 0,
      active: false
    };

    it('should get nested property', () => {
      expect(safeGet(testObj, 'user.name')).toBe('John');
      expect(safeGet(testObj, 'user.address.city')).toBe('New York');
    });

    it('should return default value for missing property', () => {
      expect(safeGet(testObj, 'user.age', 25)).toBe(25);
      expect(safeGet(testObj, 'missing.path', 'default')).toBe('default');
    });

    it('should handle null and undefined objects', () => {
      expect(safeGet(null, 'any.path', 'default')).toBe('default');
      expect(safeGet(undefined, 'any.path', 'default')).toBe('default');
    });

    it('should handle falsy values correctly', () => {
      expect(safeGet(testObj, 'count')).toBe(0);
      expect(safeGet(testObj, 'active')).toBe(false);
    });

    it('should return null as default when not specified', () => {
      expect(safeGet(testObj, 'missing.path')).toBe(null);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should handle Unicode and emojis', () => {
      const result = escapeHtml('Hello 👋 World');
      expect(result).toContain('👋');
    });

    it('should handle null and undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should convert non-strings', () => {
      expect(escapeHtml(123)).toBe('123');
      expect(escapeHtml(true)).toBe('true');
    });
  });

  describe('escapeHtmlAttr', () => {
    it('should escape attribute special characters', () => {
      const result = escapeHtmlAttr('value with "quotes" and <tags>');
      expect(result).toContain('&quot;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('should escape ampersands', () => {
      expect(escapeHtmlAttr('Tom & Jerry')).toContain('&amp;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtmlAttr("it's")).toContain('&#39;');
    });

    it('should handle null and undefined', () => {
      expect(escapeHtmlAttr(null)).toBe('');
      expect(escapeHtmlAttr(undefined)).toBe('');
    });
  });

  describe('truncateUnicode', () => {
    it('should truncate long strings', () => {
      const longText = 'a'.repeat(150);
      const result = truncateUnicode(longText, 100);
      expect(result.length).toBe(103); // 100 chars + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should not truncate short strings', () => {
      const shortText = 'Hello World';
      expect(truncateUnicode(shortText, 100)).toBe(shortText);
    });

    it('should handle Unicode characters correctly', () => {
      const emojiText = '👋'.repeat(150);
      const result = truncateUnicode(emojiText, 100);
      // Should count emojis as single characters
      expect(Array.from(result.replace('...', '')).length).toBe(100);
    });

    it('should handle empty and invalid inputs', () => {
      expect(truncateUnicode('', 100)).toBe('');
      expect(truncateUnicode(null, 100)).toBe('');
      expect(truncateUnicode(undefined, 100)).toBe('');
    });

    it('should use default max length of 100', () => {
      const longText = 'a'.repeat(150);
      const result = truncateUnicode(longText);
      expect(result.length).toBe(103);
    });
  });

  describe('safeEvaluateExpression', () => {
    it('should evaluate simple arithmetic', () => {
      expect(safeEvaluateExpression('2 + 2').result).toBe(4);
      expect(safeEvaluateExpression('10 - 3').result).toBe(7);
      expect(safeEvaluateExpression('5 * 4').result).toBe(20);
      expect(safeEvaluateExpression('20 / 4').result).toBe(5);
    });

    it('should handle operator precedence', () => {
      expect(safeEvaluateExpression('2 + 3 * 4').result).toBe(14);
      expect(safeEvaluateExpression('(2 + 3) * 4').result).toBe(20);
    });

    it('should handle negative numbers', () => {
      expect(safeEvaluateExpression('-5 + 3').result).toBe(-2);
      expect(safeEvaluateExpression('10 + -5').result).toBe(5);
    });

    it('should handle decimal numbers', () => {
      expect(safeEvaluateExpression('1.5 + 2.5').result).toBe(4);
      expect(safeEvaluateExpression('10.5 / 2').result).toBe(5.25);
    });

    it('should reject invalid expressions', () => {
      expect(safeEvaluateExpression('2 +').valid).toBe(false);
      expect(safeEvaluateExpression('* 5').valid).toBe(false);
      expect(safeEvaluateExpression('2 + abc').valid).toBe(false);
    });

    it('should reject dangerous characters', () => {
      expect(safeEvaluateExpression('alert(1)').valid).toBe(false);
      expect(safeEvaluateExpression('2; alert(1)').valid).toBe(false);
    });

    it('should handle division by zero', () => {
      const result = safeEvaluateExpression('10 / 0');
      expect(result.valid).toBe(false);
    });

    it('should check balanced parentheses', () => {
      expect(safeEvaluateExpression('(2 + 3').valid).toBe(false);
      expect(safeEvaluateExpression('2 + 3)').valid).toBe(false);
      expect(safeEvaluateExpression('((2 + 3) * 4)').valid).toBe(true);
    });

    it('should handle empty expression', () => {
      expect(safeEvaluateExpression('').valid).toBe(false);
      expect(safeEvaluateExpression(null as any).valid).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(safeEvaluateExpression('  2  +  3  ').result).toBe(5);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should include timestamp', () => {
      const id = generateId();
      const timestamp = id.split('-')[0] ?? '0';
      expect(parseInt(timestamp)).toBeGreaterThan(0);
    });
  });
});
