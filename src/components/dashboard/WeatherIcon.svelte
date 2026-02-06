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

<div class="weather-icon-wrapper" style="width: {size}px; height: {size}px;">
  {#if isClear}
    {#if isDay}
      <div class="sun">
        <div class="sun-body"></div>
        {#each Array(8) as _, i}
          <div class="sun-ray" style="--i:{i}"></div>
        {/each}
      </div>
    {:else}
      <div class="moon">
        <div class="moon-body"></div>
        <div class="crater"></div>
      </div>
    {/if}
  {:else if isCloudy}
    <div class="clouds">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      {#if isDay && icon.startsWith('02')}
        <div class="sun-mini"></div>
      {/if}
    </div>
  {:else if isRain}
    <div class="rain-cloud">
      <div class="cloud"></div>
      <div class="rain">
        {#each Array(4) as _, i}
          <div class="drop" style="--d:{i * 0.2}s; --l:{25 + i * 20}%"></div>
        {/each}
      </div>
    </div>
  {:else if isThunder}
    <div class="thunder-cloud">
      <div class="cloud"></div>
      <div class="bolt">
        <svg viewBox="0 0 24 24" fill="currentColor"
          ><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg
        >
      </div>
    </div>
  {:else if isSnow}
    <div class="snow-cloud">
      <div class="cloud"></div>
      <div class="snow">
        {#each Array(5) as _, i}
          <div class="flake" style="--d:{i * 0.3}s; --l:{15 + i * 15}%"></div>
        {/each}
      </div>
    </div>
  {:else if isMist}
    <div class="mist">
      {#each Array(3) as _, i}
        <div class="mist-line" style="--i:{i}"></div>
      {/each}
    </div>
  {:else}
    <!-- Fallback -->
    <div class="sun"><div class="sun-body"></div></div>
  {/if}
</div>

<style>
  .weather-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* SUN ANIMATION */
  .sun {
    position: relative;
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sun-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #ffcd00 0%, #ff9000 100%);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(255, 165, 0, 0.4);
    z-index: 2;
  }
  .sun-ray {
    position: absolute;
    width: 2px;
    height: 120%;
    background: linear-gradient(to top, transparent, #ff9000, transparent);
    transform: rotate(calc(var(--i) * 45deg));
    animation: rotate-rays 10s linear infinite;
  }
  @keyframes rotate-rays {
    from {
      transform: rotate(calc(var(--i) * 45deg));
    }
    to {
      transform: rotate(calc(var(--i) * 45deg + 360deg));
    }
  }

  /* MOON ANIMATION */
  .moon {
    width: 60%;
    height: 60%;
    position: relative;
  }
  .moon-body {
    width: 100%;
    height: 100%;
    background: #e2e8f0;
    border-radius: 50%;
    box-shadow: inset -10px -10px 0 0 #cbd5e1;
  }
  .crater {
    position: absolute;
    width: 20%;
    height: 20%;
    background: #cbd5e1;
    border-radius: 50%;
    top: 30%;
    left: 40%;
  }

  /* CLOUD ANIMATIONS */
  .clouds,
  .rain-cloud,
  .thunder-cloud,
  .snow-cloud {
    width: 100%;
    height: 70%;
    position: relative;
  }
  .cloud {
    position: absolute;
    width: 70%;
    height: 60%;
    background: #fff;
    border-radius: 50px;
    filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));
  }
  :global(.dark) .cloud {
    background: #475569;
  }
  .cloud::before,
  .cloud::after {
    content: '';
    position: absolute;
    background: inherit;
    border-radius: 50%;
  }
  .cloud::before {
    width: 50%;
    height: 80%;
    top: -40%;
    left: 15%;
  }
  .cloud::after {
    width: 40%;
    height: 70%;
    top: -30%;
    right: 15%;
  }

  .cloud-1 {
    top: 20%;
    left: 10%;
    z-index: 2;
    animation: float-cloud 4s ease-in-out infinite;
  }
  .cloud-2 {
    top: 5%;
    right: 10%;
    opacity: 0.6;
    transform: scale(0.8);
    animation: float-cloud 6s ease-in-out reverse infinite;
  }

  @keyframes float-cloud {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(5px, 5px);
    }
  }

  .sun-mini {
    position: absolute;
    width: 30%;
    height: 40%;
    background: #ffcd00;
    border-radius: 50%;
    top: -5%;
    right: 25%;
    z-index: 1;
  }

  /* RAIN ANIMATION */
  .rain {
    position: absolute;
    width: 100%;
    height: 40%;
    bottom: -20%;
  }
  .drop {
    position: absolute;
    width: 2px;
    height: 10px;
    background: #60a5fa;
    border-radius: 2px;
    top: 0;
    left: var(--l);
    animation: rain-drop 0.8s linear infinite var(--d);
  }
  @keyframes rain-drop {
    0% {
      transform: translateY(-10px);
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

  /* BOLT ANIMATION */
  .bolt {
    position: absolute;
    width: 30%;
    height: 50%;
    bottom: -30%;
    left: 35%;
    color: #fbbf24;
    animation: flash 1.5s infinite;
  }
  @keyframes flash {
    0%,
    90% {
      opacity: 0;
    }
    92%,
    98% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* SNOW ANIMATION */
  .snow {
    position: absolute;
    width: 100%;
    height: 40%;
    bottom: -20%;
  }
  .flake {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    top: 0;
    left: var(--l);
    animation: snow-fall 3s linear infinite var(--d);
  }
  @keyframes snow-fall {
    0% {
      transform: translateY(-10px) rotate(0deg);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(20px) rotate(360deg);
      opacity: 0;
    }
  }

  /* MIST ANIMATION */
  .mist {
    width: 80%;
    height: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .mist-line {
    height: 3px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    animation: mist-move 3s ease-in-out infinite alternate;
    animation-delay: calc(var(--i) * 0.5s);
  }
  @keyframes mist-move {
    from {
      width: 60%;
      transform: translateX(-10%);
    }
    to {
      width: 90%;
      transform: translateX(10%);
    }
  }
</style>
