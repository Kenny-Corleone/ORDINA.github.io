# E2E Integration Tests

This directory contains end-to-end integration tests for the ORDINA Svelte application using Playwright.

## Overview

The integration tests validate complete user workflows and interactions across the application, ensuring that all features work correctly together. These tests complement the unit tests and property-based tests by testing the application as a whole.

## Test Files

### Authentication Tests (`auth.spec.ts`)
- Login with email/password
- Signup with email/password
- Google OAuth login
- Logout functionality
- Form validation
- Error handling

### Expense Tests (`expenses.spec.ts`)
- Add expense workflow
- View expenses in list
- Edit expense
- Delete expense
- Month navigation
- Currency toggle (AZN/USD)
- CSV export
- Expense sorting

### Debt Tests (`debts.spec.ts`)
- Add debt workflow
- View debts in list
- Add payment to debt
- Edit debt
- Delete debt
- Update debt comments
- Debt calculations
- CSV export

### Task Tests (`tasks.spec.ts`)
- Add daily/monthly/yearly tasks
- Update task status
- Edit task
- Delete task
- Update task notes
- Task carry-over display
- Task filtering
- Status color coding

### Calendar Tests (`calendar.spec.ts`)
- Add calendar event
- View events on calendar
- Edit event
- Delete event
- Month navigation
- Event type color coding (event, birthday, meeting, wedding)
- Multiple events on same date

### Navigation Tests (`navigation.spec.ts`)
- Tab navigation
- Month selector functionality
- Data loading on month change
- Keyboard shortcuts (Ctrl+E, Ctrl+T, Ctrl+D, Ctrl+R, Space)
- Mobile gestures (swipe navigation)
- Currency toggle persistence

### Offline Tests (`offline.spec.ts`)
- Offline detection
- Cached data access
- Service worker functionality
- Offline indicator display
- Write operation queuing
- Data sync when back online
- Feature restrictions while offline

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report
```bash
npx playwright show-report
```

## Test Configuration

The tests are configured in `playwright.config.ts`:

- **Test directory**: `./tests` (E2E-спеки лежат в `tests/e2e/`)
- **Base URL**: `http://localhost:3002`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 retries in CI, 0 in local development
- **Web server**: Automatically starts dev server before tests

## Test Structure

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup code
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

## Helper Functions

The `helpers.ts` file provides common utilities:

- `loginAsTestUser()` - Authenticate as test user
- `logout()` - Logout current user
- `createTestExpense()` - Create test expense
- `createTestDebt()` - Create test debt
- `createTestTask()` - Create test task
- `createTestCalendarEvent()` - Create test calendar event
- `navigateToTab()` - Navigate to specific tab
- `toggleCurrency()` - Switch between AZN and USD
- `selectMonth()` - Select month from dropdown
- And more...

## Test Data

### Test User Credentials

Tests require a test Firebase project with test user credentials. Set these in environment variables:

```bash
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
```

### Test Data Cleanup

After running tests, test data should be cleaned up to avoid polluting the database. This can be done using:

1. Firebase Admin SDK
2. Test-specific cleanup endpoints
3. Manual cleanup scripts

## Important Notes

### Skipped Tests

Most tests are currently marked with `test.skip()` because they require:

1. **Authentication Setup**: A test Firebase project with test credentials
2. **Test Data**: Seed data for testing
3. **Data Attributes**: Components need `data-testid` attributes for reliable selection
4. **Firebase Emulator**: Optional but recommended for isolated testing

### Enabling Tests

To enable tests:

1. Set up a test Firebase project
2. Add test user credentials to environment variables
3. Add `data-testid` attributes to components
4. Remove `test.skip()` from tests
5. Run tests and fix any issues

### Adding Data Test IDs

Components should have `data-testid` attributes for reliable element selection:

```svelte
<!-- Good -->
<button data-testid="add-expense-btn">Add Expense</button>
<div data-testid="expenses-table">...</div>

<!-- Avoid relying on text content or classes -->
<button class="btn">Add Expense</button>
```

## Best Practices

1. **Use data-testid attributes** instead of CSS classes or text content
2. **Wait for operations** to complete before assertions
3. **Clean up test data** after each test
4. **Use helper functions** for common operations
5. **Test user workflows** not implementation details
6. **Handle async operations** properly with waitFor methods
7. **Test error cases** and edge cases
8. **Keep tests independent** - each test should work in isolation

## Debugging Tests

### Visual Debugging
```bash
npx playwright test --headed --debug
```

### Screenshots on Failure
Playwright automatically captures screenshots on test failure. Find them in `test-results/`.

### Trace Viewer
```bash
npx playwright show-trace test-results/trace.zip
```

### Console Logs
Add console logs in tests:
```typescript
console.log(await page.locator('[data-testid="element"]').textContent());
```

## CI/CD Integration

Tests are configured to run in CI with:
- 2 retries for flaky tests
- Single worker for consistency
- Headless mode
- Automatic web server startup

## Future Improvements

1. Add visual regression testing with screenshot comparison
2. Add performance testing with Lighthouse
3. Add accessibility testing with axe-core
4. Implement Firebase emulator for isolated testing
5. Add test data factories for easier test data creation
6. Add API mocking for external services (weather, news, radio)
7. Add cross-browser compatibility tests
8. Add mobile device testing

## Troubleshooting

### Tests timing out
- Increase timeout in test or config
- Check if dev server is running
- Verify network connectivity

### Elements not found
- Add `data-testid` attributes to components
- Use `page.waitForSelector()` before interacting
- Check if element is in viewport

### Authentication issues
- Verify test credentials are correct
- Check Firebase project configuration
- Ensure test user exists in Firebase

### Flaky tests
- Add proper waits for async operations
- Use `waitForTimeout()` sparingly
- Prefer `waitForSelector()` or `waitForLoadState()`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)

## Validation

These integration tests validate **Requirement 16.3** from the ORDINA Svelte Migration specification:

> THE Migration_System SHALL pass functional testing for all user workflows

The tests cover all major user workflows including:
- ✅ Authentication flows
- ✅ Expense management (add → view → edit → delete)
- ✅ Debt management (add → add payment → edit → delete)
- ✅ Task management (add → update status → edit → delete)
- ✅ Calendar management (add event → edit → delete)
- ✅ Month navigation
- ✅ Currency toggle
- ✅ Offline mode
