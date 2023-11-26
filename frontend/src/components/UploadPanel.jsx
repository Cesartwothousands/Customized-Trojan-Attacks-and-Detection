// src/components/UploadPanel.jsx

import React, { useState, useEffect } from 'react';
import ImageTransmissionService from '../services/ImageTransmissionService';
import './UploadPanel.css';


const UploadPanel = () => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        const loadedImages = await ImageTransmissionService.getImages();
        if (loadedImages && loadedImages.length > 0) {
            setImages(loadedImages);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        if (e.dataTransfer.items && e.dataTransfer.items[0].kind === 'file') {
            const file = e.dataTransfer.items[0].getAsFile();
            await uploadImage(file);
        }
    };

    const handleChange = async (e) => {
        const file = e.target.files[0];
        await uploadImage(file);
    };

    const uploadImage = async (file) => {
        setUploading(true);
        await ImageTransmissionService.uploadImage(file);
        await loadImages();
        setUploading(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDelete = async (imageId) => {
        await ImageTransmissionService.deleteImage(imageId);
        await loadImages();
    };

    return (
        <div className="upload-panel">
            <h3>Upload Panel</h3>

            <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver}>
                <input
                    type="file"
                    onChange={handleChange}
                    id="file-input"
                    style={{ width: '100%', height: '100%', opacity: 0, position: 'absolute', cursor: 'pointer' }}>
                </input>

                <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p style={{ fontSize: '26px', textAlign: 'center' }}>
                        Drag and drop an image here,
                        <br />
                        or click to select an image.
                    </p>
                </label>
            </div>

            <div className="images-area">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div key={index} className="image-container">
                            <img src={image.url} alt="Uploaded" />
                            <button onClick={() => handleDelete(image.id)}>×</button>
                        </div>
                    ))
                ) : (
                    <p style={{ fontSize: '26px', textAlign: 'center' }}>No images loaded</p>
                )}
            </div>

        </div>
    )
}

export default UploadPanel;