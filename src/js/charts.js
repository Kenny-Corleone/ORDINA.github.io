// ============================================================================
// CHARTS MODULE
// ============================================================================

import { logger } from './utils.js';

let charts = {};

/**
 * Create expense trend chart (line chart)
 */
export function createExpenseTrendChart(canvasId, expensesData, currency, exchangeRate) {
    if (typeof Chart === 'undefined') {
        logger.warn('Chart.js not loaded');
        return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Destroy existing chart
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    // Group expenses by date
    const expensesByDate = {};
    expensesData.forEach(expense => {
        const date = expense.date || expense.data()?.date;
        if (date) {
            const dateKey = date.slice(0, 7); // YYYY-MM
            if (!expensesByDate[dateKey]) {
                expensesByDate[dateKey] = 0;
            }
            const amount = expense.amount || expense.data()?.amount || 0;
            expensesByDate[dateKey] += currency === 'USD' ? amount / exchangeRate : amount;
        }
    });

    // Sort dates
    const sortedDates = Object.keys(expensesByDate).sort();
    const labels = sortedDates.map(d => {
        const [year, month] = d.split('-');
        return `${month}/${year}`;
    });
    const data = sortedDates.map(d => expensesByDate[d]);

    const ctx = canvas.getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    return charts[canvasId];
}

/**
 * Create category pie chart
 */
export function createCategoryPieChart(canvasId, expensesData, currency, exchangeRate) {
    if (typeof Chart === 'undefined') {
        logger.warn('Chart.js not loaded');
        return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Destroy existing chart
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    // Group by category
    const expensesByCategory = {};
    expensesData.forEach(expense => {
        const category = expense.category || expense.data()?.category || 'Other';
        const amount = expense.amount || expense.data()?.amount || 0;
        expensesByCategory[category] = (expensesByCategory[category] || 0) + 
            (currency === 'USD' ? amount / exchangeRate : amount);
    });

    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);

    const colors = [
        'rgba(99, 102, 241, 0.7)',   // indigo
        'rgba(239, 68, 68, 0.7)',     // red
        'rgba(245, 158, 11, 0.7)',    // amber
        'rgba(16, 185, 129, 0.7)',   // emerald
        'rgba(139, 92, 246, 0.7)',    // violet
        'rgba(236, 72, 153, 0.7)',    // pink
        'rgba(107, 114, 128, 0.7)'    // gray
    ];

    const ctx = canvas.getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        }
    });

    return charts[canvasId];
}

/**
 * Destroy all charts
 */
export function destroyAllCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
}

/**
 * Destroy specific chart
 */
export function destroyChart(canvasId) {
    if (charts[canvasId]) {
        charts[canvasId].destroy();
        delete charts[canvasId];
    }
}
