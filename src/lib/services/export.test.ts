/**
 * Unit tests for export service
 * Tests CSV export functionality
 */

import { describe, it, expect } from 'vitest';
import { validateCSV } from './export';

describe('Export Service', () => {
  describe('validateCSV', () => {
    it('should validate correct CSV format', () => {
      const csv = 'Name,Age,City\nJohn,30,NYC\nJane,25,LA';
      expect(validateCSV(csv)).toBe(true);
    });

    it('should reject empty CSV', () => {
      expect(validateCSV('')).toBe(false);
    });

    it('should reject CSV with inconsistent field counts', () => {
      const csv = 'Name,Age,City\nJohn,30\nJane,25,LA,Extra';
      expect(validateCSV(csv)).toBe(false);
    });

    it('should handle CSV with empty lines', () => {
      const csv = 'Name,Age\nJohn,30\n\nJane,25';
      expect(validateCSV(csv)).toBe(true);
    });

    it('should handle single line CSV', () => {
      const csv = 'Name,Age,City';
      expect(validateCSV(csv)).toBe(true);
    });
  });

  // Note: exportExpensesToCSV and exportDebtsToCSV tests are skipped
  // because they use DOM APIs (URL.createObjectURL, document.createElement)
  // which are not available in Node.js test environment.
  // These functions are tested manually in the browser.
  
  describe('CSV Export Functions (Browser-only)', () => {
    it('should be defined', async () => {
      // Just verify the functions exist
      const { exportExpensesToCSV, exportDebtsToCSV, exportToCSV } = 
        await import('./export');
      
      expect(typeof exportExpensesToCSV).toBe('function');
      expect(typeof exportDebtsToCSV).toBe('function');
      expect(typeof exportToCSV).toBe('function');
    });
  });
});
