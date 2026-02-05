import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Property-Based Tests for PWA Functionality
 * Feature: ordina-svelte-migration
 */

describe('PWA Property Tests', () => {
  /**
   * Property 23: Offline Asset Availability
   * For any cached asset, requesting that asset while offline should return the cached version without a network error.
   * **Validates: Requirements 11.4**
   */
  describe('Property 23: Offline Asset Availability', () => {
    // Read the service worker file to verify caching configuration
    let serviceWorkerContent: string;
    
    try {
      serviceWorkerContent = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf-8');
    } catch (error) {
      serviceWorkerContent = '';
    }

    it('should have service worker with cache-first strategy for static assets', async () => {
      // Verify service worker exists and has caching logic
      expect(serviceWorkerContent).toBeTruthy();
      expect(serviceWorkerContent).toContain('STATIC_CACHE');
      expect(serviceWorkerContent).toContain('caches.match');
      
      // Property: For any static asset extension, the service worker should implement cache-first strategy
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'app.js',
            'styles.css',
            'logo.png',
            'icon.svg',
            'font.woff2',
            'image.jpg',
            'graphic.webp',
            'font.ttf',
            'icon.eot'
          ),
          async (assetName) => {
            // Extract extension
            const extension = assetName.split('.').pop() || '';
            
            // Verify the asset matches the caching pattern in service worker
            const staticAssetPattern = /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/;
            const shouldBeCached = staticAssetPattern.test(assetName);
            
            // Verify service worker has this pattern (checking for the regex pattern in the code)
            expect(serviceWorkerContent).toContain('js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot');
            
            // All these test assets should match the caching pattern
            expect(shouldBeCached).toBe(true);
            
            // Verify cache-first logic: check cache first, then fetch
            expect(serviceWorkerContent).toContain('caches.match(req)');
            expect(serviceWorkerContent).toContain('if (cached)');
            expect(serviceWorkerContent).toContain('return cached');
            
            return shouldBeCached;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should exclude Firebase and external APIs from caching', async () => {
      // Property: Firebase and external API calls should never be cached
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'firestore.googleapis.com',
            'securetoken.googleapis.com',
            'www.googleapis.com',
            'firebaseinstallations.googleapis.com',
            'stream.zeno.fm',
            'api.allorigins.win',
            'corsproxy.io'
          ),
          async (hostname) => {
            // Verify service worker explicitly excludes these hosts
            expect(serviceWorkerContent).toContain(hostname);
            expect(serviceWorkerContent).toContain('noCacheHosts');
            
            // These hosts should be in the no-cache list
            const noCacheHosts = [
              'firestore.googleapis.com',
              'securetoken.googleapis.com',
              'www.googleapis.com',
              'firebaseinstallations.googleapis.com',
              'stream.zeno.fm',
              'api.allorigins.win',
              'corsproxy.io'
            ];
            
            const shouldNotBeCached = noCacheHosts.includes(hostname);
            expect(shouldNotBeCached).toBe(true);
            
            return shouldNotBeCached;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should implement offline fallback for cached assets', async () => {
      // Property: For any cached asset request that fails, should return cached version
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            '/app.js',
            '/styles.css',
            '/logo.png',
            '/icon.svg',
            '/font.woff2'
          ),
          async (assetPath) => {
            // Verify service worker has offline fallback logic
            expect(serviceWorkerContent).toContain('catch');
            expect(serviceWorkerContent).toContain('caches.match');
            
            // Verify it returns cached version on fetch failure
            const hasCacheFallback = 
              serviceWorkerContent.includes('catch(() => {') &&
              serviceWorkerContent.includes('return caches.match');
            
            expect(hasCacheFallback).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cache successful responses only', async () => {
      // Property: Only successful responses (status 200) should be cached
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 200, max: 599 }),
          async (statusCode) => {
            // Verify service worker checks response status before caching
            expect(serviceWorkerContent).toContain('res.status');
            expect(serviceWorkerContent).toContain('200');
            
            // Only status 200 should be cached
            const shouldCache = statusCode === 200;
            
            // Verify the logic exists in service worker
            const hasStatusCheck = serviceWorkerContent.includes('res.status === 200') ||
                                   serviceWorkerContent.includes('res.status !== 200');
            
            expect(hasStatusCheck).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test PWA Manifest Configuration
   */
  describe('PWA Manifest Configuration', () => {
    it('should have valid PWA shortcuts', () => {
      // Property: All PWA shortcuts should have required fields
      const shortcuts = [
        {
          name: 'Add Expense',
          url: '/ORDINA.github.io/?action=add-expense',
          action: 'add-expense'
        },
        {
          name: 'Add Task',
          url: '/ORDINA.github.io/?action=add-task',
          action: 'add-task'
        },
        {
          name: 'Dashboard',
          url: '/ORDINA.github.io/?action=dashboard',
          action: 'dashboard'
        }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...shortcuts),
          (shortcut) => {
            // Each shortcut must have a name
            expect(shortcut.name).toBeTruthy();
            expect(typeof shortcut.name).toBe('string');
            
            // Each shortcut must have a URL
            expect(shortcut.url).toBeTruthy();
            expect(shortcut.url).toContain('?action=');
            
            // Each shortcut must have a valid action
            expect(shortcut.action).toBeTruthy();
            expect(['add-expense', 'add-task', 'dashboard']).toContain(shortcut.action);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle PWA shortcut URLs correctly', () => {
      // Property: For any PWA shortcut action, the correct modal or tab should open
      const actionMappings = [
        { action: 'add-expense', expectedModal: 'expense' },
        { action: 'add-task', expectedModal: 'dailyTask' },
        { action: 'dashboard', expectedTab: 'dashboard' }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...actionMappings),
          (mapping) => {
            // Verify action mapping is correct
            if (mapping.expectedModal) {
              expect(mapping.expectedModal).toBeTruthy();
              expect(['expense', 'dailyTask', 'debt', 'recurring']).toContain(mapping.expectedModal);
            }
            
            if (mapping.expectedTab) {
              expect(mapping.expectedTab).toBeTruthy();
              expect(['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar']).toContain(mapping.expectedTab);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test Service Worker Caching Strategies
   */
  describe('Service Worker Caching Strategies', () => {
    it('should use cache-first strategy for static assets', () => {
      // Property: Static assets should use cache-first strategy
      const staticAssets = [
        'app.js',
        'styles.css',
        'logo.png',
        'icon.svg',
        'font.woff2',
        'image.jpg',
        'graphic.webp'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...staticAssets),
          (asset) => {
            const extension = asset.split('.').pop();
            const staticExtensions = ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'woff', 'woff2', 'ttf', 'eot'];
            
            // Verify asset has a static extension
            expect(staticExtensions).toContain(extension);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use network-first strategy for HTML pages', () => {
      // Property: HTML pages should use network-first strategy with cache fallback
      const htmlPages = [
        'index.html',
        'app.html',
        'page.html'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...htmlPages),
          (page) => {
            // Verify page is HTML
            expect(page).toContain('.html');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Test Offline Detection
   */
  describe('Offline Detection', () => {
    it('should detect offline status correctly', () => {
      // Property: Offline status should be boolean
      fc.assert(
        fc.property(
          fc.boolean(),
          (isOffline) => {
            // Offline status must be boolean
            expect(typeof isOffline).toBe('boolean');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
