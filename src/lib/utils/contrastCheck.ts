/**
 * Contrast Ratio Calculator
 * 
 * Quick utility to check if color combinations meet WCAG AA standards
 */

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function checkContrast(fg: string, bg: string): number {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  
  const l1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Test color combinations
console.group('🎨 Color Contrast Analysis');

// Button colors
console.group('Button Contrast');
const whiteOnGoldPrimary = checkContrast('#ffffff', '#F4C430');
console.log(`White on gold-primary (#F4C430): ${whiteOnGoldPrimary.toFixed(2)}:1 ${whiteOnGoldPrimary >= 4.5 ? '✅' : '❌'}`);

const whiteOnGoldDark = checkContrast('#ffffff', '#d97706');
console.log(`White on gold-dark (#d97706): ${whiteOnGoldDark.toFixed(2)}:1 ${whiteOnGoldDark >= 4.5 ? '✅' : '❌'}`);
console.groupEnd();

// Tab active state
console.group('Tab Active State');
const goldTextOnLight = checkContrast('#B8941F', '#f5f3f0');
console.log(`Gold-text (#B8941F) on light bg (#f5f3f0): ${goldTextOnLight.toFixed(2)}:1 ${goldTextOnLight >= 4.5 ? '✅' : '❌'}`);

const goldPrimaryOnLight = checkContrast('#F4C430', '#f5f3f0');
console.log(`Gold-primary (#F4C430) on light bg (#f5f3f0): ${goldPrimaryOnLight.toFixed(2)}:1 ${goldPrimaryOnLight >= 4.5 ? '✅' : '❌'}`);

const goldLightOnDark = checkContrast('#fbbf24', '#0f172a');
console.log(`Gold-light (#fbbf24) on dark bg (#0f172a): ${goldLightOnDark.toFixed(2)}:1 ${goldLightOnDark >= 4.5 ? '✅' : '❌'}`);
console.groupEnd();

// Primary text
console.group('Primary Text');
const textPrimaryOnBgPrimary = checkContrast('#1a1a1a', '#f5f3f0');
console.log(`Text-primary (#1a1a1a) on bg-primary (#f5f3f0): ${textPrimaryOnBgPrimary.toFixed(2)}:1 ${textPrimaryOnBgPrimary >= 4.5 ? '✅' : '❌'}`);

const textSecondaryOnBgPrimary = checkContrast('#4a5568', '#f5f3f0');
console.log(`Text-secondary (#4a5568) on bg-primary (#f5f3f0): ${textSecondaryOnBgPrimary.toFixed(2)}:1 ${textSecondaryOnBgPrimary >= 4.5 ? '✅' : '❌'}`);

const whiteSoftOnGraphiteDeep = checkContrast('#F8F9FA', '#0f172a');
console.log(`White-soft (#F8F9FA) on graphite-deep (#0f172a): ${whiteSoftOnGraphiteDeep.toFixed(2)}:1 ${whiteSoftOnGraphiteDeep >= 4.5 ? '✅' : '❌'}`);
console.groupEnd();

console.groupEnd();
