import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Student() {

    const [student, setStudent] = useState(null);

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    if (storedStudent) {
      try {
        const parsed = JSON.parse(storedStudent);
        if (parsed && parsed.name) {
          setStudent(parsed);
        }
      } catch (err) {
        console.error("Failed to parse student:", err);
      }
    }
  }, []);

  // ✅ Early return to prevent null reference
  if (!student) {
    return <p>Loading student data...</p>;
  }
  


    return (<>

        <Navbar />

        <div className="main-content student-container">


            <div className="student-details">
                <h1>Student details</h1>
                <div className="container">
                    <span>Name : {student.name}</span><br />
                    <span>Phone : {student.phone}</span><br />
                    <span>DOB : {student.dob}</span>
                </div>
            </div>

            <div className="batches-container">
                <h1>Batches</h1>
                <div className="container">
                    <div className="row">
                        <div className='col-12 col-md-6 col-lg-5'>
                            <div className="card batch-card">
                                <h4>Class 12 - Morning Batch</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fee-details">
                <h1>Fee Details</h1>

                <table className="table table-bordered table-striped text-center">
                    <thead className="table-dark">
                        <tr>
                            <th>Month</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ].map((month, index) => (
                            <tr key={index}>
                                <td>{month}</td>
                                <td className="text-success fw-bold">Pending</td>
                                <td>₹3000</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>

        <Footer />

    </>)
}
