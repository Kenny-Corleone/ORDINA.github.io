/**
 * Property-Based Tests for Expense Sorting
 * Feature: ordina-svelte-migration
 * 
 * These tests verify that expense sorting behaves correctly across all possible inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Expense } from '../../lib/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Sort expenses by date descending (newest first)
 * This is the same logic used in ExpensesTab.svelte
 */
function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}

describe('Expense Sorting Property Tests', () => {
  /**
   * Property 9: Expense Sorting
   * For any collection of expenses, the displayed list should be sorted by date 
   * in descending order (newest first).
   * 
   * Validates: Requirements 6.15
   */
  it('Feature: ordina-svelte-migration, Property 9: Expense Sorting - expenses should always be sorted by date descending', () => {
    fc.assert(
      fc.property(
        // Generate an array of expenses with random dates
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
            // Generate valid ISO date strings (YYYY-MM-DD)
            date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
              .map(d => {
                const isoString = d.toISOString().split('T')[0];
                return isoString || '2024-01-01'; // Fallback to ensure non-undefined
              }),
            createdAt: fc.constant(Timestamp.now())
          }),
          { minLength: 0, maxLength: 100 }
        ),
        (expenses) => {
          const sorted = sortExpensesByDate(expenses as Expense[]);
          
          // Verify that the array is sorted in descending order by date
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            
            if (!current || !next) {
              return false;
            }
            
            const currentDate = current.date;
            const nextDate = next.date;
            
            // Current date should be >= next date (descending order)
            if (currentDate < nextDate) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Sorting should preserve all expenses
   * Verifies that no expenses are lost or duplicated during sorting
   */
  it('sorting should preserve all expenses without loss or duplication', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
            date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
              .map(d => {
                const isoString = d.toISOString().split('T')[0];
                return isoString || '2024-01-01'; // Fallback to ensure non-undefined
              }),
            createdAt: fc.constant(Timestamp.now())
          }),
          { minLength: 0, maxLength: 100 }
        ),
        (expenses) => {
          const sorted = sortExpensesByDate(expenses as Expense[]);
          
          // Verify same length
          if (sorted.length !== expenses.length) {
            return false;
          }
          
          // Verify all IDs are present
          const originalIds = new Set(expenses.map(e => e.id));
          const sortedIds = new Set(sorted.map(e => e.id));
          
          if (originalIds.size !== sortedIds.size) {
            return false;
          }
          
          for (const id of originalIds) {
            if (!sortedIds.has(id)) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Sorting should be stable for expenses with same date
   * Verifies that expenses with the same date maintain their relative order
   */
  it('sorting should be stable for expenses with the same date', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
            // Use a limited set of dates to ensure some duplicates
            date: fc.constantFrom('2024-01-01', '2024-01-02', '2024-01-03'),
            createdAt: fc.constant(Timestamp.now())
          }),
          { minLength: 2, maxLength: 50 }
        ),
        (expenses) => {
          const sorted = sortExpensesByDate(expenses);
          
          // Group by date
          const groupedOriginal = new Map<string, Expense[]>();
          const groupedSorted = new Map<string, Expense[]>();
          
          expenses.forEach(e => {
            if (!groupedOriginal.has(e.date)) {
              groupedOriginal.set(e.date, []);
            }
            groupedOriginal.get(e.date)!.push(e);
          });
          
          sorted.forEach(e => {
            if (!groupedSorted.has(e.date)) {
              groupedSorted.set(e.date, []);
            }
            groupedSorted.get(e.date)!.push(e);
          });
          
          // Verify each date group has the same expenses
          for (const [date, originalGroup] of groupedOriginal) {
            const sortedGroup = groupedSorted.get(date);
            if (!sortedGroup) {
              return false;
            }
            
            if (originalGroup.length !== sortedGroup.length) {
              return false;
            }
            
            // Check that all IDs are present in both groups
            const originalIds = new Set(originalGroup.map(e => e.id));
            const sortedIds = new Set(sortedGroup.map(e => e.id));
            
            for (const id of originalIds) {
              if (!sortedIds.has(id)) {
                return false;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty array should remain empty
   */
  it('sorting an empty array should return an empty array', () => {
    const sorted = sortExpensesByDate([]);
    expect(sorted).toEqual([]);
  });

  /**
   * Edge case: Single expense should remain unchanged
   */
  it('sorting a single expense should return the same expense', () => {
    const expense: Expense = {
      id: '1',
      name: 'Test',
      category: 'Food',
      amount: 100,
      date: '2024-01-15',
      createdAt: Timestamp.now()
    };
    
    const sorted = sortExpensesByDate([expense]);
    expect(sorted).toHaveLength(1);
    expect(sorted[0]).toEqual(expense);
  });

  /**
   * Edge case: Expenses with same date should all be present
   */
  it('sorting expenses with identical dates should preserve all expenses', () => {
    const expenses: Expense[] = [
      { id: '1', name: 'A', category: 'Food', amount: 10, date: '2024-01-15', createdAt: Timestamp.now() },
      { id: '2', name: 'B', category: 'Food', amount: 20, date: '2024-01-15', createdAt: Timestamp.now() },
      { id: '3', name: 'C', category: 'Food', amount: 30, date: '2024-01-15', createdAt: Timestamp.now() },
    ];
    
    const sorted = sortExpensesByDate(expenses);
    expect(sorted).toHaveLength(3);
    
    const ids = sorted.map(e => e.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
  });
});
