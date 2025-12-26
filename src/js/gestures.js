// ============================================================================
// SWIPE GESTURES HANDLER
// ============================================================================

import { logger } from './utils.js';

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
const SWIPE_MAX_VERTICAL = 100; // Maximum vertical movement to consider horizontal swipe

/**
 * Initialize swipe gestures for tab navigation
 */
export function initSwipeGestures() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    mainContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    mainContent.addEventListener('touchend', handleTouchEnd, { passive: true });

    logger.debug('Swipe gestures initialized');
}

/**
 * Handle touch start event
 */
function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

/**
 * Handle touch end event and detect swipe direction
 */
function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only process horizontal swipes (vertical movement should be minimal)
    if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL) {
        return;
    }

    // Check if swipe distance is sufficient
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
        return;
    }

    // Determine swipe direction
    if (deltaX > 0) {
        // Swipe right - go to previous tab
        navigateToPreviousTab();
    } else {
        // Swipe left - go to next tab
        navigateToNextTab();
    }
}

/**
 * Navigate to next tab
 */
function navigateToNextTab() {
    const tabs = Array.from(document.querySelectorAll('.tab-button'));
    const activeTab = tabs.find(tab => tab.classList.contains('tab-active'));
    
    if (!activeTab) return;

    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    const nextTab = tabs[nextIndex];

    if (nextTab) {
        nextTab.click();
        logger.debug('Swipe left: Navigated to next tab');
    }
}

/**
 * Navigate to previous tab
 */
function navigateToPreviousTab() {
    const tabs = Array.from(document.querySelectorAll('.tab-button'));
    const activeTab = tabs.find(tab => tab.classList.contains('tab-active'));
    
    if (!activeTab) return;

    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    const prevTab = tabs[prevIndex];

    if (prevTab) {
        prevTab.click();
        logger.debug('Swipe right: Navigated to previous tab');
    }
}

/**
 * Check if device supports touch
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
