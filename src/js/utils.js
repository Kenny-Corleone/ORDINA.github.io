// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export const logger = {
    debug: (...args) => {
        if (isDev) console.debug(...args);
    },
    info: (...args) => {
        if (isDev) console.info(...args);
    },
    warn: (...args) => {
        if (isDev) console.warn(...args);
    },
    error: (...args) => {
        console.error(...args);
    }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Централизованная обработка ошибок
 * @param {Error|string} error - Ошибка для обработки
 * @param {Object} context - Контекст ошибки
 * @param {string} context.module - Модуль, где произошла ошибка
 * @param {string} context.action - Действие, которое выполнялось
 * @param {boolean} context.showToUser - Показывать ли ошибку пользователю
 * @param {string} context.userMessage - Кастомное сообщение для пользователя
 */
export const handleError = (error, context = {}) => {
    const {
        module = 'unknown',
        action = 'unknown',
        showToUser = true,
        userMessage = null
    } = context;
    
    // Логируем ошибку в структурированном формате
    const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        module,
        action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    logger.error('Error occurred:', errorInfo);
    
    // Определяем тип ошибки и сообщение для пользователя
    let userFriendlyMessage = userMessage;
    
    if (!userFriendlyMessage) {
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            
            // Обработка специфичных ошибок Firebase
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                userFriendlyMessage = 'Network error. Please check your internet connection.';
            } else if (errorMessage.includes('permission') || errorMessage.includes('permission-denied')) {
                userFriendlyMessage = 'Permission denied. Please check your access rights.';
            } else if (errorMessage.includes('quota') || errorMessage.includes('resource-exhausted')) {
                userFriendlyMessage = 'Storage quota exceeded. Please free up some space.';
            } else if (errorMessage.includes('unavailable') || errorMessage.includes('unavailable')) {
                userFriendlyMessage = 'Service temporarily unavailable. Please try again later.';
            } else if (errorMessage.includes('invalid-argument')) {
                userFriendlyMessage = 'Invalid data provided. Please check your input.';
            } else if (errorMessage.includes('not-found')) {
                userFriendlyMessage = 'Resource not found.';
            } else if (errorMessage.includes('already-exists')) {
                userFriendlyMessage = 'This item already exists.';
            } else {
                userFriendlyMessage = error.message || 'An unexpected error occurred.';
            }
        } else {
            userFriendlyMessage = String(error) || 'An unexpected error occurred.';
        }
    }
    
    // Показываем пользователю, если нужно
    if (showToUser && userFriendlyMessage) {
        showToast(userFriendlyMessage, 'error');
    }
    
    // В production можно отправлять ошибки на сервер для мониторинга
    if (!isDev && typeof window !== 'undefined' && window.gtag) {
        try {
            window.gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: false
            });
        } catch (e) {
            // Игнорируем ошибки отправки аналитики
        }
    }
    
    return errorInfo;
};

/**
 * Оборачивает асинхронную функцию с обработкой ошибок
 * @param {Function} fn - Асинхронная функция
 * @param {Object} context - Контекст для обработки ошибок
 * @returns {Function} - Обернутая функция
 */
export const withErrorHandling = (fn, context = {}) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            handleError(error, context);
            throw error; // Пробрасываем ошибку дальше, если нужно
        }
    };
};

// ============================================================================
// SCRIPT LOADING
// ============================================================================

const loadedScripts = new Set();

export const loadScriptSafely = (src, { defer = true, timeout = 8000 } = {}) => {
    if (!src || loadedScripts.has(src)) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            const script = document.createElement('script');
            script.src = src;
            if (defer) script.defer = true;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = (e) => {
                logger.warn('Failed to load script', src, e);
                reject(e);
            };

            const timer = setTimeout(() => {
                logger.warn('Script load timeout', src);
                reject(new Error('Script load timeout'));
            }, timeout);

            script.addEventListener('load', () => clearTimeout(timer));
            script.addEventListener('error', () => clearTimeout(timer));

            document.head.appendChild(script);
        } catch (e) {
            logger.error('loadScriptSafely error', e);
            reject(e);
        }
    });
};

// ============================================================================
// UI NOTIFICATIONS
// ============================================================================

export const showToast = (message, type = 'success') => {
    try {
        const containerId = 'ordina-toast-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'fixed inset-x-0 top-4 z-[9999] flex flex-col items-center space-y-2 pointer-events-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const baseClasses = 'pointer-events-auto px-4 py-2 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-opacity duration-300';
        const typeClasses = type === 'error'
            ? 'bg-red-600 text-white'
            : type === 'warning'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white';

        toast.className = `${baseClasses} ${typeClasses}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    } catch (e) {
        logger.error('showToast error', e);
    }
};

// ============================================================================
// DATA UTILITIES
// ============================================================================

export const safeGet = (obj, path, defaultValue = null) => {
    try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result == null || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }
        return result != null ? result : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Экранирует HTML для предотвращения XSS атак
 * Правильно обрабатывает Unicode символы и эмодзи
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 */
export const escapeHtml = (text) => {
    if (text == null) return '';
    const div = document.createElement('div');
    // textContent правильно обрабатывает все Unicode символы, включая эмодзи
    div.textContent = String(text);
    return div.innerHTML;
};

/**
 * Экранирует атрибут HTML
 * Правильно обрабатывает Unicode символы и эмодзи
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 */
export const escapeHtmlAttr = (text) => {
    if (text == null) return '';
    const str = String(text);
    // Экранируем только опасные символы, сохраняя Unicode и эмодзи
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

/**
 * Обрезает строку до максимальной длины с учетом Unicode символов
 * @param {string} text - Текст для обрезки
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанный текст
 */
export const truncateUnicode = (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return '';
    // Используем Array.from для правильного подсчета Unicode символов (включая эмодзи)
    const chars = Array.from(text);
    if (chars.length <= maxLength) return text;
    return chars.slice(0, maxLength).join('') + '...';
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Валидирует строку (имя, комментарий и т.д.)
 * @param {string} value - Значение для валидации
 * @param {Object} options - Опции валидации
 * @param {number} options.minLength - Минимальная длина
 * @param {number} options.maxLength - Максимальная длина (по умолчанию 1000)
 * @param {boolean} options.required - Обязательное поле
 * @returns {{valid: boolean, error?: string}} - Результат валидации
 */
export const validateString = (value, { minLength = 1, maxLength = 1000, required = true } = {}) => {
    if (value == null) value = '';
    const trimmed = String(value).trim();
    
    if (required && trimmed.length === 0) {
        return { valid: false, error: 'Field is required' };
    }
    
    if (trimmed.length > 0 && trimmed.length < minLength) {
        return { valid: false, error: `Minimum length is ${minLength} characters` };
    }
    
    if (trimmed.length > maxLength) {
        return { valid: false, error: `Maximum length is ${maxLength} characters` };
    }
    
    return { valid: true };
};

/**
 * Валидирует число (сумму, количество и т.д.)
 * @param {number|string} value - Значение для валидации
 * @param {Object} options - Опции валидации
 * @param {number} options.min - Минимальное значение
 * @param {number} options.max - Максимальное значение
 * @param {boolean} options.required - Обязательное поле
 * @param {boolean} options.allowZero - Разрешить ноль
 * @returns {{valid: boolean, error?: string, value?: number}} - Результат валидации
 */
export const validateNumber = (value, { min = 0, max = Number.MAX_SAFE_INTEGER, required = true, allowZero = true } = {}) => {
    if (value == null || value === '') {
        if (required) {
            return { valid: false, error: 'Field is required' };
        }
        return { valid: true, value: 0 };
    }
    
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    if (isNaN(num) || !isFinite(num)) {
        return { valid: false, error: 'Invalid number' };
    }
    
    if (!allowZero && num === 0) {
        return { valid: false, error: 'Value must be greater than zero' };
    }
    
    if (num < min) {
        return { valid: false, error: `Value must be at least ${min}` };
    }
    
    if (num > max) {
        return { valid: false, error: `Value must not exceed ${max}` };
    }
    
    return { valid: true, value: num };
};

/**
 * Проверяет, является ли год високосным
 * @param {number} year - Год для проверки
 * @returns {boolean} - true, если год високосный
 */
const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Получает количество дней в месяце с учетом високосных годов
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @returns {number} - Количество дней в месяце
 */
const getDaysInMonth = (year, month) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isLeapYear(year)) {
        return 29;
    }
    return daysInMonth[month - 1];
};

/**
 * Валидирует дату в формате ISO (YYYY-MM-DD)
 * @param {string} value - Дата для валидации
 * @param {Object} options - Опции валидации
 * @param {boolean} options.required - Обязательное поле
 * @param {Date} options.minDate - Минимальная дата
 * @param {Date} options.maxDate - Максимальная дата
 * @returns {{valid: boolean, error?: string, date?: Date}} - Результат валидации
 */
export const validateDate = (value, { required = true, minDate = null, maxDate = null } = {}) => {
    if (!value || value.trim() === '') {
        if (required) {
            return { valid: false, error: 'Date is required' };
        }
        return { valid: true };
    }
    
    // Проверка формата ISO (YYYY-MM-DD)
    const isoRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
    const match = value.match(isoRegex);
    
    if (!match) {
        return { valid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
    }
    
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    
    // Проверка границ года (1900-2100)
    if (year < 1900 || year > 2100) {
        return { valid: false, error: 'Year must be between 1900 and 2100' };
    }
    
    // Проверка границ месяца
    if (month < 1 || month > 12) {
        return { valid: false, error: 'Month must be between 1 and 12' };
    }
    
    // Проверка границ дня с учетом високосных годов
    const maxDays = getDaysInMonth(year, month);
    if (day < 1 || day > maxDays) {
        if (month === 2 && day === 29) {
            return { valid: false, error: `${year} is not a leap year. February has only 28 days.` };
        }
        return { valid: false, error: `Invalid day. ${month === 2 && isLeapYear(year) ? 'February' : 'This month'} has ${maxDays} days.` };
    }
    
    // Проверка валидности даты через Date объект (дополнительная проверка)
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return { valid: false, error: 'Invalid date' };
    }
    
    // Проверка границ (minDate и maxDate)
    if (minDate && date < minDate) {
        return { valid: false, error: `Date must be after ${minDate.toISOString().split('T')[0]}` };
    }
    
    if (maxDate && date > maxDate) {
        return { valid: false, error: `Date must be before ${maxDate.toISOString().split('T')[0]}` };
    }
    
    return { valid: true, date };
};

/**
 * Валидирует день месяца (1-31)
 * @param {number|string} value - День для валидации
 * @returns {{valid: boolean, error?: string, value?: number}} - Результат валидации
 */
export const validateDayOfMonth = (value) => {
    const numValidation = validateNumber(value, { min: 1, max: 31, required: true });
    if (!numValidation.valid) {
        return numValidation;
    }
    
    const day = numValidation.value;
    if (day < 1 || day > 31 || !Number.isInteger(day)) {
        return { valid: false, error: 'Day must be between 1 and 31' };
    }
    
    return { valid: true, value: day };
};

/**
 * Безопасно вычисляет простое математическое выражение
 * Поддерживает только числа, операторы +, -, *, / и точку для десятичных
 * @param {string} expression - Выражение для вычисления
 * @returns {{valid: boolean, result?: number, error?: string}} - Результат вычисления
 */
export const safeEvaluateExpression = (expression) => {
    if (!expression || typeof expression !== 'string') {
        return { valid: false, error: 'Empty expression' };
    }
    
    // Удаляем все пробелы
    let expr = expression.replace(/\s/g, '');
    
    // Проверяем, что выражение содержит только разрешенные символы
    if (!/^[0-9+\-*/.()]+$/.test(expr)) {
        return { valid: false, error: 'Invalid characters in expression' };
    }
    
    // Проверяем баланс скобок
    let openCount = 0;
    for (let i = 0; i < expr.length; i++) {
        if (expr[i] === '(') openCount++;
        if (expr[i] === ')') openCount--;
        if (openCount < 0) {
            return { valid: false, error: 'Unbalanced parentheses' };
        }
    }
    if (openCount !== 0) {
        return { valid: false, error: 'Unbalanced parentheses' };
    }
    
    try {
        // Простой парсер для арифметических выражений
        // Используем рекурсивный спуск для безопасного вычисления
        
        let pos = 0;
        
        const skipWhitespace = () => {
            while (pos < expr.length && expr[pos] === ' ') pos++;
        };
        
        const parseNumber = () => {
            skipWhitespace();
            let start = pos;
            if (pos < expr.length && expr[pos] === '-') pos++;
            if (pos >= expr.length || !/[0-9]/.test(expr[pos])) {
                return null;
            }
            while (pos < expr.length && /[0-9.]/.test(expr[pos])) pos++;
            const numStr = expr.substring(start, pos);
            const num = parseFloat(numStr);
            if (isNaN(num) || !isFinite(num)) {
                return null;
            }
            return num;
        };
        
        const parseFactor = () => {
            skipWhitespace();
            if (pos >= expr.length) return null;
            
            if (expr[pos] === '(') {
                pos++;
                const result = parseExpression();
                skipWhitespace();
                if (pos >= expr.length || expr[pos] !== ')') {
                    return null;
                }
                pos++;
                return result;
            }
            
            if (expr[pos] === '-') {
                pos++;
                const num = parseFactor();
                return num !== null ? -num : null;
            }
            
            return parseNumber();
        };
        
        const parseTerm = () => {
            let result = parseFactor();
            if (result === null) return null;
            
            skipWhitespace();
            while (pos < expr.length) {
                const op = expr[pos];
                if (op === '*' || op === '/') {
                    pos++;
                    const right = parseFactor();
                    if (right === null) return null;
                    if (op === '*') {
                        result *= right;
                    } else {
                        if (right === 0) {
                            return null; // Division by zero
                        }
                        result /= right;
                    }
                    skipWhitespace();
                } else {
                    break;
                }
            }
            return result;
        };
        
        const parseExpression = () => {
            let result = parseTerm();
            if (result === null) return null;
            
            skipWhitespace();
            while (pos < expr.length) {
                const op = expr[pos];
                if (op === '+' || op === '-') {
                    pos++;
                    const right = parseTerm();
                    if (right === null) return null;
                    if (op === '+') {
                        result += right;
                    } else {
                        result -= right;
                    }
                    skipWhitespace();
                } else {
                    break;
                }
            }
            return result;
        };
        
        const result = parseExpression();
        
        if (result === null || pos < expr.length) {
            return { valid: false, error: 'Invalid expression' };
        }
        
        if (!isFinite(result)) {
            return { valid: false, error: 'Result is not finite' };
        }
        
        return { valid: true, result };
    } catch (e) {
        return { valid: false, error: 'Evaluation error: ' + e.message };
    }
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Создает debounced версию функции
 * @param {Function} fn - Функция для debouncing
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Debounced функция
 */
export const debounce = (fn, delay = 300) => {
    let timeoutId = null;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

/**
 * Создает throttled версию функции
 * @param {Function} fn - Функция для throttling
 * @param {number} limit - Лимит времени в миллисекундах
 * @returns {Function} - Throttled функция
 */
export const throttle = (fn, limit = 300) => {
    let inThrottle = false;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================================================
// DOM HELPERS
// ============================================================================

export const $ = (id) => document.getElementById(id);
export const $$ = (sel) => document.querySelectorAll(sel);
const $cache = {};
export const getCached = (id) => $cache[id] || ($cache[id] = $(id));
