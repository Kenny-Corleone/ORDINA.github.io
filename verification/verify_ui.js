
const { chromium } = require('playwright');

async function verifyResponsiveUI() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 }, // iPhone X size
        deviceScaleFactor: 3
    });
    const page = await context.newPage();

    try {
        // Updated port to 3000 as per vite.config.js
        await page.goto('http://localhost:3000/');

        // Wait for app to load (checking for auth container or dashboard)
        await page.waitForSelector('#auth-container, #app', { state: 'visible', timeout: 10000 });

        console.log("Page loaded.");

        // Take a screenshot of the mobile view (likely login screen initially)
        await page.screenshot({ path: 'verification/mobile_view.png', fullPage: true });

        console.log("Screenshot taken: verification/mobile_view.png");

        // Simulate Desktop
        const desktopContext = await browser.newContext({
            viewport: { width: 1440, height: 900 }
        });
        const desktopPage = await desktopContext.newPage();
        await desktopPage.goto('http://localhost:3000/');
        await desktopPage.waitForSelector('#auth-container, #app', { state: 'visible' });
        await desktopPage.screenshot({ path: 'verification/desktop_view.png', fullPage: true });
        console.log("Screenshot taken: verification/desktop_view.png");

    } catch (error) {
        console.error("Error during verification:", error);
    } finally {
        await browser.close();
    }
}

verifyResponsiveUI();
