/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💳 DEBTS TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════
 * HTML шаблоны для модуля долгов
 */

import { formatCurrency, formatISODateForDisplay } from '../../utils/formatters.js';

/**
 * Шаблоны для модуля долгов
 */
export class DebtsTemplate {
    /**
     * Главный шаблон модуля
     * @param {Object} state - Состояние модуля
     * @param {Object} t - Переводы
     * @param {string} currency - Текущая валюта
     * @returns {string} HTML
     */
    static render(state, t, currency) {
        if (state.isLoading) {
            return this.loading(t);
        }

        if (state.error) {
            return this.error(state.error, t);
        }

        return `
            <div class="debts-module">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">${t.debts || 'Долги'}</h2>
                    <button id="add-debt-btn" class="premium-btn">
                        <i class="fas fa-plus mr-2"></i>
                        ${t.addDebt || 'Добавить долг'}
                    </button>
                </div>

                <div id="debts-list">
                    ${this.debtsList(state.debts, t, currency)}
                </div>
            </div>
        `;
    }

    /**
     * Список долгов
     * @param {Array} debts - Массив долгов
     * @param {Object} t - Переводы
     * @param {string} currency - Текущая валюта
     * @returns {string} HTML
     */
    static debtsList(debts, t, currency) {
        if (!debts || debts.length === 0) {
            return `
                <div class="text-center p-8 opacity-60">
                    <i class="fas fa-hand-holding-usd text-4xl mb-4"></i>
                    <p>${t.emptyDebts || 'Нет долгов'}</p>
                </div>
            `;
        }

        return debts.map(debt => this.debtCard(debt, t, currency)).join('');
    }

    /**
     * Карточка долга
     * @param {Object} debt - Данные долга
     * @param {Object} t - Переводы
     * @param {string} currency - Текущая валюта
     * @returns {string} HTML
     */
    static debtCard(debt, t, currency) {
        const remaining = debt.totalAmount - debt.paidAmount;
        const progress = (debt.paidAmount / debt.totalAmount) * 100;

        return `
            <div class="premium-card p-4 mb-3">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg">${debt.name}</h3>
                        <div class="text-sm opacity-70 mt-1">
                            ${t.lastPaymentDate || 'Последний платеж'}: ${formatISODateForDisplay(debt.lastPaymentDate)}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="icon-btn edit-debt-btn" data-id="${debt.id}" title="${t.edit || 'Редактировать'}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn text-red-500 delete-debt-btn" data-id="${debt.id}" title="${t.delete || 'Удалить'}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-3">
                    <div>
                        <div class="text-xs opacity-70">${t.totalAmount || 'Общая сумма'}</div>
                        <div class="font-bold">${formatCurrency(debt.totalAmount, currency)}</div>
                    </div>
                    <div>
                        <div class="text-xs opacity-70">${t.paid || 'Оплачено'}</div>
                        <div class="font-bold text-green-600">${formatCurrency(debt.paidAmount, currency)}</div>
                    </div>
                    <div>
                        <div class="text-xs opacity-70">${t.remaining || 'Остаток'}</div>
                        <div class="font-bold text-red-600">${formatCurrency(remaining, currency)}</div>
                    </div>
                </div>

                <!-- Progress bar -->
                <div class="mb-3">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                    </div>
                    <div class="text-xs text-center mt-1 opacity-70">${progress.toFixed(1)}% ${t.paid || 'оплачено'}</div>
                </div>
                
                ${debt.comment ? `
                    <div class="text-sm opacity-70 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        ${debt.comment}
                    </div>
                ` : ''}
                
                <button class="premium-btn w-full mt-3 add-payment-btn" data-id="${debt.id}">
                    <i class="fas fa-plus mr-2"></i>
                    ${t.addDebtPayment || 'Добавить платеж'}
                </button>
            </div>
        `;
    }

    /**
     * Форма добавления долга
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static addDebtForm(t) {
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <form id="debt-form" class="space-y-4">
                <div>
                    <label for="debt-name" class="block mb-2 text-sm font-medium">
                        ${t.debtName || 'Название долга'} *
                    </label>
                    <input 
                        type="text" 
                        id="debt-name" 
                        name="name"
                        class="w-full p-2 border rounded"
                        required
                        placeholder="${t.enterDebtName || 'Введите название долга'}"
                    />
                </div>

                <div>
                    <label for="debt-total-amount" class="block mb-2 text-sm font-medium">
                        ${t.totalAmount || 'Общая сумма'} *
                    </label>
                    <input 
                        type="number" 
                        id="debt-total-amount" 
                        name="totalAmount"
                        class="w-full p-2 border rounded"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label for="debt-paid-amount" class="block mb-2 text-sm font-medium">
                        ${t.paidAmount || 'Уже оплачено'}
                    </label>
                    <input 
                        type="number" 
                        id="debt-paid-amount" 
                        name="paidAmount"
                        class="w-full p-2 border rounded"
                        min="0"
                        step="0.01"
                        value="0"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label for="debt-last-payment-date" class="block mb-2 text-sm font-medium">
                        ${t.lastPaymentDate || 'Дата последнего платежа'}
                    </label>
                    <input 
                        type="date" 
                        id="debt-last-payment-date" 
                        name="lastPaymentDate"
                        class="w-full p-2 border rounded"
                        value="${today}"
                    />
                </div>

                <div>
                    <label for="debt-comment" class="block mb-2 text-sm font-medium">
                        ${t.comment || 'Комментарий'}
                    </label>
                    <textarea 
                        id="debt-comment" 
                        name="comment"
                        class="w-full p-2 border rounded"
                        rows="3"
                        placeholder="${t.optionalComment || 'Необязательно'}"
                    ></textarea>
                </div>
            </form>
        `;
    }

    /**
     * Форма редактирования долга
     * @param {Object} debt - Данные долга
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static editDebtForm(debt, t) {
        return `
            <form id="debt-form" class="space-y-4">
                <div>
                    <label for="debt-name" class="block mb-2 text-sm font-medium">
                        ${t.debtName || 'Название долга'} *
                    </label>
                    <input 
                        type="text" 
                        id="debt-name" 
                        name="name"
                        class="w-full p-2 border rounded"
                        required
                        value="${debt.name}"
                    />
                </div>

                <div>
                    <label for="debt-total-amount" class="block mb-2 text-sm font-medium">
                        ${t.totalAmount || 'Общая сумма'} *
                    </label>
                    <input 
                        type="number" 
                        id="debt-total-amount" 
                        name="totalAmount"
                        class="w-full p-2 border rounded"
                        required
                        min="0"
                        step="0.01"
                        value="${debt.totalAmount}"
                    />
                </div>

                <div>
                    <label for="debt-paid-amount" class="block mb-2 text-sm font-medium">
                        ${t.paidAmount || 'Уже оплачено'}
                    </label>
                    <input 
                        type="number" 
                        id="debt-paid-amount" 
                        name="paidAmount"
                        class="w-full p-2 border rounded"
                        min="0"
                        step="0.01"
                        value="${debt.paidAmount}"
                    />
                </div>

                <div>
                    <label for="debt-last-payment-date" class="block mb-2 text-sm font-medium">
                        ${t.lastPaymentDate || 'Дата последнего платежа'}
                    </label>
                    <input 
                        type="date" 
                        id="debt-last-payment-date" 
                        name="lastPaymentDate"
                        class="w-full p-2 border rounded"
                        value="${debt.lastPaymentDate}"
                    />
                </div>

                <div>
                    <label for="debt-comment" class="block mb-2 text-sm font-medium">
                        ${t.comment || 'Комментарий'}
                    </label>
                    <textarea 
                        id="debt-comment" 
                        name="comment"
                        class="w-full p-2 border rounded"
                        rows="3"
                    >${debt.comment || ''}</textarea>
                </div>
            </form>
        `;
    }

    /**
     * Форма добавления платежа
     * @param {Object} t - Переводы
     * @param {number} remaining - Остаток долга
     * @returns {string} HTML
     */
    static addPaymentForm(t, remaining) {
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <form id="payment-form" class="space-y-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900 rounded">
                    <div class="text-sm">
                        ${t.remainingDebt || 'Остаток долга'}: <strong>${remaining.toFixed(2)}</strong>
                    </div>
                </div>

                <div>
                    <label for="payment-amount" class="block mb-2 text-sm font-medium">
                        ${t.paymentAmount || 'Сумма платежа'} *
                    </label>
                    <input 
                        type="number" 
                        id="payment-amount" 
                        name="amount"
                        class="w-full p-2 border rounded"
                        required
                        min="0.01"
                        max="${remaining}"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label for="payment-date" class="block mb-2 text-sm font-medium">
                        ${t.paymentDate || 'Дата платежа'} *
                    </label>
                    <input 
                        type="date" 
                        id="payment-date" 
                        name="date"
                        class="w-full p-2 border rounded"
                        required
                        value="${today}"
                    />
                </div>
            </form>
        `;
    }

    /**
     * Состояние загрузки
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static loading(t) {
        return `
            <div class="text-center p-8">
                <div class="spinner mb-4"></div>
                <p>${t.loading || 'Загрузка...'}</p>
            </div>
        `;
    }

    /**
     * Состояние ошибки
     * @param {string} error - Сообщение об ошибке
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static error(error, t) {
        return `
            <div class="text-center p-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>${t.error || 'Ошибка'}: ${error}</p>
            </div>
        `;
    }
}
