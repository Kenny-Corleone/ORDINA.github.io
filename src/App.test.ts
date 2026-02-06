import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import App from './App.svelte';
import { userStore } from './lib/stores/userStore';
import { auth } from './lib/firebase';

// Mock Firebase auth
vi.mock('./lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user initially
    setTimeout(() => callback(null), 0);
    return vi.fn(); // Return unsubscribe function
  }),
}));

// Mock listener manager
vi.mock('./lib/services/firebase/listeners', () => ({
  createListenerManager: vi.fn(() => ({
    attachDebtsListener: vi.fn(),
    attachExpensesListener: vi.fn(),
    attachRecurringExpensesListener: vi.fn(),
    attachRecurringExpenseStatusesListener: vi.fn(),
    attachDailyTasksListener: vi.fn(),
    attachMonthlyTasksListener: vi.fn(),
    attachYearlyTasksListener: vi.fn(),
    attachCalendarEventsListener: vi.fn(),
    attachCategoriesListener: vi.fn(),
    attachMonthlyDataListener: vi.fn(),
    detachAll: vi.fn(),
    getActiveListenerCount: vi.fn(() => 0),
  })),
}));

describe('App.svelte', () => {
  beforeEach(() => {
    // Reset user store before each test
    userStore.clearUser();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading overlay initially', () => {
    const { container } = render(App);
    
    // Check if loading overlay is present
    const loadingOverlay = container.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeTruthy();
  });

  it('should initialize with correct user store state', () => {
    const state = get(userStore);
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBe(null);
    expect(state.userProfile).toBe(null);
  });

  it('should have proper component structure', () => {
    const { container } = render(App);
    
    // Check if main element exists
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
  });
});
