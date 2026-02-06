// ============================================================================
// NEWS SERVICE TESTS - Unit Tests for RSS Feed Integration
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchNews, type NewsArticle, type NewsCategory } from './news';

describe('News Service - RSS Feed Integration', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  describe('fetchNews', () => {
    it('should fetch news articles for Russian language', async () => {
      const articles = await fetchNews('ru', 'all');
      
      // Should return an array
      expect(Array.isArray(articles)).toBe(true);
      
      // If articles are returned, they should have the correct structure
      if (articles.length > 0) {
        const article = articles[0];
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('desc');
        expect(article).toHaveProperty('url');
        expect(article).toHaveProperty('source');
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('image');
        expect(article).toHaveProperty('categories');
        
        // Validate types
        expect(typeof article.title).toBe('string');
        expect(typeof article.desc).toBe('string');
        expect(typeof article.url).toBe('string');
        expect(typeof article.source).toBe('string');
        expect(typeof article.publishedAt).toBe('string');
        expect(Array.isArray(article.categories)).toBe(true);
      }
    }, 30000); // 30 second timeout for network requests

    it('should fetch news articles for English language', async () => {
      const articles = await fetchNews('en', 'all');
      
      expect(Array.isArray(articles)).toBe(true);
      
      if (articles.length > 0) {
        const article = articles[0];
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('url');
        expect(typeof article.title).toBe('string');
        expect(typeof article.url).toBe('string');
      }
    }, 30000);

    it('should fetch news articles for Azerbaijani language', async () => {
      const articles = await fetchNews('az', 'all');
      
      expect(Array.isArray(articles)).toBe(true);
      
      if (articles.length > 0) {
        const article = articles[0];
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('url');
      }
    }, 30000);

    it('should fetch news articles for Italian language', async () => {
      const articles = await fetchNews('it', 'all');
      
      expect(Array.isArray(articles)).toBe(true);
      
      if (articles.length > 0) {
        const article = articles[0];
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('url');
      }
    }, 30000);

    it('should handle technology category', async () => {
      const articles = await fetchNews('en', 'technology');
      
      expect(Array.isArray(articles)).toBe(true);
      // Technology category should return articles (or empty array if sources fail)
    }, 30000);

    it('should handle business category', async () => {
      const articles = await fetchNews('en', 'business');
      
      expect(Array.isArray(articles)).toBe(true);
    }, 30000);

    it('should fallback to English when unsupported language is provided', async () => {
      const articles = await fetchNews('unsupported-lang', 'all');
      
      // Should still return an array (fallback to English)
      expect(Array.isArray(articles)).toBe(true);
    }, 30000);

    it('should return empty array when all sources fail', async () => {
      // Mock fetch to always fail
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const articles = await fetchNews('en', 'all');
      
      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBe(0);
      
      // Restore original fetch
      global.fetch = originalFetch;
    }, 30000);

    it('should handle invalid category gracefully', async () => {
      const articles = await fetchNews('en', 'invalid-category' as NewsCategory);
      
      // Should fallback to 'all' category
      expect(Array.isArray(articles)).toBe(true);
    }, 30000);

    it('should return articles with valid URLs', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 0) {
        articles.forEach(article => {
          // URL should be a valid string
          expect(typeof article.url).toBe('string');
          expect(article.url.length).toBeGreaterThan(0);
          
          // URL should start with http or https
          if (article.url) {
            expect(article.url.startsWith('http')).toBe(true);
          }
        });
      }
    }, 30000);

    it('should return articles with non-empty titles', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 0) {
        articles.forEach(article => {
          expect(typeof article.title).toBe('string');
          expect(article.title.length).toBeGreaterThan(0);
        });
      }
    }, 30000);

    it('should handle image URLs correctly', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 0) {
        articles.forEach(article => {
          // Image can be empty string or valid URL
          expect(typeof article.image).toBe('string');
          
          if (article.image) {
            // If image exists, it should be a valid URL
            expect(
              article.image.startsWith('http://') || 
              article.image.startsWith('https://')
            ).toBe(true);
          }
        });
      }
    }, 30000);

    it('should return articles sorted by date (newest first)', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 1) {
        // Check if articles are sorted by date (newest first)
        for (let i = 0; i < articles.length - 1; i++) {
          const date1 = new Date(articles[i].publishedAt);
          const date2 = new Date(articles[i + 1].publishedAt);
          
          // date1 should be >= date2 (newer or equal)
          expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
        }
      }
    }, 30000);
  });

  describe('Edge Cases', () => {
    it('should handle empty language parameter', async () => {
      const articles = await fetchNews('', 'all');
      
      // Should fallback to English
      expect(Array.isArray(articles)).toBe(true);
    }, 30000);

    it('should handle undefined category', async () => {
      const articles = await fetchNews('en', undefined as any);
      
      // Should fallback to 'all'
      expect(Array.isArray(articles)).toBe(true);
    }, 30000);

    it('should not throw errors on network failures', async () => {
      // This test ensures the service handles errors gracefully
      await expect(fetchNews('en', 'all')).resolves.toBeDefined();
    }, 30000);
  });

  describe('Article Structure Validation', () => {
    it('should return articles with all required fields', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 0) {
        const article = articles[0];
        
        // Required fields
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('desc');
        expect(article).toHaveProperty('url');
        expect(article).toHaveProperty('source');
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('image');
        expect(article).toHaveProperty('categories');
        
        // Type validation
        expect(typeof article.title).toBe('string');
        expect(typeof article.desc).toBe('string');
        expect(typeof article.url).toBe('string');
        expect(typeof article.source).toBe('string');
        expect(typeof article.publishedAt).toBe('string');
        expect(typeof article.image).toBe('string');
        expect(Array.isArray(article.categories)).toBe(true);
      }
    }, 30000);

    it('should sanitize HTML from titles and descriptions', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 0) {
        articles.forEach(article => {
          // Titles and descriptions should not contain HTML tags
          expect(article.title).not.toMatch(/<[^>]*>/);
          expect(article.desc).not.toMatch(/<[^>]*>/);
        });
      }
    }, 30000);

    it('should limit description length', async () => {
      const articles = await fetchNews('en', 'all');
      
      if (articles.length > 0) {
        articles.forEach(article => {
          // Description should be limited to 200 characters
          expect(article.desc.length).toBeLessThanOrEqual(200);
        });
      }
    }, 30000);
  });
});
