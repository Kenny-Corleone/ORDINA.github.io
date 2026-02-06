import { db } from '../../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  type DocumentReference
} from 'firebase/firestore';
import type { Debt } from '../../types';
import { addExpense } from './expenses';
import { handleFirebaseError } from '../../utils/errorHandler';

/**
 * Get debts collection reference for a specific user
 */
export function getDebtsCollection(userId: string) {
  return collection(db, 'users', userId, 'debts');
}

/**
 * Add a new debt
 */
export async function addDebt(
  userId: string,
  debtData: Omit<Debt, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  try {
    const debtsCol = getDebtsCollection(userId);
    const data = {
      ...debtData,
      createdAt: Timestamp.now()
    };
    return await addDoc(debtsCol, data);
  } catch (error) {
    handleFirebaseError(error, {
      module: 'debts',
      action: 'addDebt'
    });
    throw error;
  }
}

/**
 * Update an existing debt
 */
export async function updateDebt(
  userId: string,
  debtId: string,
  debtData: Partial<Omit<Debt, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const debtsCol = getDebtsCollection(userId);
    const debtRef = doc(debtsCol, debtId);
    await updateDoc(debtRef, debtData);
  } catch (error) {
    handleFirebaseError(error, {
      module: 'debts',
      action: 'updateDebt'
    });
    throw error;
  }
}

/**
 * Delete a debt
 */
export async function deleteDebt(
  userId: string,
  debtId: string
): Promise<void> {
  try {
    const debtsCol = getDebtsCollection(userId);
    const debtRef = doc(debtsCol, debtId);
    await deleteDoc(debtRef);
  } catch (error) {
    handleFirebaseError(error, {
      module: 'debts',
      action: 'deleteDebt'
    });
    throw error;
  }
}

/**
 * Add a debt payment - updates debt's paidAmount and creates an expense record
 */
export async function addDebtPayment(
  userId: string,
  monthId: string,
  debtId: string,
  paymentAmount: number,
  paymentDate: string
): Promise<void> {
  try {
    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    const debtsCol = getDebtsCollection(userId);
    const debtRef = doc(debtsCol, debtId);
    
    // Get current debt data
    const debtDoc = await getDoc(debtRef);
    if (!debtDoc.exists()) {
      throw new Error('Debt not found');
    }

    const debt = debtDoc.data() as Debt;
    const newPaidAmount = (debt.paidAmount || 0) + paymentAmount;

    // Update debt's paidAmount and lastPaymentDate
    await updateDoc(debtRef, {
      paidAmount: newPaidAmount,
      lastPaymentDate: Timestamp.now()
    });

    // Create expense record for the payment
    await addExpense(userId, monthId, {
      name: `${debt.name} - Payment`,
      category: 'Debt Payment',
      amount: paymentAmount,
      date: paymentDate,
      debtPaymentId: debtId
    });
  } catch (error) {
    handleFirebaseError(error, {
      module: 'debts',
      action: 'addDebtPayment'
    });
    throw error;
  }
}
