/**
 * API Configuration
 */
const CONFIG = {
    // Backend API URL
    API_BASE_URL: 'http://localhost:8000',
    
    // API Endpoints
    ENDPOINTS: {
        HEALTH: '/health',
        METRICS: '/api/dashboard/metrics',
        STATES: '/api/dashboard/states',
        CRISIS_DISTRICTS: '/api/dashboard/crisis-districts',
        FILTERS: '/api/dashboard/filters',
        CHAT: '/api/chat/'
    },
    
    // Chart Colors
    COLORS: {
        PRIMARY: 'rgba(59, 130, 246, 0.8)',      // Blue
        SUCCESS: 'rgba(16, 185, 129, 0.8)',       // Green
        WARNING: 'rgba(251, 191, 36, 0.8)',       // Yellow
        DANGER: 'rgba(239, 68, 68, 0.8)',         // Red
        PURPLE: 'rgba(139, 92, 246, 0.8)',        // Purple
        GRAY: 'rgba(107, 114, 128, 0.8)'          // Gray
    },
    
    // Chart Options
    CHART_DEFAULTS: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    }
};