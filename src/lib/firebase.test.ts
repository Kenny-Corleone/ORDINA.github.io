import { describe, it, expect } from 'vitest';
import { app, db, auth, firebaseStatus } from './firebase';

describe('Firebase Configuration', () => {
  it('exposes an explicit unavailable state when configuration is absent', () => {
    expect(firebaseStatus.available).toBe(false);
    expect(app).toBeUndefined();
    expect(db).toBeUndefined();
    expect(auth).toBeUndefined();
  });
});
