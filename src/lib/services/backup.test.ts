import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import {
  createUserDataBackup,
  parseUserDataBackup,
  serializeUserDataBackup
} from './backup';

describe('user data backups', () => {
  it('round-trips the loaded data and Firestore timestamps', () => {
    const createdAt = Timestamp.fromMillis(1700000000000);
    const backup = createUserDataBackup({
      monthId: '2026-09',
      debts: [{ id: 'debt-1', name: 'Rent', totalAmount: 100, paidAmount: 25, createdAt }],
      expenses: [],
      recurringTemplates: [],
      recurringStatuses: {},
      categories: [],
      dailyTasks: [],
      monthlyTasks: [],
      yearlyTasks: [],
      calendarEvents: []
    });

    const parsed = parseUserDataBackup(serializeUserDataBackup(backup));

    expect(parsed.monthId).toBe('2026-09');
    const restoredDebt = parsed.data.debts[0];
    expect(restoredDebt).toBeDefined();
    expect(restoredDebt?.createdAt).toBeInstanceOf(Timestamp);
    expect(restoredDebt?.createdAt.toMillis()).toBe(1700000000000);
  });

  it('rejects unsupported backup files', () => {
    expect(() => parseUserDataBackup('{"source":"other","version":1}')).toThrow(
      'Backup file is not a supported ORDINA backup.'
    );
  });
});
