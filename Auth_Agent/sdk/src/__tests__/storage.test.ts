/**
 * Tests for safe storage utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeStorage } from '../common/storage';

describe('safeStorage', () => {
  beforeEach(() => {
    // Clear storage before each test
    sessionStorage.clear();
  });

  it('should store and retrieve items', () => {
    safeStorage.setItem('test_key', 'test_value');
    expect(safeStorage.getItem('test_key')).toBe('test_value');
  });

  it('should return null for non-existent items', () => {
    expect(safeStorage.getItem('non_existent')).toBeNull();
  });

  it('should remove items', () => {
    safeStorage.setItem('test_key', 'test_value');
    safeStorage.removeItem('test_key');
    expect(safeStorage.getItem('test_key')).toBeNull();
  });

  it('should clear all items', () => {
    safeStorage.setItem('key1', 'value1');
    safeStorage.setItem('key2', 'value2');
    safeStorage.clear();
    expect(safeStorage.getItem('key1')).toBeNull();
    expect(safeStorage.getItem('key2')).toBeNull();
  });

  it('should fallback to memory storage when sessionStorage is unavailable', () => {
    // Mock sessionStorage to throw
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    safeStorage.setItem('test_key', 'test_value');
    expect(safeStorage.getItem('test_key')).toBe('test_value');

    sessionStorage.setItem = originalSetItem;
  });

  it('should handle sessionStorage.getItem errors', () => {
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = vi.fn(() => {
      throw new Error('SecurityError');
    });

    safeStorage.setItem('test_key', 'test_value');
    // Should fallback to memory storage
    expect(safeStorage.getItem('test_key')).toBe('test_value');

    sessionStorage.getItem = originalGetItem;
  });
});



