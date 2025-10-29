/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💰 EXPENSES CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * Контроллер для управления бизнес-логикой расходов
 */

import { ExpensesTemplate } from './expenses.template.js';
import { validateRequired, validatePositiveNumber, validateDate } from '../../utils/validators.js';

/**
 * Контроллер расходов
 * Управляет бизнес-логикой модуля расходов
 */
export class ExpensesController {
    /**
     * @param {Object} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.state = {
            expenses: [],
            isLoading: false,
            error: null
        };
        this.firestoreService = null;
        this.toastComponent = null;
    }

    /**
     * Загрузка данных
     */
    async fetchData() {
        this.state.isLoading = true;
        this.state.error = null;

        try {
            // Получить сервисы
            this.firestoreService = this.app.getService('firestore');
            this.toastComponent = this.app.getService('toast');

            if (!this.firestoreService) {
                throw new Error('FirestoreService not available');
            }

            // Загрузить расходы для текущего месяца
            const userId = this.app.state.user?.uid;
            const monthId = this.app.state.currentMonth;

            if (userId && monthId) {
                this.state.expenses = await this.firestoreService.getExpenses(userId, monthId);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            this.state.error = error.message;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Рендеринг UI
     * @param {HTMLElement} container - Контейнер для рендеринга
     */
    render(container) {
        if (!container) return;

        const t = this.app.translations[this.app.state.language];
        container.innerHTML = ExpensesTemplate.render(this.state, t, this.app.state.currency);
    }

    /**
     * Установка обработчиков событий
     * @param {HTMLElement} container - Контейнер с элементами
     */
    setupEventListeners(container) {
        if (!container) return;

        // Кнопка добавления расхода
        const addBtn = container.querySelector('#add-expense-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddExpenseModal());
        }

        // Кнопки редактирования
        container.querySelectorAll('.edit-expense-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.dataset.id;
                this.editExpense(expenseId);
            });
        });

        // Кнопки удаления
        container.querySelectorAll('.delete-expense-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const expenseId = e.currentTarget.dataset.id;
                await this.deleteExpense(expenseId);
            });
        });
    }

    /**
     * Открыть модальное окно добавления расхода
     */
    openAddExpenseModal() {
        const t = this.app.translations[this.app.state.language];
        const formHtml = ExpensesTemplate.addExpenseForm(t, this.app.state.currentMonth);

        // Создать модальное окно с формой
        const { ModalComponent } = window;
        if (!ModalComponent) {
            console.error('ModalComponent not available');
            return;
        }

        const modal = new ModalComponent({
            title: t.addExpense || 'Добавить расход',
            content: formHtml,
            size: 'medium',
            showClose: true,
            closeOnBackdrop: true,
            closeOnEsc: true,
            onOpen: (modalInstance) => {
                // Добавить кнопки в footer
                const footer = `
                    <div class="flex justify-end gap-3">
                        <button type="button" class="btn-secondary modal-cancel-btn">
                            ${t.cancel || 'Отмена'}
                        </button>
                        <button type="button" class="premium-btn modal-save-btn">
                            ${t.save || 'Сохранить'}
                        </button>
                    </div>
                `;
                modalInstance.updateFooter(footer);

                // Обработчики кнопок
                const saveBtn = modalInstance.element.querySelector('.modal-save-btn');
                const cancelBtn = modalInstance.element.querySelector('.modal-cancel-btn');

                if (saveBtn) {
                    saveBtn.addEventListener('click', async () => {
                        const success = await this.saveExpense();
                        if (success) {
                            modalInstance.close();
                        }
                    });
                }

                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        modalInstance.close();
                    });
                }

                // Обработка Enter в форме
                const form = modalInstance.element.querySelector('#expense-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const success = await this.saveExpense();
                        if (success) {
                            modalInstance.close();
                        }
                    });
                }
            }
        });

        modal.open();
    }

    /**
     * Редактировать расход
     * @param {string} expenseId - ID расхода
     */
    async editExpense(expenseId) {
        const expense = this.state.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        const t = this.app.translations[this.app.state.language];
        const formHtml = ExpensesTemplate.editExpenseForm(expense, t);

        // Создать модальное окно с формой
        const { ModalComponent } = window;
        if (!ModalComponent) {
            console.error('ModalComponent not available');
            return;
        }

        const modal = new ModalComponent({
            title: t.editExpense || 'Редактировать расход',
            content: formHtml,
            size: 'medium',
            showClose: true,
            closeOnBackdrop: true,
            closeOnEsc: true,
            onOpen: (modalInstance) => {
                // Добавить кнопки в footer
                const footer = `
                    <div class="flex justify-end gap-3">
                        <button type="button" class="btn-secondary modal-cancel-btn">
                            ${t.cancel || 'Отмена'}
                        </button>
                        <button type="button" class="premium-btn modal-save-btn">
                            ${t.save || 'Сохранить'}
                        </button>
                    </div>
                `;
                modalInstance.updateFooter(footer);

                // Обработчики кнопок
                const saveBtn = modalInstance.element.querySelector('.modal-save-btn');
                const cancelBtn = modalInstance.element.querySelector('.modal-cancel-btn');

                if (saveBtn) {
                    saveBtn.addEventListener('click', async () => {
                        const success = await this.updateExpense(expenseId);
                        if (success) {
                            modalInstance.close();
                        }
                    });
                }

                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        modalInstance.close();
                    });
                }

                // Обработка Enter в форме
                const form = modalInstance.element.querySelector('#expense-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const success = await this.updateExpense(expenseId);
                        if (success) {
                            modalInstance.close();
                        }
                    });
                }
            }
        });

        modal.open();
    }

    /**
     * Валидация данных расхода
     * @param {Object} expense - Данные расхода
     * @returns {Object} Результат валидации
     */
    validateExpenseData(expense) {
        const errors = [];

        // Валидация категории
        const categoryValidation = validateRequired(expense.category, 'Category');
        if (!categoryValidation.valid) {
            errors.push(categoryValidation.error);
        }

        // Валидация суммы
        const amountValidation = validatePositiveNumber(expense.amount);
        if (!amountValidation.valid) {
            errors.push(amountValidation.error);
        }

        // Валидация даты
        const dateValidation = validateDate(expense.date);
        if (!dateValidation.valid) {
            errors.push(dateValidation.error);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Сохранить новый расход
     */
    async saveExpense() {
        try {
            const form = document.getElementById('expense-form');
            if (!form) return false;

            const formData = new FormData(form);
            const expense = {
                category: formData.get('category')?.trim(),
                amount: parseFloat(formData.get('amount')),
                date: formData.get('date'),
                comment: formData.get('comment')?.trim() || '',
                monthId: this.app.state.currentMonth,
                createdAt: new Date()
            };

            // Валидация
            const validation = this.validateExpenseData(expense);
            if (!validation.valid) {
                if (this.toastComponent) {
                    this.toastComponent.show(validation.errors[0], 'error');
                }
                return false;
            }

            const userId = this.app.state.user?.uid;
            if (!userId) {
                if (this.toastComponent) {
                    this.toastComponent.show('User not authenticated', 'error');
                }
                return false;
            }

            await this.firestoreService.addExpense(userId, expense);

            if (this.toastComponent) {
                const t = this.app.translations[this.app.state.language];
                this.toastComponent.show(t.expenseAdded || 'Расход добавлен', 'success');
            }

            await this.refresh();
            return true;
        } catch (error) {
            console.error('Error saving expense:', error);
            if (this.toastComponent) {
                const t = this.app.translations[this.app.state.language];
                this.toastComponent.show(t.error || 'Ошибка', 'error');
            }
            return false;
        }
    }

    /**
     * Обновить расход
     * @param {string} expenseId - ID расхода
     */
    async updateExpense(expenseId) {
        try {
            const form = document.getElementById('expense-form');
            if (!form) return false;

            const formData = new FormData(form);
            const updates = {
                category: formData.get('category')?.trim(),
                amount: parseFloat(formData.get('amount')),
                date: formData.get('date'),
                comment: formData.get('comment')?.trim() || ''
            };

            // Валидация
            const validation = this.validateExpenseData(updates);
            if (!validation.valid) {
                if (this.toastComponent) {
                    this.toastComponent.show(validation.errors[0], 'error');
                }
                return false;
            }

            const userId = this.app.state.user?.uid;
            if (!userId) {
                if (this.toastComponent) {
                    this.toastComponent.show('User not authenticated', 'error');
                }
                return false;
            }

            await this.firestoreService.updateExpense(userId, expenseId, updates);

            if (this.toastComponent) {
                const t = this.app.translations[this.app.state.language];
                this.toastComponent.show(t.expenseUpdated || 'Расход обновлен', 'success');
            }

            await this.refresh();
            return true;
        } catch (error) {
            console.error('Error updating expense:', error);
            if (this.toastComponent) {
                const t = this.app.translations[this.app.state.language];
                this.toastComponent.show(t.error || 'Ошибка', 'error');
            }
            return false;
        }
    }

    /**
     * Удалить расход
     * @param {string} expenseId - ID расхода
     */
    async deleteExpense(expenseId) {
        const t = this.app.translations[this.app.state.language];
        const confirmed = confirm(t.confirmDelete || 'Удалить этот расход?');
        if (!confirmed) return;

        try {
            const userId = this.app.state.user?.uid;
            if (!userId) return;

            await this.firestoreService.deleteExpense(userId, expenseId);

            if (this.toastComponent) {
                this.toastComponent.show(t.expenseDeleted || 'Расход удален', 'success');
            }

            await this.refresh();
        } catch (error) {
            console.error('Error deleting expense:', error);
            if (this.toastComponent) {
                this.toastComponent.show(t.error || 'Ошибка', 'error');
            }
        }
    }

    /**
     * Обновить данные и UI
     */
    async refresh() {
        await this.fetchData();
        const container = document.getElementById('expenses-content');
        if (container) {
            this.render(container);
            this.setupEventListeners(container);
        }
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        this.state = {
            expenses: [],
            isLoading: false,
            error: null
        };
    }
}
