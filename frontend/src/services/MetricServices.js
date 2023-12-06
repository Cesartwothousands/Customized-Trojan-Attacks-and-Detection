// src/services/MetricServices.js

import API_ENDPOINTS from '../api/apiEndpoints';

class MetricServices {
    // Get the current result from the server using a GET request
    static async getMetrics() {
        try {
            const response = await fetch(API_ENDPOINTS.METRICS_RESULT, {
                method: 'GET'
            });
            if(!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return await response.json();
        } catch (error) {
            console.error("Error getting metrics: ", error);
            throw error;
        }
    }
}

export default MetricServices;