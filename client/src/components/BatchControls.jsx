import React, { useEffect, useState } from "react";
import StudentList from "../modals/ModalFour";
import AttendanceList from "../modals/AttendanceMarking";
import DatePicker from "react-datepicker";
import Teacher from "../modals/Teacher";

export default function BatchControls({ batchesRecords, setBatchesRecords }) {
    const [students, setStudents] = useState({});
    const [showStudentListFor, setShowStudentListFor] = useState(null);
    const [openAttendanceModals, setOpenAttendanceModals] = useState({});
    const [selectedDates, setSelectedDates] = useState({});
    const [markedStatus, setMarkedStatus] = useState({});
    const [attendanceMap, setAttendanceMap] = useState({});
    const [activeStudentAttendance, setActiveStudentAttendance] = useState(null);
    const [teacher, setTeacher] = useState({});
    const [openTeacherModals, setOpenTeacherModals] = useState({});
    const [selectedTeachers, setSelectedTeachers] = useState({});
    const [teachersList, setTeachersList] = useState([]);

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const now = new Date();
    const jsMonth = now.getMonth();
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;
    const currentYear = now.getFullYear();
    const academicYearStart = jsMonth >= 3 ? currentYear : currentYear - 1;

    const token = localStorage.getItem("authToken");

    useEffect(() => {

        // fetching all students of batch
        const fetchStudents = async (batchId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admin/batchStudents/${batchId}`,
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

        // finding assigned teacher of batch
        const findTeacher = async (batchId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/findTeacher/${batchId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const teacherGet = await res.json();
                if (!res.ok) throw new Error(teacherGet.message || "Error fetching teacher");

                setTeacher(prev => ({
                    ...prev,
                    [batchId]: teacherGet.teacher[0],
                }));

            } catch (err) {
                console.error("Failed to fetch student attendance:", err);
                alert("Error fetching attendance");
            }
        };

        // fetching all teachers
        const fetchTeachers = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching teachers");

                setTeachersList(data);
            } catch (err) {
                console.error("Error fetching teachers:", err);
            }
        };


        batchesRecords.forEach((batch) => {
            fetchStudents(batch._id);
            findTeacher(batch._id);
        });

        fetchTeachers();

    }, [batchesRecords]);


    const markAttendance = async (studentId, batchId, status, date) => {
        if (!date) return alert("Please select a date first.");

        const dateOnly = new Date(date.toDateString());
        const dateISO = dateOnly.toISOString();

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/mark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ studentId, batchId, date: dateISO, status }),
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

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            const newMap = {};
            data.attendance?.forEach((record) => {
                const date = new Date(record.date);
                const formattedDate = date.toISOString().split('T')[0];
                const key = `${record.batchId}_${formattedDate}`;
                newMap[key] = record.status;
            });

            setAttendanceMap((prev) => ({ ...prev, ...newMap }));
        } catch (err) {
            console.error("Failed to fetch student attendance:", err);
            alert("Error fetching attendance");
        }
    };

    const deleteBatch = async (batchId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this batch?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/batchDelete/${batchId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete batch.");
                return;
            }

            alert("Batch deleted successfully!");

            // ✅ Remove batch from local list without refresh
            const updated = batchesRecords.filter(b => b._id !== batchId);
            setBatchesRecords(updated);



        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong while deleting.");
        }
    };

    const assignTeacherToBatch = async (batchId, teacherId) => {
        if (!teacherId) return alert("Please select a teacher first.");

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/assignTeacher/${batchId}/${teacherId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Assignment failed");

            setOpenTeacherModals((prev) => ({ ...prev, [batchId]: false }));

            // Optional: update UI with new teacher
            setTeacher((prev) => ({ ...prev, [batchId]: data.teacher }));
            setOpenTeacherModals(false);
        } catch (err) {
            console.error("Error assigning teacher:", err);
            alert("Failed to assign teacher.");
        }
    };


    const openAttendanceModal = (batchId) => setOpenAttendanceModals((prev) => ({ ...prev, [batchId]: true }));
    const closeAttendanceModal = (batchId) => setOpenAttendanceModals((prev) => ({ ...prev, [batchId]: false }));

    return (
        <div id="batches" className="batches-container">
            <h1>Batches</h1>
            <div className="container">
                <div className="row">
                    {batchesRecords.length > 0 ? (
                        batchesRecords.map((batch, index) => {
                            const batchId = batch._id;
                            const selectedDate = selectedDates[batchId] || new Date();

                            return (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{batch.name}</h5>
                                        <span>Created At: {batch.createdAt}</span>
                                        <span>Teacher: {teacher[batchId]?.name || "N/A"}</span>
                                        <div className="d-flex gap-3">
                                            <button className="button" onClick={() => setShowStudentListFor(batchId)}>
                                                Show all students
                                            </button>
                                            <StudentList
                                                isOpen={showStudentListFor === batchId}
                                                onClose={() => setShowStudentListFor(null)}
                                            >
                                                <div>
                                                    <h3>{batch.name}</h3>
                                                    <ul className="mt-2">
                                                        {students[batchId]?.map((student) => (
                                                            <li key={student._id} className="mb-3">
                                                                <div className="d-flex flex-wrap gap-2">
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
                                                                                            key={month}
                                                                                            className={`carousel-item ${monthIdx === activeMonthIndex ? "active" : ""}`}
                                                                                        >
                                                                                            <h6>{month} {calendarYear}</h6>
                                                                                            <div className="calendar-grid">
                                                                                                {[...Array(daysInMonth)].map((_, d) => {
                                                                                                    const date = new Date(calendarYear, calendarMonth, d + 1);
                                                                                                    const formatted = date.toISOString().split("T")[0];
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
                                                                                                            title={`${month} ${d + 1}, ${calendarYear} - ${status || "No record"}`}
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
                                                    <h3>{batch.name}</h3>
                                                    <DatePicker
                                                        className="datePicker"
                                                        dateFormat="yyyy-MM-dd"
                                                        selected={selectedDate}
                                                        onChange={(date) =>
                                                            setSelectedDates((prev) => ({ ...prev, [batchId]: date }))
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
                                                            {students[batchId]?.map((student) => (
                                                                <tr key={student._id}>
                                                                    <td>{student.name}</td>
                                                                    <td>
                                                                        <button
                                                                            className={`btn btn-success btn-sm me-2 ${markedStatus[`${student._id}_${batchId}_${selectedDate.toDateString()}`] === "present" ? "active" : ""}`}
                                                                            onClick={() => markAttendance(student._id, batchId, "present", selectedDate)}
                                                                        >
                                                                            Present
                                                                        </button>
                                                                        <button
                                                                            className={`btn btn-danger btn-sm ${markedStatus[`${student._id}_${batchId}_${selectedDate.toDateString()}`] === "absent" ? "active" : ""}`}
                                                                            onClick={() => markAttendance(student._id, batchId, "absent", selectedDate)}
                                                                        >
                                                                            Absent
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </AttendanceList>
                                        </div>
                                        <div className="d-flex mt-3 gap-3">
                                            <button className="button" onClick={() => setOpenTeacherModals(prev => ({ ...prev, [batchId]: true }))}>
                                                Assign/Change Teacher
                                            </button>
                                            <button className="btn btn-danger" onClick={() => deleteBatch(batch._id)}>Delete Batch</button>
                                        </div>

                                        <Teacher
                                            isOpen={!!openTeacherModals[batchId]}
                                            onClose={() => setOpenTeacherModals(prev => ({ ...prev, [batchId]: false }))}
                                        >
                                            <h3>Assigning Teacher to {batch.name}</h3>

                                            <div className="input-group mt-3 gap-3">
                                                <label>Select Teacher:</label>
                                                <select
                                                    className="form-select mt-1"
                                                    value={selectedTeachers[batchId] || ""}
                                                    onChange={(e) =>
                                                        setSelectedTeachers((prev) => ({ ...prev, [batchId]: e.target.value }))
                                                    }
                                                >
                                                    <option value="">-- Select a teacher --</option>
                                                    {teachersList.map((teacher) => (
                                                        <option key={teacher._id} value={teacher._id}>
                                                            {teacher.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <button
                                                className="button mt-3"
                                                onClick={() => assignTeacherToBatch(batchId, selectedTeachers[batchId])}
                                            >
                                                Assign Teacher
                                            </button>
                                        </Teacher>

                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No batches found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}