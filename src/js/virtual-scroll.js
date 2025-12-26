// ============================================================================
// VIRTUAL SCROLLING IMPLEMENTATION
// ============================================================================

import { logger } from './utils.js';

/**
 * Virtual scrolling for large lists
 * Only renders visible items + buffer
 */
export class VirtualScroll {
    constructor(container, itemHeight, renderItem, totalItems) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.totalItems = totalItems;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.buffer = 5; // Number of items to render outside viewport
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            logger.error('VirtualScroll: Container not found');
            return;
        }
        
        // Set container height
        this.container.style.height = `${this.totalItems * this.itemHeight}px`;
        this.container.style.position = 'relative';
        this.container.style.overflow = 'auto';
        
        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.style.position = 'relative';
        this.viewport.style.width = '100%';
        this.container.appendChild(this.viewport);
        
        // Calculate visible range
        this.updateVisibleRange();
        
        // Render initial items
        this.render();
        
        // Listen to scroll events
        this.container.addEventListener('scroll', this.onScroll.bind(this));
        
        // Handle resize
        window.addEventListener('resize', this.onResize.bind(this));
    }
    
    updateVisibleRange() {
        const scrollTop = this.container.scrollTop || 0;
        const containerHeight = this.container.clientHeight;
        
        this.visibleStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
        this.visibleEnd = Math.min(
            this.totalItems - 1,
            Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
        );
    }
    
    render() {
        if (!this.viewport) return;
        
        // Clear existing items
        this.viewport.innerHTML = '';
        
        // Create wrapper for visible items
        const itemsWrapper = document.createElement('div');
        itemsWrapper.style.position = 'absolute';
        itemsWrapper.style.top = `${this.visibleStart * this.itemHeight}px`;
        itemsWrapper.style.width = '100%';
        
        // Render visible items
        for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
            const item = this.renderItem(i);
            if (item) {
                itemsWrapper.appendChild(item);
            }
        }
        
        this.viewport.appendChild(itemsWrapper);
    }
    
    onScroll() {
        const oldStart = this.visibleStart;
        const oldEnd = this.visibleEnd;
        
        this.updateVisibleRange();
        
        // Only re-render if visible range changed significantly
        if (Math.abs(this.visibleStart - oldStart) > this.buffer || 
            Math.abs(this.visibleEnd - oldEnd) > this.buffer) {
            this.render();
        }
    }
    
    onResize() {
        this.updateVisibleRange();
        this.render();
    }
    
    update(totalItems) {
        this.totalItems = totalItems;
        this.container.style.height = `${this.totalItems * this.itemHeight}px`;
        this.updateVisibleRange();
        this.render();
    }
    
    destroy() {
        if (this.container) {
            this.container.removeEventListener('scroll', this.onScroll);
        }
        window.removeEventListener('resize', this.onResize);
        if (this.viewport && this.viewport.parentNode) {
            this.viewport.parentNode.removeChild(this.viewport);
        }
    }
}

/**
 * Simple virtual scroll for table rows
 */
export function initVirtualScrollTable(tableId, rowHeight = 50) {
    const table = document.getElementById(tableId);
    if (!table) return null;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return null;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const totalRows = rows.length;
    
    if (totalRows < 20) {
        // Don't use virtual scroll for small lists
        return null;
    }
    
    // Store original rows data
    const rowsData = rows.map(row => row.cloneNode(true));
    
    // Create virtual scroll container
    const container = document.createElement('div');
    container.style.height = `${Math.min(500, totalRows * rowHeight)}px`;
    container.style.overflow = 'auto';
    container.className = 'virtual-scroll-container';
    
    // Replace tbody with virtual scroll
    const parent = tbody.parentNode;
    parent.replaceChild(container, tbody);
    
    const virtualScroll = new VirtualScroll(
        container,
        rowHeight,
        (index) => rowsData[index]?.cloneNode(true) || null,
        totalRows
    );
    
    return virtualScroll;
}
