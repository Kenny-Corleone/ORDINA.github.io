import { test, expect } from '@playwright/test';

/**
 * Basic Visual Regression Tests
 * 
 * This is a simplified visual regression test suite that can be run
 * without requiring a test account. It captures screenshots of the
 * login page and basic UI elements.
 * 
 * For full visual regression testing with authenticated views,
 * use visual-regression.spec.ts with proper test credentials.
 */

test.describe('Basic Visual Regression - Unauthenticated', () => {
  test('Login page - Desktop - Light', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    expect(screenshot).toMatchSnapshot('login-desktop-light.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
  
  test('Login page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    expect(screenshot).toMatchSnapshot('login-mobile-light.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
  
  test('Login page - Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    expect(screenshot).toMatchSnapshot('login-tablet-light.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
});

test.describe('Basic Visual Regression - Responsive', () => {
  test('Login page - Various viewports', async ({ page }) => {
    const viewports = [
      { name: 'mobile-small', width: 320, height: 568 },
      { name: 'mobile-medium', width: 375, height: 667 },
      { name: 'mobile-large', width: 414, height: 896 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop-small', width: 1366, height: 768 },
      { name: 'desktop-large', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled'
      });
      
      expect(screenshot).toMatchSnapshot(`login-${viewport.name}.png`, {
        maxDiffPixels: 100,
        threshold: 0.1
      });
    }
  });
});
