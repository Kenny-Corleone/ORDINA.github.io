import { translations, currentLang } from './i18n.js';
import { logger, showToast } from './utils.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

let currentWeatherCity = 'Baku';
const OPENWEATHER_API_KEY = '91b705287b193e8debf755a8ff4cb0c7';

// ============================================================================
// WEATHER ICON MAPPING
// ============================================================================
const weatherIcons = {
    '01d': '<circle cx="12" cy="12" r="5" stroke-width="2"/><line x1="12" y1="1" x2="12" y2="3" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2"/>',
    '01n': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2"/>',
    '02d': '<circle cx="12" cy="12" r="4" stroke-width="2"/><path d="M20 20c-2-2-4-3-8-3s-6 1-8 3" stroke-width="2"/>',
    '02n': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2"/><path d="M20 20c-2-2-4-3-8-3s-6 1-8 3" stroke-width="2"/>',
    '03d': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/>',
    '03n': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/>',
    '04d': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><path d="M16 8a4 4 0 0 0-8 0" stroke-width="2"/>',
    '04n': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><path d="M16 8a4 4 0 0 0-8 0" stroke-width="2"/>',
    '09d': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><line x1="8" y1="19" x2="8" y2="21" stroke-width="2"/><line x1="12" y1="19" x2="12" y2="21" stroke-width="2"/><line x1="16" y1="19" x2="16" y2="21" stroke-width="2"/>',
    '09n': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><line x1="8" y1="19" x2="8" y2="21" stroke-width="2"/><line x1="12" y1="19" x2="12" y2="21" stroke-width="2"/><line x1="16" y1="19" x2="16" y2="21" stroke-width="2"/>',
    '10d': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><line x1="8" y1="19" x2="8" y2="21" stroke-width="2"/><line x1="12" y1="19" x2="12" y2="21" stroke-width="2"/>',
    '10n': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><line x1="8" y1="19" x2="8" y2="21" stroke-width="2"/><line x1="12" y1="19" x2="12" y2="21" stroke-width="2"/>',
    '11d': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><polyline points="13 13 11 16 13 16 11 19" stroke-width="2"/>',
    '11n': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><polyline points="13 13 11 16 13 16 11 19" stroke-width="2"/>',
    '13d': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><line x1="8" y1="19" x2="8.01" y2="19" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="19" x2="12.01" y2="19" stroke-width="3" stroke-linecap="round"/><line x1="16" y1="19" x2="16.01" y2="19" stroke-width="3" stroke-linecap="round"/>',
    '13n': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke-width="2"/><line x1="8" y1="19" x2="8.01" y2="19" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="19" x2="12.01" y2="19" stroke-width="3" stroke-linecap="round"/><line x1="16" y1="19" x2="16.01" y2="19" stroke-width="3" stroke-linecap="round"/>',
    '50d': '<path d="M3 15h18M3 9h18M3 21h18" stroke-width="2" stroke-linecap="round"/>',
    '50n': '<path d="M3 15h18M3 9h18M3 21h18" stroke-width="2" stroke-linecap="round"/>'
};

const geocodeToCity = async (lat, lon) => {
    try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
        const d = await r.json();
        return d.address?.city || d.address?.town || d.address?.village || d.address?.state || 'Baku';
    } catch (_) { return 'Baku'; }
};

const translateWeatherDesc = (desc) => {
    const map = {
        ru: { 'clear sky': 'Ясно', 'few clouds': 'Малооблачно', 'scattered clouds': 'Переменная облачность', 'broken clouds': 'Облачно', 'overcast clouds': 'Пасмурно', 'light rain': 'Небольшой дождь', 'moderate rain': 'Умеренный дождь', 'heavy rain': 'Сильный дождь', 'thunderstorm': 'Гроза', 'snow': 'Снег', 'mist': 'Дымка', 'fog': 'Туман' },
        en: { 'clear sky': 'Clear Sky', 'few clouds': 'Few Clouds', 'scattered clouds': 'Scattered Clouds', 'broken clouds': 'Broken Clouds', 'overcast clouds': 'Overcast', 'light rain': 'Light Rain', 'moderate rain': 'Moderate Rain', 'heavy rain': 'Heavy Rain', 'thunderstorm': 'Thunderstorm', 'snow': 'Snow', 'mist': 'Mist', 'fog': 'Fog' },
        az: { 'clear sky': 'Açıq', 'few clouds': 'Az buludlu', 'scattered clouds': 'Dağınıq buludlar', 'broken clouds': 'Buludlu', 'overcast clouds': 'Tutqun', 'light rain': 'Yüngül yağış', 'moderate rain': 'Orta yağış', 'heavy rain': 'Güclü yağış', 'thunderstorm': 'Ildırım', 'snow': 'Qar', 'mist': 'Duman', 'fog': 'Sis' }
    };
    const table = map[currentLang] || map.en;
    return table[desc.toLowerCase()] || desc;
};

export async function updateWeatherNew(city = 'Baku') {
    try {
        currentWeatherCity = city;

        // Show loading state
        const tempEl = document.getElementById('weather-temp-new');
        const cityEl = document.getElementById('weather-city-new');
        const descEl = document.getElementById('weather-desc-new');
        const datetimeEl = document.getElementById('weather-datetime-new');
        const iconEl = document.getElementById('weather-animated-icon');

        if (tempEl) tempEl.textContent = '...';
        if (cityEl) cityEl.textContent = city;
        if (descEl) descEl.textContent = translations[currentLang].weatherLoading || 'Loading...';

        // Fetch weather data from OpenWeatherMap
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${currentLang}`);

        if (!res.ok) throw new Error('Weather API error');

        const data = await res.json();

        // Update UI
        const temp = Math.round(data.main.temp);
        const description = translateWeatherDesc(data.weather[0].description);
        const iconCode = data.weather[0].icon;
        // OpenWeatherMap returns timezone offset in seconds
        const timezoneOffset = data.timezone || 0;

        if (tempEl) tempEl.textContent = temp;
        if (cityEl) cityEl.textContent = data.name;
        if (descEl) descEl.textContent = description;

        // Update compact weather widget
        const tempCompactEl = document.getElementById('weather-temp-compact');
        const cityCompactEl = document.getElementById('weather-city-compact');
        if (tempCompactEl) tempCompactEl.textContent = temp + '°C';
        if (cityCompactEl) {
            cityCompactEl.textContent = data.name;
            cityCompactEl.title = data.name;
        }
        // Format date and time using UTC offset (OpenWeatherMap returns offset in seconds from UTC)
        if (datetimeEl) {
            const now = new Date();
            const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
            const localTime = new Date(utcTime + (timezoneOffset * 1000));

            // Используем наши массивы месяцев вместо toLocaleString
            const monthIndex = localTime.getMonth();
            const day = localTime.getDate();
            const weekdayIndex = localTime.getDay();
            const hour = localTime.getHours().toString().padStart(2, '0');
            const minute = localTime.getMinutes().toString().padStart(2, '0');

            const monthShort = translations[currentLang]?.monthsShort?.[monthIndex] || '';
            let weekdayShort = '';
            if (translations[currentLang]?.weekdaysFull) {
                const adjustedIndex = weekdayIndex === 0 ? 6 : weekdayIndex - 1;
                weekdayShort = (translations[currentLang].weekdaysFull[adjustedIndex] || '').substring(0, 3);
            }

            if (monthShort && weekdayShort) {
                datetimeEl.textContent = `${weekdayShort}, ${day} ${monthShort} • ${hour}:${minute}`;
            } else {
                // Fallback если массивы не найдены
                const locale = currentLang === 'ru' ? 'ru-RU' : currentLang === 'az' ? 'az-Latn-AZ' : 'en-US';
                const dateStr = localTime.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = localTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                datetimeEl.textContent = `${dateStr} • ${timeStr}`;
            }
        }
        // Update icon
        if (iconEl) {
            const iconSvg = weatherIcons[iconCode] || weatherIcons['01d'];
            iconEl.innerHTML = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">${iconSvg}</svg>`;
        }

    } catch (e) {
        logger.error('Weather error:', e);
        const tempEl = document.getElementById('weather-temp-new');
        const descEl = document.getElementById('weather-desc-new');
        if (tempEl) tempEl.textContent = '--';
        if (descEl) descEl.textContent = translations[currentLang].weatherError || 'Error loading weather';

        // Update compact weather widget on error
        const tempCompactEl = document.getElementById('weather-temp-compact');
        const cityCompactEl = document.getElementById('weather-city-compact');
        if (tempCompactEl) tempCompactEl.textContent = '--';
        if (cityCompactEl) cityCompactEl.textContent = '—';

        showToast(translations[currentLang].weatherError || 'Error loading weather', 'error');
    }
}

export const initWeatherNew = () => {
    const searchInput = document.getElementById('weather-search-input');
    const searchBtn = document.getElementById('weather-search-btn');
    const locationBtn = document.getElementById('weather-location-btn-new');
    const refreshBtn = document.getElementById('weather-refresh-btn-new');

    const performSearch = () => {
        const city = searchInput?.value?.trim();
        if (city) {
            updateWeatherNew(city);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateWeatherNew(currentWeatherCity);
        });
    }

    if (locationBtn && navigator.geolocation) {
        locationBtn.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    const city = await geocodeToCity(coords.latitude, coords.longitude);
                    if (searchInput) searchInput.value = city;
                    updateWeatherNew(city);
                    showToast(translations[currentLang].weatherLocationSuccess || 'Location detected', 'success');
                },
                () => {
                    showToast(translations[currentLang].weatherLocationError || 'Location unavailable', 'error');
                }
            );
        });
    }

    // Initial load
    updateWeatherNew('Baku');
};
