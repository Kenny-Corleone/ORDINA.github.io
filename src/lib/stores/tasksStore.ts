import { writable, derived } from 'svelte/store';
import type { DailyTask, MonthlyTask, YearlyTask } from '../types';

interface TasksStore {
  dailyTasks: DailyTask[];
  monthlyTasks: MonthlyTask[];
  yearlyTasks: YearlyTask[];
  currentDailyDate: string;
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Load selected daily date from localStorage or default to today
function loadCurrentDailyDate(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('selectedDailyDate');
    if (saved) {
      return saved;
    }
  }
  return getTodayISOString();
}

const initialState: TasksStore = {
  dailyTasks: [],
  monthlyTasks: [],
  yearlyTasks: [],
  currentDailyDate: loadCurrentDailyDate(),
};

function createTasksStore() {
  const { subscribe, set, update } = writable<TasksStore>(initialState);

  return {
    subscribe,
    
    // Daily tasks management
    setDailyTasks: (tasks: DailyTask[]) => {
      update(state => ({ ...state, dailyTasks: tasks }));
    },
    addDailyTask: (task: DailyTask) => {
      update(state => ({ ...state, dailyTasks: [...state.dailyTasks, task] }));
    },
    updateDailyTask: (taskId: string, updates: Partial<DailyTask>) => {
      update(state => ({
        ...state,
        dailyTasks: state.dailyTasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      }));
    },
    removeDailyTask: (taskId: string) => {
      update(state => ({
        ...state,
        dailyTasks: state.dailyTasks.filter(t => t.id !== taskId),
      }));
    },
    
    // Monthly tasks management
    setMonthlyTasks: (tasks: MonthlyTask[]) => {
      update(state => ({ ...state, monthlyTasks: tasks }));
    },
    addMonthlyTask: (task: MonthlyTask) => {
      update(state => ({ ...state, monthlyTasks: [...state.monthlyTasks, task] }));
    },
    updateMonthlyTask: (taskId: string, updates: Partial<MonthlyTask>) => {
      update(state => ({
        ...state,
        monthlyTasks: state.monthlyTasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      }));
    },
    removeMonthlyTask: (taskId: string) => {
      update(state => ({
        ...state,
        monthlyTasks: state.monthlyTasks.filter(t => t.id !== taskId),
      }));
    },
    
    // Yearly tasks management
    setYearlyTasks: (tasks: YearlyTask[]) => {
      update(state => ({ ...state, yearlyTasks: tasks }));
    },
    addYearlyTask: (task: YearlyTask) => {
      update(state => ({ ...state, yearlyTasks: [...state.yearlyTasks, task] }));
    },
    updateYearlyTask: (taskId: string, updates: Partial<YearlyTask>) => {
      update(state => ({
        ...state,
        yearlyTasks: state.yearlyTasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      }));
    },
    removeYearlyTask: (taskId: string) => {
      update(state => ({
        ...state,
        yearlyTasks: state.yearlyTasks.filter(t => t.id !== taskId),
      }));
    },
    
    // Current daily date management
    setCurrentDailyDate: (date: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedDailyDate', date);
      }
      update(state => ({ ...state, currentDailyDate: date }));
    },
    
    // Reset all data
    reset: () => {
      set({
        ...initialState,
        currentDailyDate: loadCurrentDailyDate(),
      });
    },
  };
}

export const tasksStore = createTasksStore();

// Derived stores for filtered tasks
export const dailyTasksForCurrentDate = derived(
  tasksStore,
  $tasks => $tasks.dailyTasks.filter(task => task.date === $tasks.currentDailyDate)
);

export const incompleteDailyTasks = derived(
  tasksStore,
  $tasks => $tasks.dailyTasks.filter(task => task.status === 'Не выполнено')
);

export const incompleteMonthlyTasks = derived(
  tasksStore,
  $tasks => $tasks.monthlyTasks.filter(task => task.status === 'Не выполнено')
);

export const incompleteYearlyTasks = derived(
  tasksStore,
  $tasks => $tasks.yearlyTasks.filter(task => task.status === 'Не выполнено')
);

export const completedDailyTasks = derived(
  tasksStore,
  $tasks => $tasks.dailyTasks.filter(task => task.status === 'Выполнено')
);

export const completedMonthlyTasks = derived(
  tasksStore,
  $tasks => $tasks.monthlyTasks.filter(task => task.status === 'Выполнено')
);

export const completedYearlyTasks = derived(
  tasksStore,
  $tasks => $tasks.yearlyTasks.filter(task => task.status === 'Выполнено')
);
