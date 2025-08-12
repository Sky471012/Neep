"use client"
import { useState, useEffect } from "react"

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const banners = [
    {
      id: 1,
      imageDesktop: "/slide-lg-1.jpg", // 1920x600
      imageMobile: "/slide-1.jpg", // 1080x1080
      primaryButton: "Enroll Now",
    },
    {
      id: 2,
      imageDesktop: "/slide-lg-2.jpg",
      imageMobile: "/slide-2.jpg",
      primaryButton: "Join Batch",
    },
    {
      id: 3,
      imageDesktop: "/slide-lg-3.jpg",
      imageMobile: "/slide-3.jpg",
      primaryButton: "Free Demo"
    },
    {
      id: 4,
      imageDesktop: "/slide-lg-4.jpg",
      imageMobile: "/slide-4.jpg",
      primaryButton: "Learn More"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const currentBanner = banners[currentSlide];

  return (
    <div>
      <style>{`
        /* Global reset to ensure no spacing issues */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
        }

        :root {
          --bs-blue: #0d6efd;
          --bs-indigo: #6610f2;
          --bs-purple: #6f42c1;
          --bs-pink: #d63384;
          --bs-red: #dc3545;
          --bs-orange: #fd7e14;
          --bs-yellow: #ffc107;
          --bs-green: #198754;
          --bs-teal: #20c997;
          --bs-cyan: #0dcaf0;
          --bs-black: #000;
          --bs-white: #fff;
          --bs-gray: #6c757d;
          --bs-gray-dark: #343a40;
          --bs-gray-100: #f8f9fa;
          --bs-gray-200: #e9ecef;
          --bs-gray-300: #dee2e6;
          --bs-gray-400: #ced4da;
          --bs-gray-500: #adb5bd;
          --bs-gray-600: #6c757d;
          --bs-gray-700: #495057;
          --bs-gray-800: #343a40;
          --bs-gray-900: #212529;
          --bs-primary: #0d6efd;
          --bs-secondary: #6c757d;
          --bs-success: #198754;
          --bs-info: #0dcaf0;
          --bs-warning: #ffc107;
          --bs-danger: #dc3545;
          --bs-light: #f8f9fa;
          --bs-dark: #212529;
          --bs-border-radius: 0.375rem;
          --bs-border-radius-lg: 0.5rem;
          --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif;
        }

        .banner-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          margin: 0;
          padding: 0;
          display: block;
        }

        .banner-container {
          display: flex;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 100%;
          width: ${banners.length * 100}%;
          margin: 0;
          padding: 0;
          transform: translateX(-${currentSlide * (100 / banners.length)}%);
        }

        .banner-slide {
          min-width: ${100 / banners.length}%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .banner-slide::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          z-index: 1;
        }

        .banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: var(--bs-white);
          max-width: 800px;
          margin: 0 auto;
        }

        .banner-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--bs-white);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          font-family: var(--bs-font-sans-serif);
        }

        .banner-subtitle {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .banner-description {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .banner-buttons {
          display: flex;
          gap: 1rem;
          z-index: 2;
          position: absolute;
          bottom: 20px;
          right: 110px;
        }

        .banner-slide::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .banner-buttons a {
          position: relative;
          z-index: 2;
        }

        .btn {
          padding: 12px 30px;
          border: none;
          border-radius: var(--bs-border-radius);
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: var(--bs-font-sans-serif);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .btn-primary {
          background-color: var(--bs-white);
          color: var(--bs-primary);
          box-shadow: var(--bs-box-shadow);
        }

        .btn-primary:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 0.75rem 1.5rem rgba(255, 255, 255, 0.3);
          color: var(--bs-primary);
        }

        .btn-outline {
          background-color: transparent;
          color: var(--bs-white);
          border: 2px solid var(--bs-white);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-outline:hover {
          background-color: var(--bs-white);
          color: var(--bs-primary);
          transform: translateY(-2px);
          box-shadow: 0 0.75rem 1.5rem rgba(255, 255, 255, 0.2);
        }

        .banner-navigation {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 3;
        }

        .nav-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid var(--bs-white);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .nav-dot.active {
          background-color: var(--bs-white);
          transform: scale(1.2);
        }

        /* Side Navigation Areas */
        .side-nav-area {
          position: absolute;
          top: 0;
          height: 82%;
          width: 15%;
          z-index: 3;
          cursor: pointer;
          background: transparent;
          transition: background-color 0.2s ease;
        }

        .side-nav-left {
          left: 0;
        }

        .side-nav-right {
          right: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .banner-slide {
            height: 100vw;
          }

          .banner-title {
            font-size: 2.5rem;
          }

          .banner-subtitle {
            font-size: 1.2rem;
          }

          .banner-description {
            font-size: 1rem;
          }

          .btn {
            width: 100%;
            max-width: 250px;
          }

          /* Increase side nav areas on mobile for better touch targets */
          .side-nav-area {
            width: 25%;
          }
        }

        @media (max-width: 480px) {
          .banner-title {
            font-size: 2rem;
          }

          .banner-subtitle {
            font-size: 1.1rem;
          }

          /* Even larger touch areas on small screens */
          .side-nav-area {
            width: 30%;
          }

          .btn{
            padding: 10px 15px;
            font-size: 0.85rem;
          }

          .banner-buttons {
            right: 20px;
          }
        }

        @media (min-width: 769px) {
          .banner-slide {
            height: 400px;
          }
        }
        
        @media (min-width: 1024px) {
          .banner-slide {
            height: 570px;
          }
        }
      `}</style>

      <section className="banner-section">
        <div className="banner-container">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="banner-slide"
              style={{
                backgroundImage: `url(${isMobile ? banner.imageMobile : banner.imageDesktop})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="banner-buttons">
                <a href="https://wa.me/919313214643" target="_blank" rel="noopener noreferrer" className="btn btn-primary">{banner.primaryButton}</a>
              </div>
            </div>
          ))}
        </div>

        {/* Side Navigation Areas */}
        <div className="side-nav-area side-nav-left" onClick={prevSlide}></div>
        <div className="side-nav-area side-nav-right" onClick={nextSlide}></div>

        {/* Navigation Dots */}
        <div className="banner-navigation">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`nav-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default BannerSection