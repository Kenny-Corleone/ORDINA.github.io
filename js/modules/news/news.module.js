/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📰 NEWS MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Модуль новостей с фильтрацией и пагинацией
 * 
 * Функциональность:
 * - Загрузка мировых новостей через Currents API
 * - Фильтрация по странам (US, GB, RU, AZ и др.)
 * - Фильтрация по категориям (business, technology, sports и др.)
 * - Пагинация новостей
 * - Кэширование запросов
 * - Fallback данные при недоступности API
 * - Адаптивное отображение карточек новостей
 * 
 * Архитектура:
 * - Module: Управление жизненным циклом
 * - Controller: Бизнес-логика, фильтрация, пагинация
 * - Template: Генерация HTML для карточек новостей
 * - Service: Взаимодействие с Currents API
 * 
 * @module modules/news
 * @requires core/app
 * @requires services/news
 * 
 * @example
 * const news = new NewsModule(app);
 * await news.load();
 */

export class NewsModule {
  /**
   * Создает экземпляр модуля News
   * @param {OrdinaApp} app - Экземпляр главного приложения
   */
  constructor(app) {
    this.app = app;
    this.controller = null;
    this.containerId = 'news-content';
    this.isLoaded = false;
  }

  /**
   * Загрузка и инициализация модуля
   * Выполняет ленивую загрузку контроллера при первом вызове
   * При повторных вызовах обновляет данные без перезагрузки
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Если не удалось загрузить контроллер или данные
   */
  async load() {
    if (this.isLoaded) {
      await this.controller.refresh();
      return;
    }

    const { NewsController } = await import('./news.controller.js');
    this.controller = new NewsController(this.app);
    
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
   * Обновление данных модуля
   * Перезагружает новости с текущими фильтрами
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
