import { logger } from '../utils.js';
import { translations, currentLang } from '../i18n.js';

// Utility functions (will be passed from app.js)
let formatCurrency, handleEmptyState, handleNonEmptyState, getTodayISOString;

export function initRecurringExpensesModule(utils) {
    formatCurrency = utils.formatCurrency;
    handleEmptyState = utils.handleEmptyState;
    handleNonEmptyState = utils.handleNonEmptyState;
    getTodayISOString = utils.getTodayISOString;
}

export function renderRecurringExpenses(allRecurringTemplates, currentMonthStatuses, selectedMonthId, currentMonthId, userId) {
    if (!userId || !selectedMonthId) return;
    const tableWrapper = document.getElementById('recurring-expenses-table-wrapper');
    const tableBody = document.getElementById('recurring-expenses-table');
    const emptyState = document.getElementById('recurring-expenses-empty');

    if (!allRecurringTemplates || allRecurringTemplates.length === 0) {
        handleEmptyState(tableWrapper, emptyState, 'emptyRecurring');
        return;
    }

    handleNonEmptyState(tableWrapper, emptyState);

    const todayDay = new Date(`${getTodayISOString()}T00:00:00`).getDate();

    if (tableBody) {
        try {
            tableBody.innerHTML = allRecurringTemplates.map((template) => {
                if (!template) return '';
                const status = currentMonthStatuses[template.id] || translations.ru.unpaidStatus;
                const isOverdue = status === translations.ru.unpaidStatus && template.dueDay < todayDay && selectedMonthId === currentMonthId;
                const isPaid = status === translations.ru.paidStatus;

                return `
            <tr class="border-b hover:bg-gray-50 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''} md:border-b-0 dark:hover:bg-gray-700 dark:border-gray-700">
                <td data-label="${translations[currentLang]?.name || 'Name'}" class="font-medium">${template.name || '—'}</td>
                <td data-label="${translations[currentLang]?.amount || 'Amount'}">${formatCurrency(template.amount)}</td>
                <td data-label="${translations[currentLang]?.paymentDay || 'Day'}">${template.dueDay || '—'}</td>
                <td data-label="${translations[currentLang]?.status || 'Status'}">
                    <select data-id="${template.id}" class="recurring-status-select p-1 rounded-md border-0 ring-1 ring-inset ring-gray-300 ${isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        <option value="${translations.ru.unpaidStatus}" ${!isPaid ? 'selected' : ''}>${translations[currentLang]?.unpaidStatus || 'Unpaid'}</option>
                        <option value="${translations.ru.paidStatus}" ${isPaid ? 'selected' : ''}>${translations[currentLang]?.paidStatus || 'Paid'}</option>
                    </select>
                </td>
                <td data-label="${translations[currentLang]?.details || 'Details'}">${template.details || '—'}</td>
                <td data-label="${translations[currentLang]?.templateActions || 'Actions'}" class="flex gap-2">
                    <button data-id="${template.id}" class="edit-recurring-expense-btn text-blue-600 hover:text-blue-800">✏️</button>
                    <button data-id="${template.id}" class="delete-recurring-expense-btn text-red-600 hover:text-red-800">🗑️</button>
                </td>
            </tr>`;
            }).join('');
        } catch (e) {
            logger.error('Error rendering recurring expenses:', e);
            handleEmptyState(tableWrapper, emptyState, 'errorLoadingData');
        }
    }
}

