/**
 * Storage Module
 * 
 * Provides a wrapper for localStorage with type safety, error handling,
 * and additional features like expiration and namespacing.
 * 
 * @module utils/storage
 */

/**
 * Storage wrapper class for localStorage
 */
class Storage {
    /**
     * Create a storage instance
     * 
     * @param {string} namespace - Optional namespace prefix for keys
     */
    constructor(namespace = '') {
        this.namespace = namespace;
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Check if localStorage is available
     * 
     * @returns {boolean} True if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    /**
     * Get full key with namespace
     * 
     * @param {string} key - Key name
     * @returns {string} Full key with namespace
     */
    getFullKey(key) {
        return this.namespace ? `${this.namespace}:${key}` : key;
    }

    /**
     * Set item in storage
     * 
     * @param {string} key - Key name
     * @param {any} value - Value to store (will be JSON stringified)
     * @param {Object} options - Storage options
     * @param {number} options.expiresIn - Expiration time in milliseconds
     * @returns {boolean} True if successful
     * 
     * @example
     * storage.set('user', { name: 'John' });
     * storage.set('token', 'abc123', { expiresIn: 3600000 }); // 1 hour
     */
    set(key, value, options = {}) {
        if (!this.isAvailable) {
            console.warn('localStorage not available');
            return false;
        }

        try {
            const fullKey = this.getFullKey(key);
            const data = {
                value,
                timestamp: Date.now()
            };

            if (options.expiresIn) {
                data.expiresAt = Date.now() + options.expiresIn;
            }

            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error setting storage item:', e);
            
            // Handle quota exceeded error
            if (e.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded');
                this.clearExpired();
            }
            
            return false;
        }
    }

    /**
     * Get item from storage
     * 
     * @param {string} key - Key name
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default value
     * 
     * @example
     * const user = storage.get('user');
     * const theme = storage.get('theme', 'light');
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const fullKey = this.getFullKey(key);
            const item = localStorage.getItem(fullKey);

            if (item === null) {
                return defaultValue;
            }

            const data = JSON.parse(item);

            // Check expiration
            if (data.expiresAt && Date.now() > data.expiresAt) {
                this.remove(key);
                return defaultValue;
            }

            return data.value;
        } catch (e) {
            console.error('Error getting storage item:', e);
            return defaultValue;
        }
    }

    /**
     * Remove item from storage
     * 
     * @param {string} key - Key name
     * @returns {boolean} True if successful
     */
    remove(key) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const fullKey = this.getFullKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error('Error removing storage item:', e);
            return false;
        }
    }

    /**
     * Check if key exists in storage
     * 
     * @param {string} key - Key name
     * @returns {boolean} True if key exists
     */
    has(key) {
        if (!this.isAvailable) {
            return false;
        }

        const fullKey = this.getFullKey(key);
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * Clear all items in namespace (or all if no namespace)
     * 
     * @returns {boolean} True if successful
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            if (this.namespace) {
                // Clear only items in this namespace
                const keys = this.keys();
                keys.forEach(key => this.remove(key));
            } else {
                // Clear all localStorage
                localStorage.clear();
            }
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }

    /**
     * Get all keys in namespace
     * 
     * @returns {string[]} Array of keys
     */
    keys() {
        if (!this.isAvailable) {
            return [];
        }

        try {
            const allKeys = Object.keys(localStorage);
            
            if (this.namespace) {
                const prefix = `${this.namespace}:`;
                return allKeys
                    .filter(key => key.startsWith(prefix))
                    .map(key => key.substring(prefix.length));
            }
            
            return allKeys;
        } catch (e) {
            console.error('Error getting storage keys:', e);
            return [];
        }
    }

    /**
     * Get all items in namespace as object
     * 
     * @returns {Object} Object with all key-value pairs
     */
    getAll() {
        const keys = this.keys();
        const result = {};
        
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        
        return result;
    }

    /**
     * Clear expired items
     * 
     * @returns {number} Number of items cleared
     */
    clearExpired() {
        if (!this.isAvailable) {
            return 0;
        }

        let cleared = 0;
        const keys = this.keys();

        keys.forEach(key => {
            try {
                const fullKey = this.getFullKey(key);
                const item = localStorage.getItem(fullKey);
                
                if (item) {
                    const data = JSON.parse(item);
                    
                    if (data.expiresAt && Date.now() > data.expiresAt) {
                        this.remove(key);
                        cleared++;
                    }
                }
            } catch (e) {
                console.error('Error checking expiration:', e);
            }
        });

        return cleared;
    }

    /**
     * Get storage size in bytes (approximate)
     * 
     * @returns {number} Size in bytes
     */
    getSize() {
        if (!this.isAvailable) {
            return 0;
        }

        let size = 0;
        const keys = this.keys();

        keys.forEach(key => {
            try {
                const fullKey = this.getFullKey(key);
                const item = localStorage.getItem(fullKey);
                if (item) {
                    size += item.length + fullKey.length;
                }
            } catch (e) {
                console.error('Error calculating size:', e);
            }
        });

        return size;
    }

    /**
     * Set multiple items at once
     * 
     * @param {Object} items - Object with key-value pairs
     * @returns {boolean} True if all successful
     */
    setMultiple(items) {
        let success = true;
        
        Object.entries(items).forEach(([key, value]) => {
            if (!this.set(key, value)) {
                success = false;
            }
        });
        
        return success;
    }

    /**
     * Remove multiple items at once
     * 
     * @param {string[]} keys - Array of keys to remove
     * @returns {boolean} True if all successful
     */
    removeMultiple(keys) {
        let success = true;
        
        keys.forEach(key => {
            if (!this.remove(key)) {
                success = false;
            }
        });
        
        return success;
    }
}

/**
 * Default storage instance
 */
export const storage = new Storage();

/**
 * Create namespaced storage instance
 * 
 * @param {string} namespace - Namespace prefix
 * @returns {Storage} Storage instance with namespace
 * 
 * @example
 * const userStorage = createStorage('user');
 * userStorage.set('preferences', { theme: 'dark' });
 */
export function createStorage(namespace) {
    return new Storage(namespace);
}

/**
 * Convenience functions using default storage instance
 */

/**
 * Get item from default storage
 * 
 * @param {string} key - Key name
 * @param {any} defaultValue - Default value
 * @returns {any} Stored value or default
 */
export function getItem(key, defaultValue = null) {
    return storage.get(key, defaultValue);
}

/**
 * Set item in default storage
 * 
 * @param {string} key - Key name
 * @param {any} value - Value to store
 * @param {Object} options - Storage options
 * @returns {boolean} True if successful
 */
export function setItem(key, value, options = {}) {
    return storage.set(key, value, options);
}

/**
 * Remove item from default storage
 * 
 * @param {string} key - Key name
 * @returns {boolean} True if successful
 */
export function removeItem(key) {
    return storage.remove(key);
}

/**
 * Check if key exists in default storage
 * 
 * @param {string} key - Key name
 * @returns {boolean} True if exists
 */
export function hasItem(key) {
    return storage.has(key);
}

/**
 * Clear default storage
 * 
 * @returns {boolean} True if successful
 */
export function clearStorage() {
    return storage.clear();
}

/**
 * Get all keys from default storage
 * 
 * @returns {string[]} Array of keys
 */
export function getKeys() {
    return storage.keys();
}

/**
 * Get all items from default storage
 * 
 * @returns {Object} Object with all key-value pairs
 */
export function getAllItems() {
    return storage.getAll();
}

/**
 * Clear expired items from default storage
 * 
 * @returns {number} Number of items cleared
 */
export function clearExpiredItems() {
    return storage.clearExpired();
}

// Export Storage class for custom instances
export { Storage };

// Export default instance
export default storage;
