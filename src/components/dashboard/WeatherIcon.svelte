<script lang="ts">
  export let icon: string = '01d';
  export let size: number = 64;

  // Clear Sky
  const isClear = icon.startsWith('01');
  // Clouds
  const isCloudy = icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04');
  // Rain
  const isRain = icon.startsWith('09') || icon.startsWith('10');
  // Thunderstorm
  const isThunder = icon.startsWith('11');
  // Snow
  const isSnow = icon.startsWith('13');
  // Mist/Fog
  const isMist = icon.startsWith('50');

  const isDay = icon.endsWith('d');
</script>

<div class="weather-icon-container" style="width: {size}px; height: {size}px;">
  {#if isClear}
    {#if isDay}
      <div class="sun-premium">
        <div class="sun-core"></div>
        <div class="sun-glow"></div>
        {#each Array(12) as _, i}
          <div class="sun-ray-premium" style="--i:{i}; --total:12"></div>
        {/each}
      </div>
    {:else}
      <div class="moon-premium">
        <div class="moon-core"></div>
        <div class="moon-star star-1"></div>
        <div class="moon-star star-2"></div>
      </div>
    {/if}
  {:else if isCloudy}
    <div class="cloudy-premium">
      {#if isDay && icon.startsWith('02')}
        <div class="sun-behind"></div>
      {/if}
      <div class="cloud-main"></div>
      <div class="cloud-back"></div>
    </div>
  {:else if isRain}
    <div class="rainy-premium">
      <div class="cloud-dark"></div>
      <div class="rain-drops">
        {#each Array(6) as _, i}
          <div class="drop-premium" style="--d:{i * 0.15}s; --l:{10 + i * 16}%"></div>
        {/each}
      </div>
    </div>
  {:else if isThunder}
    <div class="thunder-premium">
      <div class="cloud-dark flash-anim"></div>
      <div class="lightning-bolt">
        <svg viewBox="0 0 24 24" fill="currentColor"
          ><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg
        >
      </div>
    </div>
  {:else if isSnow}
    <div class="snowy-premium">
      <div class="cloud-main"></div>
      <div class="snowflakes">
        {#each Array(8) as _, i}
          <div class="flake-premium" style="--d:{i * 0.2}s; --l:{5 + i * 12}%"></div>
        {/each}
      </div>
    </div>
  {:else if isMist}
    <div class="mist-premium">
      {#each Array(4) as _, i}
        <div class="mist-layer" style="--i:{i}; --d:{i * 0.5}s"></div>
      {/each}
    </div>
  {:else}
    <div class="sun-premium"><div class="sun-core"></div></div>
  {/if}
</div>

<style>
  .weather-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }

  /* SUN PREMIUM */
  .sun-premium {
    position: relative;
    width: 60%;
    height: 60%;
  }
  .sun-core {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, #fffb00, #ff9100);
    border-radius: 50%;
    z-index: 10;
    box-shadow: 0 0 20px #ff9100;
  }
  .sun-glow {
    position: absolute;
    inset: -20%;
    background: radial-gradient(circle, rgba(255, 145, 0, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  .sun-ray-premium {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 140%;
    background: linear-gradient(to top, transparent, #ff9100 50%, transparent);
    transform: translate(-50%, -50%) rotate(calc(var(--i) * (360deg / var(--total))));
    animation: rotate-sun-rays 20s linear infinite;
    opacity: 0.6;
  }

  @keyframes rotate-sun-rays {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.4;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.6;
    }
  }

  /* MOON PREMIUM */
  .moon-premium {
    width: 60%;
    height: 60%;
    position: relative;
  }
  .moon-core {
    width: 100%;
    height: 100%;
    background: #f1f5f9;
    border-radius: 50%;
    box-shadow:
      inset -12px -12px 0 0 #cbd5e1,
      0 0 15px rgba(255, 255, 255, 0.2);
  }
  .moon-star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    animation: twinkle 1.5s infinite;
  }
  .star-1 {
    top: -10%;
    right: -10%;
    animation-delay: 0.2s;
  }
  .star-2 {
    bottom: 20%;
    left: -20%;
    animation-delay: 0.8s;
  }
  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  /* CLOUDY PREMIUM */
  .cloudy-premium {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .cloud-main,
  .cloud-back,
  .cloud-dark {
    position: absolute;
    background: #fff;
    border-radius: 40px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  }
  :global(.dark) .cloud-main,
  :global(.dark) .cloud-back {
    background: #64748b;
  }
  :global(.dark) .cloud-dark {
    background: #475569;
  }

  .cloud-main {
    width: 70%;
    height: 45%;
    bottom: 20%;
    left: 10%;
    z-index: 5;
    animation: float-main 4s ease-in-out infinite;
  }
  .cloud-back {
    width: 60%;
    height: 40%;
    top: 20%;
    right: 10%;
    z-index: 3;
    opacity: 0.7;
    animation: float-back 6s ease-in-out infinite;
  }

  .cloud-main::before,
  .cloud-main::after,
  .cloud-back::before,
  .cloud-back::after,
  .cloud-dark::before,
  .cloud-dark::after {
    content: '';
    position: absolute;
    background: inherit;
    border-radius: 50%;
  }
  .cloud-main::before {
    width: 50%;
    height: 100%;
    top: -50%;
    left: 15%;
  }
  .cloud-main::after {
    width: 40%;
    height: 80%;
    top: -40%;
    right: 15%;
  }

  .cloud-back::before {
    width: 50%;
    height: 100%;
    top: -50%;
    left: 15%;
  }
  .cloud-back::after {
    width: 40%;
    height: 80%;
    top: -40%;
    right: 15%;
  }

  .sun-behind {
    position: absolute;
    width: 35%;
    height: 35%;
    background: #ffcd00;
    border-radius: 50%;
    top: 15%;
    right: 25%;
    z-index: 2;
    box-shadow: 0 0 15px #ffcd00;
    animation: sun-peek 4s ease-in-out infinite;
  }

  @keyframes float-main {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(4px);
    }
  }
  @keyframes float-back {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }
  @keyframes sun-peek {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05) translate(2px, -2px);
    }
  }

  /* RAINY PREMIUM */
  .rainy-premium {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .cloud-dark {
    width: 75%;
    height: 45%;
    top: 20%;
    left: 12%;
    z-index: 5;
    background: #94a3b8;
  }
  .cloud-dark::before {
    width: 50%;
    height: 100%;
    top: -50%;
    left: 15%;
  }
  .cloud-dark::after {
    width: 40%;
    height: 80%;
    top: -40%;
    right: 15%;
  }

  .drop-premium {
    position: absolute;
    width: 2px;
    height: 10px;
    background: linear-gradient(to bottom, transparent, #3b82f6);
    border-radius: 2px;
    top: 65%;
    left: var(--l);
    animation: rain-fall-heavy 0.6s linear infinite var(--d);
  }
  @keyframes rain-fall-heavy {
    0% {
      transform: translateY(-5px);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(20px);
      opacity: 0;
    }
  }

  /* THUNDER PREMIUM */
  .lightning-bolt {
    position: absolute;
    width: 30%;
    height: 45%;
    bottom: 5%;
    left: 35%;
    color: #fbbf24;
    z-index: 6;
    animation: thunder-flash 2.5s infinite;
  }
  .flash-anim {
    animation: bg-flash 2.5s infinite;
  }
  @keyframes thunder-flash {
    0%,
    80%,
    100% {
      opacity: 0;
      transform: scale(0.8);
    }
    82%,
    88% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes bg-flash {
    0%,
    80%,
    100% {
      filter: brightness(1);
    }
    82%,
    88% {
      filter: brightness(1.5);
    }
  }

  /* SNOWY PREMIUM */
  .flake-premium {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    top: 65%;
    left: var(--l);
    animation: snow-fall-soft 3s linear infinite var(--d);
    filter: blur(0.5px);
  }
  @keyframes snow-fall-soft {
    0% {
      transform: translateY(-5px) translateX(0);
      opacity: 0;
    }
    50% {
      opacity: 1;
      transform: translateY(8px) translateX(5px);
    }
    100% {
      transform: translateY(20px) translateX(-2px);
      opacity: 0;
    }
  }

  /* MIST PREMIUM */
  .mist-premium {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }
  .mist-layer {
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    width: 100%;
    animation: mist-sweep 4s ease-in-out infinite alternate var(--d);
  }
  @keyframes mist-sweep {
    from {
      transform: translateX(-15%);
      opacity: 0.2;
    }
    to {
      transform: translateX(15%);
      opacity: 0.5;
    }
  }
</style>
