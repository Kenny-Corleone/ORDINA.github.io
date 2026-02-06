// ============================================================================
// DATA EXPORT SERVICE - CSV Export Functionality
// ============================================================================

import { logger } from '../utils/logger';
import type { Expense, Debt } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
}

// ============================================================================
// CSV EXPORT FUNCTIONS
// ============================================================================

/**
 * Escape CSV field value
 * 
 * CSV escaping rules (RFC 4180):
 * 1. Fields containing comma, quote, or newline must be wrapped in quotes
 * 2. Quotes within fields must be escaped by doubling them (" becomes "")
 * 3. Null/undefined values become empty strings
 * 
 * Examples:
 * - "Hello, World" → "Hello, World" (contains comma, needs quotes)
 * - 'Say "Hi"' → "Say ""Hi""" (contains quotes, needs escaping and wrapping)
 * - "Line1\nLine2" → "Line1\nLine2" (contains newline, needs quotes)
 * - "Simple" → Simple (no special chars, no quotes needed)
 * 
 * Why this matters:
 * Without proper escaping, CSV files can be corrupted when opened in Excel/Sheets.
 * For example, a debt comment like "Pay by 12/31, urgent!" would break into
 * multiple columns without escaping.
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[], delimiter: string = ','): string {
  const rows: string[] = [];

  // Add headers
  rows.push(headers.map(h => escapeCSVField(h)).join(delimiter));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header.toLowerCase().replace(/\s+/g, '')];
      return escapeCSVField(value);
    });
    rows.push(values.join(delimiter));
  });

  return rows.join('\n');
}

/**
 * Download file helper
 * 
 * Creates a temporary download link and triggers a download in the browser.
 * This approach works across all modern browsers without requiring server-side support.
 * 
 * How it works:
 * 1. Create a Blob (binary large object) from the content
 * 2. Create a temporary URL pointing to the Blob
 * 3. Create an invisible <a> element with download attribute
 * 4. Programmatically click the link to trigger download
 * 5. Clean up: remove link and revoke URL to free memory
 * 
 * Why this approach:
 * - Works client-side only (no server needed)
 * - Supports all file types via MIME type
 * - Allows custom filename
 * - Compatible with all modern browsers
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export expenses to CSV
 */
export function exportExpensesToCSV(
  expenses: Expense[],
  options: ExportOptions = {}
): void {
  try {
    const {
      filename = 'expenses.csv',
      delimiter = ','
    } = options;

    const headers = ['Date', 'Category', 'Name', 'Amount'];

    const data = expenses.map(expense => ({
      date: expense.date || '',
      category: expense.category || '',
      name: expense.name || '',
      amount: expense.amount || 0
    }));

    const csvContent = arrayToCSV(data, headers, delimiter);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

    logger.info('Expenses exported to CSV:', filename);
  } catch (error) {
    logger.error('Error exporting expenses:', error);
    throw error;
  }
}

/**
 * Export debts to CSV
 */
export function exportDebtsToCSV(
  debts: Debt[],
  options: ExportOptions = {}
): void {
  try {
    const {
      filename = 'debts.csv',
      delimiter = ','
    } = options;

    const headers = ['Name', 'Total Amount', 'Paid Amount', 'Remaining', 'Comment'];

    const data = debts.map(debt => {
      const remaining = (debt.totalAmount || 0) - (debt.paidAmount || 0);
      return {
        name: debt.name || '',
        totalamount: debt.totalAmount || 0,
        paidamount: debt.paidAmount || 0,
        remaining: remaining,
        comment: debt.comment || ''
      };
    });

    const csvContent = arrayToCSV(data, headers, delimiter);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

    logger.info('Debts exported to CSV:', filename);
  } catch (error) {
    logger.error('Error exporting debts:', error);
    throw error;
  }
}

/**
 * Export generic data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: string[],
  options: ExportOptions = {}
): void {
  try {
    const {
      filename = 'export.csv',
      delimiter = ','
    } = options;

    const csvContent = arrayToCSV(data, headers, delimiter);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

    logger.info('Data exported to CSV:', filename);
  } catch (error) {
    logger.error('Error exporting data:', error);
    throw error;
  }
}

/**
 * Validate CSV format
 */
export function validateCSV(csvString: string): boolean {
  try {
    if (csvString.trim() === '') {
      return false;
    }

    const lines = csvString.split(/\r?\n/);
    if (lines.length === 0) {
      return false;
    }

    // Find first non-empty line to establish expected field count
    const firstNonEmptyLine = lines.find(line => line.trim() !== '');
    if (!firstNonEmptyLine) {
      return false;
    }

    // Check if all lines have the same number of fields
    const expectedFields = firstNonEmptyLine.split(',').length;
    if (expectedFields === 0) {
      return false;
    }

    for (const line of lines) {
      if (line.trim() === '') continue;
      const fields = line.split(',').length;
      if (fields !== expectedFields) {
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('CSV validation error:', error);
    return false;
  }
}
