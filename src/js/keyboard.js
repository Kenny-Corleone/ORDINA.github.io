// ============================================================================
// KEYBOARD NAVIGATION HANDLER
// ============================================================================

import { logger } from './utils.js';

let currentFocusedElement = null;
let focusableElements = [];

/**
 * Initialize keyboard navigation
 */
export function initKeyboardNavigation() {
    // Tab navigation enhancement
    document.addEventListener('keydown', handleKeyDown);
    
    // Arrow key navigation for tabs
    setupArrowKeyNavigation();
    
    // Escape key for closing modals
    setupEscapeKeyHandler();
    
    logger.debug('Keyboard navigation initialized');
}

/**
 * Handle keydown events
 */
function handleKeyDown(e) {
    // Tab key - ensure proper focus flow
    if (e.key === 'Tab') {
        handleTabNavigation(e);
    }
    
    // Enter key - activate focused element
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON' && !e.target.closest('form')) {
        e.target.click();
    }
}

/**
 * Handle Tab navigation with focus trap in modals
 */
function handleTabNavigation(e) {
    const modal = document.querySelector('dialog[open]');
    
    if (modal) {
        // Focus trap in modal
        const focusable = getFocusableElements(modal);
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable?.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable?.focus();
            }
        }
    }
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container) {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector))
        .filter(el => {
            return !el.disabled && 
                   !el.hasAttribute('hidden') &&
                   el.offsetWidth > 0 && 
                   el.offsetHeight > 0;
        });
}

/**
 * Setup arrow key navigation for tabs
 */
function setupArrowKeyNavigation() {
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys when focus is on tabs
        const activeTab = document.querySelector('.tab-button.tab-active');
        if (!activeTab || document.activeElement !== activeTab) return;
        
        const tabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = tabs.indexOf(activeTab);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex]?.focus();
            tabs[nextIndex]?.click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            tabs[prevIndex]?.focus();
            tabs[prevIndex]?.click();
        } else if (e.key === 'Home') {
            e.preventDefault();
            tabs[0]?.focus();
            tabs[0]?.click();
        } else if (e.key === 'End') {
            e.preventDefault();
            tabs[tabs.length - 1]?.focus();
            tabs[tabs.length - 1]?.click();
        }
    });
}

/**
 * Setup Escape key handler for closing modals
 */
function setupEscapeKeyHandler() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('dialog[open]');
            if (openModal) {
                const closeBtn = openModal.querySelector('.cancel-btn, [aria-label*="close" i], [aria-label*="закрыть" i]');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    openModal.close();
                }
            }
        }
    });
}

/**
 * Focus trap for modal
 */
export function trapFocus(modal) {
    const focusable = getFocusableElements(modal);
    if (focusable.length === 0) return;
    
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    
    // Focus first element when modal opens
    firstFocusable?.focus();
    
    // Store for cleanup
    currentFocusedElement = document.activeElement;
    focusableElements = focusable;
}

/**
 * Restore focus when modal closes
 */
export function restoreFocus() {
    if (currentFocusedElement) {
        currentFocusedElement.focus();
        currentFocusedElement = null;
    }
    focusableElements = [];
}
