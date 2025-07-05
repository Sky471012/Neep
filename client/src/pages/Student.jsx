import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Student() {

    const [student, setStudent] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});

    const jsMonth = new Date().getMonth(); // 0 = Jan ... 11 = Dec
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const now = new Date();
    // Fix: Calculate academic year start based on current month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Jan, 3 = April
    const academicYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;

    useEffect(() => {
        const storedStudent = localStorage.getItem("student");
        const token = localStorage.getItem("authToken");

        if (storedStudent && token) {
            setStudent(JSON.parse(storedStudent));

            fetch(`${import.meta.env.VITE_BACKEND_URL}/student/batches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(setBatchesRecords)
                .catch(err => console.error("Batches fetch error:", err));

            fetch(`${import.meta.env.VITE_BACKEND_URL}/student/attendance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Attendance data received:", data);
                    setAttendanceRecords(data);
                    const newMap = {};
                    data.forEach((record) => {
                        // Fix: Ensure proper date formatting
                        const date = new Date(record.date);
                        const formattedDate = date.toISOString().split('T')[0];
                        const key = `${record.batchId}_${formattedDate}`;
                        newMap[key] = record.status;
                        console.log("Creating attendance map entry:", key, "=>", record.status);
                    });
                    setAttendanceMap(newMap);
                    console.log("Final attendance map:", newMap);
                })
                .catch(err => console.error("Attendance fetch error:", err));

            fetch(`${import.meta.env.VITE_BACKEND_URL}/student/fee-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(setFeeRecords)
                .catch(err => console.error("Fee status fetch error:", err));
        }
    }, []);


    if (!student) return <p>Loading student data...</p>;


    return (<>

        <Navbar />


        <div className="main-content student-container">

            {/* Student Details */}
            <div className="student-details">
                <h1>Student details</h1>
                <div className="container">
                    <span>Name : {student.name}</span><br />
                    <span>Phone : {student.phone}</span><br />
                    <span>DOB : {student.dob}</span>
                </div>
            </div>

            {/* Batches with Attendance Calendar */}
            <div className="batches-container">
                <h1>Batches</h1>
                <div className="container">
                    <div className="row">
                        {batchesRecords.length > 0 ? (
                            batchesRecords.map((batch, index) => (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{batch.batchName}</h5>

                                        <div id={`carousel-${batch.batchId}`} className="carousel slide">
                                            <div className="carousel-inner">
                                                {allMonths.map((month, idx) => {
                                                    // Fix: Map academic months to calendar months/years
                                                    // Academic year: April(0) to March(11)
                                                    // Calendar mapping: April=3, May=4, ..., Dec=11, Jan=0, Feb=1, Mar=2
                                                    let calendarMonth, calendarYear;

                                                    if (idx <= 8) { // April to December
                                                        calendarMonth = idx + 3; // April=3, May=4, ..., Dec=11
                                                        calendarYear = academicYearStart;
                                                    } else { // January to March
                                                        calendarMonth = idx - 9; // Jan=0, Feb=1, Mar=2
                                                        calendarYear = academicYearStart + 1;
                                                    }

                                                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

                                                    return (
                                                        <div className={`carousel-item ${idx === activeMonthIndex ? "active" : ""}`} key={month}>
                                                            <h6>{month} {calendarYear}</h6>
                                                            <div className="calendar-grid">
                                                                {[...Array(daysInMonth)].map((_, dateIdx) => {
                                                                    // Fix: Use proper calendar month and year for date construction
                                                                    const date = new Date(calendarYear, calendarMonth, dateIdx + 1);
                                                                    const fullDate = date.toISOString().split('T')[0];
                                                                    const key = `${batch.batchId}_${fullDate}`;
                                                                    const status = attendanceMap[key];

                                                                    return (
                                                                        <div
                                                                            key={dateIdx}
                                                                            className={`date-box ${status === "present"
                                                                                    ? "present"
                                                                                    : status === "absent"
                                                                                        ? "absent"
                                                                                        : ""
                                                                                }`}
                                                                            title={`${month} ${dateIdx + 1}, ${calendarYear} - ${status || 'No record'}`}
                                                                        >
                                                                            {dateIdx + 1}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Carousel Controls */}
                                            <div className="calendar-controls d-flex justify-content-between mt-2">
                                                <button className="btn btn-outline-secondary btn-sm"
                                                    type="button"
                                                    data-bs-target={`#carousel-${batch.batchId}`}
                                                    data-bs-slide="prev">
                                                    ‹ Previous
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm"
                                                    type="button"
                                                    data-bs-target={`#carousel-${batch.batchId}`}
                                                    data-bs-slide="next">
                                                    Next ›
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No batches assigned.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Fee Table */}
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
                            const year = index < 9 ? academicYearStart : academicYearStart + 1;
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
                                    <td>{record?.paidOn ? new Date(record.paidOn).toLocaleDateString() : "--"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>


        <Footer />


    </>);
}