<script lang="ts">
  import { onMount } from 'svelte';
  import { uiStore } from '../../lib/stores/uiStore';
  import {
    fetchWeather,
    fetchWeatherByLocation,
    weatherIcons,
    type WeatherData,
  } from '../../lib/services/weather';
  import WeatherIcon from './WeatherIcon.svelte';

  let weather: WeatherData | null = null;
  let loading = true;
  let error: string | null = null;

  async function loadWeather() {
    loading = true;
    error = null;

    try {
      // Try by location first
      weather = await fetchWeatherByLocation($uiStore.language);
    } catch (err) {
      logger.error('Weather fetch error:', err);
      error = 'Unable to load weather';
    } finally {
      loading = false;
    }
  }

  // Reload weather when language changes
  $: if ($uiStore.language) {
    loadWeather();
  }

  onMount(() => {
    loadWeather();
    const intervalId = setInterval(loadWeather, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  });
</script>

<div class="stat-card">
  {#if loading}
    <div class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  {:else if error}
    <div class="flex flex-col items-center justify-center h-full text-red-500">
      <p class="mb-2 text-xs">{error}</p>
      <button
        on:click={loadWeather}
        class="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-[10px] hover:bg-red-200 dark:hover:bg-red-900/50"
        >Retry</button
      >
    </div>
  {:else if weather}
    <div class="flex items-center justify-between h-full">
      <div class="flex flex-col justify-center">
        <div class="text-3xl font-black text-gray-800 dark:text-white leading-none">
          {weather.temp}°
        </div>
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
          {weather.city}
        </div>
        <div class="text-[9px] font-medium text-gray-500 line-clamp-1">
          {weather.condition}
        </div>
      </div>
      <div class="flex items-center justify-center">
        <WeatherIcon icon={weather.icon} size={54} />
      </div>
    </div>
  {/if}
</div>

<style>
</style>
