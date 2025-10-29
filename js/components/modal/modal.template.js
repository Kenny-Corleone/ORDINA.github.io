/**
 * Modal Component Templates
 * Шаблоны для модальных окон
 */

export const ModalTemplate = {
  /**
   * Основной шаблон модального окна
   */
  render(options = {}) {
    const {
      title = '',
      content = '',
      footer = '',
      size = 'medium', // small, medium, large
      showClose = true,
      closeOnBackdrop = true
    } = options;

    return `
      <div class="modal-overlay" data-close-on-backdrop="${closeOnBackdrop}">
        <div class="modal modal-${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          ${title || showClose ? `
            <div class="modal-header">
              ${title ? `<h3 class="modal-title" id="modal-title">${title}</h3>` : ''}
              ${showClose ? `
                <button class="modal-close" aria-label="Закрыть">
                  <i class="fas fa-times"></i>
                </button>
              ` : ''}
            </div>
          ` : ''}
          
          <div class="modal-body">
            ${content}
          </div>
          
          ${footer ? `
            <div class="modal-footer">
              ${footer}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Шаблон подтверждения
   */
  confirm(options = {}) {
    const {
      title = 'Подтверждение',
      message = 'Вы уверены?',
      confirmText = 'Подтвердить',
      cancelText = 'Отмена',
      confirmClass = 'btn-primary',
      icon = 'fa-question-circle'
    } = options;

    const content = `
      <div class="modal-confirm">
        <div class="modal-confirm-icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="modal-confirm-message">
          ${message}
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary modal-cancel">${cancelText}</button>
      <button class="btn ${confirmClass} modal-confirm-btn">${confirmText}</button>
    `;

    return this.render({
      title,
      content,
      footer,
      size: 'small',
      showClose: true,
      closeOnBackdrop: true
    });
  },

  /**
   * Шаблон алерта
   */
  alert(options = {}) {
    const {
      title = 'Уведомление',
      message = '',
      buttonText = 'OK',
      type = 'info' // info, success, warning, error
    } = options;

    const icons = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-exclamation-circle'
    };

    const icon = icons[type] || icons.info;

    const content = `
      <div class="modal-alert modal-alert-${type}">
        <div class="modal-alert-icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="modal-alert-message">
          ${message}
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-primary modal-ok">${buttonText}</button>
    `;

    return this.render({
      title,
      content,
      footer,
      size: 'small',
      showClose: false,
      closeOnBackdrop: false
    });
  },

  /**
   * Шаблон формы
   */
  form(options = {}) {
    const {
      title = '',
      fields = [],
      submitText = 'Сохранить',
      cancelText = 'Отмена'
    } = options;

    const content = `
      <form class="modal-form" id="modal-form">
        ${fields.map(field => this.renderField(field)).join('')}
      </form>
    `;

    const footer = `
      <button type="button" class="btn btn-secondary modal-cancel">${cancelText}</button>
      <button type="submit" class="btn btn-primary modal-submit" form="modal-form">${submitText}</button>
    `;

    return this.render({
      title,
      content,
      footer,
      size: 'medium',
      showClose: true,
      closeOnBackdrop: false
    });
  },

  /**
   * Рендеринг поля формы
   */
  renderField(field) {
    const {
      type = 'text',
      name = '',
      label = '',
      placeholder = '',
      value = '',
      required = false,
      options = []
    } = field;

    let input = '';

    switch (type) {
      case 'textarea':
        input = `
          <textarea 
            class="form-control" 
            name="${name}" 
            placeholder="${placeholder}"
            ${required ? 'required' : ''}
          >${value}</textarea>
        `;
        break;

      case 'select':
        input = `
          <select class="form-control" name="${name}" ${required ? 'required' : ''}>
            <option value="">Выберите...</option>
            ${options.map(opt => `
              <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        `;
        break;

      case 'checkbox':
        input = `
          <label class="form-checkbox">
            <input 
              type="checkbox" 
              name="${name}" 
              ${value ? 'checked' : ''}
            >
            <span>${label}</span>
          </label>
        `;
        return `<div class="form-group">${input}</div>`;

      default:
        input = `
          <input 
            type="${type}" 
            class="form-control" 
            name="${name}" 
            placeholder="${placeholder}"
            value="${value}"
            ${required ? 'required' : ''}
          >
        `;
    }

    return `
      <div class="form-group">
        ${label && type !== 'checkbox' ? `<label class="form-label">${label}${required ? ' *' : ''}</label>` : ''}
        ${input}
      </div>
    `;
  }
};
