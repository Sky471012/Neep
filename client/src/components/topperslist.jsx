import React from "react";

const toppers = [
  {
    id: 1,
    name: "Priya Sharma",
    subject: "Economics",
    marks: "98.6%",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    subject: "Statistics",
    marks: "97.8%",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 3,
    name: "Anita Singh",
    subject: "Business Studies",
    marks: "96.4%",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 4,
    name: "Vikash Gupta",
    subject: "Mathematics",
    marks: "99.2%",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 5,
    name: "Sneha Patel",
    subject: "Economics",
    marks: "95.8%",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 6,
    name: "Amit Verma",
    subject: "Accountancy",
    marks: "97.2%",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 7,
    name: "Pooja Jain",
    subject: "Statistics",
    marks: "94.6%",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?crop=faces&fit=crop&w=120&h=120",
  },
  {
    id: 8,
    name: "Ravi Sharma",
    subject: "Business Studies",
    marks: "96.8%",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&w=120&h=120",
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

      <style jsx>{`
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
