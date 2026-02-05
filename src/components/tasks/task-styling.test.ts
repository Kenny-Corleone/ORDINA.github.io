/**
 * Property-Based Tests for Task Styling
 * Feature: ordina-svelte-migration
 * 
 * These tests verify that task styling behaves correctly for carried-over tasks.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/svelte';
import DailyTasksSection from './DailyTasksSection.svelte';
import MonthlyTasksSection from './MonthlyTasksSection.svelte';
import { tasksStore } from '../../lib/stores/tasksStore';
import { TaskStatus } from '../../lib/types';
import type { DailyTask, MonthlyTask } from '../../lib/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Helper function to check if an element has the carried-over styling class
 */
function hasCarriedOverClass(element: HTMLElement): boolean {
  return element.classList.contains('carried-over');
}

describe('Task Styling Property Tests', () => {
  /**
   * Property 15: Carried-Over Task Styling
   * For any task with carriedOver=true, the rendered table row should include 
   * the CSS class for blue background highlighting.
   * 
   * Validates: Requirements 7.8
   */
  it('Feature: ordina-svelte-migration, Property 15: Carried-Over Task Styling - tasks with carriedOver flag should have blue background class', () => {
    fc.assert(
      fc.property(
        // Generate an array of daily tasks with random carriedOver flags
        fc.array(
          fc.record({
            id: fc.uuid().noShrink(), // Use UUID with noShrink to prevent duplicate IDs during shrinking
            name: fc.string({ minLength: 1, maxLength: 100 }),
            date: fc.constantFrom('2024-01-15', '2024-01-16', '2024-01-17'), // Use fixed dates for simplicity
            status: fc.constantFrom(TaskStatus.NOT_DONE, TaskStatus.DONE, TaskStatus.SKIPPED),
            notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
            carriedOver: fc.boolean(),
            originalDate: fc.option(fc.constantFrom('2024-01-14', '2024-01-15'), { nil: undefined }),
            first_carry_date: fc.option(fc.constantFrom('2024-01-14', '2024-01-15'), { nil: undefined }),
            createdAt: fc.constant(Timestamp.now())
          }),
          { minLength: 1, maxLength: 10 } // Reduce max length for faster tests
        ),
        (tasks) => {
          // Set the tasks in the store
          tasksStore.setDailyTasks(tasks as DailyTask[]);
          
          // Set current date to match one of the tasks
          if (tasks.length > 0) {
            tasksStore.setCurrentDailyDate(tasks[0].date);
          }
          
          // Render the component
          const { container } = render(DailyTasksSection);
          
          // Find all task rows
          const taskRows = container.querySelectorAll('.task-row');
          
          // Count tasks that should be displayed (matching the current date)
          const displayedTasks = tasks.filter(t => t.date === tasks[0].date);
          
          // Count how many should have carried-over class
          const expectedCarriedOverCount = displayedTasks.filter(t => t.carriedOver).length;
          
          // Count how many rows actually have the carried-over class
          const actualCarriedOverCount = Array.from(taskRows).filter(row => 
            hasCarriedOverClass(row as HTMLElement)
          ).length;
          
          // The counts should match
          return expectedCarriedOverCount === actualCarriedOverCount;
        }
      ),
      { numRuns: 50 } // Reduce number of runs for faster tests
    );
  });

  /**
   * Property: Monthly tasks with carriedOver flag should also have styling
   */
  it('monthly tasks with carriedOver flag should have blue background class', () => {
    fc.assert(
      fc.property(
        // Generate an array of monthly tasks with random carriedOver flags
        fc.array(
          fc.record({
            id: fc.uuid().noShrink(), // Use UUID with noShrink to prevent duplicate IDs during shrinking
            name: fc.string({ minLength: 1, maxLength: 100 }),
            month: fc.constantFrom('2024-01', '2024-02', '2024-03'),
            status: fc.constantFrom(TaskStatus.NOT_DONE, TaskStatus.DONE, TaskStatus.SKIPPED),
            notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
            carriedOver: fc.boolean(),
            originalMonth: fc.option(
              fc.constantFrom('2023-11', '2023-12', '2024-01'),
              { nil: undefined }
            ),
            createdAt: fc.constant(Timestamp.now())
          }),
          { minLength: 1, maxLength: 10 } // Reduce max length for faster tests
        ),
        (tasks) => {
          // Set the tasks in the store
          tasksStore.setMonthlyTasks(tasks as MonthlyTask[]);
          
          // Render the component
          const { container } = render(MonthlyTasksSection);
          
          // Find all task rows
          const taskRows = container.querySelectorAll('.task-row');
          
          // Count how many tasks should have carried-over class
          const expectedCarriedOverCount = tasks.filter(t => t.carriedOver).length;
          
          // Count how many rows actually have the carried-over class
          const actualCarriedOverCount = Array.from(taskRows).filter(row => 
            hasCarriedOverClass(row as HTMLElement)
          ).length;
          
          // The counts should match
          return expectedCarriedOverCount === actualCarriedOverCount;
        }
      ),
      { numRuns: 50 } // Reduce number of runs for faster tests
    );
  });

  /**
   * Edge case: Task without carriedOver flag should not have styling
   */
  it('task without carriedOver flag should not have carried-over class', () => {
    const task: DailyTask = {
      id: '1',
      name: 'Regular Task',
      date: '2024-01-15',
      status: TaskStatus.NOT_DONE,
      createdAt: Timestamp.now()
    };
    
    tasksStore.setDailyTasks([task]);
    tasksStore.setCurrentDailyDate('2024-01-15');
    
    const { container } = render(DailyTasksSection);
    const taskRow = container.querySelector('.task-row');
    
    expect(taskRow).toBeTruthy();
    expect(hasCarriedOverClass(taskRow as HTMLElement)).toBe(false);
  });

  /**
   * Edge case: Task with carriedOver=true should have styling
   */
  it('task with carriedOver=true should have carried-over class', () => {
    const task: DailyTask = {
      id: '1',
      name: 'Carried Over Task',
      date: '2024-01-15',
      status: TaskStatus.NOT_DONE,
      carriedOver: true,
      first_carry_date: '2024-01-14',
      createdAt: Timestamp.now()
    };
    
    tasksStore.setDailyTasks([task]);
    tasksStore.setCurrentDailyDate('2024-01-15');
    
    const { container } = render(DailyTasksSection);
    const taskRow = container.querySelector('.task-row');
    
    expect(taskRow).toBeTruthy();
    expect(hasCarriedOverClass(taskRow as HTMLElement)).toBe(true);
  });

  /**
   * Edge case: Task with carriedOver=false should not have styling
   */
  it('task with carriedOver=false should not have carried-over class', () => {
    const task: DailyTask = {
      id: '1',
      name: 'Not Carried Over Task',
      date: '2024-01-15',
      status: TaskStatus.NOT_DONE,
      carriedOver: false,
      createdAt: Timestamp.now()
    };
    
    tasksStore.setDailyTasks([task]);
    tasksStore.setCurrentDailyDate('2024-01-15');
    
    const { container } = render(DailyTasksSection);
    const taskRow = container.querySelector('.task-row');
    
    expect(taskRow).toBeTruthy();
    expect(hasCarriedOverClass(taskRow as HTMLElement)).toBe(false);
  });

  /**
   * Edge case: Multiple tasks with mixed carriedOver flags
   */
  it('multiple tasks should have correct styling based on carriedOver flag', () => {
    const tasks: DailyTask[] = [
      {
        id: '1',
        name: 'Regular Task',
        date: '2024-01-15',
        status: TaskStatus.NOT_DONE,
        createdAt: Timestamp.now()
      },
      {
        id: '2',
        name: 'Carried Over Task',
        date: '2024-01-15',
        status: TaskStatus.NOT_DONE,
        carriedOver: true,
        first_carry_date: '2024-01-14',
        createdAt: Timestamp.now()
      },
      {
        id: '3',
        name: 'Another Regular Task',
        date: '2024-01-15',
        status: TaskStatus.DONE,
        carriedOver: false,
        createdAt: Timestamp.now()
      }
    ];
    
    tasksStore.setDailyTasks(tasks);
    tasksStore.setCurrentDailyDate('2024-01-15');
    
    const { container } = render(DailyTasksSection);
    const taskRows = container.querySelectorAll('.task-row');
    
    expect(taskRows).toHaveLength(3);
    
    // First task (regular) should not have carried-over class
    const firstRow = Array.from(taskRows).find(r => r.textContent?.includes('Regular Task'));
    expect(firstRow).toBeTruthy();
    expect(hasCarriedOverClass(firstRow as HTMLElement)).toBe(false);
    
    // Second task (carried over) should have carried-over class
    const secondRow = Array.from(taskRows).find(r => r.textContent?.includes('Carried Over Task'));
    expect(secondRow).toBeTruthy();
    expect(hasCarriedOverClass(secondRow as HTMLElement)).toBe(true);
    
    // Third task (regular with explicit false) should not have carried-over class
    const thirdRow = Array.from(taskRows).find(r => r.textContent?.includes('Another Regular Task'));
    expect(thirdRow).toBeTruthy();
    expect(hasCarriedOverClass(thirdRow as HTMLElement)).toBe(false);
  });
});
