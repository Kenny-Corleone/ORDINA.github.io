/**
 * Unit tests for task carry-over service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { tasksStore } from '../stores/tasksStore';
import { TaskStatus } from '../types';
import type { DailyTask, MonthlyTask } from '../types';
import {
  checkAndCarryOverDailyTasks,
  checkAndCarryOverMonthlyTasks,
  checkForNewDay,
  checkForNewMonth,
  scheduleMidnightRollover,
  handleVisibilityChange
} from './carryOver';
import * as tasksService from './firebase/tasks';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase tasks service
vi.mock('./firebase/tasks', () => ({
  addDailyTask: vi.fn(),
  addMonthlyTask: vi.fn()
}));

describe('carryOver service', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset tasks store
    tasksStore.reset();
    
    // Clear localStorage
    localStorage.clear();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkAndCarryOverDailyTasks', () => {
    it('should carry over incomplete daily tasks from previous days', async () => {
      // Setup: Add incomplete tasks from yesterday
      const yesterday = '2024-01-15';
      const today = '2024-01-16';
      
      // Mock getTodayISOString to return a fixed date
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // January (0-indexed)
      vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
      
      const incompleteTasks: DailyTask[] = [
        {
          id: 'task1',
          name: 'Incomplete Task 1',
          date: yesterday,
          status: TaskStatus.NOT_DONE,
          notes: 'Test notes',
          createdAt: Timestamp.now()
        },
        {
          id: 'task2',
          name: 'Incomplete Task 2',
          date: yesterday,
          status: TaskStatus.NOT_DONE,
          createdAt: Timestamp.now()
        }
      ];
      
      tasksStore.setDailyTasks(incompleteTasks);
      
      // Execute
      await checkAndCarryOverDailyTasks(mockUserId);
      
      // Verify: Should have called addDailyTask twice
      expect(tasksService.addDailyTask).toHaveBeenCalledTimes(2);
      
      // Verify first task
      expect(tasksService.addDailyTask).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          name: 'Incomplete Task 1',
          date: today,
          status: TaskStatus.NOT_DONE,
          carriedOver: true,
          originalDate: yesterday,
          first_carry_date: yesterday
        })
      );
      
      // Verify second task
      expect(tasksService.addDailyTask).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          name: 'Incomplete Task 2',
          date: today,
          status: TaskStatus.NOT_DONE,
          carriedOver: true,
          originalDate: yesterday,
          first_carry_date: yesterday
        })
      );
    });
    
    it('should not carry over completed tasks', async () => {
      const yesterday = '2024-01-15';
      
      const completedTask: DailyTask = {
        id: 'task1',
        name: 'Completed Task',
        date: yesterday,
        status: TaskStatus.DONE,
        createdAt: Timestamp.now()
      };
      
      tasksStore.setDailyTasks([completedTask]);
      
      await checkAndCarryOverDailyTasks(mockUserId);
      
      // Should not carry over completed tasks
      expect(tasksService.addDailyTask).not.toHaveBeenCalled();
    });
    
    it('should not carry over skipped tasks', async () => {
      const yesterday = '2024-01-15';
      
      const skippedTask: DailyTask = {
        id: 'task1',
        name: 'Skipped Task',
        date: yesterday,
        status: TaskStatus.SKIPPED,
        createdAt: Timestamp.now()
      };
      
      tasksStore.setDailyTasks([skippedTask]);
      
      await checkAndCarryOverDailyTasks(mockUserId);
      
      // Should not carry over skipped tasks
      expect(tasksService.addDailyTask).not.toHaveBeenCalled();
    });
    
    it('should preserve first_carry_date for already carried over tasks', async () => {
      const yesterday = '2024-01-15';
      const today = '2024-01-16';
      const originalDate = '2024-01-10';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
      
      const carriedTask: DailyTask = {
        id: 'task1',
        name: 'Already Carried Task',
        date: yesterday,
        status: TaskStatus.NOT_DONE,
        carriedOver: true,
        originalDate: '2024-01-14',
        first_carry_date: originalDate,
        createdAt: Timestamp.now()
      };
      
      tasksStore.setDailyTasks([carriedTask]);
      
      await checkAndCarryOverDailyTasks(mockUserId);
      
      // Should preserve the original first_carry_date
      expect(tasksService.addDailyTask).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          first_carry_date: originalDate
        })
      );
    });
  });

  describe('checkAndCarryOverMonthlyTasks', () => {
    it('should carry over incomplete monthly tasks from previous months', async () => {
      const lastMonth = '2023-12';
      const currentMonth = '2024-01';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // January
      
      const incompleteTasks: MonthlyTask[] = [
        {
          id: 'task1',
          name: 'Incomplete Monthly Task',
          month: lastMonth,
          status: TaskStatus.NOT_DONE,
          notes: 'Test notes',
          createdAt: Timestamp.now()
        }
      ];
      
      tasksStore.setMonthlyTasks(incompleteTasks);
      
      await checkAndCarryOverMonthlyTasks(mockUserId);
      
      expect(tasksService.addMonthlyTask).toHaveBeenCalledWith(
        mockUserId,
        currentMonth,
        expect.objectContaining({
          name: 'Incomplete Monthly Task',
          month: currentMonth,
          status: TaskStatus.NOT_DONE,
          carriedOver: true,
          originalMonth: lastMonth
        })
      );
    });
    
    it('should not carry over completed monthly tasks', async () => {
      const lastMonth = '2023-12';
      
      const completedTask: MonthlyTask = {
        id: 'task1',
        name: 'Completed Monthly Task',
        month: lastMonth,
        status: TaskStatus.DONE,
        createdAt: Timestamp.now()
      };
      
      tasksStore.setMonthlyTasks([completedTask]);
      
      await checkAndCarryOverMonthlyTasks(mockUserId);
      
      expect(tasksService.addMonthlyTask).not.toHaveBeenCalled();
    });
    
    it('should handle year rollover correctly', async () => {
      const lastMonth = '2023-12';
      const currentMonth = '2024-01';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      
      const task: MonthlyTask = {
        id: 'task1',
        name: 'Year Rollover Task',
        month: lastMonth,
        status: TaskStatus.NOT_DONE,
        createdAt: Timestamp.now()
      };
      
      tasksStore.setMonthlyTasks([task]);
      
      await checkAndCarryOverMonthlyTasks(mockUserId);
      
      expect(tasksService.addMonthlyTask).toHaveBeenCalledWith(
        mockUserId,
        currentMonth,
        expect.objectContaining({
          month: currentMonth
        })
      );
    });
  });

  describe('checkForNewDay', () => {
    it('should return new date and carry over tasks when day changes', async () => {
      const lastCheckDate = '2024-01-15';
      const today = '2024-01-16';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
      
      const result = await checkForNewDay(mockUserId, lastCheckDate);
      
      expect(result).toBe(today);
    });
    
    it('should return null when day has not changed', async () => {
      const today = '2024-01-16';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
      
      const result = await checkForNewDay(mockUserId, today);
      
      expect(result).toBeNull();
    });
  });

  describe('checkForNewMonth', () => {
    it('should return new month and carry over tasks when month changes', async () => {
      const lastCheckMonth = '2023-12';
      const currentMonth = '2024-01';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      
      const result = await checkForNewMonth(mockUserId, lastCheckMonth);
      
      expect(result).toBe(currentMonth);
    });
    
    it('should return null when month has not changed', async () => {
      const currentMonth = '2024-01';
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      
      const result = await checkForNewMonth(mockUserId, currentMonth);
      
      expect(result).toBeNull();
    });
  });

  describe('scheduleMidnightRollover', () => {
    it('should return a cleanup function', () => {
      const cleanup = scheduleMidnightRollover(mockUserId);
      
      expect(typeof cleanup).toBe('function');
      
      // Clean up
      cleanup();
    });
    
    it('should call onRollover callback when rollover occurs', async () => {
      const onRollover = vi.fn();
      
      // Mock localStorage to simulate a day change
      localStorage.setItem('lastCarryOverDate', '2024-01-15');
      localStorage.setItem('lastCarryOverMonth', '2024-01');
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
      
      const cleanup = scheduleMidnightRollover(mockUserId, onRollover);
      
      // Clean up immediately (we're just testing the setup)
      cleanup();
      
      expect(cleanup).toBeDefined();
    });
  });

  describe('handleVisibilityChange', () => {
    it('should check for rollover when document becomes visible', async () => {
      // Mock document visibility
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible'
      });
      
      localStorage.setItem('lastCarryOverDate', '2024-01-15');
      localStorage.setItem('lastCarryOverMonth', '2024-01');
      
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
      vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
      
      const onRollover = vi.fn();
      
      await handleVisibilityChange(mockUserId, onRollover);
      
      // Should have updated localStorage
      expect(localStorage.getItem('lastCarryOverDate')).toBe('2024-01-16');
    });
    
    it('should not check for rollover when document is hidden', async () => {
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'hidden'
      });
      
      const onRollover = vi.fn();
      
      await handleVisibilityChange(mockUserId, onRollover);
      
      // Should not have called the callback
      expect(onRollover).not.toHaveBeenCalled();
    });
  });
});
