// src/components/UploadPanel.jsx

import React, { useState, useCallback, useEffect } from 'react';
import ImageTransmissionService from '../services/ImageTransmissionService';
import './UploadPanel.css';

const UploadPanel = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(0);

    const handleImageLoad = () => {
        setImageLoaded(imageLoaded+1); // Increment imageLoaded
        if (imageLoaded>1) {
            window.location.reload(); // Reload the page
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
        event.target.value = null;
    };

    const fetchCurrentImage = useCallback(async () => {
        try {
            const imageBlob = await ImageTransmissionService.getCurrentImages();
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setImageSrc(imageObjectURL);
        } catch (error) {
            console.error('Error in fetching current image:', error);
            setImageSrc(null);
        }
    }, []);

    /*
    * Upload image to server
    * 1. If no image is selected, fetch the current image from the server
    * 2. Delete all images from the server
    * 3. If an image is selected, upload it to the server
    * 4. Fetch the current image from the server
    */
    const uploadImage = useCallback(async () => {
        if (!selectedFile) {
            await fetchCurrentImage();
            return;
        }

        try {
            await ImageTransmissionService.deleteAllImages();
            await ImageTransmissionService.uploadImage(selectedFile);
            await fetchCurrentImage();
        } catch (error) {
            console.error('Error during image upload process:', error);
            alert('An error occurred during the image upload process.');
        }
    }, [selectedFile, fetchCurrentImage]);

    const deleteAllImage = async () => {
        try {
            await ImageTransmissionService.deleteAllImages();
            setImageSrc(null);
        } catch (error) {
            console.error('Error during image deletion process:', error);
            alert('An error occurred during the image deletion process.');
        }
    };

    useEffect(() => {
        uploadImage();
    }, [uploadImage]);

    return (
        <div className="upload-panel">
            <h2>Upload Panel</h2>
            <div className="upload-area">
                <input
                    type="file"
                    id="file-input"
                    className="file-input"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-input" className="file-label">
                    <p>
                        Drag and drop an image here,
                        <br />
                        or click to select an image.
                    </p>
                </label>
            </div>
            <div className="images-area">
                {imageSrc ? (
                    <>
                    <img src={imageSrc} alt="Uploaded" onLoad={handleImageLoad} />
                    <button className="delete-button" onClick={deleteAllImage}>❌</button>
                    </>
                ) : (
                    <p>Waiting for image upload...</p>
                )}
            </div>
        </div>
    );
};

export default UploadPanel;