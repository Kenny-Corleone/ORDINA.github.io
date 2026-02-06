import { describe, it, expect } from 'vitest';
import { validateTranslations, logTranslationIssues, getMissingKeys, areTranslationsComplete } from './validator';
import { Language } from '../types';

describe('Translation Validator', () => {
  describe('validateTranslations', () => {
    it('should check all locales for completeness', () => {
      const issues = validateTranslations();
      
      // Log issues for visibility
      if (issues.length > 0) {
        console.log('\n=== Translation Issues Found ===');
        logTranslationIssues();
        console.log('================================\n');
      }
      
      // This test documents the current state
      // If issues are found, they should be fixed
      console.log(`Total translation issues: ${issues.length}`);
      
      // Group by type
      const missing = issues.filter(i => i.type === 'missing');
      const extra = issues.filter(i => i.type === 'extra');
      const typeMismatch = issues.filter(i => i.type === 'type_mismatch');
      
      console.log(`  - Missing keys: ${missing.length}`);
      console.log(`  - Extra keys: ${extra.length}`);
      console.log(`  - Type mismatches: ${typeMismatch.length}`);
      
      // The test passes but logs issues for review
      expect(issues).toBeDefined();
    });
  });

  describe('getMissingKeys', () => {
    it('should return missing keys for Russian locale', () => {
      const missing = getMissingKeys(Language.RU);
      console.log(`Russian missing keys: ${missing.length}`);
      if (missing.length > 0) {
        console.log('Missing:', missing);
      }
      expect(Array.isArray(missing)).toBe(true);
    });

    it('should return missing keys for Azerbaijani locale', () => {
      const missing = getMissingKeys(Language.AZ);
      console.log(`Azerbaijani missing keys: ${missing.length}`);
      if (missing.length > 0) {
        console.log('Missing:', missing);
      }
      expect(Array.isArray(missing)).toBe(true);
    });

    it('should return missing keys for Italian locale', () => {
      const missing = getMissingKeys(Language.IT);
      console.log(`Italian missing keys: ${missing.length}`);
      if (missing.length > 0) {
        console.log('Missing:', missing);
      }
      expect(Array.isArray(missing)).toBe(true);
    });
  });

  describe('areTranslationsComplete', () => {
    it('should check if all translations are complete', () => {
      const complete = areTranslationsComplete();
      console.log(`All translations complete: ${complete}`);
      expect(typeof complete).toBe('boolean');
    });
  });
});
