import { test, expect, type Page } from '@playwright/test';

test.skip(!process.env.E2E_EMULATOR, 'Runs only against the Firebase Emulator Suite.');
test.describe.configure({ mode: 'serial' });

async function signUp(page: Page): Promise<void> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const diagnostics: string[] = [];
  page.on('console', (message) => diagnostics.push(`console:${message.type()}:${message.text()}`));
  page.on('pageerror', (error) => diagnostics.push(`pageerror:${error.message}`));
  page.on('requestfailed', (request) => {
    diagnostics.push(`requestfailed:${request.url()}:${request.failure()?.errorText ?? 'unknown'}`);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
  await page.locator('.auth-tabs').getByRole('button', { name: 'Register', exact: true }).click();
  await page.locator('input[type="email"]').fill(`smoke-${suffix}@example.test`);
  await page.locator('input[type="password"]').fill('smoke-password-123');
  const submitButton = page.locator('form.auth-form button[type="submit"]');
  await expect(submitButton).toBeEnabled();
  await submitButton.click({ force: true });
  try {
    await expect(page.locator('#dashboard-page')).toBeVisible({ timeout: 15000 });
  } catch (error) {
    const authError = await page.locator('.auth-error').textContent().catch(() => null);
    throw new Error(
      `Registration did not reach the dashboard. Auth error: ${authError ?? 'none'}. ` +
      `Diagnostics: ${diagnostics.join(' | ')}`,
      { cause: error },
    );
  }
}

test('authenticates against the emulator', async ({ page }) => {
  await signUp(page);
  await expect(page.locator('#dashboard-page')).toBeVisible();
});

test('creates and deletes an expense', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Expenses', exact: true }).click();
  await expect(page.locator('#expenses-page')).toBeVisible();
  await page.getByRole('button', { name: 'Add Expense' }).click();
  const expenseDialog = page.locator('#expense-modal[role="dialog"]');
  await expect(expenseDialog).toBeVisible();
  await page.getByPlaceholder('Enter expense name').fill('Smoke expense');
  await page.getByPlaceholder('Enter or select category').fill('Smoke');
  await page.getByPlaceholder('0.00').fill('12.50');
  await page.locator('input[type="date"]').fill(new Date().toISOString().slice(0, 10));
  await expenseDialog.locator('button[type="submit"]').click();
  await expect(page.getByText('Smoke expense')).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).first().click();
});

test('records a debt payment', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Debts', exact: true }).click();
  await expect(page.locator('#debts-page')).toBeVisible();
  await page.getByRole('button', { name: 'Add Debt' }).click();
  const debtDialog = page.locator('#debt-modal[role="dialog"]');
  await expect(debtDialog).toBeVisible();
  await debtDialog.locator('#debt-name').fill('Smoke debt');
  await debtDialog.locator('#debt-total-amount').fill('100');
  await debtDialog.locator('#debt-paid-amount').fill('0');
  await debtDialog.locator('button[type="submit"]').click();
  const debtRow = page.locator('#debts-page .debt-row').filter({ hasText: 'Smoke debt' });
  try {
    await expect(debtRow).toBeVisible({ timeout: 15000 });
  } catch (error) {
    const submitError = await debtDialog.locator('p.text-red-600').textContent().catch(() => null);
    throw new Error(
      `Debt was not persisted to the list. Modal error: ${submitError ?? 'none'}`,
      { cause: error },
    );
  }
  if (await debtDialog.isVisible()) {
    await debtDialog.getByRole('button', { name: 'Close modal' }).click();
  }
  await expect(debtDialog).toBeHidden();
  await debtRow.getByRole('button', { name: 'Add Payment', exact: true }).click();
  const paymentDialog = page.locator('#debt-payment-modal[role="dialog"]');
  await expect(paymentDialog).toBeVisible();
  await paymentDialog.locator('#payment-amount').fill('10');
  await expect(paymentDialog.locator('#payment-date')).toHaveValue(/\d{4}-\d{2}-\d{2}/);
  await paymentDialog.locator('button[type="submit"]').click();
  await expect(paymentDialog).toBeHidden();
  await expect(debtRow).toBeVisible();
});

test('updates recurring expense status', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Recurring', exact: true }).click();
  await expect(page.locator('#recurring-page')).toBeVisible();
  await page.getByRole('button', { name: /Add Recurring/ }).click();
  const recurringDialog = page.locator('#recurring-modal[role="dialog"]');
  await expect(recurringDialog).toBeVisible();
  await page.getByPlaceholder('Enter recurring expense name').fill('Smoke recurring');
  await page.getByPlaceholder('0.00').fill('20');
  await page.getByPlaceholder('1-31').fill('1');
  await recurringDialog.locator('button[type="submit"]').click();
  await expect(page.getByText('Smoke recurring')).toBeVisible();
  await page.getByRole('combobox', { name: /Smoke recurring/ }).selectOption('paid');
  await expect(page.getByRole('combobox', { name: /Smoke recurring/ })).toHaveValue('paid');
});
