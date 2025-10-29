// ═══════════════════════════════════════════════════════════════════════════
// 🔐 МОДУЛЬ АУТЕНТИФИКАЦИИ
// ═══════════════════════════════════════════════════════════════════════════

import { auth } from '../app.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { showToast } from '../utils.js';

export function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Успешный вход!', 'success');
    } catch (error) {
        handleAuthError(error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Регистрация успешна!', 'success');
    } catch (error) {
        handleAuthError(error);
    }
}

async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        showToast('Вход через Google успешен!', 'success');
    } catch (error) {
        handleAuthError(error);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        showToast('Вы вышли из системы', 'success');
    } catch (error) {
        showToast('Ошибка выхода', 'error');
    }
}

function handleAuthError(error) {
    let message = 'Произошла ошибка';
    
    switch (error.code) {
        case 'auth/invalid-email':
            message = 'Неверный формат email';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            message = 'Неверный email или пароль';
            break;
        case 'auth/email-already-in-use':
            message = 'Email уже используется';
            break;
        case 'auth/weak-password':
            message = 'Слишком слабый пароль';
            break;
    }
    
    showToast(message, 'error');
}
