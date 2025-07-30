import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import ModalFive from "../modals/ModalFive";
import "react-datepicker/dist/react-datepicker.css";
import '../css/teacher.css';


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
    const [testFormData, setTestFormData] = useState({});
    const [testDetails, setTestDetails] = useState({
        testName: "",
        maxMarks: "",
        testDate: null
    });
    const [attendanceMap, setAttendanceMap] = useState({});
    const [activeStudentAttendance, setActiveStudentAttendance] = useState(null);
    const [batchSearch, setBatchSearch] = useState("");
    const [todaysClasses, setTodaysClasses] = useState([]);

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const weekdayOrder = {
        "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4,
        "Friday": 5, "Saturday": 6, "Sunday": 7
    };

    const now = new Date();
    const jsMonth = now.getMonth();
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;
    const currentYear = now.getFullYear();
    const academicYearStart = jsMonth >= 3 ? currentYear : currentYear - 1;

    // --- All your useEffect and handler functions remain exactly the same ---
    useEffect(() => {
        const storedTeacher = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        console.log(token);

        if (storedTeacher && token && storedTeacher !== "undefined") {
            try {
                setTeacher(JSON.parse(storedTeacher));
            } catch (err) {
                console.error("Failed to parse teacher JSON:", err);
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
                .catch((err) => console.error("Schedule fetch error:", err));
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!batchesRecords || batchesRecords.length === 0 || !token) return;

        const fetchStudents = async (batchId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/batchStudents/${batchId}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching students");
                setStudents((prev) => ({ ...prev, [batchId]: data.students }));
            } catch (err) {
                console.error(`Error fetching students for batch ${batchId}:`, err);
            }
        };

        const fetchAllTests = async (batchId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/getTest/${batchId}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching tests");
                setTests((prev) => ({ ...prev, [batchId]: data.test }));
            } catch (err) {
                console.error(`Error fetching tests for batch ${batchId}:`, err);
            }
        };

        batchesRecords.forEach((batch) => {
            if (batch.batchId) {
                fetchStudents(batch.batchId);
                fetchAllTests(batch.batchId);
            }
        });
    }, [batchesRecords]);

    const fetchTimetable = async (batchId) => {
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/timetable/${batchId}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error fetching timetable");
            setTimetable((prev) => ({ ...prev, [batchId]: data.timetable || [] }));
        } catch (err) {
            console.error(`Error fetching timetable for batch ${batchId}:`, err);
        }
    };

    const markAttendance = async (studentId, batchId, status, date) => {
        if (!date) return alert("Please select a date first.");
        const token = localStorage.getItem("authToken");
        const dateOnly = new Date(date.toDateString());
        const dateISO = dateOnly.toISOString();

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/mark`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ studentId, batchId, date: dateISO, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to mark attendance");
            setMarkedStatus((prev) => ({ ...prev, [`${studentId}_${batchId}_${dateOnly.toDateString()}`]: status }));
        } catch (err) {
            console.error("Attendance error:", err);
            alert("Failed to mark attendance.");
        }
    };

    const addTest = async (studentId, batchId, name, maxMarks, marksScored, date) => {
        if (!studentId || !batchId || !name || !maxMarks || !marksScored || !date) {
            return alert("All fields are required.");
        }
        const token = localStorage.getItem("authToken");
        const dd = ("0" + date.getDate()).slice(-2);
        const mm = ("0" + (date.getMonth() + 1)).slice(-2);
        const yyyy = date.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/test/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ studentId, batchId, name, maxMarks, marksScored, date: formattedDate }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add test");
            setTests((prev) => ({
                ...prev,
                [batchId]: [...(prev[batchId] || []).filter(t => !(t.name === name && t.date === formattedDate && t.studentId === studentId)), { _id: data.test._id, studentId, batchId, name, maxMarks, marksScored, date: formattedDate }]
            }));
        } catch (err) {
            console.error("Test error:", err);
            alert("Failed to add test.");
        }
    };

    const showStudentAttendance = async (studentId, batchId) => {
        if (activeStudentAttendance === studentId) return;
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
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
            setAttendanceMap((prev) => ({ ...prev, ...newMap }));
        } catch (err) {
            console.error("Failed to fetch student attendance:", err);
            alert("Error fetching attendance");
        }
    };

    const openTimetableModal = (batchId) => { fetchTimetable(batchId); setOpenModalThree((prev) => ({ ...prev, [batchId]: true })); };
    const closeTimetableModal = (batchId) => setOpenModalThree((prev) => ({ ...prev, [batchId]: false }));
    const openAttendanceModal = (batchId) => setOpenModalTwo((prev) => ({ ...prev, [batchId]: true }));
    const closeAttendanceModal = (batchId) => setOpenModalTwo((prev) => ({ ...prev, [batchId]: false }));
    const openTestModal = (batchId) => setOpenModalFour((prev) => ({ ...prev, [batchId]: true }));
    const closeTestModal = (batchId) => setOpenModalFour((prev) => ({ ...prev, [batchId]: false }));

    if (!teacher) return <p>Loading teacher data...</p>;

    return (
        <>
            <Navbar />

            <div className="app-container">
                <div className="main-layout">
                    <div className="teacher-sidebar">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="profile-title">{teacher.name}</h2>
                        </div>

                        <div className="teacher-details-card">
                            <div className="container">
                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    <div className="detail-label">Email: {teacher.email}</div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="detail-label">Phone: {teacher.phone}</div>
                                </div>

                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 600 600">
                                        <path d="M27 182L55.5 343.7C69.5 423.2 131.8 485.5 211.3 499.5L224 501.7C207.5 473.1 196.9 441 193.4 407.2L169.3 411.5C159.6 413.2 150.5 405.7 152.4 396C157.2 371.3 171.5 349.4 192.1 335.1L192.1 260.5C190.7 261.3 189.1 261.8 187.4 262.1L124.4 273.2C115.7 274.7 107.1 268.8 108.5 260.1C111.6 240.5 126.9 224.1 147.6 220.4C164.8 217.4 181.5 223.9 192.2 236.2L192.2 213.5C192.2 191 199.1 161.1 224.5 140.1C250.5 118.6 292.2 96.2 349.4 85.9C318.9 69.6 263.1 53.9 185.6 67.5C105.3 81.7 57.6 117.6 35.5 143.6C26.5 154.1 24.7 168.5 27.1 182.1zM240 202.7L240 377.5C240 458.2 290.5 530.4 366.4 557.9L394.1 568C408.2 573.1 423.7 573.1 437.8 568L465.6 558C541.5 530.4 592 458.3 592 377.5L592 202.7C592 195.8 589.9 188.9 585 184.1C562.4 161.6 506.8 128.1 416 128.1C325.2 128.1 269.6 161.7 247 184.1C242.1 189 240 195.8 240 202.7zM306.1 389.8C304.7 382.8 313.1 378.8 318.8 383.2C345.7 403.8 379.4 416.1 416 416.1C452.6 416.1 486.2 403.8 513.2 383.2C518.9 378.8 527.3 382.8 525.9 389.8C515.8 441.2 470.4 480.1 416 480.1C361.6 480.1 316.2 441.3 306.1 389.8zM306.6 288.3C313.2 269.5 331 256 352 256C373 256 390.9 269.5 397.4 288.3C400.3 296.7 392.9 304 384 304L320 304C311.2 304 303.7 296.6 306.6 288.3zM512 304L448 304C439.2 304 431.7 296.6 434.6 288.3C441.1 269.5 459 256 480 256C501 256 518.9 269.5 525.4 288.3C528.3 296.7 520.9 304 512 304z" />
                                    </svg>
                                    <div className="detail-label">Role: {teacher.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="content-area">
                        <div className="schedule-card">
                            <h2 className="schedule-title">Today's Schedule</h2>
                            {todaysClasses.length === 0 ? (
                                <p>No classes scheduled for today.</p>
                            ) : (
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Batch</th>
                                            <th>Class</th>
                                            <th>Timings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todaysClasses.map((entry, index) => (
                                            <tr key={index}>
                                                <td>{entry.batch.name}</td>
                                                <td>{entry.batch.class}</td>
                                                <td>
                                                    {entry.classTimings.map((slot, i) => (
                                                        <div key={i}>{slot.startTime} - {slot.endTime}</div>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="batches-section">
                            <div className="batches-header">
                                <h2 className="batches-title">All Batches</h2>
                                <div className="search-container">
                                    <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="search"
                                        placeholder="Search batches with name..."
                                        className="search-input"
                                        onChange={(e) => setBatchSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="batches-grid">
                                {batchesRecords.length > 0 ? (
                                    batchesRecords
                                        .filter((b) => b.batchName.toLowerCase().includes(batchSearch.toLowerCase()))
                                        .map((batch) => {
                                            const batchId = batch.batchId;
                                            const selectedDate = selectedDates[batchId] || new Date();

                                            return (
                                                <div className="batch-card">
                                                    <div className="batch-header">
                                                        <h5 className="batch-name">{batch.batchName}</h5>
                                                    </div>

                                                    <div className="batch-actions">
                                                        <button className="action-button-t students" onClick={() => setShowModalOneFor(batchId)}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                                            </svg>
                                                            Show Students
                                                        </button>

                                                        <button className="action-button-t attendance" onClick={() => openAttendanceModal(batchId)}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1h-3v2a1 1 0 01-1-1H9a1 1 0 01-1-1v-2H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                                                            </svg>
                                                            Mark Attendance
                                                        </button>
                                                    </div>

                                                    <div className="batch-actions">
                                                        <button className="action-button-t timetable" onClick={() => openTimetableModal(batchId)}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                                                            </svg>
                                                            Show Timetable
                                                        </button>
                                                    </div>

                                                    <div className="batch-actions">
                                                        <button className="action-button-t add-test" onClick={() => openTestModal(batchId)}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                            Add Test
                                                        </button>

                                                        <button className="action-button-t show-tests" onClick={() => setShowModalFiveFor(batchId)}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            Show Tests
                                                        </button>
                                                    </div>

                                                    {/* ====== MODALS WITH THEIR CONTENT RESTORED ====== */}
                                                    <ModalOne isOpen={showModalOneFor === batchId} onClose={() => setShowModalOneFor(null)}>
                                                        <div>
                                                            <h3>{batch.batchName}</h3>
                                                            <ul className="mt-2">
                                                                {students[batchId]?.map((student) => (
                                                                    <li key={student._id} className="mb-3">
                                                                        <div className="d-flex flex-wrap gap-2 align-items-center">
                                                                            <span>{student.name}</span>
                                                                            <button
                                                                                className="btn btn-sm btn-info"
                                                                                onClick={() => {
                                                                                    if (activeStudentAttendance === student._id) {
                                                                                        setActiveStudentAttendance(null);
                                                                                    } else {
                                                                                        setActiveStudentAttendance(student._id);
                                                                                        showStudentAttendance(student._id, batchId);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {activeStudentAttendance === student._id ? "Hide Attendance" : "Show Attendance"}
                                                                            </button>
                                                                        </div>

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
                                                                                                <div className={`carousel-item ${monthIdx === activeMonthIndex ? "active" : ""}`} key={month}>
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
                                                                                                                    className={`date-box ${status === "present" ? "present" : status === "absent" ? "absent" : ""}`}
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
                                                                                    <div className="calendar-controls d-flex justify-content-between mt-2">
                                                                                        <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-target={`#carousel-${student._id}`} data-bs-slide="prev">‹ Prev</button>
                                                                                        <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-target={`#carousel-${student._id}`} data-bs-slide="next">Next ›</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </ModalOne>

                                                    <ModalTwo isOpen={openModalTwo[batchId]} onClose={() => closeAttendanceModal(batchId)}>
                                                        <div>
                                                            <h3>Mark Attendance for {batch.batchName}</h3>
                                                            <DatePicker
                                                                className="datePicker"
                                                                dateFormat="yyyy-MM-dd"
                                                                selected={selectedDate}
                                                                onChange={(date) => setSelectedDates((prev) => ({ ...prev, [batchId]: date }))}
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
                                                                                        onClick={() => markAttendance(student._id, batchId, "present", selectedDate)}
                                                                                    >Present</button>
                                                                                    <button
                                                                                        className={`btn btn-danger btn-sm ${markedStatus[`${student._id}_${batchId}_${selectedDate.toDateString()}`] === "absent" ? "active" : ""}`}
                                                                                        onClick={() => markAttendance(student._id, batchId, "absent", selectedDate)}
                                                                                    >Absent</button>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr><td colSpan="2">Loading or no students found.</td></tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </ModalTwo>

                                                    <ModalThree isOpen={openModalThree[batchId]} onClose={() => closeTimetableModal(batchId)}>
                                                        <div className="timetable-details">
                                                            <h3>Timetable for {batch.batchName}</h3>
                                                            {timetable[batchId]?.length > 0 ? (
                                                                <table className="table table-bordered text-center mt-3">
                                                                    <thead className="table-dark">
                                                                        <tr>
                                                                            <th>Weekday</th>
                                                                            <th>Time Slots</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {timetable[batchId]
                                                                            .sort((a, b) => weekdayOrder[a.weekday] - weekdayOrder[b.weekday])
                                                                            .map((entry, index) => (
                                                                                <tr key={index}>
                                                                                    <td>{entry.weekday}</td>
                                                                                    <td>
                                                                                        {entry.classTimings.map((slot, idx) => (
                                                                                            <div key={idx}>{slot.startTime} - {slot.endTime}</div>
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

                                                    <ModalFour isOpen={openModalFour[batchId]} onClose={() => closeTestModal(batchId)}>
                                                        <div>
                                                            <h3>Add Test for {batch.batchName}</h3>
                                                            <form onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                const { testName, maxMarks, testDate } = testDetails;
                                                                if (!testName || !maxMarks || !testDate) { return alert("Please fill test name, max marks, and date."); }
                                                                const date = new Date(testDate);
                                                                for (const student of students[batch.batchId] || []) {
                                                                    const marksScored = testFormData[student._id];
                                                                    if (marksScored !== undefined && marksScored !== "") {
                                                                        await addTest(student._id, batch.batchId, testName, Number(maxMarks), Number(marksScored), date);
                                                                    }
                                                                }
                                                                setTestDetails({ testName: "", maxMarks: "", testDate: null });
                                                                setTestFormData({});
                                                                closeTestModal(batch.batchId);
                                                            }}>
                                                                <div className="mb-2">
                                                                    <DatePicker selected={testDetails.testDate} onChange={(date) => setTestDetails((prev) => ({ ...prev, testDate: date }))} className="form-control mb-2" dateFormat="yyyy-MM-dd" placeholderText="Select test date" required />
                                                                    <input type="text" placeholder="Test Name" value={testDetails.testName} onChange={(e) => setTestDetails((prev) => ({ ...prev, testName: e.target.value }))} className="form-control mb-1" required />
                                                                    <input type="number" placeholder="Max Marks" value={testDetails.maxMarks} onChange={(e) => setTestDetails((prev) => ({ ...prev, maxMarks: e.target.value }))} className="form-control mb-1" required />
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
                                                                                    <input type="number" className="form-control" value={testFormData[student._id] || ""} onChange={(e) => setTestFormData((prev) => ({ ...prev, [student._id]: e.target.value }))} placeholder="Enter marks" />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                <button type="submit" className="btn btn-primary">Add Test</button>
                                                            </form>
                                                        </div>
                                                    </ModalFour>

                                                    <ModalFive isOpen={showModalFiveFor === batchId} onClose={() => setShowModalFiveFor(null)}>
                                                        {students[batchId] && tests[batchId] ? (
                                                            tests[batchId].length === 0 ? (
                                                                <div className="p-4 text-center text-gray-600">No tests found for this batch.</div>
                                                            ) : (
                                                                (() => {
                                                                    const uniqueTests = Array.from(new Map(tests[batchId].map(test => [`${test.name}_${test.date}`, test])).values());
                                                                    return (
                                                                        <div className="overflow-x-auto">
                                                                            <h3>Showing All Tests for {batch.batchName}</h3>
                                                                            <table className="table table-bordered w-full">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Student Name</th>
                                                                                        {uniqueTests.map((test) => (
                                                                                            <th key={`${test.name}_${test.date}`}>{test.name} <br /> ({test.date})</th>
                                                                                        ))}
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {students[batchId].map((student) => (
                                                                                        <tr key={student._id}>
                                                                                            <td><b>{student.name}</b></td>
                                                                                            {uniqueTests.map((test) => {
                                                                                                const match = tests[batchId].find(t => t.name === test.name && t.date === test.date && t.studentId === student._id);
                                                                                                return (
                                                                                                    <td key={`${test.name}_${test.date}_${student._id}`}>{match ? `${match.marksScored}/${match.maxMarks}` : "-"}</td>
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

                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="no-batches">
                                        <p>No batches assigned.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}