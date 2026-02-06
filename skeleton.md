Architecture Overview
---------------------

- Tech stack:
  - Frontend: Svelte 4, Tailwind CSS, PostCSS
  - State management: Svelte stores (uiStore, userStore, financeStore, calendarStore, tasksStore)
  - Routing: Page-level routing via tab navigation within AppContainer; no explicit URL routing in this app
  - Backend: Firebase for auth; REST/RSS news via CORS proxies; localStorage for caching
  - Tests: Vitest (unit), Playwright (e2e)

- Core project structure:
  - src/
    - App.svelte – App bootstrap and auth handling, mounts AppContainer or Auth flow
    - main.ts – app bootstrap
    - components/
      - layout/
        - AppContainer.svelte – Top-level layout; header, content wrapper, modal system
        - Header.svelte – Header with widgets (weather, clock, radio, etc.) and tab navigation
        - MainContent.svelte – Renders the active tab content
        - Sidebar.svelte – Mobile sidebar (unused in non-mobile layouts)
      - dashboard/, expenses/, debts/, recurring/, tasks/, calendar/ – tab content modules
      - modals/ – modal system
      - ui/ – UI components
    - lib/
      - stores/ – Svelte stores
      - services/ – external integrations (firebase listeners, weather, news, radio)
      - types/ – TypeScript types
      - i18n/ – localization
    - styles/ – global styles and responsive rules

- Routing and navigation:
  - All content is routed via a single-page application approach using a header tab bar. Each tab corresponds to a view (dashboard, expenses, debts, recurring, tasks, calendar). The current tab is tracked by uiStore.activeTab and MainContent renders corresponding tab component.

- Data flow:
  - Firebase authentication triggers initializeListeners to attach Firestore listeners (depts, categories, calendar events, yearly/daily tasks, etc.).
  - Finance data (expenses, debts, monthly data) are stored in financeStore; month changes trigger reattachment of month-scoped listeners.
  - News widget uses fetchNews from lib/services/news and caches results in localStorage; it supports category and search filters.

- Key interactions:
  - UI actions flow through uiStore (openModal, setActiveTab, toggleTheme, etc.).
  - Weather updates, radio metadata, and clock run in Header.svelte with periodic refresh.

- Dependencies:
  - Firebase for auth
  - localStorage for caching
  - News RSS fetcher via CORS proxies (lib/services/news.ts)
  - High-contrast theming and responsive UI via Tailwind-like utilities in styles

- Current state snapshot (layout and styling):
  - Fixed header with a tab bar beneath; content offset is controlled via CSS variable --header-total-height and dynamic paddingTop adjustments implemented in AppContainer.
  - Main content area scrolls independently; header remains fixed.
  - News widget is integrated in the Dashboard view with loading/error handling and local caching.

- Notable design decisions:
  - Avoids layout shifts by computing header height at runtime
  - Keeps logic centralized for month-based data and available months via financeStore
  - Emphasizes accessibility and responsive design via utility classes and CSS variables

Usage notes
- To understand data flow or modify a component, search for related stores (uiStore, financeStore, userStore) and services (weather, news, firebase listeners).
