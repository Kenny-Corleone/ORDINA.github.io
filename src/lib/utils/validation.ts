/**
 * Validation utilities for ORDINA application
 * Provides input validation for forms and user data
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value?: any;
}

/**
 * Validates a string field (name, comment, etc.)
 * @param value - Value to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateString(
  value: any,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): ValidationResult {
  const { minLength = 1, maxLength = 1000, required = true } = options;
  
  if (value == null) value = '';
  const trimmed = String(value).trim();
  
  if (required && trimmed.length === 0) {
    return { valid: false, error: 'Field is required' };
  }
  
  if (trimmed.length > 0 && trimmed.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength} characters` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength} characters` };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validates a number field (amount, quantity, etc.)
 * @param value - Value to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    allowZero?: boolean;
  } = {}
): ValidationResult {
  const { 
    min = 0, 
    max = Number.MAX_SAFE_INTEGER, 
    required = true, 
    allowZero = true 
  } = options;
  
  if (value == null || value === '') {
    if (required) {
      return { valid: false, error: 'Field is required' };
    }
    return { valid: true, value: 0 };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: 'Invalid number' };
  }
  
  if (!allowZero && num === 0) {
    return { valid: false, error: 'Value must be greater than zero' };
  }
  
  if (num < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `Value must not exceed ${max}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Checks if a year is a leap year
 * @param year - Year to check
 * @returns True if leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Gets the number of days in a month
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Number of days in the month
 */
function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1];
}

/**
 * Validates a date in ISO format (YYYY-MM-DD)
 * @param value - Date string to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateDate(
  value: any,
  options: {
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
  } = {}
): ValidationResult {
  const { required = true, minDate = null, maxDate = null } = options;
  
  if (!value || String(value).trim() === '') {
    if (required) {
      return { valid: false, error: 'Date is required' };
    }
    return { valid: true };
  }
  
  // Check ISO format (YYYY-MM-DD)
  const isoRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
  const match = String(value).match(isoRegex);
  
  if (!match) {
    return { valid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  
  // Check year bounds (1900-2100)
  if (year < 1900 || year > 2100) {
    return { valid: false, error: 'Year must be between 1900 and 2100' };
  }
  
  // Check month bounds
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12' };
  }
  
  // Check day bounds with leap year support
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    if (month === 2 && day === 29) {
      return { valid: false, error: `${year} is not a leap year. February has only 28 days.` };
    }
    return { valid: false, error: `Invalid day. This month has ${maxDays} days.` };
  }
  
  // Validate with Date object
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, error: 'Invalid date' };
  }
  
  // Check date bounds
  if (minDate && date < minDate) {
    return { valid: false, error: `Date must be after ${minDate.toISOString().split('T')[0]}` };
  }
  
  if (maxDate && date > maxDate) {
    return { valid: false, error: `Date must be before ${maxDate.toISOString().split('T')[0]}` };
  }
  
  return { valid: true, date };
}

/**
 * Validates a day of month (1-31)
 * @param value - Day value to validate
 * @returns Validation result
 */
export function validateDayOfMonth(value: any): ValidationResult {
  const numValidation = validateNumber(value, { min: 1, max: 31, required: true });
  if (!numValidation.valid) {
    return numValidation;
  }
  
  const day = numValidation.value!;
  if (day < 1 || day > 31 || !Number.isInteger(day)) {
    return { valid: false, error: 'Day must be between 1 and 31' };
  }
  
  return { valid: true, value: day };
}

/**
 * Validates an email address
 * @param value - Email to validate
 * @param required - Whether the field is required
 * @returns Validation result
 */
export function validateEmail(value: any, required: boolean = true): ValidationResult {
  if (!value || String(value).trim() === '') {
    if (required) {
      return { valid: false, error: 'Email is required' };
    }
    return { valid: true };
  }
  
  const email = String(value).trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  
  return { valid: true, value: email };
}
