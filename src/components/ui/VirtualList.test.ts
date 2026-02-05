import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import VirtualList from './VirtualList.svelte';

describe('VirtualList', () => {
  it('should render all items when below threshold', () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    const { container } = render(VirtualList, {
      props: {
        items,
        itemHeight: 50,
        threshold: 50
      }
    });
    
    // Should render all items since 30 < 50 threshold
    const virtualItems = container.querySelectorAll('.virtual-list-item');
    expect(virtualItems.length).toBe(30);
  });
  
  it('should activate virtual scrolling when above threshold', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    const { container } = render(VirtualList, {
      props: {
        items,
        itemHeight: 50,
        threshold: 50
      }
    });
    
    // Should render only visible items + buffer since 100 > 50 threshold
    const virtualItems = container.querySelectorAll('.virtual-list-item');
    // With default buffer of 5 and viewport height, should render less than all 100 items
    expect(virtualItems.length).toBeLessThan(100);
  });
  
  it('should create spacer with correct height for virtual scrolling', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const itemHeight = 60;
    
    const { container } = render(VirtualList, {
      props: {
        items,
        itemHeight,
        threshold: 50
      }
    });
    
    // Check if spacer exists with correct total height
    const spacer = container.querySelector('.virtual-list-spacer');
    expect(spacer).toBeTruthy();
    
    if (spacer) {
      const style = (spacer as HTMLElement).style.height;
      const expectedHeight = items.length * itemHeight;
      expect(style).toBe(`${expectedHeight}px`);
    }
  });
  
  it('should not create spacer when below threshold', () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    const { container } = render(VirtualList, {
      props: {
        items,
        itemHeight: 50,
        threshold: 50
      }
    });
    
    // Should not have spacer when not virtualizing
    const spacer = container.querySelector('.virtual-list-spacer');
    expect(spacer).toBeFalsy();
  });
  
  it('should apply custom container height', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const customHeight = '500px';
    
    const { container } = render(VirtualList, {
      props: {
        items,
        itemHeight: 50,
        containerHeight: customHeight,
        threshold: 50
      }
    });
    
    const virtualContainer = container.querySelector('.virtual-list-container');
    expect(virtualContainer).toBeTruthy();
    
    if (virtualContainer) {
      const style = (virtualContainer as HTMLElement).style.maxHeight;
      expect(style).toBe(customHeight);
    }
  });
});
