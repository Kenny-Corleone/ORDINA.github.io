import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { logger } from "./utils/logger";

// Firebase configuration using environment variables from .env
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore with same configuration as original
    db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true
    });
    
    // Initialize Firebase Authentication
    auth = getAuth(app);
    
    // Log successful initialization in development
    logger.debug("Firebase initialized successfully");
} catch (e) {
    logger.error("Firebase initialization error:", e);
    throw e;
}

export { app, db, auth };
