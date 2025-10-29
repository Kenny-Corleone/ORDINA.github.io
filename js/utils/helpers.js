/**
 * Helper Utilities Module
 * 
 * Provides general-purpose helper functions for DOM manipulation,
 * function optimization (debounce, throttle), and common utilities.
 * 
 * @module utils/helpers
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * since the last time it was invoked
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - ensures function is called at most once per specified time period
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to wait between calls
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => handleScroll(), 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get element by ID with error handling
 * 
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} The element or null if not found
 */
export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id "${id}" not found`);
    }
    return element;
}

/**
 * Get elements by selector
 * 
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (optional, defaults to document)
 * @returns {NodeList} NodeList of matching elements
 */
export function getElements(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Create element with attributes and content
 * 
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Object with attributes to set
 * @param {string|HTMLElement|Array} content - Content to append
 * @returns {HTMLElement} Created element
 * 
 * @example
 * const button = createElement('button', 
 *   { class: 'btn', 'data-id': '123' }, 
 *   'Click me'
 * );
 */
export function createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });
    
    // Set content
    if (content !== null) {
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        }
    }
    
    return element;
}

/**
 * Add event listener with automatic cleanup
 * 
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 * @returns {Function} Cleanup function to remove listener
 */
export function addListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Toggle class on element
 * 
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add (true) or remove (false)
 */
export function toggleClass(element, className, force) {
    if (force !== undefined) {
        element.classList.toggle(className, force);
    } else {
        element.classList.toggle(className);
    }
}

/**
 * Show element by removing 'hidden' class or setting display
 * 
 * @param {HTMLElement} element - Element to show
 * @param {string} display - Display value (default: 'block')
 */
export function showElement(element, display = 'block') {
    if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
    } else {
        element.style.display = display;
    }
}

/**
 * Hide element by adding 'hidden' class or setting display none
 * 
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
    if (element.classList) {
        element.classList.add('hidden');
    } else {
        element.style.display = 'none';
    }
}

/**
 * Empty element (remove all children)
 * 
 * @param {HTMLElement} element - Element to empty
 */
export function emptyElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Get today's date in ISO format (YYYY-MM-DD) in Baku timezone
 * 
 * @returns {string} ISO date string
 */
export function getTodayISOString() {
    const today = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Baku' };
    return new Intl.DateTimeFormat('en-CA', options).format(today);
}

/**
 * Show toast notification
 * 
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success', 'error', 'info', 'warning')
 */
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show confirmation modal
 * 
 * @param {string} text - Confirmation text
 * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false otherwise
 */
export function showConfirmModal(text) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        if (!modal) {
            console.warn('Confirm modal not found');
            resolve(false);
            return;
        }
        
        const textElement = document.getElementById('confirm-modal-text');
        if (textElement) {
            textElement.textContent = text;
        }
        
        const yesBtn = document.getElementById('confirm-modal-yes');
        const noBtn = document.getElementById('confirm-modal-no');

        const close = () => modal.close();
        const onYes = () => { resolve(true); close(); cleanup(); };
        const onNo = () => { resolve(false); close(); cleanup(); };

        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        };

        yesBtn.addEventListener('click', onYes, { once: true });
        noBtn.addEventListener('click', onNo, { once: true });
        modal.addEventListener('close', () => { resolve(false); cleanup(); }, { once: true });
        modal.showModal();
    });
}

/**
 * Wait for specified milliseconds
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if element is visible in viewport
 * 
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is visible
 */
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll to element smoothly
 * 
 * @param {HTMLElement} element - Element to scroll to
 * @param {Object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    };
    element.scrollIntoView({ ...defaultOptions, ...options });
}
