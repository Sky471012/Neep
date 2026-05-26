import React from "react";

const class12Toppers = [
  {
    id: 1,
    name: "Prince",
    subject: "Chemistry",
    marks: "100",
    image: "/toppers/Prince_Chemistry.webp",
  },
  {
    id: 2,
    name: "Kunal",
    subject: "Political Science",
    marks: "100",
    image: "/toppers/Kunal_PoliticalScience.webp",
  },
  {
    id: 3,
    name: "Tanisha",
    subject: "History",
    marks: "100",
    image: "/toppers/Tanisha_History.webp",
  },
  {
    id: 4,
    name: "Nidhi",
    subject: "Business Studies",
    marks: "100",
    image: "/toppers/Nidhi_BusinessStudies.webp",
  },
  {
    id: 5,
    name: "Aradhya",
    subject: "Computer Science",
    marks: "100",
    image: "/toppers/Aradhya_ComputerScience.webp",
  },
  {
    id: 6,
    name: "Nidhi",
    subject: "Accountancy",
    marks: "99",
    image: "/toppers/Nidhi_Accountancy.webp",
  },
  {
    id: 7,
    name: "Vrisha",
    subject: "Economics",
    marks: "99",
    image: "/toppers/Vrisha_Economics.webp",
  },
  {
    id: 8,
    name: "Neha",
    subject: "Mathematics",
    marks: "98",
    image: "/toppers/Neha_Mathematics.webp",
  },
  {
    id: 9,
    name: "Anmol",
    subject: "Physics",
    marks: "98",
    image: "/toppers/Anmol_Physics.webp",
  },
  {
    id: 10,
    name: "Amit",
    subject: "Biology",
    marks: "98",
    image: "/toppers/Amit_Biology.webp",
  },
  {
    id: 11,
    name: "Piyush",
    subject: "English",
    marks: "98",
    image: "/toppers/Piyush_English.webp",
  },
  {
    id: 12,
    name: "Kunal",
    subject: "Geography",
    marks: "95",
    image: "/toppers/Kunal_Geography.webp",
  },
];

const class10Toppers = [
  {
    id: 1,
    name: "Kanika",
    subject: "Mathematics",
    marks: "100",
    image: "/toppers/Kanika_Mathematics.webp",
  },
  {
    id: 2,
    name: "Shikhar",
    subject: "Science",
    marks: "100",
    image: "/toppers/Shikhar_Science.webp",
  },
  {
    id: 3,
    name: "Disha",
    subject: "English",
    marks: "99",
    image: "/toppers/Disha_English.webp",
  },
  {
    id: 4,
    name: "Ankit",
    subject: "Social Science",
    marks: "99",
    image: "/toppers/Ankit_SocialScience.webp",
  },
  {
    id: 5,
    name: "Nita",
    subject: "Hindi",
    marks: "99",
    image: "/toppers/Nita_Hindi.webp",
  }
];

const TopperCard = ({ topper }) => (
  <div className="topper-card" key={topper.id}>
    <div className="card-decoration">
      <div className="decoration-dot top-left"></div>
      <div className="decoration-dot top-right"></div>
      <div className="decoration-line"></div>
    </div>

    <div className="topper-image-container">
      <div className="image-frame">
        <img src={topper.image} alt={topper.name} className="topper-image" />
      </div>
      <div className="achievement-badge">
        <span className="star">★</span>
      </div>
    </div>

    <div className="topper-info">
      <h3 className="topper-name">{topper.name}</h3>
      <div className="subject-container">
        <div className="subject-line"></div>
        <p className="topper-subject">{topper.subject}</p>
        <div className="subject-line"></div>
      </div>
      <div className="marks-container">
        <span className="marks-label">Score</span>
        <p className="topper-marks">{topper.marks}%</p>
      </div>
    </div>

    <div className="card-footer">
      <div className="footer-decoration"></div>
    </div>
  </div>
);

const ToppersList = () => {
  return (
    <div className="toppers-section">
      <h2 className="section-title">Meet Our Academic Toppers</h2>

      <h3 className="class-title">Class 12<sup>th</sup></h3>
      <div className="toppers-grid">
        {class12Toppers.map((topper) => (
          <TopperCard topper={topper} key={topper.id} />
        ))}

      </div>
      <h3 className="class-title">Class 10<sup>th</sup></h3>
      <div className="toppers-grid">
        {class10Toppers.map((topper) => (
          <TopperCard topper={topper} key={topper.id} />
        ))}
      </div>

      {/* And Many More Container */}
      <div className="many-more-container">
        <div className="many-more-content">
          <h3 className="many-more-title">And Many More</h3>
          <div className="dots-decoration">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <p className="many-more-subtitle">Countless success stories continue to inspire</p>
        </div>
      </div>

      <style>{`
        .toppers-section {
          padding: 5rem 2rem 2rem;
          background: #f2f4f8;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .toppers-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(72, 219, 251, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 90% 30%, rgba(255, 195, 113, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .section-title {
          font-size: 3rem!important;
          margin-bottom: 3rem!important;
          background: linear-gradient(135deg, #0b3d91 0%, #4a90e2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
          position: relative;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          border-radius: 2px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .class-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0b3d91 0%, #4a90e2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 2rem 0 2rem;
          position: relative;
          display: inline-block;
        }

        .class-title sup {
          font-size: 1rem;
          margin-left: 2px;
        }

        .class-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
          border-radius: 2px;
        }

        .toppers-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2.5rem;
        }

        .topper-card {
          flex: 0 0 280px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.6);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .topper-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, transparent);
          transition: left 0.6s ease;
        }

        .topper-card:hover::before {
          left: 100%;
        }

        .topper-card:hover {
          transform: translateY(-15px) scale(1.03);
          box-shadow: 
            0 25px 80px rgba(0, 0, 0, 0.15),
            0 12px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .card-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          pointer-events: none;
        }

        .decoration-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          border-radius: 50%;
          opacity: 0.7;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        .decoration-dot.top-left {
          top: 20px;
          left: 20px;
          animation-delay: 0s;
        }

        .decoration-dot.top-right {
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #45b7d1, #96ceb4);
          animation-delay: 1s;
        }

        .decoration-line {
          position: absolute;
          top: 50%;
          right: -50px;
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.3), rgba(78, 205, 196, 0.3), transparent);
          transform: translateY(-50%) rotate(45deg);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        .topper-image-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .image-frame {
          position: relative;
          display: inline-block;
        }

        .image-frame::before {
          content: '';
          position: absolute;
          inset: -10px;
          background: conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b);
          border-radius: 50%;
          opacity: 0.8;
          animation: rotate 8s linear infinite;
          filter: blur(8px);
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .topper-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid rgba(255, 255, 255, 0.9);
          position: relative;
          z-index: 2;
          transition: all 0.4s ease;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .topper-card:hover .topper-image {
          border-color: white;
          transform: scale(1.08);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
        }

        .achievement-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(0deg); }
          40% { transform: translateY(-5px) rotate(10deg); }
          60% { transform: translateY(-3px) rotate(-5deg); }
        }

        .star {
          color: white;
          font-size: 16px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .topper-info {
          position: relative;
          z-index: 2;
        }

        .topper-name {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0b3d91 0%, #4a90e2 50%, #667eea 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          position: relative;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .subject-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .subject-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(11, 61, 145, 0.3), transparent);
          max-width: 30px;
        }

        .topper-subject {
          font-size: 1.1rem;
          color: #555;
          font-weight: 500;
          white-space: nowrap;
        }

        .marks-container {
          position: relative;
        }

        .marks-label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 0.5rem;
        }

        .topper-marks {
          font-size: 2.2rem;
          background: linear-gradient(135deg, #0b3d91, #4a90e2);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
          margin: 0;
          position: relative;
        }

        .card-footer {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
        }

        .footer-decoration {
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(11, 61, 145, 0.2), transparent);
          border-radius: 1px;
        }

        /* Many More Section Styles */
        .many-more-container {
          position: relative;
          padding: 3rem 0;
          margin-top: 2rem;
        }

        .many-more-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .many-more-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0b3d91 0%, #4a90e2 50%, #667eea 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          animation: fadeInUp 1.5s ease-out;
        }

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

        .dots-decoration {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          animation: dotPulse 2s infinite;
          opacity: 0.7;
        }

        .dot:nth-child(1) {
          animation-delay: 0s;
        }

        .dot:nth-child(2) {
          animation-delay: 0.3s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
        }

        .many-more-subtitle {
          font-size: 1.1rem;
          color: #666;
          font-weight: 400;
          margin: 0;
          font-style: italic;
          opacity: 0.8;
          animation: fadeIn 2s ease-out 0.5s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.8;
          }
        }


        @media (max-width: 768px) {
          .topper-card {
            flex: 0 0 90%;
            max-width: 320px;
          }
          
          .section-title {
            font-size: 2rem;
          }

          .many-more-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ToppersList;