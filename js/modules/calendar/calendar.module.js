/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📅 CALENDAR MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Модуль управления календарем и событиями
 * 
 * Функциональность:
 * - Отображение календаря с навигацией по месяцам
 * - Создание событий разных типов (обычные, дни рождения, встречи, свадьбы)
 * - Редактирование и удаление событий
 * - Автоматическое создание задач из событий
 * - Расчет возраста для дней рождения
 * - Цветовая кодировка событий по типам
 * - Просмотр событий на конкретную дату
 * 
 * Типы событий:
 * - event: Обычное событие
 * - birthday: День рождения (с расчетом возраста)
 * - meeting: Встреча (с временем и местом)
 * - wedding: Свадьба (с расчетом годовщины)
 * 
 * Архитектура:
 * - Module: Управление жизненным циклом
 * - Controller: Бизнес-логика, рендеринг календаря, CRUD операции
 * - Template: Генерация HTML для календаря и событий
 * 
 * @module modules/calendar
 * @requires core/app
 * @requires services/firestore
 * @requires utils/formatters
 * 
 * @example
 * const calendar = new CalendarModule(app);
 * await calendar.load();
 */

import { CalendarController } from './calendar.controller.js';

/**
 * Класс модуля календаря
 * Управляет отображением календаря и взаимодействием с событиями
 */
export class CalendarModule {
    /**
     * Создает экземпляр модуля Calendar
     * @param {OrdinaApp} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.controller = new CalendarController(app);
        this.container = null;
        this.isLoaded = false;
        this.containerId = 'calendar-content';
    }

    /**
     * Загрузка и инициализация модуля
     * Отображает календарь текущего месяца и загружает события
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

        // Загрузить события из Firestore
        await this.controller.fetchData();

        // Отрендерить календарь и события
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
     * Перезагружает события и обновляет отображение календаря
     * 
     * @async
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.controller.refresh();
    }
}
