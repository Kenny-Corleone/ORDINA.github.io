// ═══════════════════════════════════════════════════════════════════════════
// 📊 МОДУЛЬ ДАШБОРДА
// ═══════════════════════════════════════════════════════════════════════════

import { formatCurrency } from '../utils.js';

export function initDashboard() {
    renderDashboard();
}

export function renderDashboard() {
    const app = window.ordinaApp;
    if (!app.selectedMonthId) return;
    
    calculateStats();
    renderStatsCards();
    renderExpensesChart();
}

function calculateStats() {
    const app = window.ordinaApp;
    
    // Расчет статистики
    const recurringPaid = app.allRecurringTemplates
        .filter(t => app.currentMonthStatuses[t.id]?.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const recurringRemaining = app.allRecurringTemplates
        .filter(t => app.currentMonthStatuses[t.id]?.status !== 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = app.allExpenses
        .filter(e => e.monthId === app.selectedMonthId)
        .reduce((sum, e) => sum + e.amount, 0);
    
    const totalDebt = app.allDebts
        .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);
    
    const monthlyTasksRemaining = app.monthlyTasks
        .filter(t => !t.done && t.monthId === app.selectedMonthId).length;
    
    const yearlyTasksRemaining = app.yearlyTasks
        .filter(t => !t.done).length;
    
    app.dashboardStats = {
        recurringPaid,
        recurringRemaining,
        monthlyExpenses,
        totalDebt,
        monthlyTasksRemaining,
        yearlyTasksRemaining
    };
}

function renderStatsCards() {
    const app = window.ordinaApp;
    const stats = app.dashboardStats;
    const t = app.translations[app.currentLang];
    
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="text-sm opacity-70 mb-1">${t.dashRecurringPaid}</div>
            <div class="text-2xl font-bold text-green-600">${formatCurrency(stats.recurringPaid)}</div>
        </div>
        <div class="stat-card">
            <div class="text-sm opacity-70 mb-1">${t.dashRecurringRemaining}</div>
            <div class="text-2xl font-bold text-orange-600">${formatCurrency(stats.recurringRemaining)}</div>
        </div>
        <div class="stat-card">
            <div class="text-sm opacity-70 mb-1">${t.dashMonthlyExpenses}</div>
            <div class="text-2xl font-bold text-blue-600">${formatCurrency(stats.monthlyExpenses)}</div>
        </div>
        <div class="stat-card">
            <div class="text-sm opacity-70 mb-1">${t.dashTotalDebt}</div>
            <div class="text-2xl font-bold text-red-600">${formatCurrency(stats.totalDebt)}</div>
        </div>
        <div class="stat-card">
            <div class="text-sm opacity-70 mb-1">${t.dashTasksMonth}</div>
            <div class="text-2xl font-bold text-purple-600">${stats.monthlyTasksRemaining}</div>
        </div>
        <div class="stat-card">
            <div class="text-sm opacity-70 mb-1">${t.dashTasksYear}</div>
            <div class="text-2xl font-bold text-indigo-600">${stats.yearlyTasksRemaining}</div>
        </div>
    `;
}

function renderExpensesChart() {
    const app = window.ordinaApp;
    const canvas = document.getElementById('expenses-chart');
    if (!canvas) return;
    
    // Группировка расходов по категориям
    const categoryTotals = {};
    app.allExpenses
        .filter(e => e.monthId === app.selectedMonthId)
        .forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Уничтожаем старый график
    if (app.expensesChart) {
        app.expensesChart.destroy();
    }
    
    // Создаем новый график
    app.expensesChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#ec4899', '#f59e0b', '#10b981', 
                    '#3b82f6', '#a855f7', '#06b6d4', '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
