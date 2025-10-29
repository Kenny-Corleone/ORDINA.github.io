/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💳 DEBTS MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Модуль управления долгами и кредитами
 * 
 * Функциональность:
 * - Добавление и отслеживание долгов
 * - Регистрация платежей по долгам
 * - Расчет остатка долга
 * - Визуализация прогресса погашения
 * - История платежей
 * - Уведомления о предстоящих платежах
 * 
 * Архитектура:
 * - Module: Управление жизненным циклом
 * - Controller: Бизнес-логика и расчеты
 * - Template: Генерация HTML
 * 
 * @module modules/debts
 * @requires core/app
 * @requires services/firestore
 * @requires utils/formatters
 * 
 * @example
 * const debts = new DebtsModule(app);
 * await debts.load();
 */

import { DebtsController } from './debts.controller.js';

/**
 * Класс модуля долгов
 * Управляет отображением и взаимодействием с долгами пользователя
 */
export class DebtsModule {
    /**
     * Создает экземпляр модуля Debts
     * @param {OrdinaApp} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.controller = new DebtsController(app);
        this.container = null;
        this.isLoaded = false;
        this.containerId = 'debts-content';
    }

    /**
     * Загрузка и инициализация модуля
     * Выполняет загрузку данных о долгах, рендеринг UI и установку обработчиков
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
