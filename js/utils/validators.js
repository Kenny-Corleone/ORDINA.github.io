/**
 * Validators Module
 * 
 * Provides validation functions for forms, emails, passwords, dates, numbers, and other inputs.
 * Returns validation results with error messages.
 * 
 * @module utils/validators
 */

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string} error - Error message if validation failed
 */

/**
 * Validate email address
 * 
 * @param {string} email - Email address to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * validateEmail('user@example.com') // { valid: true, error: '' }
 * validateEmail('invalid') // { valid: false, error: 'Invalid email format' }
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }
    
    const trimmedEmail = email.trim();
    
    if (trimmedEmail.length === 0) {
        return { valid: false, error: 'Email is required' };
    }
    
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
        return { valid: false, error: 'Invalid email format' };
    }
    
    if (trimmedEmail.length > 254) {
        return { valid: false, error: 'Email is too long' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 6)
 * @param {boolean} options.requireUppercase - Require uppercase letter (default: false)
 * @param {boolean} options.requireLowercase - Require lowercase letter (default: false)
 * @param {boolean} options.requireNumber - Require number (default: false)
 * @param {boolean} options.requireSpecial - Require special character (default: false)
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * validatePassword('pass123') // { valid: true, error: '' }
 * validatePassword('pass', { minLength: 8 }) // { valid: false, error: 'Password must be at least 8 characters' }
 */
export function validatePassword(password, options = {}) {
    const {
        minLength = 6,
        requireUppercase = false,
        requireLowercase = false,
        requireNumber = false,
        requireSpecial = false
    } = options;
    
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < minLength) {
        return { valid: false, error: `Password must be at least ${minLength} characters` };
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    
    if (requireNumber && !/\d/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' };
    }
    
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate that passwords match
 * 
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {ValidationResult} Validation result
 */
export function validatePasswordMatch(password, confirmPassword) {
    if (!password || !confirmPassword) {
        return { valid: false, error: 'Both passwords are required' };
    }
    
    if (password !== confirmPassword) {
        return { valid: false, error: 'Passwords do not match' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate required field
 * 
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateRequired(value, fieldName = 'Field') {
    if (value === null || value === undefined) {
        return { valid: false, error: `${fieldName} is required` };
    }
    
    if (typeof value === 'string' && value.trim().length === 0) {
        return { valid: false, error: `${fieldName} is required` };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate number
 * 
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {boolean} options.integer - Must be integer (default: false)
 * @returns {ValidationResult} Validation result
 */
export function validateNumber(value, options = {}) {
    const { min, max, integer = false } = options;
    
    const num = Number(value);
    
    if (isNaN(num)) {
        return { valid: false, error: 'Must be a valid number' };
    }
    
    if (integer && !Number.isInteger(num)) {
        return { valid: false, error: 'Must be an integer' };
    }
    
    if (min !== undefined && num < min) {
        return { valid: false, error: `Must be at least ${min}` };
    }
    
    if (max !== undefined && num > max) {
        return { valid: false, error: `Must be at most ${max}` };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate positive number
 * 
 * @param {any} value - Value to validate
 * @returns {ValidationResult} Validation result
 */
export function validatePositiveNumber(value) {
    const num = Number(value);
    
    if (isNaN(num)) {
        return { valid: false, error: 'Must be a valid number' };
    }
    
    if (num <= 0) {
        return { valid: false, error: 'Must be a positive number' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate date string (YYYY-MM-DD format)
 * 
 * @param {string} dateString - Date string to validate
 * @returns {ValidationResult} Validation result
 */
export function validateDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        return { valid: false, error: 'Date is required' };
    }
    
    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(dateString)) {
        return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
    }
    
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date' };
    }
    
    // Check if components match (handles invalid dates like 2024-02-30)
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
        return { valid: false, error: 'Invalid date' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate date range
 * 
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {ValidationResult} Validation result
 */
export function validateDateRange(startDate, endDate) {
    const startValidation = validateDate(startDate);
    if (!startValidation.valid) {
        return { valid: false, error: `Start date: ${startValidation.error}` };
    }
    
    const endValidation = validateDate(endDate);
    if (!endValidation.valid) {
        return { valid: false, error: `End date: ${endValidation.error}` };
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        return { valid: false, error: 'Start date must be before end date' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate date is not in the past
 * 
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {ValidationResult} Validation result
 */
export function validateFutureDate(dateString) {
    const dateValidation = validateDate(dateString);
    if (!dateValidation.valid) {
        return dateValidation;
    }
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
        return { valid: false, error: 'Date cannot be in the past' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate string length
 * 
 * @param {string} value - String to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum length
 * @param {number} options.max - Maximum length
 * @param {string} options.fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateLength(value, options = {}) {
    const { min, max, fieldName = 'Field' } = options;
    
    if (typeof value !== 'string') {
        return { valid: false, error: `${fieldName} must be a string` };
    }
    
    const length = value.length;
    
    if (min !== undefined && length < min) {
        return { valid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    
    if (max !== undefined && length > max) {
        return { valid: false, error: `${fieldName} must be at most ${max} characters` };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate URL
 * 
 * @param {string} url - URL to validate
 * @returns {ValidationResult} Validation result
 */
export function validateURL(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }
    
    try {
        new URL(url);
        return { valid: true, error: '' };
    } catch (e) {
        return { valid: false, error: 'Invalid URL format' };
    }
}

/**
 * Validate phone number (basic validation)
 * 
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult} Validation result
 */
export function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return { valid: false, error: 'Phone number is required' };
    }
    
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Check if it contains only digits and optional + at start
    const phoneRegex = /^\+?\d{10,15}$/;
    
    if (!phoneRegex.test(cleaned)) {
        return { valid: false, error: 'Invalid phone number format' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate form with multiple fields
 * 
 * @param {Object} formData - Object with form field values
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} Object with validation results for each field
 * 
 * @example
 * const formData = { email: 'user@example.com', password: 'pass123' };
 * const rules = {
 *   email: (value) => validateEmail(value),
 *   password: (value) => validatePassword(value, { minLength: 6 })
 * };
 * const results = validateForm(formData, rules);
 */
export function validateForm(formData, rules) {
    const results = {};
    let isValid = true;
    
    for (const [field, validator] of Object.entries(rules)) {
        const value = formData[field];
        const result = validator(value);
        results[field] = result;
        
        if (!result.valid) {
            isValid = false;
        }
    }
    
    results.isValid = isValid;
    return results;
}

/**
 * Get validation error message for a field
 * 
 * @param {ValidationResult} validationResult - Validation result
 * @returns {string} Error message or empty string
 */
export function getErrorMessage(validationResult) {
    return validationResult && !validationResult.valid ? validationResult.error : '';
}

/**
 * Check if validation result is valid
 * 
 * @param {ValidationResult} validationResult - Validation result
 * @returns {boolean} True if valid
 */
export function isValid(validationResult) {
    return validationResult && validationResult.valid === true;
}
