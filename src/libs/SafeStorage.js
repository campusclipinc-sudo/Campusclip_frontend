/**
 * Safe Storage utility that handles localStorage restrictions in Instagram iOS WebView
 * Falls back to in-memory storage if localStorage is unavailable
 */

let memoryStorage = {};

export const SafeStorage = {
  /**
   * Get item from storage with fallback to memory storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} - Stored value or default
   */
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue;

      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.warn(`[SafeStorage] Failed to read from localStorage (${key}):`, e.message);
      // Fallback to memory storage
      return memoryStorage[key] !== undefined ? memoryStorage[key] : defaultValue;
    }
  },

  /**
   * Set item in storage with fallback to memory storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} - Success status
   */
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;

      // Convert to string if not already
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (e) {
      console.warn(`[SafeStorage] Failed to write to localStorage (${key}):`, e.message);
      // Fallback to memory storage
      memoryStorage[key] = value;
      return false;
    }
  },

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined') return false;

      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[SafeStorage] Failed to remove from localStorage (${key}):`, e.message);
      // Fallback to memory storage
      delete memoryStorage[key];
      return false;
    }
  },

  /**
   * Clear all storage
   * @returns {boolean} - Success status
   */
  clear: () => {
    try {
      if (typeof window === 'undefined') return false;

      localStorage.clear();
      return true;
    } catch (e) {
      console.warn('[SafeStorage] Failed to clear localStorage:', e.message);
      // Fallback to memory storage
      memoryStorage = {};
      return false;
    }
  },

  /**
   * Check if storage is available
   * @returns {boolean} - Availability status
   */
  isAvailable: () => {
    if (typeof window === 'undefined') return false;

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('[SafeStorage] localStorage is not available:', e.message);
      return false;
    }
  },

  /**
   * Get all keys from storage
   * @returns {string[]} - Array of all keys
   */
  keys: () => {
    try {
      if (typeof window === 'undefined') return [];

      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    } catch (e) {
      console.warn('[SafeStorage] Failed to get keys from localStorage:', e.message);
      return Object.keys(memoryStorage);
    }
  },
};

export default SafeStorage;
