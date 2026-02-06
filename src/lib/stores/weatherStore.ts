import { writable } from 'svelte/store';
import { fetchWeather } from '../services/weather';
import { logger } from '../utils/logger';

interface WeatherState {
  temp: number;
  condition: string;
  icon: string;
  city: string;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

const initialState: WeatherState = {
  temp: 0,
  condition: '',
  icon: '01d', // Default icon
  city: 'Baku', // Default city
  loading: false,
  error: null,
  lastUpdated: 0
};

function createWeatherStore() {
  const { subscribe, set, update } = writable<WeatherState>(initialState);

  let refreshInterval: number | undefined;

  async function load(city: string = 'Baku', lang: string = 'en') {
    update(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchWeather(city, lang);
      update(s => ({
        ...s,
        temp: data.temp,
        condition: data.condition,
        icon: data.icon,
        city: data.city,
        loading: false,
        lastUpdated: Date.now()
      }));
    } catch (err) {
      logger.error('Weather store load error', err);
      update(s => ({ 
        ...s, 
        loading: false, 
        error: 'Failed to load weather' 
      }));
    }
  }

  function init(city: string = 'Baku', lang: string = 'en', intervalMs: number = 900000) { // 15 mins default
    // Initial load
    load(city, lang);
    
    // Clear existing interval if any
    if (refreshInterval) clearInterval(refreshInterval);

    // Set up standard interval
    if (typeof window !== 'undefined') {
      refreshInterval = window.setInterval(() => load(city, lang), intervalMs);
    }
  }

  function destroy() {
    if (refreshInterval) clearInterval(refreshInterval);
  }

  return {
    subscribe,
    load,
    init,
    destroy
  };
}

export const weatherStore = createWeatherStore();
