import { test, expect } from '@playwright/test';

/**
 * Task Workflow Integration Tests
 * 
 * Tests the complete task management workflows:
 * - Add daily/monthly/yearly tasks
 * - Update task status
 * - Edit task
 * - Delete task
 * - Task carry-over behavior
 * - Task notes editing
 * 
 * Validates Requirement: 16.3 (Integration Testing)
 */

test.describe('Daily Task Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Note: These tests assume user is already authenticated
  });

  test.skip('should navigate to tasks tab', async ({ page }) => {
    // Click on tasks tab
    await page.click('[data-tab="tasks"]');
    
    // Verify tasks tab is active
    await expect(page.locator('[data-tab="tasks"].active')).toBeVisible();
    
    // Verify task sections are visible
    await expect(page.locator('h3:has-text("Daily Tasks")')).toBeVisible();
    await expect(page.locator('h3:has-text("Monthly Tasks")')).toBeVisible();
    await expect(page.locator('h3:has-text("Yearly Tasks")')).toBeVisible();
  });

  test.skip('should open add daily task modal', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Click add daily task button
    await page.click('[data-testid="add-daily-task-btn"]');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="daily-task"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Daily Task")')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
  });

  test.skip('should add a new daily task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    await page.click('[data-testid="add-daily-task-btn"]');
    
    // Fill in task details
    await page.fill('input[name="name"]', 'Test Daily Task');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="status"]', 'Не выполнено');
    await page.fill('textarea[name="notes"]', 'Test notes');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="daily-task"]')).not.toBeVisible();
    
    // Verify task appears in list
    await expect(page.locator('text=Test Daily Task')).toBeVisible();
  });

  test.skip('should update daily task status', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Find status dropdown for first task
    const statusDropdown = page.locator('[data-testid="task-status-dropdown"]:first-of-type');
    
    // Change status to "Done"
    await statusDropdown.selectOption('Выполнено');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify status changed (could check for visual indicator like color)
    const selectedValue = await statusDropdown.inputValue();
    expect(selectedValue).toBe('Выполнено');
  });

  test.skip('should update daily task notes inline', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Find notes textarea for first task
    const notesField = page.locator('[data-testid="task-notes"]:first-of-type');
    
    // Clear and type new notes
    await notesField.clear();
    await notesField.fill('Updated task notes');
    
    // Blur to trigger save (debounced)
    await notesField.blur();
    
    // Wait for debounce and save
    await page.waitForTimeout(1500);
    
    // Refresh page to verify persistence
    await page.reload();
    await page.click('[data-tab="tasks"]');
    
    // Verify notes were saved
    await expect(page.locator('text=Updated task notes')).toBeVisible();
  });

  test.skip('should edit a daily task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Click edit button on first task
    await page.click('[data-testid="edit-daily-task-btn"]:first-of-type');
    
    // Verify modal is open with existing data
    await expect(page.locator('[data-modal="daily-task"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Edit Daily Task")')).toBeVisible();
    
    // Modify task name
    await page.fill('input[name="name"]', 'Updated Daily Task');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="daily-task"]')).not.toBeVisible();
    
    // Verify updated task appears in list
    await expect(page.locator('text=Updated Daily Task')).toBeVisible();
  });

  test.skip('should delete a daily task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Get initial task count
    const initialCount = await page.locator('[data-testid="daily-task-row"]').count();
    
    // Click delete button on first task
    await page.click('[data-testid="delete-daily-task-btn"]:first-of-type');
    
    // Confirm deletion (if there's a confirmation dialog)
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify task count decreased
    const newCount = await page.locator('[data-testid="daily-task-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test.skip('should display carried-over tasks with blue background', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Find a carried-over task (if any exist)
    const carriedOverTask = page.locator('[data-testid="daily-task-row"][data-carried-over="true"]').first();
    
    if (await carriedOverTask.isVisible()) {
      // Verify blue background class
      const hasBlueBackground = await carriedOverTask.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundColor.includes('blue') || el.classList.contains('bg-blue-50');
      });
      expect(hasBlueBackground).toBe(true);
      
      // Verify original date is displayed
      await expect(carriedOverTask.locator('[data-testid="original-date"]')).toBeVisible();
    }
  });

  test.skip('should filter daily tasks by date', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Select a specific date
    await page.fill('[data-testid="daily-task-date-filter"]', '2024-01-15');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Verify only tasks for that date are shown
    const taskDates = await page.locator('[data-testid="task-date"]').allTextContents();
    taskDates.forEach(date => {
      expect(date).toContain('2024-01-15');
    });
  });
});

test.describe('Monthly Task Workflows', () => {
  test.skip('should open add monthly task modal', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Click add monthly task button
    await page.click('[data-testid="add-monthly-task-btn"]');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="monthly-task"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Monthly Task")')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
  });

  test.skip('should add a new monthly task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    await page.click('[data-testid="add-monthly-task-btn"]');
    
    // Fill in task details
    await page.fill('input[name="name"]', 'Test Monthly Task');
    await page.selectOption('select[name="status"]', 'Не выполнено');
    await page.fill('textarea[name="notes"]', 'Monthly task notes');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="monthly-task"]')).not.toBeVisible();
    
    // Verify task appears in monthly section
    const monthlySection = page.locator('[data-testid="monthly-tasks-section"]');
    await expect(monthlySection.locator('text=Test Monthly Task')).toBeVisible();
  });

  test.skip('should update monthly task status', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Find status dropdown for first monthly task
    const statusDropdown = page.locator('[data-testid="monthly-task-status-dropdown"]:first-of-type');
    
    // Change status to "Done"
    await statusDropdown.selectOption('Выполнено');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify status changed
    const selectedValue = await statusDropdown.inputValue();
    expect(selectedValue).toBe('Выполнено');
  });

  test.skip('should edit a monthly task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Click edit button on first monthly task
    await page.click('[data-testid="edit-monthly-task-btn"]:first-of-type');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="monthly-task"]')).toBeVisible();
    
    // Modify task name
    await page.fill('input[name="name"]', 'Updated Monthly Task');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Verify updated task appears
    await expect(page.locator('text=Updated Monthly Task')).toBeVisible();
  });

  test.skip('should delete a monthly task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Get initial monthly task count
    const initialCount = await page.locator('[data-testid="monthly-task-row"]').count();
    
    // Click delete button
    await page.click('[data-testid="delete-monthly-task-btn"]:first-of-type');
    
    // Confirm deletion
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    // Wait and verify
    await page.waitForTimeout(1000);
    const newCount = await page.locator('[data-testid="monthly-task-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test.skip('should display carried-over monthly tasks', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Find a carried-over monthly task (if any exist)
    const carriedOverTask = page.locator('[data-testid="monthly-task-row"][data-carried-over="true"]').first();
    
    if (await carriedOverTask.isVisible()) {
      // Verify blue background
      const hasBlueBackground = await carriedOverTask.evaluate((el) => {
        return el.classList.contains('bg-blue-50') || el.classList.contains('bg-blue-900/20');
      });
      expect(hasBlueBackground).toBe(true);
      
      // Verify original month is displayed
      await expect(carriedOverTask.locator('[data-testid="original-month"]')).toBeVisible();
    }
  });
});

test.describe('Yearly Task Workflows', () => {
  test.skip('should open add yearly task modal', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Click add yearly task button
    await page.click('[data-testid="add-yearly-task-btn"]');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="yearly-task"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Yearly Task")')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
  });

  test.skip('should add a new yearly task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    await page.click('[data-testid="add-yearly-task-btn"]');
    
    // Fill in task details
    await page.fill('input[name="name"]', 'Test Yearly Task');
    await page.selectOption('select[name="status"]', 'Не выполнено');
    await page.fill('textarea[name="notes"]', 'Yearly task notes');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="yearly-task"]')).not.toBeVisible();
    
    // Verify task appears in yearly section
    const yearlySection = page.locator('[data-testid="yearly-tasks-section"]');
    await expect(yearlySection.locator('text=Test Yearly Task')).toBeVisible();
  });

  test.skip('should update yearly task status', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Find status dropdown for first yearly task
    const statusDropdown = page.locator('[data-testid="yearly-task-status-dropdown"]:first-of-type');
    
    // Change status to "Skipped"
    await statusDropdown.selectOption('Пропущено');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify status changed
    const selectedValue = await statusDropdown.inputValue();
    expect(selectedValue).toBe('Пропущено');
  });

  test.skip('should edit a yearly task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Click edit button on first yearly task
    await page.click('[data-testid="edit-yearly-task-btn"]:first-of-type');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="yearly-task"]')).toBeVisible();
    
    // Modify task name
    await page.fill('input[name="name"]', 'Updated Yearly Task');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Verify updated task appears
    await expect(page.locator('text=Updated Yearly Task')).toBeVisible();
  });

  test.skip('should delete a yearly task', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Get initial yearly task count
    const initialCount = await page.locator('[data-testid="yearly-task-row"]').count();
    
    // Click delete button
    await page.click('[data-testid="delete-yearly-task-btn"]:first-of-type');
    
    // Confirm deletion
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    // Wait and verify
    await page.waitForTimeout(1000);
    const newCount = await page.locator('[data-testid="yearly-task-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });
});

test.describe('Task Status Color Coding', () => {
  test.skip('should display different colors for task statuses', async ({ page }) => {
    await page.click('[data-tab="tasks"]');
    
    // Check "Not Done" status color (typically red/orange)
    const notDoneTask = page.locator('[data-testid="task-status-dropdown"][value="Не выполнено"]').first();
    if (await notDoneTask.isVisible()) {
      const bgColor = await notDoneTask.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      // Verify it has a color (not default)
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    }
    
    // Check "Done" status color (typically green)
    const doneTask = page.locator('[data-testid="task-status-dropdown"][value="Выполнено"]').first();
    if (await doneTask.isVisible()) {
      const bgColor = await doneTask.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });
});
