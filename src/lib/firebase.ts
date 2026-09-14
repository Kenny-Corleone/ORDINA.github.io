import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { logger } from "./utils/logger";

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export type FirebaseStatus = { available: true } | { available: false; error: string };

const firebaseConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

let app!: FirebaseApp;
let db!: Firestore;
let auth!: Auth;
let firebaseStatus: FirebaseStatus;

try {
    const missing = Object.entries(firebaseConfig)
        .filter(([key, value]) => key !== 'measurementId' && !value)
        .map(([key]) => key);
    if (missing.length) {
        throw new Error(`Firebase configuration is unavailable (missing: ${missing.join(', ')})`);
    }
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true
    });
    auth = getAuth(app);
    firebaseStatus = { available: true };
    logger.debug("Firebase initialized successfully");
} catch (e) {
    const error = e instanceof Error ? e.message : 'Firebase initialization failed';
    firebaseStatus = { available: false, error };
    logger.error("Firebase initialization error:", error);
}

export { app, db, auth, firebaseStatus };
