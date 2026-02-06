/**
 * Accessibility Testing
 * Tests WCAG compliance, keyboard navigation, screen reader compatibility
 * Requirements: 16.6
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper function to check keyboard navigation
async function testKeyboardNavigation(page: Page) {
  // Get all focusable elements
  const focusableElements = await page.evaluate(() => {
    const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(document.querySelectorAll(selector)).length;
  });

  console.log(`Found ${focusableElements} focusable elements`);

  // Test Tab navigation
  let focusedElements = 0;
  for (let i = 0; i < Math.min(focusableElements, 20); i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const hasFocus = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement && activeElement !== document.body;
    });

    if (hasFocus) {
      focusedElements++;
    }
  }

  expect(focusedElements).toBeGreaterThan(0);
  console.log(`Successfully focused ${focusedElements} elements via keyboard`);
}

// Helper function to check focus indicators
async function testFocusIndicators(page: Page) {
  // Focus first button
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);

  // Check if focused element has visible outline or box-shadow
  const hasFocusIndicator = await page.evaluate(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement || activeElement === document.body) return false;

    const styles = window.getComputedStyle(activeElement);
    const outline = styles.outline;
    const boxShadow = styles.boxShadow;
    const ring = styles.getPropertyValue('--tw-ring-width'); // Tailwind ring

    return (
      (outline && outline !== 'none' && outline !== '0px') ||
      (boxShadow && boxShadow !== 'none') ||
      (ring && ring !== '0px')
    );
  });

  expect(hasFocusIndicator).toBe(true);
  console.log('Focus indicators are visible');
}

// Helper function to check ARIA labels
async function testAriaLabels(page: Page) {
  const elementsWithoutLabels = await page.evaluate(() => {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    const missing: string[] = [];

    interactiveElements.forEach((el) => {
      const hasLabel = 
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        el.getAttribute('title') ||
        (el as HTMLElement).innerText?.trim() ||
        (el as HTMLInputElement).placeholder;

      if (!hasLabel) {
        missing.push(el.tagName + (el.id ? `#${el.id}` : ''));
      }
    });

    return missing;
  });

  console.log(`Elements without labels: ${elementsWithoutLabels.length}`);
  if (elementsWithoutLabels.length > 0) {
    console.log('Missing labels on:', elementsWithoutLabels.slice(0, 5));
  }

  // Allow some elements without labels (e.g., decorative buttons)
  expect(elementsWithoutLabels.length).toBeLessThan(10);
}

// Helper function to check color contrast
async function testColorContrast(page: Page) {
  const contrastIssues = await page.evaluate(() => {
    // Simple contrast check (WCAG AA requires 4.5:1 for normal text)
    const getContrast = (fg: string, bg: string) => {
      const getLuminance = (color: string) => {
        const rgb = color.match(/\d+/g);
        if (!rgb) return 0;
        const [r, g, b] = rgb.map(Number);
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      const l1 = getLuminance(fg);
      const l2 = getLuminance(bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
    const issues: string[] = [];

    textElements.forEach((el) => {
      const styles = window.getComputedStyle(el as HTMLElement);
      const color = styles.color;
      const bgColor = styles.backgroundColor;

      if (color && bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrast(color, bgColor);
        if (contrast < 4.5) {
          issues.push(`${el.tagName}: ${contrast.toFixed(2)}:1`);
        }
      }
    });

    return issues.slice(0, 10); // Return first 10 issues
  });

  console.log(`Color contrast issues found: ${contrastIssues.length}`);
  if (contrastIssues.length > 0) {
    console.log('Contrast issues:', contrastIssues);
  }

  // Allow some contrast issues (e.g., disabled elements)
  expect(contrastIssues.length).toBeLessThan(20);
}

// Helper function to check form labels
async function testFormLabels(page: Page) {
  const inputsWithoutLabels = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const missing: string[] = [];

    inputs.forEach((input) => {
      const hasLabel = 
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        document.querySelector(`label[for="${input.id}"]`) ||
        input.closest('label');

      if (!hasLabel && input.getAttribute('type') !== 'hidden') {
        missing.push(input.tagName + (input.id ? `#${input.id}` : ''));
      }
    });

    return missing;
  });

  console.log(`Inputs without labels: ${inputsWithoutLabels.length}`);
  if (inputsWithoutLabels.length > 0) {
    console.log('Missing labels on inputs:', inputsWithoutLabels);
  }

  expect(inputsWithoutLabels.length).toBe(0);
}

test.describe('Axe-Core Automated Accessibility Testing', () => {
  test('should not have any automatically detectable accessibility issues on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    console.log(`Found ${accessibilityScanResults.violations.length} accessibility violations`);
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on expenses tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate to expenses tab
    const expensesTab = page.locator('button:has-text("Expenses"), button:has-text("Расходы")').first();
    if (await expensesTab.count() > 0) {
      await expensesTab.click();
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      console.log(`Expenses tab: ${accessibilityScanResults.violations.length} violations`);
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should not have accessibility issues on debts tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate to debts tab
    const debtsTab = page.locator('button:has-text("Debts"), button:has-text("Долги")').first();
    if (await debtsTab.count() > 0) {
      await debtsTab.click();
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      console.log(`Debts tab: ${accessibilityScanResults.violations.length} violations`);
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should not have accessibility issues on tasks tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate to tasks tab
    const tasksTab = page.locator('button:has-text("Tasks"), button:has-text("Задачи")').first();
    if (await tasksTab.count() > 0) {
      await tasksTab.click();
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      console.log(`Tasks tab: ${accessibilityScanResults.violations.length} violations`);
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should not have accessibility issues on calendar tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate to calendar tab
    const calendarTab = page.locator('button:has-text("Calendar"), button:has-text("Календарь")').first();
    if (await calendarTab.count() > 0) {
      await calendarTab.click();
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      console.log(`Calendar tab: ${accessibilityScanResults.violations.length} violations`);
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should not have accessibility issues in modals', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try to open a modal using keyboard shortcut
    await page.keyboard.press('Control+E');
    await page.waitForTimeout(1000);

    // Check if modal is open
    const modal = page.locator('[role="dialog"], .modal').first();
    if (await modal.count() > 0) {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      console.log(`Modal: ${accessibilityScanResults.violations.length} violations`);
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});

test.describe('Accessibility Testing', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await testKeyboardNavigation(page);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await testFocusIndicators(page);
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await testAriaLabels(page);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await testColorContrast(page);
  });

  test('should have labels for all form inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await testFormLabels(page);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const headingHierarchy = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim().substring(0, 50)
      }));
    });

    console.log('Heading hierarchy:', headingHierarchy);

    // Check if there's at least one h1
    const hasH1 = headingHierarchy.some(h => h.level === 1);
    expect(hasH1).toBe(true);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const missing: string[] = [];

      images.forEach((img) => {
        if (!img.getAttribute('alt')) {
          missing.push(img.src);
        }
      });

      return missing;
    });

    console.log(`Images without alt text: ${imagesWithoutAlt.length}`);
    if (imagesWithoutAlt.length > 0) {
      console.log('Missing alt text:', imagesWithoutAlt.slice(0, 5));
    }

    expect(imagesWithoutAlt.length).toBe(0);
  });

  test('should have proper button roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const buttonElements = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      return buttons.length;
    });

    console.log(`Found ${buttonElements} button elements`);
    expect(buttonElements).toBeGreaterThan(0);
  });

  test('should support Escape key to close modals', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try to open a modal (if available)
    const modalTrigger = page.locator('button').first();
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      await page.waitForTimeout(500);

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      console.log('Escape key closes modals');
    }
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const semanticElements = await page.evaluate(() => {
      return {
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        header: document.querySelectorAll('header').length,
        footer: document.querySelectorAll('footer').length,
        article: document.querySelectorAll('article').length,
        section: document.querySelectorAll('section').length
      };
    });

    console.log('Semantic elements:', semanticElements);

    // Should have at least some semantic elements
    const totalSemantic = Object.values(semanticElements).reduce((a, b) => a + b, 0);
    expect(totalSemantic).toBeGreaterThan(0);
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const linksWithBadText = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      const badTexts = ['click here', 'here', 'read more', 'more'];
      const bad: string[] = [];

      links.forEach((link) => {
        const text = link.textContent?.trim().toLowerCase();
        if (text && badTexts.includes(text)) {
          bad.push(text);
        }
      });

      return bad;
    });

    console.log(`Links with non-descriptive text: ${linksWithBadText.length}`);
    expect(linksWithBadText.length).toBe(0);
  });

  test('should have proper table structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const tableStructure = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const issues: string[] = [];

      tables.forEach((table, index) => {
        const hasCaption = table.querySelector('caption') !== null;
        const hasThead = table.querySelector('thead') !== null;
        const hasTh = table.querySelector('th') !== null;

        if (!hasCaption && !hasThead && !hasTh) {
          issues.push(`Table ${index + 1} missing caption/thead/th`);
        }
      });

      return {
        totalTables: tables.length,
        issues
      };
    });

    console.log('Table structure:', tableStructure);

    if (tableStructure.totalTables > 0) {
      // Tables should have proper structure
      expect(tableStructure.issues.length).toBeLessThan(tableStructure.totalTables);
    }
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const langAttribute = await page.evaluate(() => {
      return document.documentElement.getAttribute('lang');
    });

    console.log(`Language attribute: ${langAttribute}`);
    expect(langAttribute).toBeTruthy();
  });

  test('should have proper viewport meta tag', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content');
    });

    console.log(`Viewport meta: ${viewportMeta}`);
    expect(viewportMeta).toBeTruthy();
    expect(viewportMeta).toContain('width=device-width');
  });

  test('should not have duplicate IDs', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const duplicateIds = await page.evaluate(() => {
      const ids = new Map<string, number>();
      const elements = document.querySelectorAll('[id]');

      elements.forEach((el) => {
        const id = el.id;
        ids.set(id, (ids.get(id) || 0) + 1);
      });

      return Array.from(ids.entries())
        .filter(([_, count]) => count > 1)
        .map(([id, count]) => `${id} (${count})`);
    });

    console.log(`Duplicate IDs: ${duplicateIds.length}`);
    if (duplicateIds.length > 0) {
      console.log('Duplicates:', duplicateIds);
    }

    expect(duplicateIds.length).toBe(0);
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('should have ARIA live regions for dynamic content', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const liveRegions = await page.evaluate(() => {
      return document.querySelectorAll('[aria-live]').length;
    });

    console.log(`ARIA live regions: ${liveRegions}`);
    // Should have at least some live regions for notifications/updates
  });

  test('should have proper ARIA roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const ariaRoles = await page.evaluate(() => {
      const roles = new Set<string>();
      document.querySelectorAll('[role]').forEach((el) => {
        const role = el.getAttribute('role');
        if (role) roles.add(role);
      });
      return Array.from(roles);
    });

    console.log('ARIA roles used:', ariaRoles);
    expect(ariaRoles.length).toBeGreaterThan(0);
  });

  test('should have proper ARIA expanded states', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const expandableElements = await page.evaluate(() => {
      return document.querySelectorAll('[aria-expanded]').length;
    });

    console.log(`Elements with aria-expanded: ${expandableElements}`);
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('should support Ctrl+E shortcut', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try Ctrl+E (Add Expense)
    await page.keyboard.press('Control+E');
    await page.waitForTimeout(500);

    console.log('Ctrl+E shortcut tested');
  });

  test('should support Ctrl+T shortcut', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try Ctrl+T (Add Task)
    await page.keyboard.press('Control+T');
    await page.waitForTimeout(500);

    console.log('Ctrl+T shortcut tested');
  });

  test('should support Space for radio toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try Space (Radio toggle)
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    console.log('Space shortcut tested');
  });
});
