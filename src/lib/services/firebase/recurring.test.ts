import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  updateRecurringExpenseStatus
} from './recurring';

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
    doc: vi.fn((_col: unknown, id?: string) => ({ _path: 'mocked-doc', id: id || 'mock-id' })),
    setDoc: vi.fn(async () => {}),
    updateDoc: vi.fn(async () => {}),
    addDoc: vi.fn(async (_col: unknown, data: unknown) => ({ 
      id: 'mock-id-' + Math.random(), 
      ...(data as object) 
    })),
    deleteDoc: vi.fn(async () => {}),
    Timestamp: {
      now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 })
    }
  };
});

// Import mocked functions after mock setup
const { setDoc: mockSetDoc, updateDoc: mockUpdateDoc, addDoc: mockAddDoc, deleteDoc: mockDeleteDoc } = await import('firebase/firestore');

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Feature: ordina-svelte-migration
 * Property: Recurring Expense Status Updates
 * For any recurring expense and valid status, updating should change Firestore field
 * Validates: Requirements 6.9
 */
describe('Property: Recurring Expense Status Updates', () => {
  it('should update Firestore status field for any recurring expense and valid status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // templateId
        fc.constantFrom('pending', 'paid', 'skipped'), // valid status values
        async (templateId, status) => {
          const userId = 'test-user-id';
          const monthId = '2024-01';
          
          // Call the function
          await updateRecurringExpenseStatus(userId, monthId, templateId, status);
          
          // Verify that updateDoc was called
          expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({ _path: 'mocked-doc', id: templateId }),
            { status }
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle status updates for multiple templates independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            templateId: fc.string({ minLength: 1, maxLength: 50 }),
            status: fc.constantFrom('pending', 'paid', 'skipped')
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (updates) => {
          const userId = 'test-user-id';
          const monthId = '2024-01';
          
          // Clear mocks before this test iteration
          vi.clearAllMocks();
          
          // Apply all updates
          for (const { templateId, status } of updates) {
            await updateRecurringExpenseStatus(userId, monthId, templateId, status);
          }
          
          // Verify that updateDoc was called for each update
          expect(mockUpdateDoc).toHaveBeenCalledTimes(updates.length);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property: Recurring Expense Template CRUD
 * For any valid recurring expense data, adding should create Firestore document
 * Validates: Requirements 6.8
 */
describe('Property: Recurring Expense Template CRUD', () => {
  it('should create Firestore document for any valid recurring expense template', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          amount: fc.float({ min: Math.fround(0.01), max: 1000000, noNaN: true }),
          dueDay: fc.integer({ min: 1, max: 31 }),
          details: fc.option(fc.string({ maxLength: 500 }))
        }),
        async (templateData) => {
          const userId = 'test-user-id';
          
          const result = await addRecurringExpense(userId, {
            ...templateData,
            details: templateData.details || undefined
          });
          
          // Verify that addDoc was called with correct data structure
          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          expect(mockAddDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              name: templateData.name,
              amount: templateData.amount,
              dueDay: templateData.dueDay
            })
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should update Firestore for any recurring expense template and valid field updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // templateId
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          amount: fc.option(fc.float({ min: Math.fround(0.01), max: 1000000, noNaN: true })),
          dueDay: fc.option(fc.integer({ min: 1, max: 31 })),
          details: fc.option(fc.string({ maxLength: 500 }))
        }),
        async (templateId, updates) => {
          const userId = 'test-user-id';
          
          // Filter out null values
          const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== null)
          );
          
          if (Object.keys(cleanUpdates).length === 0) {
            return true; // Skip if no updates
          }
          
          await updateRecurringExpense(userId, templateId, cleanUpdates);
          
          // Verify that updateDoc was called
          expect(mockUpdateDoc).toHaveBeenCalledWith(
            expect.objectContaining({ _path: 'mocked-doc', id: templateId }),
            cleanUpdates
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should delete Firestore document for any recurring expense template', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // templateId
        async (templateId) => {
          const userId = 'test-user-id';
          
          await deleteRecurringExpense(userId, templateId);
          
          // Verify that deleteDoc was called
          expect(mockDeleteDoc).toHaveBeenCalledWith(
            expect.objectContaining({ _path: 'mocked-doc', id: templateId })
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ordina-svelte-migration
 * Property: Recurring Expense Due Day Validation
 * For any due day value, it should be between 1 and 31
 * Validates: Requirements 6.8
 */
describe('Property: Recurring Expense Due Day Validation', () => {
  it('should accept any due day between 1 and 31', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 31 }),
        async (dueDay) => {
          const userId = 'test-user-id';
          const templateData = {
            name: 'Test Recurring Expense',
            amount: 100,
            dueDay
          };
          
          const result = await addRecurringExpense(userId, templateData);
          
          // Verify that the due day was accepted
          expect(result).toBeDefined();
          expect(mockAddDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ dueDay })
          );
          
          return true;
        }
      ),
      { numRuns: 31 } // Test all possible due days
    );
  });
});
