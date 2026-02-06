import { db } from '../../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  type DocumentReference
} from 'firebase/firestore';
import type { Expense } from '../../types';
import { handleFirebaseError } from '../../utils/errorHandler';

/**
 * Get expenses collection reference for a specific user and month
 */
export function getExpensesCollection(userId: string, monthId: string) {
  return collection(db, 'users', userId, 'monthlyData', monthId, 'expenses');
}

/**
 * Add a new expense
 */
export async function addExpense(
  userId: string,
  monthId: string,
  expenseData: Omit<Expense, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  try {
    const expensesCol = getExpensesCollection(userId, monthId);
    const data = {
      ...expenseData,
      createdAt: Timestamp.now()
    };
    return await addDoc(expensesCol, data);
  } catch (error) {
    handleFirebaseError(error, {
      module: 'expenses',
      action: 'addExpense'
    });
    throw error;
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  userId: string,
  monthId: string,
  expenseId: string,
  expenseData: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const expensesCol = getExpensesCollection(userId, monthId);
    const expenseRef = doc(expensesCol, expenseId);
    await updateDoc(expenseRef, expenseData);
  } catch (error) {
    handleFirebaseError(error, {
      module: 'expenses',
      action: 'updateExpense'
    });
    throw error;
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  userId: string,
  monthId: string,
  expenseId: string
): Promise<void> {
  try {
    const expensesCol = getExpensesCollection(userId, monthId);
    const expenseRef = doc(expensesCol, expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    handleFirebaseError(error, {
      module: 'expenses',
      action: 'deleteExpense'
    });
    throw error;
  }
}
