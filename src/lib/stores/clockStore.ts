import { readable } from 'svelte/store';

export const clockStore = readable(new Date(), (set) => {
  // Update immediately
  set(new Date());

  // Update every second (to stay synced)
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return () => {
    clearInterval(interval);
  };
});
