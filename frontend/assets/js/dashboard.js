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
    renderMetrics() {
        if (!this.metrics) return;

        const metricsHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Total Enrollments -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total Enrollments</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">
                                ${formatLargeNumber(this.metrics.total_enrollments)}
                            </p>
                        </div>
                        <div class="text-blue-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Biometric Updates -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Biometric Updates</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">
                                ${formatLargeNumber(this.metrics.total_bio_updates)}
                            </p>
                            <p class="text-sm text-gray-600 mt-1">
                                Ratio: <span class="font-semibold">${formatRatio(this.metrics.national_bio_ratio)}</span>
                            </p>
                        </div>
                        <div class="text-yellow-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Crisis Districts -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Crisis Districts</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">
                                ${this.metrics.crisis_districts_count}
                            </p>
                            <p class="text-sm text-red-600 mt-1 font-semibold">
                                Require Urgent Attention
                            </p>
                        </div>
                        <div class="text-red-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Demographic Updates -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Demographic Updates</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">
                                ${formatLargeNumber(this.metrics.total_demo_updates)}
                            </p>
                            <p class="text-sm text-gray-600 mt-1">
                                Ratio: <span class="font-semibold">${formatRatio(this.metrics.national_demo_ratio)}</span>
                            </p>
                        </div>
                        <div class="text-green-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Affected Population -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Estimated Affected</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">
                                10-15M
                            </p>
                            <p class="text-sm text-gray-600 mt-1">
                                Citizens in crisis zones
                            </p>
                        </div>
                        <div class="text-purple-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Last Updated -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Last Updated</p>
                            <p class="text-lg font-semibold text-gray-800 mt-2">
                                ${getTimestamp()}
                            </p>
                            <button onclick="dashboard.refresh()" class="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium">
                                🔄 Refresh Data
                            </button>
                        </div>
                        <div class="text-gray-500">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
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