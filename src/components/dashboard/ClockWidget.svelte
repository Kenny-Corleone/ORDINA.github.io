<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let currentTime = new Date();
  let intervalId: number | null = null;

  onMount(() => {
    // Update time every second
    intervalId = window.setInterval(() => {
      currentTime = new Date();
    }, 1000);
  });

  onDestroy(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  $: hours = currentTime.getHours().toString().padStart(2, '0');
  $: minutes = currentTime.getMinutes().toString().padStart(2, '0');
  $: seconds = currentTime.getSeconds().toString().padStart(2, '0');
  $: date = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
</script>

<div class="stat-card text-center">
  <div class="text-5xl font-bold mb-2 text-gradient">
    {hours}:{minutes}:{seconds}
  </div>
  <div class="text-sm text-gray-600 dark:text-gray-400">
    {date}
  </div>
</div>

<style>
  .text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
