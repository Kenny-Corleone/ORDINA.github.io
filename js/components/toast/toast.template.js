/**
 * Toast Component Templates
 * Шаблоны для уведомлений
 */

export const ToastTemplate = {
  /**
   * Основной шаблон toast уведомления
   */
  render(message, type = 'info', options = {}) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const icon = icons[type] || icons.info;
    const showClose = options.showClose !== false;
    const title = options.title || '';

    return `
      <div class="toast toast-${type}" role="alert" aria-live="polite">
        <div class="toast-icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
          <div class="toast-message">${message}</div>
        </div>
        ${showClose ? `
          <button class="toast-close" aria-label="Закрыть">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
        ${options.progress ? '<div class="toast-progress"></div>' : ''}
      </div>
    `;
  },

  /**
   * Контейнер для toast уведомлений
   */
  container() {
    return `
      <div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="true"></div>
    `;
  }
};
