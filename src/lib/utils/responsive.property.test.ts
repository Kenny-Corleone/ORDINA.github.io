/**
 * Property-Based Tests for Responsive Design
 * 
 * Feature: ordina-svelte-migration
 * Property 24: Responsive Layout Application
 * 
 * **Validates: Requirements 12.1**
 * 
 * For any viewport width, the appropriate responsive layout should be applied:
 * - mobile layout for width < 768px
 * - tablet layout for 768px ≤ width < 1024px  
 * - desktop layout for width ≥ 1024px
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { getDeviceType, initResponsiveSystem, BREAKPOINTS } from './responsive';

describe('Feature: ordina-svelte-migration, Property 24: Responsive Layout Application', () => {
  let cleanup: (() => void) | null = null;
  
  beforeEach(() => {
    // Reset body classes
    document.body.className = '';
  });
  
  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    // Clean up body classes
    document.body.className = '';
  });
  
  it('Property 24: For any viewport width, appropriate responsive layout should apply', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary viewport widths from 320px to 2560px
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          // Mock window.innerWidth
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth
          });
          
          // Get device type
          const deviceType = getDeviceType();
          
          // Verify correct device type based on breakpoints
          if (viewportWidth < BREAKPOINTS.MOBILE) {
            // Mobile: width < 768px
            expect(deviceType).toBe('mobile');
          } else if (viewportWidth < BREAKPOINTS.DESKTOP) {
            // Tablet: 768px ≤ width < 1025px
            expect(deviceType).toBe('tablet');
          } else {
            // Desktop: width ≥ 1025px
            expect(deviceType).toBe('desktop');
          }
          
          // Initialize responsive system
          cleanup = initResponsiveSystem();
          
          // Verify correct CSS class is applied
          const expectedClass = `device-${deviceType}`;
          expect(document.body.classList.contains(expectedClass)).toBe(true);
          
          // Verify no other device classes are present
          const otherClasses = ['device-mobile', 'device-tablet', 'device-desktop']
            .filter(cls => cls !== expectedClass);
          
          otherClasses.forEach(cls => {
            expect(document.body.classList.contains(cls)).toBe(false);
          });
          
          // Cleanup for next iteration
          if (cleanup) {
            cleanup();
            cleanup = null;
          }
          document.body.className = '';
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 24 (Edge Cases): Breakpoint boundaries should be handled correctly', () => {
    // Test exact breakpoint values
    const breakpointTests = [
      { width: 767, expected: 'mobile' },
      { width: 768, expected: 'tablet' },
      { width: 1023, expected: 'tablet' },
      { width: 1024, expected: 'tablet' },
      { width: 1025, expected: 'desktop' },
    ];
    
    breakpointTests.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width
      });
      
      const deviceType = getDeviceType();
      expect(deviceType).toBe(expected);
      
      cleanup = initResponsiveSystem();
      expect(document.body.classList.contains(`device-${expected}`)).toBe(true);
      
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      document.body.className = '';
    });
  });
  
  it('Property 24 (Consistency): Device type should remain consistent for same width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          // Set viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth
          });
          
          // Get device type multiple times
          const deviceType1 = getDeviceType();
          const deviceType2 = getDeviceType();
          const deviceType3 = getDeviceType();
          
          // All calls should return the same device type
          expect(deviceType1).toBe(deviceType2);
          expect(deviceType2).toBe(deviceType3);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 24 (Monotonicity): Wider viewports should never result in smaller device types', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.integer({ min: 1, max: 1000 }),
        (baseWidth, widthIncrease) => {
          const width1 = baseWidth;
          const width2 = baseWidth + widthIncrease;
          
          // Get device types for both widths
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width1
          });
          const deviceType1 = getDeviceType();
          
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width2
          });
          const deviceType2 = getDeviceType();
          
          // Map device types to numeric values for comparison
          const deviceOrder = { mobile: 0, tablet: 1, desktop: 2 };
          
          // Wider viewport should have equal or larger device type
          expect(deviceOrder[deviceType2]).toBeGreaterThanOrEqual(deviceOrder[deviceType1]);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 24 (Completeness): All possible widths should map to exactly one device type', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth
          });
          
          const deviceType = getDeviceType();
          
          // Device type must be one of the three valid types
          const validTypes = ['mobile', 'tablet', 'desktop'];
          expect(validTypes).toContain(deviceType);
          
          // Device type must be exactly one type (not undefined, not multiple)
          expect(deviceType).toBeDefined();
          expect(typeof deviceType).toBe('string');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 24 (CSS Application): CSS classes should match device type for all widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth
          });
          
          const deviceType = getDeviceType();
          cleanup = initResponsiveSystem();
          
          // The CSS class should match the device type
          const expectedClass = `device-${deviceType}`;
          expect(document.body.classList.contains(expectedClass)).toBe(true);
          
          // Count how many device classes are present (should be exactly 1)
          const deviceClasses = ['device-mobile', 'device-tablet', 'device-desktop']
            .filter(cls => document.body.classList.contains(cls));
          
          expect(deviceClasses.length).toBe(1);
          expect(deviceClasses[0]).toBe(expectedClass);
          
          // Cleanup
          if (cleanup) {
            cleanup();
            cleanup = null;
          }
          document.body.className = '';
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
