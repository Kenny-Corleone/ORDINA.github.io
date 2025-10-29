// ═══════════════════════════════════════════════════════════════════════════
// ✅ МОДУЛЬ ЗАДАЧ
// ═══════════════════════════════════════════════════════════════════════════

import { db } from '../app.js';
import { collection, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showToast, showConfirmModal, formatISODateForDisplay } from '../utils.js';

export function initTasks() {
    setupTasksControls();
    renderTasks();
}

function setupTasksControls() {
    const addTodayBtn = document.getElementById('add-task-today-btn');
    const addMonthBtn = document.getElementById('add-task-month-btn');
    const addYearBtn = document.getElementById('add-task-year-btn');
    
    if (addTodayBtn) addTodayBtn.addEventListener('click', () => openAddTaskModal('today'));
    if (addMonthBtn) addMonthBtn.addEventListener('click', () => openAddTaskModal('month'));
    if (addYearBtn) addYearBtn.addEventListener('click', () => openAddTaskModal('year'));
}

export function renderTasks() {
    renderDailyTasks();
    renderMonthlyTasks();
    renderYearlyTasks();
}

function renderDailyTasks() {
    const app = window.ordinaApp;
    const t = app.translations[app.currentLang];
    const container = document.getElementById('daily-tasks-list');
    if (!container) return;
    
    if (app.dailyTasks.length === 0) {
        container.innerHTML = `<div class="text-center p-4 opacity-60">${t.emptyTasks}</div>`;
        return;
    }
    
    container.innerHTML = app.dailyTasks.map(task => createTaskHTML(task)).join('');
}

function renderMonthlyTasks() {
    const app = window.ordinaApp;
    const t = app.translations[app.currentLang];
    const container = document.getElementById('monthly-tasks-list');
    if (!container) return;
    
    const monthTasks = app.monthlyTasks.filter(t => t.monthId === app.selectedMonthId);
    
    if (monthTasks.length === 0) {
        container.innerHTML = `<div class="text-center p-4 opacity-60">${t.emptyTasks}</div>`;
        return;
    }
    
    container.innerHTML = monthTasks.map(task => createTaskHTML(task)).join('');
}

function renderYearlyTasks() {
    const app = window.ordinaApp;
    const t = app.translations[app.currentLang];
    const container = document.getElementById('yearly-tasks-list');
    if (!container) return;
    
    if (app.yearlyTasks.length === 0) {
        container.innerHTML = `<div class="text-center p-4 opacity-60">${t.emptyTasks}</div>`;
        return;
    }
    
    container.innerHTML = app.yearlyTasks.map(task => createTaskHTML(task)).join('');
}

function createTaskHTML(task) {
    return `
        <div class="premium-card p-3 mb-2 ${task.done ? 'opacity-50' : ''}">
            <div class="flex items-start gap-3">
                <input type="checkbox" 
                       ${task.done ? 'checked' : ''} 
                       onchange="window.toggleTask('${task.id}', '${task.type}')"
                       class="mt-1 w-5 h-5 cursor-pointer">
                <div class="flex-1">
                    <div class="font-bold ${task.done ? 'line-through' : ''}">${task.name}</div>
                    ${task.notes ? `<div class="text-sm opacity-70 mt-1">${task.notes}</div>` : ''}
                    ${task.deadline ? `<div class="text-xs opacity-60 mt-1">⏰ ${formatISODateForDisplay(task.deadline)}</div>` : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="window.editTask('${task.id}', '${task.type}')" class="icon-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.deleteTask('${task.id}', '${task.type}')" class="icon-btn text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function openAddTaskModal(type) {
    // Реализация модального окна
}

window.toggleTask = async (taskId, type) => {
    // Реализация переключения статуса
};

window.editTask = async (taskId, type) => {
    // Реализация редактирования
};

window.deleteTask = async (taskId, type) => {
    const confirmed = await showConfirmModal('Удалить эту задачу?');
    if (!confirmed) return;
    
    try {
        const collection = type === 'today' ? 'dailyTasks' : type === 'month' ? 'monthlyTasks' : 'yearlyTasks';
        await deleteDoc(doc(db, `users/${window.ordinaApp.userId}/${collection}`, taskId));
        showToast('Задача удалена', 'success');
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
};
