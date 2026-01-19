/**
 * Chart rendering using Chart.js
 */
class ChartManager {
    constructor() {
        this.charts = {}; // Store chart instances
    }

    /**
     * Destroy existing chart if exists
     */
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    /**
     * Create horizontal bar chart for state rankings
     */
    createStateRankingChart(canvasId, data) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Limit to top 15 for better visibility
        const topStates = data.slice(0, 15);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topStates.map(d => d.state),
                datasets: [{
                    label: 'Biometric Ratio',
                    data: topStates.map(d => d.bio_ratio),
                    backgroundColor: topStates.map(d => getSeverityColor(d.bio_ratio)),
                    borderColor: topStates.map(d => getSeverityColor(d.bio_ratio).replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bars
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ratio: ${context.parsed.x.toFixed(2)}x`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Biometric Update Ratio'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create crisis districts chart
     */
    createCrisisChart(canvasId, data) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Top 10 crisis districts
        const topCrisis = data.slice(0, 10);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topCrisis.map(d => `${d.district}, ${d.state}`),
                datasets: [{
                    label: 'Z-Score',
                    data: topCrisis.map(d => d.z_score),
                    backgroundColor: CONFIG.COLORS.DANGER,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = topCrisis[context.dataIndex];
                                return [
                                    `Z-Score: ${item.z_score.toFixed(2)}σ`,
                                    `Ratio: ${item.bio_ratio.toFixed(2)}x`,
                                    `Enrollments: ${formatNumber(item.enrollments)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Standard Deviations (σ)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create pie chart for distribution
     */
    createPieChart(canvasId, labels, data, title) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        CONFIG.COLORS.PRIMARY,
                        CONFIG.COLORS.SUCCESS,
                        CONFIG.COLORS.WARNING,
                        CONFIG.COLORS.DANGER,
                        CONFIG.COLORS.PURPLE
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        });
    }

    /**
     * Create chart from AI chat response
     */
    createChatChart(canvasId, chartData) {
        if (!chartData || !chartData.type) return;

        this.destroyChart(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, chartData);
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }
}

// Create global chart manager instance
const chartManager = new ChartManager();