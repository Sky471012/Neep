import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StudentList from "../modals/StudentList";
import AttendanceList from "../modals/AttendanceMarking";

export default function Teacher() {
    const [teacher, setTeacher] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [students, setStudents] = useState({});
    const [showStudentListFor, setShowStudentListFor] = useState(null);
    const [openAttendanceModals, setOpenAttendanceModals] = useState({});
    const [selectedDates, setSelectedDates] = useState({});
    const [markedStatus, setMarkedStatus] = useState({});
    const [attendanceMap, setAttendanceMap] = useState({});
    // Changed: Single student attendance tracking instead of multiple
    const [activeStudentAttendance, setActiveStudentAttendance] = useState(null);

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const now = new Date();
    const jsMonth = now.getMonth();
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;
    const currentYear = now.getFullYear();
    const academicYearStart = jsMonth >= 3 ? currentYear : currentYear - 1;

    useEffect(() => {
        const storedTeacher = localStorage.getItem("teacher");
        const token = localStorage.getItem("authToken");

        if (storedTeacher && token && storedTeacher !== "undefined") {
            try {
                setTeacher(JSON.parse(storedTeacher));
            } catch (err) {
                console.error("Failed to parse teacher JSON:", err);
                localStorage.removeItem("teacher");
                return;
            }

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch batches");
                    return res.json();
                })
                .then(setBatchesRecords)
                .catch((err) => console.error("Batches fetch error:", err));
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        const fetchStudents = async (batchId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/teacher/batchStudents/${batchId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching students");

                setStudents((prev) => ({
                    ...prev,
                    [batchId]: data.students,
                }));
            } catch (err) {
                console.error(`Error fetching students for batch ${batchId}:`, err);
            }
        };

        batchesRecords.forEach((batch) => {
            fetchStudents(batch.batchId);
        });
    }, [batchesRecords]);

    const openAttendanceModal = (batchId) => {
        setOpenAttendanceModals((prev) => ({ ...prev, [batchId]: true }));
    };

    const closeAttendanceModal = (batchId) => {
        setOpenAttendanceModals((prev) => ({ ...prev, [batchId]: false }));
    };

    const markAttendance = async (studentId, batchId, status, date) => {
        if (!date) return alert("Please select a date first.");

        const token = localStorage.getItem("authToken");
        const dateOnly = new Date(date.toDateString());
        const dateISO = dateOnly.toISOString();

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/mark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId,
                    batchId,
                    date: dateISO,
                    status,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

            setMarkedStatus((prev) => ({
                ...prev,
                [`${studentId}_${batchId}_${dateOnly.toDateString()}`]: status,
            }));
        } catch (err) {
            console.error("Attendance error:", err);
            alert("Failed to mark attendance.");
        }
    };

    const showStudentAttendance = async (studentId, batchId) => {
        // Changed: Only fetch if this student's attendance is not already active
        if (activeStudentAttendance === studentId) return;

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            const attendanceArray = data.attendance;

            if (!Array.isArray(attendanceArray)) {
                console.error("Invalid attendance array:", attendanceArray);
                alert("Unexpected response from server while fetching attendance.");
                return;
            }

            const newMap = {};
            attendanceArray.forEach((record) => {
                const date = new Date(record.date);
                const formattedDate = date.toISOString().split('T')[0];
                const key = `${record.batchId}_${formattedDate}`;
                newMap[key] = record.status;
            });

            setAttendanceMap((prev) => ({
                ...prev,
                ...newMap
            }));
        } catch (err) {
            console.error("Failed to fetch student attendance:", err);
            alert("Error fetching attendance");
        }
    };

    if (!teacher) return <p>Loading teacher data...</p>;

    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="student-details">
                    <h1>Teacher details</h1>
                    <div className="container">
                        <span>Name : {teacher.name}</span>
                        <br />
                        <span>Email : {teacher.email}</span>
                        <br />
                        <span>Role : {teacher.role}</span>
                    </div>
                </div>

                <div className="batches-container">
                    <h1>Batches</h1>
                    <div className="container">
                        <div className="row">
                            {batchesRecords.length > 0 ? (
                                batchesRecords.map((batch, index) => {
                                    const batchId = batch.batchId;
                                    const selectedDate = selectedDates[batchId] || new Date();

                                    return (
                                        <div className="col-12 col-md-6 col-lg-5" key={index}>
                                            <div className="card batch-card mb-3">
                                                <h5 className="card-title">{batch.batchName}</h5>
                                                <div className="d-flex gap-3">
                                                    <button className="button" onClick={() => setShowStudentListFor(batchId)}>
                                                        Show all students
                                                    </button>
                                                    <StudentList
                                                        isOpen={showStudentListFor === batchId}
                                                        onClose={() => setShowStudentListFor(null)}
                                                    >
                                                        <div>
                                                            <h3>{batch.batchName}</h3>
                                                            <ul className="mt-2">
                                                                {students[batchId]?.map((student, idx) => (
                                                                    <li key={student._id} className="mb-3">
                                                                        <div className="d-flex flex-wrap gap-2 align-items-center">
                                                                            <span>{student.name}</span>
                                                                            <button
                                                                                className="button"
                                                                                onClick={() => {
                                                                                    // Changed: Toggle logic for single student
                                                                                    if (activeStudentAttendance === student._id) {
                                                                                        // If this student's attendance is already shown, hide it
                                                                                        setActiveStudentAttendance(null);
                                                                                    } else {
                                                                                        // Show this student's attendance and hide others
                                                                                        setActiveStudentAttendance(student._id);
                                                                                        showStudentAttendance(student._id, batchId);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {activeStudentAttendance === student._id ? "Hide Attendance" : "Show Attendance"}
                                                                            </button>
                                                                        </div>

                                                                        {/* Changed: Only show if this specific student is active */}
                                                                        {activeStudentAttendance === student._id && (
                                                                            <div className="attendance-calendar mt-2">
                                                                                <div id={`carousel-${student._id}`} className="carousel slide">
                                                                                    <div className="carousel-inner">
                                                                                        {allMonths.map((month, monthIdx) => {
                                                                                            let calendarMonth, calendarYear;

                                                                                            if (monthIdx <= 8) {
                                                                                                calendarMonth = monthIdx + 3;
                                                                                                calendarYear = academicYearStart;
                                                                                            } else {
                                                                                                calendarMonth = monthIdx - 9;
                                                                                                calendarYear = academicYearStart + 1;
                                                                                            }

                                                                                            const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

                                                                                            return (
                                                                                                <div
                                                                                                    className={`carousel-item ${monthIdx === activeMonthIndex ? "active" : ""}`}
                                                                                                    key={month}
                                                                                                >
                                                                                                    <h6>{month} {calendarYear}</h6>
                                                                                                    <div className="calendar-grid">
                                                                                                        {[...Array(daysInMonth)].map((_, d) => {
                                                                                                            const date = new Date(calendarYear, calendarMonth, d + 1);
                                                                                                            const formatted = date.toISOString().split('T')[0];
                                                                                                            const key = `${batchId}_${formatted}`;
                                                                                                            const status = attendanceMap[key];

                                                                                                            return (
                                                                                                                <div
                                                                                                                    key={d}
                                                                                                                    className={`date-box ${status === "present"
                                                                                                                        ? "present"
                                                                                                                        : status === "absent"
                                                                                                                            ? "absent"
                                                                                                                            : ""}`}
                                                                                                                    title={`${month} ${d + 1}, ${calendarYear} - ${status || 'No record'}`}
                                                                                                                >
                                                                                                                    {d + 1}
                                                                                                                </div>
                                                                                                            );
                                                                                                        })}
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>

                                                                                    {/* Carousel Controls */}
                                                                                    <div className="calendar-controls d-flex justify-content-between mt-2">
                                                                                        <button
                                                                                            className="btn btn-outline-secondary btn-sm"
                                                                                            type="button"
                                                                                            data-bs-target={`#carousel-${student._id}`}
                                                                                            data-bs-slide="prev"
                                                                                        >
                                                                                            ‹ Previous
                                                                                        </button>
                                                                                        <button
                                                                                            className="btn btn-outline-secondary btn-sm"
                                                                                            type="button"
                                                                                            data-bs-target={`#carousel-${student._id}`}
                                                                                            data-bs-slide="next"
                                                                                        >
                                                                                            Next ›
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </StudentList>

                                                    <button className="button" onClick={() => openAttendanceModal(batchId)}>
                                                        Mark attendance
                                                    </button>
                                                    <AttendanceList
                                                        isOpen={openAttendanceModals[batchId]}
                                                        onClose={() => closeAttendanceModal(batchId)}
                                                    >
                                                        <div>
                                                            <h3>{batch.batchName}</h3>
                                                            <DatePicker
                                                                className="datePicker"
                                                                dateFormat="yyyy-MM-dd"
                                                                selected={selectedDate}
                                                                onChange={(date) =>
                                                                    setSelectedDates((prev) => ({
                                                                        ...prev,
                                                                        [batchId]: date,
                                                                    }))
                                                                }
                                                                placeholderText="Select date"
                                                            />

                                                            <table className="table table-bordered mt-3">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Student Name</th>
                                                                        <th>Mark Attendance</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {students[batchId]?.length > 0 ? (
                                                                        students[batchId].map((student) => (
                                                                            <tr key={student._id}>
                                                                                <td>{student.name}</td>
                                                                                <td>
                                                                                    <button
                                                                                        className={`btn btn-success btn-sm me-2 ${markedStatus[`${student._id}_${batchId}_${selectedDate.toDateString()}`] === "present" ? "active" : ""}`}
                                                                                        onClick={() =>
                                                                                            markAttendance(student._id, batchId, "present", selectedDate)
                                                                                        }
                                                                                    >
                                                                                        Present
                                                                                    </button>
                                                                                    <button
                                                                                        className={`btn btn-danger btn-sm ${markedStatus[`${student._id}_${batchId}_${selectedDate.toDateString()}`] === "absent" ? "active" : ""}`}
                                                                                        onClick={() =>
                                                                                            markAttendance(student._id, batchId, "absent", selectedDate)
                                                                                        }
                                                                                    >
                                                                                        Absent
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="2">Loading or no students found.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </AttendanceList>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No batches assigned.</p>
                            )}
                        </div>
                    </div>
                </div>
            {(teacher.role=="admin") &&
                <Link to="/admin" className="button" style={{ backgroundColor: "gold", color: "black" }}>Admin Special</Link>
            }
            </div>

            <Footer />
        </>
    );
}