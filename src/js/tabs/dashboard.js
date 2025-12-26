import { translations, currentLang } from '../i18n.js';

// Utility functions (will be passed from app.js)
let formatCurrency;

export function initDashboardModule(utils) {
    formatCurrency = utils.formatCurrency;
}

export function renderDashboardTasks(dailyTasks) {
    const list = document.getElementById('dashboard-tasks-list-top');
    if (!list) return;

    const activeTasks = dailyTasks.filter(t => t.status !== translations.ru.statusDone);

    if (activeTasks.length === 0) {
        list.innerHTML = `<div class="text-gray-400 text-center py-1 text-[10px]">${translations[currentLang]?.noTasks || 'No tasks'}</div>`;
        return;
    }

    list.innerHTML = activeTasks.slice(0, 5).map(t => `
       <div class="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onclick="document.querySelector('[data-tab=\\'tasks\\']').click()">
           <span class="truncate pr-2 text-xs">${t.name}</span>
           <span class="text-[9px] px-1 bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200">Today</span>
       </div>
   `).join('');
}

export function updateDashboard(allRecurringTemplates, currentMonthStatuses, allExpenses, allDebts, monthlyTasks, yearlyTasks, expensesChart, renderChart, updateRecentActivity, updateDashboardClock, renderDashboardTasks, dailyTasks) {
    const dashboardContent = document.getElementById('dashboard-content');
    const dashboardLoading = document.getElementById('dashboard-loading');
    const loadingOverlay = document.getElementById('loading-overlay');
    const appElement = document.getElementById('app');

    if (appElement) appElement.classList.remove('opacity-0');
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    if (dashboardLoading) dashboardLoading.classList.add('hidden');
    if (dashboardContent) dashboardContent.classList.remove('hidden');

    const totalRecurringPaid = allRecurringTemplates.filter(t => currentMonthStatuses[t.id] === translations.ru.paidStatus).reduce((s, t) => s + (t.amount || 0), 0);
    const totalRecurringRemaining = allRecurringTemplates.filter(t => (currentMonthStatuses[t.id] || translations.ru.unpaidStatus) === translations.ru.unpaidStatus).reduce((s, t) => s + (t.amount || 0), 0);
    const allMonthlyExpensesTotal = allExpenses.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    const totalDebtRemaining = allDebts.reduce((s, d) => s + ((d.data().totalAmount || 0) - (d.data().paidAmount || 0)), 0);

    const elPaid = document.getElementById('total-recurring-paid');
    const elRemaining = document.getElementById('total-recurring-remaining');
    const elOutflow = document.getElementById('total-monthly-outflow');
    const elDebt = document.getElementById('total-debt-remaining');
    const elTasksMonth = document.getElementById('tasks-remaining-month');
    const elTasksYear = document.getElementById('tasks-remaining-year');

    if (elPaid) elPaid.textContent = formatCurrency(totalRecurringPaid);
    if (elRemaining) elRemaining.textContent = formatCurrency(totalRecurringRemaining);
    if (elOutflow) elOutflow.textContent = formatCurrency(allMonthlyExpensesTotal);
    if (elDebt) elDebt.textContent = formatCurrency(totalDebtRemaining);
    if (elTasksMonth) elTasksMonth.textContent = monthlyTasks.filter(t => t.status === translations.ru.statusNotDone).length;
    if (elTasksYear) elTasksYear.textContent = yearlyTasks.filter(t => t.status === translations.ru.statusNotDone).length;

    if (renderChart) renderChart();
    if (updateRecentActivity) updateRecentActivity();
    if (updateDashboardClock) updateDashboardClock();
    if (renderDashboardTasks && dailyTasks) renderDashboardTasks(dailyTasks);
}

