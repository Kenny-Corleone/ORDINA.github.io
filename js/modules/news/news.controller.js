/**
 * News Controller
 * Бизнес-логика модуля новостей
 */

import { NewsTemplate } from './news.template.js';

export class NewsController {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.state = {
      articles: [],
      currentPage: 1,
      currentCountry: 'us',
      currentCategory: 'general',
      isLoading: false,
      hasNextPage: false
    };
  }

  /**
   * Инициализация контроллера
   */
  async init() {
    this.container = document.getElementById('news-content');
    if (!this.container) {
      console.error('News container not found');
      return;
    }

    // Загружаем сохраненные настройки
    this.loadSettings();

    // Рендерим начальный UI
    this.render();
    
    // Загружаем новости
    await this.fetchNews();
    
    // Устанавливаем обработчики
    this.setupEventListeners();
  }

  /**
   * Загрузка сохраненных настроек
   */
  loadSettings() {
    const savedCountry = localStorage.getItem('newsCountry');
    const savedCategory = localStorage.getItem('newsCategory');
    
    if (savedCountry) {
      this.state.currentCountry = savedCountry;
    }
    if (savedCategory) {
      this.state.currentCategory = savedCategory;
    }
  }

  /**
   * Сохранение настроек
   */
  saveSettings() {
    localStorage.setItem('newsCountry', this.state.currentCountry);
    localStorage.setItem('newsCategory', this.state.currentCategory);
  }

  /**
   * Загрузка новостей
   */
  async fetchNews() {
    const newsService = this.app.getService('news');
    if (!newsService) {
      console.error('News service not found');
      this.state.articles = [];
      this.render();
      return;
    }

    this.state.isLoading = true;
    this.renderLoading();

    try {
      const data = await newsService.getNews({
        country: this.state.currentCountry,
        category: this.state.currentCategory,
        language: 'ru',
        page: this.state.currentPage
      });

      if (data && data.results) {
        this.state.articles = data.results;
        this.state.hasNextPage = !!data.nextPage;
      } else {
        this.state.articles = [];
        this.state.hasNextPage = false;
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      this.state.articles = [];
      this.state.hasNextPage = false;
    } finally {
      this.state.isLoading = false;
      this.render();
    }
  }

  /**
   * Рендеринг UI
   */
  render() {
    if (!this.container) return;

    const newsService = this.app.getService('news');
    const categories = newsService ? newsService.getAvailableCategories() : [];
    const countries = newsService ? newsService.getAvailableCountries() : [];

    const html = NewsTemplate.render({
      articles: this.state.articles,
      currentPage: this.state.currentPage,
      currentCountry: this.state.currentCountry,
      currentCategory: this.state.currentCategory,
      hasNextPage: this.state.hasNextPage,
      categories,
      countries
    });

    this.container.innerHTML = html;
  }

  /**
   * Рендеринг состояния загрузки
   */
  renderLoading() {
    if (!this.container) return;
    
    const newsService = this.app.getService('news');
    const categories = newsService ? newsService.getAvailableCategories() : [];
    const countries = newsService ? newsService.getAvailableCountries() : [];

    const html = NewsTemplate.loading({
      currentCountry: this.state.currentCountry,
      currentCategory: this.state.currentCategory,
      categories,
      countries
    });

    this.container.innerHTML = html;
  }

  /**
   * Установка обработчиков событий
   */
  setupEventListeners() {
    if (!this.container) return;

    // Обработчик смены страны
    const countrySelect = this.container.querySelector('#news-country-select');
    if (countrySelect) {
      countrySelect.addEventListener('change', (e) => {
        this.state.currentCountry = e.target.value;
        this.state.currentPage = 1;
        this.saveSettings();
        this.fetchNews();
      });
    }

    // Обработчик смены категории
    const categorySelect = this.container.querySelector('#news-category-select');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.state.currentCategory = e.target.value;
        this.state.currentPage = 1;
        this.saveSettings();
        this.fetchNews();
      });
    }

    // Обработчик предыдущей страницы
    const prevBtn = this.container.querySelector('#news-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.state.currentPage > 1) {
          this.state.currentPage--;
          this.fetchNews();
        }
      });
    }

    // Обработчик следующей страницы
    const nextBtn = this.container.querySelector('#news-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.state.currentPage++;
        this.fetchNews();
      });
    }

    // Обработчик обновления
    const refreshBtn = this.container.querySelector('#news-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refresh();
      });
    }
  }

  /**
   * Обновление данных
   */
  async refresh() {
    // Очищаем кэш для текущих параметров
    const newsService = this.app.getService('news');
    if (newsService) {
      const cacheKey = `${this.state.currentCountry}-${this.state.currentCategory}-ru-${this.state.currentPage}`;
      newsService.clearCacheForKey(cacheKey);
    }
    
    await this.fetchNews();
  }

  /**
   * Уничтожение контроллера
   */
  destroy() {
    this.container = null;
    this.state = {
      articles: [],
      currentPage: 1,
      currentCountry: 'us',
      currentCategory: 'general',
      isLoading: false,
      hasNextPage: false
    };
  }
}
