import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { financeStore } from '../../stores/financeStore';
import { ListenerManager } from './listeners';

describe('Month Navigation and Data Management', () => {
  let listenerManager: ListenerManager;

  beforeEach(() => {
    listenerManager = new ListenerManager();
    // Reset finance store
    financeStore.reset();
  });

  afterEach(() => {
    listenerManager.detachAll();
  });

  describe('Month Selector Change Handler', () => {
    it('should update selectedMonthId when month is changed', () => {
      // Arrange
      const newMonthId = '2024-01';
      const initialState = get(financeStore);
      
      // Act
      financeStore.setSelectedMonthId(newMonthId);
      const updatedState = get(financeStore);
      
      // Assert
      expect(updatedState.selectedMonthId).toBe(newMonthId);
      expect(updatedState.selectedMonthId).not.toBe(initialState.selectedMonthId);
    });

    it('should maintain other store properties when changing month', () => {
      // Arrange
      const testDebts = [{ id: '1', name: 'Test Debt', totalAmount: 1000, paidAmount: 500 }];
      financeStore.setDebts(testDebts as any);
      const newMonthId = '2024-02';
      
      // Act
      financeStore.setSelectedMonthId(newMonthId);
      const state = get(financeStore);
      
      // Assert
      expect(state.selectedMonthId).toBe(newMonthId);
      expect(state.debts).toEqual(testDebts);
    });
  });

  describe('Listener Management', () => {
    it('should track month-specific listeners separately', () => {
      // Arrange
      const mockCallback = vi.fn();
      
      // Add some non-month listeners
      listenerManager.attachDebtsListener('user123', mockCallback);
      listenerManager.attachCategoriesListener('user123', mockCallback);
      
      const beforeMonthCount = listenerManager.getActiveListenerCount();
      
      // Mark start of month listeners
      listenerManager.markMonthListenersStart();
      
      // Add month-specific listeners
      listenerManager.attachExpensesListener('user123', '2024-01', mockCallback);
      listenerManager.attachMonthlyTasksListener('user123', '2024-01', mockCallback);
      
      const afterMonthCount = listenerManager.getActiveListenerCount();
      
      // Assert
      expect(afterMonthCount).toBe(beforeMonthCount + 2);
    });

    it('should detach only month-specific listeners', () => {
      // Arrange
      const mockCallback = vi.fn();
      
      // Add non-month listeners
      listenerManager.attachDebtsListener('user123', mockCallback);
      listenerManager.attachCategoriesListener('user123', mockCallback);
      
      // Mark start of month listeners
      listenerManager.markMonthListenersStart();
      
      // Add month-specific listeners
      listenerManager.attachExpensesListener('user123', '2024-01', mockCallback);
      listenerManager.attachMonthlyTasksListener('user123', '2024-01', mockCallback);
      
      const totalCount = listenerManager.getActiveListenerCount();
      
      // Act - detach only month listeners
      listenerManager.detachMonthListeners();
      
      const remainingCount = listenerManager.getActiveListenerCount();
      
      // Assert - should have 2 non-month listeners remaining
      expect(totalCount).toBe(4);
      expect(remainingCount).toBe(2);
    });

    it('should allow reattaching month listeners for new month', () => {
      // Arrange
      const mockCallback = vi.fn();
      
      // Add non-month listeners
      listenerManager.attachDebtsListener('user123', mockCallback);
      
      // Add month listeners for January
      listenerManager.markMonthListenersStart();
      listenerManager.attachExpensesListener('user123', '2024-01', mockCallback);
      listenerManager.attachMonthlyTasksListener('user123', '2024-01', mockCallback);
      
      // Act - detach January listeners
      listenerManager.detachMonthListeners();
      
      // Add month listeners for February
      listenerManager.markMonthListenersStart();
      listenerManager.attachExpensesListener('user123', '2024-02', mockCallback);
      listenerManager.attachMonthlyTasksListener('user123', '2024-02', mockCallback);
      
      const finalCount = listenerManager.getActiveListenerCount();
      
      // Assert - should have 1 non-month + 2 new month listeners
      expect(finalCount).toBe(3);
    });
  });

  describe('Available Months List', () => {
    it('should populate available months list', () => {
      // Arrange
      const months = ['2024-03', '2024-02', '2024-01'];
      
      // Act
      financeStore.setAvailableMonths(months);
      const state = get(financeStore);
      
      // Assert
      expect(state.availableMonths).toEqual(months);
      expect(state.availableMonths.length).toBe(3);
    });

    it('should maintain months in descending order', () => {
      // Arrange
      const months = ['2024-03', '2024-02', '2024-01'];
      
      // Act
      financeStore.setAvailableMonths(months);
      const state = get(financeStore);
      
      // Assert
      expect(state.availableMonths[0]).toBe('2024-03'); // newest first
      expect(state.availableMonths[2]).toBe('2024-01'); // oldest last
    });
  });

  describe('Month Display Labels', () => {
    it('should format month ID correctly', () => {
      // Arrange
      const monthId = '2024-01';
      
      // Act
      const [year, month] = monthId.split('-');
      
      // Assert
      expect(year).toBe('2024');
      expect(month).toBe('01');
      expect(parseInt(month, 10)).toBe(1);
    });

    it('should handle different month formats', () => {
      // Arrange
      const testCases = [
        { input: '2024-01', expectedMonth: 1 },
        { input: '2024-12', expectedMonth: 12 },
        { input: '2023-06', expectedMonth: 6 }
      ];
      
      // Act & Assert
      testCases.forEach(({ input, expectedMonth }) => {
        const [, month] = input.split('-');
        expect(parseInt(month, 10)).toBe(expectedMonth);
      });
    });
  });

  describe('Current Month Management', () => {
    it('should maintain separate currentMonthId and selectedMonthId', () => {
      // Arrange
      const currentMonth = '2024-03';
      const selectedMonth = '2024-01';
      
      // Act
      financeStore.setCurrentMonthId(currentMonth);
      financeStore.setSelectedMonthId(selectedMonth);
      const state = get(financeStore);
      
      // Assert
      expect(state.currentMonthId).toBe(currentMonth);
      expect(state.selectedMonthId).toBe(selectedMonth);
      expect(state.currentMonthId).not.toBe(state.selectedMonthId);
    });

    it('should allow viewing historical months while preserving current month', () => {
      // Arrange
      const currentMonth = '2024-03';
      financeStore.setCurrentMonthId(currentMonth);
      
      // Act - user navigates to previous month
      financeStore.setSelectedMonthId('2024-02');
      const state1 = get(financeStore);
      
      // Act - user navigates back to current month
      financeStore.setSelectedMonthId(currentMonth);
      const state2 = get(financeStore);
      
      // Assert
      expect(state1.currentMonthId).toBe(currentMonth);
      expect(state1.selectedMonthId).toBe('2024-02');
      expect(state2.currentMonthId).toBe(currentMonth);
      expect(state2.selectedMonthId).toBe(currentMonth);
    });
  });
});
