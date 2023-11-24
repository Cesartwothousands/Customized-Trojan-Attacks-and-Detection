// src/services/testServices.js

import API_ENDPOINTS from '../api/apiEndpoints';

function fetchTestApi() {
    return fetch(API_ENDPOINTS.TEST)
        .then(response => {
            if (!response.ok) {
                throw Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // data has a message property
            return data.message;
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            throw error;
        });
}

export { fetchTestApi };