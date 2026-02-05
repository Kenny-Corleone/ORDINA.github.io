import { Page } from '@playwright/test';

/**
 * Helper functions for E2E tests
 * 
 * These utilities provide common functionality for integration tests
 * including authentication, data setup, and cleanup.
 */

/**
 * Login helper for authenticated tests
 * Note: This requires a test Firebase project with test credentials
 */
export async function loginAsTestUser(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = password || process.env.TEST_USER_PASSWORD || 'testpassword123';

  await page.goto('/');
  
  // Fill in login form
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  
  // Submit login
  await page.click('button:has-text("Login")');
  
  // Wait for authentication to complete
  await page.waitForTimeout(2000);
  
  // Verify we're logged in (dashboard should be visible)
  await page.waitForSelector('[data-tab="dashboard"]', { timeout: 5000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');
  
  // Click logout
  await page.click('text=Logout');
  
  // Wait for redirect to login
  await page.waitForSelector('h2:has-text("Login")', { timeout: 5000 });
}

/**
 * Create test expense
 */
export async function createTestExpense(
  page: Page,
  data: {
    name: string;
    category: string;
    amount: string;
    date: string;
  }
) {
  await page.click('[data-tab="expenses"]');
  await page.click('button:has-text("Add Expense")');
  
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="category"]', data.category);
  await page.fill('input[name="amount"]', data.amount);
  await page.fill('input[name="date"]', data.date);
  
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(1000);
}

/**
 * Create test debt
 */
export async function createTestDebt(
  page: Page,
  data: {
    name: string;
    totalAmount: string;
    paidAmount: string;
    comment?: string;
  }
) {
  await page.click('[data-tab="debts"]');
  await page.click('button:has-text("Add Debt")');
  
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="totalAmount"]', data.totalAmount);
  await page.fill('input[name="paidAmount"]', data.paidAmount);
  
  if (data.comment) {
    await page.fill('textarea[name="comment"]', data.comment);
  }
  
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(1000);
}

/**
 * Create test task
 */
export async function createTestTask(
  page: Page,
  type: 'daily' | 'monthly' | 'yearly',
  data: {
    name: string;
    date?: string;
    status?: string;
    notes?: string;
  }
) {
  await page.click('[data-tab="tasks"]');
  
  const buttonMap = {
    daily: 'add-daily-task-btn',
    monthly: 'add-monthly-task-btn',
    yearly: 'add-yearly-task-btn',
  };
  
  await page.click(`[data-testid="${buttonMap[type]}"]`);
  
  await page.fill('input[name="name"]', data.name);
  
  if (data.date && type === 'daily') {
    await page.fill('input[name="date"]', data.date);
  }
  
  if (data.status) {
    await page.selectOption('select[name="status"]', data.status);
  }
  
  if (data.notes) {
    await page.fill('textarea[name="notes"]', data.notes);
  }
  
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(1000);
}

/**
 * Create test calendar event
 */
export async function createTestCalendarEvent(
  page: Page,
  data: {
    name: string;
    date: string;
    type: 'event' | 'birthday' | 'meeting' | 'wedding';
    notes?: string;
  }
) {
  await page.click('[data-tab="calendar"]');
  
  // Click on a calendar cell to open modal
  await page.click('[data-testid="calendar-cell"]:first-of-type');
  
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="date"]', data.date);
  await page.selectOption('select[name="type"]', data.type);
  
  if (data.notes) {
    await page.fill('textarea[name="notes"]', data.notes);
  }
  
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(1000);
}

/**
 * Delete all test data (cleanup)
 * Note: This requires Firebase Admin SDK or test-specific cleanup endpoints
 */
export async function cleanupTestData(page: Page) {
  // This would require a cleanup endpoint or Firebase Admin SDK
  // For now, this is a placeholder
  console.log('Cleanup test data - implement with Firebase Admin SDK');
}

/**
 * Wait for Firebase operation to complete
 */
export async function waitForFirebaseOperation(page: Page, timeout = 2000) {
  await page.waitForTimeout(timeout);
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.locator(selector).first();
    return await element.isVisible({ timeout: 1000 });
  } catch {
    return false;
  }
}

/**
 * Get current month display
 */
export async function getCurrentMonth(page: Page): Promise<string> {
  const monthElement = page.locator('[data-testid="current-month"]');
  return (await monthElement.textContent()) || '';
}

/**
 * Select month from dropdown
 */
export async function selectMonth(page: Page, monthIndex: number) {
  await page.click('[data-testid="month-selector"]');
  await page.click(`[data-testid="month-option"]:nth-child(${monthIndex})`);
  await page.waitForTimeout(1000);
}

/**
 * Toggle currency
 */
export async function toggleCurrency(page: Page, currency: 'AZN' | 'USD') {
  await page.click(`[data-currency="${currency}"]`);
  await page.waitForTimeout(500);
}

/**
 * Navigate to tab
 */
export async function navigateToTab(page: Page, tab: string) {
  await page.click(`[data-tab="${tab}"]`);
  await page.waitForTimeout(500);
}

/**
 * Close modal
 */
export async function closeModal(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Get today's date in ISO format
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days from now
 */
export function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Format currency amount
 */
export function formatAmount(amount: number, currency: 'AZN' | 'USD' = 'AZN'): string {
  if (currency === 'USD') {
    return (amount / 1.7).toFixed(2);
  }
  return amount.toFixed(2);
}
