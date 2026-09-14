import { describe, it, expect } from 'vitest';
import { app, db, auth } from './firebase';

describe('Firebase Configuration', () => {
  it('should initialize Firebase app', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  it('should initialize Firestore', () => {
    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  it('should initialize Firebase Auth', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBe(app);
  });

  it('should use correct Firebase project', () => {
    expect(app.options.projectId).toBe('life-order-assistant');
    expect(app.options.authDomain).toBe('life-order-assistant.firebaseapp.com');
  });

  it('should configure Firestore with correct settings', () => {
    // Verify Firestore is initialized (basic check)
    expect(db).toBeDefined();
    expect(db.app).toBe(app);
  });
});
