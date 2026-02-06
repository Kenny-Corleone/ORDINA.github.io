<script lang="ts">
  import { uiStore } from '../../../lib/stores/uiStore';
  import { weatherStore } from '../../../lib/stores/weatherStore';
  import { clockStore } from '../../../lib/stores/clockStore';
  import { radioStore } from '../../../lib/stores/radioStore';
  import { weatherIcons } from '../../../lib/services/weather';

  // Weather state
  $: weather = $weatherStore;
  $: isOffline = $uiStore.isOffline;

  // Clock state
  $: hours = String($clockStore.getHours()).padStart(2, '0');
  $: minutes = String($clockStore.getMinutes()).padStart(2, '0');
  $: day = String($clockStore.getDate()).padStart(2, '0');
  $: month = String($clockStore.getMonth() + 1).padStart(2, '0');

  // Radio state
  $: radio = $radioStore;

  function toggleRadio() {
    radioStore.toggle();
  }
</script>

<header class="mobile-header">
  <div class="mobile-header-content">
    <!-- Logo -->
    <button
      type="button"
      on:click={() => location.reload()}
      class="mobile-logo-btn"
      aria-label="Reload Application"
    >
      <img
        src="/ORDINA.github.io/assets/ordina.png"
        alt="Ordina logo"
        class="mobile-logo-img"
        loading="eager"
      />
    </button>

    <!-- Center: Time + Weather -->
    <div class="mobile-center-group">
      <!-- Time -->
      <div class="mobile-time">
        <span class="time-value">{hours}:{minutes}</span>
        <span class="date-value">{day}.{month}</span>
      </div>

      <!-- Weather Chip (compact) -->
      <div class="mobile-weather-chip" title={weather.city}>
        {#if isOffline}
          <span class="offline-dot"></span>
        {:else if weather.loading}
          <div class="weather-loader"></div>
        {:else}
          <div class="weather-icon-mini">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              {@html weatherIcons[weather.icon] || weatherIcons['01d']}
            </svg>
          </div>
          <span class="weather-temp-mini">{Math.round(weather.temp)}°</span>
        {/if}
      </div>
    </div>

    <!-- Radio Button -->
    <button
      class="mobile-radio-btn"
      class:is-playing={radio.isPlaying}
      on:click={toggleRadio}
      aria-label={radio.isPlaying ? 'Pause Radio' : 'Play Radio'}
    >
      {#if radio.isPlaying}
        <div class="equalizer-icon">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      {:else}
        <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon">
          <path d="M8 5v14l11-7z" />
        </svg>
      {/if}
    </button>
  </div>

  <!-- Playing track info (shown when radio is playing) -->
  {#if radio.isPlaying && radio.trackTitle}
    <div class="mobile-radio-track">
      <span class="track-label">🎵</span>
      <span class="track-title">{radio.trackTitle}</span>
    </div>
  {/if}
</header>

<style>
  .mobile-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--glass-bg-light);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--glass-border-light);
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  :global(.dark) .mobile-header {
    background: var(--glass-bg-dark);
    border-bottom-color: var(--glass-border-dark);
  }

  .mobile-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--mobile-header-height, 56px);
    padding: 0 0.75rem;
    gap: 0.5rem;
  }

  /* Logo */
  .mobile-logo-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
  }

  .mobile-logo-img {
    height: 32px;
    width: auto;
    object-fit: contain;
  }

  /* Center Group */
  .mobile-center-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    justify-content: center;
  }

  /* Time */
  .mobile-time {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
  }

  .time-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
  }

  :global(.dark) .time-value {
    color: #f1f5f9;
  }

  .date-value {
    font-size: 0.625rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }

  :global(.dark) .date-value {
    color: #94a3b8;
  }

  /* Weather Chip */
  .mobile-weather-chip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 1rem;
    min-height: 28px;
  }

  :global(.dark) .mobile-weather-chip {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .weather-icon-mini svg {
    width: 16px;
    height: 16px;
    color: #3b82f6;
  }

  :global(.dark) .weather-icon-mini svg {
    color: #60a5fa;
  }

  .weather-temp-mini {
    font-size: 0.75rem;
    font-weight: 600;
    color: #334155;
  }

  :global(.dark) .weather-temp-mini {
    color: #e2e8f0;
  }

  .offline-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f59e0b;
  }

  .weather-loader {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Radio Button */
  .mobile-radio-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  :global(.dark) .mobile-radio-btn {
    background: #1e293b;
    color: #94a3b8;
  }

  .mobile-radio-btn.is-playing {
    background: #4f46e5;
    color: white;
  }

  .mobile-radio-btn:active {
    transform: scale(0.95);
  }

  .play-icon {
    width: 18px;
    height: 18px;
    margin-left: 2px;
  }

  /* Equalizer Icon */
  .equalizer-icon {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 12px;
  }

  .eq-bar {
    width: 3px;
    background: white;
    border-radius: 1px;
    animation: eqBounce 0.5s infinite ease-in-out alternate;
  }

  .eq-bar:nth-child(1) {
    height: 6px;
  }
  .eq-bar:nth-child(2) {
    height: 12px;
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
      height: 12px;
    }
  }

  /* Radio Track Info */
  .mobile-radio-track {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: rgba(79, 70, 229, 0.1);
    border-top: 1px solid rgba(79, 70, 229, 0.1);
    overflow: hidden;
  }

  :global(.dark) .mobile-radio-track {
    background: rgba(79, 70, 229, 0.15);
  }

  .track-label {
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .track-title {
    font-size: 0.75rem;
    font-weight: 500;
    color: #4f46e5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    animation: scrollTrack 15s linear infinite;
  }

  :global(.dark) .track-title {
    color: #818cf8;
  }

  @keyframes scrollTrack {
    0%,
    20% {
      transform: translateX(0);
    }
    80%,
    100% {
      transform: translateX(-50%);
    }
  }
</style>
