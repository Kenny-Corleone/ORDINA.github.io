/* eslint-disable */
const { chromium, devices } = require('playwright');

const URL = 'https://kenny-corleone.github.io/ORDINA.github.io/';
const VIEWPORT = { width: 1920, height: 1080 };
const OUTPUTS = [
  { tab: 'expenses', file: 'assets/screenshots/expenses.png' },
  { tab: 'debts', file: 'assets/screenshots/debts.png' },
  { tab: 'tasks', file: 'assets/screenshots/tasks.png' },
  { tab: 'calendar', file: 'assets/screenshots/calendar.png' },
  { tab: 'dashboard', file: 'assets/screenshots/news.png', clickSelector: '#news-results' }
];

async function navigateToTab(page, tab) {
  const btn = page.locator(`button[data-tab="${tab}"]`).first();
  try {
    await btn.click({ timeout: 3000 });
  } catch {}
  await page.waitForTimeout(800);
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1.0 });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });

  // ensure English UI
  try {
    await page.evaluate(() => {
      localStorage.setItem('preferred_lang', 'en');
    });
    await page.reload({ waitUntil: 'networkidle' });
  } catch {}

  for (const item of OUTPUTS) {
    await navigateToTab(page, item.tab);
    await page.waitForTimeout(600);
    await page.screenshot({ path: item.file, fullPage: true });
    console.log('Saved', item.file);
  }

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

