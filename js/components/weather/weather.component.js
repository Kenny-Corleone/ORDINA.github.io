/**
 * Weather Component
 * Компонент виджета погоды
 */

import { WeatherTemplate } from './weather.template.js';

export class WeatherComponent {
  constructor(weatherService) {
    this.weatherService = weatherService;
    this.container = null;
    this.currentCity = localStorage.getItem('weatherCity') || 'Baku';
    this.isLoading = false;
    this.modal = null;
  }

  /**
   * Монтирование компонента в DOM
   */
  mount(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    this.render();
    this.loadWeather();
  }

  /**
   * Рендеринг скелетона
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = WeatherTemplate.skeleton();
  }

  /**
   * Загрузка данных погоды
   */
  async loadWeather(city = this.currentCity) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const data = await this.weatherService.getWeather(city);
      
      if (data) {
        this.currentCity = city;
        localStorage.setItem('weatherCity', city);
        this.container.innerHTML = WeatherTemplate.render(data);
        this.setupEventListeners();
      } else {
        throw new Error('No weather data received');
      }
    } catch (error) {
      console.error('Error loading weather:', error);
      this.container.innerHTML = WeatherTemplate.error();
      this.setupErrorHandlers();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Загрузка погоды по координатам
   */
  async loadWeatherByCoords(lat, lon) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.render(); // Показываем скелетон
    
    try {
      const data = await this.weatherService.getWeatherByCoords(lat, lon);
      
      if (data) {
        this.currentCity = data.name;
        localStorage.setItem('weatherCity', data.name);
        this.container.innerHTML = WeatherTemplate.render(data);
        this.setupEventListeners();
      } else {
        throw new Error('No weather data received');
      }
    } catch (error) {
      console.error('Error loading weather by coords:', error);
      this.container.innerHTML = WeatherTemplate.error('Не удалось определить погоду по вашему местоположению');
      this.setupErrorHandlers();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Установка обработчиков событий
   */
  setupEventListeners() {
    if (!this.container) return;

    // Кнопка смены города
    const changeCityBtn = this.container.querySelector('.weather-change-city');
    if (changeCityBtn) {
      changeCityBtn.addEventListener('click', () => this.showCityModal());
    }

    // Кнопка геолокации
    const geolocationBtn = this.container.querySelector('.weather-geolocation');
    if (geolocationBtn) {
      geolocationBtn.addEventListener('click', () => this.handleGeolocation());
    }

    // Кнопка обновления
    const refreshBtn = this.container.querySelector('.weather-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }
  }

  /**
   * Установка обработчиков для состояния ошибки
   */
  setupErrorHandlers() {
    if (!this.container) return;

    const retryBtn = this.container.querySelector('.weather-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadWeather());
    }
  }

  /**
   * Показать модальное окно выбора города
   */
  showCityModal() {
    // Создаем модальное окно
    this.modal = document.createElement('div');
    this.modal.innerHTML = WeatherTemplate.cityModal();
    document.body.appendChild(this.modal.firstElementChild);

    const modalElement = document.querySelector('.weather-modal-overlay');
    const input = modalElement.querySelector('.weather-city-input');
    const closeBtn = modalElement.querySelector('.weather-modal-close');
    const cancelBtn = modalElement.querySelector('.weather-modal-cancel');
    const confirmBtn = modalElement.querySelector('.weather-modal-confirm');
    const suggestions = modalElement.querySelectorAll('.city-suggestion');

    // Фокус на input
    setTimeout(() => input.focus(), 100);

    // Обработчики для предложенных городов
    suggestions.forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.city;
      });
    });

    // Закрытие модального окна
    const closeModal = () => {
      modalElement.remove();
      this.modal = null;
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Закрытие по клику на overlay
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        closeModal();
      }
    });

    // Закрытие по ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Подтверждение выбора
    const confirmCity = () => {
      const city = input.value.trim();
      if (city) {
        this.loadWeather(city);
        closeModal();
      }
    };

    confirmBtn.addEventListener('click', confirmCity);
    
    // Enter для подтверждения
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmCity();
      }
    });
  }

  /**
   * Обработка геолокации
   */
  handleGeolocation() {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    const geolocationBtn = this.container.querySelector('.weather-geolocation');
    if (geolocationBtn) {
      geolocationBtn.classList.add('loading');
      geolocationBtn.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.loadWeatherByCoords(latitude, longitude);
        
        if (geolocationBtn) {
          geolocationBtn.classList.remove('loading');
          geolocationBtn.disabled = false;
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Не удалось получить вашу геолокацию');
        
        if (geolocationBtn) {
          geolocationBtn.classList.remove('loading');
          geolocationBtn.disabled = false;
        }
      }
    );
  }

  /**
   * Обработка обновления погоды
   */
  handleRefresh() {
    const refreshBtn = this.container.querySelector('.weather-refresh');
    if (refreshBtn) {
      refreshBtn.classList.add('rotating');
    }

    this.loadWeather().finally(() => {
      if (refreshBtn) {
        setTimeout(() => {
          refreshBtn.classList.remove('rotating');
        }, 500);
      }
    });
  }

  /**
   * Размонтирование компонента
   */
  unmount() {
    if (this.modal) {
      const modalElement = document.querySelector('.weather-modal-overlay');
      if (modalElement) {
        modalElement.remove();
      }
      this.modal = null;
    }
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}
