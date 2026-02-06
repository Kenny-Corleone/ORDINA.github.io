import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { get } from 'svelte/store';
import { uiStore } from '../stores/uiStore';
import { translations, loadTranslations, setLanguage, t, tArray } from './index';
import { Language } from '../types';

describe('i18n system', () => {
  beforeEach(() => {
    // Reset to default state
    uiStore.reset();
  });

  describe('loadTranslations', () => {
    it('should load English translations', async () => {
      const trans = await loadTranslations(Language.EN);
      expect(trans).toBeDefined();
      expect(trans.appTitle).toBe('ORDINA');
      expect(trans.login).toBe('Sign in');
    });

    it('should load Russian translations', async () => {
      const trans = await loadTranslations(Language.RU);
      expect(trans).toBeDefined();
      expect(trans.appTitle).toBe('ORDINA');
      expect(trans.login).toBe('Войти');
    });

    it('should load Azerbaijani translations', async () => {
      const trans = await loadTranslations(Language.AZ);
      expect(trans).toBeDefined();
      expect(trans.appTitle).toBe('ORDINA');
      expect(trans.login).toBe('Daxil ol');
    });

    it('should load Italian translations', async () => {
      const trans = await loadTranslations(Language.IT);
      expect(trans).toBeDefined();
      expect(trans.appTitle).toBe('ORDINA');
      expect(trans.login).toBe('Accedi');
    });

    it('should cache translations', async () => {
      const trans1 = await loadTranslations(Language.EN);
      const trans2 = await loadTranslations(Language.EN);
      expect(trans1).toBe(trans2); // Same reference = cached
    });
  });

  describe('translations store', () => {
    it('should provide translations based on current language', async () => {
      // Set language to Russian
      setLanguage(Language.RU);
      
      // Wait for translations to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const trans = get(translations);
      expect(trans.login).toBe('Войти');
    });

    it('should update when language changes', async () => {
      // Start with English
      setLanguage(Language.EN);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let trans = get(translations);
      expect(trans.login).toBe('Sign in');
      
      // Change to Italian
      setLanguage(Language.IT);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      trans = get(translations);
      expect(trans.login).toBe('Accedi');
    });
  });

  describe('t function', () => {
    it('should return translation for valid key', async () => {
      const trans = await loadTranslations(Language.EN);
      expect(t(trans, 'login')).toBe('Sign in');
    });

    it('should return key if translation not found', async () => {
      const trans = await loadTranslations(Language.EN);
      expect(t(trans, 'nonexistent')).toBe('nonexistent');
    });

    it('should return fallback if provided and key not found', async () => {
      const trans = await loadTranslations(Language.EN);
      expect(t(trans, 'nonexistent', 'Fallback')).toBe('Fallback');
    });

    it('should warn if key is an array', async () => {
      const trans = await loadTranslations(Language.EN);
      const result = t(trans, 'months', 'Fallback');
      expect(result).toBe('Fallback');
    });
  });

  describe('tArray function', () => {
    it('should return translation array for valid key', async () => {
      const trans = await loadTranslations(Language.EN);
      const months = tArray(trans, 'months');
      expect(Array.isArray(months)).toBe(true);
      expect(months.length).toBe(12);
      expect(months[0]).toBe('January');
    });

    it('should return empty array if translation not found', async () => {
      const trans = await loadTranslations(Language.EN);
      expect(tArray(trans, 'nonexistent')).toEqual([]);
    });

    it('should return fallback if provided and key not found', async () => {
      const trans = await loadTranslations(Language.EN);
      expect(tArray(trans, 'nonexistent', ['Fallback'])).toEqual(['Fallback']);
    });
  });

  describe('setLanguage', () => {
    it('should update language in uiStore', () => {
      setLanguage(Language.RU);
      const state = get(uiStore);
      expect(state.language).toBe(Language.RU);
    });

    it('should persist language to localStorage', () => {
      setLanguage(Language.AZ);
      expect(localStorage.getItem('language')).toBe(Language.AZ);
    });
  });

  // Feature: ordina-svelte-migration, Property 18: Translation Application
  describe('Property 18: Translation Application', () => {
    it('should update all UI text for any language change', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(Language.EN, Language.RU, Language.AZ, Language.IT),
          fc.constantFrom(Language.EN, Language.RU, Language.AZ, Language.IT),
          async (lang1, lang2) => {
            // Set first language
            setLanguage(lang1);
            
            const trans1 = await loadTranslations(lang1);
            const storeValue1 = get(translations);
            
            // Verify translations loaded for first language
            const key1 = 'login';
            const expected1 = trans1[key1];
            const actual1 = storeValue1[key1];
            
            if (expected1 !== actual1) {
              return false;
            }
            
            // Change to second language
            setLanguage(lang2);
            
            const trans2 = await loadTranslations(lang2);
            const storeValue2 = get(translations);
            
            // Verify translations updated for second language
            const expected2 = trans2[key1];
            const actual2 = storeValue2[key1];
            
            return expected2 === actual2;
          }
        ),
        { numRuns: 25 }
      );
    }, 15000);

    it('should maintain translation consistency across multiple keys', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(Language.EN, Language.RU, Language.AZ, Language.IT),
          async (language) => {
            setLanguage(language);
            
            const trans = await loadTranslations(language);
            const storeValue = get(translations);
            
            // Test multiple common keys
            const testKeys = ['login', 'logout', 'save', 'cancel', 'delete', 'add'];
            
            for (const key of testKeys) {
              if (trans[key] !== storeValue[key]) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should handle array translations correctly for any language', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(Language.EN, Language.RU, Language.AZ, Language.IT),
          async (language) => {
            setLanguage(language);
            
            const trans = await loadTranslations(language);
            const storeValue = get(translations);
            
            // Test array keys
            const arrayKeys = ['months', 'weekdays', 'weekdaysFull'];
            
            for (const key of arrayKeys) {
              const expected = trans[key];
              const actual = storeValue[key];
              
              if (!Array.isArray(expected) || !Array.isArray(actual)) {
                return false;
              }
              
              if (expected.length !== actual.length) {
                return false;
              }
              
              for (let i = 0; i < expected.length; i++) {
                if (expected[i] !== actual[i]) {
                  return false;
                }
              }
            }
            
            return true;
          }
        ),
        { numRuns: 25 }
      );
    }, 15000);
  });
});
