// ═══════════════════════════════════════════════════════════════════════════
// 💰 МОДУЛЬ РАСХОДОВ
// ═══════════════════════════════════════════════════════════════════════════

import { db } from '../app.js';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showToast, showConfirmModal, formatCurrency, formatISODateForDisplay } from '../utils.js';

export function initExpenses() {
    setupExpensesControls();
    renderExpenses();
}

function setupExpensesControls() {
    const addBtn = document.getElementById('add-expense-btn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddExpenseModal);
    }
}

export function renderExpenses() {
    const app = window.ordinaApp;
    const t = app.translations[app.currentLang];
    const container = document.getElementById('expenses-list');
    if (!container) return;
    
    const monthExpenses = app.allExpenses.filter(e => e.monthId === app.selectedMonthId);
    
    if (monthExpenses.length === 0) {
        container.innerHTML = `<div class="text-center p-8 opacity-60">${t.emptyExpenses}</div>`;
        return;
    }
    
    // Сортировка по дате (новые сверху)
    monthExpenses.sort((a, b) => b.date.localeCompare(a.date));
    
    container.innerHTML = monthExpenses.map(expense => `
        <div class="premium-card p-4 mb-3 flex justify-between items-center">
            <div class="flex-1">
                <div class="font-bold">${expense.category}</div>
                <div class="text-sm opacity-70">${formatISODateForDisplay(expense.date)}</div>
                ${expense.comment ? `
                    <div class="text-sm opacity-60 mt-1">${expense.comment}</div>
                ` : ''}
            </div>
            <div class="flex items-center gap-3">
                <div class="font-bold text-lg">${formatCurrency(expense.amount)}</div>
                <div class="flex gap-2">
                    <button onclick="window.editExpense('${expense.id}')" 
                            class="icon-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.deleteExpense('${expense.id}')" 
                            class="icon-btn text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openAddExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (modal) {
        modal.showModal();
    }
}

window.editExpense = async (expenseId) => {
    // Реализация редактирования
};

window.deleteExpense = async (expenseId) => {
    const confirmed = await showConfirmModal('Удалить этот расход?');
    if (!confirmed) return;
    
    try {
        await deleteDoc(doc(db, `users/${window.ordinaApp.userId}/expenses`, expenseId));
        showToast('Расход удален', 'success');
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
};
