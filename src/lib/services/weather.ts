// ============================================================================
// WEATHER SERVICE - OpenWeatherMap Integration
// ============================================================================

import { logger } from '../utils/logger';
import { Language } from '../types';
import { translations as translationsStore } from '../i18n';
import { get } from 'svelte/store';

// ============================================================================
// TYPES
// ============================================================================

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
  timezone: number;
  timestamp: number;
}

export interface WeatherIconMap {
  [key: string]: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const DEFAULT_CITY = 'Baku';

if (!OPENWEATHER_API_KEY && import.meta.env.DEV) {
  logger.warn('VITE_OPENWEATHER_API_KEY is not set. Weather features may not work.');
}

// ============================================================================
// WEATHER ICON MAPPING (SVG paths)
// ============================================================================

export const weatherIcons: WeatherIconMap = {
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

// ============================================================================
// WEATHER DESCRIPTION TRANSLATIONS
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Geocode coordinates to city name using OpenStreetMap Nominatim
 */
export async function geocodeToCity(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.state || DEFAULT_CITY;
  } catch (error) {
    logger.error('Geocoding error:', error);
    return DEFAULT_CITY;
  }
}

/**
 * Translate weather description to the specified language
 */
export function translateWeatherDesc(desc: string, lang: string): string {
  // Ensure lang is a valid Language enum value
  const language = Object.values(Language).includes(lang as Language) 
    ? (lang as Language) 
    : Language.EN;

  const currentTranslations = get(translationsStore);
  const key = `weather_${desc.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = currentTranslations[key];

  return typeof translation === 'string' ? translation : desc;
}

// ============================================================================
// MAIN WEATHER FUNCTIONS
// ============================================================================

/**
 * Fetch weather data from OpenWeatherMap API
 */
export async function fetchWeather(city: string = DEFAULT_CITY, lang: string = 'en'): Promise<WeatherData> {
  // If no API key, return placeholder data
  if (!OPENWEATHER_API_KEY) {
    logger.warn('Weather API key not configured, returning placeholder data');
    return {
      temp: 20,
      condition: 'Clear',
      icon: '01d',
      city: city,
      timezone: 0,
      timestamp: Date.now()
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: translateWeatherDesc(data.weather[0].description, lang),
      icon: data.weather[0].icon,
      city: data.name,
      timezone: data.timezone || 0,
      timestamp: Date.now()
    };
  } catch (error) {
    logger.error('Weather fetch error:', error);
    // Return placeholder on error
    return {
      temp: 20,
      condition: 'Clear',
      icon: '01d',
      city: city,
      timezone: 0,
      timestamp: Date.now()
    };
  }
}

/**
 * Get weather by geolocation
 */
export async function fetchWeatherByLocation(lang: string = 'en'): Promise<WeatherData> {
  // If no API key, return placeholder data
  if (!OPENWEATHER_API_KEY) {
    logger.warn('Weather API key not configured, returning placeholder data');
    return {
      temp: 20,
      condition: 'Clear',
      icon: '01d',
      city: DEFAULT_CITY,
      timezone: 0,
      timestamp: Date.now()
    };
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to default city
      fetchWeather(DEFAULT_CITY, lang).then(resolve).catch(reject);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await geocodeToCity(position.coords.latitude, position.coords.longitude);
          const weather = await fetchWeather(city, lang);
          resolve(weather);
        } catch (error) {
          // Fallback to default city on error
          const fallbackWeather = await fetchWeather(DEFAULT_CITY, lang);
          resolve(fallbackWeather);
        }
      },
      async (error) => {
        logger.warn('Geolocation error, using default city:', error.message);
        // Fallback to default city on geolocation error
        const fallbackWeather = await fetchWeather(DEFAULT_CITY, lang);
        resolve(fallbackWeather);
      }
    );
  });
}
