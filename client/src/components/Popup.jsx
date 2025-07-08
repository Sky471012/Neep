import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function Popup() {

    const [visible, setVisible] = useState(false);
    const [popup, setPopup] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getPopup`)
            .then((res) => {
                if (res.data != null) {
                    const img = new Image();
                    img.src = `${import.meta.env.VITE_BACKEND_URL}${res.data.imageUrl}`;
                    img.onload = () => {
                        setPopup(res.data);
                        setTimeout(() => {
                            setVisible(true);
                        }, 3000); // optional delay
                    };
                    img.onerror = () => {
                        console.error("Failed to load popup image.");
                    };
                }
            })
            .catch((err) => {
                console.error("Failed to fetch popup:", err);
            });
    }, []);

    if (!visible || !popup) return null;

    return (<>
        <div className="popup-overlay">
            <div className="popup-box">
                <button className="popup-close" onClick={() => setVisible(false)}>
                    &times;
                </button>
                <img src={`${import.meta.env.VITE_BACKEND_URL}${popup.imageUrl}`} alt="Popup" className="popup-img" />
                <p className="popup-text"><strong>{popup.description}</strong></p>
            </div>
        </div>

    </>)
}
