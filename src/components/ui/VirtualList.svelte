<!--
  Virtual List Component
  
  Implements virtual scrolling for performance optimization with large lists.
  Only renders items that are visible in the viewport plus a buffer zone.
  
  How it works:
  1. Creates a spacer div with the full height of all items (totalHeight)
  2. Calculates which items are visible based on scroll position
  3. Only renders visible items plus buffer items above/below
  4. Uses CSS transform to position the visible items correctly
  5. Falls back to regular rendering for small lists (< threshold)
  
  Performance benefits:
  - Reduces DOM nodes from thousands to ~20-30 visible items
  - Maintains smooth scrolling with large datasets (1000+ items)
  - Minimal memory footprint
  
  Requirements: 10.1, 10.6
-->
<script lang="ts" generics="T">
  import { onMount, tick } from 'svelte';
  
  // Props
  export let items: T[] = [];
  export let itemHeight: number = 60; // Default height in pixels
  export let bufferSize: number = 5; // Number of items to render above/below viewport
  export let containerHeight: string = '600px'; // Max height of the scrollable container
  export let threshold: number = 50; // Only activate virtual scrolling if items > threshold
  
  // State
  let scrollTop = 0;
  let containerElement: HTMLDivElement;
  let viewportHeight = 0;
  
  // Computed values
  // Total height needed to contain all items (creates scrollable space)
  $: totalHeight = items.length * itemHeight;
  
  // Only use virtual scrolling for large lists to avoid overhead
  $: shouldVirtualize = items.length > threshold;
  
  // Calculate visible range with buffer
  // Buffer prevents flickering when scrolling by pre-rendering items just outside viewport
  $: startIndex = shouldVirtualize 
    ? Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
    : 0;
  
  $: endIndex = shouldVirtualize
    ? Math.min(
        items.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize
      )
    : items.length;
  
  // Extract only the items that should be rendered
  $: visibleItems = items.slice(startIndex, endIndex);
  
  // Calculate vertical offset to position visible items correctly
  // This makes the visible items appear at the right scroll position
  $: offsetY = startIndex * itemHeight;
  
  /**
   * Handle scroll events to update visible range
   * Updates scrollTop which triggers recalculation of visible items
   */
  function handleScroll(event: Event) {
    const target = event.target as HTMLDivElement;
    scrollTop = target.scrollTop;
  }
  
  /**
   * Update viewport height on mount and when container is resized
   * Uses ResizeObserver to detect container size changes
   */
  onMount(() => {
    if (containerElement) {
      viewportHeight = containerElement.clientHeight;
      
      // Watch for container size changes (e.g., window resize, layout changes)
      const resizeObserver = new ResizeObserver(() => {
        viewportHeight = containerElement.clientHeight;
      });
      
      resizeObserver.observe(containerElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  });
</script>

<div
  bind:this={containerElement}
  class="virtual-list-container"
  style="max-height: {containerHeight}; overflow-y: auto;"
  on:scroll={handleScroll}
>
  {#if shouldVirtualize}
    <!-- Virtual scrolling mode -->
    <div class="virtual-list-spacer" style="height: {totalHeight}px; position: relative;">
      <div class="virtual-list-content" style="transform: translateY({offsetY}px);">
        {#each visibleItems as item, index (startIndex + index)}
          <div class="virtual-list-item" style="height: {itemHeight}px;">
            <slot {item} index={startIndex + index} />
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Regular rendering mode (< threshold items) -->
    <div class="virtual-list-content">
      {#each items as item, index (index)}
        <div class="virtual-list-item">
          <slot {item} {index} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .virtual-list-container {
    width: 100%;
    position: relative;
  }
  
  .virtual-list-spacer {
    width: 100%;
  }
  
  .virtual-list-content {
    width: 100%;
  }
  
  .virtual-list-item {
    width: 100%;
  }
</style>
