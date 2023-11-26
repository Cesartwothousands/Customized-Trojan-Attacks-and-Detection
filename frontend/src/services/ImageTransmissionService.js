// src/services/ImageTransmissionService.js

import API_ENDPOINTS from '../api/apiEndpoints';

class ImageTransmissionService {
    static async uploadImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_UPLOAD, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error("Error uploading image: ", error);
        }
    }

    static async getImages() {
        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_GET_LOADED, {
                method: 'GET'
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching images: ", error);
        }
    }

    static async deleteImage() {
        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_DELETE, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error("Error deleting image: ", error);
        }
    }

    static async deleteAllImages() {
        try {
            const response = await fetch(API_ENDPOINTS.IMAGE_DELETE_ALL, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error("Error deleting all images: ", error);
        }
    }
}

export default ImageTransmissionService;
