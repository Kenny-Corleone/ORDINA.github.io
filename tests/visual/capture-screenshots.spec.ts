import { test, expect, Page } from '@playwright/test';

/**
 * Screenshot Capture Script for Visual Regression Testing
 * 
 * This script captures screenshots from the migrated ORDINA-SVELTE application
 * for comparison with the original ORDINA MAIN application.
 * 
 * Usage:
 * 1. Start the dev server: npm run dev
 * 2. Run this test: npx playwright test tests/visual/capture-screenshots.spec.ts
 * 3. Screenshots will be saved in test-results/
 */

// Test credentials (use test account)
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@ordina.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};

// Helper: Login to application
async function login(page: Page) {
  await page.goto('http://localhost:3000');
  
  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="app-container"]').isVisible().catch(() => false);
  if (isLoggedIn) return;
  
  // Perform login
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  await page.waitForTimeout(1000); // Wait for initial data load
}

// Helper: Set theme
async function setTheme(page: Page, theme: 'light' | 'dark') {
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const currentTheme = isDark ? 'dark' : 'light';
  
  if (currentTheme !== theme) {
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
  }
}

// Helper: Set language
async function setLanguage(page: Page, lang: string) {
  await page.click('[data-testid="language-selector"]');
  await page.click(`[data-language="${lang}"]`);
  await page.waitForTimeout(500);
}

// Helper: Navigate to tab
async function navigateToTab(page: Page, tabId: string) {
  await page.click(`[data-tab="${tabId}"]`);
  await page.waitForTimeout(1000); // Wait for content to load
}

test.describe('Capture Screenshots - Tabs', () => {
  test('Dashboard - Desktop - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-desktop-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Expenses - Desktop - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'expenses');
    
    await page.screenshot({
      path: 'test-results/screenshots/expenses-desktop-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Debts - Desktop - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'debts');
    
    await page.screenshot({
      path: 'test-results/screenshots/debts-desktop-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Recurring - Desktop - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'recurring');
    
    await page.screenshot({
      path: 'test-results/screenshots/recurring-desktop-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Tasks - Desktop - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'tasks');
    
    await page.screenshot({
      path: 'test-results/screenshots/tasks-desktop-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Calendar - Desktop - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'calendar');
    
    await page.screenshot({
      path: 'test-results/screenshots/calendar-desktop-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Capture Screenshots - Dark Theme', () => {
  test('Dashboard - Desktop - Dark - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'dark');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-desktop-dark-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Expenses - Desktop - Dark - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'dark');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'expenses');
    
    await page.screenshot({
      path: 'test-results/screenshots/expenses-desktop-dark-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Capture Screenshots - Mobile', () => {
  test('Dashboard - Mobile - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-mobile-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Expenses - Mobile - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'expenses');
    
    await page.screenshot({
      path: 'test-results/screenshots/expenses-mobile-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Capture Screenshots - Tablet', () => {
  test('Dashboard - Tablet - Light - EN', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'en');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-tablet-light-en.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Capture Screenshots - Languages', () => {
  test('Dashboard - Desktop - Light - RU', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'ru');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-desktop-light-ru.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Dashboard - Desktop - Light - AZ', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'az');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-desktop-light-az.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('Dashboard - Desktop - Light - IT', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page);
    await setTheme(page, 'light');
    await setLanguage(page, 'it');
    await navigateToTab(page, 'dashboard');
    
    await page.screenshot({
      path: 'test-results/screenshots/dashboard-desktop-light-it.png',
      fullPage: true,
      animations: 'disabled'
    });
  });
});
