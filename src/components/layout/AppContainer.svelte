<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { uiStore } from '../../lib/stores/uiStore';
  import { createKeyboardShortcutManager } from '../../lib/utils/keyboard';
  import { createTabSwipeHandler } from '../../lib/utils/gestures';
  import { getRadioPlayer } from '../../lib/services/radio';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import MainContent from './MainContent.svelte';
  import Footer from './Footer.svelte';
  import ModalSystem from '../modals/ModalSystem.svelte';
  import { weatherStore } from '../../lib/stores/weatherStore';
  import { radioStore } from '../../lib/stores/radioStore';
  // Mobile layout support
  import { isMobileDevice } from '../../lib/stores/mobileStore';
  import { MobileLayout } from './mobile';

  // Define tab order for swipe navigation
  const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];

  // Get radio player instance
  const radioPlayer = getRadioPlayer();

  // Create keyboard shortcut manager — при фокусе в input/textarea/select горячие клавиши не срабатывают
  const keyboardShortcuts = createKeyboardShortcutManager(
    [
      {
        key: 'e',
        ctrl: true,
        callback: () => uiStore.openModal('expense'),
        description: 'Add Expense',
      },
      {
        key: 't',
        ctrl: true,
        callback: () => uiStore.openModal('dailyTask'),
        description: 'Add Task',
      },
      {
        key: 'd',
        ctrl: true,
        callback: () => uiStore.openModal('debt'),
        description: 'Add Debt',
      },
      {
        key: 'r',
        ctrl: true,
        callback: () => uiStore.openModal('recurring'),
        description: 'Add Recurring Expense',
      },
      {
        key: ' ',
        callback: () => {
          radioPlayer.toggle().catch((err) => {
            console.error('Radio toggle error:', err);
          });
        },
        description: 'Toggle Radio',
      },
    ],
    { ignoreInputFields: true, preventDefault: true },
  );

  // Create swipe gesture handler for tab navigation
  const swipeHandler = createTabSwipeHandler(
    tabs,
    () => $uiStore.activeTab,
    (tab) => uiStore.setActiveTab(tab),
    { threshold: 50 },
  );

  // Header offset management: ensure content starts below fixed header
  let resizeObserver: ResizeObserver | null = null;
  let headerObserver: MutationObserver | null = null;
  let idleInitId: number | null = null;

  function updateHeaderOffset() {
    const header = document.getElementById('fixed-header');
    const nav = document.querySelector('.header-nav') as HTMLElement | null;
    const headerH = header?.offsetHeight ?? 0;
    const navH = nav?.offsetHeight ?? 0;
    const total = headerH + (navH || 0);
    // Apply to CSS variable to offset the main content via CSS rules
    document.documentElement.style.setProperty('--header-total-height', `${total}px`);
  }

  onMount(() => {
    // Initialize header offset
    updateHeaderOffset();

    // Observe size changes on header and nav to keep offset in sync
    const headerEl = document.getElementById('fixed-header');
    const navEl = document.querySelector('.header-nav') as HTMLElement | null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => updateHeaderOffset());
      if (headerEl) resizeObserver.observe(headerEl);
      if (navEl) resizeObserver.observe(navEl);
    }
    // Fallback on resize event
    window.addEventListener('resize', updateHeaderOffset);
    // Mutations inside header (dynamic content changes)
    headerObserver = new MutationObserver(() => updateHeaderOffset());
    if (headerEl)
      headerObserver.observe(headerEl, { childList: true, subtree: true, attributes: true });
    // Attach keyboard shortcuts
    keyboardShortcuts.attach();

    // Attach swipe gesture handler
    swipeHandler.attach();

    // Initialize global stores/services (idle to reduce startup cost)
    const initHeavyWidgets = () => {
      weatherStore.init(undefined, $uiStore.language);
      radioStore.init();
    };
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      idleInitId = win.requestIdleCallback(initHeavyWidgets);
    } else {
      idleInitId = window.setTimeout(initHeavyWidgets, 0);
    }

    // Initial fetch for months if needed, though usually financeStore handles this
    // financeStore.loadMonths(); // Assuming this exists or is handled elsewhere
  });

  onDestroy(() => {
    // Detach keyboard shortcuts
    keyboardShortcuts.detach();

    // Detach swipe gesture handler
    swipeHandler.detach();

    // Clean up global stores
    if (idleInitId !== null) {
      const win = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (win.cancelIdleCallback) {
        win.cancelIdleCallback(idleInitId);
      } else {
        clearTimeout(idleInitId);
      }
      idleInitId = null;
    }
    weatherStore.destroy();
    radioStore.destroy();

    // Clean up header offset listeners
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (headerObserver) {
      headerObserver.disconnect();
      headerObserver = null;
    }
    window.removeEventListener('resize', updateHeaderOffset);
  });
</script>

{#if $isMobileDevice}
  <!-- MOBILE LAYOUT -->
  <MobileLayout />
{:else}
  <!-- DESKTOP LAYOUT -->
  <div id="app" class="app-container">
    <!-- Offline indicator -->
    {#if $uiStore.isOffline}
      <div
        id="offline-indicator"
        class="bg-yellow-500 text-white text-center py-1 text-xs"
        role="alert"
        aria-live="polite"
      >
        <span>You are currently offline</span>
      </div>
    {/if}

    <!-- Header with logo, widgets, navigation tabs - FIXED -->
    <Header />

    <!-- Mobile Sidebar (present in header layout) -->
    <Sidebar />

    <!-- Main content area - SCROLLABLE -->
    <div class="content-wrapper">
      <MainContent />
      <Footer />
    </div>

    <!-- Modal System -->
    <ModalSystem />
  </div>
{/if}

<style>
  /* КРИТИЧНО: App container занимает весь viewport */
  .app-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden; /* Предотвращаем скролл на app */
    display: flex;
    flex-direction: column;
  }

  /* КРИТИЧНО: Content wrapper скроллится; верхний отступ = высота header+nav */
  .content-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
    /* Скрываем scrollbar визуально */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    padding: var(--header-total-height) clamp(0.5rem, 1.5vw, 1.5rem) 0;
  }

  .content-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  #offline-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001; /* Above header */
  }
</style>
