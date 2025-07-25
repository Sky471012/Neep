import React from "react";

const StudentsReviews = () => {
  const students = [
    {
      name: "Arjun Mehta",
      subject: "Economics",
      score: "94%",
      batch: "2023-24",
      review: "Faculty's teaching helped a lot. Recommended!",
    },
    {
      name: "Kavya Sharma",
      subject: "Statistics",
      score: "96%",
      batch: "2023-24",
      review: "Notes helped. Scored well.",
    },
    {
      name: "Rohit Agarwal",
      subject: "Business Studies",
      score: "92%",
      batch: "2022-23",
      review: "Practical examples made it easier.",
    },
    {
      name: "Priyanka Singh",
      subject: "Mathematics",
      score: "98%",
      batch: "2023-24",
      review: "Cleared doubts quickly.",
    },
    {
      name: "Vikram Joshi",
      subject: "Economics",
      score: "95%",
      batch: "2022-23",
      review: "Excellent faculty.",
    },
    {
      name: "Sneha Patel",
      subject: "Accountancy",
      score: "93%",
      batch: "2023-24",
      review: "Great practical approach.",
    },
    {
      name: "Aditya Kumar",
      subject: "Statistics",
      score: "97%",
      batch: "2022-23",
      review: "Amazing support!",
    },
  ];

  return (
    <div className="reviews-section">
      <h2 className="section-title">What Our Students Say</h2>
      <div className="reviews-grid">
        {students.map((student, idx) => (
          <div key={idx} className="review-card">
            <div className="student-name">{student.name}</div>
            <div className="student-details">
              <span className="student-subject">{student.subject}</span>
              <span className="student-batch">Batch: {student.batch}</span>
              <span className="student-score">{student.score}</span>
            </div>
            <div className="review-text">“{student.review}”</div>
            <div className="stars">★★★★☆</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .reviews-section {
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

        .reviews-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2.5rem;
        }

        .review-card {
          flex: 0 0 260px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .review-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .student-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #0b3d91;
          margin-bottom: 0.5rem;
        }

        .student-details {
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .student-subject {
          color: #0d6efd;
          font-weight: 500;
        }

        .student-score {
          color: #198754;
          background: #e9f7ec;
          border-radius: 20px;
          padding: 2px 8px;
          font-size: 0.8rem;
          display: inline-block;
          width: fit-content;
        }

        .review-text {
          font-style: italic;
          color: #333;
          font-size: 0.95rem;
          margin: 1rem 0 0.5rem 0;
        }

        .stars {
          color: #ffc107;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .review-card {
            flex: 0 0 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentsReviews;
