/**
 * Authentication Service
 * Сервис для работы с Firebase Authentication
 * Предоставляет методы для регистрации, входа и выхода пользователей
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from '../core/firebase.js';

export class AuthService {
  constructor(auth) {
    if (!auth) {
      throw new Error('Auth instance is required');
    }
    this.auth = auth;
    this.currentUser = null;
    this.authStateListeners = [];
  }

  /**
   * Вход с email и паролем
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object>} Данные пользователя
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email и пароль обязательны');
      }

      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      
      this.currentUser = userCredential.user;
      console.log('User logged in:', this.currentUser.uid);
      
      return {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL
      };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Регистрация нового пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @param {string} [displayName] - Имя пользователя (опционально)
   * @returns {Promise<Object>} Данные пользователя
   */
  async register(email, password, displayName = null) {
    try {
      if (!email || !password) {
        throw new Error('Email и пароль обязательны');
      }

      if (password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      
      this.currentUser = userCredential.user;

      // Обновить профиль с именем, если указано
      if (displayName) {
        await updateProfile(this.currentUser, { displayName });
      }

      console.log('User registered:', this.currentUser.uid);
      
      return {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Вход через Google
   * @returns {Promise<Object>} Данные пользователя
   */
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await signInWithPopup(this.auth, provider);
      
      this.currentUser = result.user;
      console.log('User logged in with Google:', this.currentUser.uid);
      
      return {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Выход из системы
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Получить текущего пользователя
   * @returns {Object|null} Данные пользователя или null
   */
  getCurrentUser() {
    return this.currentUser ? {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: this.currentUser.displayName,
      photoURL: this.currentUser.photoURL
    } : null;
  }

  /**
   * Проверить, авторизован ли пользователь
   * @returns {boolean} True если пользователь авторизован
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Подписаться на изменения состояния аутентификации
   * @param {Function} callback - Функция обратного вызова
   * @returns {Function} Функция для отписки
   */
  onAuthStateChange(callback) {
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      
      const userData = user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      } : null;

      callback(userData);
    });

    this.authStateListeners.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Обновить профиль пользователя
   * @param {Object} updates - Обновляемые поля (displayName, photoURL)
   * @returns {Promise<void>}
   */
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      await updateProfile(this.currentUser, updates);
      console.log('User profile updated');
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Очистить все подписки
   */
  cleanup() {
    this.authStateListeners.forEach(unsubscribe => unsubscribe());
    this.authStateListeners = [];
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Обработка ошибок аутентификации
   * @param {Error} error - Ошибка Firebase Auth
   * @returns {Error} Обработанная ошибка с понятным сообщением
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/invalid-email': 'Неверный формат email',
      'auth/user-disabled': 'Учетная запись отключена',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/email-already-in-use': 'Email уже используется',
      'auth/weak-password': 'Слишком слабый пароль (минимум 6 символов)',
      'auth/operation-not-allowed': 'Операция не разрешена',
      'auth/invalid-credential': 'Неверные учетные данные',
      'auth/account-exists-with-different-credential': 'Аккаунт существует с другими учетными данными',
      'auth/popup-closed-by-user': 'Окно входа было закрыто',
      'auth/popup-blocked': 'Всплывающее окно заблокировано браузером',
      'auth/cancelled-popup-request': 'Запрос на вход отменен',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
      'auth/requires-recent-login': 'Требуется повторный вход'
    };

    const message = errorMessages[error.code] || error.message || 'Ошибка аутентификации';
    const handledError = new Error(message);
    handledError.originalError = error;
    handledError.code = error.code;
    
    return handledError;
  }
}
