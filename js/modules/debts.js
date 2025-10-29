// ═══════════════════════════════════════════════════════════════════════════
// 💳 МОДУЛЬ ДОЛГОВ
// ═══════════════════════════════════════════════════════════════════════════

import { db } from '../app.js';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    Timestamp 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showToast, showConfirmModal, formatCurrency, formatISODateForDisplay } from '../utils.js';

export function initDebts() {
    setupDebtsControls();
    renderDebts();
}

function setupDebtsControls() {
    const addBtn = document.getElementById('add-debt-btn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddDebtModal);
    }
}

export function renderDebts() {
    const app = window.ordinaApp;
    const t = app.translations[app.currentLang];
    const container = document.getElementById('debts-list');
    if (!container) return;
    
    if (app.allDebts.length === 0) {
        container.innerHTML = `<div class="text-center p-8 opacity-60">${t.emptyDebts}</div>`;
        return;
    }
    
    container.innerHTML = app.allDebts.map(debt => `
        <div class="premium-card p-4 mb-3">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h3 class="font-bold text-lg">${debt.name}</h3>
                    <div class="text-sm opacity-70 mt-1">
                        ${t.lastPaymentDate}: ${formatISODateForDisplay(debt.lastPaymentDate)}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.editDebt('${debt.id}')" 
                            class="icon-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.deleteDebt('${debt.id}')" 
                            class="icon-btn text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-3">
                <div>
                    <div class="text-xs opacity-70">${t.totalAmount}</div>
                    <div class="font-bold">${formatCurrency(debt.totalAmount)}</div>
                </div>
                <div>
                    <div class="text-xs opacity-70">${t.paid}</div>
                    <div class="font-bold text-green-600">${formatCurrency(debt.paidAmount)}</div>
                </div>
                <div>
                    <div class="text-xs opacity-70">${t.remaining}</div>
                    <div class="font-bold text-red-600">${formatCurrency(debt.totalAmount - debt.paidAmount)}</div>
                </div>
            </div>
            
            ${debt.comment ? `
                <div class="text-sm opacity-70 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    ${debt.comment}
                </div>
            ` : ''}
            
            <button onclick="window.addDebtPayment('${debt.id}')" 
                    class="premium-btn w-full mt-3">
                <i class="fas fa-plus mr-2"></i>
                ${t.addDebtPayment}
            </button>
        </div>
    `).join('');
}

function openAddDebtModal() {
    // Реализация модального окна
    const modal = document.getElementById('debt-modal');
    if (modal) {
        modal.showModal();
    }
}

// Экспорт функций для глобального доступа
window.editDebt = async (debtId) => {
    // Реализация редактирования
};

window.deleteDebt = async (debtId) => {
    const confirmed = await showConfirmModal('Удалить этот долг?');
    if (!confirmed) return;
    
    try {
        await deleteDoc(doc(db, `users/${window.ordinaApp.userId}/debts`, debtId));
        showToast('Долг удален', 'success');
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
};

window.addDebtPayment = async (debtId) => {
    // Реализация добавления платежа
};
