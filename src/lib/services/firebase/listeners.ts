import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { getDebtsCollection } from './debts';
import { getExpensesCollection } from './expenses';
import {
  getRecurringExpensesCollection,
  getRecurringExpenseStatusesCollection
} from './recurring';
import {
  getDailyTasksCollection,
  getMonthlyTasksCollection,
  getYearlyTasksCollection
} from './tasks';
import { getCalendarEventsCollection } from './calendar';
import { getCategoriesCollection } from './categories';

/**
 * Listener manager to track and detach all active listeners
 * 
 * This class manages Firebase Firestore real-time listeners (onSnapshot).
 * It provides functionality to:
 * 1. Track all active listeners
 * 2. Detach all listeners at once (e.g., on logout)
 * 3. Detach only month-specific listeners (e.g., on month change)
 * 
 * Month-specific listener management:
 * When a user navigates to a different month, we need to detach listeners
 * for the old month's data and attach new listeners for the new month.
 * However, we want to keep non-month-specific listeners (debts, categories, etc.)
 * active to avoid unnecessary re-fetching.
 * 
 * The markMonthListenersStart() method marks the point where month-specific
 * listeners begin, allowing detachMonthListeners() to remove only those listeners.
 */
export class ListenerManager {
  private unsubscribes: Unsubscribe[] = [];
  private monthListenersStartIndex: number = -1;

  /**
   * Mark the start of month-specific listeners
   * This allows us to detach only month-specific listeners later
   * 
   * Example flow:
   * 1. Attach debts listener (index 0)
   * 2. Attach categories listener (index 1)
   * 3. markMonthListenersStart() - marks index 2
   * 4. Attach expenses listener (index 2)
   * 5. Attach monthly tasks listener (index 3)
   * 6. detachMonthListeners() - detaches indices 2 and 3 only
   */
  markMonthListenersStart(): void {
    this.monthListenersStartIndex = this.unsubscribes.length;
  }

  /**
   * Attach listener for debts collection
   */
  attachDebtsListener(
    userId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const debtsCol = getDebtsCollection(userId);
    const unsubscribe = onSnapshot(debtsCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for expenses collection
   */
  attachExpensesListener(
    userId: string,
    monthId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const expensesCol = getExpensesCollection(userId, monthId);
    const unsubscribe = onSnapshot(expensesCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for recurring expenses templates
   */
  attachRecurringExpensesListener(
    userId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const recurringCol = getRecurringExpensesCollection(userId);
    const unsubscribe = onSnapshot(recurringCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for recurring expense statuses for a specific month
   */
  attachRecurringExpenseStatusesListener(
    userId: string,
    monthId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const statusesCol = getRecurringExpenseStatusesCollection(userId, monthId);
    const unsubscribe = onSnapshot(statusesCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for daily tasks filtered by date
   */
  attachDailyTasksListener(
    userId: string,
    date: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const tasksCol = getDailyTasksCollection(userId);
    const q = query(tasksCol, where('date', '==', date));
    const unsubscribe = onSnapshot(q, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for monthly tasks for a specific month
   */
  attachMonthlyTasksListener(
    userId: string,
    monthId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const tasksCol = getMonthlyTasksCollection(userId, monthId);
    const q = query(tasksCol, where('month', '==', monthId));
    const unsubscribe = onSnapshot(q, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for yearly tasks for a specific year
   */
  attachYearlyTasksListener(
    userId: string,
    year: number,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const tasksCol = getYearlyTasksCollection(userId);
    const q = query(tasksCol, where('year', '==', year));
    const unsubscribe = onSnapshot(q, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for calendar events
   */
  attachCalendarEventsListener(
    userId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const eventsCol = getCalendarEventsCollection(userId);
    const unsubscribe = onSnapshot(eventsCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for categories
   */
  attachCategoriesListener(
    userId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const categoriesCol = getCategoriesCollection(userId);
    const unsubscribe = onSnapshot(categoriesCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Attach listener for monthly data collection (to get available months)
   */
  attachMonthlyDataListener(
    userId: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
  ): void {
    const monthlyDataCol = collection(db, 'users', userId, 'monthlyData');
    const unsubscribe = onSnapshot(monthlyDataCol, callback);
    this.unsubscribes.push(unsubscribe);
  }

  /**
   * Detach all active listeners
   */
  detachAll(): void {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe());
    this.unsubscribes = [];
    this.monthListenersStartIndex = -1;
  }

  /**
   * Detach only month-specific listeners (those added after markMonthListenersStart)
   * 
   * This is called when the user navigates to a different month.
   * It removes only the listeners that were attached after markMonthListenersStart(),
   * preserving non-month-specific listeners like debts, categories, etc.
   * 
   * This optimization prevents unnecessary re-fetching of data that doesn't
   * change when switching months.
   */
  detachMonthListeners(): void {
    if (this.monthListenersStartIndex >= 0 && this.monthListenersStartIndex < this.unsubscribes.length) {
      // Detach listeners from the marked index onwards
      // splice() removes and returns the month-specific listeners
      const monthListeners = this.unsubscribes.splice(this.monthListenersStartIndex);
      monthListeners.forEach((unsubscribe) => unsubscribe());
      // Reset the marker
      this.monthListenersStartIndex = -1;
    }
  }

  /**
   * Get count of active listeners
   */
  getActiveListenerCount(): number {
    return this.unsubscribes.length;
  }
}

/**
 * Create a new listener manager instance
 */
export function createListenerManager(): ListenerManager {
  return new ListenerManager();
}
