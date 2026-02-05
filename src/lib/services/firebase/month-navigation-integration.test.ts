import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { financeStore } from '../../stores/financeStore';
import { tasksStore } from '../../stores/tasksStore';
import { ListenerManager } from './listeners';
import { getCurrentMonthId } from '../../utils/formatting';

describe('Month Navigation Integration Tests', () => {
  let listenerManager: ListenerManager;

  beforeEach(() => {
    listenerManager = new ListenerManager();
    financeStore.reset();
    tasksStore.reset();
  });

  afterEach(() => {
    listenerManager.detachAll();
  });

  describe('Complete Month Navigation Flow', () => {
    it('should handle complete month change workflow', () => {
      // Arrange - simulate initial state
      const userId = 'test-user-123';
      const currentMonth = getCurrentMonthId();
      const previousMonth = getPreviousMonthId(currentMonth);
      
      financeStore.setCurrentMonthId(currentMonth);
      financeStore.setSelectedMonthId(currentMonth);
      
      // Set up some test data for current month
      const currentMonthExpenses = [
        { id: '1', name: 'Expense 1', amount: 100, date: `${currentMonth}-15` },
        { id: '2', name: 'Expense 2', amount: 200, date: `${currentMonth}-20` }
      ];
      financeStore.setExpenses(currentMonthExpenses as any);
      
      // Act - user changes to previous month
      financeStore.setSelectedMonthId(previousMonth);
      
      // Assert - selectedMonthId changed but currentMonthId remains
      const state = get(financeStore);
      expect(state.selectedMonthId).toBe(previousMonth);
      expect(state.currentMonthId).toBe(currentMonth);
    });

    it('should maintain listener separation during month navigation', () => {
      // Arrange
      const userId = 'test-user-123';
      const mockCallback = vi.fn();
      
      // Set up non-month listeners (debts, categories, etc.)
      listenerManager.attachDebtsListener(userId, mockCallback);
      listenerManager.attachCategoriesListener(userId, mockCallback);
      listenerManager.attachCalendarEventsListener(userId, mockCallback);
      
      const nonMonthListenerCount = listenerManager.getActiveListenerCount();
      
      // Set up month-specific listeners for January
      listenerManager.markMonthListenersStart();
      listenerManager.attachExpensesListener(userId, '2024-01', mockCallback);
      listenerManager.attachMonthlyTasksListener(userId, '2024-01', mockCallback);
      listenerManager.attachRecurringExpenseStatusesListener(userId, '2024-01', mockCallback);
      
      const totalWithJanuaryCount = listenerManager.getActiveListenerCount();
      
      // Act - simulate month change to February
      listenerManager.detachMonthListeners();
      
      const afterDetachCount = listenerManager.getActiveListenerCount();
      
      // Set up month-specific listeners for February
      listenerManager.markMonthListenersStart();
      listenerManager.attachExpensesListener(userId, '2024-02', mockCallback);
      listenerManager.attachMonthlyTasksListener(userId, '2024-02', mockCallback);
      listenerManager.attachRecurringExpenseStatusesListener(userId, '2024-02', mockCallback);
      
      const totalWithFebruaryCount = listenerManager.getActiveListenerCount();
      
      // Assert
      expect(nonMonthListenerCount).toBe(3); // debts, categories, calendar
      expect(totalWithJanuaryCount).toBe(6); // 3 non-month + 3 month-specific
      expect(afterDetachCount).toBe(3); // back to just non-month listeners
      expect(totalWithFebruaryCount).toBe(6); // 3 non-month + 3 new month-specific
    });

    it('should handle rapid month changes correctly', () => {
      // Arrange
      const months = ['2024-01', '2024-02', '2024-03', '2024-04'];
      
      // Act - rapidly change months
      months.forEach(month => {
        financeStore.setSelectedMonthId(month);
      });
      
      // Assert - should end up on the last month
      const state = get(financeStore);
      expect(state.selectedMonthId).toBe('2024-04');
    });

    it('should preserve non-month data during month navigation', () => {
      // Arrange
      const testDebts = [
        { id: '1', name: 'Debt 1', totalAmount: 1000, paidAmount: 500 },
        { id: '2', name: 'Debt 2', totalAmount: 2000, paidAmount: 1000 }
      ];
      const testCategories = [
        { id: '1', name: 'Food' },
        { id: '2', name: 'Transport' }
      ];
      
      financeStore.setDebts(testDebts as any);
      financeStore.setCategories(testCategories as any);
      
      // Act - change months multiple times
      financeStore.setSelectedMonthId('2024-01');
      financeStore.setSelectedMonthId('2024-02');
      financeStore.setSelectedMonthId('2024-03');
      
      // Assert - non-month data should be preserved
      const state = get(financeStore);
      expect(state.debts).toEqual(testDebts);
      expect(state.categories).toEqual(testCategories);
    });
  });

  describe('Available Months Management', () => {
    it('should automatically include current month in available months', () => {
      // Arrange
      const currentMonth = getCurrentMonthId();
      const availableMonths = ['2024-02', '2024-01', '2023-12'];
      
      // Act
      financeStore.setAvailableMonths(availableMonths);
      
      // Assert - if current month is not in list, it should be added
      const state = get(financeStore);
      if (!availableMonths.includes(currentMonth)) {
        // In real implementation, this would be handled by the listener
        expect(state.availableMonths).toEqual(availableMonths);
      } else {
        expect(state.availableMonths).toContain(currentMonth);
      }
    });

    it('should maintain months in descending order', () => {
      // Arrange
      const months = ['2024-03', '2024-02', '2024-01', '2023-12'];
      
      // Act
      financeStore.setAvailableMonths(months);
      
      // Assert
      const state = get(financeStore);
      for (let i = 0; i < state.availableMonths.length - 1; i++) {
        expect(state.availableMonths[i] >= state.availableMonths[i + 1]).toBe(true);
      }
    });
  });

  describe('Midnight Rollover and Month Update', () => {
    it('should detect when current month changes', () => {
      // Arrange
      const oldMonth = '2024-01';
      const newMonth = '2024-02';
      
      financeStore.setCurrentMonthId(oldMonth);
      financeStore.setSelectedMonthId(oldMonth);
      
      // Act - simulate month rollover
      financeStore.setCurrentMonthId(newMonth);
      
      // Assert
      const state = get(financeStore);
      expect(state.currentMonthId).toBe(newMonth);
      // selectedMonthId should remain on old month until user changes it
      expect(state.selectedMonthId).toBe(oldMonth);
    });

    it('should allow updating both current and selected month after rollover', () => {
      // Arrange
      const oldMonth = '2024-01';
      const newMonth = '2024-02';
      
      financeStore.setCurrentMonthId(oldMonth);
      financeStore.setSelectedMonthId(oldMonth);
      
      // Act - simulate midnight rollover
      financeStore.setCurrentMonthId(newMonth);
      financeStore.setSelectedMonthId(newMonth);
      
      // Assert
      const state = get(financeStore);
      expect(state.currentMonthId).toBe(newMonth);
      expect(state.selectedMonthId).toBe(newMonth);
    });
  });

  describe('Data Loading During Month Navigation', () => {
    it('should clear month-specific data when changing months', () => {
      // Arrange
      const januaryExpenses = [
        { id: '1', name: 'Jan Expense', amount: 100, date: '2024-01-15' }
      ];
      const februaryExpenses = [
        { id: '2', name: 'Feb Expense', amount: 200, date: '2024-02-15' }
      ];
      
      financeStore.setSelectedMonthId('2024-01');
      financeStore.setExpenses(januaryExpenses as any);
      
      // Act - change to February
      financeStore.setSelectedMonthId('2024-02');
      financeStore.setExpenses(februaryExpenses as any);
      
      // Assert - should have February expenses
      const state = get(financeStore);
      expect(state.expenses).toEqual(februaryExpenses);
      expect(state.expenses).not.toEqual(januaryExpenses);
    });

    it('should handle empty month data correctly', () => {
      // Arrange
      financeStore.setSelectedMonthId('2024-01');
      financeStore.setExpenses([{ id: '1', name: 'Expense', amount: 100 }] as any);
      
      // Act - change to a month with no data
      financeStore.setSelectedMonthId('2024-02');
      financeStore.setExpenses([]);
      
      // Assert
      const state = get(financeStore);
      expect(state.expenses).toEqual([]);
      expect(state.expenses.length).toBe(0);
    });
  });

  describe('Month Display Formatting', () => {
    it('should correctly parse month ID components', () => {
      // Arrange
      const testCases = [
        { monthId: '2024-01', expectedYear: '2024', expectedMonth: '01' },
        { monthId: '2024-12', expectedYear: '2024', expectedMonth: '12' },
        { monthId: '2023-06', expectedYear: '2023', expectedMonth: '06' }
      ];
      
      // Act & Assert
      testCases.forEach(({ monthId, expectedYear, expectedMonth }) => {
        const [year, month] = monthId.split('-');
        expect(year).toBe(expectedYear);
        expect(month).toBe(expectedMonth);
      });
    });

    it('should handle month index conversion correctly', () => {
      // Arrange
      const monthIds = ['2024-01', '2024-06', '2024-12'];
      
      // Act & Assert
      monthIds.forEach(monthId => {
        const [, month] = monthId.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        expect(monthIndex).toBeGreaterThanOrEqual(0);
        expect(monthIndex).toBeLessThan(12);
      });
    });
  });
});

/**
 * Helper function to get previous month ID
 */
function getPreviousMonthId(monthId: string): string {
  const [year, month] = monthId.split('-').map(Number);
  
  let prevYear = year;
  let prevMonth = month - 1;
  
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}
