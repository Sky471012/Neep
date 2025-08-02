import { useState } from "react";
import preloader_img from "../assets/images/preloader-img.png";

export default function Preloader({ fadeOut }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`preloader ${fadeOut ? "fade-out" : ""}`}>
      <img
        src={preloader_img}
        alt="Loading"
        className={`preloader-img ${imageLoaded ? "visible" : "hidden"}`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}