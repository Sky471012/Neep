import image1 from "../assets/images/1.png";

export default function Preloader() {
    return (
        <div className="preloader">
            <div className="slider"></div>
            <img src={image1} alt="Loading" className="preloader-img" />
        </div>
    );
}