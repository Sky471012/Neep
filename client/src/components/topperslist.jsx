import React from "react";

const toppers = [
  {
    id: 1,
    name: "Nidhi",
    subject: "Bussiness Studies",
    marks: "100",
    image: "/toppers/Nidhi.png",
  },
  {
    id: 2,
    name: "Prince",
    subject: "Chemistry",
    marks: "100",
    image: "/toppers/Prince.png",
  },
  {
    id: 3,
    name: "Nidhi",
    subject: "Economics",
    marks: "99",
    image: "/toppers/Nidhi.png",
  },
  {
    id: 4,
    name: "Vikash Gupta",
    subject: "Mathematics",
    marks: "98",
    image: "/toppers/Neha.png",
  },
  {
    id: 5,
    name: "Sneha Patel",
    subject: "Biology",
    marks: "98",
    image: "/toppers/Amit.png",
  },
  {
    id: 6,
    name: "Nidhi",
    subject: "Accountancy",
    marks: "99",
    image: "/toppers/Nidhi.png",
  },
  {
    id: 7,
    name: "Ayush",
    subject: "Physics",
    marks: "95",
    image: "/toppers/Ayush.png",
  },
  {
    id: 8,
    name: "Soniya",
    subject: "Political Science",
    marks: "95",
    image: "/toppers/Soniya.png",
  },
];

const ToppersList = () => {
  return (
    <div className="toppers-section">
      <h2 className="section-title">Meet Our Academic Toppers</h2>
      <div className="toppers-grid">
        {toppers.map((topper) => (
          <div className="topper-card" key={topper.id}>
            <img src={topper.image} alt={topper.name} className="topper-image" />
            <h3 className="topper-name">{topper.name}</h3>
            <p className="topper-subject">{topper.subject}</p>
            <p className="topper-marks">{topper.marks}</p>
          </div>
        ))}
      </div>

      <style>{`
        .toppers-section {
          padding: 5rem 2rem;
          background-color: #f2f4f8;
          text-align: center;
        }

        .section-title {
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #0b3d91;
          font-weight: bold;
        }

        .toppers-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2.5rem;
        }

        .topper-card {
          flex: 0 0 260px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 2.5rem 1.8rem;
          text-align: center;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.4s ease;
          cursor: pointer;
        }

        .topper-card:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border-color: #0b3d91;
        }

        .topper-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 1rem;
          border: 2px solid #0b3d91;
        }

        .topper-name {
          font-size: 1.4rem;
          font-weight: 600;
          color: #0b3d91;
        }

        .topper-subject {
          font-size: 1.1rem;
          color: #333;
        }

        .topper-marks {
          font-size: 1rem;
          color: #777;
        }

        @media (max-width: 768px) {
          .topper-card {
            flex: 0 0 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default ToppersList;
