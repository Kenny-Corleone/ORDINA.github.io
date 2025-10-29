# ORDINA Testing Guide

Quick reference for testing the ORDINA application.

## Quick Start

### Run Automated Tests
```bash
# Open the test dashboard in your browser
open test-report.html

# Or run the command-line checker
node check-issues.js
```

## Test Dashboard Features

### test-report.html
Interactive testing dashboard with:
- **Responsive Design Tests** - Verify breakpoints and mobile optimization
- **Functionality Tests** - Check CRUD operations, auth, preferences
- **Error Detection** - Monitor console errors and performance
- **Export Reports** - Save test results as JSON

### Buttons:
- **▶️ Run All Tests** - Execute complete test suite
- **📱 Test Responsive** - Check responsive design only
- **⚙️ Test Functionality** - Verify app features
- **🐛 Check Console** - Scan for errors
- **📄 Export Report** - Download test results

## Manual Testing Checklist

### Essential Tests
1. **Authentication**
   - [ ] Register new user
   - [ ] Login with email/password
   - [ ] Login with Google
   - [ ] Logout

2. **CRUD Operations**
   - [ ] Add expense
   - [ ] Edit expense
   - [ ] Delete expense
   - [ ] Add debt
   - [ ] Add task
   - [ ] Add calendar event

3. **Preferences**
   - [ ] Switch theme (Light/Dark)
   - [ ] Change language (RU/EN/AZ)
   - [ ] Change currency (AZN/USD)

4. **Responsive Design**
   - [ ] Test on mobile (< 640px)
   - [ ] Test on tablet (641-1024px)
   - [ ] Test on desktop (> 1024px)

### Device Testing
- [ ] iPhone (iOS Safari)
- [ ] Android (Chrome)
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Edge

## Test Results

### Current Status: ✅ ALL PASS
- **Automated Tests:** 23/23 passing
- **Critical Issues:** 0
- **Warnings:** 0
- **Code Quality:** Excellent

## Troubleshooting

### If Tests Fail:
1. Check console for errors
2. Verify Firebase config in `js/config.js`
3. Ensure all files are present
4. Run `node check-issues.js` for details

### Common Issues:
- **Firebase errors:** Check config.js credentials
- **API errors:** Verify Weather/News API keys
- **Module errors:** Ensure ES6 modules supported

## Documentation

- **Detailed Report:** `.kiro/specs/full-app-refactor-modular/TASK_16_BUG_REPORT.md`
- **Summary:** `.kiro/specs/full-app-refactor-modular/TASK_16_SUMMARY.md`
- **Tasks:** `.kiro/specs/full-app-refactor-modular/tasks.md`

## Support

For issues or questions:
1. Check the bug report for known issues
2. Review the test summary for solutions
3. Run automated tests to identify problems
4. Check console output for error details

---

**Last Updated:** 2025-10-29  
**Status:** Ready for Testing
