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
import type { CalendarEvent } from '../../types';

/**
 * Get calendar events collection reference for a specific user
 */
export function getCalendarEventsCollection(userId: string) {
  return collection(db, 'users', userId, 'calendarEvents');
}

/**
 * Add a new calendar event
 */
export async function addCalendarEvent(
  userId: string,
  eventData: Omit<CalendarEvent, 'id' | 'createdAt'>
): Promise<DocumentReference> {
  const eventsCol = getCalendarEventsCollection(userId);
  const data = {
    ...eventData,
    createdAt: Timestamp.now()
  };
  return await addDoc(eventsCol, data);
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  eventData: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>
): Promise<void> {
  const eventsCol = getCalendarEventsCollection(userId);
  const eventRef = doc(eventsCol, eventId);
  await updateDoc(eventRef, eventData);
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<void> {
  const eventsCol = getCalendarEventsCollection(userId);
  const eventRef = doc(eventsCol, eventId);
  await deleteDoc(eventRef);
}
