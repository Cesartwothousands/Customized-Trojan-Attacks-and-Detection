// src/api/apiEndpoints.js

const BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
    TEST: `${BASE_URL}/test`,
    IMAGE_UPLOAD: `${BASE_URL}/images/upload`,
    IMAGE_GET_LOADED: `${BASE_URL}/images/single/get`,
    IMAGE_DELETE: `${BASE_URL}/images/single/delete`,
    IMAGE_DELETE_ALL: `${BASE_URL}/images/single/deleteAll`,
};

export default API_ENDPOINTS;