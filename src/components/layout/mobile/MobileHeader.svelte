<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { uiStore } from '../../../lib/stores/uiStore';
  import { weatherStore } from '../../../lib/stores/weatherStore';
  import { clockStore } from '../../../lib/stores/clockStore';
  import { radioStore } from '../../../lib/stores/radioStore';
  import { weatherIcons } from '../../../lib/services/weather';
  import { t, translations } from '../../../lib/i18n';

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

  function getAnimClass(icon: string) {
    if (!icon) return '';
    if (icon === '01d') return 'anim-spin'; // Sun
    if (icon.includes('02') || icon.includes('03') || icon.includes('04') || icon.includes('50'))
      return 'anim-float'; // Clouds/Fog
    if (icon.includes('09') || icon.includes('10') || icon.includes('11')) return 'anim-shake'; // Rain/Storm
    return ''; // Others (Moon etc) static or add more logic
  }

  function toggleRadio() {
    radioStore.toggle();
  }
</script>

<header class="mobile-header">
  <div class="mobile-header-content">
    <!-- Left: Logo + Motto -->
    <div class="header-left-group">
      <img src="/ORDINA.github.io/assets/ordina.png" alt="Ordina" class="mobile-logo-mini" />
      <div class="mobile-motto">
        {t($translations, 'appSubtitle')}
      </div>
    </div>

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
          <div class="weather-icon-mini {getAnimClass(weather.icon)}">
            <svg viewBox="0 0 24 24">
              {@html weatherIcons[weather.icon] || weatherIcons['01d']}
            </svg>
          </div>
          <span class="weather-temp-mini">{Math.round(weather.temp)}°</span>
          <span class="weather-city-mini">{weather.city}</span>
        {/if}
      </div>
    </div>

    <!-- Radio Button (Icon only) -->
    <button
      class="mobile-radio-btn"
      class:is-playing={radio.isPlaying}
      on:click={toggleRadio}
      aria-label={radio.isPlaying ? 'Pause Radio' : 'Play Radio'}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon">
        <path d={radio.isPlaying ? 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' : 'M8 5v14l11-7z'} />
      </svg>
    </button>
  </div>

  <!-- Track Bar (Expandable) -->
  {#if radio.isPlaying}
    <div class="mobile-track-bar" transition:slide>
      <div class="track-eq-mini">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
      <div class="track-marquee">
        <span class="marquee-text"
          >{radio.trackTitle || 'Loading...'} • {radio.trackTitle || 'Loading...'}</span
        >
      </div>
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
    transition: height 0.3s ease;
  }

  :global(.dark) .mobile-header {
    background: var(--glass-bg-dark);
    border-bottom-color: var(--glass-border-dark);
  }

  .mobile-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px; /* Fixed height for top row */
    padding: 0 0.75rem;
    gap: 0.5rem;
    width: 100%;
  }

  .header-left-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0; /* flex fix */
  }

  .mobile-logo-mini {
    height: 20px;
    width: auto;
    object-fit: contain;
  }

  /* Motto (Left) */
  .mobile-motto {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    line-height: normal;
    max-width: 30vw; /* Reduced to fit logo */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }
  :global(.dark) .mobile-motto {
    color: #94a3b8;
  }

  /* Center Group */
  .mobile-center-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    justify-content: center;
  }

  /* Track Bar */
  .mobile-track-bar {
    height: 30px;
    background: rgba(79, 70, 229, 0.9); /* Indigo-600 */
    color: white;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    gap: 0.75rem;
    overflow: hidden;
    width: 100%;
  }
  :global(.dark) .mobile-track-bar {
    background: rgba(99, 102, 241, 0.2); /* Indigo-500 alpha */
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .track-eq-mini {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
  }
  .track-eq-mini .bar {
    width: 3px;
    background: white;
    animation: eqBounce 0.5s infinite alternate;
  }
  .track-eq-mini .bar:nth-child(2) {
    animation-delay: 0.1s;
  }
  .track-eq-mini .bar:nth-child(3) {
    animation-delay: 0.2s;
  }

  .track-marquee {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
  }
  .marquee-text {
    display: inline-block;
    padding-left: 100%;
    animation: scrollMobile 10s linear infinite;
    font-size: 0.8rem;
    font-weight: 600;
  }

  @keyframes scrollMobile {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  @keyframes eqBounce {
    from {
      height: 4px;
    }
    to {
      height: 12px;
    }
  }

  /* Weather Animations */
  .anim-spin {
    animation: spinIcon 12s linear infinite;
    transform-origin: center;
  }
  .anim-float {
    animation: floatIcon 3s ease-in-out infinite;
  }
  .anim-shake {
    animation: shakeIcon 3s ease-in-out infinite;
  }

  @keyframes spinIcon {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes floatIcon {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }
  @keyframes shakeIcon {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translateX(-1px);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translateX(1px);
    }
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
    width: 20px;
    height: 20px;
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

  .weather-city-mini {
    font-size: 0.75rem;
    font-weight: 500;
    color: #64748b;
    max-width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :global(.dark) .weather-city-mini {
    color: #94a3b8;
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

  /* Removed unused radio track styles */
</style>
