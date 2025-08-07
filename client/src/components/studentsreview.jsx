import React, { useRef } from "react";

const StudentsReviews = () => {
  const scrollRef = useRef();

  const students = [
    {
      name: "Rishabh Jain",
      review:
        "NEW ERA EDUCATION POINT offers exceptional math's classes in Palam. The experienced teachers provide clear explanations and helpful resources to ensure students understand complex math concepts. Highly recommended for anyone looking to improve their math skills.",
      image: "/avatars/2.png",
      rating: "★★★★★",
    },
    {
      name: "Nainaa Roy",
      review:
        "Excellent teaching and very supportive environment. Mohan Sir breaks down complex topics into simple steps. Perfect for school students and competitive exams alike.",
      image: "/avatars/3.png",
      rating: "★★★★★",
    },
    {
      name: "Gurudeep Nat",
      review:
        "If you’re looking for quality maths tuition in Kailashpuri, this is the place. Mohan Sir gives personal attention to each student and uses real-life examples to make learning engaging. His passion for teaching shows in every class.",
      image: "/avatars/1.png",
      rating: "★★★★★",
    },
    {
      name: "Kiran Pal",
      review:
        "Mr. mohan sir is very excellent teacher and i am very thankfully to him.  i am study in neep institute before 4 years and very supportive in my bad condition...best teacher in my life and they  best understand student and very best education point....❤❤",
      image: "/avatars/12.png",
      rating: "★★★★★",
    },
    {
      name: "Parwati Chauhan",
      review:
        "Mohan sir is the sweetest teacher. He is an amazing teacher. He is very supportive. He clears each and every doubt of every student  . He never make you feels embarrassed about your grade instead he will help you to improve yourself. He focuses on building concept. Thank you mohan sir.",
      image: "/avatars/4.png",
      rating: "★★★★★",
    },
    {
      name: "Rachna",
      review:
        "The experienced faculty and personalized attention ensure excellent results. The study material provided is comprehensive and helped me secure top marks in my exams.",
      image: "/avatars/6.png",
      rating: "★★★★★",
    },
    {
      name: "Meena Dhayani",
      review:
        "I am very lucky that I  found this institute, it's a very good point to improve your education. The teachers here are also very good, my experience here has been very good.💖💖😊😊 …",
      image: "/avatars/9.png",
      rating: "★★★★★",
    },
    {
      name: "Samji Buchiya",
      review:
        "NEW ERA EDUCATION POINT is the best coaching centre in Kailash Puri. The experienced faculty and personalized attention ensure excellent results.",
      image: "/avatars/5.png",
      rating: "★★★★★",
    },
    {
      name: "Meenu Ojha",
      review:
        "Mohan Sir provide excellent guidance to help students excel in mathematics.this institute for anyone looking to improve their math skills.",
      image: "/avatars/10.png",
      rating: "★★★★★",
    },
    {
      name: "Rupesh Saini",
      review:
        "This study center has helped me to improve my grades and build confidence in my abilities. I feel more prepared and motivated to succeed in my studies thanks to the resources and support available here.",
      image: "/avatars/11.png",
      rating: "★★★★★",
    },
  ];

  const scroll = (direction) => {
    const amount = window.innerWidth <= 768 ? 276 : 350; // Adjust scroll amount for mobile
    scrollRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
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
          display: flex;
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
            padding: 60px 0;

          }
            
  

          .reviews-container {
            padding: 0;
          }

          .reviews-header {
            margin-bottom: 30px;
            padding: 0 20px; 
          }

          .section-title {
            font-size: 1rem; 
            width: 95%;

          .section-subtitle {
            font-size: 1rem;
            width: 95%; 
          }

          .scroll-controls {
            padding: 0 10px; 
          }

          .scroll-container {
            max-width: calc(100vw - 80px); 
            gap: 1rem; /* Reduce gap between cards */
            padding: 0 10px; 
            scroll-snap-type: x mandatory; 
            }

          .review-card,
          .see-more-card {
            flex: 0 0 260px; 
            min-width: 260px;
            width: 260px; 
            padding: 18px;
            scroll-snap-align: start; 
            margin: 0; 
          }
          
          .review-card:first-child {
          margin-left:0;
      }
          .student-name {
            font-size: 1.2rem;
          }
            .review-card:last-child,
  .see-more-card {
    margin-right: 10px; 
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

          .arrow-btn {
            padding: 8px 12px; 
            font-size: 1.2rem;
          }
        }

        /* Extra small mobile devices */
        @media (max-width: 480px) {
          .scroll-container {
            max-width: calc(100vw - 90px); 
            padding: 0 5px;
            padding-left: 5%;
      }

          .review-card,
          .see-more-card {
            flex: 0 0 250px;
            min-width: 250px;
            width: 250px;
            padding: 16px;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .arrow-btn {
            padding: 6px 10px;
            font-size: 1.1rem;
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
              <a href="https://www.google.com/maps/place/NEW+ERA+EDUCATION+POINT/@28.5952199,77.0952862,17z/data=!4m18!1m9!3m8!1s0x390d1b5bb76fcc85:0x1f90bc98be2bab0d!2sNEW+ERA+EDUCATION+POINT!8m2!3d28.5952199!4d77.0978611!9m1!1b1!16s%2Fg%2F11cmsgb6vj!3m7!1s0x390d1b5bb76fcc85:0x1f90bc98be2bab0d!8m2!3d28.5952199!4d77.0978611!9m1!1b1!16s%2Fg%2F11cmsgb6vj?entry=ttu&g_ep=EgoyMDI1MDgwMy4wIKXMDSoASAFQAw%3D%3D" className="see-more-card">
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