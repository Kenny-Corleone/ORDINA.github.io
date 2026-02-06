/**
 * Accessibility Utilities
 * 
 * Provides utilities for ensuring WCAG AA compliance and accessibility best practices.
 */

/**
 * Checks if an element has sufficient color contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): { ratio: number; passes: boolean } {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  const requiredRatio = isLargeText ? 3 : 4.5;
  const passes = ratio >= requiredRatio;
  
  return { ratio, passes };
}

/**
 * Calculates relative luminance for a color
 */
function getRelativeLuminance(color: string): number {
  // Convert hex to RGB
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  // Convert to relative luminance
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Ensures an element has proper ARIA attributes
 */
export function ensureAriaAttributes(element: HTMLElement): void {
  // Check for interactive elements without labels
  const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
  const tagName = element.tagName.toLowerCase();
  
  if (interactiveTags.includes(tagName)) {
    const hasLabel = 
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      (element as HTMLInputElement).labels?.length > 0;
    
    if (!hasLabel) {
      console.warn('Interactive element missing accessible label:', element);
    }
  }
}

/**
 * Checks if keyboard navigation is properly implemented
 */
export function checkKeyboardNavigation(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(
    element.tagName.toLowerCase()
  );
  
  // Interactive elements should be keyboard accessible
  if (isInteractive) {
    // tabindex="-1" makes element not keyboard accessible
    if (tabIndex === '-1') {
      console.warn('Interactive element not keyboard accessible:', element);
      return false;
    }
  }
  
  return true;
}

/**
 * Ensures focus indicators are visible
 */
export function ensureFocusIndicators(): void {
  // Add global focus styles if not present
  const styleId = 'accessibility-focus-styles';
  
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Ensure visible focus indicators */
      *:focus {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      
      /* Enhanced focus for interactive elements */
      button:focus,
      a:focus,
      input:focus,
      select:focus,
      textarea:focus {
        outline: 2px solid #667eea;
        outline-offset: 2px;
      }
      
      /* Dark mode focus */
      .dark button:focus,
      .dark a:focus,
      .dark input:focus,
      .dark select:focus,
      .dark textarea:focus {
        outline-color: #fbbf24;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Validates screen reader order matches visual order
 */
export function validateScreenReaderOrder(container: HTMLElement): boolean {
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  let previousTabIndex = -Infinity;
  let isValid = true;
  
  interactiveElements.forEach((element) => {
    const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
    
    // Positive tabindex values should be in order
    if (tabIndex > 0) {
      if (tabIndex < previousTabIndex) {
        console.warn('Tab order may not match visual order:', element);
        isValid = false;
      }
      previousTabIndex = tabIndex;
    }
  });
  
  return isValid;
}

/**
 * Checks if information is conveyed by color alone
 */
export function checkColorOnlyInformation(element: HTMLElement): boolean {
  // Check for common patterns where color alone conveys meaning
  const hasColorClass = element.className.match(/\b(red|green|blue|yellow|success|error|warning|info)\b/i);
  
  if (hasColorClass) {
    // Check if there's also text or icon to convey the meaning
    const hasText = element.textContent?.trim();
    const hasIcon = element.querySelector('svg, img, [role="img"]');
    const hasAriaLabel = element.hasAttribute('aria-label');
    
    if (!hasText && !hasIcon && !hasAriaLabel) {
      console.warn('Information may be conveyed by color alone:', element);
      return false;
    }
  }
  
  return true;
}

/**
 * Ensures minimum touch target size (44x44px for mobile)
 */
export function ensureTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = 44;
  
  if (rect.width < minSize || rect.height < minSize) {
    const isInteractive = ['button', 'a', 'input', 'select'].includes(
      element.tagName.toLowerCase()
    );
    
    if (isInteractive) {
      console.warn(`Touch target too small (${rect.width}x${rect.height}):`, element);
      return false;
    }
  }
  
  return true;
}

/**
 * Initializes accessibility checks for the application
 */
export function initAccessibility(): void {
  // Ensure focus indicators
  ensureFocusIndicators();
  
  // Add keyboard navigation support
  document.addEventListener('keydown', (e) => {
    // Escape key should close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('[aria-label*="Close"], [aria-label*="close"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      }
    }
  });
  
  // Log accessibility warnings in development
  if (import.meta.env.DEV) {
    console.log('Accessibility checks initialized');
  }
}
