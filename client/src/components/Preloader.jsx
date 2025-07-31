import preloader_img from "../assets/images/preloader-img.png";

export default function Preloader() {
    return (
        <div className="preloader">
            <div className="slider"></div>
            <img src={preloader_img} alt="Loading" className="preloader-img" />
        </div>
    );
}