import './app.css'
import App from './App.svelte'
import { logTranslationIssues } from './lib/i18n/validator'
import { initGlobalErrorHandler } from './lib/utils/errorHandler'
import { initAccessibility } from './lib/utils/accessibility'
import { initPolyfills, checkBrowserCompatibility } from './lib/utils/polyfills'
import { logger } from './lib/utils/logger'

// Initialize polyfills for cross-browser compatibility
// This must be done before any components are initialized
// Requirements: 15.3 - Add polyfills for JavaScript APIs
initPolyfills();

// Check browser compatibility and log warnings
// Requirements: 15.4 - Document browser-specific workarounds
checkBrowserCompatibility();

// Initialize global error handler
// This catches uncaught exceptions and unhandled promise rejections
// Requirements: 8.1, 8.2, 12.1, 12.2
const cleanupErrorHandler = initGlobalErrorHandler();

// Initialize accessibility features
// Ensures WCAG AA compliance and accessibility best practices
// Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
initAccessibility();

// Validate translations on startup (development only)
if (import.meta.env.DEV) {
  logger.debug('🔍 Validating translations...');
  logTranslationIssues();
}

const app = new App({
  target: document.getElementById('svelte-root')!,
})

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    navigator.serviceWorker.register('/ORDINA.github.io/sw.js')
      .then(registration => {
        logger.info('Service Worker registered:', registration);
      })
      .catch(err => {
        logger.error('Service Worker registration failed:', err);
      });
  } else {
    // In development, unregister service workers and clear caches
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()))
      .catch(() => {});
    
    if ('caches' in window) {
      caches.keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .catch(() => {});
    }
  }
}

export default app
