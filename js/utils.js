// Utility Functions
import { EXCHANGE_RATE } from './config.js';
import { translations } from './translations.js';

export let currentCurrency = localStorage.getItem('currency') || 'AZN';
export let currentLang = localStorage.getItem('appLanguage') || 'ru';

export function getTodayISOString() {
    const today = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Baku' };
    return new Intl.DateTimeFormat('en-CA', options).format(today);
}

export function formatISODateForDisplay(isoString, options = {}) {
    if (!isoString || typeof isoString !== 'string' || !isoString.includes('-')) return '—';
    const [year, month, day] = isoString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const defaultOptions = { day: 'numeric', month: 'long' };
    if (options.year) defaultOptions.year = 'numeric';
    const locale = currentLang === 'ru' ? 'ru-RU' : (currentLang === 'az' ? 'az-Latn-AZ' : 'en-US');
    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
}

export function formatMonthId(monthId) {
    if (!monthId) return '';
    const [year, month] = monthId.split('-');
    const monthIndex = parseInt(month) - 1;
    const monthName = translations[currentLang].months[monthIndex];
    return `${monthName} ${year}`;
}

export function formatCurrency(amount) {
    if (typeof amount !== 'number') amount = 0;
    const value = currentCurrency === 'USD' ? amount / EXCHANGE_RATE : amount;
    const symbol = currentCurrency === 'USD' ? '$' : 'AZN';
    return `${value.toFixed(2)} ${symbol}`;
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function showConfirmModal(text) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        document.getElementById('confirm-modal-text').textContent = text;
        const yesBtn = document.getElementById('confirm-modal-yes');
        const noBtn = document.getElementById('confirm-modal-no');

        const close = () => modal.close();
        const onYes = () => { resolve(true); close(); cleanup(); };
        const onNo = () => { resolve(false); close(); cleanup(); };

        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        };

        yesBtn.addEventListener('click', onYes, { once: true });
        noBtn.addEventListener('click', onNo, { once: true });
        modal.addEventListener('close', () => { resolve(false); cleanup(); }, { once: true });
        modal.showModal();
    });
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function setCurrentCurrency(currency) {
    currentCurrency = currency;
}

export function setCurrentLang(lang) {
    currentLang = lang;
}
