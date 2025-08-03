"use client";
import { Link, useNavigate, useLocation } from "react-router-dom";


const OurCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Economics Foundation",
      batchName: "Parivartan Batch",
      facultyName: "Dr. Rajesh Kumar",
      duration: "6 Months",
      description:
        "Complete foundation course covering micro and macro economics",
    },
    {
      id: 2,
      title: "Advanced Statistics",
      batchName: "Excellence Batch",
      facultyName: "Prof. Priya Sharma",
      duration: "4 Months",
      description:
        "Statistical analysis and data interpretation for competitive exams",
    },
    {
      id: 3,
      title: "Business Studies",
      batchName: "Success Batch",
      facultyName: "Mr. Amit Singh",
      duration: "5 Months",
      description: "Comprehensive business studies with practical applications",
    },
    {
      id: 4,
      title: "Quantitative Aptitude",
      batchName: "Master Batch",
      facultyName: "Dr. Neha Gupta",
      duration: "3 Months",
      description: "Mathematical problem solving and quantitative techniques",
    },
    {
      id: 5,
      title: "Research Methodology",
      batchName: "Research Batch",
      facultyName: "Prof. Suresh Patel",
      duration: "8 Months",
      description: "Advanced research methods and academic writing skills",
    },
  ];

  return (
    <>
      <style>{`
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
          --bs-primary-text-emphasis: #052c65;
          --bs-secondary-text-emphasis: #2b2f32;
          --bs-success-text-emphasis: #0a3622;
          --bs-info-text-emphasis: #055160;
          --bs-warning-text-emphasis: #664d03;
          --bs-danger-text-emphasis: #58151c;
          --bs-light-text-emphasis: #495057;
          --bs-dark-text-emphasis: #495057;
          --bs-primary-bg-subtle: #cfe2ff;
          --bs-secondary-bg-subtle: #e2e3e5;
          --bs-success-bg-subtle: #d1e7dd;
          --bs-info-bg-subtle: #cff4fc;
          --bs-warning-bg-subtle: #fff3cd;
          --bs-danger-bg-subtle: #f8d7da;
          --bs-light-bg-subtle: #fcfcfd;
          --bs-dark-bg-subtle: #ced4da;
          --bs-primary-border-subtle: #9ec5fe;
          --bs-secondary-border-subtle: #c4c8cb;
          --bs-success-border-subtle: #a3cfbb;
          --bs-info-border-subtle: #9eeaf9;
          --bs-warning-border-subtle: #ffe69c;
          --bs-danger-border-subtle: #f1aeb5;
          --bs-light-border-subtle: #e9ecef;
          --bs-dark-border-subtle: #adb5bd;
          --bs-white-rgb: 255, 255, 255;
          --bs-black-rgb: 0, 0, 0;
          --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto,
            "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif,
            "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
            "Noto Color Emoji";
          --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          --bs-gradient: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.15),
            rgba(255, 255, 255, 0)
          );
          --bs-body-font-family: var(--bs-font-sans-serif);
          --bs-body-font-size: 1rem;
          --bs-body-font-weight: 400;
          --bs-body-line-height: 1.5;
          --bs-body-color: #212529;
          --bs-body-color-rgb: 33, 37, 41;
          --bs-body-bg: #fff;
          --bs-body-bg-rgb: 255, 255, 255;
          --bs-emphasis-color: #000;
          --bs-emphasis-color-rgb: 0, 0, 0;
          --bs-secondary-color: rgba(33, 37, 41, 0.75);
          --bs-secondary-color-rgb: 33, 37, 41;
          --bs-secondary-bg: #e9ecef;
          --bs-secondary-bg-rgb: 233, 236, 239;
          --bs-tertiary-color: rgba(33, 37, 41, 0.5);
          --bs-tertiary-color-rgb: 33, 37, 41;
          --bs-tertiary-bg: #f8f9fa;
          --bs-tertiary-bg-rgb: 248, 249, 250;
          --bs-heading-color: inherit;
          --bs-link-color: #0d6efd;
          --bs-link-color-rgb: 13, 110, 253;
          --bs-link-decoration: underline;
          --bs-link-hover-color: #0a58ca;
          --bs-link-hover-color-rgb: 10, 88, 202;
          --bs-code-color: #d63384;
          --bs-highlight-color: #212529;
          --bs-highlight-bg: #fff3cd;
          --bs-border-width: 1px;
          --bs-border-style: solid;
          --bs-border-color: #dee2e6;
          --bs-border-color-translucent: rgba(0, 0, 0, 0.175);
          --bs-border-radius: 0.375rem;
          --bs-border-radius-sm: 0.25rem;
          --bs-border-radius-lg: 0.5rem;
          --bs-border-radius-xl: 1rem;
          --bs-border-radius-xxl: 2rem;
          --bs-border-radius-2xl: var(--bs-border-radius-xxl);
          --bs-border-radius-pill: 50rem;
          --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          --bs-box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          --bs-box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
          --bs-box-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.075);
          --bs-focus-ring-width: 0.25rem;
          --bs-focus-ring-opacity: 0.25;
          --bs-focus-ring-color: rgba(13, 110, 253, 0.25);
          --bs-form-valid-color: #198754;
          --bs-form-valid-border-color: #198754;
          --bs-form-invalid-color: #dc3545;
          --bs-form-invalid-border-color: #dc3545;
        }

        .courses-section {
          padding: 80px 20px;
          background: linear-gradient(
            135deg,
            var(--bs-light-bg-subtle) 0%,
            var(--bs-primary-bg-subtle) 100%
          );
          font-family: var(--bs-font-sans-serif);
          color: var(--bs-body-color);
        }

        .courses-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .courses-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .courses-title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--bs-primary);
          margin-bottom: 1rem;
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .courses-subtitle {
          font-size: 1.2rem;
          color: var(--bs-gray-700);
          width: 80%;
          margin: 0 auto;
          line-height: 1.6;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .course-card {
          background: var(--bs-white);
          border-radius: var(--bs-border-radius-lg);
          padding: 30px;
          box-shadow: var(--bs-box-shadow-sm);
          border: 1px solid var(--bs-primary-border-subtle);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .course-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
        }

        .course-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--bs-box-shadow-lg);
          border-color: var(--bs-primary);
        }

        .course-card:hover::before {
          height: 6px;
        }

        .course-card::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            var(--bs-info) 0%,
            var(--bs-primary) 100%
          );
          transition: height 0.3s ease;
        }

        .course-card:hover::after {
          height: 6px;
        }

        .course-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--bs-primary);
          margin-bottom: 15px;
          line-height: 1.3;
        }

        .course-info {
          margin-bottom: 20px;
        }

        .course-info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid var(--bs-gray-200);
        }

        .course-info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 500;
          color: var(--bs-gray-700);
          font-size: 0.9rem;
        }

        .info-value {
          font-weight: 600;
          color: var(--bs-dark);
          font-size: 0.9rem;
        }

        .batch-name {
          color: var(--bs-warning-text-emphasis) !important;
        }

        .faculty-name {
          color: var(--bs-success) !important;
        }

        .duration {
          color: var(--bs-info) !important;
        }

        .course-description {
          color: var(--bs-gray-600);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 25px;
        }

        .view-details-btn {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
          color: var(--bs-white);
          border: none;
          border-radius: var(--bs-border-radius);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-details-btn:hover {
          background: linear-gradient(
            135deg,
            var(--bs-link-hover-color) 0%,
            var(--bs-primary) 100%
          );
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
        }

        .view-details-btn:active {
          transform: translateY(0);
        }

        /* View All Courses Button Styles */
        .view-all-card {
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
          border-radius: var(--bs-border-radius-lg);
          padding: 30px;
          box-shadow: var(--bs-box-shadow-sm);
          border: 1px solid var(--bs-primary);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          min-height: 300px;
        }

        .view-all-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--bs-box-shadow-lg);
          background: linear-gradient(
            135deg,
            var(--bs-link-hover-color) 0%,
            var(--bs-primary) 100%
          );
        }

        .view-all-icon {
          width: 60px;
          height: 60px;
          border: 3px solid var(--bs-white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: all 0.3s ease;
          padding: 10px;
        }

        .view-all-card:hover .view-all-icon {
          transform: scale(1.1);
          border-width: 4px;
        }

        .view-all-arrow {
          color: var(--bs-white);
          font-size: 30px;
        }

        .view-all-title {
          color: var(--bs-white);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .view-all-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.4;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .courses-section {
            padding: 60px 15px;
          }

          .courses-title {
            font-size: 2.5rem;
          }

          .courses-subtitle {
            font-size: 1.1rem;
            width: 100%;
          }

          .courses-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .course-card {
            padding: 25px;
          }

          .course-title {
            font-size: 1.3rem;
          }

          .view-all-card {
            padding: 25px;
          }

          .view-all-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .courses-section {
            padding: 40px 10px;
          }

          .courses-title {
            font-size: 2rem;
          }

          .course-card {
            padding: 20px;
          }

          .course-title {
            font-size: 1.2rem;
          }

          .view-details-btn {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .view-all-card {
            padding: 20px;
          }

          .view-all-title {
            font-size: 1.2rem;
          }

          .view-all-icon {
            width: 50px;
            height: 50px;
          }

          .view-all-arrow {
            font-size: 20px;
          }
        }

        /* Animation for cards appearing */
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

        .course-card, .view-all-card {
          animation: fadeInUp 0.6s ease forwards;
        }

        .course-card:nth-child(1), .view-all-card:nth-child(1) {
          animation-delay: 0.1s;
        }
        .course-card:nth-child(2), .view-all-card:nth-child(2) {
          animation-delay: 0.2s;
        }
        .course-card:nth-child(3), .view-all-card:nth-child(3) {
          animation-delay: 0.3s;
        }
        .course-card:nth-child(4), .view-all-card:nth-child(4) {
          animation-delay: 0.4s;
        }
        .course-card:nth-child(5), .view-all-card:nth-child(5) {
          animation-delay: 0.5s;
        }
        .course-card:nth-child(6), .view-all-card:nth-child(6) {
          animation-delay: 0.6s;
        }
      `}</style>

      <section className="courses-section">
        <div className="courses-container">
          <div className="courses-header">
            <h2 className="courses-title">Courses We Provide</h2>
            <p className="courses-subtitle">
              Discover our comprehensive range of courses designed to help you
              excel in your academic and professional journey. Expert faculty,
              proven methodologies, and personalized attention.
            </p>
          </div>

          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <h3 className="course-title">{course.title}</h3>

                <div className="course-info">
                  <div className="course-info-item">
                    <span className="info-label">Batch Name:</span>
                    <span className="info-value batch-name">
                      {course.batchName}
                    </span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-label">Faculty:</span>
                    <span className="info-value faculty-name">
                      {course.facultyName}
                    </span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value duration">
                      {course.duration}
                    </span>
                  </div>
                </div>

                <p className="course-description">{course.description}</p>

                {/* <button
                  className="view-details-btn"
                  onClick={() => {
                    // Add your navigation logic here
                    console.log(`View details for ${course.title}`)
                  }}
                >
                  View Details
                </button> */}
              </div>
            ))}

            {/* View All Courses Button Card */}
            <Link
              to='/all-courses'
              className="view-all-card"
            >
              <div className="view-all-icon">
                <span className="view-all-arrow"><i className="bi bi-chevron-right"></i></span>
              </div>
              <h3 className="view-all-title">See more</h3>
              <p className="view-all-subtitle">
                Explore our complete course catalog and find the perfect program for your goals
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default OurCourses;