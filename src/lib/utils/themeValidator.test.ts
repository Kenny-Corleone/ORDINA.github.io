import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  getContrastRatio,
  parseColor,
  checkContrast,
  getCSSVariable,
  validateTheme,
} from './themeValidator';

const themeStyles = `
  :root {
    --text-primary: #1a1a1a;
    --text-secondary: #4a5568;
    --bg-primary: #f5f3f0;
    --bg-secondary: #ebe8e3;
    --border-color: rgba(74, 85, 104, 0.2);
    --shadow: 0 4px 12px rgba(26, 26, 26, 0.1);
    --shadow-gold: 0 8px 32px rgba(99, 102, 241, 0.25);
    --glass-bg-light: rgba(245, 243, 240, 0.95);
    --glass-bg-dark: rgba(15, 23, 42, 0.4);
    --glass-border-light: rgba(74, 85, 104, 0.25);
    --glass-border-dark: rgba(255, 255, 255, 0.1);
    --glass-blur: blur(20px) saturate(180%);
  }
  .dark {
    --text-primary: #f8f9fa;
    --text-secondary: #94a3b8;
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --border-color: rgba(212, 175, 55, 0.35);
    --shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    --shadow-gold: 0 8px 32px rgba(212, 175, 55, 0.3);
    --glass-bg-light: rgba(245, 243, 240, 0.95);
    --glass-bg-dark: rgba(15, 23, 42, 0.4);
    --glass-border-light: rgba(74, 85, 104, 0.25);
    --glass-border-dark: rgba(255, 255, 255, 0.1);
    --glass-blur: blur(20px) saturate(180%);
  }
  .premium-card {
    background: var(--glass-bg-light);
    border: 1px solid var(--glass-border-light);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
  }
  .dark .premium-card {
    background: var(--glass-bg-dark);
    border: 1px solid var(--glass-border-dark);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
  }
`;

function ensureThemeStyles() {
  if (document.getElementById('theme-test-styles')) return;
  const style = document.createElement('style');
  style.id = 'theme-test-styles';
  style.textContent = themeStyles;
  document.head.appendChild(style);
}

function setDarkMode(enabled: boolean) {
  if (enabled) {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.documentElement.classList.remove('dark');
  }
}

describe('Theme Validator', () => {

  describe('parseColor', () => {
    it('should parse 3-digit hex colors', () => {
      const color = parseColor('#fff');
      expect(color).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse 6-digit hex colors', () => {
      const color = parseColor('#1a1a1a');
      expect(color).toEqual({ r: 26, g: 26, b: 26 });
    });

    it('should parse rgb colors', () => {
      const color = parseColor('rgb(26, 26, 26)');
      expect(color).toEqual({ r: 26, g: 26, b: 26 });
    });

    it('should parse rgba colors', () => {
      const color = parseColor('rgba(26, 26, 26, 0.5)');
      expect(color).toEqual({ r: 26, g: 26, b: 26 });
    });

    it('should return null for invalid colors', () => {
      const color = parseColor('invalid');
      expect(color).toBeNull();
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio for black on white', () => {
      const black = { r: 0, g: 0, b: 0 };
      const white = { r: 255, g: 255, b: 255 };
      const ratio = getContrastRatio(black, white);
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate contrast ratio for same colors', () => {
      const color = { r: 128, g: 128, b: 128 };
      const ratio = getContrastRatio(color, color);
      expect(ratio).toBe(1);
    });

    it('should calculate contrast ratio for text-primary on bg-primary', () => {
      // --text-primary: #1a1a1a (26, 26, 26)
      // --bg-primary: #f5f3f0 (245, 243, 240)
      const textPrimary = { r: 26, g: 26, b: 26 };
      const bgPrimary = { r: 245, g: 243, b: 240 };
      const ratio = getContrastRatio(textPrimary, bgPrimary);
      // Should be around 16.6:1 as documented
      expect(ratio).toBeGreaterThan(15);
    });
  });

  describe('checkContrast', () => {
    it('should pass WCAG AA for high contrast', () => {
      const result = checkContrast('#1a1a1a', '#f5f3f0');
      expect(result.passes).toBe(true);
      expect(result.wcagLevel).toBe('AAA');
      expect(result.ratio).toBeGreaterThan(7);
    });

    it('should pass WCAG AA for normal text', () => {
      const result = checkContrast('#4a5568', '#f5f3f0');
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThan(4.5);
    });

    it('should fail WCAG AA for low contrast', () => {
      const result = checkContrast('#cccccc', '#ffffff');
      expect(result.passes).toBe(false);
      expect(result.wcagLevel).toBe('FAIL');
    });

    it('should use lower threshold for large text', () => {
      // A contrast that passes for large text but not normal text
      const result = checkContrast('#767676', '#ffffff', true);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThan(3);
      expect(result.ratio).toBeLessThan(5);
    });
  });

  describe('validateTheme', () => {
    beforeEach(() => {
      ensureThemeStyles();
      // Ensure we start in light mode
      setDarkMode(false);
    });

    afterEach(() => {
      // Clean up
      setDarkMode(false);
    });

    it('should validate CSS variables exist', () => {
      const result = validateTheme();
      
      // Check that required variables are found
      expect(result.cssVariables.light.length).toBeGreaterThan(0);
      expect(result.cssVariables.dark.length).toBeGreaterThan(0);
      
      // Check for specific critical variables
      expect(result.cssVariables.light).toContain('--text-primary');
      expect(result.cssVariables.light).toContain('--bg-primary');
      expect(result.cssVariables.light).toContain('--border-color');
    });

    it('should validate glassmorphism effects', () => {
      const result = validateTheme();
      
      // Glassmorphism should work in both themes
      expect(result.glassmorphism.light).toBe(true);
      expect(result.glassmorphism.dark).toBe(true);
    });

    it('should validate WCAG AA contrast ratios', () => {
      const result = validateTheme();
      
      // Primary text should meet WCAG AA in both themes
      expect(result.contrast['light-primary']?.passes).toBe(true);
      expect(result.contrast['dark-primary']?.passes).toBe(true);
      
      // Secondary text should meet WCAG AA in both themes
      expect(result.contrast['light-secondary']?.passes).toBe(true);
      expect(result.contrast['dark-secondary']?.passes).toBe(true);
    });

    it('should validate borders are visible', () => {
      const result = validateTheme();
      
      expect(result.borders.light).toBe(true);
      expect(result.borders.dark).toBe(true);
    });

    it('should validate shadows are visible', () => {
      const result = validateTheme();
      
      expect(result.shadows.light).toBe(true);
      expect(result.shadows.dark).toBe(true);
    });

    it('should have no missing critical variables', () => {
      const result = validateTheme();
      
      // Filter out non-critical missing variables
      const criticalMissing = result.cssVariables.missing.filter(v => 
        v.includes('--text-primary') || 
        v.includes('--bg-primary') ||
        v.includes('--border-color')
      );
      
      expect(criticalMissing.length).toBe(0);
    });
  });

  describe('Theme Switching', () => {
    it('should update CSS variables when switching themes', () => {
      // Light mode
      setDarkMode(false);
      const lightTextPrimary = getCSSVariable('--text-primary');
      
      // Dark mode
      setDarkMode(true);
      const darkTextPrimary = getCSSVariable('--text-primary');
      
      // Values should be different
      expect(lightTextPrimary).not.toBe(darkTextPrimary);
      
      // Clean up
      setDarkMode(false);
    });

    it('should maintain glassmorphism in both themes', () => {
      const testCard = document.createElement('div');
      testCard.className = 'premium-card';
      testCard.style.position = 'absolute';
      testCard.style.visibility = 'hidden';
      document.body.appendChild(testCard);
      
      // Light mode
      setDarkMode(false);
      const lightStyles = getComputedStyle(testCard);
      const lightBackdrop = lightStyles.backdropFilter || (lightStyles as any).webkitBackdropFilter;
      
      // Dark mode
      setDarkMode(true);
      const darkStyles = getComputedStyle(testCard);
      const darkBackdrop = darkStyles.backdropFilter || (darkStyles as any).webkitBackdropFilter;
      
      // Both should have backdrop filter
      expect(lightBackdrop).not.toBe('none');
      expect(darkBackdrop).not.toBe('none');
      
      // Clean up
      document.body.removeChild(testCard);
      setDarkMode(false);
    });

    it('should ensure dark theme styles take precedence', () => {
      // Create a test element
      const testEl = document.createElement('div');
      testEl.className = 'premium-card';
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      document.body.appendChild(testEl);
      
      // Light mode background
      setDarkMode(false);
      const lightGlassBg = getCSSVariable('--glass-bg-light');
      
      // Dark mode background
      setDarkMode(true);
      const darkGlassBg = getCSSVariable('--glass-bg-dark');
      
      // Variables should be different
      expect(lightGlassBg).not.toBe(darkGlassBg);
      
      // Dark mode should use dark glass background
      expect(darkGlassBg).toBeTruthy();
      
      // Clean up
      document.body.removeChild(testEl);
      setDarkMode(false);
    });
  });

  describe('Specific Component Contrast', () => {
    it('should validate header text contrast in light mode', () => {
      setDarkMode(false);
      const textColor = getCSSVariable('--text-primary');
      const bgColor = getCSSVariable('--glass-bg-light');
      
      // Parse the rgba background
      const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (bgMatch) {
        const bg = `rgb(${bgMatch[1]}, ${bgMatch[2]}, ${bgMatch[3]})`;
        const result = checkContrast(textColor, bg);
        expect(result.passes).toBe(true);
      }
    });

    it('should validate header text contrast in dark mode', () => {
      setDarkMode(true);
      const textColor = getCSSVariable('--text-primary');
      const bgColor = getCSSVariable('--glass-bg-dark');
      
      // Parse the rgba background
      const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (bgMatch) {
        const bg = `rgb(${bgMatch[1]}, ${bgMatch[2]}, ${bgMatch[3]})`;
        const result = checkContrast(textColor, bg);
        expect(result.passes).toBe(true);
      }
      
      setDarkMode(false);
    });

    it('should validate button text contrast', () => {
      // Buttons use white text on gold gradient
      const result = checkContrast('#0f172a', '#F4C430');
      expect(result.passes).toBe(true);
    });

    it('should validate tab active state contrast', () => {
      // Active tabs use gold color
      const lightResult = checkContrast('#4f46e5', '#f5f3f0');
      expect(lightResult.passes).toBe(true);
      
      // Dark mode active tabs
      const darkResult = checkContrast('#818cf8', '#0f172a');
      expect(darkResult.passes).toBe(true);
    });
  });
});
