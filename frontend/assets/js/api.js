/**
 * API Service - Handles all backend communication
 */
class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async fetch(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async checkHealth() {
        return await this.fetch(CONFIG.ENDPOINTS.HEALTH);
    }

    /**
     * Get dashboard metrics
     */
    async getMetrics() {
        return await this.fetch(CONFIG.ENDPOINTS.METRICS);
    }

    /**
     * Get state rankings
     */
    async getStates(limit = 20) {
        return await this.fetch(`${CONFIG.ENDPOINTS.STATES}?limit=${limit}`);
    }

    /**
     * Get crisis districts
     */
    async getCrisisDistricts(limit = 30) {
        return await this.fetch(`${CONFIG.ENDPOINTS.CRISIS_DISTRICTS}?limit=${limit}`);
    }

    /**
     * Get filter options
     */
    async getFilters() {
        return await this.fetch(CONFIG.ENDPOINTS.FILTERS);
    }

    /**
     * Send chat message
     */
    async sendChatMessage(question) {
        return await this.fetch(CONFIG.ENDPOINTS.CHAT, {
            method: 'POST',
            body: JSON.stringify({ question })
        });
    }
}

// Create global API instance
const api = new APIService();