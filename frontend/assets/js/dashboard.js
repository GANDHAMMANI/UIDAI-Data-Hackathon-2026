/**
 * Dashboard Logic - Handles all dashboard operations
 */
class Dashboard {
    constructor() {
        this.metrics = null;
        this.statesData = null;
        this.crisisData = null;
        this.filters = null;
        this.selectedState = null;
    }

    /**
     * Initialize dashboard
     */
    async init() {
        console.log('📊 Initializing dashboard...');
        
        try {
            // Load all data
            await this.loadMetrics();
            await this.loadStates();
            await this.loadCrisisDistricts();
            await this.loadFilters();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✓ Dashboard initialized successfully');
        } catch (error) {
            console.error('✗ Dashboard initialization failed:', error);
            this.showGlobalError('Failed to load dashboard data');
        }
    }

    /**
     * Load metrics
     */
    async loadMetrics() {
        try {
            showLoading('metrics-container');
            
            this.metrics = await api.getMetrics();
            this.renderMetrics();
            
        } catch (error) {
            console.error('Failed to load metrics:', error);
            showError('metrics-container', 'Failed to load metrics');
        }
    }

    /**
     * Load states data
     */
    async loadStates(limit = 20) {
    try {
        // showLoading('states-chart'); // ← REMOVE THIS LINE
        
        this.statesData = await api.getStates(limit);
        this.renderStatesChart();
        
    } catch (error) {
        console.error('Failed to load states:', error);
        // showError('states-chart', 'Failed to load state data'); // ← REMOVE THIS TOO
    }
}

async loadCrisisDistricts(limit = 30) {
    try {
        // showLoading('crisis-chart'); // ← REMOVE THIS LINE
        
        this.crisisData = await api.getCrisisDistricts(limit);
        this.renderCrisisChart();
        this.renderCrisisTable();
        
    } catch (error) {
        console.error('Failed to load crisis districts:', error);
        // showError('crisis-chart', 'Failed to load crisis data'); // ← REMOVE THIS TOO
    }
}

    /**
     * Load filter options
     */
    async loadFilters() {
        try {
            this.filters = await api.getFilters();
            this.renderFilters();
        } catch (error) {
            console.error('Failed to load filters:', error);
        }
    }

    /**
     * Render metrics cards
     */
   /**
 * Render metrics cards - PROFESSIONAL DESIGN
 */
renderMetrics() {
    if (!this.metrics) return;

    const metricsHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Total Enrollments -->
            <div class="metric-card border-l-4 border-blue-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enrollments</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <p class="text-3xl font-bold text-gray-900">
                                ${formatLargeNumber(this.metrics.total_enrollments)}
                            </p>
                            <p class="text-sm text-gray-600 mt-1">New Aadhaar registrations</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Biometric Updates -->
            <div class="metric-card border-l-4 border-yellow-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Biometric Updates</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <p class="text-3xl font-bold text-gray-900">
                                ${formatLargeNumber(this.metrics.total_bio_updates)}
                            </p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    ${formatRatio(this.metrics.national_bio_ratio)} National Avg
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Crisis Districts -->
            <div class="metric-card border-l-4 border-red-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Crisis Districts</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <p class="text-3xl font-bold text-red-600">
                                ${this.metrics.crisis_districts_count}
                            </p>
                            <p class="text-sm font-semibold text-red-600 mt-1">
                                ⚠️ Require Urgent Action
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Demographic Updates -->
            <div class="metric-card border-l-4 border-green-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demographic Updates</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <p class="text-3xl font-bold text-gray-900">
                                ${formatLargeNumber(this.metrics.total_demo_updates)}
                            </p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    ${formatRatio(this.metrics.national_demo_ratio)} National Avg
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Affected Population -->
            <div class="metric-card border-l-4 border-purple-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Affected Population</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <p class="text-3xl font-bold text-gray-900">
                                10-15M
                            </p>
                            <p class="text-sm text-gray-600 mt-1">Citizens in crisis zones</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Health -->
            <div class="metric-card border-l-4 border-blue-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Status</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                    Live
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">
                                ${getTimestamp()}
                            </p>
                            <button onclick="dashboard.refresh()" class="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('metrics-container').innerHTML = metricsHTML;
}

    /**
     * Render states chart
     */
    renderStatesChart() {
        if (!this.statesData) return;
        
        chartManager.createStateRankingChart('statesChart', this.statesData);
    }

    /**
     * Render crisis chart
     */
    renderCrisisChart() {
        if (!this.crisisData) return;
        
        chartManager.createCrisisChart('crisisChart', this.crisisData);
    }

    /**
     * Render crisis districts table
     */
    renderCrisisTable() {
        if (!this.crisisData) return;

        const tableHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-200">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rank</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">State</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">District</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Enrollments</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Bio Updates</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Ratio</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Z-Score</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Severity</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${this.crisisData.slice(0, 20).map((district, index) => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-medium text-gray-900">${index + 1}</td>
                                <td class="px-4 py-3 text-sm text-gray-700">${district.state}</td>
                                <td class="px-4 py-3 text-sm font-medium text-gray-900">${district.district}</td>
                                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(district.enrollments)}</td>
                                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(district.bio_updates)}</td>
                                <td class="px-4 py-3 text-sm text-right font-semibold" style="color: ${district.bio_ratio > 40 ? '#DC2626' : district.bio_ratio > 30 ? '#F59E0B' : '#3B82F6'}">
                                    ${formatRatio(district.bio_ratio)}
                                </td>
                                <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">${district.z_score.toFixed(2)}σ</td>
                                <td class="px-4 py-3 text-center">
                                    <span class="px-2 py-1 text-xs font-semibold rounded ${district.z_score > 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                        ${district.z_score > 3 ? 'EXTREME' : 'HIGH'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const container = document.getElementById('crisis-table');
        if (container) {
            container.innerHTML = tableHTML;
        }
    }

    /**
     * Render filters
     */
    renderFilters() {
        if (!this.filters) return;

        const filterHTML = `
            <div class="flex items-center space-x-4">
                <div>
                    <label for="state-filter" class="block text-sm font-medium text-gray-700 mb-1">Filter by State</label>
                    <select id="state-filter" class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        <option value="">All States</option>
                        ${this.filters.states.map(state => `
                            <option value="${state}">${state}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;

        const container = document.getElementById('filters-container');
        if (container) {
            container.innerHTML = filterHTML;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // State filter
        const stateFilter = document.getElementById('state-filter');
        if (stateFilter) {
            stateFilter.addEventListener('change', (e) => {
                this.selectedState = e.target.value;
                this.applyFilters();
            });
        }
    }

    /**
     * Apply filters
     */
    applyFilters() {
        // Filter crisis data
        let filteredCrisis = this.crisisData;
        
        if (this.selectedState) {
            filteredCrisis = this.crisisData.filter(d => d.state === this.selectedState);
        }

        // Re-render with filtered data
        chartManager.createCrisisChart('crisisChart', filteredCrisis);
        this.renderCrisisTableFiltered(filteredCrisis);
    }

    /**
     * Render filtered crisis table
     */
    renderCrisisTableFiltered(data) {
        // Similar to renderCrisisTable but with filtered data
        // (Implementation similar to renderCrisisTable above)
    }

    /**
     * Refresh all data
     */
    async refresh() {
        console.log('🔄 Refreshing dashboard...');
        await this.init();
    }

    /**
     * Show global error
     */
    showGlobalError(message) {
        const container = document.getElementById('app');
        if (container) {
            container.innerHTML = `
                <div class="flex items-center justify-center min-h-screen bg-gray-100">
                    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md">
                        <div class="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">Error</h2>
                        <p class="text-gray-600 mb-6">${message}</p>
                        <button onclick="location.reload()" class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Reload Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Create global dashboard instance
const dashboard = new Dashboard();