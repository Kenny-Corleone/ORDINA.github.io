/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📅 CALENDAR TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════
 * Шаблоны для отображения календаря
 */

/**
 * Главный шаблон календаря
 * @param {Object} state - Состояние календаря
 * @param {Object} t - Переводы
 * @returns {string} HTML разметка
 */
export const CalendarTemplate = {
    render(state, t) {
        const { currentDate, events, loading } = state;
        
        if (loading) {
            return this.renderLoading(t);
        }

        return `
            <div class="calendar-container">
                ${this.renderHeader(currentDate, t)}
                ${this.renderCalendarGrid(currentDate, events, t)}
                ${this.renderEventsList(currentDate, events, t)}
            </div>
        `;
    },

    /**
     * Рендер загрузки
     */
    renderLoading(t) {
        return `
            <div class="calendar-loading">
                <div class="spinner"></div>
                <p>${t.loading}</p>
            </div>
        `;
    },

    /**
     * Рендер заголовка календаря
     */
    renderHeader(currentDate, t) {
        const monthName = t.months[currentDate.getMonth()];
        const year = currentDate.getFullYear();

        return `
            <div class="calendar-header">
                <button id="calendar-prev-month" class="calendar-nav-btn" title="${t.prev}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h2 class="calendar-title">${monthName} ${year}</h2>
                <button id="calendar-next-month" class="calendar-nav-btn" title="${t.next}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        `;
    },

    /**
     * Рендер сетки календаря
     */
    renderCalendarGrid(currentDate, events, t) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        // Последний день месяца
        const lastDay = new Date(year, month + 1, 0);
        
        // День недели первого дня (0 = воскресенье, нужно преобразовать к понедельнику = 0)
        let firstDayOfWeek = firstDay.getDay();
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        // Количество дней в месяце
        const daysInMonth = lastDay.getDate();
        
        // Дни предыдущего месяца
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        let html = '<div class="calendar-grid">';
        
        // Заголовки дней недели
        html += '<div class="calendar-weekdays">';
        t.weekdays.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });
        html += '</div>';
        
        // Дни календаря
        html += '<div class="calendar-days">';
        
        // Дни предыдущего месяца
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        // Дни текущего месяца
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = isCurrentMonth && today.getDate() === day;
            const dayEvents = events.filter(e => e.date === dateStr);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (dayEvents.length > 0) classes += ' has-events';
            
            html += `
                <div class="${classes}" data-date="${dateStr}">
                    <span class="day-number">${day}</span>
                    ${dayEvents.length > 0 ? `<span class="event-indicator">${dayEvents.length}</span>` : ''}
                </div>
            `;
        }
        
        // Дни следующего месяца
        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        html += '</div>'; // calendar-days
        html += '</div>'; // calendar-grid
        
        return html;
    },

    /**
     * Рендер списка событий
     */
    renderEventsList(currentDate, events, t) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Фильтровать события текущего месяца
        const monthEvents = events.filter(event => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });

        // Сортировать по дате
        monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        return `
            <div class="calendar-events">
                <div class="events-header">
                    <h3>${t.months[month]} ${year} - События</h3>
                    <button id="add-event-btn" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        ${t.addEvent}
                    </button>
                </div>
                <div class="events-list">
                    ${monthEvents.length > 0 
                        ? monthEvents.map(event => this.renderEventItem(event, t)).join('')
                        : `<p class="empty-message">${t.emptyTasks}</p>`
                    }
                </div>
            </div>
        `;
    },

    /**
     * Рендер элемента события
     */
    renderEventItem(event, t) {
        const date = new Date(event.date);
        const dayOfWeek = t.weekdaysFull[date.getDay() === 0 ? 6 : date.getDay() - 1];
        const day = date.getDate();
        const month = t.monthsShort[date.getMonth()];
        
        // Определить иконку по категории
        let icon = '📅';
        if (event.category === 'birthday') icon = '🎂';
        else if (event.category === 'meeting') icon = '🤝';
        else if (event.category === 'wedding') icon = '💒';
        
        return `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-date">
                    <span class="event-icon">${icon}</span>
                    <div class="event-date-info">
                        <span class="event-day">${day} ${month}</span>
                        <span class="event-weekday">${dayOfWeek}</span>
                    </div>
                </div>
                <div class="event-details">
                    <h4 class="event-name">${this.escapeHtml(event.name || event.eventName || 'Без названия')}</h4>
                    ${event.time ? `<p class="event-time">⏰ ${event.time}</p>` : ''}
                    ${event.place ? `<p class="event-place">📍 ${this.escapeHtml(event.place)}</p>` : ''}
                    ${event.comment ? `<p class="event-comment">${this.escapeHtml(event.comment)}</p>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
