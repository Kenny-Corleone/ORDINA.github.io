/**
 * Header Component Templates
 * Шаблоны для верхней панели приложения
 */

export const HeaderTemplate = {
  /**
   * Основной шаблон верхней панели
   */
  render(state) {
    const { user, theme, language, currency } = state;
    
    return `
      <header class="app-header" id="app-header">
        <div class="header-container">
          <!-- Левая часть: Логотип и название -->
          <div class="header-left">
            <div class="header-logo">
              <img src="./assets/images/logo.png" alt="ORDINA" class="logo-image">
              <span class="logo-text">ORDINA</span>
            </div>
          </div>

          <!-- Центральная часть: Виджет погоды -->
          <div class="header-center">
            <div id="header-weather-widget"></div>
          </div>

          <!-- Правая часть: Настройки и профиль -->
          <div class="header-right">
            <!-- Переключатель темы -->
            <button class="header-btn theme-toggle" title="Переключить тему" data-action="toggle-theme">
              <i class="fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
            </button>

            <!-- Выбор языка -->
            <div class="header-dropdown language-selector">
              <button class="header-btn dropdown-toggle" data-dropdown="language">
                <i class="fas fa-language"></i>
                <span class="dropdown-label">${language.toUpperCase()}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
              </button>
              <div class="dropdown-menu" data-menu="language">
                <button class="dropdown-item ${language === 'ru' ? 'active' : ''}" data-lang="ru">
                  <span class="flag-icon">🇷🇺</span> Русский
                </button>
                <button class="dropdown-item ${language === 'en' ? 'active' : ''}" data-lang="en">
                  <span class="flag-icon">🇬🇧</span> English
                </button>
                <button class="dropdown-item ${language === 'az' ? 'active' : ''}" data-lang="az">
                  <span class="flag-icon">🇦🇿</span> Azərbaycan
                </button>
              </div>
            </div>

            <!-- Выбор валюты -->
            <div class="header-dropdown currency-selector">
              <button class="header-btn dropdown-toggle" data-dropdown="currency">
                <i class="fas fa-dollar-sign"></i>
                <span class="dropdown-label">${currency}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
              </button>
              <div class="dropdown-menu" data-menu="currency">
                <button class="dropdown-item ${currency === 'AZN' ? 'active' : ''}" data-currency="AZN">
                  ₼ AZN
                </button>
                <button class="dropdown-item ${currency === 'USD' ? 'active' : ''}" data-currency="USD">
                  $ USD
                </button>
              </div>
            </div>

            <!-- Профиль пользователя -->
            ${user ? this.renderUserMenu(user) : this.renderAuthButton()}

            <!-- Мобильное меню -->
            <button class="header-btn mobile-menu-toggle" data-action="toggle-mobile-menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- Мобильное меню -->
        <div class="mobile-menu" id="mobile-menu">
          <div class="mobile-menu-content">
            ${this.renderMobileMenu(state)}
          </div>
        </div>
      </header>
    `;
  },

  /**
   * Меню пользователя
   */
  renderUserMenu(user) {
    return `
      <div class="header-dropdown user-menu">
        <button class="header-btn dropdown-toggle user-avatar" data-dropdown="user">
          ${user.photoURL 
            ? `<img src="${user.photoURL}" alt="${user.displayName || user.email}" class="avatar-image">` 
            : `<i class="fas fa-user-circle"></i>`
          }
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right" data-menu="user">
          <div class="dropdown-header">
            <div class="user-info">
              <div class="user-name">${user.displayName || 'Пользователь'}</div>
              <div class="user-email">${user.email}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" data-action="profile">
            <i class="fas fa-user"></i> Профиль
          </button>
          <button class="dropdown-item" data-action="settings">
            <i class="fas fa-cog"></i> Настройки
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" data-action="logout">
            <i class="fas fa-sign-out-alt"></i> Выйти
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Кнопка входа
   */
  renderAuthButton() {
    return `
      <button class="header-btn btn-primary" data-action="login">
        <i class="fas fa-sign-in-alt"></i>
        <span class="btn-text">Войти</span>
      </button>
    `;
  },

  /**
   * Мобильное меню
   */
  renderMobileMenu(state) {
    const { user, theme, language, currency } = state;
    
    return `
      <div class="mobile-menu-header">
        <h3>Меню</h3>
        <button class="mobile-menu-close" data-action="close-mobile-menu">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="mobile-menu-section">
        <h4>Настройки</h4>
        
        <div class="mobile-menu-item">
          <span class="mobile-menu-label">
            <i class="fas fa-moon"></i> Тема
          </span>
          <button class="mobile-toggle-btn" data-action="toggle-theme">
            ${theme === 'dark' ? 'Темная' : 'Светлая'}
          </button>
        </div>

        <div class="mobile-menu-item">
          <span class="mobile-menu-label">
            <i class="fas fa-language"></i> Язык
          </span>
          <select class="mobile-select" data-select="language">
            <option value="ru" ${language === 'ru' ? 'selected' : ''}>Русский</option>
            <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
            <option value="az" ${language === 'az' ? 'selected' : ''}>Azərbaycan</option>
          </select>
        </div>

        <div class="mobile-menu-item">
          <span class="mobile-menu-label">
            <i class="fas fa-dollar-sign"></i> Валюта
          </span>
          <select class="mobile-select" data-select="currency">
            <option value="AZN" ${currency === 'AZN' ? 'selected' : ''}>AZN (₼)</option>
            <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD ($)</option>
          </select>
        </div>
      </div>

      ${user ? `
        <div class="mobile-menu-section">
          <h4>Профиль</h4>
          <div class="mobile-user-info">
            ${user.photoURL 
              ? `<img src="${user.photoURL}" alt="${user.displayName || user.email}" class="mobile-avatar">` 
              : `<i class="fas fa-user-circle mobile-avatar-icon"></i>`
            }
            <div class="mobile-user-details">
              <div class="mobile-user-name">${user.displayName || 'Пользователь'}</div>
              <div class="mobile-user-email">${user.email}</div>
            </div>
          </div>
          <button class="mobile-menu-btn" data-action="logout">
            <i class="fas fa-sign-out-alt"></i> Выйти
          </button>
        </div>
      ` : `
        <div class="mobile-menu-section">
          <button class="mobile-menu-btn btn-primary" data-action="login">
            <i class="fas fa-sign-in-alt"></i> Войти
          </button>
        </div>
      `}
    `;
  }
};
