"use client"
import { useState, useEffect } from "react"

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const banners = [
    {
      id: 1,
      title: "Parivartan Batch",
      subtitle: "Economics • Micro Economics • Statistics",
      description:
        "Transform your understanding of economics with our comprehensive Parivartan batch. Expert faculty, proven methodology, and personalized attention for your success.",
      backgroundColor: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
      primaryButton: "Enroll Now",
      secondaryButton: "Learn More",
    },
    {
      id: 2,
      title: "Advanced Economics",
      subtitle: "Macro Economics • Econometrics • Research Methods",
      description:
        "Master advanced economic concepts with our specialized courses designed for competitive exams and higher studies. Join our success story today.",
      backgroundColor: "linear-gradient(135deg, #198754 0%, #20c997 100%)",
      primaryButton: "Join Batch",
      secondaryButton: "View Syllabus",
    },
    {
      id: 3,
      title: "Statistics Mastery",
      subtitle: "Applied Statistics • Data Analysis • Research",
      description:
        "Excel in statistical analysis and data interpretation with hands-on learning and real-world applications. Build your analytical skills with us.",
      backgroundColor: "linear-gradient(135deg, #6f42c1 0%, #d63384 100%)",
      primaryButton: "Start Learning",
      secondaryButton: "Free Demo",
    },
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
          min-height: 500px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          margin: 0; /* Remove any margin */
          padding: 0; /* Remove any padding */
          display: block; /* Ensure proper display */
        }

        .banner-container {
          display: flex;
          transition: transform 0.5s ease-in-out;
          height: 100%;
          width: 300%;
          margin: 0;
          padding: 0;
        }

        .banner-slide {
          min-width: 33.333%;
          width: 33.333%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          min-height: 500px;
          flex-shrink: 0;
          margin: 0;
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
          justify-content: center;
          flex-wrap: wrap;
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
        }

        .nav-dot.active {
          background-color: var(--bs-white);
          transform: scale(1.2);
        }

        .banner-arrows {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--bs-white);
          border: 2px solid var(--bs-white);
          color: var(--bs-primary);
          font-size: 1.5rem;
          padding: 0px 15px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 3;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .banner-arrows:hover {
          background-color: var(--bs-primary);
          color: var(--bs-white);
          transform: translateY(-50%) scale(1.03);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .arrow-left {
          left: 20px;
        }

        .arrow-right {
          right: 20px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .banner-slide {
            padding: 40px 15px;
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

          .banner-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 250px;
          }
        }

        @media (max-width: 480px) {
          .banner-title {
            font-size: 2rem;
          }

          .banner-subtitle {
            font-size: 1.1rem;
          }

          .arrow-left,
          .arrow-right {
            display: none;
          }
        }
      `}</style>
      
      <section id="home" className="banner-section">
        <div 
          className="banner-container" 
          style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id} 
              className="banner-slide" 
              style={{ background: banner.backgroundColor }}
            >
              <div className="banner-content">
                <h1 className="banner-title">{banner.title}</h1>
                <h2 className="banner-subtitle">{banner.subtitle}</h2>
                <p className="banner-description">{banner.description}</p>
                <div className="banner-buttons">
                  <a href="#enroll" className="btn btn-primary">
                    {banner.primaryButton}
                  </a>
                  <a href="#learn-more" className="btn btn-outline">
                    {banner.secondaryButton}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button className="banner-arrows arrow-left" onClick={prevSlide}>
          &#8249;
        </button>
        <button className="banner-arrows arrow-right" onClick={nextSlide}>
          &#8250;
        </button>

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