import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { logger } from "./utils/logger";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: "AIzaSyDi0cFirxRJ9eC6mvy1WEDpB9MPzDDac3g",
    authDomain: "life-order-assistant.firebaseapp.com",
    projectId: "life-order-assistant",
    storageBucket: "life-order-assistant.appspot.com",
    messagingSenderId: "284691407205",
    appId: "1:284691407205:web:a6e935c498b280ce55c18c",
    measurementId: "G-E1MWRNNKDM"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore with same configuration as original
    db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        useFetchStreams: false
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
