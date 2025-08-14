import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function Popup() {
    const [visible, setVisible] = useState(false);
    const [popup, setPopup] = useState(null);
    const message = encodeURIComponent("Hi, I’m interested in learning more about your special course. Could you please share the details?");

    useEffect(() => {
        // Check if popup was already shown in this session
        const popupShown = sessionStorage.getItem("popupShown");
        if (popupShown) return; // Skip if already shown this session

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getPopup`)
            .then((res) => {
                if (res.data != null) {
                    const img = new Image();
                    img.src = `${import.meta.env.VITE_BACKEND_URL}${res.data.imageUrl}`;
                    img.onload = () => {
                        setPopup(res.data);
                        setTimeout(() => {
                            setVisible(true);
                            // Set flag in sessionStorage
                            sessionStorage.setItem("popupShown", "true");
                        }, 3000);
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

    return (
        <div className="popup-overlay">
            <div className="popup-box">
                <button className="popup-close" onClick={() => setVisible(false)}>
                    &times;
                </button>
                <img src={`${import.meta.env.VITE_BACKEND_URL}${popup.imageUrl}`} alt="Popup" className="popup-img" />
                <div className="popup-text">
                    <p style={{ width: "90%", overflowWrap: "break-word" }}><strong>{popup.description}</strong></p>
                    <a
                        className="login-page-button pt-2 pb-2" style={{ fontWeight: "bolder" }} href={`https://wa.me/919313214643?text=${message}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="bi bi-whatsapp me-1">
                        </i>Enquire on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}