import { derived, type Readable } from 'svelte/store';
import { uiStore } from '../stores/uiStore';
import { Language } from '../types';

// Translation type
export type Translations = Record<string, string | string[]>;

// Static locale imports (eliminates async timing flakiness in tests and improves determinism)
import localeEn from '../../locales/locale-en.json';
import localeRu from '../../locales/locale-ru.json';
import localeAz from '../../locales/locale-az.json';
import localeIt from '../../locales/locale-it.json';

// Export validator functions
export { 
  validateTranslations, 
  logTranslationIssues, 
  getMissingKeys, 
  areTranslationsComplete,
  type TranslationIssue 
} from './validator';

// Cache for loaded translations
const translationsCache: Map<Language, Translations> = new Map();

export function resolveTranslations(language: Language): Translations {
  if (translationsCache.has(language)) {
    return translationsCache.get(language)!;
  }

  let translations: Translations;
  switch (language) {
    case Language.EN:
      translations = localeEn as unknown as Translations;
      break;
    case Language.RU:
      translations = localeRu as unknown as Translations;
      break;
    case Language.AZ:
      translations = localeAz as unknown as Translations;
      break;
    case Language.IT:
      translations = localeIt as unknown as Translations;
      break;
    default:
      translations = localeEn as unknown as Translations;
  }

  translationsCache.set(language, translations);
  return translations;
}

/**
 * Load translations for a specific language
 * @param language - The language to load translations for
 * @returns Promise resolving to the translations object
 */
export async function loadTranslations(language: Language): Promise<Translations> {
  try {
    return resolveTranslations(language);
  } catch (error) {
    console.error(`Failed to load translations for language: ${language}`, error);
    // Return empty object as fallback
    return {};
  }
}

/**
 * Preload all translations to avoid async loading during runtime
 */
export async function preloadAllTranslations(): Promise<void> {
  await Promise.all([
    loadTranslations(Language.EN),
    loadTranslations(Language.RU),
    loadTranslations(Language.AZ),
    loadTranslations(Language.IT),
  ]);
}

/**
 * Derived store that provides current translations based on selected language
 */
export const translations: Readable<Translations> = derived(
  uiStore,
  ($uiStore, set) => {
    // Synchronous update is important for tests and for deterministic UI updates.
    set(resolveTranslations($uiStore.language));
  },
  {} as Translations // Initial value
);

/**
 * Get a translation by key with automatic fallback to English
 * @param key - The translation key
 * @param fallback - Optional fallback value if key not found
 * @returns The translated string or fallback
 */
export function t(translationsObj: Translations, key: string, fallback?: string): string {
  const value = translationsObj[key];
  
  if (value === undefined) {
    console.warn(`⚠️ Translation key not found: "${key}" - falling back to English`);
    
    // Try to get English translation as fallback
    const englishTranslations = resolveTranslations(Language.EN);
    const englishValue = englishTranslations[key];
    
    if (englishValue !== undefined && !Array.isArray(englishValue)) {
      return englishValue;
    }
    
    // If no English translation or custom fallback provided, use that
    return fallback || key;
  }
  
  if (Array.isArray(value)) {
    console.warn(`⚠️ Translation key "${key}" is an array, use tArray instead`);
    return fallback || key;
  }
  
  return value;
}

/**
 * Get a translation array by key with automatic fallback to English (for arrays like months, weekdays)
 * @param key - The translation key
 * @param fallback - Optional fallback array if key not found
 * @returns The translated array or fallback
 */
export function tArray(translationsObj: Translations, key: string, fallback?: string[]): string[] {
  const value = translationsObj[key];
  
  if (value === undefined) {
    console.warn(`⚠️ Translation key not found: "${key}" - falling back to English`);
    
    // Try to get English translation as fallback
    const englishTranslations = resolveTranslations(Language.EN);
    const englishValue = englishTranslations[key];
    
    if (englishValue !== undefined && Array.isArray(englishValue)) {
      return englishValue;
    }
    
    // If no English translation or custom fallback provided, use that
    return fallback || [];
  }
  
  if (!Array.isArray(value)) {
    console.warn(`⚠️ Translation key "${key}" is not an array, use t instead`);
    return fallback || [];
  }
  
  return value;
}

/**
 * Set the application language
 * @param language - The language to set
 */
export function setLanguage(language: Language): void {
  uiStore.setLanguage(language);
}

/**
 * Get the current language
 * @returns The current language from the store
 */
export function getCurrentLanguage(): Language {
  let currentLanguage: Language = Language.EN;
  
  const unsubscribe = uiStore.subscribe(state => {
    currentLanguage = state.language;
  });
  
  unsubscribe();
  return currentLanguage;
}
