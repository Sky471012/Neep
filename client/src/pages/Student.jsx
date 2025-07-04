import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Student() {

    const [student, setStudent] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const currentYear = new Date().getFullYear();


    useEffect(() => {
        const storedStudent = localStorage.getItem("student");
        const token = localStorage.getItem("authToken");

        if (storedStudent && token) {
            setStudent(JSON.parse(storedStudent));

            // fetch batches status
            fetch(`${import.meta.env.VITE_BACKEND_URL}/student/batches`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setBatchesRecords(data); // new state
                    console.log(batchesRecords);
                })
                .catch(err => console.error("Batches fetch error:", err));


            // fetch fee status
            fetch(`${import.meta.env.VITE_BACKEND_URL}/student/fee-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setFeeRecords(data); // new state
                })
                .catch(err => console.error("Fee status fetch error:", err));
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
                        {batchesRecords.length > 0 ? (
                            batchesRecords.map((batch, index) => (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{batch.batchName}</h5>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No batches assigned.</p>
                        )}
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
                            <th>Paid On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allMonths.map((month, index) => {
                            // April–December = current year, Jan–Mar = next year
                            const year = index < 9 ? currentYear : currentYear + 1;
                            const fullMonth = `${month} ${year}`;

                            const record = feeRecords.find(r =>
                                r.month.trim().toLowerCase() === fullMonth.trim().toLowerCase()
                            );


                            return (
                                <tr key={index}>
                                    <td>{fullMonth}</td>
                                    <td className={record ? "text-success fw-bold" : "text-danger fw-bold"}>
                                        {record ? "Paid" : "Pending"}
                                    </td>
                                    <td>{record ? `₹${record.amount}` : "--"}</td>
                                    <td>
                                        {record && record.paidOn
                                            ? new Date(record.paidOn).toLocaleDateString()
                                            : "--"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>



            </div>

        </div>

        <Footer />

    </>)
}
