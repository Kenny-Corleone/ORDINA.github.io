/**
 * Task Carry-Over Service
 * 
 * Handles automatic carry-over of incomplete daily and monthly tasks.
 * - Daily tasks: Incomplete tasks are carried over to the next day at midnight
 * - Monthly tasks: Incomplete tasks are carried over to the next month at month end
 * 
 * Requirements: 7.2, 7.4, 7.9
 */

import { get } from 'svelte/store';
import { tasksStore } from '../stores/tasksStore';
import { financeStore } from '../stores/financeStore';
import { addDailyTask, addMonthlyTask } from './firebase/tasks';
import { getTodayISOString, getCurrentMonthId } from '../utils/formatting';
import type { DailyTask, MonthlyTask } from '../types';
import { TaskStatus } from '../types';

/**
 * Get the next day's date in ISO format (YYYY-MM-DD)
 */
function getNextDayISOString(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get the next month's ID in format (YYYY-MM)
 */
function getNextMonthId(monthId: string): string {
  const [year, month] = monthId.split('-').map(Number);
  
  let nextYear = year;
  let nextMonth = month + 1;
  
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

/**
 * Check and carry over incomplete daily tasks
 * 
 * This function checks for daily tasks that are:
 * - Marked as "Not Done" (Не выполнено)
 * - Have a date before today
 * 
 * For each incomplete task, it creates a new task for the next day with:
 * - carriedOver flag set to true
 * - first_carry_date set to the original date (if not already carried over)
 * - originalDate set to the previous day's date
 * 
 * @param userId - The user ID
 * @returns Promise that resolves when carry-over is complete
 */
export async function checkAndCarryOverDailyTasks(userId: string): Promise<void> {
  try {
    const today = getTodayISOString();
    const tasks = get(tasksStore).dailyTasks;
    
    // Find incomplete tasks from previous days
    const incompleteTasks = tasks.filter(task => 
      task.status === TaskStatus.NOT_DONE && 
      task.date < today
    );
    
    // Carry over each incomplete task
    for (const task of incompleteTasks) {
      const nextDay = getNextDayISOString(task.date);
      
      // Only carry over if the next day is today or earlier
      // This prevents creating tasks for future dates
      if (nextDay <= today) {
        const carriedOverTask: Omit<DailyTask, 'id' | 'createdAt'> = {
          name: task.name,
          date: nextDay,
          status: TaskStatus.NOT_DONE,
          notes: task.notes,
          carriedOver: true,
          originalDate: task.date,
          // Preserve the first carry date if this task was already carried over
          first_carry_date: task.first_carry_date || task.date
        };
        
        await addDailyTask(userId, carriedOverTask);
        
        console.log(`Carried over daily task "${task.name}" from ${task.date} to ${nextDay}`);
      }
    }
    
    if (incompleteTasks.length > 0) {
      console.log(`Carried over ${incompleteTasks.length} daily task(s)`);
    }
  } catch (error) {
    console.error('Error carrying over daily tasks:', error);
    throw error;
  }
}

/**
 * Check and carry over incomplete monthly tasks
 * 
 * This function checks for monthly tasks that are:
 * - Marked as "Not Done" (Не выполнено)
 * - Have a month before the current month
 * 
 * For each incomplete task, it creates a new task for the next month with:
 * - carriedOver flag set to true
 * - originalMonth set to the previous month
 * 
 * @param userId - The user ID
 * @returns Promise that resolves when carry-over is complete
 */
export async function checkAndCarryOverMonthlyTasks(userId: string): Promise<void> {
  try {
    const currentMonthId = getCurrentMonthId();
    const tasks = get(tasksStore).monthlyTasks;
    
    // Find incomplete tasks from previous months
    const incompleteTasks = tasks.filter(task => 
      task.status === TaskStatus.NOT_DONE && 
      task.month < currentMonthId
    );
    
    // Carry over each incomplete task
    for (const task of incompleteTasks) {
      const nextMonth = getNextMonthId(task.month);
      
      // Only carry over if the next month is current month or earlier
      // This prevents creating tasks for future months
      if (nextMonth <= currentMonthId) {
        const carriedOverTask: Omit<MonthlyTask, 'id' | 'createdAt'> = {
          name: task.name,
          month: nextMonth,
          status: TaskStatus.NOT_DONE,
          notes: task.notes,
          carriedOver: true,
          originalMonth: task.month
        };
        
        await addMonthlyTask(userId, nextMonth, carriedOverTask);
        
        console.log(`Carried over monthly task "${task.name}" from ${task.month} to ${nextMonth}`);
      }
    }
    
    if (incompleteTasks.length > 0) {
      console.log(`Carried over ${incompleteTasks.length} monthly task(s)`);
    }
  } catch (error) {
    console.error('Error carrying over monthly tasks:', error);
    throw error;
  }
}

/**
 * Check if it's a new day and perform daily task carry-over
 * 
 * This function should be called:
 * - On app initialization
 * - When the user returns to the app (visibility change)
 * - At midnight (scheduled check)
 * 
 * @param userId - The user ID
 * @param lastCheckDate - The last date when carry-over was checked (YYYY-MM-DD)
 * @returns The current date if carry-over was performed, null otherwise
 */
export async function checkForNewDay(
  userId: string, 
  lastCheckDate: string
): Promise<string | null> {
  const today = getTodayISOString();
  
  // If it's a new day, perform carry-over
  if (today !== lastCheckDate) {
    console.log(`New day detected: ${today} (last check: ${lastCheckDate})`);
    await checkAndCarryOverDailyTasks(userId);
    return today;
  }
  
  return null;
}

/**
 * Check if it's a new month and perform monthly task carry-over
 * 
 * This function should be called:
 * - On app initialization
 * - When the user returns to the app (visibility change)
 * - At midnight (scheduled check)
 * 
 * @param userId - The user ID
 * @param lastCheckMonth - The last month when carry-over was checked (YYYY-MM)
 * @returns The current month if carry-over was performed, null otherwise
 */
export async function checkForNewMonth(
  userId: string,
  lastCheckMonth: string
): Promise<string | null> {
  const currentMonth = getCurrentMonthId();
  
  // If it's a new month, perform carry-over
  if (currentMonth !== lastCheckMonth) {
    console.log(`New month detected: ${currentMonth} (last check: ${lastCheckMonth})`);
    await checkAndCarryOverMonthlyTasks(userId);
    return currentMonth;
  }
  
  return null;
}

/**
 * Schedule midnight rollover check
 * 
 * This function sets up an interval to check for day/month changes at midnight.
 * It calculates the time until the next midnight and sets up a timeout,
 * then repeats every 24 hours.
 * 
 * @param userId - The user ID
 * @param onRollover - Callback function to execute after rollover
 * @returns Cleanup function to clear the interval
 */
export function scheduleMidnightRollover(
  userId: string,
  onRollover?: () => void
): () => void {
  let timeoutId: number | null = null;
  let intervalId: number | null = null;
  
  const performRolloverCheck = async () => {
    try {
      const lastCheckDate = localStorage.getItem('lastCarryOverDate') || getTodayISOString();
      const lastCheckMonth = localStorage.getItem('lastCarryOverMonth') || getCurrentMonthId();
      
      // Check for new day
      const newDate = await checkForNewDay(userId, lastCheckDate);
      if (newDate) {
        localStorage.setItem('lastCarryOverDate', newDate);
      }
      
      // Check for new month
      const newMonth = await checkForNewMonth(userId, lastCheckMonth);
      if (newMonth) {
        localStorage.setItem('lastCarryOverMonth', newMonth);
      }
      
      // Call the callback if provided
      if (onRollover && (newDate || newMonth)) {
        onRollover();
      }
    } catch (error) {
      console.error('Error during rollover check:', error);
    }
  };
  
  // Calculate milliseconds until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  // Schedule first check at midnight
  timeoutId = window.setTimeout(() => {
    performRolloverCheck();
    
    // Then check every 24 hours
    intervalId = window.setInterval(performRolloverCheck, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  // Return cleanup function
  return () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  };
}

/**
 * Handle visibility change to check for rollover
 * 
 * This function should be called when the document becomes visible again.
 * It checks if a new day or month has occurred while the app was hidden.
 * 
 * @param userId - The user ID
 * @param onRollover - Callback function to execute after rollover
 */
export async function handleVisibilityChange(
  userId: string,
  onRollover?: () => void
): Promise<void> {
  if (document.visibilityState === 'visible') {
    try {
      const lastCheckDate = localStorage.getItem('lastCarryOverDate') || getTodayISOString();
      const lastCheckMonth = localStorage.getItem('lastCarryOverMonth') || getCurrentMonthId();
      
      // Check for new day
      const newDate = await checkForNewDay(userId, lastCheckDate);
      if (newDate) {
        localStorage.setItem('lastCarryOverDate', newDate);
      }
      
      // Check for new month
      const newMonth = await checkForNewMonth(userId, lastCheckMonth);
      if (newMonth) {
        localStorage.setItem('lastCarryOverMonth', newMonth);
      }
      
      // Call the callback if provided
      if (onRollover && (newDate || newMonth)) {
        onRollover();
      }
    } catch (error) {
      console.error('Error during visibility change rollover check:', error);
    }
  }
}
