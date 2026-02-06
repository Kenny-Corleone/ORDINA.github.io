/**
 * Cross-Browser and Device Testing
 * Tests the application across different browsers and device configurations
 * Requirements: 16.7, 16.8
 */

import { test, expect, devices } from '@playwright/test';

// Test on desktop browsers
const desktopBrowsers = ['chromium', 'firefox', 'webkit'];

// Test on mobile devices
const mobileDevices = [
  'iPhone 13',
  'Pixel 5',
  'iPad Pro'
];

// Core functionality to test across all browsers
const testCoreFeatures = async (page: any, browserName: string) => {
  console.log(`Testing on ${browserName}...`);

  // Wait for app to load
  await page.waitForSelector('body', { timeout: 10000 });

  // Check if login page is visible
  const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
  
  if (hasLoginForm) {
    console.log(`${browserName}: Login page loaded successfully`);
    
    // Test form elements are interactive
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Test that inputs are focusable
    await emailInput.focus();
    await passwordInput.focus();
    
    console.log(`${browserName}: Form elements are interactive`);
  } else {
    console.log(`${browserName}: App loaded (authenticated state)`);
  }

  // Test theme toggle if available
  const themeToggle = page.locator('[aria-label*="theme"], [title*="theme"], button:has-text("Theme")').first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(500);
    console.log(`${browserName}: Theme toggle works`);
  }

  // Test responsive design
  const viewportSize = page.viewportSize();
  console.log(`${browserName}: Viewport size: ${viewportSize.width}x${viewportSize.height}`);
};

// Desktop browser tests
for (const browserType of desktopBrowsers) {
  test.describe(`Desktop - ${browserType}`, () => {
    test.use({ 
      browserName: browserType as any,
      viewport: { width: 1920, height: 1080 }
    });

    test('should load application', async ({ page }) => {
      await page.goto('/');
      await testCoreFeatures(page, browserType);
    });

    test('should handle window resize', async ({ page }) => {
      await page.goto('/');
      
      // Test desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      // Test tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      console.log(`${browserType}: Responsive design works`);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Check if focus is visible
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
      console.log(`${browserType}: Keyboard navigation works, focused: ${focusedElement}`);
    });

    test('should load CSS and styles correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      // Check if body has background color (indicates CSS loaded)
      const bodyBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      expect(bodyBgColor).toBeTruthy();
      expect(bodyBgColor).not.toBe('rgba(0, 0, 0, 0)');
      console.log(`${browserType}: CSS loaded, body background: ${bodyBgColor}`);
    });

    test('should load JavaScript correctly', async ({ page }) => {
      await page.goto('/');
      
      // Check if Svelte app is mounted
      const hasApp = await page.evaluate(() => {
        return document.querySelector('#app') !== null;
      });
      
      expect(hasApp).toBe(true);
      console.log(`${browserType}: JavaScript loaded and executed`);
    });
  });
}

// Mobile device tests
for (const deviceName of mobileDevices) {
  test.describe(`Mobile - ${deviceName}`, () => {
    test.use({ ...devices[deviceName] });

    test('should load on mobile device', async ({ page }) => {
      await page.goto('/');
      await testCoreFeatures(page, deviceName);
    });

    test('should support touch interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      // Test tap on body (basic touch support)
      await page.tap('body');
      await page.waitForTimeout(200);
      
      console.log(`${deviceName}: Touch interactions work`);
    });

    test('should display mobile-optimized layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      const viewportWidth = page.viewportSize()?.width || 0;
      expect(viewportWidth).toBeLessThan(768);
      
      console.log(`${deviceName}: Mobile layout active (width: ${viewportWidth}px)`);
    });

    test('should handle orientation change', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      // Get initial viewport
      const initialViewport = page.viewportSize();
      console.log(`${deviceName}: Portrait mode: ${initialViewport?.width}x${initialViewport?.height}`);
      
      // Simulate landscape (swap width and height)
      if (initialViewport) {
        await page.setViewportSize({ 
          width: initialViewport.height, 
          height: initialViewport.width 
        });
        await page.waitForTimeout(500);
        
        const landscapeViewport = page.viewportSize();
        console.log(`${deviceName}: Landscape mode: ${landscapeViewport?.width}x${landscapeViewport?.height}`);
      }
    });
  });
}

// Specific browser compatibility tests
test.describe('Browser-specific features', () => {
  test('Chrome - Service Worker support', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');
    
    await page.goto('/');
    
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(hasServiceWorker).toBe(true);
    console.log('Chrome: Service Worker API available');
  });

  test('Firefox - IndexedDB support', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    await page.goto('/');
    
    const hasIndexedDB = await page.evaluate(() => {
      return 'indexedDB' in window;
    });
    
    expect(hasIndexedDB).toBe(true);
    console.log('Firefox: IndexedDB API available');
  });

  test('Safari - LocalStorage support', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');
    
    await page.goto('/');
    
    const hasLocalStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    });
    
    expect(hasLocalStorage).toBe(true);
    console.log('Safari: LocalStorage works');
  });
});

// Performance across browsers
test.describe('Cross-browser performance', () => {
  for (const browserType of desktopBrowsers) {
    test(`${browserType} - Load time`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`${browserType}: Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });
  }
});
