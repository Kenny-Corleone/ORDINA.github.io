import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDi0cFirxRJ9eC6mvy1WEDpB9MPzDDac3g",
    authDomain: "life-order-assistant.firebaseapp.com",
    projectId: "life-order-assistant",
    storageBucket: "life-order-assistant.appspot.com",
    messagingSenderId: "284691407205",
    appId: "1:284691407205:web:a6e935c498b280ce55c18c",
    measurementId: "G-E1MWRNNKDM"
};

let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase initialization error:", e);
}

export { app, db, auth };
