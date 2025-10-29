/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💰 EXPENSES MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Модуль управления расходами пользователя
 * 
 * Функциональность:
 * - Добавление, редактирование и удаление расходов
 * - Категоризация расходов
 * - Фильтрация по месяцам
 * - Расчет общей суммы расходов
 * - Визуализация расходов по категориям
 * - Экспорт данных
 * 
 * Архитектура:
 * - Module: Управление жизненным циклом
 * - Controller: Бизнес-логика и CRUD операции
 * - Template: Генерация HTML
 * 
 * @module modules/expenses
 * @requires core/app
 * @requires services/firestore
 * @requires utils/formatters
 * 
 * @example
 * const expenses = new ExpensesModule(app);
 * await expenses.load();
 */

import { ExpensesController } from './expenses.controller.js';

/**
 * Класс модуля расходов
 * Управляет отображением и взаимодействием с расходами пользователя
 */
export class ExpensesModule {
    /**
     * Создает экземпляр модуля Expenses
     * @param {OrdinaApp} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.controller = new ExpensesController(app);
        this.container = null;
        this.isLoaded = false;
        this.containerId = 'expenses-content';
    }

    /**
     * Загрузка и инициализация модуля
     * Выполняет загрузку данных, рендеринг UI и установку обработчиков событий
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

        // Загрузить данные из Firestore
        await this.controller.fetchData();

        // Отрендерить UI
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
     * Перезагружает данные из Firestore и обновляет UI
     * 
     * @async
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.controller.refresh();
    }
}
