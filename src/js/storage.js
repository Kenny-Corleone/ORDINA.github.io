// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

import { logger } from './utils.js';

const STORAGE_PREFIX = 'ordina_';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

/**
 * Get item from localStorage with expiry check
 */
export function getCachedItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        if (!item) return defaultValue;
        
        const parsed = JSON.parse(item);
        
        // Check expiry
        if (parsed.expiry && Date.now() > parsed.expiry) {
            localStorage.removeItem(STORAGE_PREFIX + key);
            return defaultValue;
        }
        
        return parsed.value;
    } catch (e) {
        logger.error('Error reading from localStorage:', e);
        return defaultValue;
    }
}

/**
 * Set item in localStorage with expiry
 */
export function setCachedItem(key, value, expiryMs = CACHE_EXPIRY) {
    try {
        const item = {
            value: value,
            expiry: Date.now() + expiryMs,
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
        logger.error('Error writing to localStorage:', e);
        // Handle quota exceeded
        if (e.name === 'QuotaExceededError') {
            clearOldCache();
            // Retry once
            try {
                localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({
                    value: value,
                    expiry: Date.now() + expiryMs,
                    timestamp: Date.now()
                }));
            } catch (e2) {
                logger.error('Failed to cache after cleanup:', e2);
            }
        }
    }
}

/**
 * Remove item from localStorage
 */
export function removeCachedItem(key) {
    try {
        localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
        logger.error('Error removing from localStorage:', e);
    }
}

/**
 * Clear all expired cache items
 */
export function clearOldCache() {
    try {
        const keys = Object.keys(localStorage);
        let cleared = 0;
        
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item.expiry && Date.now() > item.expiry) {
                        localStorage.removeItem(key);
                        cleared++;
                    }
                } catch (e) {
                    // Invalid item, remove it
                    localStorage.removeItem(key);
                    cleared++;
                }
            }
        });
        
        if (cleared > 0) {
            logger.debug(`Cleared ${cleared} expired cache items`);
        }
    } catch (e) {
        logger.error('Error clearing old cache:', e);
    }
}

/**
 * Get all cache keys
 */
export function getCacheKeys() {
    try {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .map(key => key.replace(STORAGE_PREFIX, ''));
    } catch (e) {
        logger.error('Error getting cache keys:', e);
        return [];
    }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
    try {
        const keys = getCacheKeys();
        keys.forEach(key => {
            localStorage.removeItem(STORAGE_PREFIX + key);
        });
        logger.debug(`Cleared ${keys.length} cache items`);
    } catch (e) {
        logger.error('Error clearing all cache:', e);
    }
}
