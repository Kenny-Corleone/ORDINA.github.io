/**
 * Performance Optimization Utilities
 * 
 * Provides utilities for optimizing application performance including:
 * - Animation performance monitoring
 * - Image lazy loading
 * - CSS reflow optimization
 * - Performance metrics collection
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

/**
 * Check if animations use GPU-accelerated properties
 * GPU-accelerated properties: transform, opacity, filter
 * Non-GPU properties: left, top, width, height, margin, padding
 */
export function validateAnimationPerformance(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Get all stylesheets
  const stylesheets = Array.from(document.styleSheets);
  
  stylesheets.forEach((stylesheet) => {
    try {
      const rules = Array.from(stylesheet.cssRules || []);
      
      rules.forEach((rule) => {
        // Check transition properties
        if (rule instanceof CSSStyleRule) {
          const transition = rule.style.transition;
          const transitionProperty = rule.style.transitionProperty;
          
          // Check for non-GPU-accelerated properties in transitions
          const nonGPUProps = ['left', 'top', 'width', 'height', 'margin', 'padding', 'background-position'];
          const transitionText = transition + ' ' + transitionProperty;
          
          nonGPUProps.forEach(prop => {
            if (transitionText.includes(prop)) {
              issues.push(`Non-GPU-accelerated transition on "${prop}" in selector: ${rule.selectorText}`);
            }
          });
        }
        
        // Check keyframe animations
        if (rule instanceof CSSKeyframesRule) {
          const keyframes = Array.from(rule.cssRules);
          keyframes.forEach((keyframe) => {
            if (keyframe instanceof CSSKeyframeRule) {
              const style = keyframe.style;
              
              // Check for layout-triggering properties
              if (style.left || style.top || style.width || style.height || 
                  style.margin || style.padding) {
                issues.push(`Non-GPU-accelerated animation in @keyframes ${rule.name}`);
              }
            }
          });
        }
      });
    } catch (e) {
      // Cross-origin stylesheets may throw errors - skip them
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Ensure all images have lazy loading enabled
 * Excludes above-the-fold images (logo, hero images)
 */
export function validateImageLazyLoading(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const images = Array.from(document.querySelectorAll('img'));
  
  images.forEach((img) => {
    const id = img.id;
    const alt = img.alt;
    const loading = img.getAttribute('loading'); // Use getAttribute for better JSDOM compatibility
    
    // Skip above-the-fold images that should load eagerly
    const eagerLoadImages = ['header-logo', 'hero-image'];
    if (eagerLoadImages.includes(id)) {
      return;
    }
    
    // Check if lazy loading is enabled
    if (loading !== 'lazy') {
      issues.push(`Image missing lazy loading: ${alt || id || img.src}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Check for large lists that should use virtualization
 * Lists with >100 items should use VirtualList component
 */
export function validateListVirtualization(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Find all container elements that might have large lists
  const listContainers = Array.from(document.querySelectorAll('[class*="table"], [class*="list"]'));
  
  listContainers.forEach((container) => {
    const rows = container.querySelectorAll('tr, li, [class*="item"]');
    
    if (rows.length > 100) {
      const className = container.className;
      const hasVirtualList = container.closest('.virtual-list-container');
      
      if (!hasVirtualList) {
        issues.push(`Large list (${rows.length} items) without virtualization: ${className}`);
      }
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Collect performance metrics
 * Measures: Load time, FCP, LCP, CLS
 */
export interface PerformanceMetrics {
  loadTime: number;
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics = {
      loadTime: 0,
      fcp: null,
      lcp: null,
      cls: null,
      ttfb: null
    };
    
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
    
    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }
    
    // Use PerformanceObserver for LCP and CLS
    let lcpObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;
    let clsValue = 0;
    
    // Observe LCP
    if ('PerformanceObserver' in window) {
      try {
        lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }
      
      // Observe CLS
      try {
        clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              metrics.cls = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }
    
    // Wait for page load to complete
    if (document.readyState === 'complete') {
      setTimeout(() => {
        lcpObserver?.disconnect();
        clsObserver?.disconnect();
        resolve(metrics);
      }, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          lcpObserver?.disconnect();
          clsObserver?.disconnect();
          resolve(metrics);
        }, 1000);
      });
    }
  });
}

/**
 * Run all performance validations
 */
export async function runPerformanceAudit(): Promise<{
  animations: ReturnType<typeof validateAnimationPerformance>;
  images: ReturnType<typeof validateImageLazyLoading>;
  lists: ReturnType<typeof validateListVirtualization>;
  metrics: PerformanceMetrics;
}> {
  const animations = validateAnimationPerformance();
  const images = validateImageLazyLoading();
  const lists = validateListVirtualization();
  const metrics = await collectPerformanceMetrics();
  
  return {
    animations,
    images,
    lists,
    metrics
  };
}

/**
 * Log performance audit results to console
 */
export async function logPerformanceAudit(): Promise<void> {
  console.group('🚀 Performance Audit');
  
  const audit = await runPerformanceAudit();
  
  // Animations
  console.group('🎬 Animations');
  if (audit.animations.valid) {
    console.log('✅ All animations use GPU-accelerated properties');
  } else {
    console.warn('⚠️ Animation issues found:');
    audit.animations.issues.forEach(issue => console.warn(`  - ${issue}`));
  }
  console.groupEnd();
  
  // Images
  console.group('🖼️ Images');
  if (audit.images.valid) {
    console.log('✅ All images have proper lazy loading');
  } else {
    console.warn('⚠️ Image loading issues found:');
    audit.images.issues.forEach(issue => console.warn(`  - ${issue}`));
  }
  console.groupEnd();
  
  // Lists
  console.group('📋 Lists');
  if (audit.lists.valid) {
    console.log('✅ All large lists use virtualization');
  } else {
    console.warn('⚠️ List virtualization issues found:');
    audit.lists.issues.forEach(issue => console.warn(`  - ${issue}`));
  }
  console.groupEnd();
  
  // Metrics
  console.group('📊 Performance Metrics');
  console.log(`Load Time: ${audit.metrics.loadTime.toFixed(2)}ms`);
  console.log(`TTFB: ${audit.metrics.ttfb?.toFixed(2) || 'N/A'}ms`);
  console.log(`FCP: ${audit.metrics.fcp?.toFixed(2) || 'N/A'}ms`);
  console.log(`LCP: ${audit.metrics.lcp?.toFixed(2) || 'N/A'}ms`);
  console.log(`CLS: ${audit.metrics.cls?.toFixed(4) || 'N/A'}`);
  
  // Performance targets
  const targets = {
    loadTime: 2000, // 2s
    fcp: 1000, // 1s
    lcp: 2500, // 2.5s
    cls: 0.1
  };
  
  console.log('\n🎯 Performance Targets:');
  console.log(`Load Time: ${audit.metrics.loadTime <= targets.loadTime ? '✅' : '❌'} (target: ${targets.loadTime}ms)`);
  console.log(`FCP: ${(audit.metrics.fcp || 0) <= targets.fcp ? '✅' : '❌'} (target: ${targets.fcp}ms)`);
  console.log(`LCP: ${(audit.metrics.lcp || 0) <= targets.lcp ? '✅' : '❌'} (target: ${targets.lcp}ms)`);
  console.log(`CLS: ${(audit.metrics.cls || 0) <= targets.cls ? '✅' : '❌'} (target: ${targets.cls})`);
  console.groupEnd();
  
  console.groupEnd();
}
