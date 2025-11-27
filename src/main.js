import './styles/main.css';
import { app, db, auth } from './js/firebase.js';
import { logger, $, loadScriptSafely } from './js/utils.js';
import './js/app.js'; // We will put the main logic here

console.log('App initialized');

// Load external scripts safely with optimized loading strategy
async function loadExternalScripts() {
    try {
        // Font Awesome - defer loading, non-critical
        loadScriptSafely('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js', {
            crossOrigin: 'anonymous',
            referrerPolicy: 'no-referrer',
            defer: true,
            async: true,
            lazy: true
        }).catch(e => logger.warn('Font Awesome failed to load', e));

        // Chart.js - lazy load only when dashboard is visible
        const loadChartJs = () => {
            if (document.querySelector('[data-chart]') || document.getElementById('expense-chart') || document.getElementById('expenses-chart')) {
                loadScriptSafely('https://cdn.jsdelivr.net/npm/chart.js', {
                    lazy: false,
                    async: true,
                    timeout: 5000
                }).then(() => {
                    if (window.updateDashboard) {
                        setTimeout(() => window.updateDashboard(), 100);
                    }
                }).catch(e => logger.warn('Chart.js failed to load', e));
            }
        };

        // Load Chart.js when dashboard tab is activated or on idle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadChartJs, { timeout: 2000 });
        } else {
            setTimeout(loadChartJs, 1000);
        }

        // GSAP - lazy load only if needed
        if (document.querySelector('[data-gsap]') || document.querySelector('.gsap-animation')) {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    loadScriptSafely('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', {
                        lazy: true,
                        async: true,
                        timeout: 5000
                    }).catch(e => logger.warn('GSAP failed to load', e));
                });
            } else {
                setTimeout(() => {
                    loadScriptSafely('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', {
                        lazy: true,
                        async: true,
                        timeout: 5000
                    }).catch(e => logger.warn('GSAP failed to load', e));
                }, 2000);
            }
        }

        // Particles.js - lazy load on idle
        if (document.getElementById('background-animation')) {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    loadScriptSafely('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js', {
                        lazy: true,
                        async: true,
                        timeout: 5000
                    }).catch(e => logger.warn('Particles.js failed to load', e));
                });
            } else {
                setTimeout(() => {
                    loadScriptSafely('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js', {
                        lazy: true,
                        async: true,
                        timeout: 5000
                    }).catch(e => logger.warn('Particles.js failed to load', e));
                }, 2000);
            }
        }
    } catch (error) {
        logger.error('Error loading external scripts:', error);
    }
}

// Implement lazy loading for images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with loading="lazy" attribute
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Start loading scripts and setup lazy loading
loadExternalScripts();
setupLazyLoading();
