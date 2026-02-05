/**
 * Browser Polyfills for Cross-Browser Compatibility
 * 
 * This module provides polyfills for modern JavaScript APIs that may not be
 * available in older browsers. Polyfills are loaded conditionally only when needed.
 * 
 * Requirements: 15.3 - Add polyfills for JavaScript APIs
 * 
 * Supported APIs:
 * - ResizeObserver: Used in VirtualList component
 * - IntersectionObserver: For lazy loading and visibility detection
 * - smoothscroll: For smooth scrolling behavior
 */

/**
 * ResizeObserver Polyfill
 * 
 * Provides a basic implementation of ResizeObserver for browsers that don't support it.
 * This is a simplified polyfill that uses window resize events as a fallback.
 */
function polyfillResizeObserver() {
  if (typeof window.ResizeObserver !== 'undefined') {
    return; // Native support available
  }

  class ResizeObserverPolyfill {
    private callback: ResizeObserverCallback;
    private observedElements: Set<Element> = new Set();
    private resizeHandler: () => void;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      this.resizeHandler = this.handleResize.bind(this);
    }

    observe(target: Element): void {
      if (this.observedElements.size === 0) {
        window.addEventListener('resize', this.resizeHandler);
      }
      this.observedElements.add(target);
      // Trigger initial callback
      this.notifyElement(target);
    }

    unobserve(target: Element): void {
      this.observedElements.delete(target);
      if (this.observedElements.size === 0) {
        window.removeEventListener('resize', this.resizeHandler);
      }
    }

    disconnect(): void {
      this.observedElements.clear();
      window.removeEventListener('resize', this.resizeHandler);
    }

    private handleResize(): void {
      this.observedElements.forEach(element => {
        this.notifyElement(element);
      });
    }

    private notifyElement(element: Element): void {
      const rect = element.getBoundingClientRect();
      const entry: ResizeObserverEntry = {
        target: element,
        contentRect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          toJSON: () => ({})
        },
        borderBoxSize: [{
          blockSize: rect.height,
          inlineSize: rect.width
        }],
        contentBoxSize: [{
          blockSize: rect.height,
          inlineSize: rect.width
        }],
        devicePixelContentBoxSize: [{
          blockSize: rect.height,
          inlineSize: rect.width
        }]
      };

      this.callback([entry], this as any);
    }
  }

  (window as any).ResizeObserver = ResizeObserverPolyfill;
  console.log('✅ ResizeObserver polyfill loaded');
}

/**
 * IntersectionObserver Polyfill
 * 
 * Provides a basic implementation of IntersectionObserver for browsers that don't support it.
 * This is a simplified polyfill that uses scroll events as a fallback.
 */
function polyfillIntersectionObserver() {
  if (typeof window.IntersectionObserver !== 'undefined') {
    return; // Native support available
  }

  class IntersectionObserverPolyfill {
    private callback: IntersectionObserverCallback;
    private observedElements: Map<Element, boolean> = new Map();
    private scrollHandler: () => void;
    private options: IntersectionObserverInit;

    constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
      this.callback = callback;
      this.options = options;
      this.scrollHandler = this.handleScroll.bind(this);
    }

    observe(target: Element): void {
      if (this.observedElements.size === 0) {
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
        window.addEventListener('resize', this.scrollHandler);
      }
      this.observedElements.set(target, false);
      // Trigger initial check asynchronously to match native behavior
      setTimeout(() => this.checkElement(target), 0);
    }

    unobserve(target: Element): void {
      this.observedElements.delete(target);
      if (this.observedElements.size === 0) {
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.scrollHandler);
      }
    }

    disconnect(): void {
      this.observedElements.clear();
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.scrollHandler);
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }

    private handleScroll(): void {
      this.observedElements.forEach((_, element) => {
        this.checkElement(element);
      });
    }

    private checkElement(element: Element): void {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      const threshold = this.options.threshold || 0;
      const rootMargin = this.options.rootMargin || '0px';

      // Simple visibility check
      const isVisible = (
        rect.top < windowHeight &&
        rect.bottom > 0 &&
        rect.left < windowWidth &&
        rect.right > 0
      );

      const wasVisible = this.observedElements.get(element);

      if (isVisible !== wasVisible) {
        this.observedElements.set(element, isVisible);

        const entry: IntersectionObserverEntry = {
          target: element,
          boundingClientRect: rect,
          intersectionRatio: isVisible ? 1 : 0,
          intersectionRect: isVisible ? rect : new DOMRectReadOnly(),
          isIntersecting: isVisible,
          rootBounds: null,
          time: Date.now()
        };

        this.callback([entry], this as any);
      }
    }
  }

  (window as any).IntersectionObserver = IntersectionObserverPolyfill;
  console.log('✅ IntersectionObserver polyfill loaded');
}

/**
 * Smooth Scroll Polyfill
 * 
 * Adds smooth scrolling behavior for browsers that don't support it natively.
 */
function polyfillSmoothScroll() {
  // Check if smooth scroll is supported
  if ('scrollBehavior' in document.documentElement.style) {
    return; // Native support available
  }

  // Polyfill Element.prototype.scrollIntoView
  if (typeof Element.prototype.scrollIntoView === 'function') {
    const originalScrollIntoView = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function(arg?: boolean | ScrollIntoViewOptions) {
      if (typeof arg === 'object' && arg.behavior === 'smooth') {
        const element = this;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop;

        smoothScrollTo(targetY, 300);
      } else {
        originalScrollIntoView.call(this, arg);
      }
    };
  }

  // Polyfill window.scroll with smooth behavior
  if (typeof window.scroll === 'function') {
    const originalScroll = window.scroll;

    window.scroll = function(options: ScrollToOptions | number, y?: number) {
      if (typeof options === 'object' && options.behavior === 'smooth') {
        smoothScrollTo(options.top || 0, 300);
      } else {
        originalScroll.call(window, options as any, y);
      }
    };
  }

  console.log('✅ Smooth scroll polyfill loaded');
}

/**
 * Helper function for smooth scrolling animation
 */
function smoothScrollTo(targetY: number, duration: number) {
  const startY = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetY - startY;
  const startTime = Date.now();

  function scroll() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-in-out)
    const easing = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startY + distance * easing);

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }

  requestAnimationFrame(scroll);
}

/**
 * Initialize all polyfills
 * 
 * This function should be called early in the application lifecycle,
 * before any components that might use these APIs are initialized.
 * 
 * Requirements: 15.3 - Add polyfills for JavaScript APIs
 */
export function initPolyfills(): void {
  if (typeof window === 'undefined') {
    return; // Skip in SSR environment
  }

  console.log('🔧 Initializing browser polyfills...');

  polyfillResizeObserver();
  polyfillIntersectionObserver();
  polyfillSmoothScroll();

  console.log('✅ All polyfills initialized');
}

/**
 * Check browser compatibility and log warnings for unsupported features
 * 
 * Requirements: 15.4 - Document browser-specific workarounds
 */
export function checkBrowserCompatibility(): {
  browser: string;
  version: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  const ua = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  }

  // Check for critical features
  if (!('ResizeObserver' in window)) {
    warnings.push('ResizeObserver not supported (polyfill loaded)');
  }

  if (!('IntersectionObserver' in window)) {
    warnings.push('IntersectionObserver not supported (polyfill loaded)');
  }

  // Check for CSS.supports availability (not available in all environments)
  if (typeof CSS !== 'undefined' && CSS.supports) {
    if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
      warnings.push('backdrop-filter not supported - glassmorphism effects may not work');
    }
  }

  if (!('scrollBehavior' in document.documentElement.style)) {
    warnings.push('Smooth scroll not supported (polyfill loaded)');
  }

  if (warnings.length > 0) {
    console.warn(`⚠️ Browser compatibility warnings for ${browser} ${version}:`, warnings);
  } else {
    console.log(`✅ Full browser compatibility for ${browser} ${version}`);
  }

  return { browser, version, warnings };
}
