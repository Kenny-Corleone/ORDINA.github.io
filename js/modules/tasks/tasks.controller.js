/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ TASKS CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * Контроллер для управления бизнес-логикой задач
 */

import { TasksTemplate } from './tasks.template.js';

/**
 * Контроллер задач
 * Управляет данными и бизнес-логикой модуля задач
 */
export class TasksController {
    /**
     * @param {Object} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.state = {
            dailyTasks: [],
            monthlyTasks: [],
            yearlyTasks: []
        };
        this.firestoreService = null;
        this.toastComponent = null;
        this.modalComponent = null;
    }

    /**
     * Загрузка данных задач
     */
    async fetchData() {
        this.firestoreService = this.app.getService('firestore');
        this.toastComponent = this.app.getService('toast');
        this.modalComponent = this.app.getService('modal');

        if (!this.firestoreService || !this.app.state.user) {
            console.error('FirestoreService or user not available');
            return;
        }

        try {
            const userId = this.app.state.user.uid;
            const currentDate = new Date().toISOString().split('T')[0];
            const monthId = this.app.state.currentMonth;

            // Загрузка всех типов задач параллельно
            const [dailyTasks, monthlyTasks, yearlyTasks] = await Promise.all([
                this.firestoreService.getDailyTasks(userId, currentDate),
                this.firestoreService.getMonthlyTasks(userId, monthId),
                this.firestoreService.getYearlyTasks(userId)
            ]);

            this.state.dailyTasks = dailyTasks;
            this.state.monthlyTasks = monthlyTasks;
            this.state.yearlyTasks = yearlyTasks;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            this.toastComponent?.show('Ошибка загрузки задач', 'error');
        }
    }

    /**
     * Рендеринг UI
     * @param {HTMLElement} container - Контейнер для рендеринга
     */
    render(container) {
        const t = this.app.translations[this.app.state.language];
        container.innerHTML = TasksTemplate.render(this.state, t);
    }

    /**
     * Установка обработчиков событий
     * @param {HTMLElement} container - Контейнер с элементами
     */
    setupEventListeners(container) {
        // Кнопки добавления задач
        const addTodayBtn = container.querySelector('#add-task-today-btn');
        const addMonthBtn = container.querySelector('#add-task-month-btn');
        const addYearBtn = container.querySelector('#add-task-year-btn');

        if (addTodayBtn) {
            addTodayBtn.addEventListener('click', () => this.openAddTaskModal('daily'));
        }
        if (addMonthBtn) {
            addMonthBtn.addEventListener('click', () => this.openAddTaskModal('monthly'));
        }
        if (addYearBtn) {
            addYearBtn.addEventListener('click', () => this.openAddTaskModal('yearly'));
        }

        // Обработчики для чекбоксов задач
        container.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.dataset.taskId;
                const taskType = e.target.dataset.taskType;
                this.toggleTaskStatus(taskId, taskType);
            });
        });

        // Обработчики для кнопок редактирования
        container.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.taskId;
                const taskType = e.currentTarget.dataset.taskType;
                this.editTask(taskId, taskType);
            });
        });

        // Обработчики для кнопок удаления
        container.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.taskId;
                const taskType = e.currentTarget.dataset.taskType;
                this.deleteTask(taskId, taskType);
            });
        });
    }

    /**
     * Открытие модального окна добавления задачи
     * @param {string} type - Тип задачи (daily, monthly, yearly)
     */
    openAddTaskModal(type) {
        const t = this.app.translations[this.app.state.language];
        const typeLabels = {
            daily: t.dailyTasks || 'Ежедневные задачи',
            monthly: t.monthlyTasks || 'Месячные задачи',
            yearly: t.yearlyTasks || 'Годовые задачи'
        };

        const modalContent = TasksTemplate.addTaskModal(type, typeLabels[type], t);
        
        this.modalComponent.open(
            `${t.add || 'Добавить'} ${typeLabels[type]}`,
            modalContent,
            async () => {
                await this.handleAddTask(type);
            }
        );
    }

    /**
     * Обработка добавления задачи
     * @param {string} type - Тип задачи
     */
    async handleAddTask(type) {
        const nameInput = document.getElementById('task-name-input');
        const notesInput = document.getElementById('task-notes-input');
        const deadlineInput = document.getElementById('task-deadline-input');

        const name = nameInput?.value.trim();
        if (!name) {
            this.toastComponent?.show('Введите название задачи', 'error');
            return false;
        }

        const taskData = {
            name,
            notes: notesInput?.value.trim() || '',
            deadline: deadlineInput?.value || null,
            done: false,
            createdAt: new Date()
        };

        // Добавляем специфичные поля в зависимости от типа
        if (type === 'daily') {
            taskData.date = new Date().toISOString().split('T')[0];
        } else if (type === 'monthly') {
            taskData.monthId = this.app.state.currentMonth;
        }

        try {
            const userId = this.app.state.user.uid;
            await this.firestoreService.addTask(userId, type, taskData);
            this.toastComponent?.show('Задача добавлена', 'success');
            await this.refresh();
            return true;
        } catch (error) {
            console.error('Error adding task:', error);
            this.toastComponent?.show('Ошибка добавления задачи', 'error');
            return false;
        }
    }

    /**
     * Переключение статуса задачи
     * @param {string} taskId - ID задачи
     * @param {string} type - Тип задачи
     */
    async toggleTaskStatus(taskId, type) {
        try {
            const userId = this.app.state.user.uid;
            
            // Найти задачу в состоянии
            let task;
            if (type === 'daily') {
                task = this.state.dailyTasks.find(t => t.id === taskId);
            } else if (type === 'monthly') {
                task = this.state.monthlyTasks.find(t => t.id === taskId);
            } else {
                task = this.state.yearlyTasks.find(t => t.id === taskId);
            }

            if (!task) return;

            // Обновить статус
            const newStatus = !task.done;
            await this.firestoreService.updateTask(userId, type, taskId, { done: newStatus });
            
            // Обновить локальное состояние
            task.done = newStatus;
            
            // Перерендерить
            const container = document.getElementById(this.containerId);
            if (container) {
                this.render(container);
                this.setupEventListeners(container);
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            this.toastComponent?.show('Ошибка обновления задачи', 'error');
        }
    }

    /**
     * Редактирование задачи
     * @param {string} taskId - ID задачи
     * @param {string} type - Тип задачи
     */
    async editTask(taskId, type) {
        // Найти задачу
        let task;
        if (type === 'daily') {
            task = this.state.dailyTasks.find(t => t.id === taskId);
        } else if (type === 'monthly') {
            task = this.state.monthlyTasks.find(t => t.id === taskId);
        } else {
            task = this.state.yearlyTasks.find(t => t.id === taskId);
        }

        if (!task) return;

        const t = this.app.translations[this.app.state.language];
        const modalContent = TasksTemplate.editTaskModal(task, t);

        this.modalComponent.open(
            t.edit || 'Редактировать',
            modalContent,
            async () => {
                await this.handleEditTask(taskId, type);
            }
        );
    }

    /**
     * Обработка редактирования задачи
     * @param {string} taskId - ID задачи
     * @param {string} type - Тип задачи
     */
    async handleEditTask(taskId, type) {
        const nameInput = document.getElementById('task-name-input');
        const notesInput = document.getElementById('task-notes-input');
        const deadlineInput = document.getElementById('task-deadline-input');

        const name = nameInput?.value.trim();
        if (!name) {
            this.toastComponent?.show('Введите название задачи', 'error');
            return false;
        }

        const updates = {
            name,
            notes: notesInput?.value.trim() || '',
            deadline: deadlineInput?.value || null
        };

        try {
            const userId = this.app.state.user.uid;
            await this.firestoreService.updateTask(userId, type, taskId, updates);
            this.toastComponent?.show('Задача обновлена', 'success');
            await this.refresh();
            return true;
        } catch (error) {
            console.error('Error updating task:', error);
            this.toastComponent?.show('Ошибка обновления задачи', 'error');
            return false;
        }
    }

    /**
     * Удаление задачи
     * @param {string} taskId - ID задачи
     * @param {string} type - Тип задачи
     */
    async deleteTask(taskId, type) {
        const t = this.app.translations[this.app.state.language];
        const confirmed = await this.modalComponent.confirm(
            t.confirmDelete || 'Удалить эту задачу?'
        );

        if (!confirmed) return;

        try {
            const userId = this.app.state.user.uid;
            await this.firestoreService.deleteTask(userId, type, taskId);
            this.toastComponent?.show('Задача удалена', 'success');
            await this.refresh();
        } catch (error) {
            console.error('Error deleting task:', error);
            this.toastComponent?.show('Ошибка удаления задачи', 'error');
        }
    }

    /**
     * Обновление данных и UI
     */
    async refresh() {
        await this.fetchData();
        const container = document.getElementById(this.containerId);
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
            dailyTasks: [],
            monthlyTasks: [],
            yearlyTasks: []
        };
    }
}
