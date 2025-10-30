/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 ORDINA APP - MAIN INITIALIZATION FILE
 * ═══════════════════════════════════════════════════════════════════════════
 * Главный файл инициализации приложения ORDINA
 * Импортирует и регистрирует все сервисы и модули
 */

// ==================== CORE IMPORTS ====================
import { OrdinaApp } from './core/app.js';
import { Router } from './core/router.js';
import { initializeFirebase, getDb, getAuthInstance } from './core/firebase.js';
import { initPerformanceMonitoring, memoryManager } from './utils/performance.js';
import { runCompatibilityChecks } from './utils/github-pages-checker.js';

// ==================== CONFIG IMPORTS ====================
import { NEWSAPI_KEY } from './config.js';

// ==================== SERVICE IMPORTS ====================
import { AuthService } from './services/auth.service.js';
import { FirestoreService } from './services/firestore.service.js';
import { WeatherService } from './services/weather.service.js';
import { NewsService } from './services/news.service.js';

// ==================== MODULE IMPORTS ====================
// Modules will be lazy-loaded on demand for better performance

// ==================== GLOBAL ERROR HANDLER ====================

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Глобальный обработчик ошибок
 * Перехватывает необработанные ошибки и отклонения промисов
 */
class ErrorHandler {
  /**
   * Обработка ошибки
   * @param {Error} error - Объект ошибки
   * @param {string} context - Контекст возникновения ошибки
   */
  static handle(error, context = 'Unknown') {
    console.error(`[${context}] Error:`, error);
    
    // Логирование в консоль с деталями
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    // Показ уведомления пользователю (если доступен Toast)
    const message = this.getUserMessage(error, context);
    this.showErrorToUser(message);
    
    // Опционально: отправка в систему мониторинга
    // this.logToMonitoring(error, context);
  }

  /**
   * Получить понятное сообщение для пользователя
   * @param {Error} error - Объект ошибки
   * @param {string} context - Контекст ошибки
   * @returns {string} Сообщение для пользователя
   */
  static getUserMessage(error, context) {
    // Специфичные сообщения для разных типов ошибок
    const errorMessages = {
      'auth/invalid-email': 'Неверный формат email',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'permission-denied': 'Недостаточно прав для выполнения операции',
      'network-error': 'Проблемы с сетью. Проверьте подключение к интернету',
      'not-found': 'Запрашиваемые данные не найдены'
    };

    // Проверка на известные коды ошибок
    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    // Общее сообщение с контекстом
    return `Произошла ошибка в ${context}. Пожалуйста, попробуйте еще раз.`;
  }

  /**
   * Показать ошибку пользователю
   * @param {string} message - Сообщение об ошибке
   */
  static showErrorToUser(message) {
    // Попытка использовать Toast компонент если доступен
    if (window.ordinaApp && window.ordinaApp.getService) {
      const toastService = window.ordinaApp.getService('toast');
      if (toastService && toastService.show) {
        toastService.show(message, 'error');
        return;
      }
    }

    // Fallback: простое alert
    console.warn('Toast service not available, using alert');
    // alert(message); // Закомментировано чтобы не раздражать в dev режиме
  }

  /**
   * Graceful degradation - попытка восстановления после ошибки
   * @param {Error} error - Объект ошибки
   * @param {Function} fallback - Функция fallback
   */
  static async gracefulDegrade(error, fallback) {
    console.warn('Attempting graceful degradation:', error.message);
    
    if (typeof fallback === 'function') {
      try {
        return await fallback();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return null;
      }
    }
    
    return null;
  }
}

// Установка глобальных обработчиков ошибок
window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error, 'Global Error');
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection');
});

// ==================== APPLICATION INITIALIZATION ====================

/**
 * Инициализация приложения
 * Выполняется при загрузке DOM
 */
async function initializeApp() {
  console.log('🚀 Starting ORDINA App initialization...');
  
  let app = null;
  
  try {
    // ========== STEP 1: Initialize Firebase ==========
    console.log('📦 Step 1: Initializing Firebase...');
    const { db, auth } = initializeFirebase();
    console.log('✓ Firebase initialized successfully');

    // ========== STEP 2: Create App Instance ==========
    console.log('📦 Step 2: Creating app instance...');
    app = new OrdinaApp();
    console.log('✓ App instance created');

    // ========== STEP 3: Register Services ==========
    console.log('📦 Step 3: Registering services...');
    
    // Auth Service
    const authService = new AuthService(auth);
    app.registerService('auth', authService);
    console.log('  ✓ AuthService registered');
    
    // Firestore Service
    const firestoreService = new FirestoreService(db);
    app.registerService('firestore', firestoreService);
    console.log('  ✓ FirestoreService registered');
    
    // Weather Service
    const weatherService = new WeatherService();
    app.registerService('weather', weatherService);
    console.log('  ✓ WeatherService registered');
    
    // News Service
    const newsService = new NewsService(NEWSAPI_KEY);
    app.registerService('news', newsService);
    console.log('  ✓ NewsService registered');
    
    console.log('✓ All services registered');

    // ========== STEP 4: Register Module Loaders (Lazy Loading) ==========
    console.log('📦 Step 4: Setting up lazy module loading...');
    
    // Register lazy module loaders instead of loading all modules upfront
    app.registerLazyModule('dashboard', () => import('./modules/dashboard/dashboard.module.js'));
    app.registerLazyModule('expenses', () => import('./modules/expenses/expenses.module.js'));
    app.registerLazyModule('debts', () => import('./modules/debts/debts.module.js'));
    app.registerLazyModule('tasks', () => import('./modules/tasks/tasks.module.js'));
    app.registerLazyModule('calendar', () => import('./modules/calendar/calendar.module.js'));
    app.registerLazyModule('news', () => import('./modules/news/news.module.js'));
    
    console.log('✓ All module loaders registered (lazy loading enabled)');

    // ========== STEP 5: Initialize Router ==========
    console.log('📦 Step 5: Initializing router...');
    const router = new Router(app);
    
    // Register routes
    router.register('dashboard', 'dashboard', { title: 'Dashboard' });
    router.register('expenses', 'expenses', { title: 'Expenses' });
    router.register('debts', 'debts', { title: 'Debts' });
    router.register('tasks', 'tasks', { title: 'Tasks' });
    router.register('calendar', 'calendar', { title: 'Calendar' });
    router.register('news', 'news', { title: 'News' });
    
    app.registerService('router', router);
    console.log('✓ Router initialized and registered');

    // ========== STEP 6: Setup Authentication ==========
    console.log('📦 Step 6: Setting up authentication...');
    setupAuthentication(app, authService, router);
    console.log('✓ Authentication setup complete');

    // ========== STEP 7: Initialize App ==========
    console.log('📦 Step 7: Initializing app core...');
    await app.init();
    console.log('✓ App core initialized');

    // ========== STEP 8: Initialize Router ==========
    console.log('📦 Step 8: Starting router...');
    router.init();
    console.log('✓ Router started');

    // ========== STEP 9: Hide Loading Overlay ==========
    hideLoadingOverlay();

    // ========== STEP 10: Save Global Reference ==========
    window.ordinaApp = app;
    window.ordinaRouter = router;
    console.log('✓ Global references saved');

    console.log('🎉 ORDINA App initialized successfully!');
    
    // ========== STEP 11: Initialize Performance Monitoring ==========
    console.log('📦 Step 11: Initializing performance monitoring...');
    initPerformanceMonitoring();
    console.log('✓ Performance monitoring initialized');

    // ========== STEP 12: Run GitHub Pages Compatibility Checks ==========
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('📦 Step 12: Running GitHub Pages compatibility checks...');
      runCompatibilityChecks();
      console.log('✓ Compatibility checks complete');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize ORDINA App:', error);
    ErrorHandler.handle(error, 'App Initialization');
    
    // Показать ошибку пользователю
    showInitializationError(error);
    
    // Попытка graceful degradation
    if (app) {
      try {
        app.handleInitError(error);
      } catch (e) {
        console.error('Failed to handle init error:', e);
      }
    }
  }
}

/**
 * Настройка аутентификации
 * @param {OrdinaApp} app - Экземпляр приложения
 * @param {AuthService} authService - Сервис аутентификации
 * @param {Router} router - Роутер приложения
 */
function setupAuthentication(app, authService, router) {
  // Подписка на изменения состояния аутентификации
  const unsubscribe = authService.onAuthStateChange((user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    
    if (user) {
      // Пользователь вошел
      app.setState({
        user: user,
        userId: user.uid
      });
      
      // Скрыть экран авторизации если он показан
      const authScreen = document.getElementById('auth-container');
      if (authScreen) {
        authScreen.classList.add('hidden');
      }
      
      // Показать основной контент
      const mainContent = document.querySelector('.app-container');
      if (mainContent) {
        mainContent.style.display = 'block';
      }
      
      // Перейти на дашборд если на странице авторизации
      if (router.getCurrentRoute() === 'auth' || !router.getCurrentRoute()) {
        router.navigate('dashboard', { replace: true });
      }
      
    } else {
      // Пользователь вышел
      app.setState({
        user: null,
        userId: null
      });
      
      // Показать экран авторизации
      const authScreen = document.getElementById('auth-container');
      if (authScreen) {
        authScreen.classList.remove('hidden');
      }
      
      // Скрыть основной контент
      const mainContent = document.querySelector('.app-container');
      if (mainContent) {
        mainContent.style.display = 'none';
      }
      
      // Перейти на страницу авторизации
      // router.navigate('auth', { replace: true });
    }
  });
  
  // Сохранить функцию отписки для cleanup
  app.unsubscribes.push(unsubscribe);
}

/**
 * Показать ошибку инициализации
 * @param {Error} error - Объект ошибки
 */
function showInitializationError(error) {
  hideLoadingOverlay();
  
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="init-error-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        text-align: center;
        background: var(--bg-primary, #f9fafb);
      ">
        <div style="
          max-width: 500px;
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <div style="
            width: 64px;
            height: 64px;
            margin: 0 auto 1.5rem;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
          ">
            ⚠️
          </div>
          
          <h1 style="
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #ef4444;
          ">
            Ошибка инициализации приложения
          </h1>
          
          <p style="
            margin-bottom: 0.5rem;
            color: #374151;
            font-size: 1rem;
          ">
            ${error.message || 'Произошла неизвестная ошибка'}
          </p>
          
          <p style="
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 1.5rem;
          ">
            Пожалуйста, обновите страницу или обратитесь к администратору
          </p>
          
          <button 
            onclick="window.location.reload()" 
            style="
              padding: 0.75rem 1.5rem;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 0.375rem;
              cursor: pointer;
              font-size: 1rem;
              font-weight: 500;
              transition: background 0.2s;
            "
            onmouseover="this.style.background='#2563eb'"
            onmouseout="this.style.background='#3b82f6'"
          >
            🔄 Обновить страницу
          </button>
          
          <details style="
            margin-top: 1.5rem;
            text-align: left;
            font-size: 0.75rem;
            color: #6b7280;
          ">
            <summary style="cursor: pointer; margin-bottom: 0.5rem;">
              Технические детали
            </summary>
            <pre style="
              background: #f3f4f6;
              padding: 0.5rem;
              border-radius: 0.25rem;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            ">${error.stack || error.message}</pre>
          </details>
        </div>
      </div>
    `;
  }
}

// ==================== START APPLICATION ====================

// Инициализация приложения при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM уже загружен
  initializeApp();
}

// Экспорт для использования в других модулях
export { ErrorHandler };
