/**
 * Firestore Service
 * Сервис для работы с Firestore базой данных
 * Предоставляет CRUD методы для всех коллекций приложения
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from '../core/firebase.js';

export class FirestoreService {
  constructor(db) {
    if (!db) {
      throw new Error('Firestore instance is required');
    }
    this.db = db;
  }

  // ==================== EXPENSES METHODS ====================

  /**
   * Получить все расходы пользователя за месяц
   * @param {string} userId - ID пользователя
   * @param {string} monthId - ID месяца (формат: YYYY-MM)
   * @returns {Promise<Array>} Массив расходов
   */
  async getExpenses(userId, monthId) {
    try {
      const q = query(
        collection(this.db, `users/${userId}/expenses`),
        where('monthId', '==', monthId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Добавить новый расход
   * @param {string} userId - ID пользователя
   * @param {Object} expense - Данные расхода
   * @returns {Promise<string>} ID созданного документа
   */
  async addExpense(userId, expense) {
    try {
      const expenseData = {
        ...expense,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(
        collection(this.db, `users/${userId}/expenses`),
        expenseData
      );
      console.log('Expense added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Обновить расход
   * @param {string} userId - ID пользователя
   * @param {string} expenseId - ID расхода
   * @param {Object} updates - Обновляемые поля
   * @returns {Promise<void>}
   */
  async updateExpense(userId, expenseId, updates) {
    try {
      await updateDoc(
        doc(this.db, `users/${userId}/expenses`, expenseId),
        updates
      );
      console.log('Expense updated:', expenseId);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Удалить расход
   * @param {string} userId - ID пользователя
   * @param {string} expenseId - ID расхода
   * @returns {Promise<void>}
   */
  async deleteExpense(userId, expenseId) {
    try {
      await deleteDoc(
        doc(this.db, `users/${userId}/expenses`, expenseId)
      );
      console.log('Expense deleted:', expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw this.handleFirestoreError(error);
    }
  }

  // ==================== DEBTS METHODS ====================

  /**
   * Получить все долги пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Массив долгов
   */
  async getDebts(userId) {
    try {
      const q = query(
        collection(this.db, `users/${userId}/debts`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting debts:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Добавить новый долг
   * @param {string} userId - ID пользователя
   * @param {Object} debt - Данные долга
   * @returns {Promise<string>} ID созданного документа
   */
  async addDebt(userId, debt) {
    try {
      const debtData = {
        ...debt,
        paidAmount: debt.paidAmount || 0,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(
        collection(this.db, `users/${userId}/debts`),
        debtData
      );
      console.log('Debt added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding debt:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Обновить долг
   * @param {string} userId - ID пользователя
   * @param {string} debtId - ID долга
   * @param {Object} updates - Обновляемые поля
   * @returns {Promise<void>}
   */
  async updateDebt(userId, debtId, updates) {
    try {
      await updateDoc(
        doc(this.db, `users/${userId}/debts`, debtId),
        updates
      );
      console.log('Debt updated:', debtId);
    } catch (error) {
      console.error('Error updating debt:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Удалить долг
   * @param {string} userId - ID пользователя
   * @param {string} debtId - ID долга
   * @returns {Promise<void>}
   */
  async deleteDebt(userId, debtId) {
    try {
      await deleteDoc(
        doc(this.db, `users/${userId}/debts`, debtId)
      );
      console.log('Debt deleted:', debtId);
    } catch (error) {
      console.error('Error deleting debt:', error);
      throw this.handleFirestoreError(error);
    }
  }

  // ==================== TASKS METHODS ====================

  /**
   * Получить задачи пользователя
   * @param {string} userId - ID пользователя
   * @param {string} type - Тип задач ('daily', 'monthly', 'yearly')
   * @param {string} [monthId] - ID месяца для monthly задач
   * @param {string} [date] - Дата для daily задач
   * @returns {Promise<Array>} Массив задач
   */
  async getTasks(userId, type, monthId = null, date = null) {
    try {
      let q = query(
        collection(this.db, `users/${userId}/tasks`),
        where('type', '==', type)
      );

      if (type === 'monthly' && monthId) {
        q = query(q, where('monthId', '==', monthId));
      }

      if (type === 'daily' && date) {
        q = query(q, where('date', '==', date));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Получить ежедневные задачи
   * @param {string} userId - ID пользователя
   * @param {string} date - Дата (формат: YYYY-MM-DD)
   * @returns {Promise<Array>} Массив задач
   */
  async getDailyTasks(userId, date) {
    return this.getTasks(userId, 'daily', null, date);
  }

  /**
   * Получить месячные задачи
   * @param {string} userId - ID пользователя
   * @param {string} monthId - ID месяца (формат: YYYY-MM)
   * @returns {Promise<Array>} Массив задач
   */
  async getMonthlyTasks(userId, monthId) {
    return this.getTasks(userId, 'monthly', monthId, null);
  }

  /**
   * Получить годовые задачи
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Массив задач
   */
  async getYearlyTasks(userId) {
    return this.getTasks(userId, 'yearly', null, null);
  }

  /**
   * Добавить новую задачу
   * @param {string} userId - ID пользователя
   * @param {string} type - Тип задачи ('daily', 'monthly', 'yearly')
   * @param {Object} taskData - Данные задачи
   * @returns {Promise<string>} ID созданного документа
   */
  async addTask(userId, type, taskData) {
    try {
      const task = {
        ...taskData,
        type,
        done: taskData.done || false,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(
        collection(this.db, `users/${userId}/tasks`),
        task
      );
      console.log('Task added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Обновить задачу
   * @param {string} userId - ID пользователя
   * @param {string} type - Тип задачи (для совместимости)
   * @param {string} taskId - ID задачи
   * @param {Object} updates - Обновляемые поля
   * @returns {Promise<void>}
   */
  async updateTask(userId, type, taskId, updates) {
    try {
      await updateDoc(
        doc(this.db, `users/${userId}/tasks`, taskId),
        updates
      );
      console.log('Task updated:', taskId);
    } catch (error) {
      console.error('Error updating task:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Удалить задачу
   * @param {string} userId - ID пользователя
   * @param {string} type - Тип задачи (для совместимости)
   * @param {string} taskId - ID задачи
   * @returns {Promise<void>}
   */
  async deleteTask(userId, type, taskId) {
    try {
      await deleteDoc(
        doc(this.db, `users/${userId}/tasks`, taskId)
      );
      console.log('Task deleted:', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Переключить статус задачи
   * @param {string} userId - ID пользователя
   * @param {string} taskId - ID задачи
   * @param {boolean} done - Новый статус
   * @returns {Promise<void>}
   */
  async toggleTaskStatus(userId, taskId, done) {
    try {
      await updateDoc(
        doc(this.db, `users/${userId}/tasks`, taskId),
        { done }
      );
    } catch (error) {
      console.error('Error toggling task status:', error);
      throw this.handleFirestoreError(error);
    }
  }

  // ==================== CALENDAR EVENTS METHODS ====================

  /**
   * Получить события календаря за месяц
   * @param {string} userId - ID пользователя
   * @param {string} monthId - ID месяца (формат: YYYY-MM)
   * @returns {Promise<Array>} Массив событий
   */
  async getCalendarEvents(userId, monthId) {
    try {
      const q = query(
        collection(this.db, `users/${userId}/calendar`),
        where('monthId', '==', monthId),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Добавить событие в календарь
   * @param {string} userId - ID пользователя
   * @param {Object} event - Данные события
   * @returns {Promise<string>} ID созданного документа
   */
  async addCalendarEvent(userId, event) {
    try {
      const eventData = {
        ...event,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(
        collection(this.db, `users/${userId}/calendar`),
        eventData
      );
      console.log('Calendar event added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Обновить событие календаря
   * @param {string} userId - ID пользователя
   * @param {string} eventId - ID события
   * @param {Object} updates - Обновляемые поля
   * @returns {Promise<void>}
   */
  async updateCalendarEvent(userId, eventId, updates) {
    try {
      await updateDoc(
        doc(this.db, `users/${userId}/calendar`, eventId),
        updates
      );
      console.log('Calendar event updated:', eventId);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Удалить событие календаря
   * @param {string} userId - ID пользователя
   * @param {string} eventId - ID события
   * @returns {Promise<void>}
   */
  async deleteCalendarEvent(userId, eventId) {
    try {
      await deleteDoc(
        doc(this.db, `users/${userId}/calendar`, eventId)
      );
      console.log('Calendar event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw this.handleFirestoreError(error);
    }
  }

  // ==================== RECURRING TEMPLATES METHODS ====================

  /**
   * Получить шаблоны регулярных платежей
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Массив шаблонов
   */
  async getRecurringTemplates(userId) {
    try {
      const q = query(
        collection(this.db, `users/${userId}/recurringTemplates`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting recurring templates:', error);
      return []; // Возвращаем пустой массив если коллекция не существует
    }
  }

  /**
   * Получить статусы месяца для регулярных платежей
   * @param {string} userId - ID пользователя
   * @param {string} monthId - ID месяца (формат: YYYY-MM)
   * @returns {Promise<Object>} Объект со статусами {templateId: {status: 'paid'|'unpaid'}}
   */
  async getMonthStatuses(userId, monthId) {
    try {
      const docRef = doc(this.db, `users/${userId}/monthStatuses`, monthId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {};
    } catch (error) {
      console.error('Error getting month statuses:', error);
      return {};
    }
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Обработка ошибок Firestore
   * @param {Error} error - Ошибка Firestore
   * @returns {Error} Обработанная ошибка с понятным сообщением
   */
  handleFirestoreError(error) {
    const errorMessages = {
      'permission-denied': 'Недостаточно прав для выполнения операции',
      'not-found': 'Документ не найден',
      'already-exists': 'Документ уже существует',
      'failed-precondition': 'Операция не может быть выполнена',
      'aborted': 'Операция прервана',
      'out-of-range': 'Значение вне допустимого диапазона',
      'unimplemented': 'Операция не реализована',
      'internal': 'Внутренняя ошибка сервера',
      'unavailable': 'Сервис временно недоступен',
      'data-loss': 'Потеря данных',
      'unauthenticated': 'Требуется аутентификация'
    };

    const message = errorMessages[error.code] || error.message || 'Неизвестная ошибка Firestore';
    const handledError = new Error(message);
    handledError.originalError = error;
    handledError.code = error.code;
    
    return handledError;
  }
}
