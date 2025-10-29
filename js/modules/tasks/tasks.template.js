/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ TASKS TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════
 * HTML шаблоны для модуля задач
 */

import { formatISODateForDisplay } from '../../utils/formatters.js';

/**
 * Шаблоны для модуля задач
 */
export class TasksTemplate {
    /**
     * Главный шаблон модуля задач
     * @param {Object} state - Состояние с задачами
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static render(state, t) {
        return `
            <div class="tasks-module">
                <!-- Ежедневные задачи -->
                <div class="tasks-section mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">
                            <i class="fas fa-calendar-day mr-2"></i>
                            ${t.dailyTasks || 'Ежедневные задачи'}
                        </h2>
                        <button id="add-task-today-btn" class="btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            ${t.add || 'Добавить'}
                        </button>
                    </div>
                    <div id="daily-tasks-list">
                        ${this.renderTasksList(state.dailyTasks, 'daily', t)}
                    </div>
                </div>

                <!-- Месячные задачи -->
                <div class="tasks-section mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            ${t.monthlyTasks || 'Месячные задачи'}
                        </h2>
                        <button id="add-task-month-btn" class="btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            ${t.add || 'Добавить'}
                        </button>
                    </div>
                    <div id="monthly-tasks-list">
                        ${this.renderTasksList(state.monthlyTasks, 'monthly', t)}
                    </div>
                </div>

                <!-- Годовые задачи -->
                <div class="tasks-section mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">
                            <i class="fas fa-calendar mr-2"></i>
                            ${t.yearlyTasks || 'Годовые задачи'}
                        </h2>
                        <button id="add-task-year-btn" class="btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            ${t.add || 'Добавить'}
                        </button>
                    </div>
                    <div id="yearly-tasks-list">
                        ${this.renderTasksList(state.yearlyTasks, 'yearly', t)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Рендеринг списка задач
     * @param {Array} tasks - Массив задач
     * @param {string} type - Тип задач
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static renderTasksList(tasks, type, t) {
        if (!tasks || tasks.length === 0) {
            return `
                <div class="text-center p-4 opacity-60">
                    ${t.emptyTasks || 'Нет задач'}
                </div>
            `;
        }

        return tasks.map(task => this.renderTaskCard(task, type)).join('');
    }

    /**
     * Рендеринг карточки задачи
     * @param {Object} task - Задача
     * @param {string} type - Тип задачи
     * @returns {string} HTML
     */
    static renderTaskCard(task, type) {
        const doneClass = task.done ? 'opacity-50' : '';
        const strikeClass = task.done ? 'line-through' : '';

        return `
            <div class="premium-card p-3 mb-2 ${doneClass}">
                <div class="flex items-start gap-3">
                    <input 
                        type="checkbox" 
                        ${task.done ? 'checked' : ''} 
                        data-task-id="${task.id}"
                        data-task-type="${type}"
                        class="task-checkbox mt-1 w-5 h-5 cursor-pointer"
                    >
                    <div class="flex-1">
                        <div class="font-bold ${strikeClass}">${this.escapeHtml(task.name)}</div>
                        ${task.notes ? `<div class="text-sm opacity-70 mt-1">${this.escapeHtml(task.notes)}</div>` : ''}
                        ${task.deadline ? `<div class="text-xs opacity-60 mt-1">⏰ ${formatISODateForDisplay(task.deadline)}</div>` : ''}
                    </div>
                    <div class="flex gap-2">
                        <button 
                            data-task-id="${task.id}"
                            data-task-type="${type}"
                            class="edit-task-btn icon-btn"
                            title="Редактировать"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            data-task-id="${task.id}"
                            data-task-type="${type}"
                            class="delete-task-btn icon-btn text-red-500"
                            title="Удалить"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Модальное окно добавления задачи
     * @param {string} type - Тип задачи
     * @param {string} typeLabel - Название типа
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static addTaskModal(type, typeLabel, t) {
        return `
            <div class="task-modal-form">
                <div class="form-group mb-4">
                    <label for="task-name-input" class="form-label">
                        ${t.taskName || 'Название задачи'} *
                    </label>
                    <input 
                        type="text" 
                        id="task-name-input" 
                        class="form-input w-full"
                        placeholder="${t.enterTaskName || 'Введите название задачи'}"
                        required
                    >
                </div>

                <div class="form-group mb-4">
                    <label for="task-notes-input" class="form-label">
                        ${t.notes || 'Заметки'}
                    </label>
                    <textarea 
                        id="task-notes-input" 
                        class="form-input w-full"
                        rows="3"
                        placeholder="${t.enterNotes || 'Дополнительная информация'}"
                    ></textarea>
                </div>

                <div class="form-group mb-4">
                    <label for="task-deadline-input" class="form-label">
                        ${t.deadline || 'Срок выполнения'}
                    </label>
                    <input 
                        type="date" 
                        id="task-deadline-input" 
                        class="form-input w-full"
                    >
                </div>
            </div>
        `;
    }

    /**
     * Модальное окно редактирования задачи
     * @param {Object} task - Задача для редактирования
     * @param {Object} t - Переводы
     * @returns {string} HTML
     */
    static editTaskModal(task, t) {
        return `
            <div class="task-modal-form">
                <div class="form-group mb-4">
                    <label for="task-name-input" class="form-label">
                        ${t.taskName || 'Название задачи'} *
                    </label>
                    <input 
                        type="text" 
                        id="task-name-input" 
                        class="form-input w-full"
                        value="${this.escapeHtml(task.name)}"
                        required
                    >
                </div>

                <div class="form-group mb-4">
                    <label for="task-notes-input" class="form-label">
                        ${t.notes || 'Заметки'}
                    </label>
                    <textarea 
                        id="task-notes-input" 
                        class="form-input w-full"
                        rows="3"
                        placeholder="${t.enterNotes || 'Дополнительная информация'}"
                    >${this.escapeHtml(task.notes || '')}</textarea>
                </div>

                <div class="form-group mb-4">
                    <label for="task-deadline-input" class="form-label">
                        ${t.deadline || 'Срок выполнения'}
                    </label>
                    <input 
                        type="date" 
                        id="task-deadline-input" 
                        class="form-input w-full"
                        value="${task.deadline || ''}"
                    >
                </div>
            </div>
        `;
    }

    /**
     * Экранирование HTML
     * @param {string} text - Текст для экранирования
     * @returns {string} Экранированный текст
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
