// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export const logger = {
    debug: (...args) => {
        if (isDev) console.debug(...args);
    },
    info: (...args) => {
        if (isDev) console.info(...args);
    },
    warn: (...args) => {
        if (isDev) console.warn(...args);
    },
    error: (...args) => {
        console.error(...args);
    }
};

// ============================================================================
// SCRIPT LOADING
// ============================================================================

const loadedScripts = new Set();

export const loadScriptSafely = (src, { defer = true, timeout = 8000 } = {}) => {
    if (!src || loadedScripts.has(src)) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            const script = document.createElement('script');
            script.src = src;
            if (defer) script.defer = true;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = (e) => {
                logger.warn('Failed to load script', src, e);
                reject(e);
            };

            const timer = setTimeout(() => {
                logger.warn('Script load timeout', src);
                reject(new Error('Script load timeout'));
            }, timeout);

            script.addEventListener('load', () => clearTimeout(timer));
            script.addEventListener('error', () => clearTimeout(timer));

            document.head.appendChild(script);
        } catch (e) {
            logger.error('loadScriptSafely error', e);
            reject(e);
        }
    });
};

// ============================================================================
// UI NOTIFICATIONS
// ============================================================================

export const showToast = (message, type = 'success') => {
    try {
        const containerId = 'ordina-toast-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'fixed inset-x-0 top-4 z-[9999] flex flex-col items-center space-y-2 pointer-events-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const baseClasses = 'pointer-events-auto px-4 py-2 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-opacity duration-300';
        const typeClasses = type === 'error'
            ? 'bg-red-600 text-white'
            : type === 'warning'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white';

        toast.className = `${baseClasses} ${typeClasses}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    } catch (e) {
        logger.error('showToast error', e);
    }
};

// ============================================================================
// DATA UTILITIES
// ============================================================================

export const safeGet = (obj, path, defaultValue = null) => {
    try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result == null || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }
        return result != null ? result : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

// ============================================================================
// DOM HELPERS
// ============================================================================

export const $ = (id) => document.getElementById(id);
export const $$ = (sel) => document.querySelectorAll(sel);
const $cache = {};
export const getCached = (id) => $cache[id] || ($cache[id] = $(id));
