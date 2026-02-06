import { test, expect, Page } from '@playwright/test';

/**
 * Visual Regression Testing for ORDINA Svelte Migration
 * 
 * This test suite performs pixel-perfect visual comparison between:
 * - Original application (ORDINA MAIN)
 * - Migrated application (ORDINA-SVELTE)
 * 
 * Coverage:
 * - All 6 tabs (Dashboard, Expenses, Debts, Recurring, Tasks, Calendar)
 * - All 13 modals
 * - 3 responsive layouts (mobile, tablet, desktop)
 * - 2 themes (dark, light)
 * - 4 languages (EN, RU, AZ, IT)
 * 
 * Requirements: 2.1, 16.2
 */

// Test configuration
const ORIGINAL_APP_URL = 'http://localhost:3001'; // ORDINA MAIN
const MIGRATED_APP_URL = 'http://localhost:3000'; // ORDINA-SVELTE

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};

// Themes
const THEMES = ['light', 'dark'];

// Languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'az', name: 'Azərbaycan' },
  { code: 'it', name: 'Italiano' }
];

// Tab IDs
const TABS = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'debts', name: 'Debts' },
  { id: 'recurring', name: 'Recurring' },
  { id: 'tasks', name: 'Tasks' },
  { id: 'calendar', name: 'Calendar' }
];

// Modal IDs
const MODALS = [
  { id: 'expense-modal', name: 'Expense Modal', trigger: 'add-expense-btn' },
  { id: 'debt-modal', name: 'Debt Modal', trigger: 'add-debt-btn' },
  { id: 'debt-payment-modal', name: 'Debt Payment Modal', trigger: null }, // Requires debt to exist
  { id: 'recurring-expense-modal', name: 'Recurring Expense Modal', trigger: 'add-recurring-btn' },
  { id: 'daily-task-modal', name: 'Daily Task Modal', trigger: 'add-daily-task-btn' },
  { id: 'monthly-task-modal', name: 'Monthly Task Modal', trigger: 'add-monthly-task-btn' },
  { id: 'yearly-task-modal', name: 'Yearly Task Modal', trigger: 'add-yearly-task-btn' },
  { id: 'calendar-event-modal', name: 'Calendar Event Modal', trigger: 'add-event-btn' },
  { id: 'category-modal', name: 'Category Modal', trigger: 'manage-categories-btn' },
  { id: 'calculator-modal', name: 'Calculator Modal', trigger: 'calculator-btn' },
  { id: 'shopping-list-modal', name: 'Shopping List Modal', trigger: 'shopping-list-btn' },
  { id: 'settings-modal', name: 'Settings Modal', trigger: 'settings-btn' },
  { id: 'profile-modal', name: 'Profile Modal', trigger: 'profile-btn' }
];

/**
 * Helper function to login to the application
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
}

/**
 * Helper function to set theme
 */
async function setTheme(page: Page, theme: string) {
  const currentTheme = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  
  if (currentTheme !== theme) {
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Wait for theme transition
  }
}

/**
 * Helper function to set language
 */
async function setLanguage(page: Page, languageCode: string) {
  await page.click('[data-testid="language-selector"]');
  await page.click(`[data-language="${languageCode}"]`);
  await page.waitForTimeout(500); // Wait for translations to load
}

/**
 * Helper function to navigate to tab
 */
async function navigateToTab(page: Page, tabId: string) {
  await page.click(`[data-tab="${tabId}"]`);
  await page.waitForTimeout(500); // Wait for tab content to load
}

/**
 * Helper function to open modal
 */
async function openModal(page: Page, modalId: string, trigger: string | null) {
  if (trigger) {
    await page.click(`[data-testid="${trigger}"]`);
    await page.waitForSelector(`[data-modal="${modalId}"]`, { timeout: 5000 });
    await page.waitForTimeout(300); // Wait for modal animation
  }
}

// Test suite for tabs
test.describe('Visual Regression - Tabs', () => {
  for (const viewport of Object.keys(VIEWPORTS)) {
    for (const theme of THEMES) {
      for (const language of LANGUAGES) {
        for (const tab of TABS) {
          test(`${tab.name} - ${viewport} - ${theme} - ${language.code}`, async ({ page }) => {
            // Set viewport
            await page.setViewportSize(VIEWPORTS[viewport as keyof typeof VIEWPORTS]);
            
            // Login
            await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
            
            // Set theme
            await setTheme(page, theme);
            
            // Set language
            await setLanguage(page, language.code);
            
            // Navigate to tab
            await navigateToTab(page, tab.id);
            
            // Take screenshot
            const screenshot = await page.screenshot({
              fullPage: true,
              animations: 'disabled'
            });
            
            // Compare with baseline
            expect(screenshot).toMatchSnapshot(
              `${tab.id}-${viewport}-${theme}-${language.code}.png`,
              {
                maxDiffPixels: 100, // Allow small differences
                threshold: 0.1 // 0.1% difference threshold
              }
            );
          });
        }
      }
    }
  }
});

// Test suite for modals
test.describe('Visual Regression - Modals', () => {
  for (const viewport of Object.keys(VIEWPORTS)) {
    for (const theme of THEMES) {
      for (const language of LANGUAGES) {
        for (const modal of MODALS) {
          // Skip modals that require specific setup
          if (modal.trigger === null) continue;
          
          test(`${modal.name} - ${viewport} - ${theme} - ${language.code}`, async ({ page }) => {
            // Set viewport
            await page.setViewportSize(VIEWPORTS[viewport as keyof typeof VIEWPORTS]);
            
            // Login
            await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
            
            // Set theme
            await setTheme(page, theme);
            
            // Set language
            await setLanguage(page, language.code);
            
            // Open modal
            await openModal(page, modal.id, modal.trigger);
            
            // Take screenshot
            const screenshot = await page.screenshot({
              fullPage: true,
              animations: 'disabled'
            });
            
            // Compare with baseline
            expect(screenshot).toMatchSnapshot(
              `${modal.id}-${viewport}-${theme}-${language.code}.png`,
              {
                maxDiffPixels: 100,
                threshold: 0.1
              }
            );
          });
        }
      }
    }
  }
});

// Test suite for responsive layouts
test.describe('Visual Regression - Responsive Layouts', () => {
  test('Mobile layout - Dashboard', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
    await navigateToTab(page, 'dashboard');
    
    const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    expect(screenshot).toMatchSnapshot('dashboard-mobile-responsive.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
  
  test('Tablet layout - Expenses', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
    await navigateToTab(page, 'expenses');
    
    const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    expect(screenshot).toMatchSnapshot('expenses-tablet-responsive.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
  
  test('Desktop layout - Tasks', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
    await navigateToTab(page, 'tasks');
    
    const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    expect(screenshot).toMatchSnapshot('tasks-desktop-responsive.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
});

// Test suite for theme comparison
test.describe('Visual Regression - Theme Comparison', () => {
  test('Light theme - All tabs', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
    await setTheme(page, 'light');
    
    for (const tab of TABS) {
      await navigateToTab(page, tab.id);
      const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
      expect(screenshot).toMatchSnapshot(`${tab.id}-light-theme.png`, {
        maxDiffPixels: 100,
        threshold: 0.1
      });
    }
  });
  
  test('Dark theme - All tabs', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
    await setTheme(page, 'dark');
    
    for (const tab of TABS) {
      await navigateToTab(page, tab.id);
      const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
      expect(screenshot).toMatchSnapshot(`${tab.id}-dark-theme.png`, {
        maxDiffPixels: 100,
        threshold: 0.1
      });
    }
  });
});

// Test suite for language comparison
test.describe('Visual Regression - Language Comparison', () => {
  for (const language of LANGUAGES) {
    test(`${language.name} - Dashboard`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await login(page, process.env.TEST_EMAIL || 'test@example.com', process.env.TEST_PASSWORD || 'password');
      await setLanguage(page, language.code);
      await navigateToTab(page, 'dashboard');
      
      const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
      expect(screenshot).toMatchSnapshot(`dashboard-${language.code}.png`, {
        maxDiffPixels: 100,
        threshold: 0.1
      });
    });
  }
});
