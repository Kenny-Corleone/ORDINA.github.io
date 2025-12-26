// ============================================================================
// SKELETON LOADER COMPONENTS
// ============================================================================

/**
 * Create skeleton loader for news items
 */
export function createNewsSkeleton(count = 5) {
    return Array.from({ length: count }, () => `
        <article class="news-item-skeleton animate-pulse">
            <div class="news-item-image-skeleton bg-gray-200 dark:bg-gray-700 rounded-lg w-20 h-20 flex-shrink-0"></div>
            <div class="news-item-content-skeleton flex-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        </article>
    `).join('');
}

/**
 * Create skeleton loader for stat cards
 */
export function createStatCardSkeleton(count = 6) {
    return Array.from({ length: count }, () => `
        <div class="stat-card-skeleton animate-pulse">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
            <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
    `).join('');
}

/**
 * Create skeleton loader for table rows
 */
export function createTableRowSkeleton(count = 5, columns = 4) {
    return Array.from({ length: count }, () => `
        <tr class="table-row-skeleton animate-pulse">
            ${Array.from({ length: columns }, () => `
                <td class="px-6 py-4">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </td>
            `).join('')}
        </tr>
    `).join('');
}

/**
 * Create skeleton loader for chart
 */
export function createChartSkeleton() {
    return `
        <div class="chart-skeleton animate-pulse h-80 w-full">
            <div class="flex items-end justify-between h-full gap-2">
                ${Array.from({ length: 12 }, (_, i) => {
                    const height = Math.random() * 60 + 20;
                    return `<div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t" style="height: ${height}%"></div>`;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Show skeleton loader in container
 */
export function showSkeleton(containerId, skeletonType, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let skeletonHTML = '';
    
    switch (skeletonType) {
        case 'news':
            skeletonHTML = createNewsSkeleton(options.count || 5);
            break;
        case 'stat-cards':
            skeletonHTML = createStatCardSkeleton(options.count || 6);
            break;
        case 'table':
            skeletonHTML = createTableRowSkeleton(options.count || 5, options.columns || 4);
            break;
        case 'chart':
            skeletonHTML = createChartSkeleton();
            break;
        default:
            skeletonHTML = '<div class="skeleton-loader animate-pulse">Loading...</div>';
    }
    
    container.innerHTML = skeletonHTML;
}

/**
 * Hide skeleton loader
 */
export function hideSkeleton(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const skeletons = container.querySelectorAll('.skeleton-loader, .news-item-skeleton, .stat-card-skeleton, .table-row-skeleton, .chart-skeleton');
        skeletons.forEach(s => s.remove());
    }
}
