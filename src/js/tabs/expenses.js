import { logger } from '../utils.js';
import { translations, currentLang } from '../i18n.js';

// Utility functions (will be passed from app.js)
let formatCurrency, formatISODateForDisplay, handleEmptyState, handleNonEmptyState;

export function initExpensesModule(utils) {
    formatCurrency = utils.formatCurrency;
    formatISODateForDisplay = utils.formatISODateForDisplay;
    handleEmptyState = utils.handleEmptyState;
    handleNonEmptyState = utils.handleNonEmptyState;
}

export function renderExpenses(docs, userId, selectedMonthId) {
    if (!userId || !selectedMonthId) return;
    const tableWrapper = document.getElementById('expenses-table-wrapper');
    const tableBody = document.getElementById('expenses-table');
    const emptyState = document.getElementById('expenses-empty');

    if (!docs || docs.length === 0) {
        handleEmptyState(tableWrapper, emptyState, 'emptyExpenses');
        return;
    }

    handleNonEmptyState(tableWrapper, emptyState);

    const sortedDocs = [...docs].sort((a, b) => {
        const dateA = a.data()?.date || '';
        const dateB = b.data()?.date || '';
        return dateB.localeCompare ? dateB.localeCompare(dateA) : dateB > dateA ? -1 : 1;
    });

    if (tableBody) {
        try {
            tableBody.innerHTML = sortedDocs.map((doc) => {
                const expense = doc.data();
                if (!expense) return '';
                const id = doc.id;
                const actionsHtml = (!expense.recurringExpenseId && !expense.debtPaymentId) ?
                     `<button data-id="${id}" class="edit-expense-btn text-blue-600 hover:text-blue-800" title="${translations[currentLang]?.editExpense || 'Edit'}">✏️</button>
             <button data-id="${id}" class="delete-expense-btn text-red-600 hover:text-red-800" title="${translations[currentLang]?.delete || 'Delete'}">🗑️</button>` : '';

                return `
            <tr class="border-b hover:bg-gray-50 md:border-b-0 dark:hover:bg-gray-700 dark:border-gray-700">
                <td data-label="${translations[currentLang]?.name || 'Name'}" class="font-medium">${expense.name || '—'}</td>
                <td data-label="${translations[currentLang]?.category || 'Category'}">${expense.category || '—'}</td>
                <td data-label="${translations[currentLang]?.amount || 'Amount'}">${formatCurrency(expense.amount)}</td>
                <td data-label="${translations[currentLang]?.date || 'Date'}">${formatISODateForDisplay(expense.date)}</td>
                <td data-label="${translations[currentLang]?.actions || 'Actions'}" class="flex gap-2">${actionsHtml}</td>
            </tr>`;
            }).join('');
        } catch (e) {
            logger.error('Error rendering expenses:', e);
            handleEmptyState(tableWrapper, emptyState, 'errorLoadingData');
        }
    }
}

