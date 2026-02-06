import { writable, derived } from 'svelte/store';
import { Currency } from '../types';
import type { Debt, Expense, RecurringExpense, Category } from '../types';

interface FinanceStore {
  currentMonthId: string;
  selectedMonthId: string;
  currency: Currency;
  exchangeRate: number;
  debts: Debt[];
  expenses: Expense[];
  recurringTemplates: RecurringExpense[];
  recurringStatuses: Record<string, string>;
  categories: Category[];
  availableMonths: string[];
}

// Helper to get current month ID in YYYY-MM format
function getCurrentMonthId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Load currency from localStorage or default to AZN
function loadCurrency(): Currency {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('currency');
    if (saved === Currency.AZN || saved === Currency.USD) {
      return saved as Currency;
    }
  }
  return Currency.AZN;
}

// Load exchange rate from localStorage or default to 1.7
function loadExchangeRate(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('exchangeRate');
    if (saved) {
      const rate = parseFloat(saved);
      if (!isNaN(rate) && rate > 0) {
        return rate;
      }
    }
  }
  return 1.7;
}

const initialState: FinanceStore = {
  currentMonthId: getCurrentMonthId(),
  selectedMonthId: getCurrentMonthId(),
  currency: loadCurrency(),
  exchangeRate: loadExchangeRate(),
  debts: [],
  expenses: [],
  recurringTemplates: [],
  recurringStatuses: {},
  categories: [],
  availableMonths: [],
};

function createFinanceStore() {
  const { subscribe, set, update } = writable<FinanceStore>(initialState);

  return {
    subscribe,
    
    // Month management
    setCurrentMonthId: (monthId: string) => {
      update(state => ({ ...state, currentMonthId: monthId }));
    },
    setSelectedMonthId: (monthId: string) => {
      update(state => ({ ...state, selectedMonthId: monthId }));
    },
    setAvailableMonths: (months: string[]) => {
      update(state => ({ ...state, availableMonths: months }));
    },
    
    // Currency management
    setCurrency: (currency: Currency) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('currency', currency);
      }
      update(state => ({ ...state, currency }));
    },
    setExchangeRate: (rate: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('exchangeRate', String(rate));
      }
      update(state => ({ ...state, exchangeRate: rate }));
    },
    
    // Debts management
    setDebts: (debts: Debt[]) => {
      update(state => ({ ...state, debts }));
    },
    addDebt: (debt: Debt) => {
      update(state => ({ ...state, debts: [...state.debts, debt] }));
    },
    updateDebt: (debtId: string, updates: Partial<Debt>) => {
      update(state => ({
        ...state,
        debts: state.debts.map(d => d.id === debtId ? { ...d, ...updates } : d),
      }));
    },
    removeDebt: (debtId: string) => {
      update(state => ({
        ...state,
        debts: state.debts.filter(d => d.id !== debtId),
      }));
    },
    
    // Expenses management
    setExpenses: (expenses: Expense[]) => {
      update(state => ({ ...state, expenses }));
    },
    addExpense: (expense: Expense) => {
      update(state => ({ ...state, expenses: [...state.expenses, expense] }));
    },
    updateExpense: (expenseId: string, updates: Partial<Expense>) => {
      update(state => ({
        ...state,
        expenses: state.expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e),
      }));
    },
    removeExpense: (expenseId: string) => {
      update(state => ({
        ...state,
        expenses: state.expenses.filter(e => e.id !== expenseId),
      }));
    },
    
    // Recurring expenses management
    setRecurringTemplates: (templates: RecurringExpense[]) => {
      update(state => ({ ...state, recurringTemplates: templates }));
    },
    addRecurringTemplate: (template: RecurringExpense) => {
      update(state => ({ ...state, recurringTemplates: [...state.recurringTemplates, template] }));
    },
    updateRecurringTemplate: (templateId: string, updates: Partial<RecurringExpense>) => {
      update(state => ({
        ...state,
        recurringTemplates: state.recurringTemplates.map(t => 
          t.id === templateId ? { ...t, ...updates } : t
        ),
      }));
    },
    removeRecurringTemplate: (templateId: string) => {
      update(state => ({
        ...state,
        recurringTemplates: state.recurringTemplates.filter(t => t.id !== templateId),
      }));
    },
    
    // Recurring statuses management
    setRecurringStatuses: (statuses: Record<string, string>) => {
      update(state => ({ ...state, recurringStatuses: statuses }));
    },
    updateRecurringStatus: (templateId: string, status: string) => {
      update(state => ({
        ...state,
        recurringStatuses: { ...state.recurringStatuses, [templateId]: status },
      }));
    },
    
    // Categories management
    setCategories: (categories: Category[]) => {
      update(state => ({ ...state, categories }));
    },
    addCategory: (category: Category) => {
      update(state => ({ ...state, categories: [...state.categories, category] }));
    },
    updateCategory: (categoryId: string, updates: Partial<Category>) => {
      update(state => ({
        ...state,
        categories: state.categories.map(c => c.id === categoryId ? { ...c, ...updates } : c),
      }));
    },
    removeCategory: (categoryId: string) => {
      update(state => ({
        ...state,
        categories: state.categories.filter(c => c.id !== categoryId),
      }));
    },
    
    // Reset all data
    reset: () => {
      set({
        ...initialState,
        currentMonthId: getCurrentMonthId(),
        selectedMonthId: getCurrentMonthId(),
        currency: loadCurrency(),
        exchangeRate: loadExchangeRate(),
      });
    },
  };
}

export const financeStore = createFinanceStore();

// Derived stores for computed values
export const totalExpenses = derived(
  financeStore,
  $finance => $finance.expenses.reduce((sum, expense) => sum + expense.amount, 0)
);

export const totalDebts = derived(
  financeStore,
  $finance => $finance.debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
);

export const totalPaidDebts = derived(
  financeStore,
  $finance => $finance.debts.reduce((sum, debt) => sum + debt.paidAmount, 0)
);

export const remainingDebts = derived(
  financeStore,
  $finance => $finance.debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.paidAmount), 0)
);
