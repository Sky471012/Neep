import React, { useRef } from "react";

const StudentsReviews = () => {
  const scrollRef = useRef();

  const students = [
    {
      name: "Arjun Mehta",
      review:
        "Faculty's teaching helped a lot. The practical approach and detailed explanations made complex concepts easy to understand. Highly recommended!",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Kavya Sharma",
      review:
        "Notes provided were comprehensive and well-structured. The teaching methodology helped me achieve excellent results in my exams.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Rohit Agarwal",
      review:
        "Practical examples and case studies made learning engaging. The faculty's industry experience added real value to the curriculum.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Priyanka Singh",
      review:
        "Doubts were cleared quickly and efficiently. The personalized attention and step-by-step problem-solving approach was exceptional.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Vikram Joshi",
      review:
        "Excellent faculty with deep subject knowledge. The interactive sessions and regular assessments helped track my progress effectively.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Sneha Patel",
      review:
        "Great practical approach to learning. The real-world applications and hands-on practice sessions were incredibly beneficial.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Aditya Kumar",
      review:
        "Amazing support throughout the course! The faculty was always available for guidance and provided excellent study materials.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Isha Verma",
      review:
        "Loved the innovative teaching methods! The blend of theory and practical knowledge prepared me well for competitive exams.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Rajat Sen",
      review:
        "Clear and concise concept explanations. The systematic approach to covering the syllabus was very effective for my preparation.",
      image: "/logo.png",
      rating: "★★★★★",
    },
    {
      name: "Divya Kaul",
      review:
        "Excellent teaching quality and methodology. The problem-solving techniques taught here are invaluable for competitive examinations.",
      image: "/logo.png",
      rating: "★★★★★",
    },
  ];

  const scroll = (direction) => {
    const amount = 350;
    scrollRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap");

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
          --bs-primary-rgb: 13, 110, 253;
          --bs-secondary-rgb: 108, 117, 125;
          --bs-success-rgb: 25, 135, 84;
          --bs-info-rgb: 13, 202, 240;
          --bs-warning-rgb: 255, 193, 7;
          --bs-danger-rgb: 220, 53, 69;
          --bs-light-rgb: 248, 249, 250;
          --bs-dark-rgb: 33, 37, 41;
        }

        .reviews-section {
          padding: 80px 10px;
          background: linear-gradient(
            135deg,
            #fafbfc 0%,
            #f8fafc 25%,
            #ffffff 50%,
            #f1f5f9 75%,
            #e2e8f0 100%
          );
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          color: #1e293b;
          position: relative;
          overflow: hidden;
        }

        .reviews-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 30%,
              rgba(59, 130, 246, 0.03) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(16, 185, 129, 0.03) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 40% 80%,
              rgba(139, 92, 246, 0.02) 0%,
              transparent 50%
            );
          z-index: 1;
        }

        .reviews-section::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(59, 130, 246, 0.008) 45deg,
            transparent 90deg,
            rgba(16, 185, 129, 0.008) 135deg,
            transparent 180deg,
            rgba(139, 92, 246, 0.008) 225deg,
            transparent 270deg,
            rgba(236, 72, 153, 0.008) 315deg,
            transparent 360deg
          );
          animation: rotate 120s linear infinite;
          z-index: 1;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .reviews-container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .reviews-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .section-title {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          background: linear-gradient(
            135deg,
            #1e293b 0%,
            #475569 25%,
            #3b82f6 50%,
            #10b981 75%,
            #8b5cf6 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .section-title::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          border-radius: 2px;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #64748b;
          width: 80%;
          margin: 0 auto;
          line-height: 1.6;
        }

        .scroll-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .scroll-controls::before,
.scroll-controls::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 3;
  pointer-events: none;
}

        .arrow-btn {
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
          color: white;
          border: none;
          padding: 5px 11px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.4rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(13, 110, 253, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 10;
        }

        .arrow-btn:hover {
          background: linear-gradient(
            135deg,
            #0a58ca 0%,
            var(--bs-primary) 100%
          );
          box-shadow: 0 12px 35px rgba(13, 110, 253, 0.3);
        }

        .arrow-btn:active {
          transform: translateY(-1px);
        }

        .scroll-container {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 0;
          gap: 2rem;
          max-width: 90%;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .scroll-container::-webkit-scrollbar {
          display: none;
        }

        .review-card {
        display:flex;
        flex-direction: column;
          flex: 0 0 320px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(20px);
          text-align: center;
          min-width: 320px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .img-container {
          display: flex;
          align-items: center;
          margin: 0 auto 0.7rem;
          justify-content: center;
          background: linear-gradient(90deg, var(--bs-info), var(--bs-primary));
          padding: 4px; /* thickness of the border */
          border-radius: 50%;
          width: 68px;
          height: 68px;
        }

        .img-container img {
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .student-name {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .review-text {
          font-family: "Inter", sans-serif;
          font-style: italic;
          color: #475569;
          font-size: 0.8rem;
          margin: 1rem 0;
          line-height: 1.6;
          position: relative;
          padding: 0 1rem;
          text-align: left;
          flex-grow: 1;
        }

        .review-text::before {
          content: '"';
          position: absolute;
          left: -0.25rem;
          top: -0.5rem;
          font-size: 2.5rem;
          color: #3b82f6;
          font-family: "Playfair Display", Georgia, serif;
          line-height: 1;
          opacity: 0.3;
        }

        .review-text::after {
          content: '"';
          position: absolute;
          right: -0.25rem;
          bottom: -1rem;
          font-size: 2.5rem;
          color: #10b981;
          font-family: "Playfair Display", Georgia, serif;
          line-height: 1;
          opacity: 0.3;
        }

        .stars {
          color: #fbbf24;
          font-size: 1.5rem;
          letter-spacing: 2px;
          margin-top: auto;
        }

        /* See More Reviews Card */
        .see-more-card {
          flex: 0 0 320px;
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
          border-radius: 20px;
          padding: 2rem;
          min-width: 320px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .see-more-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .see-more-card:hover::before {
          opacity: 1;
        }

        .see-more-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(13, 110, 253, 0.3);
          background: linear-gradient(
            135deg,
            #0a58ca 0%,
            var(--bs-primary) 100%
          );
        }

        .see-more-icon {
          width: 70px;
          height: 70px;
          border: 3px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .see-more-card:hover .see-more-icon {
          transform: scale(1.1);
          border-color: white;
          border-width: 4px;
          background: rgba(255, 255, 255, 0.2);
        }

        .see-more-arrow {
          color: white;
          font-size: 2rem;
          transition: transform 0.3s ease;
        }

        .see-more-card:hover .see-more-arrow {
          transform: translateX(5px);
        }

        .see-more-title {
          color: white;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .see-more-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          max-width: 80%;
        }

        @media (max-width: 768px) {
          .reviews-section {
            padding: 40px 12px;
          }

          .reviews-header {
            margin-bottom: 30px;
          }

          .review-card,
          .see-more-card {
            width: 260px;
            padding: 18px;
          }

          .student-name {
            font-size: 1.2rem;
          }

          .review-text {
            font-size: 0.85rem;
            padding: 0 12px;
          }

          .see-more-title {
            font-size: 1.4rem;
          }

          .see-more-subtitle {
            font-size: 0.9rem;
          }

          .see-more-icon {
            width: 50px;
            height: 50px;
            margin-bottom: 16px;
          }

          .see-more-arrow {
            font-size: 1.5rem;
          }
        }

        /* Animation for scroll container */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .review-card,
        .see-more-card {
          animation: fadeInUp 0.6s ease forwards;
        }

        /* Ensure proper layout on very large screens */
        @media (min-width: 1400px) {
          .reviews-section {
            padding: 100px 40px;
          }

          .reviews-header {
            margin-bottom: 80px;
          }
        }
      `}</style>

      <section id="reviews" className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-header">
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">
              Discover the success stories and experiences of our students who
              have achieved excellence through our comprehensive coaching
              programs and expert guidance.
            </p>
          </div>

          <div className="scroll-controls">
            <button onClick={() => scroll("prev")} className="arrow-btn">
              <i className="bi bi-chevron-left"></i>
            </button>

            <div className="scroll-container" ref={scrollRef}>
              {students.map((student, idx) => (
                <div key={idx} className="review-card">
                  <div className="img-container">
                    <img src={student.image} alt="review-profile" />
                  </div>
                  <h3 className="student-name">{student.name}</h3>
                  <div className="review-text">{student.review}</div>
                  <div className="stars">{student.rating}</div>
                </div>
              ))}

              {/* See More Reviews Card */}
              <a href="" className="see-more-card">
                <div className="see-more-icon">
                  <span className="see-more-arrow">
                    <i className="bi bi-chevron-right"></i>
                  </span>
                </div>
                <h3 className="see-more-title">See More Reviews</h3>
                <p className="see-more-subtitle">
                  Explore hundreds of success stories from our students across
                  all courses and batches
                </p>
              </a>
            </div>

            <button onClick={() => scroll("next")} className="arrow-btn">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default StudentsReviews;
