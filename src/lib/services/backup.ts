import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { CalendarEvent, Category, Debt, DailyTask, Expense, MonthlyTask, RecurringExpense, YearlyTask } from '../types';

const BACKUP_VERSION = 1;
const MAX_BATCH_WRITES = 450;

export interface UserDataBackup {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  source: 'ordina';
  monthId: string;
  data: {
    debts: Debt[];
    expenses: Expense[];
    recurringTemplates: RecurringExpense[];
    recurringStatuses: Record<string, string>;
    categories: Category[];
    dailyTasks: DailyTask[];
    monthlyTasks: MonthlyTask[];
    yearlyTasks: YearlyTask[];
    calendarEvents: CalendarEvent[];
  };
}

export interface BackupInput {
  monthId: string;
  debts: Debt[];
  expenses: Expense[];
  recurringTemplates: RecurringExpense[];
  recurringStatuses: Record<string, string>;
  categories: Category[];
  dailyTasks: DailyTask[];
  monthlyTasks: MonthlyTask[];
  yearlyTasks: YearlyTask[];
  calendarEvents: CalendarEvent[];
}

function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Timestamp) {
    return { __ordinaTimestamp: value.toMillis() };
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { seconds?: unknown }).seconds === 'number' &&
    typeof (value as { nanoseconds?: unknown }).nanoseconds === 'number'
  ) {
    const timestamp = value as { seconds: number; nanoseconds: number };
    return { __ordinaTimestamp: timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000 };
  }
  return value;
}

function revive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.__ordinaTimestamp === 'number' && Object.keys(record).length === 1) {
      return Timestamp.fromMillis(record.__ordinaTimestamp);
    }
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, revive(item)]));
  }
  return value;
}

export function createUserDataBackup(input: BackupInput): UserDataBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    source: 'ordina',
    monthId: input.monthId,
    data: {
      debts: input.debts,
      expenses: input.expenses,
      recurringTemplates: input.recurringTemplates,
      recurringStatuses: input.recurringStatuses,
      categories: input.categories,
      dailyTasks: input.dailyTasks,
      monthlyTasks: input.monthlyTasks,
      yearlyTasks: input.yearlyTasks,
      calendarEvents: input.calendarEvents
    }
  };
}

export function serializeUserDataBackup(backup: UserDataBackup): string {
  return JSON.stringify(backup, replacer, 2);
}

export function parseUserDataBackup(content: string): UserDataBackup {
  let parsed: unknown;
  try {
    parsed = revive(JSON.parse(content));
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup file must contain an object.');
  }

  const backup = parsed as Partial<UserDataBackup>;
  if (backup.source !== 'ordina' || backup.version !== BACKUP_VERSION || !backup.data || !backup.monthId) {
    throw new Error('Backup file is not a supported ORDINA backup.');
  }

  const data = backup.data as Partial<UserDataBackup['data']>;
  const arrays = ['debts', 'expenses', 'recurringTemplates', 'categories', 'dailyTasks', 'monthlyTasks', 'yearlyTasks', 'calendarEvents'] as const;
  if (arrays.some((key) => !Array.isArray(data[key])) || !data.recurringStatuses || typeof data.recurringStatuses !== 'object') {
    throw new Error('Backup file is missing required data collections.');
  }

  return backup as UserDataBackup;
}

/**
 * Restores a backup by merging records into Firestore. Existing documents are
 * preserved unless the backup contains the same document id.
 */
export async function restoreUserDataBackup(userId: string, backup: UserDataBackup): Promise<void> {
  const writes: Array<{ reference: ReturnType<typeof doc>; data: Record<string, unknown> }> = [];
  const add = (path: string[], records: Array<{ id: string }>) => {
    for (const record of records) {
      if (!record.id) continue;
      const { id } = record;
      const data = { ...record } as Record<string, unknown>;
      delete data.id;
      writes.push({ reference: doc(collection(db, 'users', userId, ...path), id), data });
    }
  };

  add(['debts'], backup.data.debts);
  add(['recurringExpenses'], backup.data.recurringTemplates);
  add(['categories'], backup.data.categories);
  add(['dailyTasks'], backup.data.dailyTasks);
  add(['yearlyTasks'], backup.data.yearlyTasks);
  add(['calendarEvents'], backup.data.calendarEvents);
  add(['monthlyData', backup.monthId, 'expenses'], backup.data.expenses);
  add(['monthlyData', backup.monthId, 'tasks'], backup.data.monthlyTasks);
  Object.entries(backup.data.recurringStatuses).forEach(([templateId, status]) => {
    writes.push({
      reference: doc(collection(db, 'users', userId, 'monthlyData', backup.monthId, 'recurringExpenseStatuses'), templateId),
      data: { status }
    });
  });

  for (let offset = 0; offset < writes.length; offset += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    writes.slice(offset, offset + MAX_BATCH_WRITES).forEach(({ reference, data }) => batch.set(reference, data, { merge: true }));
    await batch.commit();
  }
}

export function downloadUserDataBackup(backup: UserDataBackup): void {
  const blob = new Blob([serializeUserDataBackup(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ordina-backup-${backup.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
