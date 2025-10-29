/**
 * News Template
 * HTML шаблоны для модуля новостей
 */

export class NewsTemplate {
  /**
   * Главный шаблон новостей
   */
  static render(data) {
    const {
      articles,
      currentPage,
      currentCountry,
      currentCategory,
      hasNextPage,
      categories,
      countries
    } = data;

    return `
      <div class="news-container">
        ${this.renderControls({
          currentCountry,
          currentCategory,
          categories,
          countries
        })}
        ${articles.length > 0 
          ? this.renderArticles(articles)
          : this.renderEmpty()
        }
        ${this.renderPagination(currentPage, hasNextPage)}
      </div>
    `;
  }

  /**
   * Панель управления (фильтры)
   */
  static renderControls(data) {
    const { currentCountry, currentCategory, categories, countries } = data;

    return `
      <div class="news-controls">
        <div class="news-filters">
          <div class="filter-group">
            <label for="news-country-select" class="filter-label">Страна:</label>
            <select id="news-country-select" class="filter-select">
              ${countries.map(country => `
                <option value="${country.value}" ${country.value === currentCountry ? 'selected' : ''}>
                  ${country.label}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="filter-group">
            <label for="news-category-select" class="filter-label">Категория:</label>
            <select id="news-category-select" class="filter-select">
              ${categories.map(category => `
                <option value="${category.value}" ${category.value === currentCategory ? 'selected' : ''}>
                  ${category.label}
                </option>
              `).join('')}
            </select>
          </div>

          <button id="news-refresh-btn" class="btn-refresh" title="Обновить">
            🔄
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Список статей
   */
  static renderArticles(articles) {
    return `
      <div id="news-container" class="news-grid">
        ${articles.map(article => this.renderArticle(article)).join('')}
      </div>
    `;
  }

  /**
   * Одна статья
   */
  static renderArticle(article) {
    const title = this.escapeHtml(article.title || 'Без заголовка');
    const description = this.escapeHtml(article.description || '');
    const source = this.escapeHtml(article.source_id || 'Источник');
    const imageUrl = article.image_url || '';
    const link = article.link || '#';
    const pubDate = article.pubDate 
      ? new Date(article.pubDate).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : '';

    return `
      <article class="news-card">
        ${imageUrl ? `
          <div class="news-image-wrapper">
            <img 
              src="${imageUrl}" 
              alt="${title}" 
              class="news-image"
              loading="lazy"
              onerror="this.parentElement.style.display='none'"
            >
          </div>
        ` : ''}
        
        <div class="news-content">
          <h3 class="news-title">${title}</h3>
          
          ${description ? `
            <p class="news-description">${description}</p>
          ` : ''}
          
          <div class="news-meta">
            <span class="news-source">${source}</span>
            ${pubDate ? `<span class="news-date">${pubDate}</span>` : ''}
          </div>
          
          ${link !== '#' ? `
            <a 
              href="${link}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="news-link"
            >
              Читать далее →
            </a>
          ` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Пагинация
   */
  static renderPagination(currentPage, hasNextPage) {
    return `
      <div class="news-pagination">
        <button 
          id="news-prev-btn" 
          class="pagination-btn"
          ${currentPage <= 1 ? 'disabled' : ''}
        >
          ← Предыдущая
        </button>
        
        <span class="pagination-info">
          Страница ${currentPage}
        </span>
        
        <button 
          id="news-next-btn" 
          class="pagination-btn"
          ${!hasNextPage ? 'disabled' : ''}
        >
          Следующая →
        </button>
      </div>
    `;
  }

  /**
   * Пустое состояние
   */
  static renderEmpty() {
    return `
      <div class="news-empty">
        <div class="empty-icon">📰</div>
        <p class="empty-message">Новости не найдены</p>
        <p class="empty-hint">Попробуйте изменить фильтры</p>
      </div>
    `;
  }

  /**
   * Состояние загрузки
   */
  static loading(data) {
    const { currentCountry, currentCategory, categories, countries } = data;

    return `
      <div class="news-container">
        ${this.renderControls({
          currentCountry,
          currentCategory,
          categories,
          countries
        })}
        <div class="news-loading">
          <div class="loading-spinner"></div>
          <p class="loading-text">Загрузка новостей...</p>
        </div>
      </div>
    `;
  }

  /**
   * Сообщение об ошибке
   */
  static error(message) {
    return `
      <div class="news-error">
        <div class="error-icon">⚠️</div>
        <p class="error-message">${message || 'Ошибка загрузки новостей'}</p>
        <button class="btn-retry" onclick="location.reload()">Повторить</button>
      </div>
    `;
  }

  /**
   * Экранирование HTML
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
