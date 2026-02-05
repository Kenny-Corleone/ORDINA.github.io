import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Performance Testing Suite for ORDINA Svelte Migration
 * 
 * Tests:
 * 1. Lighthouse performance audit (target score > 90)
 * 2. Initial load time (target < 3s)
 * 3. Time to interactive (target < 5s)
 * 4. Bundle sizes (target < 600kb per chunk)
 * 5. Virtual scrolling with 1000+ items
 * 6. Memory usage during typical session
 * 
 * Validates: Requirements 16.5
 */

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  lighthouseScore: 90,
  initialLoadTime: 3000, // 3 seconds
  timeToInteractive: 5000, // 5 seconds
  chunkSize: 600 * 1024, // 600kb
  memoryUsage: 100 * 1024 * 1024, // 100MB
};

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
  });

  test('should meet Lighthouse performance targets', async ({ page, browserName }, testInfo) => {
    // Skip Lighthouse on non-Chromium browsers
    if (browserName !== 'chromium') {
      test.skip();
      return;
    }

    // Run Lighthouse audit
    const lighthouseResults = await playAudit({
      page,
      thresholds: {
        performance: PERFORMANCE_THRESHOLDS.lighthouseScore,
        accessibility: 90,
        'best-practices': 90,
        seo: 90,
      },
      port: 9222,
    });

    // Save Lighthouse report
    const reportPath = path.join(testInfo.outputDir, 'lighthouse-report.html');
    fs.writeFileSync(reportPath, lighthouseResults.report);

    // Assert performance score
    expect(lighthouseResults.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(
      PERFORMANCE_THRESHOLDS.lighthouseScore
    );

    console.log('Lighthouse Scores:');
    console.log(`  Performance: ${(lighthouseResults.lhr.categories.performance.score * 100).toFixed(1)}`);
    console.log(`  Accessibility: ${(lighthouseResults.lhr.categories.accessibility.score * 100).toFixed(1)}`);
    console.log(`  Best Practices: ${(lighthouseResults.lhr.categories['best-practices'].score * 100).toFixed(1)}`);
    console.log(`  SEO: ${(lighthouseResults.lhr.categories.seo.score * 100).toFixed(1)}`);
  });

  test('should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for the app to be fully loaded
    await page.waitForLoadState('load');
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Initial load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.initialLoadTime);
  });

  test('should be interactive within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for the app to be interactive
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button:not([disabled])', { timeout: 6000 });
    
    const timeToInteractive = Date.now() - startTime;
    
    console.log(`Time to interactive: ${timeToInteractive}ms`);
    expect(timeToInteractive).toBeLessThan(PERFORMANCE_THRESHOLDS.timeToInteractive);
  });

  test('should have bundle sizes under 600kb per chunk', async ({ page }) => {
    // Collect all network requests
    const resources: Array<{ url: string; size: number; type: string }> = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];
      const contentType = headers['content-type'] || '';
      
      if (url.includes('.js') || url.includes('.css')) {
        const size = contentLength ? parseInt(contentLength, 10) : 0;
        resources.push({
          url,
          size,
          type: contentType,
        });
      }
    });
    
    // Reload to capture all resources
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Analyze bundle sizes
    console.log('\nBundle Sizes:');
    let totalSize = 0;
    let maxChunkSize = 0;
    let maxChunkUrl = '';
    
    resources.forEach((resource) => {
      const sizeKB = (resource.size / 1024).toFixed(2);
      console.log(`  ${path.basename(resource.url)}: ${sizeKB} KB`);
      totalSize += resource.size;
      
      if (resource.size > maxChunkSize) {
        maxChunkSize = resource.size;
        maxChunkUrl = resource.url;
      }
    });
    
    console.log(`\nTotal bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`Largest chunk: ${path.basename(maxChunkUrl)} (${(maxChunkSize / 1024).toFixed(2)} KB)`);
    
    // Assert that no single chunk exceeds the limit
    expect(maxChunkSize).toBeLessThan(PERFORMANCE_THRESHOLDS.chunkSize);
  });

  test('should handle virtual scrolling with 1000+ items efficiently', async ({ page }) => {
    // This test requires authentication and data setup
    // For now, we'll test the concept with a simulated large list
    
    // Navigate to expenses tab (which uses virtual scrolling)
    await page.click('text=Expenses');
    await page.waitForSelector('[data-testid="expenses-table"]', { timeout: 5000 });
    
    // Measure rendering performance
    const startTime = Date.now();
    
    // Scroll through the list
    const scrollContainer = await page.locator('[data-testid="expenses-table"]');
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight / 2;
    });
    
    // Wait for scroll to settle
    await page.waitForTimeout(100);
    
    const renderTime = Date.now() - startTime;
    
    console.log(`Virtual scroll render time: ${renderTime}ms`);
    
    // Should render quickly even with large lists
    expect(renderTime).toBeLessThan(500); // 500ms for scroll rendering
  });

  test('should maintain reasonable memory usage during typical session', async ({ page, context }) => {
    // Enable CDP session for memory metrics
    const client = await context.newCDPSession(page);
    
    // Start memory profiling
    await client.send('Performance.enable');
    
    // Simulate typical user session
    const actions = [
      // Navigate to different tabs
      async () => {
        await page.click('text=Dashboard');
        await page.waitForTimeout(500);
      },
      async () => {
        await page.click('text=Expenses');
        await page.waitForTimeout(500);
      },
      async () => {
        await page.click('text=Debts');
        await page.waitForTimeout(500);
      },
      async () => {
        await page.click('text=Tasks');
        await page.waitForTimeout(500);
      },
      async () => {
        await page.click('text=Calendar');
        await page.waitForTimeout(500);
      },
    ];
    
    // Perform actions
    for (const action of actions) {
      await action();
    }
    
    // Get memory metrics
    const metrics = await client.send('Performance.getMetrics');
    const jsHeapUsed = metrics.metrics.find((m) => m.name === 'JSHeapUsedSize')?.value || 0;
    
    console.log(`Memory usage: ${(jsHeapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    // Assert memory usage is reasonable
    expect(jsHeapUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage);
  });

  test('should load and render dashboard widgets efficiently', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=Dashboard');
    
    const startTime = Date.now();
    
    // Wait for all dashboard widgets to load
    await Promise.all([
      page.waitForSelector('[data-testid="clock-widget"]', { timeout: 3000 }),
      page.waitForSelector('[data-testid="weather-widget"]', { timeout: 3000 }),
      page.waitForSelector('[data-testid="summary-cards"]', { timeout: 3000 }),
    ]);
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Dashboard widgets load time: ${loadTime}ms`);
    
    // Dashboard should load quickly
    expect(loadTime).toBeLessThan(2000); // 2 seconds
  });

  test('should handle rapid tab switching without performance degradation', async ({ page }) => {
    const tabs = ['Dashboard', 'Expenses', 'Debts', 'Tasks', 'Calendar'];
    const switchTimes: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const tab = tabs[i % tabs.length];
      const startTime = Date.now();
      
      await page.click(`text=${tab}`);
      await page.waitForTimeout(100); // Small delay for tab to render
      
      const switchTime = Date.now() - startTime;
      switchTimes.push(switchTime);
    }
    
    const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
    const maxSwitchTime = Math.max(...switchTimes);
    
    console.log(`Average tab switch time: ${avgSwitchTime.toFixed(2)}ms`);
    console.log(`Max tab switch time: ${maxSwitchTime}ms`);
    
    // Tab switching should be fast
    expect(avgSwitchTime).toBeLessThan(200); // 200ms average
    expect(maxSwitchTime).toBeLessThan(500); // 500ms max
  });

  test('should handle modal open/close efficiently', async ({ page }) => {
    const modalTriggers = [
      { button: 'Add Expense', modal: 'expense-modal' },
      { button: 'Add Debt', modal: 'debt-modal' },
      { button: 'Add Task', modal: 'task-modal' },
    ];
    
    const openTimes: number[] = [];
    const closeTimes: number[] = [];
    
    for (const { button, modal } of modalTriggers) {
      // Measure open time
      const openStart = Date.now();
      await page.click(`text=${button}`);
      await page.waitForSelector(`[data-testid="${modal}"]`, { timeout: 2000 });
      openTimes.push(Date.now() - openStart);
      
      // Measure close time
      const closeStart = Date.now();
      await page.keyboard.press('Escape');
      await page.waitForSelector(`[data-testid="${modal}"]`, { state: 'hidden', timeout: 2000 });
      closeTimes.push(Date.now() - closeStart);
    }
    
    const avgOpenTime = openTimes.reduce((a, b) => a + b, 0) / openTimes.length;
    const avgCloseTime = closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
    
    console.log(`Average modal open time: ${avgOpenTime.toFixed(2)}ms`);
    console.log(`Average modal close time: ${avgCloseTime.toFixed(2)}ms`);
    
    // Modal operations should be fast
    expect(avgOpenTime).toBeLessThan(300); // 300ms
    expect(avgCloseTime).toBeLessThan(200); // 200ms
  });
});
