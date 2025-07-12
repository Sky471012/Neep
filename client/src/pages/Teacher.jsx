import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import ModalFive from "../modals/ModalFive";

export default function Teacher() {
    const [teacher, setTeacher] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [students, setStudents] = useState({});
    const [tests, setTests] = useState({});
    const [timetable, setTimetable] = useState({});
    const [showModalOneFor, setShowModalOneFor] = useState(null);
    const [openModalTwo, setOpenModalTwo] = useState({});
    const [openModalThree, setOpenModalThree] = useState({});
    const [openModalFour, setOpenModalFour] = useState({});
    const [showModalFiveFor, setShowModalFiveFor] = useState(null);
    const [selectedDates, setSelectedDates] = useState({});
    const [markedStatus, setMarkedStatus] = useState({});
    const [testrecords, setTestRecords] = useState({});
    const [testFormData, setTestFormData] = useState({});
    const [formDates, setFormDates] = useState({});
    const [testDetails, setTestDetails] = useState({
        testName: "",
        maxMarks: "",
        testDate: null
    });
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
    }, []); // Only on initial mount

    // Fetch students and tests AFTER batches are loaded
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!batchesRecords || batchesRecords.length === 0) return;

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

        // Fetch tests AFTER batches are loaded
        const fetchAlltests = async (batchId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/teacher/getTest/${batchId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching tests");

                setTests((prev) => ({
                    ...prev,
                    [batchId]: data.test, // ✅ Use correct key
                }));
            } catch (err) {
                console.error(`Error fetching tests for batch ${batchId}:`, err);
            }
        };

        batchesRecords.forEach((batch) => {
            if (batch.batchId) {
                fetchStudents(batch.batchId);
                fetchAlltests(batch.batchId);
            }
        });
    }, [batchesRecords]);


    // fetching timetable
    const fetchTimetable = async (batchId) => {
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/timetable/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error fetching timetable");

            setTimetable((prev) => ({
                ...prev,
                [batchId]: data.timetable || [] // Ensure it's an array
            }));
        } catch (err) {
            console.error(`Error fetching timetable for batch ${batchId}:`, err);
        }
    };

    const openTimetableModal = (batchId) => {
        fetchTimetable(batchId); // fetch on open
        setOpenModalThree((prev) => ({ ...prev, [batchId]: true }));
    };

    const closeTimetableModal = (batchId) => {
        setOpenModalThree((prev) => ({ ...prev, [batchId]: false }));
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

    const openAttendanceModal = (batchId) => {
        setOpenModalTwo((prev) => ({ ...prev, [batchId]: true }));
    };

    const closeAttendanceModal = (batchId) => {
        setOpenModalTwo((prev) => ({ ...prev, [batchId]: false }));
    };

    const addTest = async (studentId, batchId, name, maxMarks, marksScored, date) => {
        if (!studentId || !batchId || !name || !maxMarks || !marksScored || !date) {
            return alert("All fields are required.");
        }

        const token = localStorage.getItem("authToken");
        const dateOnly = new Date(date.toDateString());
        const dateISO = dateOnly.toISOString();

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/test/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId,
                    batchId,
                    name,
                    maxMarks,
                    marksScored,
                    date: dateISO
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add test");

            setTestRecords((prev) => ({
                ...prev,
                [`${studentId}_${batchId}_${name}_${dateOnly.toDateString()}`]: {
                    studentId,
                    batchId,
                    name,
                    maxMarks,
                    marksScored,
                    date: dateOnly.toDateString()
                }
            }));
        } catch (err) {
            console.error("Attendance error:", err);
            alert("Failed to mark attendance.");
        }
    };

    const openTestModal = (batchId) => {
        setOpenModalFour((prev) => ({ ...prev, [batchId]: true }));
    };

    const closeTestModal = (batchId) => {
        setOpenModalFour((prev) => ({ ...prev, [batchId]: false }));
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
                        <span>Phone : {teacher.phone}</span>
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
                                                <h5 className="card-title">{batch.batchId}</h5>
                                                <div className="d-flex gap-3">
                                                    <button className="button" onClick={() => setShowModalOneFor(batchId)}>
                                                        Show all students
                                                    </button>
                                                    <ModalOne
                                                        isOpen={showModalOneFor === batchId}
                                                        onClose={() => setShowModalOneFor(null)}
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
                                                    </ModalOne>

                                                    <button className="button" onClick={() => openAttendanceModal(batchId)}>
                                                        Mark attendance
                                                    </button>
                                                    <ModalTwo
                                                        isOpen={openModalTwo[batchId]}
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
                                                    </ModalTwo>
                                                </div>

                                                <div className="d-flex mt-3 gap-3">
                                                    <button className="button" onClick={() => openTimetableModal(batch.batchId)}>
                                                        Show Timetable
                                                    </button>
                                                    <ModalThree
                                                        isOpen={openModalThree[batch.batchId]}
                                                        onClose={() => closeTimetableModal(batch.batchId)}
                                                    >
                                                        <div className="timetable-details">
                                                            <h3>Timetable for {batch.batchName}</h3>
                                                            {timetable[batch.batchId]?.length > 0 ? (
                                                                <table className="table table-bordered text-center mt-3">
                                                                    <thead className="table-dark">
                                                                        <tr>
                                                                            <th>Weekday</th>
                                                                            <th>Time Slots</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {timetable[batch.batchId].map((entry, index) => (
                                                                            <tr key={index}>
                                                                                <td>{entry.weekday}</td>
                                                                                <td>
                                                                                    {entry.classTimings.map((slot, idx) => (
                                                                                        <div key={idx}>
                                                                                            {slot.startTime} - {slot.endTime}
                                                                                        </div>
                                                                                    ))}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p>No timetable found for this batch.</p>
                                                            )}
                                                        </div>
                                                    </ModalThree>

                                                    <button className="button" onClick={() => openTestModal(batch.batchId)}>
                                                        Add Test
                                                    </button>
                                                    <ModalFour
                                                        isOpen={openModalFour[batch.batchId]}
                                                        onClose={() => closeTestModal(batch.batchId)}
                                                    >
                                                        <div>
                                                            <h3>Add Test for {batch.batchName}</h3>
                                                            <form
                                                                onSubmit={async (e) => {
                                                                    e.preventDefault();
                                                                    const { testName, maxMarks, testDate } = testDetails;
                                                                    if (!testName || !maxMarks || !testDate) {
                                                                        return alert("Please fill test name, max marks, and date.");
                                                                    }

                                                                    const date = new Date(testDate);
                                                                    for (const student of students[batch.batchId] || []) {
                                                                        const marksScored = testFormData[student._id];
                                                                        if (marksScored !== undefined && marksScored !== "") {
                                                                            await addTest(
                                                                                student._id,
                                                                                batch.batchId,
                                                                                testName,
                                                                                Number(maxMarks),
                                                                                Number(marksScored),
                                                                                date
                                                                            );
                                                                        }
                                                                    }

                                                                    setTestDetails({ testName: "", maxMarks: "", testDate: null });
                                                                    setTestFormData({});
                                                                    closeTestModal(batch.batchId);
                                                                }}
                                                            >
                                                                <div className="mb-2">
                                                                    <DatePicker
                                                                        selected={testDetails.testDate}
                                                                        onChange={(date) =>
                                                                            setTestDetails((prev) => ({ ...prev, testDate: date }))
                                                                        }
                                                                        className="form-control mb-2"
                                                                        dateFormat="yyyy-MM-dd"
                                                                        placeholderText="Select test date"
                                                                        required
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Test Name"
                                                                        value={testDetails.testName}
                                                                        onChange={(e) =>
                                                                            setTestDetails((prev) => ({ ...prev, testName: e.target.value }))
                                                                        }
                                                                        className="form-control mb-1"
                                                                        required
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Max Marks"
                                                                        value={testDetails.maxMarks}
                                                                        onChange={(e) =>
                                                                            setTestDetails((prev) => ({ ...prev, maxMarks: e.target.value }))
                                                                        }
                                                                        className="form-control mb-1"
                                                                        required
                                                                    />
                                                                </div>

                                                                <table className="table table-bordered">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Student Name</th>
                                                                            <th>Marks Scored</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {(students[batch.batchId] || []).map((student) => (
                                                                            <tr key={student._id}>
                                                                                <td>{student.name}</td>
                                                                                <td>
                                                                                    <input
                                                                                        type="number"
                                                                                        className="form-control"
                                                                                        value={testFormData[student._id] || ""}
                                                                                        onChange={(e) =>
                                                                                            setTestFormData((prev) => ({
                                                                                                ...prev,
                                                                                                [student._id]: e.target.value
                                                                                            }))
                                                                                        }
                                                                                        placeholder="Enter marks"
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>

                                                                <button type="submit" className="button">
                                                                    Add
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </ModalFour>

                                                    <button className="button" onClick={() => setShowModalFiveFor(batchId)}>
                                                        Show all Tests
                                                    </button>
                                                    <ModalFive
                                                        isOpen={showModalFiveFor === batchId}
                                                        onClose={() => setShowModalFiveFor(null)}
                                                    >
                                                        {students[batchId] && tests[batchId] ? (
                                                            tests[batchId].length === 0 ? (
                                                                <div className="p-4 text-center text-gray-600">No tests found for this batch.</div>
                                                            ) : (
                                                                <div className="overflow-x-auto">
                                                                    <h3>Showuing all Tests</h3>
                                                                    <table className="table table-bordered w-full">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Student Name</th>
                                                                                {tests[batchId].map((test) => (
                                                                                    <th key={test._id}>
                                                                                        {test.name} <br />
                                                                                        ({new Date(test.date).toLocaleDateString()})
                                                                                    </th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {students[batchId].map((student) => (
                                                                                <tr key={student._id}>
                                                                                    <td><b>{student.name}</b></td>
                                                                                    {tests[batchId].map((test) => (
                                                                                        <td key={test._id}>
                                                                                            {test.studentId === student._id
                                                                                                ? `${test.marksScored}/${test.maxMarks}`
                                                                                                : "-"}
                                                                                        </td>
                                                                                    ))}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="p-4 text-center">No records found</div>
                                                        )}
                                                    </ModalFive>
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
            </div>

            <Footer />
        </>
    );
}