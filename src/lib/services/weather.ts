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

const OPENWEATHER_API_KEY = "91b705287b193e8debf755a8ff4cb0c7";
const DEFAULT_CITY = 'Baku';

if (!OPENWEATHER_API_KEY && import.meta.env.DEV) {
  logger.warn('VITE_OPENWEATHER_API_KEY is not set. Weather features may not work.');
}

// ============================================================================
// WEATHER ICON MAPPING (SVG paths)
// ============================================================================

export const weatherIcons: WeatherIconMap = {
  // Clear Day (Solid Sun)
  '01d': '<path fill="currentColor" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />',
  // Clear Night (Solid Moon)
  '01n': '<path fill="currentColor" fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />',
  // Clouds (Solid Cloud)
  '02d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z" />',
  '02n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z" />',
  '03d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z" />',
  '03n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z" />',
  '04d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z" />',
  '04n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z" />',
  // Rain
  '09d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M8 21v2 M12 21v2 M16 21v2" />',
  '09n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M8 21v2 M12 21v2 M16 21v2" />',
  '10d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M10 21l-2 3 M14 21l-2 3" />',
  '10n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M10 21l-2 3 M14 21l-2 3" />',
  '11d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M12 21l-2 2l2 0l-1 2" />',
  '11n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M12 21l-2 2l2 0l-1 2" />',
  '13d': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M9 21h1 M12 21h1 M15 21h1" />',
  '13n': '<path fill="currentColor" d="M15.75 19.5h-9a5.25 5.25 0 111.458-10.297A7.5 7.5 0 0121.043 12.09c.21.696.326 1.42.326 2.16a5.25 5.25 0 01-5.619 5.25z M9 21h1 M12 21h1 M15 21h1" />',
  '50d': '<path fill="currentColor" d="M3 15h18M3 9h18M3 21h18" stroke-width="2" stroke-linecap="round" stroke="currentColor"/>',
  '50n': '<path fill="currentColor" d="M3 15h18M3 9h18M3 21h18" stroke-width="2" stroke-linecap="round" stroke="currentColor"/>'
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
