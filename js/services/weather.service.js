/**
 * Weather Service
 * Сервис для работы с OpenWeatherMap API
 * Предоставляет методы для получения данных о погоде с кэшированием
 */

export class WeatherService {
  constructor() {
    this.apiKey = '91b705287b193e8debf755a8ff4cb0c7';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 минут
    this.localStorageKey = 'ordina_weather_cache';
    
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
        // Only load non-expired entries
        const now = Date.now();
        Object.entries(parsed).forEach(([key, value]) => {
          if (value.timestamp && now - value.timestamp < this.cacheTimeout) {
            this.cache.set(key, value);
          }
        });
        console.log('Weather cache loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load weather cache from localStorage:', error);
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
      console.error('Failed to save weather cache to localStorage:', error);
    }
  }

  /**
   * Получить погоду для города с кэшированием
   * @param {string} city - Название города
   * @returns {Promise<Object>} Данные о погоде
   */
  async getWeather(city) {
    // Проверка кэша
    const cached = this.cache.get(city);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Weather data for ${city} loaded from cache`);
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=ru`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Кэширование успешного ответа
      this.cache.set(city, {
        data,
        timestamp: Date.now()
      });
      
      // Persist to localStorage
      this.saveCacheToStorage();

      console.log(`Weather data for ${city} loaded from API`);
      return data;
    } catch (error) {
      console.error('Weather API error:', error);
      // Возвращаем mock данные при ошибке
      return this.getMockWeather(city);
    }
  }

  /**
   * Получить погоду по координатам (для геолокации)
   * @param {number} lat - Широта
   * @param {number} lon - Долгота
   * @returns {Promise<Object|null>} Данные о погоде или null при ошибке
   */
  async getWeatherByCoords(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    
    // Проверка кэша
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Weather data for coords ${cacheKey} loaded from cache`);
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Кэширование успешного ответа
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Persist to localStorage
      this.saveCacheToStorage();

      console.log(`Weather data for coords ${cacheKey} loaded from API`);
      return data;
    } catch (error) {
      console.error('Weather API error (coords):', error);
      return null;
    }
  }

  /**
   * Получить mock данные о погоде (fallback)
   * @param {string} city - Название города
   * @returns {Object} Mock данные о погоде
   */
  getMockWeather(city) {
    console.log(`Returning mock weather data for ${city}`);
    return {
      name: city,
      main: {
        temp: 20,
        feels_like: 19,
        humidity: 60,
        pressure: 1013
      },
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'ясно',
        icon: '01d'
      }],
      wind: {
        speed: 3,
        deg: 180
      },
      clouds: {
        all: 0
      },
      sys: {
        country: 'AZ',
        sunrise: Date.now() / 1000 - 3600,
        sunset: Date.now() / 1000 + 3600
      },
      dt: Date.now() / 1000
    };
  }

  /**
   * Очистить кэш погоды
   */
  clearCache() {
    this.cache.clear();
    console.log('Weather cache cleared');
  }

  /**
   * Очистить кэш для конкретного города
   * @param {string} city - Название города
   */
  clearCacheForCity(city) {
    this.cache.delete(city);
    console.log(`Weather cache cleared for ${city}`);
  }
}
