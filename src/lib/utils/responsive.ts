/**
 * Responsive System Utility Module
 * 
 * Provides device detection and responsive layout management.
 * Applies device-specific CSS classes to body element for responsive styling.
 */

export const BREAKPOINTS = {
  MOBILE: 850,
  TABLET: 1024,
  DESKTOP: 1025
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

let currentDeviceType: DeviceType | null = null;
let isTouchDevice = false;
let resizeTimeout: number | null = null;

/**
 * Detects if the device supports touch input
 */
export function detectTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Determines the device type based on viewport width
 * 
 * Breakpoints:
 * - Mobile: < 768px (phones)
 * - Tablet: 768px - 1024px (tablets, small laptops)
 * - Desktop: >= 1025px (laptops, desktops)
 * 
 * Visual viewport vs window.innerWidth:
 * - visualViewport.width: Accounts for browser zoom and virtual keyboard
 * - window.innerWidth: Static viewport width
 * - We prefer visualViewport for better handling of zoom and mobile keyboards
 * 
 * Why these breakpoints:
 * - 768px: Common tablet portrait width, matches Tailwind's 'md' breakpoint
 * - 1024px: Common tablet landscape width, matches Tailwind's 'lg' breakpoint
 */
export function getDeviceType(): DeviceType {
  // Use visual viewport if available (for proper handling during zoom)
  const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  
  if (width < BREAKPOINTS.MOBILE) {
    return 'mobile';
  } else if (width < BREAKPOINTS.DESKTOP) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Applies device-specific CSS classes to body element
 * 
 * CSS classes applied:
 * - device-mobile, device-tablet, or device-desktop
 * - touch-device (if touch is supported)
 * 
 * Why apply to body:
 * - Allows CSS to target device-specific styles globally
 * - Example: .device-mobile .table { display: block; } for card-based layouts
 * - Avoids JavaScript-based conditional rendering in components
 * - Enables responsive CSS without media queries in some cases
 * 
 * Also updates CSS variables for header height based on device type:
 * - Mobile: smaller header (100px main + 50px nav = 150px total)
 * - Tablet/Desktop: larger header (120px main + 50px nav = 170px total)
 */
function applyDeviceClasses(deviceType: DeviceType, isTouch: boolean) {
  // Remove all device classes
  document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'touch-device');
  
  // Add current device class
  document.body.classList.add(`device-${deviceType}`);
  
  // Add touch device class if applicable
  if (isTouch) {
    document.body.classList.add('touch-device');
  }
  
  // Update CSS variables for header height based on device type
  // Mobile devices get a more compact header to maximize content space
  const root = document.documentElement;
  if (deviceType === 'mobile') {
    root.style.setProperty('--header-height', '100px');
    root.style.setProperty('--header-total-height', '150px');
  } else {
    root.style.setProperty('--header-height', '120px');
    root.style.setProperty('--header-total-height', '170px');
  }
}

/**
 * Initializes the responsive system
 * Should be called once on app mount
 */
export function initResponsiveSystem(): () => void {
  // Detect device type and touch capability
  isTouchDevice = detectTouchDevice();
  currentDeviceType = getDeviceType();
  
  // Apply initial device classes
  applyDeviceClasses(currentDeviceType, isTouchDevice);
  
  // Set up resize listener with debouncing
  // Debouncing prevents excessive recalculations during window resize
  // We wait 150ms after the last resize event before recalculating device type
  const handleResize = () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = window.setTimeout(() => {
      const newDeviceType = getDeviceType();
      
      // Only update if device type actually changed
      // This prevents unnecessary DOM updates and re-renders
      if (newDeviceType !== currentDeviceType) {
        currentDeviceType = newDeviceType;
        applyDeviceClasses(currentDeviceType, isTouchDevice);
        
        console.log('Device type changed to:', currentDeviceType);
      }
      
      resizeTimeout = null;
    }, 150); // 150ms debounce delay
  };
  
  window.addEventListener('resize', handleResize);
  
  console.log('Responsive system initialized:', { 
    deviceType: currentDeviceType, 
    isTouch: isTouchDevice,
    width: window.innerWidth
  });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }
  };
}

/**
 * Gets the current device type
 */
export function getCurrentDeviceType(): DeviceType | null {
  return currentDeviceType;
}

/**
 * Checks if current device is mobile
 */
export function isMobile(): boolean {
  return currentDeviceType === 'mobile';
}

/**
 * Checks if current device is tablet
 */
export function isTablet(): boolean {
  return currentDeviceType === 'tablet';
}

/**
 * Checks if current device is desktop
 */
export function isDesktop(): boolean {
  return currentDeviceType === 'desktop';
}

/**
 * Checks if current device supports touch
 */
export function isTouch(): boolean {
  return isTouchDevice;
}
