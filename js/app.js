// Main Application Entry Point
import { firebaseConfig } from './config.js';
import { translations } from './translations.js';
import { 
    getTodayISOString, 
    formatISODateForDisplay, 
    formatMonthId,
    formatCurrency,
    showToast,
    showConfirmModal,
    setCurrentCurrency,
    setCurrentLang
} from './utils.js';

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
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
    Timestamp, 
    writeBatch, 
    limit
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Initialize Firebase
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase initialization error:", e);
    document.getElementById('loading-overlay').classList.add('hidden');
    document.getElementById('app').innerHTML = `<div class="p-4 text-center text-red-500">
        <h1 class="text-2xl font-bold">Ошибка конфигурации Firebase</h1>
        <p>Пожалуйста, убедитесь, что вы правильно вставили ваш <b>firebaseConfig</b> в HTML-файл.</p>
    </div>`;
}

// Global state
window.ordinaApp = {
    userId: null,
    currentMonthId: null,
    selectedMonthId: null,
    currentCurrency: localStorage.getItem('currency') || 'AZN',
    currentLang: localStorage.getItem('appLanguage') || 'ru',
    allDebts: [],
    allExpenses: [],
    allRecurringTemplates: [],
    currentMonthStatuses: {},
    dailyTasks: [],
    monthlyTasks: [],
    yearlyTasks: [],
    calendarEvents: [],
    calendarDate: new Date(),
    unsubscribes: [],
    expensesChart: null,
    db,
    auth,
    translations,
    utils: {
        getTodayISOString,
        formatISODateForDisplay,
        formatMonthId,
        formatCurrency,
        showToast,
        showConfirmModal,
        setCurrentCurrency,
        setCurrentLang
    }
};

// Export for other modules
export { app, db, auth };
export default window.ordinaApp;
