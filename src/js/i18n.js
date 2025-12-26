import { logger, getCached, $$ } from './utils.js';

// ============================================================================
// TRANSLATION STATE
// ============================================================================

import ru from '../locales/locale-ru.json';
import en from '../locales/locale-en.json';
import az from '../locales/locale-az.json';
import it from '../locales/locale-it.json';

export let translations = { ru, en, az, it };
export let currentLang = localStorage.getItem('appLanguage') || 'ru';

// ============================================================================
// TRANSLATION LOADING
// ============================================================================

export async function loadTranslations() {
    console.log('i18n.js: loadTranslations called (New Version)');
    // Translations are already loaded via import
    if (currentLang) {
        applyDynamicTranslations();
    }
}

export function applyDynamicTranslations() {
    const t = translations[currentLang];
    if (!t) return;

    // textContent translations - use cached selectors
    $$('[data-i18n]').forEach(el => {
        if (el.closest('#lang-menu') || el.classList.contains('language-dropdown-item') || el.classList.contains('flag')) return;
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });

    // Placeholder translations
    $$('[data-placeholder-i18n]').forEach(el => {
        const key = el.dataset.placeholderI18n;
        if (t[key]) el.placeholder = t[key];
    });

    // Legacy placeholders - use cached
    const wc = getCached('weather-city-input');
    if (wc && t.weatherCityPlaceholder) wc.placeholder = t.weatherCityPlaceholder;
    const ws = getCached('weather-search-input');
    if (ws && t.weatherCitySearchPlaceholder) ws.placeholder = t.weatherCitySearchPlaceholder;
    const loc = getCached('weather-location-btn');
    if (loc && t.weatherGeoTitle) loc.title = t.weatherGeoTitle;

    const ns = getCached('news-search');
    if (ns && t.newsSearchPlaceholder) ns.placeholder = t.newsSearchPlaceholder;

    const ncs = getCached('news-category');
    if (ncs) {
        ncs.querySelectorAll('option[data-i18n-option]').forEach(opt => {
            const key = opt.dataset.i18nOption;
            if (t[key]) {
                // Используем перевод напрямую, так как он уже содержит эмодзи
                opt.textContent = t[key];
            }
        });
    }

    const nrb = getCached('news-refresh');
    if (nrb && t.newsRefresh) nrb.title = t.newsRefresh;
}

export const setLanguage = (lang, callback) => {
    if (!translations[lang] || Object.keys(translations[lang]).length === 0) {
        // If translations not loaded yet, wait a bit and try again
        setTimeout(() => {
            if (translations[lang] && Object.keys(translations[lang]).length > 0) {
                setLanguage(lang, callback);
            }
        }, 100);
        return;
    }
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang;
    applyDynamicTranslations();
    if (callback) callback();
};
