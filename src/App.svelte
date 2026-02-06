<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { auth } from './lib/firebase';
  import { onAuthStateChanged, type Unsubscribe as AuthUnsubscribe } from 'firebase/auth';
  import { userStore } from './lib/stores/userStore';
  import { financeStore } from './lib/stores/financeStore';
  import { tasksStore } from './lib/stores/tasksStore';
  import { calendarStore } from './lib/stores/calendarStore';
  import { uiStore } from './lib/stores/uiStore';
  import { createListenerManager } from './lib/services/firebase/listeners';
  import { getTodayISOString, formatMonthId, getCurrentMonthId } from './lib/utils/formatting';
  import { 
    scheduleMidnightRollover, 
    handleVisibilityChange,
    checkForNewDay,
    checkForNewMonth
  } from './lib/services/carryOver';
  import { initResponsiveSystem } from './lib/utils/responsive';
  import { trackComponentLifecycle } from './lib/utils/errorHandler';
  import { logger } from './lib/utils/logger';
  import type { UserProfile } from './lib/types';
  
  // Components
  import AuthContainer from './components/auth/AuthContainer.svelte';
  import AppContainer from './components/layout/AppContainer.svelte';
  import LoadingOverlay from './components/ui/LoadingOverlay.svelte';
  import ErrorBoundary from './components/ui/ErrorBoundary.svelte';

  // State
  let isLoading = true;
  let isAuthenticated = false;
  let authUnsubscribe: AuthUnsubscribe | null = null;
  const listenerManager = createListenerManager();
  let cleanupMidnightRollover: (() => void) | null = null;
  let cleanupResponsiveSystem: (() => void) | null = null;
  let cleanupLifecycleTracking: (() => void) | null = null;
  let currentUserId: string | null = null;
  let previousSelectedMonthId: string | null = null;

  // Subscribe to userStore to track authentication state
  const unsubscribeUserStore = userStore.subscribe(state => {
    isAuthenticated = state.isAuthenticated;
  });

  // Subscribe to financeStore to track month changes
  // This handles the scenario where user selects a different month from the dropdown.
  // We need to detach listeners for the old month and attach listeners for the new month
  // to avoid loading unnecessary data and to keep the UI in sync with the selected month.
  const unsubscribeFinanceStore = financeStore.subscribe(state => {
    // Only handle month changes if user is authenticated and month actually changed
    // We check previousSelectedMonthId !== null to avoid triggering on initial load
    if (currentUserId && previousSelectedMonthId !== null && state.selectedMonthId !== previousSelectedMonthId) {
      logger.debug(`Month changed from ${previousSelectedMonthId} to ${state.selectedMonthId}, reattaching listeners...`);
      
      // Detach old month-specific listeners
      // This prevents memory leaks and stops receiving updates for the old month
      detachMonthListeners();
      
      // Attach new month-specific listeners
      // This starts receiving real-time updates for the new month's data
      attachMonthListeners(currentUserId, state.selectedMonthId);
    }
    
    // Update previous month ID for next comparison
    previousSelectedMonthId = state.selectedMonthId;
  });

  /**
   * Initialize Firebase listeners when user is authenticated
   * 
   * This function sets up real-time Firestore listeners for all user data:
   * - Non-month-specific: debts, recurring templates, categories, calendar events, yearly tasks
   * - Month-specific: expenses, recurring statuses, monthly tasks
   * - Date-specific: daily tasks
   * 
   * Listeners automatically update Svelte stores when Firestore data changes,
   * providing real-time synchronization across devices.
   * 
   * Also initializes the task carry-over system to handle incomplete tasks.
   */
  async function initializeListeners(userId: string) {
    // Store current user ID for carry-over functions
    currentUserId = userId;
    
    // Get current month and date
    const today = getTodayISOString();
    const currentMonthId = getCurrentMonthId();
    const currentYear = new Date().getFullYear();

    // Update stores with current month/date
    financeStore.setCurrentMonthId(currentMonthId);
    financeStore.setSelectedMonthId(currentMonthId);
    tasksStore.setCurrentDailyDate(today);
    
    // Initialize carry-over tracking in localStorage if not present
    // This tracks the last date/month we checked for carry-overs
    // to prevent duplicate carry-overs when app is reopened
    if (!localStorage.getItem('lastCarryOverDate')) {
      localStorage.setItem('lastCarryOverDate', today);
    }
    if (!localStorage.getItem('lastCarryOverMonth')) {
      localStorage.setItem('lastCarryOverMonth', currentMonthId);
    }
    
    // Check for any pending carry-overs (in case app was closed for multiple days)
    // This handles the scenario where user doesn't open the app for several days
    // and we need to carry over tasks from all missed days
    try {
      const lastCheckDate = localStorage.getItem('lastCarryOverDate') || today;
      const lastCheckMonth = localStorage.getItem('lastCarryOverMonth') || currentMonthId;
      
      const newDate = await checkForNewDay(userId, lastCheckDate);
      if (newDate) {
        localStorage.setItem('lastCarryOverDate', newDate);
      }
      
      const newMonth = await checkForNewMonth(userId, lastCheckMonth);
      if (newMonth) {
        localStorage.setItem('lastCarryOverMonth', newMonth);
      }
    } catch (error) {
      console.error('Error checking for pending carry-overs:', error);
    }

    // Attach listeners for debts (not month-specific)
    // Debts persist across months, so we listen to the root debts collection
    listenerManager.attachDebtsListener(userId, (snapshot) => {
      const debts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      financeStore.setDebts(debts as any[]);
    });

    // Attach listeners for recurring expenses templates (not month-specific)
    // Templates define recurring expenses but statuses are tracked per month
    listenerManager.attachRecurringExpensesListener(userId, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      financeStore.setRecurringTemplates(templates as any[]);
    });

    // Attach listeners for categories (not month-specific)
    // Categories are shared across all expenses
    listenerManager.attachCategoriesListener(userId, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      financeStore.setCategories(categories as any[]);
    });

    // Attach listeners for calendar events (not month-specific)
    // Calendar events can span multiple months
    listenerManager.attachCalendarEventsListener(userId, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      calendarStore.setCalendarEvents(events as any[]);
    });

    // Attach listeners for yearly tasks
    // Yearly tasks are associated with a specific year
    listenerManager.attachYearlyTasksListener(userId, currentYear, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      tasksStore.setYearlyTasks(tasks as any[]);
    });

    // Attach listeners for daily tasks (filtered by current date)
    // Only load tasks for the current date to reduce data transfer
    listenerManager.attachDailyTasksListener(userId, today, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      tasksStore.setDailyTasks(tasks as any[]);
    });

    // Attach listeners for month-specific data
    attachMonthListeners(userId, currentMonthId);

    // Attach listener for available months
    // This populates the month selector dropdown with all months that have data
    listenerManager.attachMonthlyDataListener(userId, (snapshot) => {
      const months = snapshot.docs.map(doc => doc.id).sort().reverse();
      financeStore.setAvailableMonths(months);
    });
    
    // Schedule midnight rollover check
    // This sets up a timer to check for day/month changes at midnight
    // and automatically carry over incomplete tasks
    cleanupMidnightRollover = scheduleMidnightRollover(userId, () => {
      console.log('Midnight rollover detected, reloading data...');
      // Reload current month data after rollover
      const newMonthId = getCurrentMonthId();
      financeStore.setCurrentMonthId(newMonthId);
      financeStore.setSelectedMonthId(newMonthId);
    });
  }

  /**
   * Attach listeners for month-specific data
   * 
   * Month-specific data includes:
   * - Expenses: stored per month to organize financial data
   * - Recurring expense statuses: tracks whether recurring expenses were paid this month
   * - Monthly tasks: tasks associated with a specific month
   * 
   * These listeners are detached and reattached when the user navigates to a different month.
   */
  function attachMonthListeners(userId: string, monthId: string) {
    // Mark the start of month-specific listeners
    // This allows us to detach only these listeners when month changes
    // while keeping other listeners (debts, categories, etc.) active
    listenerManager.markMonthListenersStart();
    
    // Attach listener for expenses
    listenerManager.attachExpensesListener(userId, monthId, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      financeStore.setExpenses(expenses as any[]);
    });

    // Attach listener for recurring expense statuses
    listenerManager.attachRecurringExpenseStatusesListener(userId, monthId, (snapshot) => {
      const statuses: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        statuses[doc.id] = doc.data().status || 'pending';
      });
      financeStore.setRecurringStatuses(statuses);
    });

    // Attach listener for monthly tasks
    listenerManager.attachMonthlyTasksListener(userId, monthId, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      tasksStore.setMonthlyTasks(tasks as any[]);
    });
  }

  /**
   * Detach only month-specific listeners
   * 
   * Called when user navigates to a different month.
   * Detaches listeners for the old month's data without affecting
   * non-month-specific listeners (debts, categories, etc.)
   */
  function detachMonthListeners() {
    listenerManager.detachMonthListeners();
  }

  /**
   * Clean up all Firebase listeners and carry-over scheduler
   * 
   * Called when user logs out or component unmounts.
   * Ensures no memory leaks from active listeners.
   */
  function cleanupListeners() {
    listenerManager.detachAll();
    
    // Clean up midnight rollover scheduler
    if (cleanupMidnightRollover) {
      cleanupMidnightRollover();
      cleanupMidnightRollover = null;
    }
  }

  /**
   * Handle authentication state changes
   * 
   * Sets up Firebase auth listener and initializes/cleans up listeners
   * based on authentication state. Also handles:
   * - Responsive system initialization
   * - PWA shortcut URL handling
   * - Visibility change detection for carry-over
   * - Component lifecycle tracking for memory leak detection
   */
  onMount(() => {
    // Track component lifecycle for memory leak detection
    cleanupLifecycleTracking = trackComponentLifecycle('App');
    
    // Initialize particles background (if particles.js loaded)
    if (typeof window !== 'undefined') {
      const particles = (window as any).particlesJS;
      if (typeof particles === 'function') {
        particles('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.2, random: false },
            size: { value: 2, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.15, width: 1 },
            move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out' }
          },
          interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: false }, onclick: { enable: false }, resize: true },
          },
          retina_detect: true,
        });
      }
    }

    // Initialize responsive system
    cleanupResponsiveSystem = initResponsiveSystem();
    
    // Handle PWA shortcut URLs
    handlePWAShortcuts();
    
    // Set up Firebase auth state listener
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
        };
        
        userStore.setUser(user.uid, userProfile);
        
        // Initialize Firebase listeners
        initializeListeners(user.uid);
      } else {
        // User is signed out
        userStore.clearUser();
        
        // Clean up listeners
        cleanupListeners();
        
        // Clear current user ID
        currentUserId = null;
      }
      
      // Hide loading overlay
      isLoading = false;
    });
    
    // Set up visibility change listener for carry-over detection
    // This handles the case where user leaves the app open but switches tabs/apps
    // When they return, we check if a new day/month has started and carry over tasks
    const handleVisibilityChangeEvent = () => {
      if (currentUserId) {
        handleVisibilityChange(currentUserId, () => {
          console.log('Visibility change rollover detected, reloading data...');
          // Reload current month data after rollover
          const newMonthId = getCurrentMonthId();
          financeStore.setCurrentMonthId(newMonthId);
          financeStore.setSelectedMonthId(newMonthId);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChangeEvent);
    
    // Return cleanup function for visibility listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChangeEvent);
    };
  });

  /**
   * Handle PWA shortcut URLs
   * 
   * PWA shortcuts (defined in manifest.webmanifest) can launch the app with
   * specific query parameters (e.g., ?action=add-expense).
   * This function detects these parameters and performs the appropriate action.
   * 
   * Supported actions:
   * - add-expense: Opens the expense modal
   * - add-task: Opens the daily task modal
   * - dashboard: Navigates to the dashboard tab
   */
  function handlePWAShortcuts() {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action) {
      // Wait for authentication before handling shortcuts
      const unsubscribe = userStore.subscribe(state => {
        if (state.isAuthenticated) {
          // Handle the shortcut action
          switch (action) {
            case 'add-expense':
              uiStore.openModal('expense');
              break;
            case 'add-task':
              uiStore.openModal('dailyTask');
              break;
            case 'dashboard':
              uiStore.setActiveTab('dashboard');
              break;
          }
          
          // Clean up URL parameters
          window.history.replaceState({}, '', window.location.pathname);
          
          // Unsubscribe after handling
          unsubscribe();
        }
      });
    }
  }

  /**
   * Clean up on component unmount
   */
  onDestroy(() => {
    // Unsubscribe from auth state changes
    if (authUnsubscribe) {
      authUnsubscribe();
    }
    
    // Unsubscribe from user store
    unsubscribeUserStore();
    
    // Unsubscribe from finance store
    unsubscribeFinanceStore();
    
    // Clean up all Firebase listeners
    cleanupListeners();
    
    // Clean up responsive system
    if (cleanupResponsiveSystem) {
      cleanupResponsiveSystem();
    }
    
    // Clean up lifecycle tracking
    if (cleanupLifecycleTracking) {
      cleanupLifecycleTracking();
    }
  });
</script>

<main>
  
  <ErrorBoundary componentName="App">
    {#if isLoading}
      <LoadingOverlay isVisible={true} />
    {:else if isAuthenticated}
      <div id="main-content" role="main">
        <AppContainer />
      </div>
    {:else}
      <div id="main-content" role="main">
        <AuthContainer />
      </div>
    {/if}
  </ErrorBoundary>
</main>

<style>
  main {
    width: 100%;
    height: 100%;
    min-height: 100vh;
  }
</style>
