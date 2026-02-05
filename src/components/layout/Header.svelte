<script lang="ts">
  import { uiStore } from '../../lib/stores/uiStore';
  import { userStore } from '../../lib/stores/userStore';
  import { financeStore } from '../../lib/stores/financeStore';
  import { clockStore } from '../../lib/stores/clockStore';
  import { weatherStore } from '../../lib/stores/weatherStore';
  import { radioStore } from '../../lib/stores/radioStore';
  import { signOut } from 'firebase/auth';
  import { auth } from '../../lib/firebase';
  import { Language, Theme, Currency } from '../../lib/types';
  import { translations, t } from '../../lib/i18n';
  import { weatherIcons } from '../../lib/services/weather';

  // Reactive state from stores
  $: theme = $uiStore.theme;
  $: language = $uiStore.language;
  $: currency = $financeStore.currency;
  $: isOffline = $uiStore.isOffline;

  // Clock state derived from store
  $: hours = String($clockStore.getHours()).padStart(2, '0');
  $: minutes = String($clockStore.getMinutes()).padStart(2, '0');

  $: day = String($clockStore.getDate()).padStart(2, '0');
  $: month = String($clockStore.getMonth() + 1).padStart(2, '0');
  $: year = $clockStore.getFullYear();
  $: currentDate = `${day}.${month}.${year}`;

  // Weather state derived from store
  $: weather = $weatherStore;

  // Radio state derived from store
  $: radio = $radioStore;

  // Language configuration
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

  // Actions
  function toggleTheme() {
    uiStore.toggleTheme();
  }

  function toggleLanguage() {
    const languages = [Language.RU, Language.EN, Language.AZ, Language.IT];
    const currentLang = language ?? Language.EN;
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex] ?? Language.EN;
    uiStore.setLanguage(nextLang);
    weatherStore.load(weather.city, nextLang);
  }

  function toggleCurrency() {
    const newCurrency = currency === Currency.AZN ? Currency.USD : Currency.AZN;
    financeStore.setCurrency(newCurrency);
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      userStore.clearUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  function toggleMobileMenu() {
    uiStore.toggleMobileSidebar();
  }

  function toggleRadio() {
    radioStore.toggle();
  }
</script>

<header id="fixed-header" class="premium-card fixed-header-override">
  <!-- 
    SYMMETRIC LAYOUT SYSTEM 
    1. Left: Branding (Logo + Divider + Motto)
    2. Center: Widgets (Weather | Time) - Radio MOVED to Right
    3. Right: Radio + Actions (Theme | Lang | Curr | Logout)
  -->
  <div class="header-main-row">
    <!-- SECTION 1: BRANDING (Left) -->
    <div class="header-section section-left">
      <button
        type="button"
        on:click={() => location.reload()}
        title={t($translations, 'reloadApp') || 'Reload App'}
        class="logo-btn"
        aria-label="Reload Application"
      >
        <img
          src="/assets/ordina.png"
          srcset="/assets/ordina.png 1x, /assets/ordina@2x.png 2x"
          alt="Ordina logo"
          class="header-logo-img"
          loading="eager"
          fetchpriority="high"
        />
      </button>

      <div class="header-divider hidden xl:block"></div>

      <div class="header-motto hidden xl:block" aria-hidden="true">
        {t($translations, 'appSubtitle')}
      </div>
    </div>

    <!-- SECTION 2: CENTER WIDGETS (Only Weather & Time now) -->
    <div class="header-section section-center">
      <!-- Weather -->
      <div
        class="header-widget weather-widget"
        title={`${weather.city}: ${weather.condition}`}
        role="status"
      >
        {#if isOffline}
          <div class="offline-badge">
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
              />
            </svg>
            <span>OFFLINE</span>
          </div>
        {:else if weather.loading}
          <div class="widget-loader"></div>
        {:else}
          <div class="weather-icon fade-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              {@html weatherIcons[weather.icon] || weatherIcons['01d']}
            </svg>
          </div>
          <div class="weather-data fade-in">
            <span class="weather-temp">{Math.round(weather.temp)}°</span>
            <span class="weather-city">{weather.city}</span>
          </div>
        {/if}
      </div>

      <!-- Time -->
      <div class="header-widget datetime-widget" role="timer">
        <time datetime={$clockStore.toISOString()} class="time-display">
          {hours}<span class="colon-blink">:</span>{minutes}
        </time>
        <div class="date-display">{currentDate}</div>
      </div>
    </div>

    <!-- SECTION 3: ACTIONS (Right) - Now includes Radio -->
    <div class="header-section section-right">
      <!-- Radio - Completely Redesigned & Moved Here -->
      <div
        class="header-widget radio-widget-v2"
        class:is-playing={radio.isPlaying}
        role="region"
        aria-label="Radio"
      >
        <button
          on:click={toggleRadio}
          class="radio-toggle-v2"
          aria-label={radio.isPlaying ? 'Pause' : 'Play'}
        >
          {#if radio.isPlaying}
            <div class="equalizer-icon">
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
            </div>
          {:else}
            <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon"
              ><path d="M8 5v14l11-7z" /></svg
            >
          {/if}
        </button>

        <div class="radio-info-v2">
          {#if radio.trackTitle}
            <!-- Use a static, truncated text or custom loop, NO marquee tag -->
            <div class="title-scroller">
              <span class="track-text">{radio.trackTitle}</span>
            </div>
          {:else}
            <span class="static-label">Radio</span>
          {/if}
        </div>
      </div>

      <!-- Spacer to separate Radio from Actions -->
      <div class="spacer-v"></div>

      <button on:click={toggleTheme} class="action-btn" title="Theme">
        {#if theme === Theme.DARK}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-amber-400"
          >
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
              x1="18.36"
              y1="18.36"
              x2="19.78"
              y2="19.78"
            />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line
              x1="18.36"
              y1="5.64"
              x2="19.78"
              y2="4.22"
            />
          </svg>
        {:else}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-indigo-600"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        {/if}
      </button>

      <button on:click={toggleLanguage} class="action-btn" title="Language">
        <span class="flag-icon">{languageFlags[language]}</span>
      </button>

      <button on:click={toggleCurrency} class="action-btn" title="Currency">
        <span class="currency-symbol">{currencySymbols[currency]}</span>
      </button>

      <button on:click={handleLogout} class="action-btn logout-btn" title="Logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>

      <!-- Mobile Toggle -->
      <button on:click={toggleMobileMenu} class="action-btn sm:hidden" title="Menu">
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          ><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line
            x1="3"
            y1="18"
            x2="21"
            y2="18"
          /></svg
        >
      </button>
    </div>
  </div>

  <!-- TABS (Separate Row) -->
  <nav class="header-tabs-row" aria-label="Main Navigation">
    <div class="tabs-container">
      {#each ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'] as tab}
        <button
          role="tab"
          aria-selected={$uiStore.activeTab === tab}
          data-tab={tab}
          class="tab-btn {$uiStore.activeTab === tab ? 'active' : ''}"
          on:click={() => uiStore.setActiveTab(tab)}
        >
          {t($translations, `tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
          {#if $uiStore.activeTab === tab}
            <div class="active-indicator"></div>
          {/if}
        </button>
      {/each}
    </div>
  </nav>
</header>

<style>
  /* =========================================
     SYMMETRIC LAYOUT SYSTEM CSS
     ========================================= */

  .fixed-header-override {
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    overflow: visible;
  }

  .header-main-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-main-row-height);
    padding: 0 var(--header-main-row-padding-x);
    width: 100%;
    position: relative;
    gap: var(--header-main-row-gap);
  }

  /* --- SECTIONS --- */

  /* Left Section: Brand */
  .section-left {
    display: flex;
    align-items: center;
    gap: var(--header-section-gap); /* Unchanged gap logic between logo and divider */
    flex: 1;
    justify-content: flex-start;
  }

  /* Center Section: Widgets (Weather | Time) */
  .section-center {
    display: flex;
    align-items: center;
    gap: var(--header-section-gap); /* Spacing between Weather and Time */
    flex: 0 0 auto; /* Tightly packed center */
    padding: 0 var(--header-widget-padding-x);
    position: absolute; /* True centering */
    left: 50%;
    transform: translateX(-50%);
  }

  /* Right Section: Radio + Actions */
  .section-right {
    display: flex;
    align-items: center;
    gap: var(--header-section-gap);
    flex: 1;
    justify-content: flex-end;
  }

  .section-left,
  .section-center,
  .section-right {
    min-width: 0;
  }

  .spacer-v {
    width: 1px;
    height: 24px;
    background: rgba(0, 0, 0, 0.1);
    margin: 0 0.5rem;
  }
  :global(.dark) .spacer-v {
    background: rgba(255, 255, 255, 0.1);
  }

  /* --- ELEMENT SIZES & TYPOGRAPHY SYSTEM --- */

  /* 1. Brand Elements */
  .header-logo-img {
    height: var(--header-logo-height); /* Slightly larger again per request */
    width: auto;
    object-fit: contain;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .logo-btn:hover .header-logo-img {
    transform: scale(1.05); /* Gentle scale */
  }

  .header-divider {
    width: 1px;
    height: 32px;
    background-color: #cbd5e1; /* Slate-300 */
  }

  :global(.dark) .header-divider {
    background-color: #334155;
  }

  .header-motto {
    font-size: 1.1rem; /* Slightly larger motto text */
    font-weight: 500;
    color: #475569; /* Slate-600 */
    letter-spacing: -0.01em;
    /* Boundary check is handled by flex push */
  }
  :global(.dark) .header-motto {
    color: #94a3b8;
  }

  /* 2. Widgets System (Unified heights 44px) */
  .header-widget {
    height: var(--header-widget-height);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: var(--header-widget-radius);
    display: flex;
    align-items: center;
    padding: 0 var(--header-widget-padding-x);
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }
  :global(.dark) .header-widget {
    background: rgba(15, 23, 42, 0.5);
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Weather */
  .weather-widget {
    gap: 0.75rem;
    color: #334155;
  }
  :global(.dark) .weather-widget {
    color: #e2e8f0;
  }

  .weather-icon svg {
    width: clamp(18px, 2.6vw, 24px);
    height: clamp(18px, 2.6vw, 24px);
    color: #3b82f6;
  } /* Blue-500 accent */
  :global(.dark) .weather-icon svg {
    color: #60a5fa;
  }

  .weather-data {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
  .weather-temp {
    font-weight: 700;
    font-size: 1.1rem;
  }
  .weather-city {
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .offline-badge {
    display: flex;
    gap: 0.5rem;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.75rem;
    align-items: center;
  }

  /* Time */
  .datetime-widget {
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    min-width: clamp(72px, 8vw, 90px);
    padding-right: calc(var(--header-widget-padding-x) + 0.25rem);
  }
  .time-display {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: clamp(0.95rem, 1.3vw, 1.1rem);
    font-weight: 700;
    line-height: 1;
    color: #1e293b;
  }
  :global(.dark) .time-display {
    color: #f8fafc;
  }
  .date-display {
    font-size: clamp(0.6rem, 0.9vw, 0.65rem);
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }

  /* --- Radio V2 (Redesigned & Relocated) --- */
  .radio-widget-v2 {
    height: var(--header-widget-height);
    background: #f1f5f9; /* Simple flat background by default */
    border-radius: calc(var(--header-widget-height) / 2); /* Pill shape */
    display: flex;
    align-items: center;
    padding: 0 clamp(4px, 0.8vw, 6px); /* Tight padding for button */
    padding-right: clamp(10px, 1.6vw, 16px);
    gap: clamp(6px, 1vw, 8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    max-width: clamp(180px, 28vw, 240px);
    overflow: hidden;
  }
  :global(.dark) .radio-widget-v2 {
    background: #1e293b;
  }

  .radio-widget-v2.is-playing {
    background: #eef2ff;
    border-color: #818cf8;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }
  :global(.dark) .radio-widget-v2.is-playing {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(129, 140, 248, 0.3);
  }

  .radio-toggle-v2 {
    width: clamp(28px, 3.6vw, 32px);
    height: clamp(28px, 3.6vw, 32px);
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #475569;
    flex-shrink: 0;
  }
  :global(.dark) .radio-toggle-v2 {
    background: #334155;
    color: #cbd5e1;
  }

  .is-playing .radio-toggle-v2 {
    background: #4f46e5;
    color: white;
  }

  .play-icon {
    width: clamp(12px, 1.6vw, 14px);
    height: clamp(12px, 1.6vw, 14px);
    margin-left: 2px;
  }

  /* New Equalizer Icon inside button */
  .equalizer-icon {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 10px;
  }
  .eq-bar {
    width: 2px;
    background: white;
    border-radius: 1px;
    animation: eqBounce 0.5s infinite ease-in-out alternate;
  }
  .eq-bar:nth-child(1) {
    height: 6px;
  }
  .eq-bar:nth-child(2) {
    height: 10px;
    animation-delay: 0.1s;
  }
  .eq-bar:nth-child(3) {
    height: 4px;
    animation-delay: 0.2s;
  }
  @keyframes eqBounce {
    from {
      height: 4px;
    }
    to {
      height: 10px;
    }
  }

  .radio-info-v2 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    min-width: 0;
    margin-top: -1px; /* visual align */
  }

  .title-scroller {
    white-space: nowrap;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
  }

  .track-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    display: inline-block;
    /* CSS marquee animation if needed, or just truncate */
    animation: scrollText 10s linear infinite;
    padding-right: 20px;
  }
  :global(.dark) .track-text {
    color: #f1f5f9;
  }

  @keyframes scrollText {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  /* 3. Actions System (Unified size 44px squares) */
  .action-btn {
    width: var(--header-action-size);
    height: var(--header-action-size); /* Standard hit target */
    border-radius: var(--header-widget-radius); /* Matching widgets radius */
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s;
  }
  :global(.dark) .action-btn {
    color: #94a3b8;
  }

  .action-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1e293b;
    transform: translateY(-2px);
  }
  :global(.dark) .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .action-btn svg {
    width: clamp(18px, 2.2vw, 22px);
    height: clamp(18px, 2.2vw, 22px);
  }

  .logout-btn:hover {
    background: #fee2e2;
    color: #ef4444;
    border-color: #fecaca;
  }
  :global(.dark) .logout-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border-color: transparent;
  }

  .flag-icon {
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    line-height: 1;
  }
  .currency-symbol {
    font-weight: 800;
    font-size: clamp(0.95rem, 1.4vw, 1.1rem);
    color: #10b981;
  }

  /* --- TABS ROW (Separate visual layer) --- */
  .header-tabs-row {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    width: 100%;
  }
  :global(.dark) .header-tabs-row {
    border-color: rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.2);
  }

  .tabs-container {
    display: flex;
    max-width: var(--header-tabs-max-width);
    margin: 0 auto;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
    padding: var(--header-tab-padding-y) var(--header-tab-padding-x);
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--header-tab-font-size);
    font-weight: 600;
    color: #64748b;
    position: relative;
    transition: color 0.2s;
  }
  :global(.dark) .tab-btn {
    color: #94a3b8;
  }

  .tab-btn:hover {
    color: #334155;
    background: rgba(0, 0, 0, 0.02);
  }
  :global(.dark) .tab-btn:hover {
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.02);
  }

  .tab-btn.active {
    color: #4f46e5;
  }
  :global(.dark) .tab-btn.active {
    color: #818cf8;
  }

  .active-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #4f46e5;
    border-radius: 3px 3px 0 0;
  }
  :global(.dark) .active-indicator {
    background: #818cf8;
  }

  /* --- RESPONSIVE ADJUSTMENTS --- */

  /* Laptop */
  @media (max-width: 1280px) {
    .header-main-row {
      --header-main-row-padding-x: 1.5rem;
      --header-main-row-height: 72px;
    }
    .header-logo-img {
      --header-logo-height: 50px;
    }
    .header-divider {
      display: none;
    }
    .header-motto {
      font-size: 0.9rem;
    }

    .section-center {
      position: relative;
      left: auto;
      transform: none;
      flex: 1;
      justify-content: flex-end;
      padding-right: 2rem;
    }
    .datetime-widget {
      display: none;
    } /* Hide time first */
  }

  /* Tablet */
  @media (max-width: 1024px) {
    .header-main-row {
      --header-main-row-height: 64px;
      --header-main-row-padding-x: 1rem;
    }
    .header-motto {
      display: none;
    }

    .weather-city {
      display: none;
    }
    .radio-widget-v2 {
      width: var(--header-widget-height);
      padding: 0;
      justify-content: center;
    }
    .radio-info-v2 {
      display: none;
    } /* Show only icon */
  }

  /* Mobile */
  @media (max-width: 768px) {
    .header-main-row {
      --header-main-row-height: 60px;
      --header-main-row-padding-x: 0.75rem;
    }

    .section-center {
      display: none;
    } /* Hide widgets entirely */
    .section-left {
      gap: 0.5rem;
    }
    .header-logo-img {
      --header-logo-height: 40px;
    }

    .radio-widget-v2 {
      display: none;
    } /* Hide radio on mobile */

    .section-right {
      gap: 0.25rem;
    }
    .action-btn {
      --header-action-size: 36px;
    }
  }

  /* Animations */
  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .colon-blink {
    animation: blink 1s step-start infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0.3;
    }
  }
</style>
