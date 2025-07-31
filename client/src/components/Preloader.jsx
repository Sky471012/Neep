import preloader_img from "../assets/images/preloader-img.png";

export default function Preloader({ fadeOut }) {
  return (
    <div className={`preloader ${fadeOut ? "fade-out" : ""}`}>
      <img src={preloader_img} alt="Loading" className="preloader-img" />
    </div>
  );
}
