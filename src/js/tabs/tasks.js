import { logger } from '../utils.js';
import { translations, currentLang } from '../i18n.js';

// Utility functions (will be passed from app.js)
let formatISODateForDisplay, createEmptyState;

export function initTasksModule(utils) {
    formatISODateForDisplay = utils.formatISODateForDisplay;
    createEmptyState = utils.createEmptyState;
}

function createTaskStatusDropdown(id, status, colName) {
    const t = translations[currentLang];
    const ruT = translations.ru;
    const options = {
         [ruT.statusNotDone]: { text: t.statusNotDone, class: 'bg-yellow-100 text-yellow-800' },
         [ruT.statusDone]: { text: t.statusDone, class: 'bg-green-100 text-green-800' },
         [ruT.statusSkipped]: { text: t.statusSkipped, class: 'bg-gray-100 text-gray-800' }
    };
    const currentStatus = status || ruT.statusNotDone;
    let selectHTML = `<select data-id="${id}" data-col="${colName}" class="task-status-select p-1 rounded-md border-0 ring-1 ring-inset ring-gray-300 ${options[currentStatus]?.class || ''}">`;
    for (const [value, { text }] of Object.entries(options)) {
         selectHTML += `<option value="${value}" ${currentStatus === value ? 'selected' : ''}>${text}</option>`;
    }
    selectHTML += `</select>`;
    return selectHTML;
}

export function renderDailyTasks(docs) {
    const tableWrapper = document.getElementById('daily-tasks-table-wrapper');
    const tableBody = document.getElementById('daily-tasks-table');
    const emptyState = document.getElementById('daily-tasks-empty');

    if (docs.length === 0) {
        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (emptyState) {
             emptyState.innerHTML = createEmptyState('emptyTasks');
             emptyState.classList.remove('hidden');
        }
        return;
    }

    if (tableWrapper) tableWrapper.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    if (tableBody) {
        tableBody.innerHTML = docs.map(d => {
             const t = d;
             const s = t.status;
             const taskCarriedFrom = translations[currentLang]?.taskCarriedFrom || 'с';
             const firstCarryDateStr = (t.first_carry_date || t.originalDate) ? ` (${taskCarriedFrom} ${formatISODateForDisplay(t.first_carry_date || t.originalDate)})` : '';

             return `
            <tr class="md:border-b-0 ${t.carriedOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''} dark:border-gray-700">
                <td data-label="${translations[currentLang].name}" class="${s === translations.ru.statusDone ? 'line-through text-gray-500' : ''}">
                    ${t.name}${firstCarryDateStr}
                </td>
                <td data-label="${translations[currentLang].date}">${formatISODateForDisplay(t.date, { year: undefined })}</td>
                <td data-label="${translations[currentLang].status}">${createTaskStatusDropdown(t.id, s, 'dailyTasks')}</td>
                <td data-label="${translations[currentLang].notes}">
                    <input type="text" class="editable-task-notes bg-transparent w-full p-1 border-b border-transparent focus:border-blue-500 outline-none" data-id="${t.id}" data-col="dailyTasks" value="${t.notes || ''}" placeholder="${translations[currentLang].placeholderComment}">
                </td>
                <td data-label="${translations[currentLang].actions}" class="flex gap-2">
                    <button data-id="${t.id}" class="edit-daily-task-btn text-blue-600 hover:text-blue-800">✏️</button>
                    <button data-id="${t.id}" class="delete-daily-task-btn text-red-600 hover:text-red-800">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }
}

export function renderMonthlyTasks(docs) {
    const tableWrapper = document.getElementById('monthly-tasks-table-wrapper');
    const tableBody = document.getElementById('monthly-tasks-table');
    const emptyState = document.getElementById('monthly-tasks-empty');

    if (docs.length === 0) {
        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (emptyState) {
             emptyState.innerHTML = createEmptyState('emptyTasks');
             emptyState.classList.remove('hidden');
        }
        return;
    }

    if (tableWrapper) tableWrapper.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    const sortedDocs = [...docs].sort((a, b) => {
         const deadlineA = a.deadline || '';
         const deadlineB = b.deadline || '';
         return deadlineA.localeCompare ? deadlineA.localeCompare(deadlineB) : deadlineA > deadlineB ? 1 : -1;
    });

    if (tableBody) {
        tableBody.innerHTML = sortedDocs.map(d => {
             const t = d, id = d.id;
             const s = t.status;
             return `
            <tr class="md:border-b-0 ${t.carriedOver ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''} dark:border-gray-700">
                <td data-label="${translations[currentLang].name}" class="${s === translations.ru.statusDone ? 'line-through text-gray-500' : ''}">${t.name}</td>
                <td data-label="${translations[currentLang].deadline}">${formatISODateForDisplay(t.deadline)}</td>
                <td data-label="${translations[currentLang].status}">${createTaskStatusDropdown(id, s, 'monthlyTasks')}</td>
                <td data-label="${translations[currentLang].actions}" class="flex gap-2">
                    ${!t.recurringExpenseId && !t.fromCalendar ?
                     `<button data-id="${id}" class="edit-monthly-task-btn text-blue-600 hover:text-blue-800">✏️</button>
                         <button data-id="${id}" class="delete-monthly-task-btn text-red-600 hover:text-red-800">🗑️</button>` : ''}
                </td>
            </tr>`;
        }).join('');
    }
}

export function renderYearlyTasks(docs) {
    const tableWrapper = document.getElementById('yearly-tasks-table-wrapper');
    const tableBody = document.getElementById('yearly-tasks-table');
    const emptyState = document.getElementById('yearly-tasks-empty');

    if (docs.length === 0) {
        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (emptyState) {
             emptyState.innerHTML = createEmptyState('emptyTasks');
             emptyState.classList.remove('hidden');
        }
        return;
    }

    if (tableWrapper) tableWrapper.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    if (tableBody) {
        tableBody.innerHTML = docs.map(d => {
             const t = d, id = d.id;
             const s = t.status;
             return `
            <tr class="md:border-b-0 dark:border-gray-700">
                <td data-label="${translations[currentLang].name}" class="${s === translations.ru.statusDone ? 'line-through text-gray-500' : ''}">${t.name}</td>
                <td data-label="${translations[currentLang].deadline}">${formatISODateForDisplay(t.deadline, { year: 'numeric' })}</td>
                <td data-label="${translations[currentLang].status}">${createTaskStatusDropdown(id, s, 'yearlyTasks')}</td>
                <td data-label="${translations[currentLang].notes}">
                    <input type="text" class="editable-task-notes bg-transparent w-full p-1 border-b border-transparent focus:border-blue-500 outline-none" data-id="${id}" data-col="yearlyTasks" value="${t.notes || ''}" placeholder="${translations[currentLang].placeholderComment}">
                </td>
                <td data-label="${translations[currentLang].actions}" class="flex gap-2">
                    <button data-id="${id}" class="edit-yearly-task-btn text-blue-600 hover:text-blue-800">✏️</button>
                    <button data-id="${id}" class="delete-yearly-task-btn text-red-600 hover:text-red-800">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }
}

