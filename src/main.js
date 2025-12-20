import './styles/main.css';
import './styles/responsive.css';
import './styles/device-mobile.css';
import './styles/device-tablet.css';
import './styles/device-desktop.css';
import './styles/dashboard-fixes.css';
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

// Implement lazy loading for images
let imageObserver = null;

function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        // Очищаем предыдущий observer, если он существует
        if (imageObserver) {
            imageObserver.disconnect();
            imageObserver = null;
        }
        
        imageObserver = new IntersectionObserver((entries, observer) => {
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

// Функция очистки image observer
function cleanupLazyLoading() {
    if (imageObserver) {
        imageObserver.disconnect();
        imageObserver = null;
    }
}

// Очистка при выгрузке страницы
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        cleanupLazyLoading();
    });
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
    const target = ev.target.closest('#pwa-install-btn-footer') || ev.target.closest('.pwa-install-btn-footer');
    if (!target) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choiceResult) => {
            logger.info('User response to install prompt:', choiceResult.outcome);
            const btn = document.getElementById('pwa-install-btn-footer');
            if (btn) btn.classList.add('hidden');
            deferredInstallPrompt = null;
        }).catch((err) => {
            logger.error('Error handling install prompt:', err);
            deferredInstallPrompt = null;
        });
    } else {
        logger.warn('PWA install prompt not available');
    }
});
