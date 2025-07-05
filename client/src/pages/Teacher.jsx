import React, { useState, useEffect } from "react";
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
    const [showAttendanceListFor, setShowAttendanceListFor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [markedStatus, setMarkedStatus] = useState({});


    useEffect(() => {
        const storedTeacher = localStorage.getItem("teacher");
        const token = localStorage.getItem("authToken");

        if (storedTeacher && token && storedTeacher !== "undefined") {
            try {
                setTeacher(JSON.parse(storedTeacher));
            } catch (err) {
                console.error("Failed to parse teacher JSON:", err);
                localStorage.removeItem("teacher"); // cleanup
                return;
            }

            // Fetch batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/teacher/batches`, {
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

    // fetching batch students
    useEffect(() => {
        const token = localStorage.getItem("authToken");

        const fetchStudents = async (batchId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL
                    }/teacher/batchStudents/${batchId}`,
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
            fetchStudents(batch.batchId); // ✅ Call for each batch
        });
    }, [batchesRecords]);

    if (!teacher) return <p>Loading teacher data...</p>;

    const markAttendance = async (studentId, status) => {
        if (!selectedDate) return alert("Please select a date first.");

        const token = localStorage.getItem("authToken");
        const dateISO = new Date(selectedDate).toISOString();

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/teacher/attendance/mark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId,
                    batchId: showAttendanceListFor,
                    date: dateISO,
                    status
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

            // ✅ update local status map
            setMarkedStatus(prev => ({
                ...prev,
                [`${studentId}_${showAttendanceListFor}_${selectedDate.toDateString()}`]: status
            }));
        } catch (err) {
            console.error("Attendance error:", err);
            alert("Failed to mark attendance.");
        }
    };


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
                                batchesRecords.map((batch, index) => (
                                    <div className="col-12 col-md-6 col-lg-5" key={index}>
                                        <div className="card batch-card mb-3">
                                            <h5 className="card-title">{batch.batchName}</h5>

                                            <div className="d-flex gap-3">

                                                <button className="button" onClick={() => setShowStudentListFor(batch.batchId)}>
                                                    Show all students
                                                </button>
                                                <StudentList
                                                    isOpen={showStudentListFor === batch.batchId}
                                                    onClose={() => setShowStudentListFor(null)}
                                                >
                                                    {showStudentListFor && (
                                                        <div>
                                                            <h3>
                                                                {
                                                                    batchesRecords.find(b => b.batchId === showStudentListFor)?.batchName
                                                                }
                                                            </h3>
                                                            <ul className="mt-2">
                                                                {students[showStudentListFor]?.length > 0 ? (
                                                                    students[showStudentListFor].map((student, idx) => (
                                                                        <li key={idx}>{student.name}</li>
                                                                    ))
                                                                ) : (
                                                                    <li>Loading or no students found.</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </StudentList>




                                                <button className="button" onClick={() => setShowAttendanceListFor(batch.batchId)}>
                                                    Mark attendance
                                                </button>
                                                <AttendanceList
                                                    isOpen={showAttendanceListFor === batch.batchId}
                                                    onClose={() => setShowAttendanceListFor(null)}
                                                >
                                                    {showAttendanceListFor && (
                                                        <div>
                                                            <h3>
                                                                {
                                                                    batchesRecords.find(b => b.batchId === showAttendanceListFor)?.batchName
                                                                }
                                                            </h3>

                                                            {/* Date Picker */}
                                                            <DatePicker
                                                                className='datePicker'
                                                                dateFormat="yyyy-MM-dd"
                                                                selected={selectedDate}
                                                                onChange={(date) => setSelectedDate(date)}
                                                                placeholderText="Select date"
                                                            />

                                                            {/* Table for Attendance Marking */}
                                                            <table className="table table-bordered mt-3">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Student Name</th>
                                                                        <th>Mark Attendance</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {students[showAttendanceListFor]?.length > 0 ? (
                                                                        students[showAttendanceListFor].map((student) => (
                                                                            <tr key={student._id}>
                                                                                <td>{student.name}</td>
                                                                                <td>
                                                                                    <button
                                                                                        className={`btn btn-success btn-sm me-2 ${markedStatus[`${student._id}_${showAttendanceListFor}_${selectedDate?.toDateString()}`] === "present" ? "active" : ""}`}
                                                                                        onClick={() => markAttendance(student._id, "present")}
                                                                                    >
                                                                                        Present
                                                                                    </button>
                                                                                    <button
                                                                                        className={`btn btn-danger btn-sm ${markedStatus[`${student._id}_${showAttendanceListFor}_${selectedDate?.toDateString()}`] === "absent" ? "active" : ""}`}
                                                                                        onClick={() => markAttendance(student._id, "absent")}
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
                                                    )}

                                                </AttendanceList>



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
            </div>
            <Footer />
        </>
    );
}
