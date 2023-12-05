// src/api/apiEndpoints.js

const BASE_URL = 'http://localhost:8080';
const IMAGES_URL = `${BASE_URL}/images`;
const ATTACKS_URL = `${BASE_URL}/attack`;

export const API_ENDPOINTS = {
    TEST: `${BASE_URL}/test`,
    IMAGE_UPLOAD: `${IMAGES_URL}/upload`,
    IMAGE_GET_LOADED: `${IMAGES_URL}/single/get`,
    SINGLE_IMAGE_DELETE: `${IMAGES_URL}/single/delete`,
    IMAGE_DELETE_ALL: `${IMAGES_URL}/deleteAll`,
    ATTACK_CREATE: `${ATTACKS_URL}/create`,
    ATTACK_GET: `${ATTACKS_URL}/get`,
};

export default API_ENDPOINTS;