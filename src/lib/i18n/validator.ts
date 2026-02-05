import { Language } from '../types';
import localeEn from '../../locales/locale-en.json';
import localeRu from '../../locales/locale-ru.json';
import localeAz from '../../locales/locale-az.json';
import localeIt from '../../locales/locale-it.json';

export interface TranslationIssue {
  locale: string;
  type: 'missing' | 'extra' | 'type_mismatch';
  key: string;
  details?: string;
}

/**
 * Validate all locale files against the base English locale
 * @returns Array of translation issues found
 */
export function validateTranslations(): TranslationIssue[] {
  const issues: TranslationIssue[] = [];
  
  // Use English as the base locale
  const baseLocale = localeEn as Record<string, unknown>;
  const baseKeys = Object.keys(baseLocale);
  
  // Locales to validate
  const locales = {
    [Language.RU]: localeRu as Record<string, unknown>,
    [Language.AZ]: localeAz as Record<string, unknown>,
    [Language.IT]: localeIt as Record<string, unknown>,
  };
  
  // Check each locale
  for (const [localeName, locale] of Object.entries(locales)) {
    const localeKeys = Object.keys(locale);
    
    // Check for missing keys
    for (const key of baseKeys) {
      if (!(key in locale)) {
        issues.push({
          locale: localeName,
          type: 'missing',
          key,
          details: `Key "${key}" exists in English but missing in ${localeName}`,
        });
      } else {
        // Check for type mismatches (array vs string)
        const baseValue = baseLocale[key];
        const localeValue = locale[key];
        
        if (Array.isArray(baseValue) !== Array.isArray(localeValue)) {
          issues.push({
            locale: localeName,
            type: 'type_mismatch',
            key,
            details: `Type mismatch: "${key}" is ${Array.isArray(baseValue) ? 'array' : 'string'} in English but ${Array.isArray(localeValue) ? 'array' : 'string'} in ${localeName}`,
          });
        }
        
        // Check array lengths
        if (Array.isArray(baseValue) && Array.isArray(localeValue)) {
          if (baseValue.length !== localeValue.length) {
            issues.push({
              locale: localeName,
              type: 'type_mismatch',
              key,
              details: `Array length mismatch: "${key}" has ${baseValue.length} items in English but ${localeValue.length} items in ${localeName}`,
            });
          }
        }
      }
    }
    
    // Check for extra keys (keys in locale but not in base)
    for (const key of localeKeys) {
      if (!(key in baseLocale)) {
        issues.push({
          locale: localeName,
          type: 'extra',
          key,
          details: `Key "${key}" exists in ${localeName} but not in English`,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Log translation validation issues to console
 */
export function logTranslationIssues(): void {
  const issues = validateTranslations();
  
  if (issues.length === 0) {
    console.log('✅ All translations are valid and complete!');
    return;
  }
  
  console.warn(`⚠️ Found ${issues.length} translation issue(s):`);
  
  // Group by locale
  const byLocale = issues.reduce((acc, issue) => {
    if (!acc[issue.locale]) {
      acc[issue.locale] = [];
    }
    acc[issue.locale].push(issue);
    return acc;
  }, {} as Record<string, TranslationIssue[]>);
  
  // Log by locale
  for (const [locale, localeIssues] of Object.entries(byLocale)) {
    console.group(`${locale} (${localeIssues.length} issues)`);
    
    const missing = localeIssues.filter(i => i.type === 'missing');
    const extra = localeIssues.filter(i => i.type === 'extra');
    const typeMismatch = localeIssues.filter(i => i.type === 'type_mismatch');
    
    if (missing.length > 0) {
      console.warn(`Missing keys (${missing.length}):`, missing.map(i => i.key));
    }
    
    if (extra.length > 0) {
      console.warn(`Extra keys (${extra.length}):`, extra.map(i => i.key));
    }
    
    if (typeMismatch.length > 0) {
      console.warn(`Type mismatches (${typeMismatch.length}):`);
      typeMismatch.forEach(i => console.warn(`  - ${i.details}`));
    }
    
    console.groupEnd();
  }
}

/**
 * Get missing keys for a specific locale
 * @param locale - The locale to check
 * @returns Array of missing keys
 */
export function getMissingKeys(locale: Language): string[] {
  const issues = validateTranslations();
  return issues
    .filter(i => i.locale === locale && i.type === 'missing')
    .map(i => i.key);
}

/**
 * Check if all translations are complete
 * @returns true if all translations are complete, false otherwise
 */
export function areTranslationsComplete(): boolean {
  const issues = validateTranslations();
  return issues.length === 0;
}
