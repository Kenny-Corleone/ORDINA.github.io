/**
 * Firebase Configuration and Initialization
 * Centralizes Firebase setup and exports instances for use across the app
 */

import { firebaseConfig } from '../config.js';

// Firebase imports from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase instances
let app = null;
let db = null;
let auth = null;
let isInitialized = false;

/**
 * Initialize Firebase with error handling
 * @returns {Object} Object containing app, db, and auth instances
 * @throws {Error} If Firebase initialization fails
 */
export function initializeFirebase() {
  if (isInitialized) {
    console.warn('Firebase already initialized');
    return { app, db, auth };
  }

  try {
    console.log('Initializing Firebase...');

    // Validate configuration
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      throw new Error('Invalid Firebase configuration. Please check config.js');
    }

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('✓ Firebase app initialized');

    // Initialize Firestore
    db = getFirestore(app);
    console.log('✓ Firestore initialized');

    // Initialize Authentication
    auth = getAuth(app);
    console.log('✓ Firebase Auth initialized');

    isInitialized = true;
    console.log('✓ Firebase initialization complete');

    return { app, db, auth };

  } catch (error) {
    console.error('Firebase initialization error:', error);
    handleInitializationError(error);
    throw error;
  }
}

/**
 * Handle Firebase initialization errors
 * @param {Error} error - The error that occurred
 */
function handleInitializationError(error) {
  // Hide loading overlay if it exists
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
  }

  // Show error message to user
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="firebase-error" style="padding: 2rem; text-align: center; color: #ef4444;">
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
          Ошибка конфигурации Firebase
        </h1>
        <p style="margin-bottom: 0.5rem;">
          ${error.message}
        </p>
        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 1rem;">
          Пожалуйста, убедитесь, что вы правильно настроили <b>firebaseConfig</b> в файле config.js
        </p>
        <button 
          onclick="window.location.reload()" 
          style="margin-top: 1.5rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
        >
          Обновить страницу
        </button>
      </div>
    `;
  }
}

/**
 * Get Firebase app instance
 * @returns {Object|null} Firebase app instance
 */
export function getApp() {
  if (!isInitialized) {
    console.warn('Firebase not initialized. Call initializeFirebase() first.');
    return null;
  }
  return app;
}

/**
 * Get Firestore instance
 * @returns {Object|null} Firestore instance
 */
export function getDb() {
  if (!isInitialized) {
    console.warn('Firebase not initialized. Call initializeFirebase() first.');
    return null;
  }
  return db;
}

/**
 * Get Auth instance
 * @returns {Object|null} Auth instance
 */
export function getAuthInstance() {
  if (!isInitialized) {
    console.warn('Firebase not initialized. Call initializeFirebase() first.');
    return null;
  }
  return auth;
}

/**
 * Check if Firebase is initialized
 * @returns {boolean} True if initialized
 */
export function isFirebaseInitialized() {
  return isInitialized;
}

/**
 * Export Firebase instances (will be set after initialization)
 */
export { app, db, auth };

/**
 * Re-export Firebase SDK functions for convenience
 */
export {
  // Auth functions
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

export {
  // Firestore functions
  getFirestore,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
