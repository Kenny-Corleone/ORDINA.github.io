/**
 * Modal Component
 * Базовый класс для модальных окон
 */

import { ModalTemplate } from './modal.template.js';

export class ModalComponent {
  constructor(options = {}) {
    this.options = {
      title: '',
      content: '',
      footer: '',
      size: 'medium',
      showClose: true,
      closeOnBackdrop: true,
      closeOnEsc: true,
      onOpen: null,
      onClose: null,
      ...options
    };

    this.element = null;
    this.isOpen = false;
    this.focusedElementBeforeModal = null;
  }

  /**
   * Открыть модальное окно
   */
  open() {
    if (this.isOpen) return;

    // Сохранить текущий фокус
    this.focusedElementBeforeModal = document.activeElement;

    // Создать элемент
    const div = document.createElement('div');
    div.innerHTML = ModalTemplate.render(this.options);
    this.element = div.firstElementChild;

    // Добавить в DOM
    document.body.appendChild(this.element);

    // Предотвратить прокрутку body
    document.body.style.overflow = 'hidden';

    // Анимация появления
    requestAnimationFrame(() => {
      this.element.classList.add('modal-show');
    });

    // Установить обработчики
    this.setupEventListeners();

    // Фокус на модальном окне
    const modal = this.element.querySelector('.modal');
    if (modal) {
      modal.focus();
    }

    this.isOpen = true;

    // Callback
    if (typeof this.options.onOpen === 'function') {
      this.options.onOpen(this);
    }
  }

  /**
   * Закрыть модальное окно
   */
  close() {
    if (!this.isOpen || !this.element) return;

    // Анимация скрытия
    this.element.classList.remove('modal-show');
    this.element.classList.add('modal-hide');

    // Удалить после анимации
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;

      // Восстановить прокрутку
      document.body.style.overflow = '';

      // Восстановить фокус
      if (this.focusedElementBeforeModal) {
        this.focusedElementBeforeModal.focus();
      }

      this.isOpen = false;

      // Callback
      if (typeof this.options.onClose === 'function') {
        this.options.onClose(this);
      }
    }, 300);
  }

  /**
   * Установка обработчиков событий
   */
  setupEventListeners() {
    if (!this.element) return;

    // Кнопка закрытия
    const closeBtn = this.element.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Клик по backdrop
    if (this.options.closeOnBackdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }

    // ESC для закрытия
    if (this.options.closeOnEsc) {
      this.handleEsc = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.handleEsc);
    }

    // Trap focus внутри модального окна
    this.setupFocusTrap();
  }

  /**
   * Ловушка фокуса
   */
  setupFocusTrap() {
    if (!this.element) return;

    const modal = this.element.querySelector('.modal');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  /**
   * Обновить контент модального окна
   */
  updateContent(content) {
    if (!this.element) return;

    const body = this.element.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * Обновить footer модального окна
   */
  updateFooter(footer) {
    if (!this.element) return;

    let footerElement = this.element.querySelector('.modal-footer');
    
    if (footer) {
      if (!footerElement) {
        footerElement = document.createElement('div');
        footerElement.className = 'modal-footer';
        const modal = this.element.querySelector('.modal');
        modal.appendChild(footerElement);
      }
      footerElement.innerHTML = footer;
    } else if (footerElement) {
      footerElement.remove();
    }
  }

  /**
   * Уничтожение модального окна
   */
  destroy() {
    if (this.handleEsc) {
      document.removeEventListener('keydown', this.handleEsc);
    }
    this.close();
  }
}

/**
 * Статические методы для быстрого использования
 */

/**
 * Показать confirm диалог
 */
export function confirmModal(options = {}) {
  return new Promise((resolve) => {
    const modal = new ModalComponent({
      ...options,
      onOpen: (modalInstance) => {
        const confirmBtn = modalInstance.element.querySelector('.modal-confirm-btn');
        const cancelBtn = modalInstance.element.querySelector('.modal-cancel');

        if (confirmBtn) {
          confirmBtn.addEventListener('click', () => {
            modalInstance.close();
            resolve(true);
          });
        }

        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            modalInstance.close();
            resolve(false);
          });
        }
      },
      onClose: () => {
        resolve(false);
      }
    });

    // Использовать confirm шаблон
    modal.options = {
      ...modal.options,
      ...ModalTemplate.confirm(options)
    };

    modal.open();
  });
}

/**
 * Показать alert диалог
 */
export function alertModal(options = {}) {
  return new Promise((resolve) => {
    const modal = new ModalComponent({
      ...options,
      onOpen: (modalInstance) => {
        const okBtn = modalInstance.element.querySelector('.modal-ok');

        if (okBtn) {
          okBtn.addEventListener('click', () => {
            modalInstance.close();
            resolve(true);
          });
        }
      },
      onClose: () => {
        resolve(true);
      }
    });

    // Использовать alert шаблон
    const alertTemplate = ModalTemplate.alert(options);
    modal.element = document.createElement('div');
    modal.element.innerHTML = alertTemplate;
    modal.element = modal.element.firstElementChild;

    modal.open();
  });
}

/**
 * Показать form диалог
 */
export function formModal(options = {}) {
  return new Promise((resolve) => {
    const modal = new ModalComponent({
      ...options,
      onOpen: (modalInstance) => {
        const form = modalInstance.element.querySelector('#modal-form');
        const submitBtn = modalInstance.element.querySelector('.modal-submit');
        const cancelBtn = modalInstance.element.querySelector('.modal-cancel');

        if (form && submitBtn) {
          const handleSubmit = (e) => {
            e.preventDefault();
            
            // Собрать данные формы
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
              data[key] = value;
            }

            modalInstance.close();
            resolve({ confirmed: true, data });
          };

          form.addEventListener('submit', handleSubmit);
          submitBtn.addEventListener('click', handleSubmit);
        }

        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            modalInstance.close();
            resolve({ confirmed: false, data: null });
          });
        }
      },
      onClose: () => {
        resolve({ confirmed: false, data: null });
      }
    });

    // Использовать form шаблон
    const formTemplate = ModalTemplate.form(options);
    modal.element = document.createElement('div');
    modal.element.innerHTML = formTemplate;
    modal.element = modal.element.firstElementChild;

    modal.open();
  });
}
