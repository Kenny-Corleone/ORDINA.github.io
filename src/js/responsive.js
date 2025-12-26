// ============================================================================
// INTELLIGENT RESPONSIVE SYSTEM
// ============================================================================

import { logger, $, $$ } from './utils.js';

// Breakpoints
const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1025
};

// Device types
export const DeviceType = {
    MOBILE: 'mobile',
    TABLET: 'tablet',
    DESKTOP: 'desktop'
};

// Current device state
let currentDeviceType = null;
let isTouchDevice = false;

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Определяет тип устройства на основе ширины экрана
 */
export function getDeviceType() {
    // Используем visual viewport если доступен (для правильной работы при масштабировании)
    const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    
    if (width <= BREAKPOINTS.MOBILE) {
        return DeviceType.MOBILE;
    } else if (width <= BREAKPOINTS.TABLET) {
        return DeviceType.TABLET;
    } else {
        return DeviceType.DESKTOP;
    }
}

/**
 * Проверяет, является ли устройство touch-устройством
 */
export function detectTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
}

/**
 * Инициализация системы адаптации
 */
export function initResponsiveSystem() {
    isTouchDevice = detectTouchDevice();
    currentDeviceType = getDeviceType();
    
    // Добавляем классы на body для CSS
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'touch-device');
    document.body.classList.add(`device-${currentDeviceType}`);
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
    
    // Применяем адаптацию
    applyResponsiveLayout();
    
    // Обновляем переводы в мобильной боковой панели после создания
    setTimeout(() => {
        updateMobileSidebarTranslations();
    }, 100);
    
    // Слушаем изменения размера окна и визуального viewport (для масштабирования)
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newDeviceType = getDeviceType();
            if (newDeviceType !== currentDeviceType) {
                currentDeviceType = newDeviceType;
                document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
                document.body.classList.add(`device-${currentDeviceType}`);
                applyResponsiveLayout();
                logger.debug('Device type changed to:', currentDeviceType);
            }
        }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Также слушаем изменения visual viewport для корректной работы при масштабировании
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize);
    }
    
    logger.info('Responsive system initialized:', { deviceType: currentDeviceType, isTouch: isTouchDevice });
}

/**
 * Применяет адаптивный layout в зависимости от типа устройства
 */
function applyResponsiveLayout() {
    const headerNav = $('header-nav') || document.querySelector('.header-nav');
    const miniSidebar = $('#mini-sidebar') || document.querySelector('#mini-sidebar');
    const mobileSidebar = $('#mobile-sidebar');
    const app = $('#app');
    
    if (!app) return;
    
    switch (currentDeviceType) {
        case DeviceType.MOBILE:
            // Мобильная версия: скрываем горизонтальную навигацию, показываем боковую панель
            if (headerNav) headerNav.classList.add('hidden');
            if (miniSidebar) miniSidebar.classList.add('hidden');
            if (mobileSidebar) {
                mobileSidebar.classList.remove('hidden');
                app.classList.add('mobile-layout');
            } else {
                // Создаем мобильную боковую панель, если её нет
                createMobileSidebar();
            }
            break;
            
        case DeviceType.TABLET:
            // Планшет: гибридный режим
            if (headerNav) headerNav.classList.add('hidden');
            if (miniSidebar) miniSidebar.classList.remove('hidden');
            if (mobileSidebar) mobileSidebar.classList.add('hidden');
            app.classList.remove('mobile-layout');
            app.classList.add('tablet-layout');
            break;
            
        case DeviceType.DESKTOP:
            // Десктоп: горизонтальная навигация
            if (headerNav) headerNav.classList.remove('hidden');
            if (miniSidebar) miniSidebar.classList.add('hidden');
            if (mobileSidebar) mobileSidebar.classList.add('hidden');
            app.classList.remove('mobile-layout', 'tablet-layout');
            break;
    }
}

/**
 * Создает мобильную боковую панель
 */
function createMobileSidebar() {
    const app = $('#app');
    if (!app) return;
    
    // Проверяем, существует ли уже боковая панель
    let sidebar = $('#mobile-sidebar');
    if (sidebar) return;
    
    // Создаем структуру боковой панели
    sidebar = document.createElement('aside');
    sidebar.id = 'mobile-sidebar';
    sidebar.className = 'mobile-sidebar hidden';
    sidebar.setAttribute('aria-label', 'Navigation');
    
    // Кнопка закрытия
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-sidebar-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;
    closeBtn.addEventListener('click', () => toggleMobileSidebar(false));
    
    // Список вкладок
    const navList = document.createElement('nav');
    navList.className = 'mobile-sidebar-nav';
    
    // Получаем все вкладки из существующей навигации
    const tabs = [
        { tab: 'dashboard', icon: '📊', i18n: 'tabDashboard' },
        { tab: 'debts', icon: '💳', i18n: 'tabDebts' },
        { tab: 'recurring-expenses', icon: '🔄', i18n: 'tabRecurringExpenses' },
        { tab: 'expenses', icon: '💰', i18n: 'tabMonthlyExpenses' },
        { tab: 'tasks', icon: '✅', i18n: 'tabTasks' },
        { tab: 'calendar', icon: '📅', i18n: 'tabCalendar' },
        { tab: 'payments', icon: '💸', i18n: 'tabPayments' }
    ];
    
    tabs.forEach(({ tab, icon, i18n }) => {
        const button = document.createElement('button');
        button.className = 'mobile-sidebar-item';
        button.dataset.tab = tab;
        button.setAttribute('data-i18n', i18n);
        button.innerHTML = `
            <span class="mobile-sidebar-icon">${icon}</span>
            <span class="mobile-sidebar-label"></span>
        `;
        button.addEventListener('click', () => {
            // Переключаем вкладку
            const tabButton = document.querySelector(`.tab-button[data-tab="${tab}"]`);
            if (tabButton) {
                tabButton.click();
            }
            // Закрываем боковую панель
            toggleMobileSidebar(false);
        });
        navList.appendChild(button);
    });
    
    sidebar.appendChild(closeBtn);
    sidebar.appendChild(navList);
    
    // Вставляем в начало app (перед fixed-header если есть)
    const fixedHeader = app.querySelector('#fixed-header');
    if (fixedHeader) {
        app.insertBefore(sidebar, fixedHeader);
    } else {
        app.insertBefore(sidebar, app.firstChild);
    }
    
    // Overlay для закрытия при клике вне панели
    let overlay = $('#mobile-sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobile-sidebar-overlay';
        overlay.className = 'mobile-sidebar-overlay hidden';
        overlay.addEventListener('click', () => toggleMobileSidebar(false));
        document.body.appendChild(overlay);
    }
    
    // Применяем переводы
    updateMobileSidebarTranslations();
}

/**
 * Обновляет переводы в мобильной боковой панели
 */
export function updateMobileSidebarTranslations() {
    const sidebar = $('#mobile-sidebar');
    if (!sidebar) return;
    
    const labels = sidebar.querySelectorAll('.mobile-sidebar-label');
    labels.forEach(label => {
        const item = label.closest('.mobile-sidebar-item');
        if (item) {
            const i18nKey = item.getAttribute('data-i18n');
            if (i18nKey && translations[currentLang] && translations[currentLang][i18nKey]) {
                label.textContent = translations[currentLang][i18nKey];
            }
        }
    });
}

/**
 * Переключает видимость мобильной боковой панели
 */
export function toggleMobileSidebar(show = null) {
    const sidebar = $('#mobile-sidebar');
    const overlay = $('#mobile-sidebar-overlay');
    
    if (!sidebar) return;
    
    const isVisible = !sidebar.classList.contains('hidden');
    const shouldShow = show !== null ? show : !isVisible;
    
    if (shouldShow) {
        sidebar.classList.remove('hidden');
        if (overlay) overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Получает текущий тип устройства
 */
export function getCurrentDeviceType() {
    return currentDeviceType;
}

/**
 * Проверяет, является ли текущее устройство мобильным
 */
export function isMobile() {
    return currentDeviceType === DeviceType.MOBILE;
}

/**
 * Проверяет, является ли текущее устройство планшетом
 */
export function isTablet() {
    return currentDeviceType === DeviceType.TABLET;
}

/**
 * Проверяет, является ли текущее устройство десктопом
 */
export function isDesktop() {
    return currentDeviceType === DeviceType.DESKTOP;
}

/**
 * Проверяет, является ли устройство touch-устройством
 */
export function isTouch() {
    return isTouchDevice;
}

