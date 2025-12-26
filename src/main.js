import './styles/main.css';
if (!Promise.allSettled) {
    Promise.allSettled = function (promises) {
        return Promise.all(promises.map(p => Promise.resolve(p)
            .then(value => ({ status: 'fulfilled', value }))
            .catch(reason => ({ status: 'rejected', reason }))));
    };
}
import { app, db, auth } from './js/firebase.js';
import { logger, $, loadScriptSafely } from './js/utils.js';
import { initApp } from './js/app.js?v=2.2.1'; // Import initApp function



// Open Browser Modal
window.openBrowserModal = (url) => {
    const modal = document.getElementById('browser-modal');
    const iframe = document.getElementById('browser-modal-frame');
    const loader = document.getElementById('browser-modal-loader');
    const urlSpan = document.getElementById('browser-modal-url');
    const externalLink = document.getElementById('browser-modal-external');

    if (!modal || !iframe) return;

    // Reset state
    if (loader) loader.classList.remove('opacity-0', 'pointer-events-none');
    iframe.src = 'about:blank'; // Clear previous content

    // Set URL
    if (urlSpan) urlSpan.textContent = url.replace(/^https?:\/\//, '');
    if (externalLink) {
        externalLink.href = url;
        // Make sure external link works if iframe fails
        externalLink.onclick = (e) => {
            e.stopPropagation();
            return true;
        };
    }

    // Load URL
    setTimeout(() => {
        iframe.src = url;
    }, 50);

    iframe.onload = () => {
        if (loader) loader.classList.add('opacity-0', 'pointer-events-none');
    };

    iframe.onerror = () => {
        if (loader) loader.classList.add('opacity-0', 'pointer-events-none');
        // Show error/fallback in iframe if possible, or toast
        showToast('Не удалось загрузить страницу. Попробуйте открыть в новом окне.', 'warning');
    };

    modal.showModal();
};

// Initialize the application
initApp().catch(error => {
    logger.error('Failed to initialize app:', error);
    // Show error to user
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div class="text-center">
                <p class="text-red-600 mb-4">Ошибка загрузки приложения</p>
                <p class="text-sm text-gray-600">${error.message}</p>
            </div>
        `;
    }
});

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

// Implement lazy loading for images with Intersection Observer
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load image from data-src if available
                    if (img.dataset.src && !img.src) {
                        img.src = img.dataset.src;
                    }
                    
                    // Load srcset if available
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    // Add blur-up effect
                    img.classList.add('loaded');
                    img.classList.remove('lazy');
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px', // Start loading 100px before image enters viewport
            threshold: 0.01
        });

        // Observe all images with loading="lazy" or news-image-lazy class
        document.querySelectorAll('img[loading="lazy"], img.news-image-lazy').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Re-observe when new content is added (for news)
        const newsObserver = new MutationObserver(() => {
            document.querySelectorAll('img.news-image-lazy:not(.loaded)').forEach(img => {
                imageObserver.observe(img);
            });
        });
        
        const newsContainer = document.getElementById('news-results');
        if (newsContainer) {
            newsObserver.observe(newsContainer, { childList: true, subtree: true });
        }
    }
}

// Start loading scripts and setup lazy loading
loadExternalScripts();
setupLazyLoading();

// PWA install prompt and Service Worker registration
let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
    if (import.meta.env.PROD) {
        navigator.serviceWorker.register('/sw.js').catch(err => logger.error('SW register error', err));
    } else {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => { });
        if ('caches' in window) {
            caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => { });
        }
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('pwa-install-btn-footer');
    if (btn) btn.classList.remove('hidden');
});

window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('pwa-install-btn-footer');
    if (btn) btn.classList.add('hidden');
    deferredInstallPrompt = null;
});

document.addEventListener('click', (ev) => {
    const target = ev.target.closest('#pwa-install-btn-footer');
    if (!target) return;
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.finally(() => {
            const btn = document.getElementById('pwa-install-btn-footer');
            if (btn) btn.classList.add('hidden');
            deferredInstallPrompt = null;
        });
    }
});
