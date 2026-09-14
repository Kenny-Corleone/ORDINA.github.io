import { test, expect, type Page } from '@playwright/test';

test.skip(!process.env.E2E_EMULATOR, 'Runs only against the Firebase Emulator Suite.');
test.describe.configure({ mode: 'serial' });

async function signUp(page: Page): Promise<void> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await page.goto('/');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.locator('input[type="email"]').fill(`smoke-${suffix}@example.test`);
  await page.locator('input[type="password"]').fill('smoke-password-123');
  await page.locator('form').getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('[data-tab="dashboard"]')).toBeVisible({ timeout: 10000 });
}

test('authenticates against the emulator', async ({ page }) => {
  await signUp(page);
  await expect(page.locator('[data-tab="expenses"]')).toBeVisible();
});

test('creates and deletes an expense', async ({ page }) => {
  await signUp(page);
  await page.locator('[data-tab="expenses"]').click();
  await page.getByRole('button', { name: 'Add Expense' }).click();
  await page.getByPlaceholder('Enter expense name').fill('Smoke expense');
  await page.getByPlaceholder('Enter or select category').fill('Smoke');
  await page.getByPlaceholder('0.00').fill('12.50');
  await page.locator('input[type="date"]').fill(new Date().toISOString().slice(0, 10));
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Smoke expense')).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).first().click();
});

test('records a debt payment', async ({ page }) => {
  await signUp(page);
  await page.locator('[data-tab="debts"]').click();
  await page.getByRole('button', { name: 'Add Debt' }).click();
  await page.getByPlaceholder('Enter debt name').fill('Smoke debt');
  await page.getByPlaceholder('0.00').first().fill('100');
  await page.getByPlaceholder('0.00').nth(1).fill('0');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Smoke debt')).toBeVisible();
  await page.getByRole('button', { name: 'Add Payment' }).click();
  await page.getByPlaceholder('0.00').fill('10');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/10/)).toBeVisible();
});

test('updates recurring expense status', async ({ page }) => {
  await signUp(page);
  await page.locator('[data-tab="recurring"]').click();
  await page.getByRole('button', { name: /Add Recurring/ }).click();
  await page.getByPlaceholder('Enter recurring expense name').fill('Smoke recurring');
  await page.getByPlaceholder('0.00').fill('20');
  await page.getByPlaceholder('1-31').fill('1');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Smoke recurring')).toBeVisible();
  await page.getByRole('combobox', { name: /Smoke recurring/ }).selectOption('paid');
  await expect(page.getByRole('combobox', { name: /Smoke recurring/ })).toHaveValue('paid');
});
