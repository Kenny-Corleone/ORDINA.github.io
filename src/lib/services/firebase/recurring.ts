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
import type { RecurringExpense } from '../../types';

/**
 * Get recurring expenses collection reference for a specific user
 */
export function getRecurringExpensesCollection(userId: string) {
  return collection(db, 'users', userId, 'recurringExpenses');
}

/**
 * Get recurring expense statuses collection reference for a specific user and month
 */
export function getRecurringExpenseStatusesCollection(userId: string, monthId: string) {
  return collection(db, 'users', userId, 'monthlyData', monthId, 'recurringExpenseStatuses');
}

/**
 * Add a new recurring expense template
 */
export async function addRecurringExpense(
  userId: string,
  recurringData: Omit<RecurringExpense, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  const recurringCol = getRecurringExpensesCollection(userId);
  const data = {
    ...recurringData,
    createdAt: Timestamp.now()
  };
  return await addDoc(recurringCol, data);
}

/**
 * Update an existing recurring expense template
 */
export async function updateRecurringExpense(
  userId: string,
  recurringId: string,
  recurringData: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>
): Promise<void> {
  const recurringCol = getRecurringExpensesCollection(userId);
  const recurringRef = doc(recurringCol, recurringId);
  await updateDoc(recurringRef, recurringData);
}

/**
 * Delete a recurring expense template
 */
export async function deleteRecurringExpense(
  userId: string,
  recurringId: string
): Promise<void> {
  const recurringCol = getRecurringExpensesCollection(userId);
  const recurringRef = doc(recurringCol, recurringId);
  await deleteDoc(recurringRef);
}

/**
 * Update recurring expense status for a specific month
 */
export async function updateRecurringExpenseStatus(
  userId: string,
  monthId: string,
  templateId: string,
  status: string
): Promise<void> {
  const statusesCol = getRecurringExpenseStatusesCollection(userId, monthId);
  const statusRef = doc(statusesCol, templateId);
  await updateDoc(statusRef, { status });
}
