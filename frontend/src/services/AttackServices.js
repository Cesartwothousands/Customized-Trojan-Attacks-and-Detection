// src/services/AttackServices.js

import API_ENDPOINTS from '../api/apiEndpoints';

class AttackServices {
    // Create a new attack using a POST request
    static async createAttack(attackData) {
        try{
            const response = await fetch(API_ENDPOINTS.ATTACK_CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attackData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        }
        catch (error) {
            console.error("Error creating attack: ", error);
            throw error;
        }
    }

    // Get the current image from the server using a GET request
    static async getCurrentImages() {
        try {
            const response = await fetch(API_ENDPOINTS.ATTACK_GET, {
                method: 'GET'
            });
            if(!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return await response.blob();
        } catch (error) {
            console.error("Error getting image: ", error);
            throw error;
        }
    }
}

export default AttackServices;