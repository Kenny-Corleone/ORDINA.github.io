import { describe, it, expect } from 'vitest';
import { app, db, auth } from './firebase';

describe('Firebase Configuration', () => {
  const configured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID);

  it('should initialize Firebase app', () => {
    if (configured) expect(app).toBeDefined();
    else expect(app).toBeUndefined();
  });

  it('should initialize Firestore', () => {
    if (configured) {
      expect(db).toBeDefined();
      expect(db.type).toBe('firestore');
    } else expect(db).toBeUndefined();
  });

  it('should initialize Firebase Auth', () => {
    if (configured) {
      expect(auth).toBeDefined();
      expect(auth.app).toBe(app);
    } else expect(auth).toBeUndefined();
  });

  it('should use correct Firebase project', () => {
    if (configured) {
      expect(app.options.projectId).toBe(import.meta.env.VITE_FIREBASE_PROJECT_ID);
      expect(app.options.authDomain).toBe(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
    } else expect(app).toBeUndefined();
  });

  it('should configure Firestore with correct settings', () => {
    // Verify Firestore is initialized (basic check)
    if (configured) {
      expect(db).toBeDefined();
      expect(db.app).toBe(app);
    } else expect(db).toBeUndefined();
  });
});
