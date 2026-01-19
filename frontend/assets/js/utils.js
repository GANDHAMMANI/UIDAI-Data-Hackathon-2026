/**
 * Utility functions
 */

/**
 * Format large numbers with commas
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format number to millions/crores
 */
function formatLargeNumber(num) {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(2) + 'Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(2) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

/**
 * Format ratio with 'x' suffix
 */
function formatRatio(ratio) {
    if (ratio === null || ratio === undefined) return '0x';
    return `${ratio.toFixed(2)}x`;
}

/**
 * Show loading spinner
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        `;
    }
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p class="font-medium">Error</p>
                <p class="text-sm">${message}</p>
            </div>
        `;
    }
}

/**
 * Debounce function for search/filter
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get color based on severity
 */
function getSeverityColor(ratio) {
    if (ratio > 40) return CONFIG.COLORS.DANGER;
    if (ratio > 30) return CONFIG.COLORS.WARNING;
    if (ratio > 20) return 'rgba(255, 152, 0, 0.8)'; // Orange
    return CONFIG.COLORS.PRIMARY;
}

/**
 * Truncate text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Download data as JSON
 */
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Get current timestamp
 */
function getTimestamp() {
    return new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}