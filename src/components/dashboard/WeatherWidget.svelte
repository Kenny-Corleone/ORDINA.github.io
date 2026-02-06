<script lang="ts">
  import { onMount } from "svelte";
  import { uiStore } from "../../lib/stores/uiStore";
  import {
    fetchWeather,
    fetchWeatherByLocation,
    weatherIcons,
    type WeatherData,
  } from "../../lib/services/weather";
  import { logger } from "../../lib/utils/logger";

  let weather: WeatherData | null = null;
  let loading = true;
  let error: string | null = null;

  async function loadWeather() {
    loading = true;
    error = null;

    try {
      // Try to get weather by geolocation first
      try {
        weather = await fetchWeatherByLocation($uiStore.language);
      } catch (geoError) {
        // Fallback to default city if geolocation fails
        logger.debug("Geolocation failed, using default city");
        weather = await fetchWeather("Baku", $uiStore.language);
      }
    } catch (err) {
      logger.error("Weather fetch error:", err);
      error = "Unable to load weather";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadWeather();

    // Refresh weather every 15 minutes
    const intervalId = setInterval(loadWeather, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  });

  $: iconSvg = weather
    ? weatherIcons[weather.icon] || weatherIcons["01d"]
    : weatherIcons["01d"];
</script>

<div class="stat-card">
  {#if loading}
    <div class="flex items-center justify-center h-32">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"
      ></div>
    </div>
  {:else if error}
    <div class="flex flex-col items-center justify-center h-32 text-red-500">
      <p class="mb-2 text-sm">{error}</p>
      <button
        on:click={loadWeather}
        class="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
      >
        Retry
      </button>
    </div>
  {:else if weather}
    <div class="flex items-center justify-between">
      <div>
        <div class="text-4xl font-bold text-gray-800 dark:text-white">
          {weather.temp}°C
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {weather.condition}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {weather.city}
        </div>
      </div>
      <div class="weather-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          class="text-yellow-500 dark:text-yellow-400"
        >
          {@html iconSvg}
        </svg>
      </div>
    </div>
  {/if}
</div>

<style>
  .weather-icon {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
