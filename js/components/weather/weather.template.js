/**
 * Weather Component Templates
 * Шаблоны для отображения виджета погоды
 */

export const WeatherTemplate = {
  /**
   * Скелетон загрузки
   */
  skeleton() {
    return `
      <div class="weather-widget loading">
        <div class="weather-skeleton">
          <div class="skeleton-city"></div>
          <div class="skeleton-temp"></div>
          <div class="skeleton-desc"></div>
        </div>
      </div>
    `;
  },

  /**
   * Основной шаблон с данными погоды
   */
  render(data) {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed);
    const cityName = data.name;

    return `
      <div class="weather-widget">
        <div class="weather-header">
          <div class="weather-city">
            <i class="fas fa-map-marker-alt"></i>
            <span class="city-name">${cityName}</span>
            <button class="weather-change-city" title="Изменить город">
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <div class="weather-actions">
            <button class="weather-geolocation" title="Использовать мою геолокацию">
              <i class="fas fa-location-arrow"></i>
            </button>
            <button class="weather-refresh" title="Обновить">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="weather-main">
          <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
          </div>
          <div class="weather-temp">
            <span class="temp-value">${temp}</span>
            <span class="temp-unit">°C</span>
          </div>
        </div>

        <div class="weather-description">${description}</div>

        <div class="weather-details">
          <div class="weather-detail">
            <i class="fas fa-temperature-low"></i>
            <span>Ощущается: ${feelsLike}°C</span>
          </div>
          <div class="weather-detail">
            <i class="fas fa-tint"></i>
            <span>Влажность: ${humidity}%</span>
          </div>
          <div class="weather-detail">
            <i class="fas fa-wind"></i>
            <span>Ветер: ${windSpeed} м/с</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Шаблон ошибки
   */
  error(message = 'Не удалось загрузить погоду') {
    return `
      <div class="weather-widget error">
        <div class="weather-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${message}</p>
          <button class="weather-retry">Попробовать снова</button>
        </div>
      </div>
    `;
  },

  /**
   * Модальное окно для смены города
   */
  cityModal() {
    return `
      <div class="weather-modal-overlay">
        <div class="weather-modal">
          <div class="weather-modal-header">
            <h3>Выберите город</h3>
            <button class="weather-modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="weather-modal-body">
            <input 
              type="text" 
              class="weather-city-input" 
              placeholder="Введите название города..."
              autocomplete="off"
            >
            <div class="weather-city-suggestions">
              <button class="city-suggestion" data-city="Baku">Баку</button>
              <button class="city-suggestion" data-city="Moscow">Москва</button>
              <button class="city-suggestion" data-city="London">Лондон</button>
              <button class="city-suggestion" data-city="New York">Нью-Йорк</button>
              <button class="city-suggestion" data-city="Paris">Париж</button>
              <button class="city-suggestion" data-city="Tokyo">Токио</button>
            </div>
          </div>
          <div class="weather-modal-footer">
            <button class="weather-modal-cancel">Отмена</button>
            <button class="weather-modal-confirm">Применить</button>
          </div>
        </div>
      </div>
    `;
  }
};
