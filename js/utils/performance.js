/**
 * Performance Optimization Utilities
 * Утилиты для оптимизации производительности приложения
 */

/**
 * Request Animation Frame throttle
 * Ограничивает выполнение функции до одного раза за кадр
 * @param {Function} callback - Функция для выполнения
 * @returns {Function} Throttled функция
 */
export function rafThrottle(callback) {
  let rafId = null;
  let lastArgs = null;

  return function throttled(...args) {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        callback.apply(this, lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * Debounce function
 * Откладывает выполнение функции до окончания задержки
 * @param {Function} func - Функция для выполнения
 * @param {number} wait - Задержка в миллисекундах
 * @param {boolean} immediate - Выполнить сразу при первом вызове
 * @returns {Function} Debounced функция
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function
 * Ограничивает частоту выполнения функции
 * @param {Function} func - Функция для выполнения
 * @param {number} limit - Минимальный интервал между вызовами в миллисекундах
 * @returns {Function} Throttled функция
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  let lastResult;

  return function throttled(...args) {
    const context = this;

    if (!inThrottle) {
      lastResult = func.apply(context, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * Batch DOM updates
 * Группирует несколько DOM операций в один reflow
 * @param {Function} callback - Функция с DOM операциями
 */
export function batchDOMUpdates(callback) {
  requestAnimationFrame(() => {
    callback();
  });
}

/**
 * Optimize scroll handler
 * Оптимизированный обработчик скролла с RAF
 * @param {Function} callback - Функция обработчик
 * @returns {Function} Оптимизированный обработчик
 */
export function optimizeScrollHandler(callback) {
  return rafThrottle(callback);
}

/**
 * Optimize resize handler
 * Оптимизированный обработчик изменения размера окна
 * @param {Function} callback - Функция обработчик
 * @param {number} delay - Задержка debounce
 * @returns {Function} Оптимизированный обработчик
 */
export function optimizeResizeHandler(callback, delay = 150) {
  return debounce(callback, delay);
}

/**
 * Lazy load images
 * Ленивая загрузка изображений с Intersection Observer
 * @param {string} selector - CSS селектор для изображений
 * @param {Object} options - Опции Intersection Observer
 */
export function lazyLoadImages(selector = '[data-lazy-src]', options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.lazySrc;

        if (src) {
          img.src = src;
          img.removeAttribute('data-lazy-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  }, defaultOptions);

  const images = document.querySelectorAll(selector);
  images.forEach(img => imageObserver.observe(img));

  return imageObserver;
}

/**
 * Preload critical resources
 * Предзагрузка критичных ресурсов
 * @param {Array<string>} urls - Массив URL для предзагрузки
 * @param {string} type - Тип ресурса (script, style, image)
 */
export function preloadResources(urls, type = 'script') {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  });
}

/**
 * Measure performance
 * Измерение производительности функции
 * @param {Function} func - Функция для измерения
 * @param {string} label - Метка для логирования
 * @returns {Function} Обернутая функция
 */
export function measurePerformance(func, label) {
  return async function measured(...args) {
    const start = performance.now();
    const result = await func.apply(this, args);
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

/**
 * Create virtual scroll
 * Виртуальный скролл для больших списков
 * @param {HTMLElement} container - Контейнер списка
 * @param {Array} items - Массив элементов
 * @param {Function} renderItem - Функция рендеринга элемента
 * @param {Object} options - Опции
 */
export class VirtualScroll {
  constructor(container, items, renderItem, options = {}) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = options.itemHeight || 50;
    this.buffer = options.buffer || 5;
    this.visibleItems = [];
    
    this.init();
  }

  init() {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    // Create spacer
    this.spacer = document.createElement('div');
    this.spacer.style.height = `${this.items.length * this.itemHeight}px`;
    this.container.appendChild(this.spacer);
    
    // Create viewport
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.left = '0';
    this.viewport.style.right = '0';
    this.container.appendChild(this.viewport);
    
    // Setup scroll handler
    this.container.addEventListener('scroll', rafThrottle(() => {
      this.update();
    }));
    
    this.update();
  }

  update() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
    );
    
    this.visibleItems = this.items.slice(startIndex, endIndex);
    
    // Render visible items
    this.viewport.innerHTML = '';
    this.viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    this.visibleItems.forEach((item, index) => {
      const element = this.renderItem(item, startIndex + index);
      this.viewport.appendChild(element);
    });
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

/**
 * Memory cleanup utility
 * Утилита для очистки памяти
 */
export class MemoryManager {
  constructor() {
    this.cleanupTasks = [];
  }

  /**
   * Register cleanup task
   * @param {Function} task - Функция очистки
   */
  register(task) {
    this.cleanupTasks.push(task);
  }

  /**
   * Execute all cleanup tasks
   */
  cleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    // Clear localStorage caches older than 24 hours
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    Object.keys(localStorage).forEach(key => {
      if (key.includes('_cache')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && typeof data === 'object') {
            Object.entries(data).forEach(([cacheKey, value]) => {
              if (value.timestamp && now - value.timestamp > maxAge) {
                delete data[cacheKey];
              }
            });
            localStorage.setItem(key, JSON.stringify(data));
          }
        } catch (error) {
          console.error(`Failed to clean cache ${key}:`, error);
        }
      }
    });

    console.log('Old caches cleared');
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.log('Long task monitoring not supported');
    }
  }

  // Monitor memory usage (if available)
  if (performance.memory) {
    setInterval(() => {
      const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
      console.log(`Memory usage: ${used}MB / ${total}MB`);
    }, 60000); // Every minute
  }

  // Clean old caches periodically
  setInterval(() => {
    memoryManager.clearCaches();
  }, 3600000); // Every hour
}
