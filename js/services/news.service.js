/**
 * News Service
 * Сервис для работы с NewsData.io API
 * Предоставляет методы для получения новостей с кэшированием
 */

export class NewsService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('News API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://newsdata.io/api/1/news';
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 минут
    this.localStorageKey = 'ordina_news_cache';
    
    // Load cache from localStorage on initialization
    this.loadCacheFromStorage();
  }

  /**
   * Load cache from localStorage
   */
  loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        Object.entries(parsed).forEach(([key, value]) => {
          if (value.timestamp && now - value.timestamp < this.cacheTimeout) {
            this.cache.set(key, value);
          }
        });
        console.log('News cache loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load news cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  saveCacheToStorage() {
    try {
      const cacheObj = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = value;
      });
      localStorage.setItem(this.localStorageKey, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Failed to save news cache to localStorage:', error);
    }
  }

  /**
   * Получить новости с кэшированием
   * @param {Object} options - Параметры запроса
   * @param {string} [options.country='us'] - Код страны
   * @param {string} [options.category='general'] - Категория новостей
   * @param {string} [options.language='ru'] - Язык новостей
   * @param {number} [options.page=1] - Номер страницы
   * @returns {Promise<Object>} Данные новостей
   */
  async getNews(options = {}) {
    const {
      country = 'us',
      category = 'general',
      language = 'ru',
      page = 1
    } = options;

    // Создаем ключ для кэша
    const cacheKey = `${country}-${category}-${language}-${page}`;
    
    // Проверка кэша
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`News data loaded from cache: ${cacheKey}`);
      return cached.data;
    }

    try {
      const url = this.buildUrl({
        country,
        category,
        language,
        page
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Превышен лимит запросов к API новостей');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Проверка на ошибки API
      if (data.status === 'error') {
        throw new Error(data.results?.message || 'Ошибка API новостей');
      }

      // Кэширование успешного ответа
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Persist to localStorage
      this.saveCacheToStorage();

      console.log(`News data loaded from API: ${cacheKey}`);
      return data;
    } catch (error) {
      console.error('News API error:', error);
      // Возвращаем fallback данные при ошибке
      return this.getMockNews(country, category);
    }
  }

  /**
   * Получить новости по конкретной стране
   * @param {string} country - Код страны (us, ru, gb и т.д.)
   * @param {number} [page=1] - Номер страницы
   * @returns {Promise<Object>} Данные новостей
   */
  async getNewsByCountry(country, page = 1) {
    return this.getNews({ country, page });
  }

  /**
   * Получить новости по категории
   * @param {string} category - Категория (general, business, technology и т.д.)
   * @param {number} [page=1] - Номер страницы
   * @returns {Promise<Object>} Данные новостей
   */
  async getNewsByCategory(category, page = 1) {
    return this.getNews({ category, page });
  }

  /**
   * Поиск новостей по ключевым словам
   * @param {string} query - Поисковый запрос
   * @param {number} [page=1] - Номер страницы
   * @returns {Promise<Object>} Данные новостей
   */
  async searchNews(query, page = 1) {
    const cacheKey = `search-${query}-${page}`;
    
    // Проверка кэша
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Search results loaded from cache: ${query}`);
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}?apikey=${this.apiKey}&q=${encodeURIComponent(query)}&language=ru&page=${page}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Кэширование
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Persist to localStorage
      this.saveCacheToStorage();

      console.log(`Search results loaded from API: ${query}`);
      return data;
    } catch (error) {
      console.error('News search error:', error);
      return this.getMockNews('us', 'general');
    }
  }

  /**
   * Построить URL для запроса
   * @param {Object} params - Параметры запроса
   * @returns {string} URL
   */
  buildUrl(params) {
    const { country, category, language, page } = params;
    const queryParams = new URLSearchParams({
      apikey: this.apiKey,
      country,
      category,
      language,
      page: page.toString()
    });

    return `${this.baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Получить mock данные новостей (fallback)
   * @param {string} country - Код страны
   * @param {string} category - Категория
   * @returns {Object} Mock данные новостей
   */
  getMockNews(country, category) {
    console.log(`Returning mock news data for ${country}/${category}`);
    
    const mockArticles = [
      {
        title: 'Технологические новости дня',
        description: 'Последние обновления в мире технологий и инноваций',
        link: '#',
        image_url: null,
        source_id: 'Mock Source',
        pubDate: new Date().toISOString(),
        category: [category]
      },
      {
        title: 'Экономические тренды',
        description: 'Анализ текущей экономической ситуации',
        link: '#',
        image_url: null,
        source_id: 'Mock Source',
        pubDate: new Date(Date.now() - 3600000).toISOString(),
        category: [category]
      },
      {
        title: 'Мировые события',
        description: 'Обзор важнейших событий в мире',
        link: '#',
        image_url: null,
        source_id: 'Mock Source',
        pubDate: new Date(Date.now() - 7200000).toISOString(),
        category: [category]
      }
    ];

    return {
      status: 'success',
      totalResults: mockArticles.length,
      results: mockArticles,
      nextPage: null
    };
  }

  /**
   * Очистить кэш новостей
   */
  clearCache() {
    this.cache.clear();
    console.log('News cache cleared');
  }

  /**
   * Очистить кэш для конкретного запроса
   * @param {string} cacheKey - Ключ кэша
   */
  clearCacheForKey(cacheKey) {
    this.cache.delete(cacheKey);
    console.log(`News cache cleared for key: ${cacheKey}`);
  }

  /**
   * Получить доступные категории новостей
   * @returns {Array<Object>} Массив категорий
   */
  getAvailableCategories() {
    return [
      { value: 'general', label: 'Общие' },
      { value: 'business', label: 'Бизнес' },
      { value: 'technology', label: 'Технологии' },
      { value: 'entertainment', label: 'Развлечения' },
      { value: 'sports', label: 'Спорт' },
      { value: 'science', label: 'Наука' },
      { value: 'health', label: 'Здоровье' }
    ];
  }

  /**
   * Получить доступные страны
   * @returns {Array<Object>} Массив стран
   */
  getAvailableCountries() {
    return [
      { value: 'us', label: 'США' },
      { value: 'ru', label: 'Россия' },
      { value: 'gb', label: 'Великобритания' },
      { value: 'de', label: 'Германия' },
      { value: 'fr', label: 'Франция' },
      { value: 'it', label: 'Италия' },
      { value: 'es', label: 'Испания' },
      { value: 'tr', label: 'Турция' }
    ];
  }
}
