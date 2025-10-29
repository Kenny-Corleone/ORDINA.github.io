/**
 * Dashboard Controller
 * Бизнес-логика модуля дашборда
 */

import { DashboardTemplate } from './dashboard.template.js';

export class DashboardController {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.stats = null;
    this.chart = null;
  }

  /**
   * Инициализация контроллера
   */
  async init() {
    this.container = document.getElementById('dashboard-content');
    if (!this.container) {
      console.error('Dashboard container not found');
      return;
    }

    await this.fetchData();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Загрузка данных
   */
  async fetchData() {
    const firestoreService = this.app.getService('firestore');
    const userId = this.app.state.user?.uid;
    const monthId = this.app.state.currentMonth;

    if (!userId || !monthId) {
      console.warn('User or month not selected');
      return;
    }

    try {
      // Загружаем все необходимые данные
      const [
        expenses,
        debts,
        monthlyTasks,
        yearlyTasks,
        recurringTemplates,
        monthStatuses
      ] = await Promise.all([
        firestoreService.getExpenses(userId, monthId),
        firestoreService.getDebts(userId),
        firestoreService.getTasks(userId, 'monthly', monthId),
        firestoreService.getTasks(userId, 'yearly'),
        firestoreService.getRecurringTemplates(userId),
        firestoreService.getMonthStatuses(userId, monthId)
      ]);

      const tasks = [...monthlyTasks, ...yearlyTasks];

      // Рассчитываем статистику
      this.stats = this.calculateStats({
        expenses,
        debts,
        tasks,
        recurringTemplates,
        monthStatuses,
        monthId
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      this.stats = this.getEmptyStats();
    }
  }

  /**
   * Расчет статистики
   */
  calculateStats(data) {
    const { expenses, debts, tasks, recurringTemplates, monthStatuses, monthId } = data;

    // Оплаченные регулярные платежи
    const recurringPaid = recurringTemplates
      .filter(t => monthStatuses[t.id]?.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    // Неоплаченные регулярные платежи
    const recurringRemaining = recurringTemplates
      .filter(t => monthStatuses[t.id]?.status !== 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    // Месячные расходы
    const monthlyExpenses = expenses
      .filter(e => e.monthId === monthId)
      .reduce((sum, e) => sum + e.amount, 0);

    // Общий долг
    const totalDebt = debts
      .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

    // Оставшиеся месячные задачи
    const monthlyTasksRemaining = tasks
      .filter(t => t.type === 'monthly' && !t.done && t.monthId === monthId)
      .length;

    // Оставшиеся годовые задачи
    const yearlyTasksRemaining = tasks
      .filter(t => t.type === 'yearly' && !t.done)
      .length;

    // Данные для графика - группировка по категориям
    const categoryTotals = {};
    expenses
      .filter(e => e.monthId === monthId)
      .forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

    return {
      recurringPaid,
      recurringRemaining,
      monthlyExpenses,
      totalDebt,
      monthlyTasksRemaining,
      yearlyTasksRemaining,
      categoryTotals
    };
  }

  /**
   * Получить пустую статистику
   */
  getEmptyStats() {
    return {
      recurringPaid: 0,
      recurringRemaining: 0,
      monthlyExpenses: 0,
      totalDebt: 0,
      monthlyTasksRemaining: 0,
      yearlyTasksRemaining: 0,
      categoryTotals: {}
    };
  }

  /**
   * Рендеринг UI
   */
  render() {
    if (!this.container || !this.stats) return;

    const translations = this.app.state.translations;
    const html = DashboardTemplate.render(this.stats, translations);
    this.container.innerHTML = html;

    // Рендерим график после вставки HTML
    this.renderChart();
  }

  /**
   * Рендеринг графика
   */
  renderChart() {
    const canvas = document.getElementById('expenses-chart');
    if (!canvas) return;

    // Уничтожаем старый график
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const categoryTotals = this.stats.categoryTotals;
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Если нет данных, не создаем график
    if (labels.length === 0) {
      canvas.parentElement.innerHTML = '<p class="text-center opacity-70">Нет данных для отображения</p>';
      return;
    }

    // Создаем новый график
    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#6366f1', '#ec4899', '#f59e0b', '#10b981',
            '#3b82f6', '#a855f7', '#06b6d4', '#ef4444',
            '#8b5cf6', '#14b8a6', '#f97316', '#84cc16'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const currency = window.ordinaApp?.state?.currency || 'AZN';
                return `${label}: ${value.toFixed(2)} ${currency}`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Установка обработчиков событий
   */
  setupEventListeners() {
    // Обработчик изменения месяца
    document.addEventListener('monthChanged', () => {
      this.refresh();
    });

    // Обработчик обновления данных
    document.addEventListener('dataUpdated', () => {
      this.refresh();
    });
  }

  /**
   * Обновление данных
   */
  async refresh() {
    await this.fetchData();
    this.render();
  }

  /**
   * Уничтожение контроллера
   */
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.container = null;
    this.stats = null;
  }
}
