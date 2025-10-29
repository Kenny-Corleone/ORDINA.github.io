/**
 * Система переводов
 */

import { ru } from './ru.js';
import { en } from './en.js';
import { az } from './az.js';

export const translations = {
  ru,
  en,
  az
};

let currentLanguage = 'ru';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
  }
}

export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
