import { logger, escapeHtml, escapeHtmlAttr } from '../utils.js';
import { translations, currentLang } from '../i18n.js';

// Utility functions (will be passed from app.js)
let getTodayISOString;

export function initCalendarModule(utils) {
    getTodayISOString = utils.getTodayISOString;
}

function getEventColor(category, isBg) {
    const cleanCat = (category || 'event').toLowerCase();
    switch (cleanCat) {
         case 'birthday': return isBg ? 'rgba(236, 72, 153, 0.1)' : '#ec4899'; // Pink
         case 'meeting': return isBg ? 'rgba(59, 130, 246, 0.1)' : '#3b82f6'; // Blue
         case 'wedding': return isBg ? 'rgba(168, 85, 247, 0.1)' : '#a855f7'; // Purple
         default: return isBg ? 'rgba(234, 179, 8, 0.1)' : '#eab308'; // Yellow/Gold
    }
}

export function renderCalendar(calendarDate, calendarEvents) {
    const grid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    const weekdaysEl = document.getElementById('calendar-weekdays');

    if (!grid) { logger.error('renderCalendar: calendar-grid not found'); return; }
    if (!monthYearEl) { logger.error('renderCalendar: calendar-month-year not found'); return; }
    if (!weekdaysEl) { logger.error('renderCalendar: calendar-weekdays not found'); return; }

    if (!calendarDate) { logger.error('renderCalendar: calendarDate is NULL'); return; }

    const month = calendarDate.getMonth(), year = calendarDate.getFullYear();

    // Fallback to 'ru' if currentLang translations are missing
    const t = translations[currentLang] || translations['ru'] || {};
    const langCode = currentLang === 'ru' ? 'ru-RU' : (currentLang === 'az' ? 'az-Latn-AZ' : 'en-US');

    // Month Name
    let monthNameDisplay = '';
    if (t.months && t.months[month]) {
         monthNameDisplay = `${t.months[month]} ${year}`;
    } else {
         monthNameDisplay = calendarDate.toLocaleString(langCode, { month: 'long', year: 'numeric' });
    }
    monthYearEl.textContent = monthNameDisplay;

    // Weekdays
    const weekdays = t.weekdays || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdaysEl.innerHTML = weekdays.map(day => `<div>${day}</div>`).join('');

    // Grid
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    grid.innerHTML = '';
    for (let i = 0; i < startingDay; i++) {
         grid.insertAdjacentHTML('beforeend', '<div class="p-2"></div>');
    }

    const todayISO = getTodayISOString();

    try {
         for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const monthDayStr = dateStr.substring(5);
              const isToday = dateStr === todayISO;

              let dayEvents = [];
              if (calendarEvents && Array.isArray(calendarEvents)) {
                   dayEvents = calendarEvents.filter(e => {
                        if (!e || !e.date) return false;
                        return e.category === 'birthday' ? e.date.substring(5) === monthDayStr : e.date === dateStr;
                   });
              }

              const dayEl = document.createElement('div');
              dayEl.className = `calendar-day border-2 border-gray-200 dark:border-gray-700 p-1 md:p-2 flex flex-col cursor-pointer transition-all min-h-[80px] rounded-lg hover:border-blue-400 dark:hover:border-blue-600 ${isToday ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 dark:border-blue-500' : 'bg-white dark:bg-gray-800'}`;
              dayEl.dataset.date = dateStr;

              const dayNumberStyle = isToday
                   ? 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);'
                   : 'color: var(--text-secondary);';

              dayEl.innerHTML = `
                <div class="calendar-day-number self-end text-center rounded-full flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-xs md:text-sm font-semibold mb-1" 
                     style="${dayNumberStyle}">
                    ${day}
                </div>
                <div class="events space-y-1 overflow-y-auto custom-scrollbar flex-grow w-full">
                    ${dayEvents.map(e => `
                        <div data-event-id="${escapeHtmlAttr(e.id)}" class="event-item px-1.5 py-0.5 rounded text-[10px] md:text-xs font-medium truncate w-full text-left" 
                             style="background: ${getEventColor(e.category, true)}; color: ${getEventColor(e.category, false)}; border-left: 2px solid ${getEventColor(e.category, false)};">
                            ${escapeHtml(e.name || (e.category === 'birthday' ? (e.birthdayName || 'Birthday') : 'Event'))}
                        </div>
                    `).join('')}
                </div>
            `;
              grid.appendChild(dayEl);
         }
    } catch (e) {
         logger.error('Calendar render error', e);
    }
}

