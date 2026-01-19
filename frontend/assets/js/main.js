/**
 * Main Application Entry Point
 */

// Global state
const APP_STATE = {
    initialized: false,
    healthCheckPassed: false
};

/**
 * Initialize application
 */
async function initApp() {
    console.log('🚀 UIDAI AI Platform Starting...');
    console.log('=' .repeat(60));

    try {
        // Show loading screen
        showAppLoading();

        // Step 1: Health check
        console.log('📡 Checking backend connection...');
        const health = await api.checkHealth();
        
        if (health.status === 'healthy') {
            console.log('✓ Backend connection successful');
            console.log(`  Database: ${health.database ? '✓' : '✗'}`);
            console.log(`  LangChain: ${health.langchain ? '✓' : '✗'}`);
            APP_STATE.healthCheckPassed = true;
        } else {
            throw new Error('Backend health check failed');
        }

        // Step 2: Initialize dashboard
        console.log('📊 Initializing dashboard...');
        await dashboard.init();

        // Step 3: Initialize chat
        console.log('💬 Initializing chat interface...');
        chat.init();

        // Hide loading, show app
        hideAppLoading();
        showApp();

        APP_STATE.initialized = true;
        console.log('=' .repeat(60));
        console.log('✅ Application initialized successfully!');
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showAppError(error.message);
    }
}

/**
 * Show loading screen
 */
function showAppLoading() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div class="text-center">
                    <div class="relative">
                        <div class="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                    </div>
                    <h2 class="mt-6 text-2xl font-bold text-gray-800">UIDAI AI Intelligence Platform</h2>
                    <p class="mt-2 text-gray-600">Initializing dashboard...</p>
                    <div class="mt-6 flex items-center justify-center space-x-2">
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Hide loading screen
 */
function hideAppLoading() {
    // Will be handled by showApp()
}

/**
 * Show main app
 */
function showApp() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = ''; // Clear loading screen
        
        // Show main content (already in HTML)
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }
}

/**
 * Show error screen
 */
function showAppError(message) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen bg-gray-100">
                <div class="bg-white p-8 rounded-lg shadow-xl max-w-md">
                    <div class="text-red-500 text-6xl mb-4 text-center">⚠️</div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Connection Error</h2>
                    <p class="text-gray-600 mb-2"><strong>Error:</strong> ${message}</p>
                    <p class="text-gray-600 mb-6">Please ensure the backend server is running on <code class="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code></p>
                    
                    <div class="space-y-3">
                        <button onclick="location.reload()" class="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                            🔄 Retry Connection
                        </button>
                        
                        <div class="text-sm text-gray-500 text-center">
                            <p class="mb-2">Need help?</p>
                            <ul class="text-left ml-6">
                                <li>• Check if backend is running: <code class="bg-gray-100 px-1">python run.py</code></li>
                                <li>• Verify backend URL in config.js</li>
                                <li>• Check browser console for errors</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    // Redraw charts on resize
    if (APP_STATE.initialized) {
        dashboard.renderStatesChart();
        dashboard.renderCrisisChart();
    }
}

/**
 * Setup global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

/**
 * Setup unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Setup window resize handler
 */
window.addEventListener('resize', debounce(handleResize, 250));

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    console.log('👋 Application shutting down...');
    chartManager.destroyAll();
});

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded');
    initApp();
});

/**
 * Add keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to open chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        chat.toggle();
    }
    
    // Escape to close chat
    if (e.key === 'Escape' && chat.isOpen) {
        chat.close();
    }
});

// Export to window for debugging
window.APP = {
    state: APP_STATE,
    dashboard,
    chat,
    api,
    chartManager,
    config: CONFIG,
    // Debug functions
    debug: {
        getMetrics: () => dashboard.metrics,
        getStates: () => dashboard.statesData,
        getCrisis: () => dashboard.crisisData,
        clearChat: () => chat.clearHistory(),
        testAPI: async () => {
            console.log('Testing API...');
            const health = await api.checkHealth();
            console.log('Health:', health);
            const metrics = await api.getMetrics();
            console.log('Metrics:', metrics);
        }
    }
};

console.log('💡 Tip: Access debug tools via window.APP.debug');