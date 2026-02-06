/**
 * Property-based tests for formatting utilities
 * Feature: ordina-svelte-migration
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatCurrency, formatISODateForDisplay, getTodayISOString } from './formatting';

describe('Formatting Utilities - Property-Based Tests', () => {
  /**
   * Property 7: Currency Conversion
   * For any amount, USD display should equal amount / 1.7
   * Validates: Requirements 6.12
   */
  it('Feature: ordina-svelte-migration, Property 7: Currency Conversion', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000000, noNaN: true }),
        (amount) => {
          const result = formatCurrency(amount, 'USD', 1.7);
          const expectedValue = (amount / 1.7).toFixed(2);
          
          // Result should contain the expected value
          return result.includes(expectedValue) && result.includes('USD');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 19: Date Formatting Localization
   * For any date and language, format should match locale
   * Validates: Requirements 9.6
   */
  it('Feature: ordina-svelte-migration, Property 19: Date Formatting Localization', () => {
    fc.assert(
      fc.property(
        // Generate valid dates
        fc.integer({ min: 2000, max: 2099 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }), // Use 28 to avoid month-specific issues
        fc.constantFrom('en', 'ru', 'az', 'it'),
        (year, month, day, language) => {
          const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const result = formatISODateForDisplay(isoDate, language);
          
          // Result should not be empty and should contain the day and year
          const containsDay = result.includes(String(day));
          const containsYear = result.includes(String(year));
          
          // For Russian, check genitive case month names
          if (language === 'ru') {
            const russianMonths = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                                   'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const monthName = russianMonths[month - 1] || '';
            return containsDay && containsYear && result.includes(monthName);
          }
          
          // For other languages, just check day and year are present
          return containsDay && containsYear && result.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit test for getTodayISOString format
  it('getTodayISOString returns valid ISO format', () => {
    const today = getTodayISOString();
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(today).toMatch(isoRegex);
  });

  // Additional unit test for currency formatting with AZN
  it('formatCurrency formats AZN correctly', () => {
    const result = formatCurrency(100, 'AZN', 1.7);
    expect(result).toBe('100.00 AZN');
  });

  // Additional unit test for currency formatting with USD
  it('formatCurrency formats USD correctly', () => {
    const result = formatCurrency(170, 'USD', 1.7);
    expect(result).toBe('100.00 USD');
  });
});
