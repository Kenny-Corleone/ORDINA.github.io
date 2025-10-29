/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ TASKS MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Модуль управления задачами (ежедневные, месячные, годовые)
 * 
 * Функциональность:
 * - Создание задач трех типов: daily, monthly, yearly
 * - Отметка выполнения задач
 * - Фильтрация по типу и статусу
 * - Установка дедлайнов
 * - Добавление заметок к задачам
 * - Автоматическое создание задач из событий календаря
 * 
 * Типы задач:
 * - Daily: Ежедневные задачи на конкретную дату
 * - Monthly: Месячные задачи с дедлайном в текущем месяце
 * - Yearly: Долгосрочные цели на год
 * 
 * Архитектура:
 * - Module: Управление жизненным циклом
 * - Controller: Бизнес-логика и CRUD операции
 * - Template: Генерация HTML для разных типов задач
 * 
 * @module modules/tasks
 * @requires core/app
 * @requires services/firestore
 * @requires utils/formatters
 * 
 * @example
 * const tasks = new TasksModule(app);
 * await tasks.load();
 */

import { TasksController } from './tasks.controller.js';

/**
 * Класс модуля задач
 * Управляет отображением и взаимодействием с задачами разных типов
 */
export class TasksModule {
    /**
     * Создает экземпляр модуля Tasks
     * @param {OrdinaApp} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.controller = new TasksController(app);
        this.container = null;
        this.isLoaded = false;
        this.containerId = 'tasks-content';
    }

    /**
     * Загрузка и инициализация модуля
     * Загружает задачи всех типов и отображает их в соответствующих вкладках
     * При повторных вызовах обновляет данные без полной перезагрузки
     * 
     * @async
     * @returns {Promise<void>}
     * @throws {Error} Если контейнер не найден или загрузка данных не удалась
     */
    async load() {
        if (this.isLoaded) {
            await this.controller.refresh();
            return;
        }

        // Получить контейнер
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }

        // Загрузить данные всех типов задач
        await this.controller.fetchData();

        // Отрендерить UI с вкладками
        this.controller.render(this.container);

        // Установить обработчики событий
        this.controller.setupEventListeners(this.container);

        this.isLoaded = true;
    }

    /**
     * Выгрузка модуля и очистка ресурсов
     * Удаляет обработчики событий и очищает состояние
     * 
     * @returns {void}
     */
    unload() {
        if (this.controller) {
            this.controller.cleanup();
        }
        this.isLoaded = false;
    }

    /**
     * Обновление данных модуля
     * Перезагружает задачи всех типов и обновляет UI
     * 
     * @async
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.controller.refresh();
    }
}
