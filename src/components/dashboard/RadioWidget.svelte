<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getRadioPlayer, type RadioStation } from '../../lib/services/radio';
  import { logger } from '../../lib/utils/logger';

  let isPlaying = false;
  let volume = 0.7;
  let error: string | null = null;
  let radioPlayer = getRadioPlayer();
  
  // Equalizer bars animation
  let bars = Array(8).fill(0);
  let animationId: number | null = null;

  const defaultStation: RadioStation = {
    name: 'AzerbaiJazz Radio',
    streamUrl: 'https://stream.zeno.fm/your-station-id',
    description: 'Jazz music from Azerbaijan'
  };

  function animateBars() {
    if (isPlaying) {
      bars = bars.map(() => Math.random() * 100);
      animationId = requestAnimationFrame(animateBars);
    } else {
      bars = Array(8).fill(0);
    }
  }

  async function togglePlay() {
    error = null;
    try {
      await radioPlayer.toggle();
      isPlaying = radioPlayer.isPlaying();
      
      if (isPlaying) {
        animateBars();
      } else if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
        bars = Array(8).fill(0);
      }
    } catch (err) {
      logger.error('Radio toggle error:', err);
      error = 'Failed to play radio';
      isPlaying = false;
    }
  }

  function handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    volume = parseFloat(target.value);
    radioPlayer.setVolume(volume);
  }

  onMount(() => {
    // Load default station if not already playing or different station
    const currentStation = radioPlayer.getCurrentStation();
    if (!currentStation) {
      radioPlayer.loadStation(defaultStation);
    }
    
    // Set initial volume
    radioPlayer.setVolume(volume);
    
    // Listen to radio events
    const handlePlay = () => {
      isPlaying = true;
      animateBars();
    };
    
    const handlePause = () => {
      isPlaying = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      bars = Array(8).fill(0);
    };
    
    const handleError = (errorMsg: string) => {
      error = errorMsg;
      isPlaying = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      bars = Array(8).fill(0);
    };
    
    radioPlayer.on('play', handlePlay);
    radioPlayer.on('pause', handlePause);
    radioPlayer.on('error', handleError);
    
    return () => {
      radioPlayer.off('play', handlePlay);
      radioPlayer.off('pause', handlePause);
      radioPlayer.off('error', handleError);
    };
  });

  onDestroy(() => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<div class="stat-card">
  <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
    Radio Player
  </h3>

  <div class="flex flex-col items-center">
    <!-- Equalizer Visualization -->
    <div class="equalizer mb-6 flex items-end justify-center gap-1 h-24">
      {#each bars as height, _i}
        <div
          class="bar bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all duration-100"
          style="height: {height}%; width: 8px;"
        ></div>
      {/each}
    </div>

    <!-- Station Info -->
    <div class="text-center mb-4">
      <div class="font-semibold text-gray-800 dark:text-white">
        {defaultStation.name}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {defaultStation.description}
      </div>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="text-sm text-red-500 mb-3">
        {error}
      </div>
    {/if}

    <!-- Play/Pause Button -->
    <button
      on:click={togglePlay}
      class="pulse-glow-button mb-4 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all"
      aria-label={isPlaying ? 'Pause radio' : 'Play radio'}
    >
      {#if isPlaying}
        <!-- Pause Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      {:else}
        <!-- Play Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      {/if}
    </button>

    <!-- Volume Control -->
    <div class="w-full">
      <label for="volume" class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
        Volume: {Math.round(volume * 100)}%
      </label>
      <input
        id="volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        on:input={handleVolumeChange}
        class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  </div>
</div>

<style>
  .equalizer {
    min-height: 96px;
  }

  .bar {
    min-height: 4px;
  }

  /* Custom slider styling */
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    border: none;
  }
</style>
