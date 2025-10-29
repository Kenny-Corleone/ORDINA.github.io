/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 DASHBOARD MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Главный модуль дашборда с общей статистикой и аналитикой
 * 
 * Функциональность:
 * - Отображение общей статистики по расходам, долгам и задачам
 * - Визуализация данных с помощью графиков (Chart.js)
 * - Расчет и отображение ключевых метрик
 * - Быстрый доступ к основным функциям приложения
 * 
 * Архитектура:
 * - Module: Управление жизненным циклом модуля
 * - Controller: Бизнес-логика и обработка данных
 * - Template: Генерация HTML разметки
 * 
 * @module modules/dashboard
 * @requires core/app
 * @requires services/firestore
 * 
 * @example
 * const dashboard = new DashboardModule(app);
 * await dashboard.load();
 */

export class DashboardModule {
  /**
   * Создает экземпляр модуля Dashboard
   * @param {OrdinaApp} app - Экземпляр главного приложения
   */
  constructor(app) {
    this.app = app;
    this.controller = null;
    this.containerId = 'dashboard-content';
    this.isLoaded = false;
  }

  /**
   * Загрузка и инициализация модуля
   * Выполняет ленивую загрузку контроллера при первом вызове
   * При повторных вызовах обновляет данные без перезагрузки
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Если не удалось загрузить контроллер
   */
  async load() {
    if (this.isLoaded) {
      await this.controller.refresh();
      return;
    }

    const { DashboardController } = await import('./dashboard.controller.js');
    this.controller = new DashboardController(this.app);
    
    await this.controller.init();
    this.isLoaded = true;
  }

  /**
   * Выгрузка модуля и очистка ресурсов
   * Вызывается при переключении на другой модуль
   * 
   * @returns {void}
   */
  unload() {
    if (this.controller) {
      this.controller.destroy();
    }
    this.isLoaded = false;
  }

  /**
   * Обновление данных модуля без перезагрузки
   * Используется для обновления статистики после изменений
   * 
   * @async
   * @returns {Promise<void>}
   */
  async refresh() {
    if (this.controller) {
      await this.controller.refresh();
    }
  }
}
