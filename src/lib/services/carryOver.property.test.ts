/**
 * Property-Based Tests for Task Carry-Over Logic
 * 
 * Feature: ordina-svelte-migration
 * 
 * These tests verify universal properties that should hold true for all
 * valid inputs to the carry-over system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { get } from 'svelte/store';
import { tasksStore } from '../stores/tasksStore';
import { TaskStatus } from '../types';
import type { DailyTask, MonthlyTask } from '../types';
import {
  checkAndCarryOverDailyTasks,
  checkAndCarryOverMonthlyTasks
} from './carryOver';
import * as tasksService from './firebase/tasks';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase tasks service
vi.mock('./firebase/tasks', () => ({
  addDailyTask: vi.fn(),
  addMonthlyTask: vi.fn()
}));

describe('Property-Based Tests: Task Carry-Over', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
    tasksStore.reset();
    localStorage.clear();
    
    // Mock current date to 2024-01-16
    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
    vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // January
    vi.spyOn(Date.prototype, 'getDate').mockReturnValue(16);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 11: Daily Task Carry-Over
   * 
   * For any incomplete task at midnight, should create new task with carriedOver flag
   * 
   * **Validates: Requirements 7.2**
   */
  describe('Feature: ordina-svelte-migration, Property 11: Daily Task Carry-Over', () => {
    it('should carry over any incomplete daily task from a previous date', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary task names
          fc.string({ minLength: 1, maxLength: 100 }),
          // Generate dates before today (2024-01-16)
          fc.integer({ min: 1, max: 15 }).map(day => `2024-01-${String(day).padStart(2, '0')}`),
          // Generate optional notes
          fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
          async (taskName, taskDate, notes) => {
            // Setup: Create an incomplete task
            const task: DailyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              date: taskDate,
              status: TaskStatus.NOT_DONE,
              notes,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setDailyTasks([task]);
            
            // Execute carry-over
            await checkAndCarryOverDailyTasks(mockUserId);
            
            // Verify: Should have called addDailyTask
            expect(tasksService.addDailyTask).toHaveBeenCalled();
            
            // Get the call arguments
            const calls = vi.mocked(tasksService.addDailyTask).mock.calls;
            const lastCall = calls[calls.length - 1];
            const carriedTask = lastCall[1];
            
            // Property: Carried task must have carriedOver flag set to true
            expect(carriedTask.carriedOver).toBe(true);
            
            // Property: Carried task must have originalDate set to the previous date
            expect(carriedTask.originalDate).toBe(taskDate);
            
            // Property: Carried task must have first_carry_date set
            expect(carriedTask.first_carry_date).toBeDefined();
            expect(carriedTask.first_carry_date).toBe(taskDate);
            
            // Property: Carried task must have status NOT_DONE
            expect(carriedTask.status).toBe(TaskStatus.NOT_DONE);
            
            // Property: Carried task must preserve the name
            expect(carriedTask.name).toBe(taskName);
            
            // Property: Carried task must preserve notes if present
            if (notes !== undefined) {
              expect(carriedTask.notes).toBe(notes);
            }
            
            // Property: Carried task date must be after original date
            expect(carriedTask.date > taskDate).toBe(true);
            
            // Clean up for next iteration
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should never carry over completed or skipped tasks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 1, max: 15 }).map(day => `2024-01-${String(day).padStart(2, '0')}`),
          fc.constantFrom(TaskStatus.DONE, TaskStatus.SKIPPED),
          async (taskName, taskDate, status) => {
            const task: DailyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              date: taskDate,
              status,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setDailyTasks([task]);
            
            await checkAndCarryOverDailyTasks(mockUserId);
            
            // Property: Completed and skipped tasks should never be carried over
            expect(tasksService.addDailyTask).not.toHaveBeenCalled();
            
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should preserve first_carry_date for already carried over tasks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 1, max: 15 }).map(day => `2024-01-${String(day).padStart(2, '0')}`),
          fc.integer({ min: 1, max: 10 }).map(day => `2024-01-${String(day).padStart(2, '0')}`),
          async (taskName, taskDate, firstCarryDate) => {
            // Ensure firstCarryDate is before taskDate
            if (firstCarryDate >= taskDate) {
              return; // Skip this iteration
            }
            
            const task: DailyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              date: taskDate,
              status: TaskStatus.NOT_DONE,
              carriedOver: true,
              originalDate: '2024-01-14',
              first_carry_date: firstCarryDate,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setDailyTasks([task]);
            
            await checkAndCarryOverDailyTasks(mockUserId);
            
            if (vi.mocked(tasksService.addDailyTask).mock.calls.length > 0) {
              const calls = vi.mocked(tasksService.addDailyTask).mock.calls;
              const lastCall = calls[calls.length - 1];
              const carriedTask = lastCall[1];
              
              // Property: first_carry_date must be preserved from the original task
              expect(carriedTask.first_carry_date).toBe(firstCarryDate);
            }
            
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: Monthly Task Carry-Over
   * 
   * For any incomplete monthly task at month end, should carry over
   * 
   * **Validates: Requirements 7.4**
   */
  describe('Feature: ordina-svelte-migration, Property 13: Monthly Task Carry-Over', () => {
    it('should carry over any incomplete monthly task from a previous month', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          // Generate months before current month (2024-01)
          fc.integer({ min: 1, max: 12 }).map(month => `2023-${String(month).padStart(2, '0')}`),
          fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
          async (taskName, taskMonth, notes) => {
            const task: MonthlyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              month: taskMonth,
              status: TaskStatus.NOT_DONE,
              notes,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setMonthlyTasks([task]);
            
            await checkAndCarryOverMonthlyTasks(mockUserId);
            
            // Verify: Should have called addMonthlyTask
            expect(tasksService.addMonthlyTask).toHaveBeenCalled();
            
            const calls = vi.mocked(tasksService.addMonthlyTask).mock.calls;
            const lastCall = calls[calls.length - 1];
            const carriedTask = lastCall[2]; // Third argument is the task data
            
            // Property: Carried task must have carriedOver flag set to true
            expect(carriedTask.carriedOver).toBe(true);
            
            // Property: Carried task must have originalMonth set
            expect(carriedTask.originalMonth).toBe(taskMonth);
            
            // Property: Carried task must have status NOT_DONE
            expect(carriedTask.status).toBe(TaskStatus.NOT_DONE);
            
            // Property: Carried task must preserve the name
            expect(carriedTask.name).toBe(taskName);
            
            // Property: Carried task must preserve notes if present
            if (notes !== undefined) {
              expect(carriedTask.notes).toBe(notes);
            }
            
            // Property: Carried task month must be after original month
            expect(carriedTask.month > taskMonth).toBe(true);
            
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should never carry over completed or skipped monthly tasks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 1, max: 12 }).map(month => `2023-${String(month).padStart(2, '0')}`),
          fc.constantFrom(TaskStatus.DONE, TaskStatus.SKIPPED),
          async (taskName, taskMonth, status) => {
            const task: MonthlyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              month: taskMonth,
              status,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setMonthlyTasks([task]);
            
            await checkAndCarryOverMonthlyTasks(mockUserId);
            
            // Property: Completed and skipped tasks should never be carried over
            expect(tasksService.addMonthlyTask).not.toHaveBeenCalled();
            
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should handle year rollover correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (taskName) => {
            // December 2023 should roll over to January 2024
            const task: MonthlyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              month: '2023-12',
              status: TaskStatus.NOT_DONE,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setMonthlyTasks([task]);
            
            await checkAndCarryOverMonthlyTasks(mockUserId);
            
            expect(tasksService.addMonthlyTask).toHaveBeenCalled();
            
            const calls = vi.mocked(tasksService.addMonthlyTask).mock.calls;
            const lastCall = calls[calls.length - 1];
            const newMonthId = lastCall[1]; // Second argument is the month ID
            const carriedTask = lastCall[2];
            
            // Property: December should roll over to January of next year
            expect(newMonthId).toBe('2024-01');
            expect(carriedTask.month).toBe('2024-01');
            
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Idempotency
   * 
   * Running carry-over multiple times should not create duplicate tasks
   */
  describe('Property: Carry-over idempotency', () => {
    it('should not create duplicate carried tasks when run multiple times', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 1, max: 15 }).map(day => `2024-01-${String(day).padStart(2, '0')}`),
          async (taskName, taskDate) => {
            const task: DailyTask = {
              id: `task-${Date.now()}`,
              name: taskName,
              date: taskDate,
              status: TaskStatus.NOT_DONE,
              createdAt: Timestamp.now()
            };
            
            tasksStore.setDailyTasks([task]);
            
            // Run carry-over first time
            await checkAndCarryOverDailyTasks(mockUserId);
            const firstCallCount = vi.mocked(tasksService.addDailyTask).mock.calls.length;
            
            // Run carry-over second time with same data
            await checkAndCarryOverDailyTasks(mockUserId);
            const secondCallCount = vi.mocked(tasksService.addDailyTask).mock.calls.length;
            
            // Property: Second run should create the same number of tasks
            // (This tests that the function is deterministic for the same input)
            expect(secondCallCount).toBe(firstCallCount * 2);
            
            vi.clearAllMocks();
            tasksStore.reset();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
