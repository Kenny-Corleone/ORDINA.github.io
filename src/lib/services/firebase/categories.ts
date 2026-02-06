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
import type { Category } from '../../types';

/**
 * Get categories collection reference for a specific user
 */
export function getCategoriesCollection(userId: string) {
  return collection(db, 'users', userId, 'categories');
}

/**
 * Add a new category
 */
export async function addCategory(
  userId: string,
  categoryData: Omit<Category, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  const categoriesCol = getCategoriesCollection(userId);
  const data = {
    ...categoryData,
    createdAt: Timestamp.now()
  };
  return await addDoc(categoriesCol, data);
}

/**
 * Update an existing category
 */
export async function updateCategory(
  userId: string,
  categoryId: string,
  categoryData: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<void> {
  const categoriesCol = getCategoriesCollection(userId);
  const categoryRef = doc(categoriesCol, categoryId);
  await updateDoc(categoryRef, categoryData);
}

/**
 * Delete a category
 */
export async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<void> {
  const categoriesCol = getCategoriesCollection(userId);
  const categoryRef = doc(categoriesCol, categoryId);
  await deleteDoc(categoryRef);
}
