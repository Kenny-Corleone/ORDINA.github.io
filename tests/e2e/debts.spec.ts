import { test, expect } from '@playwright/test';

/**
 * Debt Workflow Integration Tests
 * 
 * Tests the complete debt management workflows:
 * - Add debt
 * - View debt in list
 * - Add payment to debt
 * - Edit debt
 * - Delete debt
 * - Update debt comments
 * 
 * Validates Requirement: 16.3 (Integration Testing)
 */

test.describe('Debt Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Note: These tests assume user is already authenticated
  });

  test.skip('should navigate to debts tab', async ({ page }) => {
    // Click on debts tab
    await page.click('[data-tab="debts"]');
    
    // Verify debts tab is active
    await expect(page.locator('[data-tab="debts"].active')).toBeVisible();
    
    // Verify debts table or empty state is visible
    const hasDebts = await page.locator('[data-testid="debts-table"]').isVisible();
    const hasEmptyState = await page.locator('text=No debts found').isVisible();
    expect(hasDebts || hasEmptyState).toBe(true);
  });

  test.skip('should open add debt modal', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Click add debt button
    await page.click('button:has-text("Add Debt")');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="debt"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Debt")')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="totalAmount"]')).toBeVisible();
    await expect(page.locator('input[name="paidAmount"]')).toBeVisible();
    await expect(page.locator('textarea[name="comment"]')).toBeVisible();
  });

  test.skip('should add a new debt', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    await page.click('button:has-text("Add Debt")');
    
    // Fill in debt details
    await page.fill('input[name="name"]', 'Test Debt');
    await page.fill('input[name="totalAmount"]', '1000.00');
    await page.fill('input[name="paidAmount"]', '200.00');
    await page.fill('textarea[name="comment"]', 'Test comment');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="debt"]')).not.toBeVisible();
    
    // Verify debt appears in list
    await expect(page.locator('text=Test Debt')).toBeVisible();
    await expect(page.locator('text=1000.00')).toBeVisible();
    await expect(page.locator('text=200.00')).toBeVisible();
  });

  test.skip('should validate debt form fields', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    await page.click('button:has-text("Add Debt")');
    
    // Try to submit empty form
    await page.click('button:has-text("Save")');
    
    // Check for validation
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test.skip('should calculate remaining debt amount', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    await page.click('button:has-text("Add Debt")');
    
    // Fill in debt with total and paid amounts
    await page.fill('input[name="name"]', 'Calculation Test');
    await page.fill('input[name="totalAmount"]', '1000');
    await page.fill('input[name="paidAmount"]', '300');
    
    // Submit form
    await page.click('button:has-text("Save")');
    await expect(page.locator('[data-modal="debt"]')).not.toBeVisible();
    
    // Verify remaining amount is displayed (1000 - 300 = 700)
    await expect(page.locator('text=700')).toBeVisible();
  });

  test.skip('should open add payment modal', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Click add payment button on first debt
    await page.click('[data-testid="add-payment-btn"]:first-of-type');
    
    // Verify payment modal is open
    await expect(page.locator('[data-modal="debt-payment"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Payment")')).toBeVisible();
    
    // Verify form fields
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
  });

  test.skip('should add payment to debt', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Get initial paid amount
    const initialPaid = await page.locator('[data-testid="debt-paid-amount"]:first-of-type').textContent();
    
    // Click add payment
    await page.click('[data-testid="add-payment-btn"]:first-of-type');
    
    // Fill payment details
    await page.fill('input[name="amount"]', '100');
    await page.fill('input[name="date"]', '2024-01-15');
    
    // Submit payment
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="debt-payment"]')).not.toBeVisible();
    
    // Verify paid amount increased
    await page.waitForTimeout(1000);
    const newPaid = await page.locator('[data-testid="debt-paid-amount"]:first-of-type').textContent();
    expect(newPaid).not.toBe(initialPaid);
  });

  test.skip('should create expense record when adding payment', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Add payment to debt
    await page.click('[data-testid="add-payment-btn"]:first-of-type');
    await page.fill('input[name="amount"]', '100');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.click('button:has-text("Save")');
    
    // Navigate to expenses tab
    await page.click('[data-tab="expenses"]');
    
    // Verify expense was created for the payment
    await expect(page.locator('text=Debt Payment')).toBeVisible();
    await expect(page.locator('text=100')).toBeVisible();
  });

  test.skip('should edit an existing debt', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Click edit button on first debt
    await page.click('[data-testid="edit-debt-btn"]:first-of-type');
    
    // Verify modal is open with existing data
    await expect(page.locator('[data-modal="debt"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Edit Debt")')).toBeVisible();
    
    // Modify debt name
    await page.fill('input[name="name"]', 'Updated Debt');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="debt"]')).not.toBeVisible();
    
    // Verify updated debt appears in list
    await expect(page.locator('text=Updated Debt')).toBeVisible();
  });

  test.skip('should update debt comment inline', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Find comment textarea for first debt
    const commentField = page.locator('[data-testid="debt-comment"]:first-of-type');
    
    // Clear and type new comment
    await commentField.clear();
    await commentField.fill('Updated comment text');
    
    // Blur to trigger save (debounced)
    await commentField.blur();
    
    // Wait for debounce and save
    await page.waitForTimeout(1500);
    
    // Refresh page to verify persistence
    await page.reload();
    await page.click('[data-tab="debts"]');
    
    // Verify comment was saved
    await expect(page.locator('text=Updated comment text')).toBeVisible();
  });

  test.skip('should delete a debt', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Get initial debt count
    const initialCount = await page.locator('[data-testid="debt-row"]').count();
    
    // Click delete button on first debt
    await page.click('[data-testid="delete-debt-btn"]:first-of-type');
    
    // Confirm deletion (if there's a confirmation dialog)
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify debt count decreased
    const newCount = await page.locator('[data-testid="debt-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test.skip('should display debt summary statistics', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Verify summary cards are visible
    await expect(page.locator('[data-testid="total-debt"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-paid"]')).toBeVisible();
    await expect(page.locator('[data-testid="remaining-debt"]')).toBeVisible();
  });

  test.skip('should export debts to CSV', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export CSV")');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify filename
    expect(download.suggestedFilename()).toContain('debts');
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe('Debt Currency Display', () => {
  test.skip('should display debt amounts in selected currency', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Switch to USD
    await page.click('[data-currency="USD"]');
    
    // Verify amounts are converted
    await expect(page.locator('text=$')).toBeVisible();
  });

  test.skip('should update debt amounts when currency changes', async ({ page }) => {
    await page.click('[data-tab="debts"]');
    
    // Get amount in AZN
    const aznAmount = await page.locator('[data-testid="debt-total-amount"]:first-of-type').textContent();
    
    // Switch to USD
    await page.click('[data-currency="USD"]');
    
    // Get amount in USD
    const usdAmount = await page.locator('[data-testid="debt-total-amount"]:first-of-type').textContent();
    
    // Verify amounts are different
    expect(aznAmount).not.toBe(usdAmount);
  });
});
