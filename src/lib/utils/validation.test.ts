/**
 * Unit tests for validation utilities
 * Tests all validation functions with various inputs
 */

import { describe, it, expect } from 'vitest';
import {
  validateString,
  validateNumber,
  validateDate,
  validateDayOfMonth,
  validateEmail
} from './validation';

describe('Validation Utilities', () => {
  describe('validateString', () => {
    it('should validate required string', () => {
      const result = validateString('test');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('test');
    });

    it('should trim whitespace', () => {
      const result = validateString('  test  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('test');
    });

    it('should reject empty required string', () => {
      const result = validateString('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Field is required');
    });

    it('should accept empty optional string', () => {
      const result = validateString('', { required: false });
      expect(result.valid).toBe(true);
    });

    it('should enforce minimum length', () => {
      const result = validateString('ab', { minLength: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum length is 3');
    });

    it('should enforce maximum length', () => {
      const result = validateString('a'.repeat(101), { maxLength: 100 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum length is 100');
    });

    it('should handle null and undefined', () => {
      expect(validateString(null).valid).toBe(false);
      expect(validateString(undefined).valid).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should validate positive number', () => {
      const result = validateNumber(42);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should parse string numbers', () => {
      const result = validateNumber('42.5');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42.5);
    });

    it('should reject invalid numbers', () => {
      expect(validateNumber('abc').valid).toBe(false);
      expect(validateNumber(NaN).valid).toBe(false);
      expect(validateNumber(Infinity).valid).toBe(false);
    });

    it('should enforce minimum value', () => {
      const result = validateNumber(5, { min: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10');
    });

    it('should enforce maximum value', () => {
      const result = validateNumber(100, { max: 50 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 50');
    });

    it('should handle zero based on allowZero option', () => {
      expect(validateNumber(0, { allowZero: true }).valid).toBe(true);
      expect(validateNumber(0, { allowZero: false }).valid).toBe(false);
    });

    it('should handle empty optional number', () => {
      const result = validateNumber('', { required: false });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should reject empty required number', () => {
      const result = validateNumber('', { required: true });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should validate correct ISO date', () => {
      const result = validateDate('2024-01-15');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateDate('15/01/2024').valid).toBe(false);
      expect(validateDate('2024-1-15').valid).toBe(false);
      expect(validateDate('not-a-date').valid).toBe(false);
    });

    it('should validate leap year dates', () => {
      expect(validateDate('2024-02-29').valid).toBe(true); // 2024 is leap year
      expect(validateDate('2023-02-29').valid).toBe(false); // 2023 is not
    });

    it('should reject invalid month', () => {
      expect(validateDate('2024-13-01').valid).toBe(false);
      expect(validateDate('2024-00-01').valid).toBe(false);
    });

    it('should reject invalid day', () => {
      expect(validateDate('2024-01-32').valid).toBe(false);
      expect(validateDate('2024-04-31').valid).toBe(false); // April has 30 days
    });

    it('should enforce year bounds', () => {
      expect(validateDate('1899-01-01').valid).toBe(false);
      expect(validateDate('2101-01-01').valid).toBe(false);
      expect(validateDate('1900-01-01').valid).toBe(true);
      expect(validateDate('2100-12-31').valid).toBe(true);
    });

    it('should handle optional dates', () => {
      const result = validateDate('', { required: false });
      expect(result.valid).toBe(true);
    });

    it('should enforce min/max date bounds', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      
      expect(validateDate('2023-12-31', { minDate }).valid).toBe(false);
      expect(validateDate('2025-01-01', { maxDate }).valid).toBe(false);
      expect(validateDate('2024-06-15', { minDate, maxDate }).valid).toBe(true);
    });
  });

  describe('validateDayOfMonth', () => {
    it('should validate valid day', () => {
      expect(validateDayOfMonth(15).valid).toBe(true);
      expect(validateDayOfMonth('15').valid).toBe(true);
    });

    it('should reject invalid days', () => {
      expect(validateDayOfMonth(0).valid).toBe(false);
      expect(validateDayOfMonth(32).valid).toBe(false);
      expect(validateDayOfMonth(-1).valid).toBe(false);
    });

    it('should reject non-integer days', () => {
      expect(validateDayOfMonth(15.5).valid).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(validateDayOfMonth('abc').valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('notanemail').valid).toBe(false);
      expect(validateEmail('missing@domain').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
    });

    it('should handle optional email', () => {
      const result = validateEmail('', false);
      expect(result.valid).toBe(true);
    });

    it('should reject empty required email', () => {
      const result = validateEmail('', true);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should accept complex valid emails', () => {
      expect(validateEmail('user+tag@sub.example.com').valid).toBe(true);
      expect(validateEmail('user.name@example.co.uk').valid).toBe(true);
    });
  });
});
