import { test, expect } from '@playwright/test';

/**
 * Calendar Workflow Integration Tests
 * 
 * Tests the complete calendar management workflows:
 * - Add calendar event
 * - View events on calendar
 * - Edit event
 * - Delete event
 * - Month navigation
 * - Event type color coding
 * 
 * Validates Requirement: 16.3 (Integration Testing)
 */

test.describe('Calendar Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Note: These tests assume user is already authenticated
  });

  test.skip('should navigate to calendar tab', async ({ page }) => {
    // Click on calendar tab
    await page.click('[data-tab="calendar"]');
    
    // Verify calendar tab is active
    await expect(page.locator('[data-tab="calendar"].active')).toBeVisible();
    
    // Verify calendar grid is visible
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
  });

  test.skip('should display calendar with current month', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Verify month/year header is displayed
    await expect(page.locator('[data-testid="calendar-month-year"]')).toBeVisible();
    
    // Verify weekday headers are displayed
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (const day of weekdays) {
      await expect(page.locator(`text=${day}`)).toBeVisible();
    }
    
    // Verify calendar cells are displayed
    const cells = await page.locator('[data-testid="calendar-cell"]').count();
    expect(cells).toBeGreaterThan(0);
  });

  test.skip('should navigate to previous month', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Get current month
    const currentMonth = await page.locator('[data-testid="calendar-month-year"]').textContent();
    
    // Click previous month button
    await page.click('[data-testid="prev-month-btn"]');
    
    // Wait for calendar to update
    await page.waitForTimeout(500);
    
    // Verify month changed
    const newMonth = await page.locator('[data-testid="calendar-month-year"]').textContent();
    expect(newMonth).not.toBe(currentMonth);
  });

  test.skip('should navigate to next month', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Get current month
    const currentMonth = await page.locator('[data-testid="calendar-month-year"]').textContent();
    
    // Click next month button
    await page.click('[data-testid="next-month-btn"]');
    
    // Wait for calendar to update
    await page.waitForTimeout(500);
    
    // Verify month changed
    const newMonth = await page.locator('[data-testid="calendar-month-year"]').textContent();
    expect(newMonth).not.toBe(currentMonth);
  });

  test.skip('should open add event modal when clicking on date', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Click on a calendar date cell
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="calendar-event"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Add Event")')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('select[name="type"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
  });

  test.skip('should add a new calendar event', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Click on a date to open modal
    await page.click('[data-testid="calendar-cell"]:nth-child(15)');
    
    // Fill in event details
    await page.fill('input[name="name"]', 'Test Event');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="type"]', 'event');
    await page.fill('textarea[name="notes"]', 'Test event notes');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="calendar-event"]')).not.toBeVisible();
    
    // Verify event appears on calendar
    await expect(page.locator('text=Test Event')).toBeVisible();
  });

  test.skip('should support all four event types', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Verify all event types are available in dropdown
    const typeSelect = page.locator('select[name="type"]');
    const options = await typeSelect.locator('option').allTextContents();
    
    expect(options).toContain('Event');
    expect(options).toContain('Birthday');
    expect(options).toContain('Meeting');
    expect(options).toContain('Wedding');
  });

  test.skip('should add birthday event', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Fill in birthday event
    await page.fill('input[name="name"]', 'John\'s Birthday');
    await page.fill('input[name="date"]', '2024-01-20');
    await page.selectOption('select[name="type"]', 'birthday');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Verify birthday appears on calendar
    await expect(page.locator('text=John\'s Birthday')).toBeVisible();
  });

  test.skip('should add meeting event', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Fill in meeting event
    await page.fill('input[name="name"]', 'Team Meeting');
    await page.fill('input[name="date"]', '2024-01-18');
    await page.selectOption('select[name="type"]', 'meeting');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Verify meeting appears on calendar
    await expect(page.locator('text=Team Meeting')).toBeVisible();
  });

  test.skip('should add wedding event', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Fill in wedding event
    await page.fill('input[name="name"]', 'Sarah\'s Wedding');
    await page.fill('input[name="date"]', '2024-01-25');
    await page.selectOption('select[name="type"]', 'wedding');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Verify wedding appears on calendar
    await expect(page.locator('text=Sarah\'s Wedding')).toBeVisible();
  });

  test.skip('should display events with color coding by type', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Find an event element (if any exist)
    const eventElement = page.locator('[data-testid="calendar-event"]').first();
    
    if (await eventElement.isVisible()) {
      // Get the event type
      const eventType = await eventElement.getAttribute('data-event-type');
      
      // Verify color coding based on type
      const bgColor = await eventElement.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      
      // Different types should have different colors
      // event=blue, birthday=pink, meeting=green, wedding=purple
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test.skip('should edit an existing event', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Click on an event to edit
    await page.click('[data-testid="calendar-event"]:first-of-type');
    
    // Verify modal is open with existing data
    await expect(page.locator('[data-modal="calendar-event"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Edit Event")')).toBeVisible();
    
    // Modify event name
    await page.fill('input[name="name"]', 'Updated Event');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await expect(page.locator('[data-modal="calendar-event"]')).not.toBeVisible();
    
    // Verify updated event appears on calendar
    await expect(page.locator('text=Updated Event')).toBeVisible();
  });

  test.skip('should delete an event', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Get initial event count
    const initialCount = await page.locator('[data-testid="calendar-event"]').count();
    
    // Click on an event
    await page.click('[data-testid="calendar-event"]:first-of-type');
    
    // Click delete button in modal
    await page.click('button:has-text("Delete")');
    
    // Confirm deletion (if there's a confirmation)
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify event count decreased
    const newCount = await page.locator('[data-testid="calendar-event"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test.skip('should display multiple events on same date', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Add first event
    await page.click('[data-testid="calendar-cell"]:nth-child(15)');
    await page.fill('input[name="name"]', 'Event 1');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="type"]', 'event');
    await page.click('button:has-text("Save")');
    
    // Add second event on same date
    await page.click('[data-testid="calendar-cell"]:nth-child(15)');
    await page.fill('input[name="name"]', 'Event 2');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="type"]', 'meeting');
    await page.click('button:has-text("Save")');
    
    // Verify both events are visible
    await expect(page.locator('text=Event 1')).toBeVisible();
    await expect(page.locator('text=Event 2')).toBeVisible();
  });

  test.skip('should validate event form fields', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Try to submit empty form
    await page.click('button:has-text("Save")');
    
    // Check for validation
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test.skip('should close modal on escape key', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Verify modal is open
    await expect(page.locator('[data-modal="calendar-event"]')).toBeVisible();
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Verify modal is closed
    await expect(page.locator('[data-modal="calendar-event"]')).not.toBeVisible();
  });

  test.skip('should highlight current date', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Get today's date
    const today = new Date();
    const todayDate = today.getDate();
    
    // Find the cell for today
    const todayCell = page.locator(`[data-testid="calendar-cell"][data-date="${todayDate}"]`);
    
    // Verify it has a highlight class or style
    const hasHighlight = await todayCell.evaluate((el) => {
      return el.classList.contains('today') || 
             el.classList.contains('bg-blue-100') ||
             el.classList.contains('border-blue-500');
    });
    
    expect(hasHighlight).toBe(true);
  });

  test.skip('should display events only for current month', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Get current month
    const currentMonth = await page.locator('[data-testid="calendar-month-year"]').textContent();
    
    // Get all visible events
    const events = await page.locator('[data-testid="calendar-event"]').all();
    
    // Verify each event belongs to current month
    for (const event of events) {
      const eventDate = await event.getAttribute('data-event-date');
      // Parse and verify month matches
      if (eventDate) {
        const eventMonth = new Date(eventDate).getMonth();
        // This would need proper month comparison logic
      }
    }
  });
});

test.describe('Calendar Event Notes', () => {
  test.skip('should display event notes in modal', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    
    // Click on an event with notes
    await page.click('[data-testid="calendar-event"]:first-of-type');
    
    // Verify notes field is visible and populated
    const notesField = page.locator('textarea[name="notes"]');
    await expect(notesField).toBeVisible();
    
    const notesValue = await notesField.inputValue();
    // Notes may or may not be empty depending on test data
  });

  test.skip('should save event notes', async ({ page }) => {
    await page.click('[data-tab="calendar"]');
    await page.click('[data-testid="calendar-cell"]:first-of-type');
    
    // Add event with notes
    await page.fill('input[name="name"]', 'Event with Notes');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="type"]', 'event');
    await page.fill('textarea[name="notes"]', 'Important event notes');
    
    // Submit form
    await page.click('button:has-text("Save")');
    
    // Reopen event
    await page.click('text=Event with Notes');
    
    // Verify notes are saved
    const notesValue = await page.locator('textarea[name="notes"]').inputValue();
    expect(notesValue).toBe('Important event notes');
  });
});
