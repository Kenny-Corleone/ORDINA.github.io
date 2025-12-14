import { logger } from '../utils.js';
import { translations, currentLang } from '../i18n.js';

// Utility functions (will be passed from app.js)
let formatCurrency, formatISODateForDisplay, handleEmptyState, handleNonEmptyState;

export function initDebtsModule(utils) {
    formatCurrency = utils.formatCurrency;
    formatISODateForDisplay = utils.formatISODateForDisplay;
    handleEmptyState = utils.handleEmptyState;
    handleNonEmptyState = utils.handleNonEmptyState;
}

export function renderDebts(docs, userId) {
    if (!userId) return;
    const tableWrapper = document.getElementById('debts-table-wrapper');
    const tableBody = document.getElementById('debts-table');
    const emptyState = document.getElementById('debts-empty');

    if (!docs || docs.length === 0) {
        handleEmptyState(tableWrapper, emptyState, 'emptyDebts');
        return;
    }

    handleNonEmptyState(tableWrapper, emptyState);
    if (tableBody) {
        try {
            tableBody.innerHTML = docs.map((doc) => {
                const debt = doc.data();
                if (!debt) return '';
                const id = doc.id;
                const remaining = (debt.totalAmount || 0) - (debt.paidAmount || 0);
                const colorClass = remaining <= 0 ? 'text-green-600' : (debt.paidAmount > 0 ? 'text-yellow-600' : 'text-red-600');
                const lastPaymentDate = debt.lastPaymentDate ? formatISODateForDisplay(debt.lastPaymentDate.toDate().toISOString().split('T')[0]) : '—';

                return `
            <tr class="border-b hover:bg-gray-50 md:border-b-0 dark:hover:bg-gray-700 dark:border-gray-700">
                <td data-label="${translations[currentLang]?.debtName || 'Debt Name'}" class="font-medium">${debt.name || '—'}</td>
                <td data-label="${translations[currentLang]?.amount || 'Amount'}">${formatCurrency(debt.totalAmount)}</td>
                <td data-label="${translations[currentLang]?.paid || 'Paid'}">${formatCurrency(debt.paidAmount)}</td>
                <td data-label="${translations[currentLang]?.remaining || 'Remaining'}" class="font-bold ${colorClass}">${formatCurrency(remaining)}</td>
                <td data-label="${translations[currentLang]?.lastPaymentDate || 'Last Payment'}">${lastPaymentDate}</td>
                <td data-label="${translations[currentLang]?.comments || 'Comments'}">
                    <input type="text" class="editable-debt-comment bg-transparent w-full p-1 border-b border-transparent focus:border-blue-500 outline-none" data-id="${id}" value="${debt.comment || ''}" placeholder="${translations[currentLang]?.placeholderComment || 'Comment'}">
                </td>
                <td data-label="${translations[currentLang]?.actions || 'Actions'}" class="flex gap-2">
                    <button data-id="${id}" class="add-debt-payment-btn text-green-600 hover:text-green-800" title="${translations[currentLang]?.addDebtPayment || 'Add Payment'}">➕</button>
                    <button data-id="${id}" class="edit-debt-btn text-blue-600 hover:text-blue-800" title="${translations[currentLang]?.editDebt || 'Edit'}">✏️</button>
                    <button data-id="${id}" class="delete-debt-btn text-red-600 hover:text-red-800" title="${translations[currentLang]?.delete || 'Delete'}">🗑️</button>
                </td>
            </tr>`;
            }).join('');
        } catch (e) {
            logger.error('Error rendering debts:', e);
            handleEmptyState(tableWrapper, emptyState, 'errorLoadingData');
        }
    }
}

