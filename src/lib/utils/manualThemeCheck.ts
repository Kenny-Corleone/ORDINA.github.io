/**
 * Manual Theme System Check
 * 
 * This script can be run in the browser console to validate the theme system.
 * Usage: Copy and paste this into the browser console while the app is running.
 */

export function runManualThemeCheck() {
  console.group('🎨 Manual Theme System Check');
  
  // Check 1: CSS Variables
  console.group('1. CSS Variables');
  const variables = [
    '--text-primary',
    '--text-secondary',
    '--bg-primary',
    '--bg-secondary',
    '--border-color',
    '--glass-bg-light',
    '--glass-bg-dark',
    '--glass-blur',
  ];
  
  document.body.classList.remove('dark');
  console.log('Light Mode:');
  variables.forEach(v => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(v);
    console.log(`  ${v}: ${value || '❌ MISSING'}`);
  });
  
  document.body.classList.add('dark');
  console.log('\nDark Mode:');
  variables.forEach(v => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(v);
    console.log(`  ${v}: ${value || '❌ MISSING'}`);
  });
  document.body.classList.remove('dark');
  console.groupEnd();
  
  // Check 2: Glassmorphism
  console.group('2. Glassmorphism Effects');
  const card = document.querySelector('.premium-card') as HTMLElement;
  if (card) {
    document.body.classList.remove('dark');
    const lightBackdrop = getComputedStyle(card).backdropFilter || (getComputedStyle(card) as any).webkitBackdropFilter;
    console.log(`Light mode backdrop-filter: ${lightBackdrop}`);
    
    document.body.classList.add('dark');
    const darkBackdrop = getComputedStyle(card).backdropFilter || (getComputedStyle(card) as any).webkitBackdropFilter;
    console.log(`Dark mode backdrop-filter: ${darkBackdrop}`);
    document.body.classList.remove('dark');
  } else {
    console.warn('No .premium-card element found');
  }
  console.groupEnd();
  
  // Check 3: Contrast Ratios
  console.group('3. WCAG AA Contrast Ratios');
  
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }) as [number, number, number];
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  function getContrastRatio(fg: string, bg: string): number {
    const fgMatch = fg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const bgMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    
    if (!fgMatch || !bgMatch || !fgMatch[1] || !fgMatch[2] || !fgMatch[3] || !bgMatch[1] || !bgMatch[2] || !bgMatch[3]) return 0;
    
    const l1 = getLuminance(+fgMatch[1], +fgMatch[2], +fgMatch[3]);
    const l2 = getLuminance(+bgMatch[1], +bgMatch[2], +bgMatch[3]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  document.body.classList.remove('dark');
  const lightText = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
  const lightBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
  const lightRatio = getContrastRatio(lightText, lightBg);
  console.log(`Light mode: ${lightRatio.toFixed(2)}:1 ${lightRatio >= 4.5 ? '✅' : '❌'}`);
  
  document.body.classList.add('dark');
  const darkText = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
  const darkBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
  const darkRatio = getContrastRatio(darkText, darkBg);
  console.log(`Dark mode: ${darkRatio.toFixed(2)}:1 ${darkRatio >= 4.5 ? '✅' : '❌'}`);
  document.body.classList.remove('dark');
  console.groupEnd();
  
  // Check 4: Borders
  console.group('4. Border Visibility');
  document.body.classList.remove('dark');
  const lightBorder = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
  console.log(`Light mode border: ${lightBorder}`);
  
  document.body.classList.add('dark');
  const darkBorder = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
  console.log(`Dark mode border: ${darkBorder}`);
  document.body.classList.remove('dark');
  console.groupEnd();
  
  // Check 5: Shadows
  console.group('5. Shadow Visibility');
  document.body.classList.remove('dark');
  const lightShadow = getComputedStyle(document.documentElement).getPropertyValue('--shadow');
  console.log(`Light mode shadow: ${lightShadow}`);
  
  document.body.classList.add('dark');
  const darkShadow = getComputedStyle(document.documentElement).getPropertyValue('--shadow');
  console.log(`Dark mode shadow: ${darkShadow}`);
  document.body.classList.remove('dark');
  console.groupEnd();
  
  // Check 6: Dark Theme Precedence
  console.group('6. Dark Theme Precedence');
  if (card) {
    document.body.classList.remove('dark');
    const lightCardBg = getComputedStyle(card).backgroundColor;
    
    document.body.classList.add('dark');
    const darkCardBg = getComputedStyle(card).backgroundColor;
    
    console.log(`Light card bg: ${lightCardBg}`);
    console.log(`Dark card bg: ${darkCardBg}`);
    console.log(`Different: ${lightCardBg !== darkCardBg ? '✅' : '❌'}`);
    document.body.classList.remove('dark');
  }
  console.groupEnd();
  
  console.groupEnd();
}

// Make it available globally for console use
if (typeof window !== 'undefined') {
  (window as any).runManualThemeCheck = runManualThemeCheck;
}
