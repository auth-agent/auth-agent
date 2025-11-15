/**
 * Storage utilities with fallback support
 */

/**
 * Safe sessionStorage wrapper with fallback to memory storage
 */
class SafeStorage {
  private memoryStorage: Map<string, string> = new Map();
  private isAvailable: boolean;

  constructor() {
    try {
      // Test if sessionStorage is available
      const testKey = '__auth_agent_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
    }
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // Fallback to memory if quota exceeded
        this.memoryStorage.set(key, value);
      }
    } else {
      this.memoryStorage.set(key, value);
    }
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return this.memoryStorage.get(key) || null;
      }
    }
    return this.memoryStorage.get(key) || null;
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Ignore errors
      }
    }
    this.memoryStorage.delete(key);
  }

  clear(): void {
    if (this.isAvailable) {
      try {
        sessionStorage.clear();
      } catch {
        // Ignore errors
      }
    }
    this.memoryStorage.clear();
  }
}

export const safeStorage = new SafeStorage();



