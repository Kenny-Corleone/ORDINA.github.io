/**
 * Formatters Module
 * 
 * Provides formatting functions for currency, dates, numbers, and other data types.
 * Supports multiple languages and currencies.
 * 
 * @module utils/formatters
 */

import { EXCHANGE_RATE } from '../config.js';
import { translations } from '../translations.js';

/**
 * Current currency setting
 * @type {string}
 */
export let currentCurrency = localStorage.getItem('currency') || 'AZN';

/**
 * Current language setting
 * @type {string}
 */
export let currentLang = localStorage.getItem('appLanguage') || 'ru';

/**
 * Set current currency
 * 
 * @param {string} currency - Currency code ('AZN' or 'USD')
 */
export function setCurrentCurrency(currency) {
    currentCurrency = currency;
    localStorage.setItem('currency', currency);
}

/**
 * Set current language
 * 
 * @param {string} lang - Language code ('ru', 'en', or 'az')
 */
export function setCurrentLang(lang) {
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
}

/**
 * Format currency amount with symbol
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency override (optional)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(100) // "100.00 AZN"
 * formatCurrency(100, 'USD') // "58.82 $"
 */
export function formatCurrency(amount, currency = null) {
    if (typeof amount !== 'number') amount = 0;
    
    const targetCurrency = currency || currentCurrency;
    const value = targetCurrency === 'USD' ? amount / EXCHANGE_RATE : amount;
    const symbol = targetCurrency === 'USD' ? '$' : 'AZN';
    
    return `${value.toFixed(2)} ${symbol}`;
}

/**
 * Format number with thousands separator
 * 
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 * 
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.5678, 2) // "1,234.57"
 */
export function formatNumber(num, decimals = 0) {
    if (typeof num !== 'number') return '0';
    
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format percentage
 * 
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 * 
 * @example
 * formatPercentage(0.1234) // "12.3%"
 * formatPercentage(0.5, 0) // "50%"
 */
export function formatPercentage(value, decimals = 1) {
    if (typeof value !== 'number') return '0%';
    
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format ISO date string for display
 * 
 * @param {string} isoString - ISO date string (YYYY-MM-DD)
 * @param {Object} options - Formatting options
 * @param {boolean} options.year - Include year (default: false)
 * @param {boolean} options.short - Use short month names (default: false)
 * @returns {string} Formatted date string
 * 
 * @example
 * formatISODateForDisplay('2024-03-15') // "15 марта"
 * formatISODateForDisplay('2024-03-15', { year: true }) // "15 марта 2024"
 */
export function formatISODateForDisplay(isoString, options = {}) {
    if (!isoString || typeof isoString !== 'string' || !isoString.includes('-')) {
        return '—';
    }
    
    const [year, month, day] = isoString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const defaultOptions = { 
        day: 'numeric', 
        month: options.short ? 'short' : 'long'
    };
    
    if (options.year) {
        defaultOptions.year = 'numeric';
    }
    
    const locale = currentLang === 'ru' ? 'ru-RU' : 
                   (currentLang === 'az' ? 'az-Latn-AZ' : 'en-US');
    
    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
}

/**
 * Format month ID (YYYY-MM) for display
 * 
 * @param {string} monthId - Month ID in format YYYY-MM
 * @returns {string} Formatted month string
 * 
 * @example
 * formatMonthId('2024-03') // "Март 2024"
 */
export function formatMonthId(monthId) {
    if (!monthId) return '';
    
    const [year, month] = monthId.split('-');
    const monthIndex = parseInt(month) - 1;
    
    if (!translations[currentLang] || !translations[currentLang].months) {
        return monthId;
    }
    
    const monthName = translations[currentLang].months[monthIndex];
    return `${monthName} ${year}`;
}

/**
 * Format date object to ISO string (YYYY-MM-DD)
 * 
 * @param {Date} date - Date object
 * @returns {string} ISO date string
 * 
 * @example
 * formatDateToISO(new Date(2024, 2, 15)) // "2024-03-15"
 */
export function formatDateToISO(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Format time from Date object
 * 
 * @param {Date} date - Date object
 * @param {boolean} includeSeconds - Include seconds (default: false)
 * @returns {string} Formatted time string
 * 
 * @example
 * formatTime(new Date(2024, 2, 15, 14, 30)) // "14:30"
 * formatTime(new Date(2024, 2, 15, 14, 30, 45), true) // "14:30:45"
 */
export function formatTime(date, includeSeconds = false) {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (includeSeconds) {
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    return `${hours}:${minutes}`;
}

/**
 * Format datetime for display
 * 
 * @param {Date|string} datetime - Date object or ISO string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted datetime string
 * 
 * @example
 * formatDateTime(new Date()) // "15 марта 2024, 14:30"
 */
export function formatDateTime(datetime, options = {}) {
    let date;
    
    if (typeof datetime === 'string') {
        date = new Date(datetime);
    } else if (datetime instanceof Date) {
        date = datetime;
    } else {
        return '';
    }
    
    if (isNaN(date)) return '';
    
    const locale = currentLang === 'ru' ? 'ru-RU' : 
                   (currentLang === 'az' ? 'az-Latn-AZ' : 'en-US');
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleString(locale, { ...defaultOptions, ...options });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * 
 * @param {Date|string} datetime - Date object or ISO string
 * @returns {string} Relative time string
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 час назад"
 */
export function formatRelativeTime(datetime) {
    let date;
    
    if (typeof datetime === 'string') {
        date = new Date(datetime);
    } else if (datetime instanceof Date) {
        date = datetime;
    } else {
        return '';
    }
    
    if (isNaN(date)) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    const labels = {
        ru: {
            justNow: 'только что',
            secondsAgo: (n) => `${n} ${n === 1 ? 'секунду' : n < 5 ? 'секунды' : 'секунд'} назад`,
            minutesAgo: (n) => `${n} ${n === 1 ? 'минуту' : n < 5 ? 'минуты' : 'минут'} назад`,
            hoursAgo: (n) => `${n} ${n === 1 ? 'час' : n < 5 ? 'часа' : 'часов'} назад`,
            daysAgo: (n) => `${n} ${n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'} назад`
        },
        en: {
            justNow: 'just now',
            secondsAgo: (n) => `${n} second${n !== 1 ? 's' : ''} ago`,
            minutesAgo: (n) => `${n} minute${n !== 1 ? 's' : ''} ago`,
            hoursAgo: (n) => `${n} hour${n !== 1 ? 's' : ''} ago`,
            daysAgo: (n) => `${n} day${n !== 1 ? 's' : ''} ago`
        },
        az: {
            justNow: 'indicə',
            secondsAgo: (n) => `${n} saniyə əvvəl`,
            minutesAgo: (n) => `${n} dəqiqə əvvəl`,
            hoursAgo: (n) => `${n} saat əvvəl`,
            daysAgo: (n) => `${n} gün əvvəl`
        }
    };
    
    const lang = labels[currentLang] || labels.en;
    
    if (diffSec < 10) return lang.justNow;
    if (diffSec < 60) return lang.secondsAgo(diffSec);
    if (diffMin < 60) return lang.minutesAgo(diffMin);
    if (diffHour < 24) return lang.hoursAgo(diffHour);
    if (diffDay < 30) return lang.daysAgo(diffDay);
    
    return formatISODateForDisplay(formatDateToISO(date));
}

/**
 * Format file size in human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 * 
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 */
export function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 * 
 * @example
 * truncateText('Hello World', 8) // "Hello..."
 */
export function truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
}
