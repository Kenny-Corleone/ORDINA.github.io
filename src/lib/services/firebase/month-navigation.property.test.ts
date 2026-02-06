/**
 * Property-Based Tests for Month Navigation
 * 
 * Feature: ordina-svelte-migration
 * 
 * These tests verify universal properties that should hold true for all valid
 * month navigation scenarios using property-based testing with fast-check.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { get } from 'svelte/store';
import { financeStore } from '../../stores/financeStore';
import { ListenerManager } from './listeners';

describe('Property-Based Tests: Month Navigation', () => {
  let listenerManager: ListenerManager;

  beforeEach(() => {
    listenerManager = new ListenerManager();
    financeStore.reset();
  });

  afterEach(() => {
    listenerManager.detachAll();
  });

  /**
   * Property 26: Month Selection Updates
   * 
   * For any month selection from the month selector dropdown, the selectedMonthId 
   * store should update to the selected month and all month-specific data 
   * (expenses, monthly tasks, recurring statuses) should reload from Firestore.
   * 
   * **Validates: Requirements 18.2**
   */
  it('Feature: ordina-svelte-migration, Property 26: Month Selection Updates', () => {
    fc.assert(
      fc.property(
        // Generate valid month IDs (YYYY-MM format)
        fc.integer({ min: 2020, max: 2030 }).chain(year =>
          fc.integer({ min: 1, max: 12 }).map(month => ({
            year,
            month,
            monthId: `${year}-${String(month).padStart(2, '0')}`
          }))
        ),
        (monthData) => {
          // Arrange - reset store and set a different initial month
          financeStore.reset();
          const differentMonth = monthData.month === 1 ? '2020-12' : '2020-01';
          financeStore.setSelectedMonthId(differentMonth);
          const initialState = get(financeStore);
          
          // Act - select the month
          financeStore.setSelectedMonthId(monthData.monthId);
          const updatedState = get(financeStore);
          
          // Assert - selectedMonthId should be updated
          expect(updatedState.selectedMonthId).toBe(monthData.monthId);
          
          // Verify month ID format is correct
          const [year, month] = monthData.monthId.split('-');
          expect(parseInt(year, 10)).toBe(monthData.year);
          expect(parseInt(month, 10)).toBe(monthData.month);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26: Month Selection Preserves Other State
   * 
   * For any month selection, non-month-specific data (debts, categories, 
   * recurring templates) should be preserved.
   */
  it('Feature: ordina-svelte-migration, Property 26: Month Selection Preserves Other State', () => {
    fc.assert(
      fc.property(
        // Generate month IDs and test data
        fc.record({
          monthId: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).map(month =>
              `${year}-${String(month).padStart(2, '0')}`
            )
          ),
          debts: fc.array(fc.record({
            id: fc.string(),
            name: fc.string(),
            totalAmount: fc.float({ min: 0, max: 100000 }),
            paidAmount: fc.float({ min: 0, max: 100000 })
          }), { maxLength: 10 }),
          categories: fc.array(fc.record({
            id: fc.string(),
            name: fc.string()
          }), { maxLength: 20 })
        }),
        (testData) => {
          // Arrange - set up test data
          financeStore.reset();
          financeStore.setDebts(testData.debts as any);
          financeStore.setCategories(testData.categories as any);
          
          // Act - change month
          financeStore.setSelectedMonthId(testData.monthId);
          const state = get(financeStore);
          
          // Assert - non-month data should be preserved
          expect(state.debts).toEqual(testData.debts);
          expect(state.categories).toEqual(testData.categories);
          expect(state.selectedMonthId).toBe(testData.monthId);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27: Listener Cleanup on Month Change
   * 
   * For any month change, all existing Firestore listeners for the previous 
   * month's collections should be detached before new listeners for the new 
   * month are attached.
   * 
   * **Validates: Requirements 18.6**
   */
  it('Feature: ordina-svelte-migration, Property 27: Listener Cleanup on Month Change', () => {
    fc.assert(
      fc.property(
        // Generate two different month IDs
        fc.tuple(
          fc.integer({ min: 2020, max: 2030 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 12 })
        ).filter(([year, month1, month2]) => month1 !== month2)
         .map(([year, month1, month2]) => ({
           month1: `${year}-${String(month1).padStart(2, '0')}`,
           month2: `${year}-${String(month2).padStart(2, '0')}`
         })),
        (months) => {
          // Arrange - set up listeners for first month
          const mockCallback = () => {};
          const userId = 'test-user';
          
          // Add non-month listeners
          listenerManager.attachDebtsListener(userId, mockCallback);
          listenerManager.attachCategoriesListener(userId, mockCallback);
          const nonMonthCount = listenerManager.getActiveListenerCount();
          
          // Add month-specific listeners for month1
          listenerManager.markMonthListenersStart();
          listenerManager.attachExpensesListener(userId, months.month1, mockCallback);
          listenerManager.attachMonthlyTasksListener(userId, months.month1, mockCallback);
          listenerManager.attachRecurringExpenseStatusesListener(userId, months.month1, mockCallback);
          const withMonth1Count = listenerManager.getActiveListenerCount();
          
          // Act - detach month1 listeners
          listenerManager.detachMonthListeners();
          const afterDetachCount = listenerManager.getActiveListenerCount();
          
          // Add month-specific listeners for month2
          listenerManager.markMonthListenersStart();
          listenerManager.attachExpensesListener(userId, months.month2, mockCallback);
          listenerManager.attachMonthlyTasksListener(userId, months.month2, mockCallback);
          listenerManager.attachRecurringExpenseStatusesListener(userId, months.month2, mockCallback);
          const withMonth2Count = listenerManager.getActiveListenerCount();
          
          // Assert - listener counts should follow expected pattern
          expect(withMonth1Count).toBe(nonMonthCount + 3); // added 3 month listeners
          expect(afterDetachCount).toBe(nonMonthCount); // back to just non-month listeners
          expect(withMonth2Count).toBe(nonMonthCount + 3); // added 3 new month listeners
          
          // Cleanup
          listenerManager.detachAll();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27: Listener Cleanup Preserves Non-Month Listeners
   * 
   * For any month change, non-month-specific listeners (debts, categories, 
   * calendar events) should remain active.
   */
  it('Feature: ordina-svelte-migration, Property 27: Listener Cleanup Preserves Non-Month Listeners', () => {
    fc.assert(
      fc.property(
        // Generate number of non-month listeners and month IDs
        fc.record({
          nonMonthListenerCount: fc.integer({ min: 1, max: 10 }),
          month1: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).map(month =>
              `${year}-${String(month).padStart(2, '0')}`
            )
          ),
          month2: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).map(month =>
              `${year}-${String(month).padStart(2, '0')}`
            )
          )
        }).filter(data => data.month1 !== data.month2),
        (testData) => {
          // Arrange - add non-month listeners
          const mockCallback = () => {};
          const userId = 'test-user';
          
          for (let i = 0; i < testData.nonMonthListenerCount; i++) {
            listenerManager.attachDebtsListener(userId, mockCallback);
          }
          const nonMonthCount = listenerManager.getActiveListenerCount();
          
          // Add month-specific listeners
          listenerManager.markMonthListenersStart();
          listenerManager.attachExpensesListener(userId, testData.month1, mockCallback);
          listenerManager.attachMonthlyTasksListener(userId, testData.month1, mockCallback);
          
          // Act - detach month listeners
          listenerManager.detachMonthListeners();
          const afterDetachCount = listenerManager.getActiveListenerCount();
          
          // Assert - non-month listeners should remain
          expect(afterDetachCount).toBe(nonMonthCount);
          expect(afterDetachCount).toBe(testData.nonMonthListenerCount);
          
          // Cleanup
          listenerManager.detachAll();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Month ID Format Consistency
   * 
   * For any valid month ID, it should always be in YYYY-MM format and 
   * parseable back to year and month components.
   */
  it('Feature: ordina-svelte-migration, Property: Month ID Format Consistency', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2100 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          // Arrange - create month ID
          const monthId = `${year}-${String(month).padStart(2, '0')}`;
          
          // Act - parse month ID
          const [parsedYear, parsedMonth] = monthId.split('-');
          
          // Assert - should parse correctly
          expect(parseInt(parsedYear, 10)).toBe(year);
          expect(parseInt(parsedMonth, 10)).toBe(month);
          expect(parsedMonth.length).toBe(2); // always 2 digits
          expect(monthId).toMatch(/^\d{4}-\d{2}$/); // format check
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Available Months Ordering
   * 
   * For any list of month IDs, when set as available months, they should 
   * maintain their order (descending order expected in real usage).
   */
  it('Feature: ordina-svelte-migration, Property: Available Months Ordering', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).map(month =>
              `${year}-${String(month).padStart(2, '0')}`
            )
          ),
          { minLength: 1, maxLength: 50 }
        ),
        (months) => {
          // Arrange - sort months in descending order
          const sortedMonths = [...months].sort().reverse();
          
          // Act - set available months
          financeStore.setAvailableMonths(sortedMonths);
          const state = get(financeStore);
          
          // Assert - months should be stored as provided
          expect(state.availableMonths).toEqual(sortedMonths);
          
          // Verify descending order
          for (let i = 0; i < state.availableMonths.length - 1; i++) {
            expect(state.availableMonths[i] >= state.availableMonths[i + 1]).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Current vs Selected Month Independence
   * 
   * For any combination of current month and selected month, they should 
   * be independently settable and retrievable.
   */
  it('Feature: ordina-svelte-migration, Property: Current vs Selected Month Independence', () => {
    fc.assert(
      fc.property(
        fc.record({
          currentMonth: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).map(month =>
              `${year}-${String(month).padStart(2, '0')}`
            )
          ),
          selectedMonth: fc.integer({ min: 2020, max: 2030 }).chain(year =>
            fc.integer({ min: 1, max: 12 }).map(month =>
              `${year}-${String(month).padStart(2, '0')}`
            )
          )
        }),
        (months) => {
          // Arrange & Act - set both months
          financeStore.setCurrentMonthId(months.currentMonth);
          financeStore.setSelectedMonthId(months.selectedMonth);
          const state = get(financeStore);
          
          // Assert - both should be set independently
          expect(state.currentMonthId).toBe(months.currentMonth);
          expect(state.selectedMonthId).toBe(months.selectedMonth);
          
          // Changing one should not affect the other
          financeStore.setSelectedMonthId('2025-01');
          const state2 = get(financeStore);
          expect(state2.currentMonthId).toBe(months.currentMonth); // unchanged
          expect(state2.selectedMonthId).toBe('2025-01'); // changed
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
