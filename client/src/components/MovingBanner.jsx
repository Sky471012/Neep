import React from 'react';
import image1 from "../assets/images/1.png";
import image2 from "../assets/images/2.jpg";

export default function MovingBanner() {
    return (<>
        <div className="banner-container">
            <div className="scrolling-banner">
                {/* <!-- Repeat images to ensure smooth scrolling --> */}
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
                <img src={image1} alt="1" />
                <img src={image2} alt="2" />
            </div>
        </div>
    </>)
}
