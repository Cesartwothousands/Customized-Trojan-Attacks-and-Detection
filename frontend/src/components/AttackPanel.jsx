// src/components/AttackPanel.jsx

import React, {useEffect, useState} from 'react';
import AttackService from '../services/AttackServices';
import './AttackPanel.css';

const AttackPanel = () => {
    const [coordinates, setCoordinates] = useState(JSON.parse(localStorage.getItem('coordinates')) || { x: 0, y: 0 });
    const [dimensions, setDimensions] = useState(JSON.parse(localStorage.getItem('dimensions')) || { width: 0, height: 0 });
    const [selection, setSelection] = useState(localStorage.getItem('selection') || 0.0);
    const [isLoading, setIsLoading] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        localStorage.setItem('coordinates', JSON.stringify(coordinates));
        localStorage.setItem('dimensions', JSON.stringify(dimensions));
        localStorage.setItem('selection', selection.toString());
    }, [coordinates, dimensions, selection]);

    const handleCoordinateChange = (e) => {
        setCoordinates({ ...coordinates, [e.target.name]: e.target.value });
    };

    const handleDimensionChange = (e) => {
        setDimensions({ ...dimensions, [e.target.name]: e.target.value });
    };

    const handleSelectionChange = (e) => {
        setSelection(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const attackData = {
            x: parseInt(coordinates.x, 10),
            y: parseInt(coordinates.y, 10),
            height: parseInt(dimensions.height, 10),
            width: parseInt(dimensions.width, 10),
            alpha: parseFloat(selection)
        };

        // Set loading to true
        setIsLoading(true);

        AttackService.createAttack(attackData)
            .then(responseData => {
                const isSuccess = responseData.success;

                if(isSuccess){
                    console.log('Attack created successfully!');

                    return AttackService.getCurrentImages();
                } else{
                    console.error('Error during attack creation process:', responseData);
                }
            })
            .then(imageBlob => {
                if (imageBlob) {
                    const imageObjectURL = URL.createObjectURL(imageBlob);
                    setImageSrc(imageObjectURL);
                }
            })
            .catch(error => {
                console.error("Error in creating attack: ", error);
            })
            .finally(() => {
                // Set loading to false
                setIsLoading(false);
            });
    };

    return (
        <div className="attack-panel">
            <h2>Attack Panel</h2>
            <div className="edit-area">
                <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="form-group coordinates-section">
                        <div className="form-control">
                            <label htmlFor="x">Location X:</label>
                            <input type="number" id="x" name="x" value={coordinates.x} onChange={handleCoordinateChange} max="27"/>
                        </div>
                        <div className="form-control">
                            <label htmlFor="y">Location Y:</label>
                            <input type="number" id="y" name="y" value={coordinates.y} onChange={handleCoordinateChange} max="27"/>
                        </div>
                    </div>
                    <div className="form-group dimensions-section">
                        <div className="form-control">
                            <label htmlFor="height">Height:</label>
                            <input type="number" id="height" name="height" value={dimensions.height} onChange={handleDimensionChange} max="27"/>
                        </div>
                        <div className="form-control">
                            <label htmlFor="width">Width:</label>
                            <input type="number" id="width" name="width" value={dimensions.width} onChange={handleDimensionChange} max="27"/>
                        </div>
                    </div>
                    <div className="form-group alpha-section">
                        <div className="form-control">
                            <label htmlFor="alpha">Alpha (0 - 1):</label>
                            <input type="number" id="alpha" step="0.1" min="0" max="1" value={selection} onChange={handleSelectionChange} />
                        </div>
                    </div>
                    <button name="Generate-Button" className="Generate-Button" type="submit" disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Attack'}
                    </button>
                </form>
            </div>
            <div className="edited-images-area">
                {imageSrc ? (
                    <>
                        <img src={imageSrc} alt="Edited"/>
                    </>
                ) : (
                    <p>Waiting for image generate...</p>
                )}
            </div>
        </div>
    );
}

export default AttackPanel;