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
    const [batchSearch, setBatchSearch] = useState("");
    const [todaysClasses, setTodaysClasses] = useState([]);


    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const weekdayOrder = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7
    };

    const now = new Date();
    const jsMonth = now.getMonth();
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;
    const currentYear = now.getFullYear();
    const academicYearStart = jsMonth >= 3 ? currentYear : currentYear - 1;

    useEffect(() => {
        const storedTeacher = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        console.log(token);

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

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/today/timetable`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch schedule");
                    return res.json();
                })
                .then((data) => setTodaysClasses(Array.isArray(data.classes) ? data.classes : []))
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

        // ✅ Format date to dd-mm-yyyy
        const dd = ("0" + date.getDate()).slice(-2);
        const mm = ("0" + (date.getMonth() + 1)).slice(-2);
        const yyyy = date.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;

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
                    date: formattedDate // ✅ dd-mm-yyyy
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add test");

            setTests((prev) => ({
                ...prev,
                [batchId]: [
                    ...(prev[batchId] || []).filter(
                        t => !(t.name === name && t.date === formattedDate && t.studentId === studentId)
                    ), // remove old entry if exists
                    {
                        _id: data.test._id, // if returned by backend
                        studentId,
                        batchId,
                        name,
                        maxMarks,
                        marksScored,
                        date: formattedDate
                    }
                ]
            }));
        } catch (err) {
            console.error("Test error:", err);
            alert("Failed to add test.");
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
                <div className="student-details container card mb-5 p-3">
                    <h1>Teacher details</h1>
                    <div className="container">
                        <span>Name : <strong>{teacher.name}</strong></span>
                        <br />
                        <span>Email : <strong>{teacher.email}</strong></span>
                        <br />
                        <span>Phone : <strong>{teacher.phone}</strong></span>
                        <br />
                        <span>Role : <strong>{teacher.role}</strong></span>
                    </div>
                </div>

                <div className="batches-container">
                    <div className="container">
                        <h2>Today's Schedule</h2>

                        {todaysClasses.length === 0 ? (
                            <p>No classes scheduled today.</p>
                        ) : (
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Batch</th>
                                        <th>Code</th>
                                        <th>Timings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todaysClasses.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{entry.batch.name}</td>
                                            <td>{entry.batch.code}</td>
                                            <td>
                                                {entry.classTimings.map((slot, i) => (
                                                    <div key={i}>
                                                        {slot.startTime} - {slot.endTime}
                                                    </div>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                    </div>
                </div>

                <div className="batches-container">
                    <div className="container d-flex justify-content-between align-items-center mb-3">
                        <h2>Batches</h2>
                        <input
                            type="search"
                            placeholder="Search batches with name..."
                            className="form-control w-50"
                            onChange={(e) => setBatchSearch(e.target.value)}
                        />
                    </div>
                    <div className="container">
                        <div className="row">
                            {batchesRecords.length > 0 ? (
                                batchesRecords
                                    .filter((b) =>
                                        b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
                                    )
                                    .map((batch, index) => {
                                        const batchId = batch.batchId;
                                        const selectedDate = selectedDates[batchId] || new Date();

                                        return (
                                            <div className="col-12 col-sm-6 col-lg-4" key={index}>
                                                <div className="card batch-card mb-3">

                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <h5 className="card-title mt-1">{batch.batchName}</h5>
                                                        <div className="dropdown ms-auto">
                                                            <button
                                                                className="btn btn-sm"
                                                                type="button"
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                            >
                                                                <h5>⋮</h5>
                                                            </button>
                                                            <ul className="dropdown-menu dropdown-menu-end shadow">
                                                                <li>
                                                                    <button className="dropdown-item" onClick={() => setShowModalOneFor(batchId)}>
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
                                                                </li>

                                                                <li><button className="dropdown-item" onClick={() => openAttendanceModal(batchId)}>
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
                                                                </li>

                                                                <li><button className="dropdown-item" onClick={() => openTimetableModal(batch.batchId)}>
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
                                                                                        {timetable[batch.batchId]
                                                                                            .sort((a, b) => weekdayOrder[a.weekday] - weekdayOrder[b.weekday])
                                                                                            .map((entry, index) => (
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
                                                                </li>

                                                                <li><button className="dropdown-item" onClick={() => openTestModal(batch.batchId)}>
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
                                                                </li>

                                                                <li><button className="dropdown-item" onClick={() => setShowModalFiveFor(batchId)}>
                                                                    Show all Tests
                                                                </button>
                                                                    <ModalFive
                                                                        isOpen={showModalFiveFor === batchId}
                                                                        onClose={() => setShowModalFiveFor(null)}
                                                                    >
                                                                        {students[batchId] && tests[batchId] ? (
                                                                            tests[batchId].length === 0 ? (
                                                                                <div className="p-4 text-center text-gray-600">
                                                                                    No tests found for this batch.
                                                                                </div>
                                                                            ) : (
                                                                                // ✅ Add this here:
                                                                                (() => {
                                                                                    const uniqueTests = Array.from(
                                                                                        new Map(
                                                                                            tests[batchId].map(test => [`${test.name}_${test.date}`, test])
                                                                                        ).values()
                                                                                    );

                                                                                    return (
                                                                                        <div className="overflow-x-auto">
                                                                                            <h3>Showing All Tests</h3>
                                                                                            <table className="table table-bordered w-full">
                                                                                                <thead>
                                                                                                    <tr>
                                                                                                        <th>Student Name</th>
                                                                                                        {uniqueTests.map((test) => (
                                                                                                            <th key={`${test.name}_${test.date}`}>
                                                                                                                {test.name} <br /> ({test.date})
                                                                                                            </th>
                                                                                                        ))}
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {students[batchId].map((student) => (
                                                                                                        <tr key={student._id}>
                                                                                                            <td><b>{student.name}</b></td>
                                                                                                            {uniqueTests.map((test) => {
                                                                                                                const match = tests[batchId].find(
                                                                                                                    t =>
                                                                                                                        t.name === test.name &&
                                                                                                                        t.date === test.date &&
                                                                                                                        t.studentId === student._id
                                                                                                                );
                                                                                                                return (
                                                                                                                    <td key={`${test.name}_${test.date}_${student._id}`}>
                                                                                                                        {match ? `${match.marksScored}/${match.maxMarks}` : "-"}
                                                                                                                    </td>
                                                                                                                );
                                                                                                            })}
                                                                                                        </tr>
                                                                                                    ))}
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    );
                                                                                })()
                                                                            )
                                                                        ) : (
                                                                            <div className="p-4 text-center">No records found</div>
                                                                        )}
                                                                    </ModalFive>
                                                                </li>
                                                            </ul>
                                                        </div>
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