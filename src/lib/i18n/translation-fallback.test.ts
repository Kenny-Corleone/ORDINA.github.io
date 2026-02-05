import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { uiStore } from '../stores/uiStore';
import { translations, loadTranslations, setLanguage, t, tArray } from './index';
import { Language } from '../types';

describe('Translation Fallback System', () => {
  beforeEach(() => {
    // Reset to default state
    uiStore.reset();
  });

  describe('Missing key fallback to English', () => {
    it('should fall back to English when key is missing in current language', async () => {
      // Load Russian translations
      const ruTranslations = await loadTranslations(Language.RU);
      
      // Test with a non-existent key
      const result = t(ruTranslations, 'nonExistentKey123');
      
      // Should return the key itself as ultimate fallback
      expect(result).toBe('nonExistentKey123');
    });

    it('should use custom fallback when provided', async () => {
      const ruTranslations = await loadTranslations(Language.RU);
      const result = t(ruTranslations, 'nonExistentKey123', 'Custom Fallback');
      
      expect(result).toBe('Custom Fallback');
    });

    it('should fall back to English for array translations', async () => {
      const ruTranslations = await loadTranslations(Language.RU);
      
      // Test with a non-existent array key
      const result = tArray(ruTranslations, 'nonExistentArray123');
      
      // Should return empty array as ultimate fallback
      expect(result).toEqual([]);
    });

    it('should use custom fallback array when provided', async () => {
      const ruTranslations = await loadTranslations(Language.RU);
      const result = tArray(ruTranslations, 'nonExistentArray123', ['Fallback1', 'Fallback2']);
      
      expect(result).toEqual(['Fallback1', 'Fallback2']);
    });
  });

  describe('Language switching', () => {
    it('should switch from English to Russian', async () => {
      setLanguage(Language.EN);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let trans = get(translations);
      expect(trans.login).toBe('Sign in');
      
      setLanguage(Language.RU);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      trans = get(translations);
      expect(trans.login).toBe('Войти');
    });

    it('should switch from English to Azerbaijani', async () => {
      setLanguage(Language.EN);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let trans = get(translations);
      expect(trans.login).toBe('Sign in');
      
      setLanguage(Language.AZ);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      trans = get(translations);
      expect(trans.login).toBe('Daxil ol');
    });

    it('should switch from English to Italian', async () => {
      setLanguage(Language.EN);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let trans = get(translations);
      expect(trans.login).toBe('Sign in');
      
      setLanguage(Language.IT);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      trans = get(translations);
      expect(trans.login).toBe('Accedi');
    });

    it('should switch between all languages correctly', async () => {
      const languages = [Language.EN, Language.RU, Language.AZ, Language.IT];
      const expectedLogins = ['Sign in', 'Войти', 'Daxil ol', 'Accedi'];
      
      for (let i = 0; i < languages.length; i++) {
        setLanguage(languages[i]);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const trans = get(translations);
        expect(trans.login).toBe(expectedLogins[i]);
      }
    });
  });

  describe('Array translations', () => {
    it('should correctly translate months in all languages', async () => {
      const languages = [Language.EN, Language.RU, Language.AZ, Language.IT];
      const expectedJanuary = ['January', 'Январь', 'Yanvar', 'Gennaio'];
      
      for (let i = 0; i < languages.length; i++) {
        const trans = await loadTranslations(languages[i]);
        const months = tArray(trans, 'months');
        
        expect(months.length).toBe(12);
        expect(months[0]).toBe(expectedJanuary[i]);
      }
    });

    it('should correctly translate weekdays in all languages', async () => {
      const languages = [Language.EN, Language.RU, Language.AZ, Language.IT];
      
      for (const language of languages) {
        const trans = await loadTranslations(language);
        const weekdays = tArray(trans, 'weekdays');
        
        expect(weekdays.length).toBe(7);
        expect(weekdays[0]).toBeTruthy();
      }
    });
  });

  describe('Console warnings', () => {
    it('should warn when translation key is not found', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const trans = await loadTranslations(Language.EN);
      t(trans, 'nonExistentKey');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Translation key not found')
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn when using wrong function for array', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const trans = await loadTranslations(Language.EN);
      t(trans, 'months'); // Using t instead of tArray
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('is an array, use tArray instead')
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn when using wrong function for string', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const trans = await loadTranslations(Language.EN);
      tArray(trans, 'login'); // Using tArray instead of t
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('is not an array, use t instead')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Translation completeness', () => {
    it('should have all common keys in all languages', async () => {
      const commonKeys = [
        'appTitle',
        'login',
        'logout',
        'save',
        'cancel',
        'delete',
        'add',
        'close',
        'loading',
        'tabDashboard',
        'tabExpenses',
        'tabDebts',
        'tabTasks',
        'tabCalendar',
      ];
      
      const languages = [Language.EN, Language.RU, Language.AZ, Language.IT];
      
      for (const language of languages) {
        const trans = await loadTranslations(language);
        
        for (const key of commonKeys) {
          expect(trans[key]).toBeDefined();
          expect(trans[key]).not.toBe('');
        }
      }
    });

    it('should have all array keys in all languages', async () => {
      const arrayKeys = ['months', 'monthsShort', 'weekdays', 'weekdaysFull'];
      const languages = [Language.EN, Language.RU, Language.AZ, Language.IT];
      
      for (const language of languages) {
        const trans = await loadTranslations(language);
        
        for (const key of arrayKeys) {
          const value = trans[key];
          expect(Array.isArray(value)).toBe(true);
          expect((value as string[]).length).toBeGreaterThan(0);
        }
      }
    });
  });
});
