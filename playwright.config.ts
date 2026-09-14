import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: process.env.E2E_EMULATOR
      ? {
          ...process.env,
          VITE_FIREBASE_API_KEY: 'emulator',
          VITE_FIREBASE_AUTH_DOMAIN: 'localhost',
          VITE_FIREBASE_PROJECT_ID: 'demo-ordina',
          VITE_FIREBASE_STORAGE_BUCKET: 'demo-ordina.appspot.com',
          VITE_FIREBASE_MESSAGING_SENDER_ID: 'emulator',
          VITE_FIREBASE_APP_ID: 'emulator',
          VITE_USE_FIREBASE_EMULATORS: 'true',
        }
      : undefined,
  },
});
