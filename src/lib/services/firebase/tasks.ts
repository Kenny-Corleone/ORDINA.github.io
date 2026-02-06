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
import type { DailyTask, MonthlyTask, YearlyTask } from '../../types';

/**
 * Get daily tasks collection reference for a specific user
 */
export function getDailyTasksCollection(userId: string) {
  return collection(db, 'users', userId, 'dailyTasks');
}

/**
 * Get monthly tasks collection reference for a specific user and month
 */
export function getMonthlyTasksCollection(userId: string, monthId: string) {
  return collection(db, 'users', userId, 'monthlyData', monthId, 'tasks');
}

/**
 * Get yearly tasks collection reference for a specific user
 */
export function getYearlyTasksCollection(userId: string) {
  return collection(db, 'users', userId, 'yearlyTasks');
}

/**
 * Add a new daily task
 */
export async function addDailyTask(
  userId: string,
  taskData: Omit<DailyTask, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  const tasksCol = getDailyTasksCollection(userId);
  const data = {
    ...taskData,
    createdAt: Timestamp.now()
  };
  return await addDoc(tasksCol, data);
}

/**
 * Update an existing daily task
 */
export async function updateDailyTask(
  userId: string,
  taskId: string,
  taskData: Partial<Omit<DailyTask, 'id' | 'createdAt'>>
): Promise<void> {
  const tasksCol = getDailyTasksCollection(userId);
  const taskRef = doc(tasksCol, taskId);
  await updateDoc(taskRef, taskData);
}

/**
 * Delete a daily task
 */
export async function deleteDailyTask(
  userId: string,
  taskId: string
): Promise<void> {
  const tasksCol = getDailyTasksCollection(userId);
  const taskRef = doc(tasksCol, taskId);
  await deleteDoc(taskRef);
}

/**
 * Add a new monthly task
 */
export async function addMonthlyTask(
  userId: string,
  monthId: string,
  taskData: Omit<MonthlyTask, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  const tasksCol = getMonthlyTasksCollection(userId, monthId);
  const data = {
    ...taskData,
    month: monthId,
    createdAt: Timestamp.now()
  };
  return await addDoc(tasksCol, data);
}

/**
 * Update an existing monthly task
 */
export async function updateMonthlyTask(
  userId: string,
  monthId: string,
  taskId: string,
  taskData: Partial<Omit<MonthlyTask, 'id' | 'createdAt'>>
): Promise<void> {
  const tasksCol = getMonthlyTasksCollection(userId, monthId);
  const taskRef = doc(tasksCol, taskId);
  await updateDoc(taskRef, taskData);
}

/**
 * Delete a monthly task
 */
export async function deleteMonthlyTask(
  userId: string,
  monthId: string,
  taskId: string
): Promise<void> {
  const tasksCol = getMonthlyTasksCollection(userId, monthId);
  const taskRef = doc(tasksCol, taskId);
  await deleteDoc(taskRef);
}

/**
 * Add a new yearly task
 */
export async function addYearlyTask(
  userId: string,
  taskData: Omit<YearlyTask, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  const tasksCol = getYearlyTasksCollection(userId);
  const data = {
    ...taskData,
    createdAt: Timestamp.now()
  };
  return await addDoc(tasksCol, data);
}

/**
 * Update an existing yearly task
 */
export async function updateYearlyTask(
  userId: string,
  taskId: string,
  taskData: Partial<Omit<YearlyTask, 'id' | 'createdAt'>>
): Promise<void> {
  const tasksCol = getYearlyTasksCollection(userId);
  const taskRef = doc(tasksCol, taskId);
  await updateDoc(taskRef, taskData);
}

/**
 * Delete a yearly task
 */
export async function deleteYearlyTask(
  userId: string,
  taskId: string
): Promise<void> {
  const tasksCol = getYearlyTasksCollection(userId);
  const taskRef = doc(tasksCol, taskId);
  await deleteDoc(taskRef);
}
