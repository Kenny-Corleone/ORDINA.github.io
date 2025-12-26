/**
 * Unit tests for validation functions
 * Run with: node tests/validation.test.js
 */

// Mock DOM for testing
global.document = {
    createElement: (tag) => ({
        textContent: '',
        innerHTML: ''
    })
};

// Import validation functions
const { validateString, validateNumber, validateDate, validateDayOfMonth } = require('../src/js/utils.js');

// Test suite
function runTests() {
    let passed = 0;
    let failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            console.log(`✓ ${name}`);
            passed++;
        } catch (error) {
            console.error(`✗ ${name}: ${error.message}`);
            failed++;
        }
    }
    
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    // Test validateString
    console.log('\n=== Testing validateString ===');
    test('valid string passes', () => {
        const result = validateString('test', { required: true });
        assert(result.valid === true);
    });
    
    test('empty string fails when required', () => {
        const result = validateString('', { required: true });
        assert(result.valid === false);
    });
    
    test('empty string passes when not required', () => {
        const result = validateString('', { required: false });
        assert(result.valid === true);
    });
    
    test('string too short fails', () => {
        const result = validateString('ab', { minLength: 3 });
        assert(result.valid === false);
    });
    
    test('string too long fails', () => {
        const longString = 'a'.repeat(1001);
        const result = validateString(longString, { maxLength: 1000 });
        assert(result.valid === false);
    });
    
    // Test validateNumber
    console.log('\n=== Testing validateNumber ===');
    test('valid number passes', () => {
        const result = validateNumber('123.45', { min: 0, max: 1000 });
        assert(result.valid === true && result.value === 123.45);
    });
    
    test('NaN fails', () => {
        const result = validateNumber('abc', { required: true });
        assert(result.valid === false);
    });
    
    test('negative number fails when min is 0', () => {
        const result = validateNumber('-10', { min: 0 });
        assert(result.valid === false);
    });
    
    test('number below min fails', () => {
        const result = validateNumber('5', { min: 10 });
        assert(result.valid === false);
    });
    
    test('number above max fails', () => {
        const result = validateNumber('1001', { max: 1000 });
        assert(result.valid === false);
    });
    
    test('zero passes when allowZero is true', () => {
        const result = validateNumber('0', { allowZero: true });
        assert(result.valid === true);
    });
    
    test('zero fails when allowZero is false', () => {
        const result = validateNumber('0', { allowZero: false });
        assert(result.valid === false);
    });
    
    // Test validateDate
    console.log('\n=== Testing validateDate ===');
    test('valid date passes', () => {
        const result = validateDate('2024-01-15', { required: true });
        assert(result.valid === true);
    });
    
    test('invalid format fails', () => {
        const result = validateDate('2024/01/15', { required: true });
        assert(result.valid === false);
    });
    
    test('invalid date (Feb 30) fails', () => {
        const result = validateDate('2024-02-30', { required: true });
        assert(result.valid === false);
    });
    
    test('leap year Feb 29 passes', () => {
        const result = validateDate('2024-02-29', { required: true });
        assert(result.valid === true);
    });
    
    test('non-leap year Feb 29 fails', () => {
        const result = validateDate('2023-02-29', { required: true });
        assert(result.valid === false);
    });
    
    test('year below 1900 fails', () => {
        const result = validateDate('1899-01-01', { required: true });
        assert(result.valid === false);
    });
    
    test('year above 2100 fails', () => {
        const result = validateDate('2101-01-01', { required: true });
        assert(result.valid === false);
    });
    
    // Test validateDayOfMonth
    console.log('\n=== Testing validateDayOfMonth ===');
    test('valid day passes', () => {
        const result = validateDayOfMonth('15');
        assert(result.valid === true && result.value === 15);
    });
    
    test('day below 1 fails', () => {
        const result = validateDayOfMonth('0');
        assert(result.valid === false);
    });
    
    test('day above 31 fails', () => {
        const result = validateDayOfMonth('32');
        assert(result.valid === false);
    });
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    return failed === 0;
}

// Run tests
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };
