/**
 * Accessibility Tests
 * 
 * Tests for WCAG AA compliance and accessibility best practices.
 * Validates Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkColorContrast,
  ensureAriaAttributes,
  checkKeyboardNavigation,
  validateScreenReaderOrder,
  checkColorOnlyInformation,
  ensureTouchTargetSize,
  initAccessibility
} from './accessibility';

describe('Accessibility Utilities', () => {
  describe('checkColorContrast', () => {
    it('should pass for sufficient contrast (normal text)', () => {
      // Black on white: 21:1 ratio
      const result = checkColorContrast('#000000', '#ffffff', false);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThan(4.5);
    });

    it('should pass for sufficient contrast (large text)', () => {
      // Dark gray on white: ~12:1 ratio
      const result = checkColorContrast('#333333', '#ffffff', true);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThan(3);
    });

    it('should fail for insufficient contrast', () => {
      // Light gray on white: ~1.5:1 ratio
      const result = checkColorContrast('#cccccc', '#ffffff', false);
      expect(result.passes).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('should handle 3-digit hex colors', () => {
      const result = checkColorContrast('#000', '#fff', false);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThan(4.5);
    });
  });

  describe('ensureAriaAttributes', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should not warn for button with text content', () => {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      container.appendChild(button);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ensureAriaAttributes(button);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not warn for button with aria-label', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close');
      container.appendChild(button);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ensureAriaAttributes(button);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should warn for button without accessible label', () => {
      const button = document.createElement('button');
      container.appendChild(button);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ensureAriaAttributes(button);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Interactive element missing accessible label:',
        button
      );
      consoleSpy.mockRestore();
    });
  });

  describe('checkKeyboardNavigation', () => {
    it('should pass for keyboard accessible button', () => {
      const button = document.createElement('button');
      expect(checkKeyboardNavigation(button)).toBe(true);
    });

    it('should fail for button with tabindex="-1"', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '-1');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = checkKeyboardNavigation(button);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should pass for non-interactive element', () => {
      const div = document.createElement('div');
      expect(checkKeyboardNavigation(div)).toBe(true);
    });
  });

  describe('validateScreenReaderOrder', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should pass for elements in correct tab order', () => {
      const button1 = document.createElement('button');
      button1.setAttribute('tabindex', '1');
      const button2 = document.createElement('button');
      button2.setAttribute('tabindex', '2');
      const button3 = document.createElement('button');
      button3.setAttribute('tabindex', '3');

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);

      expect(validateScreenReaderOrder(container)).toBe(true);
    });

    it('should fail for elements in incorrect tab order', () => {
      const button1 = document.createElement('button');
      button1.setAttribute('tabindex', '3');
      const button2 = document.createElement('button');
      button2.setAttribute('tabindex', '1');
      const button3 = document.createElement('button');
      button3.setAttribute('tabindex', '2');

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = validateScreenReaderOrder(container);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('checkColorOnlyInformation', () => {
    it('should pass for element with color class and text', () => {
      const div = document.createElement('div');
      div.className = 'text-red-500';
      div.textContent = 'Error';
      expect(checkColorOnlyInformation(div)).toBe(true);
    });

    it('should pass for element with color class and icon', () => {
      const div = document.createElement('div');
      div.className = 'bg-green-500';
      const icon = document.createElement('svg');
      icon.setAttribute('role', 'img');
      div.appendChild(icon);
      expect(checkColorOnlyInformation(div)).toBe(true);
    });

    it('should fail for element with only color class', () => {
      const div = document.createElement('div');
      div.className = 'bg-error';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = checkColorOnlyInformation(div);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('ensureTouchTargetSize', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should pass for button with sufficient size', () => {
      const button = document.createElement('button');
      button.style.width = '48px';
      button.style.height = '48px';
      button.style.display = 'block';
      container.appendChild(button);

      // Mock getBoundingClientRect to return the set dimensions
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        width: 48,
        height: 48,
        top: 0,
        left: 0,
        bottom: 48,
        right: 48,
        x: 0,
        y: 0,
        toJSON: () => ({})
      } as DOMRect);

      expect(ensureTouchTargetSize(button)).toBe(true);
    });

    it('should warn for button with insufficient size', () => {
      const button = document.createElement('button');
      button.style.width = '20px';
      button.style.height = '20px';
      container.appendChild(button);

      // Mock getBoundingClientRect to return the set dimensions
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        width: 20,
        height: 20,
        top: 0,
        left: 0,
        bottom: 20,
        right: 20,
        x: 0,
        y: 0,
        toJSON: () => ({})
      } as DOMRect);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = ensureTouchTargetSize(button);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should pass for non-interactive element with small size', () => {
      const div = document.createElement('div');
      div.style.width = '20px';
      div.style.height = '20px';
      container.appendChild(div);

      expect(ensureTouchTargetSize(div)).toBe(true);
    });
  });

  describe('initAccessibility', () => {
    it('should add focus indicator styles', () => {
      initAccessibility();
      const style = document.getElementById('accessibility-focus-styles');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('*:focus');
    });

    it('should add keyboard event listeners', () => {
      initAccessibility();
      
      // Create a mock modal
      const modal = document.createElement('div');
      modal.setAttribute('role', 'dialog');
      const closeButton = document.createElement('button');
      closeButton.setAttribute('aria-label', 'Close');
      let clicked = false;
      closeButton.addEventListener('click', () => { clicked = true; });
      modal.appendChild(closeButton);
      document.body.appendChild(modal);

      // Simulate Escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(clicked).toBe(true);
      document.body.removeChild(modal);
    });
  });
});
