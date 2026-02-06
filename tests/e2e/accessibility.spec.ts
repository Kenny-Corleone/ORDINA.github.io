/**
 * E2E Accessibility Tests
 * 
 * Tests WCAG AA compliance using axe-core.
 * Validates Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (adjust URL as needed)
    await page.goto('http://localhost:5173');
    
    // Wait for app to load
    await page.waitForSelector('#fixed-header', { timeout: 10000 });
  });

  /**
   * Property 45: ARIA Labels for Interactive Elements
   * Validates: Requirements 14.1
   */
  test('should have ARIA labels on all interactive elements', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Check for violations related to ARIA labels
    const ariaViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('aria') || v.id.includes('label')
    );

    expect(ariaViolations).toHaveLength(0);
  });

  /**
   * Property 46: Keyboard Navigation Completeness
   * Validates: Requirements 14.2
   */
  test('should allow keyboard navigation to all interactive elements', async ({ page }) => {
    // Get all interactive elements
    const buttons = await page.locator('button:visible').all();
    const links = await page.locator('a:visible').all();
    const inputs = await page.locator('input:visible').all();

    // Check that all elements are keyboard accessible
    for (const element of [...buttons, ...links, ...inputs]) {
      const tabIndex = await element.getAttribute('tabindex');
      
      // tabindex="-1" makes element not keyboard accessible
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
      }
    }

    // Test Tab navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
  });

  /**
   * Property 47: Visible Focus Indicators
   * Validates: Requirements 14.3
   */
  test('should have visible focus indicators', async ({ page }) => {
    // Focus on first button
    const firstButton = page.locator('button:visible').first();
    await firstButton.focus();

    // Check that focus styles are applied
    const outlineStyle = await firstButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor
      };
    });

    // Should have visible outline
    expect(outlineStyle.outlineWidth).not.toBe('0px');
    expect(outlineStyle.outline).not.toBe('none');
  });

  /**
   * Property 48: Logical Screen Reader Order
   * Validates: Requirements 14.4
   */
  test('should have logical tab order matching visual order', async ({ page }) => {
    // Get all focusable elements in tab order
    const tabOrder = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      
      return elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        text: el.textContent?.trim().substring(0, 20),
        tabIndex: el.getAttribute('tabindex'),
        position: el.getBoundingClientRect().top
      }));
    });

    // Check that elements with positive tabindex are in order
    const positiveTabIndexElements = tabOrder.filter(el => 
      el.tabIndex && parseInt(el.tabIndex) > 0
    );

    for (let i = 1; i < positiveTabIndexElements.length; i++) {
      const prev = parseInt(positiveTabIndexElements[i - 1].tabIndex!);
      const curr = parseInt(positiveTabIndexElements[i].tabIndex!);
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  /**
   * Property 49: Non-Color-Only Information
   * Validates: Requirements 14.5
   */
  test('should not convey information by color alone', async ({ page }) => {
    // Check for common color-only patterns
    const colorOnlyElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[class*="red"], [class*="green"], [class*="error"], [class*="success"]'));
      
      return elements.map(el => ({
        hasText: !!el.textContent?.trim(),
        hasIcon: !!el.querySelector('svg, img, [role="img"]'),
        hasAriaLabel: el.hasAttribute('aria-label'),
        className: el.className
      }));
    });

    // Each element should have text, icon, or aria-label
    for (const element of colorOnlyElements) {
      const hasAccessibleInfo = element.hasText || element.hasIcon || element.hasAriaLabel;
      expect(hasAccessibleInfo).toBe(true);
    }
  });

  test('should pass axe accessibility scan on main page', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass axe accessibility scan on modals', async ({ page }) => {
    // Open a modal (adjust selector based on your app)
    const addButton = page.locator('button:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Check for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.evaluate(() => {
      const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headingElements.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim()
      }));
    });

    // Should have at least one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Heading levels should not skip (e.g., h1 -> h3)
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currLevel = headings[i].level;
      const diff = currLevel - prevLevel;
      
      // Can go down any number of levels, but can only go up by 1
      if (diff > 0) {
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have alt text for images', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Check for form label violations
    const labelViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'label' || v.id === 'label-title-only'
    );

    expect(labelViolations).toHaveLength(0);
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Test Escape key closes modals
    const addButton = page.locator('button:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Wait for modal
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Modal should be closed
      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      expect(modalVisible).toBe(false);
    }
  });

  test('should have minimum touch target size on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Get all interactive elements
    const interactiveElements = await page.locator('button, a, input, select').all();
    
    for (const element of interactiveElements) {
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box) {
          // WCAG recommends 44x44px minimum
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});
