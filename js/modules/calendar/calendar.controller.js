/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📅 CALENDAR CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * Контроллер для управления логикой календаря
 */

import { CalendarTemplate } from './calendar.template.js';
import { translations } from '../../translations.js';

/**
 * Контроллер календаря
 * Управляет бизнес-логикой календаря и событий
 */
export class CalendarController {
    /**
     * @param {Object} app - Экземпляр главного приложения
     */
    constructor(app) {
        this.app = app;
        this.firestoreService = app.getService('firestore');
        this.state = {
            events: [],
            currentDate: new Date(),
            selectedDate: null,
            loading: false
        };
    }

    /**
     * Получить текущий язык
     */
    get currentLanguage() {
        return this.app.state.language || 'ru';
    }

    /**
     * Получить переводы
     */
    get t() {
        return translations[this.currentLanguage];
    }

    /**
     * Загрузить данные календаря
     */
    async fetchData() {
        if (!this.app.state.user) {
            console.warn('User not authenticated');
            return;
        }

        this.state.loading = true;
        
        try {
            const userId = this.app.state.user.uid;
            const monthId = this.getMonthId(this.state.currentDate);
            
            // Загрузить события за текущий месяц
            this.state.events = await this.firestoreService.getCalendarEvents(userId, monthId);
            
            console.log(`Loaded ${this.state.events.length} calendar events for ${monthId}`);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            this.state.events = [];
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Отрендерить календарь
     * @param {HTMLElement} container - Контейнер для рендеринга
     */
    render(container) {
        if (!container) return;
        
        const html = CalendarTemplate.render(this.state, this.t);
        container.innerHTML = html;
    }

    /**
     * Установить обработчики событий
     * @param {HTMLElement} container - Контейнер с элементами
     */
    setupEventListeners(container) {
        if (!container) return;

        // Навигация по месяцам
        const prevBtn = container.querySelector('#calendar-prev-month');
        const nextBtn = container.querySelector('#calendar-next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateMonth(1));
        }

        // Клик по дню календаря
        const days = container.querySelectorAll('.calendar-day:not(.other-month)');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                if (dateStr) {
                    this.selectDate(dateStr);
                }
            });
        });

        // Кнопка добавления события
        const addEventBtn = container.querySelector('#add-event-btn');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => this.openAddEventModal());
        }

        // Клик по событию
        const eventItems = container.querySelectorAll('.event-item');
        eventItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const eventId = e.currentTarget.dataset.eventId;
                if (eventId) {
                    this.openEditEventModal(eventId);
                }
            });
        });
    }

    /**
     * Навигация по месяцам
     * @param {number} direction - Направление (-1 для предыдущего, 1 для следующего)
     */
    async navigateMonth(direction) {
        const newDate = new Date(this.state.currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        this.state.currentDate = newDate;
        
        await this.refresh();
    }

    /**
     * Выбрать дату
     * @param {string} dateStr - Дата в формате YYYY-MM-DD
     */
    selectDate(dateStr) {
        this.state.selectedDate = dateStr;
        
        // Обновить UI
        const container = document.getElementById(this.containerId || 'calendar-content');
        if (container) {
            // Убрать выделение со всех дней
            container.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('selected');
            });
            
            // Выделить выбранный день
            const selectedDay = container.querySelector(`[data-date="${dateStr}"]`);
            if (selectedDay) {
                selectedDay.classList.add('selected');
            }
        }
    }

    /**
     * Открыть модальное окно добавления события
     */
    openAddEventModal() {
        // TODO: Реализовать модальное окно
        console.log('Open add event modal for date:', this.state.selectedDate);
        alert('Функция добавления события будет реализована в следующей версии');
    }

    /**
     * Открыть модальное окно редактирования события
     * @param {string} eventId - ID события
     */
    openEditEventModal(eventId) {
        const event = this.state.events.find(e => e.id === eventId);
        if (event) {
            console.log('Open edit event modal for:', event);
            alert('Функция редактирования события будет реализована в следующей версии');
        }
    }

    /**
     * Добавить событие
     * @param {Object} eventData - Данные события
     */
    async addEvent(eventData) {
        if (!this.app.state.user) {
            console.error('User not authenticated');
            return;
        }

        try {
            const userId = this.app.state.user.uid;
            const eventId = await this.firestoreService.addCalendarEvent(userId, eventData);
            
            console.log('Event added:', eventId);
            await this.refresh();
            
            return eventId;
        } catch (error) {
            console.error('Error adding event:', error);
            throw error;
        }
    }

    /**
     * Обновить событие
     * @param {string} eventId - ID события
     * @param {Object} updates - Обновляемые поля
     */
    async updateEvent(eventId, updates) {
        if (!this.app.state.user) {
            console.error('User not authenticated');
            return;
        }

        try {
            const userId = this.app.state.user.uid;
            await this.firestoreService.updateCalendarEvent(userId, eventId, updates);
            
            console.log('Event updated:', eventId);
            await this.refresh();
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    /**
     * Удалить событие
     * @param {string} eventId - ID события
     */
    async deleteEvent(eventId) {
        if (!this.app.state.user) {
            console.error('User not authenticated');
            return;
        }

        if (!confirm(this.t.deleteConfirm)) {
            return;
        }

        try {
            const userId = this.app.state.user.uid;
            await this.firestoreService.deleteCalendarEvent(userId, eventId);
            
            console.log('Event deleted:', eventId);
            await this.refresh();
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    /**
     * Обновить календарь
     */
    async refresh() {
        await this.fetchData();
        
        const container = document.getElementById(this.containerId || 'calendar-content');
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
            events: [],
            currentDate: new Date(),
            selectedDate: null,
            loading: false
        };
    }

    /**
     * Получить ID месяца из даты
     * @param {Date} date - Дата
     * @returns {string} ID месяца в формате YYYY-MM
     */
    getMonthId(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
}
