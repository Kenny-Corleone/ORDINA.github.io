/**
 * Dashboard Template
 * HTML шаблоны для модуля дашборда
 */

import { formatCurrency } from '../../utils/formatters.js';

export class DashboardTemplate {
  /**
   * Главный шаблон дашборда
   */
  static render(stats, translations) {
    const t = translations || {};
    
    return `
      <div class="dashboard-container">
        ${this.renderStatsCards(stats, t)}
        ${this.renderChartSection(t)}
      </div>
    `;
  }

  /**
   * Карточки статистики
   */
  static renderStatsCards(stats, t) {
    return `
      <div id="dashboard-stats" class="stats-grid">
        ${this.renderStatCard(
          t.dashRecurringPaid || 'Recurring Paid',
          formatCurrency(stats.recurringPaid),
          'text-green-600'
        )}
        ${this.renderStatCard(
          t.dashRecurringRemaining || 'Recurring Remaining',
          formatCurrency(stats.recurringRemaining),
          'text-orange-600'
        )}
        ${this.renderStatCard(
          t.dashMonthlyExpenses || 'Monthly Expenses',
          formatCurrency(stats.monthlyExpenses),
          'text-blue-600'
        )}
        ${this.renderStatCard(
          t.dashTotalDebt || 'Total Debt',
          formatCurrency(stats.totalDebt),
          'text-red-600'
        )}
        ${this.renderStatCard(
          t.dashTasksMonth || 'Tasks This Month',
          stats.monthlyTasksRemaining,
          'text-purple-600'
        )}
        ${this.renderStatCard(
          t.dashTasksYear || 'Tasks This Year',
          stats.yearlyTasksRemaining,
          'text-indigo-600'
        )}
      </div>
    `;
  }

  /**
   * Одна карточка статистики
   */
  static renderStatCard(label, value, colorClass) {
    return `
      <div class="stat-card">
        <div class="text-sm opacity-70 mb-1">${label}</div>
        <div class="text-2xl font-bold ${colorClass}">${value}</div>
      </div>
    `;
  }

  /**
   * Секция с графиком
   */
  static renderChartSection(t) {
    return `
      <div class="chart-section">
        <h3 class="text-lg font-semibold mb-4">
          ${t.dashExpensesByCategory || 'Expenses by Category'}
        </h3>
        <div class="chart-container">
          <canvas id="expenses-chart"></canvas>
        </div>
      </div>
    `;
  }

  /**
   * Скелетон загрузки
   */
  static skeleton() {
    return `
      <div class="dashboard-container">
        <div class="stats-grid">
          ${Array(6).fill(0).map(() => `
            <div class="stat-card skeleton">
              <div class="skeleton-text mb-2"></div>
              <div class="skeleton-text large"></div>
            </div>
          `).join('')}
        </div>
        <div class="chart-section skeleton">
          <div class="skeleton-text mb-4"></div>
          <div class="chart-container skeleton-chart"></div>
        </div>
      </div>
    `;
  }

  /**
   * Сообщение об ошибке
   */
  static error(message) {
    return `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-message">${message || 'Failed to load dashboard data'}</p>
        <button class="btn-retry" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}
