/**
 * TypeScript Type Definitions for ORDINA Svelte Migration
 * 
 * This file contains all TypeScript interfaces, types, and enums used throughout
 * the ORDINA application. These types ensure type safety and provide clear
 * contracts for data structures used in Firebase, Svelte stores, and components.
 */

import type { Timestamp } from 'firebase/firestore';

// ============================================================================
// Enums
// ============================================================================

/**
 * Task status values (in Russian as per original implementation)
 */
export enum TaskStatus {
  NOT_DONE = 'Не выполнено',
  DONE = 'Выполнено',
  SKIPPED = 'Пропущено'
}

/**
 * Calendar event types
 */
export enum EventType {
  EVENT = 'event',
  BIRTHDAY = 'birthday',
  MEETING = 'meeting',
  WEDDING = 'wedding'
}

/**
 * Supported currencies
 */
export enum Currency {
  AZN = 'AZN',
  USD = 'USD'
}

/**
 * Supported languages
 */
export enum Language {
  EN = 'en',
  RU = 'ru',
  AZ = 'az',
  IT = 'it'
}

/**
 * Theme options
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

// ============================================================================
// User Interfaces
// ============================================================================

/**
 * User profile information from Firebase Authentication
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

// ============================================================================
// Finance Interfaces
// ============================================================================

/**
 * Expense record stored in monthlyData/{monthId}/expenses
 */
export interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  recurringExpenseId?: string;
  debtPaymentId?: string;
  createdAt: Timestamp;
}

/**
 * Debt record stored in users/{userId}/debts
 */
export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  comment?: string;
  lastPaymentDate?: Timestamp;
  createdAt: Timestamp;
}

/**
 * Recurring expense template stored in users/{userId}/recurringExpenses
 */
export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  details?: string;
  createdAt: Timestamp;
}

/**
 * Expense category stored in users/{userId}/categories
 */
export interface Category {
  id: string;
  name: string;
  createdAt: Timestamp;
}

// ============================================================================
// Task Interfaces
// ============================================================================

/**
 * Daily task stored in users/{userId}/dailyTasks
 */
export interface DailyTask {
  id: string;
  name: string;
  date: string; // ISO date string YYYY-MM-DD
  status: TaskStatus;
  notes?: string;
  carriedOver?: boolean;
  originalDate?: string;
  first_carry_date?: string;
  createdAt: Timestamp;
}

/**
 * Monthly task stored in users/{userId}/monthlyData/{monthId}/tasks
 */
export interface MonthlyTask {
  id: string;
  name: string;
  month: string; // YYYY-MM
  status: TaskStatus;
  notes?: string;
  carriedOver?: boolean;
  originalMonth?: string;
  createdAt: Timestamp;
}

/**
 * Yearly task stored in users/{userId}/yearlyTasks
 */
export interface YearlyTask {
  id: string;
  name: string;
  year: number;
  status: TaskStatus;
  notes?: string;
  createdAt: Timestamp;
}

// ============================================================================
// Calendar Interfaces
// ============================================================================

/**
 * Calendar event stored in users/{userId}/calendarEvents
 */
export interface CalendarEvent {
  id: string;
  name: string;
  date: string; // ISO date string YYYY-MM-DD
  type: EventType;
  notes?: string;
  createdAt: Timestamp;
}

// ============================================================================
// Store Type Interfaces
// ============================================================================

/**
 * User store state
 */
export interface UserStore {
  userId: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
}

/**
 * Finance store state
 */
export interface FinanceStore {
  currentMonthId: string;
  selectedMonthId: string;
  currency: Currency;
  exchangeRate: number;
  debts: Debt[];
  expenses: Expense[];
  recurringTemplates: RecurringExpense[];
  recurringStatuses: Record<string, string>;
  categories: Category[];
  availableMonths: string[];
}

/**
 * Tasks store state
 */
export interface TasksStore {
  dailyTasks: DailyTask[];
  monthlyTasks: MonthlyTask[];
  yearlyTasks: YearlyTask[];
  currentDailyDate: string;
}

/**
 * Calendar store state
 */
export interface CalendarStore {
  calendarDate: Date;
  calendarEvents: CalendarEvent[];
}

/**
 * UI store state
 */
export interface UIStore {
  activeTab: string;
  activeModal: string | null;
  theme: Theme;
  language: Language;
  isOffline: boolean;
  isMobileSidebarOpen: boolean;
}

// ============================================================================
// Type Aliases for Convenience
// ============================================================================

/**
 * Type alias for task status string values
 */
export type TaskStatusValue = TaskStatus.NOT_DONE | TaskStatus.DONE | TaskStatus.SKIPPED;

/**
 * Type alias for event type string values
 */
export type EventTypeValue = EventType.EVENT | EventType.BIRTHDAY | EventType.MEETING | EventType.WEDDING;

/**
 * Type alias for currency string values
 */
export type CurrencyValue = Currency.AZN | Currency.USD;

/**
 * Type alias for language string values
 */
export type LanguageValue = Language.EN | Language.RU | Language.AZ | Language.IT;

/**
 * Type alias for theme string values
 */
export type ThemeValue = Theme.LIGHT | Theme.DARK;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type for creating new entities (without id and createdAt)
 */
export type NewExpense = Omit<Expense, 'id' | 'createdAt'>;
export type NewDebt = Omit<Debt, 'id' | 'createdAt'>;
export type NewRecurringExpense = Omit<RecurringExpense, 'id' | 'createdAt'>;
export type NewCategory = Omit<Category, 'id' | 'createdAt'>;
export type NewDailyTask = Omit<DailyTask, 'id' | 'createdAt'>;
export type NewMonthlyTask = Omit<MonthlyTask, 'id' | 'createdAt'>;
export type NewYearlyTask = Omit<YearlyTask, 'id' | 'createdAt'>;
export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'createdAt'>;

/**
 * Type for updating entities (all fields optional except id)
 */
export type UpdateExpense = Partial<Omit<Expense, 'id' | 'createdAt'>> & { id: string };
export type UpdateDebt = Partial<Omit<Debt, 'id' | 'createdAt'>> & { id: string };
export type UpdateRecurringExpense = Partial<Omit<RecurringExpense, 'id' | 'createdAt'>> & { id: string };
export type UpdateCategory = Partial<Omit<Category, 'id' | 'createdAt'>> & { id: string };
export type UpdateDailyTask = Partial<Omit<DailyTask, 'id' | 'createdAt'>> & { id: string };
export type UpdateMonthlyTask = Partial<Omit<MonthlyTask, 'id' | 'createdAt'>> & { id: string };
export type UpdateYearlyTask = Partial<Omit<YearlyTask, 'id' | 'createdAt'>> & { id: string };
export type UpdateCalendarEvent = Partial<Omit<CalendarEvent, 'id' | 'createdAt'>> & { id: string };
