import { logger, escapeHtml, escapeHtmlAttr } from '../utils.js';
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
    let selectHTML = `<select data-id="${escapeHtmlAttr(id)}" data-col="${escapeHtmlAttr(colName)}" class="task-status-select p-1 rounded-md border-0 ring-1 ring-inset ring-gray-300 ${options[currentStatus]?.class || ''}">`;
    for (const [value, { text }] of Object.entries(options)) {
         selectHTML += `<option value="${escapeHtmlAttr(value)}" ${currentStatus === value ? 'selected' : ''}>${escapeHtml(text)}</option>`;
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
                <td data-label="${escapeHtmlAttr(translations[currentLang].name)}" class="${s === translations.ru.statusDone ? 'line-through text-gray-500' : ''}">
                    ${escapeHtml(t.name)}${escapeHtml(firstCarryDateStr)}
                </td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].date)}">${escapeHtml(formatISODateForDisplay(t.date, { year: undefined }))}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].status)}">${createTaskStatusDropdown(t.id, s, 'dailyTasks')}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].notes)}">
                    <input type="text" class="editable-task-notes bg-transparent w-full p-1 border-b border-transparent focus:border-blue-500 outline-none" data-id="${escapeHtmlAttr(t.id)}" data-col="dailyTasks" value="${escapeHtmlAttr(t.notes || '')}" placeholder="${escapeHtmlAttr(translations[currentLang].placeholderComment)}">
                </td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].actions)}" class="flex gap-2">
                    <button data-id="${escapeHtmlAttr(t.id)}" class="edit-daily-task-btn text-blue-600 hover:text-blue-800">✏️</button>
                    <button data-id="${escapeHtmlAttr(t.id)}" class="delete-daily-task-btn text-red-600 hover:text-red-800">🗑️</button>
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
                <td data-label="${escapeHtmlAttr(translations[currentLang].name)}" class="${s === translations.ru.statusDone ? 'line-through text-gray-500' : ''}">${escapeHtml(t.name)}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].deadline)}">${escapeHtml(formatISODateForDisplay(t.deadline))}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].status)}">${createTaskStatusDropdown(id, s, 'monthlyTasks')}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].actions)}" class="flex gap-2">
                    ${!t.recurringExpenseId && !t.fromCalendar ?
                     `<button data-id="${escapeHtmlAttr(id)}" class="edit-monthly-task-btn text-blue-600 hover:text-blue-800">✏️</button>
                         <button data-id="${escapeHtmlAttr(id)}" class="delete-monthly-task-btn text-red-600 hover:text-red-800">🗑️</button>` : ''}
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
                <td data-label="${escapeHtmlAttr(translations[currentLang].name)}" class="${s === translations.ru.statusDone ? 'line-through text-gray-500' : ''}">${escapeHtml(t.name)}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].deadline)}">${escapeHtml(formatISODateForDisplay(t.deadline, { year: 'numeric' }))}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].status)}">${createTaskStatusDropdown(id, s, 'yearlyTasks')}</td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].notes)}">
                    <input type="text" class="editable-task-notes bg-transparent w-full p-1 border-b border-transparent focus:border-blue-500 outline-none" data-id="${escapeHtmlAttr(id)}" data-col="yearlyTasks" value="${escapeHtmlAttr(t.notes || '')}" placeholder="${escapeHtmlAttr(translations[currentLang].placeholderComment)}">
                </td>
                <td data-label="${escapeHtmlAttr(translations[currentLang].actions)}" class="flex gap-2">
                    <button data-id="${escapeHtmlAttr(id)}" class="edit-yearly-task-btn text-blue-600 hover:text-blue-800">✏️</button>
                    <button data-id="${escapeHtmlAttr(id)}" class="delete-yearly-task-btn text-red-600 hover:text-red-800">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }
}

