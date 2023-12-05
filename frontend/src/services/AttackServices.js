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
}

export default AttackServices;