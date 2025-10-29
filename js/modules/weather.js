// ═══════════════════════════════════════════════════════════════════════════
// 🌤️ МОДУЛЬ ПОГОДЫ
// ═══════════════════════════════════════════════════════════════════════════

const WEATHER_API_KEY = '8c8e1b8e5f8e4f8e8e8e8e8e8e8e8e8e';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

let currentCity = localStorage.getItem('weatherCity') || 'Baku';

export function initWeather() {
    loadWeather(currentCity);
    setupWeatherControls();
}

function setupWeatherControls() {
    const cityInput = document.getElementById('weather-city-input');
    const geoBtn = document.getElementById('weather-geo-btn');
    const refreshBtn = document.getElementById('weather-refresh-btn');
    
    if (cityInput) {
        cityInput.value = currentCity;
        cityInput.addEventListener('change', (e) => {
            currentCity = e.target.value;
            localStorage.setItem('weatherCity', currentCity);
            loadWeather(currentCity);
        });
    }
    
    if (geoBtn) {
        geoBtn.addEventListener('click', getWeatherByGeolocation);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadWeather(currentCity));
    }
}

async function loadWeather(city) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    try {
        weatherWidget.innerHTML = '<div class="text-sm">Загрузка...</div>';
        
        const response = await fetch(
            `${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`
        );
        
        if (!response.ok) throw new Error('Город не найден');
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        weatherWidget.innerHTML = `
            <div class="text-sm text-red-500">
                <i class="fas fa-exclamation-triangle"></i>
                Ошибка загрузки погоды
            </div>
        `;
    }
}

function displayWeather(data) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed);
    
    weatherWidget.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" 
                 alt="${description}" 
                 class="w-16 h-16">
            <div class="flex-1">
                <div class="text-3xl font-bold">${temp}°C</div>
                <div class="text-xs opacity-70">Ощущается: ${feelsLike}°C</div>
                <div class="text-sm capitalize mt-1">${description}</div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div class="flex items-center gap-1">
                <i class="fas fa-tint"></i>
                <span>${humidity}%</span>
            </div>
            <div class="flex items-center gap-1">
                <i class="fas fa-wind"></i>
                <span>${windSpeed} м/с</span>
            </div>
        </div>
    `;
}

async function getWeatherByGeolocation() {
    if (!navigator.geolocation) {
        alert('Геолокация не поддерживается');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(
                    `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`
                );
                
                const data = await response.json();
                currentCity = data.name;
                localStorage.setItem('weatherCity', currentCity);
                
                const cityInput = document.getElementById('weather-city-input');
                if (cityInput) cityInput.value = currentCity;
                
                displayWeather(data);
            } catch (error) {
                alert('Ошибка получения погоды');
            }
        },
        () => {
            alert('Не удалось получить геолокацию');
        }
    );
}

export { loadWeather, currentCity };
