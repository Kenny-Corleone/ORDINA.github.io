/* ============================================
   ORDINA PERFORMANCE & ACCESSIBILITY MODULE
   Staff Frontend - Production Ready
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. LAZY LOADING IMAGES & IFRAMES
    // ============================================
    
    const lazyLoadImages = () => {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Handle data-src
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Handle data-srcset
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        // Handle picture source
                        const picture = img.closest('picture');
                        if (picture) {
                            const sources = picture.querySelectorAll('source[data-srcset]');
                            sources.forEach(source => {
                                source.srcset = source.dataset.srcset;
                                source.removeAttribute('data-srcset');
                            });
                        }
                        
                        img.classList.add('loaded');
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe all lazy images
            document.querySelectorAll('img.lazy, img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            // Observe lazy iframes
            const iframeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const iframe = entry.target;
                        if (iframe.dataset.src) {
                            iframe.src = iframe.dataset.src;
                            iframe.removeAttribute('data-src');
                            observer.unobserve(iframe);
                        }
                    }
                });
            }, {
                rootMargin: '100px'
            });

            document.querySelectorAll('iframe[data-src]').forEach(iframe => {
                iframeObserver.observe(iframe);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
        }
    };

    // ============================================
    // 2. CONTENT VISIBILITY OPTIMIZATION
    // ============================================
    
    const optimizeContentVisibility = () => {
        if ('IntersectionObserver' in window) {
            const sections = document.querySelectorAll('section, .premium-card, .stat-card');
            
            const visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.contentVisibility = 'auto';
                    } else {
                        // Only hide if far from viewport
                        if (entry.boundingClientRect.top > window.innerHeight * 2) {
                            entry.target.style.contentVisibility = 'hidden';
                        }
                    }
                });
            }, {
                rootMargin: '200px'
            });

            sections.forEach(section => {
                visibilityObserver.observe(section);
            });
        }
    };

    // ============================================
    // 3. CRITICAL CSS INLINING HELPER
    // ============================================
    
    const loadCriticalCSS = () => {
        // This would typically be handled by build tools
        // But we can ensure critical styles are loaded first
        const criticalStyles = document.querySelectorAll('style[data-critical]');
        criticalStyles.forEach(style => {
            style.setAttribute('media', 'all');
        });
    };

    // ============================================
    // 4. ACCESSIBILITY ENHANCEMENTS
    // ============================================
    
    const enhanceAccessibility = () => {
        // Skip Link Functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        // ARIA Live Regions for Dynamic Content
        if (!document.getElementById('aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;';
            document.body.appendChild(liveRegion);
        }

        // Focus Management for Modals
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
            const focusableElements = modal.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
                if (e.key === 'Escape') {
                    modal.close();
                }
            });
        });

        // Keyboard Navigation for Custom Components
        const customButtons = document.querySelectorAll('[role="button"]:not(button)');
        customButtons.forEach(button => {
            button.setAttribute('tabindex', '0');
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        // Table Progressive Disclosure
        const collapsibleRows = document.querySelectorAll('.table-row-collapsible');
        collapsibleRows.forEach(row => {
            row.setAttribute('role', 'button');
            row.setAttribute('tabindex', '0');
            row.setAttribute('aria-expanded', 'false');
            
            row.addEventListener('click', () => toggleRow(row));
            row.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleRow(row);
                }
            });
        });

        function toggleRow(row) {
            const isExpanded = row.getAttribute('aria-expanded') === 'true';
            row.setAttribute('aria-expanded', !isExpanded);
            
            const details = row.nextElementSibling;
            if (details && details.classList.contains('table-row-details')) {
                details.style.display = isExpanded ? 'none' : 'table-row';
            }
        }
    };

    // ============================================
    // 5. PERFORMANCE MONITORING
    // ============================================
    
    const monitorPerformance = () => {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP monitoring not supported');
            }

            // Monitor Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    console.log('CLS:', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS monitoring not supported');
            }

            // Monitor First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID monitoring not supported');
            }
        }
    };

    // ============================================
    // 6. PREVENT HORIZONTAL SCROLL
    // ============================================
    
    const preventHorizontalScroll = () => {
        // Check for elements causing overflow
        const checkOverflow = () => {
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                if (el.scrollWidth > el.clientWidth && el.scrollWidth > window.innerWidth) {
                    console.warn('Potential horizontal scroll:', el);
                    el.style.maxWidth = '100%';
                    el.style.overflowX = 'hidden';
                }
            });
        };

        // Run on load and resize
        window.addEventListener('load', checkOverflow);
        window.addEventListener('resize', checkOverflow);

        // Prevent programmatic scroll beyond viewport
        window.addEventListener('scroll', () => {
            if (window.scrollX !== 0) {
                window.scrollTo(0, window.scrollY);
            }
        });
    };

    // ============================================
    // 7. RESOURCE HINTS OPTIMIZATION
    // ============================================
    
    const optimizeResourceHints = () => {
        // Preconnect to external domains
        const externalDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    };

    // ============================================
    // 8. SAFE AREA INSETS FOR NOTCH DEVICES
    // ============================================
    
    const applySafeAreaInsets = () => {
        const root = document.documentElement;
        
        // Set CSS custom properties for safe areas
        const setSafeArea = () => {
            root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top, 0px)');
            root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right, 0px)');
            root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom, 0px)');
            root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left, 0px)');
        };

        setSafeArea();
        window.addEventListener('resize', setSafeArea);
        window.addEventListener('orientationchange', setSafeArea);
    };

    // ============================================
    // 9. REDUCED MOTION SUPPORT
    // ============================================
    
    const respectReducedMotion = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (matches) => {
            if (matches) {
                document.documentElement.classList.add('reduced-motion');
            } else {
                document.documentElement.classList.remove('reduced-motion');
            }
        };

        handleReducedMotion(prefersReducedMotion.matches);
        prefersReducedMotion.addEventListener('change', (e) => handleReducedMotion(e.matches));
    };

    // ============================================
    // 10. INITIALIZATION
    // ============================================
    
    const init = () => {
        // Run immediately for critical optimizations
        applySafeAreaInsets();
        respectReducedMotion();
        preventHorizontalScroll();
        enhanceAccessibility();
        optimizeResourceHints();

        // Run after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                lazyLoadImages();
                optimizeContentVisibility();
                loadCriticalCSS();
                monitorPerformance();
            });
        } else {
            lazyLoadImages();
            optimizeContentVisibility();
            loadCriticalCSS();
            monitorPerformance();
        }

        // Run after page load for non-critical optimizations
        window.addEventListener('load', () => {
            // Additional optimizations can go here
        });
    };

    // Initialize
    init();

    // Export for external use if needed
    window.OrdinaPerformance = {
        lazyLoadImages,
        enhanceAccessibility,
        monitorPerformance,
        preventHorizontalScroll
    };

})();

