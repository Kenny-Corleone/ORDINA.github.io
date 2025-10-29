/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💰 EXPENSES TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════
 * HTML шаблоны для модуля расходов
 */

import { formatCurrency, formatISODateForDisplay } from '../../utils/formatters.js';

/**
 * Шаблоны для модуля расходов
 */
export class ExpensesTemplate {
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
            <div class="expenses-module">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">${t.expenses || 'Расходы'}</h2>
                    <button id="add-expense-btn" class="premium-btn">
                        <i class="fas fa-plus mr-2"></i>
                        ${t.addExpense || 'Добавить расход'}
                    </button>
                </div>

                <div id="expenses-list">
                    ${this.expensesList(state.expenses, t, currency)}
                </div>
            </div>
        `;
    }

    /**
     * Список расходов
     * @param {Array} expenses - Массив расходов
     * @param {Object} t - Переводы
     * @param {string} currency - Текущая валюта
     * @returns {string} HTML
     */
    static expensesList(expenses, t, currency) {
        if (!expenses || expenses.length === 0) {
            return `
                <div class="text-center p-8 opacity-60">
                    <i class="fas fa-receipt text-4xl mb-4"></i>
                    <p>${t.emptyExpenses || 'Нет расходов за этот месяц'}</p>
                </div>
            `;
        }

        // Сортировка по дате (новые сверху)
        const sortedExpenses = [...expenses].sort((a, b) => 
            b.date.localeCompare(a.date)
        );

        return sortedExpenses.map(expense => this.expenseCard(expense, t, currency)).join('');
    }

    /**
     * Карточка расхода
     * @param {Object} expense - Данные расхода
     * @param {Object} t - Переводы
     * @param {string} currency - Текущая валюта
     * @returns {string} HTML
     */
    static expenseCard(expense, t, currency) {
        return `
            <div class="premium-card p-4 mb-3 flex justify-between items-center">
                <div class="flex-1">
                    <div class="font-bold">${expense.category}</div>
                    <div class="text-sm opacity-70">${formatISODateForDisplay(expense.date)}</div>
                    ${expense.comment ? `
                        <div class="text-sm opacity-60 mt-1">${expense.comment}</div>
                    ` : ''}
                </div>
                <div class="flex items-center gap-3">
                    <div class="font-bold text-lg">${formatCurrency(expense.amount, currency)}</div>
                    <div class="flex gap-2">
                        <button class="icon-btn edit-expense-btn" data-id="${expense.id}" title="${t.edit || 'Редактировать'}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn text-red-500 delete-expense-btn" data-id="${expense.id}" title="${t.delete || 'Удалить'}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Форма добавления расхода
     * @param {Object} t - Переводы
     * @param {string} currentMonth - Текущий месяц (YYYY-MM)
     * @returns {string} HTML
     */
    static addExpenseForm(t, currentMonth) {
        const defaultDate = `${currentMonth}-01`;
        
        return `
            <form id="expense-form" class="space-y-4">
                <div>
                    <label for="expense-category" class="block mb-2 text-sm font-medium">
                        ${t.category || 'Категория'} *
                    </label>
                    <input 
                        type="text" 
                        id="expense-category" 
                        name="category"
                        class="w-full p-2 border rounded"
                        required
                        placeholder="${t.enterCategory || 'Введите категорию'}"
                    />
                </div>

                <div>
                    <label for="expense-amount" class="block mb-2 text-sm font-medium">
                        ${t.amount || 'Сумма'} *
                    </label>
                    <input 
                        type="number" 
                        id="expense-amount" 
                        name="amount"
                        class="w-full p-2 border rounded"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label for="expense-date" class="block mb-2 text-sm font-medium">
                        ${t.date || 'Дата'} *
                    </label>
                    <input 
                        type="date" 
                        id="expense-date" 
                        name="date"
                        class="w-full p-2 border rounded"
                        required
                        value="${defaultDate}"
                    />
                </div>

                <div>
                    <label for="expense-comment" class="block mb-2 text-sm font-medium">
                        ${t.comment || 'Комментарий'}
                    </label>
                    <textarea 
                        id="expense-comment" 
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
     * Форма редактирования расхода
     * @param {Object} expense - Данные расхода
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static editExpenseForm(expense, t) {
        return `
            <form id="expense-form" class="space-y-4">
                <div>
                    <label for="expense-category" class="block mb-2 text-sm font-medium">
                        ${t.category || 'Категория'} *
                    </label>
                    <input 
                        type="text" 
                        id="expense-category" 
                        name="category"
                        class="w-full p-2 border rounded"
                        required
                        value="${expense.category}"
                    />
                </div>

                <div>
                    <label for="expense-amount" class="block mb-2 text-sm font-medium">
                        ${t.amount || 'Сумма'} *
                    </label>
                    <input 
                        type="number" 
                        id="expense-amount" 
                        name="amount"
                        class="w-full p-2 border rounded"
                        required
                        min="0"
                        step="0.01"
                        value="${expense.amount}"
                    />
                </div>

                <div>
                    <label for="expense-date" class="block mb-2 text-sm font-medium">
                        ${t.date || 'Дата'} *
                    </label>
                    <input 
                        type="date" 
                        id="expense-date" 
                        name="date"
                        class="w-full p-2 border rounded"
                        required
                        value="${expense.date}"
                    />
                </div>

                <div>
                    <label for="expense-comment" class="block mb-2 text-sm font-medium">
                        ${t.comment || 'Комментарий'}
                    </label>
                    <textarea 
                        id="expense-comment" 
                        name="comment"
                        class="w-full p-2 border rounded"
                        rows="3"
                    >${expense.comment || ''}</textarea>
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
