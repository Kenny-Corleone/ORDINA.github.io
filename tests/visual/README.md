# Visual Regression Testing for ORDINA Svelte Migration

This directory contains visual regression tests to ensure pixel-perfect visual fidelity between the original ORDINA application and the migrated Svelte version.

## Overview

Visual regression testing compares screenshots of the migrated application against baseline screenshots to detect any visual differences. This ensures that the migration maintains 100% visual fidelity as required by **Requirements 2.1 and 16.2**.

## Test Coverage

### Tabs (6 total)
- ✅ Dashboard
- ✅ Expenses
- ✅ Debts
- ✅ Recurring Expenses
- ✅ Tasks
- ✅ Calendar

### Modals (13 total)
- ✅ Expense Modal
- ✅ Debt Modal
- ✅ Debt Payment Modal
- ✅ Recurring Expense Modal
- ✅ Daily Task Modal
- ✅ Monthly Task Modal
- ✅ Yearly Task Modal
- ✅ Calendar Event Modal
- ✅ Category Modal
- ✅ Calculator Modal
- ✅ Shopping List Modal
- ✅ Settings Modal
- ✅ Profile Modal

### Responsive Layouts (3 total)
- ✅ Mobile (375x667)
- ✅ Tablet (768x1024)
- ✅ Desktop (1920x1080)

### Themes (2 total)
- ✅ Light theme
- ✅ Dark theme

### Languages (4 total)
- ✅ English (EN)
- ✅ Russian (RU)
- ✅ Azerbaijani (AZ)
- ✅ Italian (IT)

## Test Files

### `visual-regression.spec.ts`
Comprehensive visual regression test suite that:
- Tests all tabs across all viewports, themes, and languages
- Tests all modals across all viewports, themes, and languages
- Uses Playwright's built-in screenshot comparison
- Allows 0.1% pixel difference threshold

### `capture-screenshots.spec.ts`
Simplified screenshot capture script for:
- Capturing screenshots from the migrated application
- Manual comparison with original application
- Debugging visual differences
- Creating baseline images

## Setup

### Prerequisites

1. **Test Account**: Create a test Firebase account with sample data
   ```bash
   # Set environment variables
   export TEST_EMAIL="test@ordina.com"
   export TEST_PASSWORD="testpassword123"
   ```

2. **Sample Data**: Populate the test account with:
   - At least 5 expenses
   - At least 3 debts
   - At least 2 recurring expenses
   - At least 5 tasks (daily, monthly, yearly)
   - At least 3 calendar events

3. **Dev Server**: Start the development server
   ```bash
   npm run dev
   ```

## Running Tests

### Capture Screenshots (First Time)

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Run the screenshot capture script:
   ```bash
   npx playwright test tests/visual/capture-screenshots.spec.ts
   ```

3. Screenshots will be saved in `test-results/screenshots/`

### Run Visual Regression Tests

1. Update baselines (first time only):
   ```bash
   npx playwright test tests/visual/visual-regression.spec.ts --update-snapshots
   ```

2. Run visual regression tests:
   ```bash
   npx playwright test tests/visual/visual-regression.spec.ts
   ```

3. View results:
   ```bash
   npx playwright show-report
   ```

## Comparison Process

### Manual Comparison

1. **Capture Original Screenshots**:
   - Navigate to ORDINA MAIN directory
   - Start the original application
   - Use browser DevTools to capture screenshots
   - Save in `ORDINA MAIN/screenshots/`

2. **Capture Migrated Screenshots**:
   - Run `capture-screenshots.spec.ts`
   - Screenshots saved in `ORDINA-SVELTE/test-results/screenshots/`

3. **Compare Screenshots**:
   - Use image comparison tool (e.g., ImageMagick, Pixelmatch)
   - Document differences in `VISUAL-DIFFERENCES.md`
   - Get approval for any differences

### Automated Comparison

1. **Set Baseline**:
   ```bash
   npx playwright test tests/visual/visual-regression.spec.ts --update-snapshots
   ```

2. **Run Tests**:
   ```bash
   npx playwright test tests/visual/visual-regression.spec.ts
   ```

3. **Review Failures**:
   - Failed tests indicate visual differences
   - Review diff images in `test-results/`
   - Determine if differences are acceptable
   - Update baselines if approved

## Configuration

### Playwright Configuration

The visual tests use the following Playwright configuration:

```typescript
{
  maxDiffPixels: 100,      // Allow up to 100 pixels difference
  threshold: 0.1           // 0.1% difference threshold
}
```

### Viewport Sizes

```typescript
{
  mobile: { width: 375, height: 667 },    // iPhone SE
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1920, height: 1080 }  // Full HD
}
```

## Test Matrix

Total test combinations:
- **Tabs**: 6 tabs × 3 viewports × 2 themes × 4 languages = **144 tests**
- **Modals**: 13 modals × 3 viewports × 2 themes × 4 languages = **312 tests**
- **Total**: **456 visual regression tests**

### Optimized Test Strategy

To reduce test execution time, we use a sampling strategy:

1. **Full Coverage** (Desktop, Light, EN):
   - All 6 tabs
   - All 13 modals

2. **Theme Coverage** (Desktop, EN):
   - All tabs in dark theme

3. **Responsive Coverage** (Light, EN):
   - Key tabs (Dashboard, Expenses, Tasks) in mobile
   - Key tabs in tablet

4. **Language Coverage** (Desktop, Light):
   - Dashboard in all 4 languages

This reduces tests from 456 to approximately **50 tests** while maintaining good coverage.

## Troubleshooting

### Screenshots Don't Match

1. **Check for animations**: Ensure `animations: 'disabled'` is set
2. **Check for dynamic content**: Weather, news, clock may cause differences
3. **Check for timing issues**: Add `waitForTimeout()` after navigation
4. **Check for font rendering**: Different OS may render fonts differently

### Login Fails

1. **Check credentials**: Verify TEST_EMAIL and TEST_PASSWORD
2. **Check Firebase**: Ensure test account exists
3. **Check network**: Ensure Firebase is accessible

### Modal Not Found

1. **Check data-testid**: Ensure trigger button has correct test ID
2. **Check tab**: Ensure you're on the correct tab
3. **Check permissions**: Ensure test account has necessary permissions

## Best Practices

1. **Use Test Data**: Always use a dedicated test account with consistent data
2. **Disable Animations**: Set `animations: 'disabled'` for consistent screenshots
3. **Wait for Content**: Use `waitForTimeout()` after navigation and actions
4. **Full Page Screenshots**: Use `fullPage: true` to capture entire page
5. **Document Differences**: Record any approved visual differences
6. **Update Baselines**: Only update baselines after manual review and approval

## Results Documentation

After running visual regression tests, document results in:

### `VISUAL-REGRESSION-RESULTS.md`

```markdown
# Visual Regression Test Results

## Test Date: [Date]
## Tester: [Name]

## Summary
- Total Tests: 50
- Passed: 48
- Failed: 2
- Skipped: 0

## Failed Tests

### 1. Dashboard - Dark Theme
- **Issue**: Clock widget shows different time
- **Cause**: Dynamic content (real-time clock)
- **Resolution**: Acceptable difference (dynamic content)
- **Status**: Approved

### 2. Expenses - Mobile
- **Issue**: Table layout slightly different
- **Cause**: Responsive breakpoint adjustment
- **Resolution**: Improved mobile layout
- **Status**: Approved

## Approved Differences

1. Clock widget (dynamic content)
2. Weather widget (dynamic content)
3. News widget (dynamic content)

## Conclusion

Visual regression testing completed successfully. All differences have been reviewed and approved. The migrated application maintains pixel-perfect visual fidelity with the original application, with only acceptable differences in dynamic content.
```

## Integration with CI/CD

Add visual regression tests to CI/CD pipeline:

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test tests/visual/
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-regression-results
          path: test-results/
```

## References

- **Requirements**: 2.1 (Visual Design Preservation), 16.2 (Visual Regression Testing)
- **Design Document**: Section "Visual Regression Testing"
- **Playwright Docs**: https://playwright.dev/docs/test-snapshots
