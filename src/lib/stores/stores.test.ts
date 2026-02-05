/**
 * Property-Based Tests for Svelte Stores
 * Feature: ordina-svelte-migration
 * 
 * These tests validate the correctness properties of the Svelte store system.
 */

import { describe, it, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import * as fc from 'fast-check';
import { userStore } from './userStore';
import { financeStore } from './financeStore';
import { tasksStore } from './tasksStore';
import { calendarStore } from './calendarStore';
import { uiStore } from './uiStore';
import { Currency, Theme, Language, TaskStatus, EventType } from '../types';
import type { UserProfile } from '../types';

describe('Store Reactivity Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    userStore.clearUser();
    financeStore.reset();
    tasksStore.reset();
    calendarStore.reset();
    uiStore.reset();
  });

  /**
   * Property 1: Store Reactivity
   * For any store value change, subscribed components should re-render with the updated value.
   * Validates: Requirements 5.4
   */
  describe('Feature: ordina-svelte-migration, Property 1: Store Reactivity', () => {
    it('userStore should update reactively when user is set', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.emailAddress(),
          fc.option(fc.string(), { nil: undefined }),
          (uid, email, displayName) => {
            const userProfile: UserProfile = {
              uid,
              email,
              displayName,
            };

            // Set user
            userStore.setUser(uid, userProfile);

            // Get current state
            const state = get(userStore);

            // Verify state updated correctly
            return (
              state.userId === uid &&
              state.isAuthenticated === true &&
              state.userProfile?.uid === uid &&
              state.userProfile?.email === email &&
              state.userProfile?.displayName === displayName
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('financeStore should update reactively when currency is changed', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(Currency.AZN, Currency.USD),
          (currency) => {
            // Set currency
            financeStore.setCurrency(currency);

            // Get current state
            const state = get(financeStore);

            // Verify state updated correctly
            return state.currency === currency;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('financeStore should update reactively when debts are added', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              totalAmount: fc.float({ min: 0, max: 1000000 }),
              paidAmount: fc.float({ min: 0, max: 1000000 }),
              comment: fc.option(fc.string(), { nil: undefined }),
              createdAt: fc.constant({ seconds: Date.now() / 1000, nanoseconds: 0 } as any),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (debts) => {
            // Set debts
            financeStore.setDebts(debts);

            // Get current state
            const state = get(financeStore);

            // Verify state updated correctly
            return state.debts.length === debts.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('financeStore should update reactively when expenses are added', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              category: fc.string({ minLength: 1 }),
              amount: fc.float({ min: 0, max: 10000 }),
              date: fc.date().map(d => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }),
              createdAt: fc.constant({ seconds: Date.now() / 1000, nanoseconds: 0 } as any),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (expenses) => {
            // Set expenses
            financeStore.setExpenses(expenses);

            // Get current state
            const state = get(financeStore);

            // Verify state updated correctly
            return state.expenses.length === expenses.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tasksStore should update reactively when daily tasks are added', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              date: fc.date().map(d => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }),
              status: fc.constantFrom(TaskStatus.NOT_DONE, TaskStatus.DONE, TaskStatus.SKIPPED),
              notes: fc.option(fc.string(), { nil: undefined }),
              createdAt: fc.constant({ seconds: Date.now() / 1000, nanoseconds: 0 } as any),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (tasks) => {
            // Set daily tasks
            tasksStore.setDailyTasks(tasks);

            // Get current state
            const state = get(tasksStore);

            // Verify state updated correctly
            return state.dailyTasks.length === tasks.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('calendarStore should update reactively when events are added', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              date: fc.date().map(d => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }),
              type: fc.constantFrom(EventType.EVENT, EventType.BIRTHDAY, EventType.MEETING, EventType.WEDDING),
              notes: fc.option(fc.string(), { nil: undefined }),
              createdAt: fc.constant({ seconds: Date.now() / 1000, nanoseconds: 0 } as any),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (events) => {
            // Set calendar events
            calendarStore.setCalendarEvents(events);

            // Get current state
            const state = get(calendarStore);

            // Verify state updated correctly
            return state.calendarEvents.length === events.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('uiStore should update reactively when theme is toggled', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(Theme.LIGHT, Theme.DARK),
          (initialTheme) => {
            // Set initial theme
            uiStore.setTheme(initialTheme);

            // Toggle theme
            uiStore.toggleTheme();

            // Get current state
            const state = get(uiStore);

            // Verify theme was toggled
            const expectedTheme = initialTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
            return state.theme === expectedTheme;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('uiStore should update reactively when language is changed', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(Language.EN, Language.RU, Language.AZ, Language.IT),
          (language) => {
            // Set language
            uiStore.setLanguage(language);

            // Get current state
            const state = get(uiStore);

            // Verify state updated correctly
            return state.language === language;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('uiStore should update reactively when active tab is changed', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'),
          (tab) => {
            // Set active tab
            uiStore.setActiveTab(tab);

            // Get current state
            const state = get(uiStore);

            // Verify state updated correctly
            return state.activeTab === tab;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('uiStore should update reactively when modal is opened and closed', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (modalName) => {
            // Open modal
            uiStore.openModal(modalName);

            // Get current state
            let state = get(uiStore);

            // Verify modal opened
            const modalOpened = state.activeModal === modalName;

            // Close modal
            uiStore.closeModal();

            // Get updated state
            state = get(uiStore);

            // Verify modal closed
            const modalClosed = state.activeModal === null;

            return modalOpened && modalClosed;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('financeStore should update reactively when month is changed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2020, max: 2030 }),
          fc.integer({ min: 1, max: 12 }),
          (year, month) => {
            const monthId = `${year}-${String(month).padStart(2, '0')}`;

            // Set selected month
            financeStore.setSelectedMonthId(monthId);

            // Get current state
            const state = get(financeStore);

            // Verify state updated correctly
            return state.selectedMonthId === monthId;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tasksStore should update reactively when current daily date is changed', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            // Set current daily date
            tasksStore.setCurrentDailyDate(dateStr);

            // Get current state
            const state = get(tasksStore);

            // Verify state updated correctly
            return state.currentDailyDate === dateStr;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('calendarStore should update reactively when calendar date is navigated', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -12, max: 12 }),
          (monthOffset) => {
            calendarStore.reset();
            // Get initial date
            const initialState = get(calendarStore);
            const initialMonth = initialState.calendarDate.getMonth();
            const initialYear = initialState.calendarDate.getFullYear();
            const initialDay = initialState.calendarDate.getDate();

            // Navigate months
            calendarStore.navigateMonth(monthOffset);

            // Get updated state
            const state = get(calendarStore);
            const newDate = state.calendarDate;

            // Calculate expected date (same day-of-month semantics as Date.setMonth)
            const expectedDate = new Date(initialYear, initialMonth, initialDay);
            expectedDate.setMonth(expectedDate.getMonth() + monthOffset);

            // Verify month and year match (day might differ)
            return (
              newDate.getMonth() === expectedDate.getMonth() &&
              newDate.getFullYear() === expectedDate.getFullYear()
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
