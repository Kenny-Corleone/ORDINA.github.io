/**
 * Theme System Validator
 * 
 * This utility validates the theme system to ensure:
 * - CSS variables are properly defined
 * - Glassmorphism effects work in both themes
 * - WCAG AA contrast ratios are met
 * - Borders and shadows are visible in both themes
 * - Dark theme styles take precedence
 */

export interface ContrastResult {
  ratio: number;
  passes: boolean;
  wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL';
}

export interface ThemeValidationResult {
  cssVariables: {
    light: string[];
    dark: string[];
    missing: string[];
  };
  glassmorphism: {
    light: boolean;
    dark: boolean;
  };
  contrast: {
    [key: string]: ContrastResult;
  };
  borders: {
    light: boolean;
    dark: boolean;
  };
  shadows: {
    light: boolean;
    dark: boolean;
  };
}

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse RGB color from various formats
 */
export function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const h0 = hex[0] ?? '0';
      const h1 = hex[1] ?? '0';
      const h2 = hex[2] ?? '0';
      return {
        r: parseInt(h0 + h0, 16),
        g: parseInt(h1 + h1, 16),
        b: parseInt(h2 + h2, 16),
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }
  
  return null;
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastResult {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  
  if (!fg || !bg) {
    return {
      ratio: 0,
      passes: false,
      wcagLevel: 'FAIL',
    };
  }
  
  const ratio = getContrastRatio(fg, bg);
  const minRatio = isLargeText ? 3 : 4.5;
  const aaaRatio = isLargeText ? 4.5 : 7;
  
  let wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL';
  if (ratio >= aaaRatio) {
    wcagLevel = 'AAA';
  } else if (ratio >= minRatio) {
    wcagLevel = 'AA';
  } else if (ratio >= 3) {
    wcagLevel = 'A';
  } else {
    wcagLevel = 'FAIL';
  }
  
  return {
    ratio,
    passes: ratio >= minRatio,
    wcagLevel,
  };
}

/**
 * Get computed CSS variable value
 */
export function getCSSVariable(name: string, element?: HTMLElement): string {
  const el = element || document.documentElement;
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/**
 * Check if glassmorphism effects are applied
 */
export function checkGlasmorphism(element: HTMLElement): boolean {
  const styles = getComputedStyle(element);
  const backdropFilter = styles.backdropFilter || (styles as any).webkitBackdropFilter;
  return backdropFilter !== 'none' && backdropFilter !== '';
}

/**
 * Validate theme system
 */
export function validateTheme(): ThemeValidationResult {
  const requiredVariables = [
    '--text-primary',
    '--text-secondary',
    '--bg-primary',
    '--bg-secondary',
    '--border-color',
    '--glass-bg-light',
    '--glass-bg-dark',
    '--glass-border-light',
    '--glass-border-dark',
    '--glass-blur',
    '--shadow',
    '--shadow-gold',
  ];
  
  const result: ThemeValidationResult = {
    cssVariables: {
      light: [],
      dark: [],
      missing: [],
    },
    glassmorphism: {
      light: false,
      dark: false,
    },
    contrast: {},
    borders: {
      light: false,
      dark: false,
    },
    shadows: {
      light: false,
      dark: false,
    },
  };
  
  // Check CSS variables in light mode
  document.body.classList.remove('dark');
  for (const varName of requiredVariables) {
    const value = getCSSVariable(varName);
    if (value) {
      result.cssVariables.light.push(varName);
    } else {
      result.cssVariables.missing.push(`${varName} (light)`);
    }
  }
  
  // Check CSS variables in dark mode
  document.body.classList.add('dark');
  for (const varName of requiredVariables) {
    const value = getCSSVariable(varName);
    if (value) {
      result.cssVariables.dark.push(varName);
    } else if (!result.cssVariables.missing.includes(`${varName} (light)`)) {
      result.cssVariables.missing.push(`${varName} (dark)`);
    }
  }
  
  // Check contrast ratios
  document.body.classList.remove('dark');
  const lightTextPrimary = getCSSVariable('--text-primary');
  const lightBgPrimary = getCSSVariable('--bg-primary');
  result.contrast['light-primary'] = checkContrast(lightTextPrimary, lightBgPrimary);
  
  const lightTextSecondary = getCSSVariable('--text-secondary');
  result.contrast['light-secondary'] = checkContrast(lightTextSecondary, lightBgPrimary);
  
  document.body.classList.add('dark');
  const darkTextPrimary = getCSSVariable('--text-primary');
  const darkBgPrimary = getCSSVariable('--bg-primary');
  result.contrast['dark-primary'] = checkContrast(darkTextPrimary, darkBgPrimary);
  
  const darkTextSecondary = getCSSVariable('--text-secondary');
  result.contrast['dark-secondary'] = checkContrast(darkTextSecondary, darkBgPrimary);
  
  // Check borders visibility
  document.body.classList.remove('dark');
  const lightBorder = getCSSVariable('--border-color');
  result.borders.light = lightBorder !== 'transparent' && lightBorder !== '';
  
  document.body.classList.add('dark');
  const darkBorder = getCSSVariable('--border-color');
  result.borders.dark = darkBorder !== 'transparent' && darkBorder !== '';
  
  // Check shadows visibility
  document.body.classList.remove('dark');
  const lightShadow = getCSSVariable('--shadow');
  result.shadows.light = lightShadow !== 'none' && lightShadow !== '';
  
  document.body.classList.add('dark');
  const darkShadow = getCSSVariable('--shadow');
  result.shadows.dark = darkShadow !== 'none' && darkShadow !== '';
  
  // Check glassmorphism
  const testCard = document.createElement('div');
  testCard.className = 'premium-card';
  testCard.style.position = 'absolute';
  testCard.style.visibility = 'hidden';
  document.body.appendChild(testCard);
  
  document.body.classList.remove('dark');
  result.glassmorphism.light = checkGlasmorphism(testCard);
  
  document.body.classList.add('dark');
  result.glassmorphism.dark = checkGlasmorphism(testCard);
  
  document.body.removeChild(testCard);
  
  // Reset to original state
  document.body.classList.remove('dark');
  
  return result;
}

/**
 * Log validation results to console
 */
export function logValidationResults(result: ThemeValidationResult): void {
  console.group('🎨 Theme System Validation');
  
  console.group('CSS Variables');
  console.log('✅ Light mode variables:', result.cssVariables.light.length);
  console.log('✅ Dark mode variables:', result.cssVariables.dark.length);
  if (result.cssVariables.missing.length > 0) {
    console.warn('⚠️ Missing variables:', result.cssVariables.missing);
  }
  console.groupEnd();
  
  console.group('Glassmorphism Effects');
  console.log('Light mode:', result.glassmorphism.light ? '✅' : '❌');
  console.log('Dark mode:', result.glassmorphism.dark ? '✅' : '❌');
  console.groupEnd();
  
  console.group('WCAG AA Contrast Ratios');
  for (const [key, value] of Object.entries(result.contrast)) {
    const icon = value.passes ? '✅' : '❌';
    console.log(`${icon} ${key}: ${value.ratio.toFixed(2)}:1 (${value.wcagLevel})`);
  }
  console.groupEnd();
  
  console.group('Borders & Shadows');
  console.log('Light borders:', result.borders.light ? '✅' : '❌');
  console.log('Dark borders:', result.borders.dark ? '✅' : '❌');
  console.log('Light shadows:', result.shadows.light ? '✅' : '❌');
  console.log('Dark shadows:', result.shadows.dark ? '✅' : '❌');
  console.groupEnd();
  
  console.groupEnd();
}
