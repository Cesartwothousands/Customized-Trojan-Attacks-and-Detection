// src/services/ImageTransmissionService.js

import API_ENDPOINTS from '../api/apiEndpoints';

class ImageTransmissionService {
    // Upload one image to the server using a POST request
    static async uploadImage(file){
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_UPLOAD, {
                method: 'POST',
                body: formData
            });
            if(!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return await response.json();
        } catch (error) {
            console.error("Error uploading image: ", error);
            throw error;
        }
    }

    // Get the current image from the server using a GET request
    static async getCurrentImages() {
        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_GET_LOADED, {
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

    // Delete the current image from the server using a DELETE request
    static async deleteImage() {
        try {
            const response = await fetch(API_ENDPOINTS.SINGLE_IMAGE_DELETE, {
                method: 'DELETE'
            });
            if(!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response;
        } catch (error) {
            console.error("Error deleting image: ", error);
            throw error;
        }
    }

    // Delete all images from the server using a DELETE request
    static async deleteAllImages() {
        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_DELETE_ALL, {
                method: 'DELETE'
            });
            if(!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.ok;
        } catch (error) {
            console.error("Error deleting all images: ", error);
            throw error;
        }
    }
}

export default ImageTransmissionService;
