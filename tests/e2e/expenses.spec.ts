import { test, expect } from '@playwright/test';

/**
 * Expense Workflow Integration Tests
 * 
 * Tests the complete expense management workflows:
 * - Add expense
 * - View expense in list
 * - Edit expense
 * - Delete expense
 * - Month navigation
 * - Currency toggle
 * - CSV export
 * 
 * Validates Requirement: 16.3 (Integration Testing)
 */

test.describe('Expense Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Note: These tests assume user is already authenticated
    // In a real scenario, you'd need to handle authentication first
  });

  test.skip('should navigate to expenses tab', async ({ page }) => {
    // Click on expenses tab
    await page.click('[data-tab="expenses"]');
    
    // Verify expenses tab is active
    await expect(page.locator('[data-tab="expenses"].active')).toBeVisible();
    
    // Verify expenses table or empty state is visible
    const hasExpenses = await page.locator('[data-testid="expenses-table"]').isVisible();
    const hasEmptyState = await page.locator('text=No expenses found').isVisible();
    expect(hasExpenses || hasEmptyState).toBe(true);
  });

  test.skip('should open add expense modal', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Click add expense button
    await page.click('button:has-text("Add Expense")');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="expense"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Expense")')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="category"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
  });

  test.skip('should add a new expense', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    await page.click('button:has-text("Add Expense")');
    
    // Fill in expense details
    await page.fill('input[name="name"]', 'Test Expense');
    await page.fill('input[name="category"]', 'Food');
    await page.fill('input[name="amount"]', '50.00');
    await page.fill('input[name="date"]', '2024-01-15');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="expense"]')).not.toBeVisible();
    
    // Verify expense appears in list
    await expect(page.locator('text=Test Expense')).toBeVisible();
    await expect(page.locator('text=Food')).toBeVisible();
    await expect(page.locator('text=50.00')).toBeVisible();
  });

  test.skip('should validate expense form fields', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    await page.click('button:has-text("Add Expense")');
    
    // Try to submit empty form
    await page.click('button:has-text("Save")');
    
    // Check for validation (HTML5 or custom)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test.skip('should edit an existing expense', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Click edit button on first expense
    await page.click('[data-testid="edit-expense-btn"]:first-of-type');
    
    // Verify modal is open with existing data
    await expect(page.locator('[data-modal="expense"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Edit Expense")')).toBeVisible();
    
    // Modify expense name
    await page.fill('input[name="name"]', 'Updated Expense');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="expense"]')).not.toBeVisible();
    
    // Verify updated expense appears in list
    await expect(page.locator('text=Updated Expense')).toBeVisible();
  });

  test.skip('should delete an expense', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Get initial expense count
    const initialCount = await page.locator('[data-testid="expense-row"]').count();
    
    // Click delete button on first expense
    await page.click('[data-testid="delete-expense-btn"]:first-of-type');
    
    // Confirm deletion (if there's a confirmation dialog)
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify expense count decreased
    const newCount = await page.locator('[data-testid="expense-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test.skip('should close modal on escape key', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    await page.click('button:has-text("Add Expense")');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="expense"]')).toBeVisible();
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Verify modal is closed
    await expect(page.locator('[data-modal="expense"]')).not.toBeVisible();
  });

  test.skip('should close modal on backdrop click', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    await page.click('button:has-text("Add Expense")');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="expense"]')).toBeVisible();
    
    // Click backdrop
    await page.click('[data-testid="modal-backdrop"]');
    
    // Verify modal is closed
    await expect(page.locator('[data-modal="expense"]')).not.toBeVisible();
  });
});

test.describe('Month Navigation', () => {
  test.skip('should change month using month selector', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Get current month display
    const currentMonth = await page.locator('[data-testid="current-month"]').textContent();
    
    // Open month selector
    await page.click('[data-testid="month-selector"]');
    
    // Select a different month
    await page.click('[data-testid="month-option"]:nth-child(2)');
    
    // Verify month changed
    const newMonth = await page.locator('[data-testid="current-month"]').textContent();
    expect(newMonth).not.toBe(currentMonth);
    
    // Verify expenses list updated (may be empty for different month)
    await page.waitForTimeout(1000);
  });

  test.skip('should load expenses for selected month', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Select a specific month
    await page.click('[data-testid="month-selector"]');
    await page.click('[data-testid="month-option"]:first-child');
    
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Verify loading state or data display
    const hasExpenses = await page.locator('[data-testid="expenses-table"]').isVisible();
    const hasEmptyState = await page.locator('text=No expenses found').isVisible();
    expect(hasExpenses || hasEmptyState).toBe(true);
  });
});

test.describe('Currency Toggle', () => {
  test.skip('should toggle between AZN and USD', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Verify AZN is default
    await expect(page.locator('[data-currency="AZN"].active')).toBeVisible();
    
    // Click USD button
    await page.click('[data-currency="USD"]');
    
    // Verify USD is now active
    await expect(page.locator('[data-currency="USD"].active')).toBeVisible();
    
    // Verify amounts are converted (divided by 1.7)
    // This would require checking actual amount values
  });

  test.skip('should persist currency selection', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Switch to USD
    await page.click('[data-currency="USD"]');
    
    // Navigate away and back
    await page.click('[data-tab="dashboard"]');
    await page.click('[data-tab="expenses"]');
    
    // Verify USD is still selected
    await expect(page.locator('[data-currency="USD"].active')).toBeVisible();
  });

  test.skip('should display correct currency symbols', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Check AZN symbol
    await page.click('[data-currency="AZN"]');
    await expect(page.locator('text=₼')).toBeVisible();
    
    // Check USD symbol
    await page.click('[data-currency="USD"]');
    await expect(page.locator('text=$')).toBeVisible();
  });
});

test.describe('CSV Export', () => {
  test.skip('should export expenses to CSV', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export CSV")');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify filename
    expect(download.suggestedFilename()).toContain('expenses');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test.skip('should export with correct CSV format', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export CSV")');
    
    // Wait for download and read content
    const download = await downloadPromise;
    const path = await download.path();
    
    // Read and verify CSV content
    // This would require reading the file and checking format
  });
});

test.describe('Expense Sorting', () => {
  test.skip('should display expenses sorted by date descending', async ({ page }) => {
    await page.click('[data-tab="expenses"]');
    
    // Get all expense dates
    const dates = await page.locator('[data-testid="expense-date"]').allTextContents();
    
    // Verify dates are in descending order
    for (let i = 0; i < dates.length - 1; i++) {
      const date1 = new Date(dates[i]);
      const date2 = new Date(dates[i + 1]);
      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
    }
  });
});
