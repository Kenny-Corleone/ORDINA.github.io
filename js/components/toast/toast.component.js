/**
 * Toast Component
 * Компонент для отображения уведомлений
 */

import { ToastTemplate } from './toast.template.js';

export class ToastComponent {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaultDuration = 3000;
    this.maxToasts = 5;
    this.init();
  }

  /**
   * Инициализация компонента
   */
  init() {
    // Создать контейнер если его нет
    if (!document.getElementById('toast-container')) {
      const div = document.createElement('div');
      div.innerHTML = ToastTemplate.container();
      document.body.appendChild(div.firstElementChild);
    }
    
    this.container = document.getElementById('toast-container');
  }

  /**
   * Показать уведомление
   */
  show(message, type = 'info', options = {}) {
    if (!this.container) {
      this.init();
    }

    // Ограничить количество одновременных toast
    if (this.toasts.size >= this.maxToasts) {
      const firstToast = this.toasts.keys().next().value;
      this.hide(firstToast);
    }

    const toastId = this.generateId();
    const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
    const showProgress = options.progress !== false && duration > 0;

    // Создать элемент toast
    const toastDiv = document.createElement('div');
    toastDiv.innerHTML = ToastTemplate.render(message, type, {
      ...options,
      progress: showProgress
    });
    const toastElement = toastDiv.firstElementChild;
    toastElement.dataset.toastId = toastId;

    // Добавить в контейнер
    this.container.appendChild(toastElement);

    // Анимация появления
    requestAnimationFrame(() => {
      toastElement.classList.add('toast-show');
    });

    // Обработчик закрытия
    const closeBtn = toastElement.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide(toastId));
    }

    // Сохранить ссылку
    const toastData = {
      element: toastElement,
      timeout: null,
      progressInterval: null
    };

    this.toasts.set(toastId, toastData);

    // Автоматическое скрытие
    if (duration > 0) {
      // Анимация прогресса
      if (showProgress) {
        const progressBar = toastElement.querySelector('.toast-progress');
        if (progressBar) {
          let progress = 0;
          const step = 100 / (duration / 50);
          
          toastData.progressInterval = setInterval(() => {
            progress += step;
            if (progress >= 100) {
              clearInterval(toastData.progressInterval);
            } else {
              progressBar.style.width = `${progress}%`;
            }
          }, 50);
        }
      }

      // Таймер скрытия
      toastData.timeout = setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }

    // Пауза при наведении
    toastElement.addEventListener('mouseenter', () => {
      if (toastData.timeout) {
        clearTimeout(toastData.timeout);
      }
      if (toastData.progressInterval) {
        clearInterval(toastData.progressInterval);
      }
    });

    toastElement.addEventListener('mouseleave', () => {
      if (duration > 0) {
        toastData.timeout = setTimeout(() => {
          this.hide(toastId);
        }, 1000); // Дать еще 1 секунду после ухода курсора
      }
    });

    return toastId;
  }

  /**
   * Скрыть уведомление
   */
  hide(toastId) {
    const toastData = this.toasts.get(toastId);
    if (!toastData) return;

    const { element, timeout, progressInterval } = toastData;

    // Очистить таймеры
    if (timeout) clearTimeout(timeout);
    if (progressInterval) clearInterval(progressInterval);

    // Анимация скрытия
    element.classList.remove('toast-show');
    element.classList.add('toast-hide');

    // Удалить после анимации
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  /**
   * Скрыть все уведомления
   */
  hideAll() {
    const toastIds = Array.from(this.toasts.keys());
    toastIds.forEach(id => this.hide(id));
  }

  /**
   * Показать success уведомление
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * Показать error уведомление
   */
  error(message, options = {}) {
    return this.show(message, 'error', {
      duration: 5000, // Ошибки показываем дольше
      ...options
    });
  }

  /**
   * Показать warning уведомление
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * Показать info уведомление
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Генерация уникального ID
   */
  generateId() {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    this.hideAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.toasts.clear();
  }
}

// Создать глобальный экземпляр для удобства использования
export const toast = new ToastComponent();
