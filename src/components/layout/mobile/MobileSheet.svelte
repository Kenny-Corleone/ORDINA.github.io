<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { uiStore } from '../../../lib/stores/uiStore';
  import { userStore } from '../../../lib/stores/userStore';
  import { mobileUIStore, type BottomSheetContent } from '../../../lib/stores/mobileStore';
  import { translations, t } from '../../../lib/i18n';
  import { signOut } from 'firebase/auth';
  import { auth } from '../../../lib/firebase';
  import { Language, Theme, Currency } from '../../../lib/types';
  import { financeStore } from '../../../lib/stores/financeStore';

  // PWA install state
  let deferredPrompt: any = null;
  let isInstalled = false;

  function checkIfInstalled(): boolean {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if ((window.navigator as any).standalone === true) return true;
    return false;
  }

  function handleBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    deferredPrompt = e;
  }

  function handleAppInstalled() {
    isInstalled = true;
    deferredPrompt = null;
  }

  async function installApp() {
    if (!deferredPrompt) {
      alert('To install: Use your browser menu and select "Add to Home Screen" or "Install App"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      isInstalled = true;
    }
    deferredPrompt = null;
  }

  onMount(() => {
    isInstalled = checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
  });

  onDestroy(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  });

  // Sheet state
  $: isOpen = $mobileUIStore.isBottomSheetOpen;
  $: content = $mobileUIStore.bottomSheetContent;
  $: theme = $uiStore.theme;
  $: language = $uiStore.language;
  $: currency = $financeStore.currency;

  // More menu items
  const moreMenuItems = [
    { id: 'debts', icon: 'debts', labelKey: 'tabDebts' },
    { id: 'recurring', icon: 'recurring', labelKey: 'tabRecurring' },
  ];

  // Settings menu items
  const settingsItems = [
    { id: 'theme', icon: 'theme', labelKey: 'theme' },
    { id: 'language', icon: 'language', labelKey: 'language' },
    { id: 'currency', icon: 'currency', labelKey: 'currency' },
  ];

  const icons: Record<string, string> = {
    debts:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="2" x2="12" y2="6"/></svg>',
    recurring:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    profile:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    logout:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    theme:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    language:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    currency:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    install:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    beer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12l.06-3.6a4 4 0 0 1 8 0L17 22H7L9 12z"/><path d="M7 8h10"/></svg>',
  };

  const languageFlags: Record<Language, string> = {
    [Language.EN]: '🇬🇧',
    [Language.RU]: '🇷🇺',
    [Language.AZ]: '🇦🇿',
    [Language.IT]: '🇮🇹',
  };

  const currencySymbols: Record<Currency, string> = {
    [Currency.AZN]: '₼',
    [Currency.USD]: '$',
  };

  function close() {
    mobileUIStore.closeBottomSheet();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  function navigateTo(tabId: string) {
    uiStore.setActiveTab(tabId);
    close();
  }

  function openSettings() {
    uiStore.openModal('settings');
    close();
  }

  function openProfile() {
    uiStore.openModal('profile');
    close();
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      userStore.clearUser();
      close();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  function toggleTheme() {
    uiStore.toggleTheme();
  }

  function toggleLanguage() {
    const languages = [Language.RU, Language.EN, Language.AZ, Language.IT];
    const currentIndex = languages.indexOf(language ?? Language.EN);
    const nextIndex = (currentIndex + 1) % languages.length;
    uiStore.setLanguage(languages[nextIndex] ?? Language.EN);
  }

  function toggleCurrency() {
    const newCurrency = currency === Currency.AZN ? Currency.USD : Currency.AZN;
    financeStore.setCurrency(newCurrency);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="sheet-backdrop"
    transition:fade={{ duration: 200 }}
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="button"
    tabindex="-1"
    aria-label="Close"
  >
    <!-- Sheet -->
    <div class="sheet" transition:fly={{ y: 300, duration: 300 }} role="dialog" aria-modal="true">
      <!-- Handle -->
      <div class="sheet-handle"></div>

      <!-- Content -->
      <div class="sheet-content">
        {#if content === 'more'}
          <h2 class="sheet-title">{t($translations, 'menu') || 'Menu'}</h2>

          <!-- Navigation items -->
          <div class="sheet-section">
            {#each moreMenuItems as item}
              <button class="sheet-item" on:click={() => navigateTo(item.id)}>
                <div class="sheet-item-icon">
                  {@html icons[item.icon]}
                </div>
                <span class="sheet-item-label">{t($translations, item.labelKey)}</span>
              </button>
            {/each}
          </div>

          <!-- Divider -->
          <div class="sheet-divider"></div>

          <!-- Quick Actions -->
          <div class="sheet-section sheet-section-row">
            <button class="quick-action" on:click={toggleTheme} title="Theme">
              {#if theme === Theme.DARK}
                <span class="quick-icon">☀️</span>
              {:else}
                <span class="quick-icon">🌙</span>
              {/if}
            </button>
            <button class="quick-action" on:click={toggleLanguage} title="Language">
              <span class="quick-icon">{languageFlags[language]}</span>
            </button>
            <button class="quick-action" on:click={toggleCurrency} title="Currency">
              <span class="quick-icon currency">{currencySymbols[currency]}</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="sheet-divider"></div>

          <!-- Settings & Profile -->
          <div class="sheet-section">
            <button class="sheet-item" on:click={openSettings}>
              <div class="sheet-item-icon">
                {@html icons['settings']}
              </div>
              <span class="sheet-item-label">{t($translations, 'settings') || 'Settings'}</span>
            </button>
            <button class="sheet-item" on:click={openProfile}>
              <div class="sheet-item-icon">
                {@html icons['profile']}
              </div>
              <span class="sheet-item-label">{t($translations, 'profile') || 'Profile'}</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="sheet-divider"></div>

          <!-- Logout -->
          <div class="sheet-section">
            <button class="sheet-item sheet-item-danger" on:click={handleLogout}>
              <div class="sheet-item-icon">
                {@html icons['logout']}
              </div>
              <span class="sheet-item-label">{t($translations, 'logout') || 'Logout'}</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="sheet-divider"></div>

          <!-- Install & Support -->
          <div class="sheet-section">
            {#if !isInstalled}
              <button class="sheet-item sheet-item-install" on:click={installApp}>
                <div class="sheet-item-icon">
                  {@html icons['install']}
                </div>
                <span class="sheet-item-label">{t($translations, 'installApp', 'Install App')}</span
                >
              </button>
            {/if}
            <a
              href="https://www.buymeacoffee.com/Ancl"
              target="_blank"
              rel="noopener noreferrer"
              class="sheet-item sheet-item-beer"
            >
              <div class="sheet-item-icon">
                {@html icons['beer']}
              </div>
              <span class="sheet-item-label"
                >{t($translations, 'buyMeBeer', 'Buy me a beer')} 🍺</span
              >
            </a>
          </div>

          <!-- Footer attribution -->
          <div class="sheet-footer">
            <span>by</span>
            <img
              src="/ORDINA.github.io/assets/ancl-logo-new.jpg"
              alt="ANCL"
              class="ancl-logo-mobile"
            />
            <span>2026</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .sheet-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .sheet {
    background: var(--glass-bg-light);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 1rem 1rem 0 0;
    width: 100%;
    max-width: 500px;
    max-height: 85vh;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 1rem);
  }

  :global(.dark) .sheet {
    background: var(--glass-bg-dark);
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    margin: 0.75rem auto;
  }

  :global(.dark) .sheet-handle {
    background: rgba(255, 255, 255, 0.3);
  }

  .sheet-content {
    padding: 0 1rem 1rem;
  }

  .sheet-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
  }

  :global(.dark) .sheet-title {
    color: #f1f5f9;
  }

  .sheet-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sheet-section-row {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .sheet-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0.75rem 0;
  }

  :global(.dark) .sheet-divider {
    background: rgba(255, 255, 255, 0.1);
  }

  .sheet-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: none;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    color: #334155;
    text-align: left;
    transition: all 0.2s;
    min-height: 56px;
  }

  :global(.dark) .sheet-item {
    color: #e2e8f0;
  }

  .sheet-item:active {
    background: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .sheet-item:active {
    background: rgba(255, 255, 255, 0.1);
  }

  .sheet-item-danger {
    color: #ef4444;
  }

  .sheet-item-danger:active {
    background: rgba(239, 68, 68, 0.1);
  }

  .sheet-item-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .sheet-item-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .sheet-item-label {
    font-size: 1rem;
    font-weight: 500;
  }

  /* Quick Actions */
  .quick-action {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  :global(.dark) .quick-action {
    background: rgba(255, 255, 255, 0.1);
  }

  .quick-action:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .quick-action:active {
    background: rgba(255, 255, 255, 0.15);
  }

  .quick-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .quick-icon.currency {
    font-size: 1.25rem;
    font-weight: 700;
    color: #10b981;
  }

  /* Install button style */
  .sheet-item-install {
    color: #22c55e;
  }

  .sheet-item-install .sheet-item-icon {
    color: #22c55e;
  }

  /* Beer link style */
  .sheet-item-beer {
    color: #f59e0b;
    text-decoration: none;
  }

  .sheet-item-beer .sheet-item-icon {
    color: #f59e0b;
  }

  /* Footer attribution */
  .sheet-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 0 0.5rem;
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.4);
  }

  :global(.dark) .sheet-footer {
    color: rgba(255, 255, 255, 0.4);
  }

  .ancl-logo-mobile {
    height: 48px;
    width: auto;
    opacity: 1;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
</style>
