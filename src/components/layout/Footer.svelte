<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { translations, t } from '../../lib/i18n';

  // PWA install prompt state
  let deferredPrompt: any = null;
  let isInstalled = false;

  // Check if app is already installed
  function checkIfInstalled(): boolean {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    // iOS check
    if ((window.navigator as any).standalone === true) {
      return true;
    }
    return false;
  }

  // Handle the beforeinstallprompt event
  function handleBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    deferredPrompt = e;
  }

  // Handle app installed event
  function handleAppInstalled() {
    isInstalled = true;
    deferredPrompt = null;
  }

  // Trigger install prompt
  async function installApp() {
    if (!deferredPrompt) {
      // Fallback: show instructions for manual installation
      alert('To install: Use your browser menu and select "Add to Home Screen" or "Install App"');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      isInstalled = true;
    }

    // Clear the deferred prompt
    deferredPrompt = null;
  }

  onMount(() => {
    // Check if already installed
    isInstalled = checkIfInstalled();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
  });

  onDestroy(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  });
</script>

<footer class="app-footer">
  <div class="footer-content">
    <!-- Install App Button -->
    <div class="footer-section">
      {#if !isInstalled}
        <button
          class="install-button"
          on:click={installApp}
          title={t($translations, 'installApp', 'Install App')}
        >
          <svg
            class="install-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{t($translations, 'installApp', 'Install App')}</span>
        </button>
      {:else}
        <span class="installed-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {t($translations, 'appInstalled', 'App Installed')}
        </span>
      {/if}
    </div>

    <!-- Buy Me a Beer Button -->
    <div class="footer-section coffee-section">
      <a
        href="https://www.buymeacoffee.com/Ancl"
        target="_blank"
        rel="noopener noreferrer"
        class="coffee-link"
      >
        <img
          src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍺&slug=Ancl&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff"
          alt="Buy me a beer"
          class="coffee-button-img"
        />
      </a>
    </div>

    <!-- Copyright with ANCL Logo -->
    <div class="footer-section copyright-section">
      <span class="copyright-text">by</span>
      <img src="/ORDINA.github.io/assets/ancl-logo-new.jpg" alt="ANCL" class="ancl-logo" />
      <span class="copyright-text">2026</span>
    </div>
  </div>
</footer>

<style>
  .app-footer {
    background: linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem 1.5rem;
    margin-top: auto;
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .footer-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Install Button */
  .install-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(74, 222, 128, 0.3);
  }

  .install-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(74, 222, 128, 0.4);
    background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
  }

  .install-button:active {
    transform: translateY(0);
  }

  .install-icon {
    width: 18px;
    height: 18px;
  }

  .installed-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #4ade80;
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .installed-badge svg {
    width: 16px;
    height: 16px;
  }

  /* Coffee Button */
  .coffee-section {
    justify-content: center;
    flex: 1;
  }

  .coffee-link {
    display: block;
    transition: transform 0.3s ease;
  }

  .coffee-link:hover {
    transform: scale(1.05);
  }

  .coffee-button-img {
    height: 36px;
    width: auto;
    border-radius: 5px;
  }

  /* Copyright Section */
  .copyright-section {
    gap: 0.6rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }

  .copyright-text {
    opacity: 0.8;
  }

  .ancl-logo {
    height: 64px; /* Much larger */
    width: auto;
    opacity: 1; /* Full visibility */
    border-radius: 12px;
    transition: all 0.3s ease;
    /* Removed blend mode for better visibility based on user request */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .ancl-logo:hover {
    opacity: 1;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      text-align: center;
    }

    .footer-section {
      justify-content: center;
    }

    .coffee-section {
      order: -1;
    }
  }
</style>
