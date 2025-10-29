/**
 * Header Component
 * Компонент верхней панели приложения
 */

import { HeaderTemplate } from './header.template.js';

export class HeaderComponent {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.isSticky = false;
    this.lastScrollTop = 0;
    this.mobileMenuOpen = false;
    this.openDropdown = null;
  }

  /**
   * Монтирование компонента
   */
  mount(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    this.render();
    this.setupEventListeners();
    this.setupStickyBehavior();
  }

  /**
   * Рендеринг компонента
   */
  render() {
    if (!this.container) return;

    const state = {
      user: this.app.state.user,
      theme: this.app.state.theme,
      language: this.app.state.language,
      currency: this.app.state.currency
    };

    this.container.innerHTML = HeaderTemplate.render(state);
  }

  /**
   * Установка обработчиков событий
   */
  setupEventListeners() {
    if (!this.container) return;

    // Делегирование событий для всех кнопок с data-action
    this.container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (target) {
        const action = target.dataset.action;
        this.handleAction(action, e);
      }

      // Обработка dropdown toggles
      const dropdownToggle = e.target.closest('[data-dropdown]');
      if (dropdownToggle) {
        const dropdownName = dropdownToggle.dataset.dropdown;
        this.toggleDropdown(dropdownName);
      }

      // Обработка выбора языка
      const langItem = e.target.closest('[data-lang]');
      if (langItem) {
        const lang = langItem.dataset.lang;
        this.handleLanguageChange(lang);
      }

      // Обработка выбора валюты
      const currencyItem = e.target.closest('[data-currency]');
      if (currencyItem) {
        const currency = currencyItem.dataset.currency;
        this.handleCurrencyChange(currency);
      }
    });

    // Обработка мобильных селектов
    const languageSelect = this.container.querySelector('[data-select="language"]');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.handleLanguageChange(e.target.value);
      });
    }

    const currencySelect = this.container.querySelector('[data-select="currency"]');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.handleCurrencyChange(e.target.value);
      });
    }

    // Закрытие dropdown при клике вне его
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-dropdown')) {
        this.closeAllDropdowns();
      }
    });

    // Закрытие мобильного меню при изменении размера окна
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Обработка действий
   */
  handleAction(action, event) {
    switch (action) {
      case 'toggle-theme':
        this.toggleTheme();
        break;
      case 'toggle-mobile-menu':
        this.toggleMobileMenu();
        break;
      case 'close-mobile-menu':
        this.closeMobileMenu();
        break;
      case 'login':
        this.handleLogin();
        break;
      case 'logout':
        this.handleLogout();
        break;
      case 'profile':
        this.handleProfile();
        break;
      case 'settings':
        this.handleSettings();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  /**
   * Переключение темы
   */
  toggleTheme() {
    const newTheme = this.app.state.theme === 'light' ? 'dark' : 'light';
    this.app.state.theme = newTheme;
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    this.render();
  }

  /**
   * Изменение языка
   */
  handleLanguageChange(language) {
    this.app.state.language = language;
    localStorage.setItem('language', language);
    
    // Обновить переводы во всем приложении
    if (this.app.updateTranslations) {
      this.app.updateTranslations(language);
    }
    
    this.render();
    this.closeAllDropdowns();
  }

  /**
   * Изменение валюты
   */
  handleCurrencyChange(currency) {
    this.app.state.currency = currency;
    localStorage.setItem('currency', currency);
    
    // Обновить отображение валюты во всем приложении
    if (this.app.updateCurrency) {
      this.app.updateCurrency(currency);
    }
    
    this.render();
    this.closeAllDropdowns();
  }

  /**
   * Переключение dropdown меню
   */
  toggleDropdown(dropdownName) {
    const menu = this.container.querySelector(`[data-menu="${dropdownName}"]`);
    if (!menu) return;

    // Закрыть другие dropdown
    if (this.openDropdown && this.openDropdown !== dropdownName) {
      this.closeAllDropdowns();
    }

    const isOpen = menu.classList.contains('show');
    
    if (isOpen) {
      menu.classList.remove('show');
      this.openDropdown = null;
    } else {
      menu.classList.add('show');
      this.openDropdown = dropdownName;
    }
  }

  /**
   * Закрытие всех dropdown
   */
  closeAllDropdowns() {
    const dropdowns = this.container.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
    this.openDropdown = null;
  }

  /**
   * Переключение мобильного меню
   */
  toggleMobileMenu() {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Открытие мобильного меню
   */
  openMobileMenu() {
    const mobileMenu = this.container.querySelector('#mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.mobileMenuOpen = true;
    }
  }

  /**
   * Закрытие мобильного меню
   */
  closeMobileMenu() {
    const mobileMenu = this.container.querySelector('#mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      this.mobileMenuOpen = false;
    }
  }

  /**
   * Настройка sticky поведения
   */
  setupStickyBehavior() {
    const header = this.container.querySelector('.app-header');
    if (!header) return;

    let ticking = false;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Добавить класс sticky при прокрутке вниз
          if (scrollTop > 50) {
            if (!this.isSticky) {
              header.classList.add('sticky');
              this.isSticky = true;
            }
          } else {
            if (this.isSticky) {
              header.classList.remove('sticky');
              this.isSticky = false;
            }
          }

          // Скрыть/показать header при прокрутке (опционально)
          if (scrollTop > this.lastScrollTop && scrollTop > 200) {
            // Прокрутка вниз - скрыть
            header.classList.add('header-hidden');
          } else {
            // Прокрутка вверх - показать
            header.classList.remove('header-hidden');
          }

          this.lastScrollTop = scrollTop;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * Обработка входа
   */
  handleLogin() {
    this.closeMobileMenu();
    // Вызвать модуль аутентификации
    if (this.app.showAuthModal) {
      this.app.showAuthModal();
    }
  }

  /**
   * Обработка выхода
   */
  async handleLogout() {
    this.closeMobileMenu();
    this.closeAllDropdowns();
    
    try {
      const authService = this.app.getService('auth');
      if (authService) {
        await authService.logout();
        this.app.state.user = null;
        this.render();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Обработка профиля
   */
  handleProfile() {
    this.closeAllDropdowns();
    this.closeMobileMenu();
    // Навигация к профилю
    console.log('Navigate to profile');
  }

  /**
   * Обработка настроек
   */
  handleSettings() {
    this.closeAllDropdowns();
    this.closeMobileMenu();
    // Навигация к настройкам
    console.log('Navigate to settings');
  }

  /**
   * Обновление состояния пользователя
   */
  updateUser(user) {
    this.app.state.user = user;
    this.render();
  }

  /**
   * Размонтирование компонента
   */
  unmount() {
    this.closeMobileMenu();
    this.closeAllDropdowns();
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}
