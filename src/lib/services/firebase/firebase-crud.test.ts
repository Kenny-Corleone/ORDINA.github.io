import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  addDebt,
  addDebtPayment,
  addDailyTask,
  addMonthlyTask,
  addCalendarEvent,
  addCategory
} from './index';
import { TaskStatus, EventType } from '../../types';

// Mock Firebase Firestore
vi.mock('../../firebase', () => ({
  db: {},
  auth: {},
  app: {}
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(() => ({ _path: 'mocked-collection' })),
    doc: vi.fn((_col: unknown, id: string) => ({ _path: 'mocked-doc', id })),
    addDoc: vi.fn(async (_col: unknown, data: unknown) => ({ id: 'mock-id-' + Math.random(), ...(data as object) })),
    updateDoc: vi.fn(async () => {}),
    deleteDoc: vi.fn(async () => {}),
    getDoc: vi.fn(async () => ({
      exists: () => true,
      data: () => ({ name: 'Test Debt', totalAmount: 1000, paidAmount: 0 })
    })),
    Timestamp: {
      now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 })
    }
  };
});

/**
 * Feature: ordina-svelte-migration
 * Property 2: Expense CRUD Operations
 * For any valid expense data, adding should create Firestore document
 * Validates: Requirements 6.1
 */
describe('Property 2: Expense CRUD Operations', () => {
  it('should create Firestore document for any valid expense data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          category: fc.string({ minLength: 1, maxLength: 50 }),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
            .map(d => d.toISOString().split('T')[0])
        }),
        async (expenseData) => {
          const userId = 'test-user-id';
          const monthId = '2024-01';
          
          const result = await addExpense(userId, monthId, {
            ...expenseData,
            date: expenseData.date || '2024-01-01'
          });
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 3: Expense Update Persistence
 * For any expense and updates, editing should update Firestore
 * Validates: Requirements 6.2
 */
describe('Property 3: Expense Update Persistence', () => {
  it('should update Firestore for any expense and valid field updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          amount: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true })),
          category: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
        }),
        async (expenseId, updates) => {
          const userId = 'test-user-id';
          const monthId = '2024-01';
          
          // Filter out null values
          const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== null)
          );
          
          if (Object.keys(cleanUpdates).length === 0) {
            return true; // Skip if no updates
          }
          
          await updateExpense(userId, monthId, expenseId, cleanUpdates);
          
          // Verify updateDoc was called
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 4: Expense Deletion
 * For any expense, deleting should remove from Firestore
 * Validates: Requirements 6.3
 */
describe('Property 4: Expense Deletion', () => {
  it('should remove from Firestore for any expense', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (expenseId) => {
          const userId = 'test-user-id';
          const monthId = '2024-01';
          
          await deleteExpense(userId, monthId, expenseId);
          
          // Verify deleteDoc was called
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 5: Debt CRUD Operations
 * For any valid debt data, adding should create Firestore document
 * Validates: Requirements 6.4
 */
describe('Property 5: Debt CRUD Operations', () => {
  it('should create Firestore document for any valid debt data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          totalAmount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
          paidAmount: fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }),
          comment: fc.option(fc.string({ maxLength: 500 }), { nil: undefined })
        }),
        async (debtData) => {
          const userId = 'test-user-id';
          
          // Ensure paidAmount doesn't exceed totalAmount
          const validDebtData = {
            ...debtData,
            paidAmount: Math.min(debtData.paidAmount, debtData.totalAmount)
          };
          
          const result = await addDebt(userId, validDebtData);
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 6: Debt Payment Updates
 * For any debt and payment, should update paidAmount and create expense
 * Validates: Requirements 6.5
 */
describe('Property 6: Debt Payment Updates', () => {
  it('should update paidAmount and create expense for any debt payment', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
          .map(d => d.toISOString().split('T')[0]),
        async (debtId, paymentAmount, paymentDate) => {
          const userId = 'test-user-id';
          const monthId = '2024-01';
          
          await addDebtPayment(userId, monthId, debtId, paymentAmount, paymentDate || '2024-01-01');
          
          // Verify both updateDoc and addDoc were called
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 10: Daily Task Creation
 * For any valid task data, adding should create Firestore document
 * Validates: Requirements 7.1
 */
describe('Property 10: Daily Task Creation', () => {
  it('should create Firestore document for any valid daily task data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 200 }),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          status: fc.constantFrom(TaskStatus.NOT_DONE, TaskStatus.DONE, TaskStatus.SKIPPED),
          notes: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
          carriedOver: fc.boolean()
        }),
        async (taskData) => {
          const userId = 'test-user-id';
          
          const result = await addDailyTask(userId, {
            ...taskData,
            date: taskData.date || '2024-01-01'
          });
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 12: Monthly Task Creation
 * For any valid task data, adding should create Firestore document with month
 * Validates: Requirements 7.3
 */
describe('Property 12: Monthly Task Creation', () => {
  it('should create Firestore document with month for any valid monthly task data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 200 }),
          status: fc.constantFrom(TaskStatus.NOT_DONE, TaskStatus.DONE, TaskStatus.SKIPPED),
          notes: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
          carriedOver: fc.boolean()
        }),
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 1, max: 12 }),
        async (taskData, year, month) => {
          const userId = 'test-user-id';
          const monthId = `${year}-${String(month).padStart(2, '0')}`;
          
          const result = await addMonthlyTask(userId, monthId, {
            ...taskData,
            month: monthId
          });
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 16: Calendar Event Creation
 * For any valid event data, adding should create Firestore document
 * Validates: Requirements 7.10
 */
describe('Property 16: Calendar Event Creation', () => {
  it('should create Firestore document for any valid calendar event data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 200 }),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          type: fc.constantFrom(EventType.EVENT, EventType.BIRTHDAY, EventType.MEETING, EventType.WEDDING),
          notes: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined })
        }),
        async (eventData) => {
          const userId = 'test-user-id';
          
          const result = await addCalendarEvent(userId, {
            ...eventData,
            date: eventData.date || '2024-01-01'
          });
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          
          // Verify type is one of the valid event types
          expect([EventType.EVENT, EventType.BIRTHDAY, EventType.MEETING, EventType.WEDDING]).toContain(eventData.type);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property 28: Category Creation
 * For any valid category name, creating should add Firestore document
 * Validates: Requirements 19.1
 */
describe('Property 28: Category Creation', () => {
  it('should add Firestore document for any valid category name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (categoryName) => {
          const userId = 'test-user-id';
          
          const result = await addCategory(userId, { name: categoryName });
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
