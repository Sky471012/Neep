import { apiFetch } from "../api";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import ModalFive from "../modals/ModalFive";
import ModalSix from "../modals/ModalSix";
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
    const [showModalSix, setShowModalSix] = useState(null);
    const [selectedDates, setSelectedDates] = useState({});
    const [markedStatus, setMarkedStatus] = useState({});
    const [testFormData, setTestFormData] = useState({});
    const [testDetails, setTestDetails] = useState({
        testName: "",
        maxMarks: "",
        testDate: null
    });
    const [isAddingTests, setIsAddingTests] = useState(false);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [attendanceMap1, setAttendanceMap1] = useState({});
    const [activeStudentAttendance, setActiveStudentAttendance] = useState(null);
    const [batchSearch, setBatchSearch] = useState("");
    const [todaysClasses, setTodaysClasses] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [attendanceDraft, setAttendanceDraft] = useState({});
    const [attendanceExists, setAttendanceExists] = useState({});
    const [editingMarks, setEditingMarks] = useState({});
    const [isEditingTestGroup, setIsEditingTestGroup] = useState(false);
    const [testGroupEditForm, setTestGroupEditForm] = useState({
        name: "",
        date: null,
        maxMarks: "",
    });
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [testSearchQuery, setTestSearchQuery] = useState("");
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

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

    // Parse date strings used in tests. Accepts dd-MM-yyyy or ISO-like strings.
    // Returns milliseconds since epoch, or Infinity when invalid/missing so they sort last.
    function parseDateToTime(dateStr) {
        if (!dateStr) return Infinity;
        const ddmmyyyy = /^([0-3]?\d)-([0-1]?\d)-(\d{4})$/;
        const m = String(dateStr).trim().match(ddmmyyyy);
        if (m) {
            const dd = Number(m[1]);
            const mm = Number(m[2]);
            const yyyy = Number(m[3]);
            const dt = new Date(yyyy, mm - 1, dd);
            return isNaN(dt.getTime()) ? Infinity : dt.getTime();
        }
        const parsed = Date.parse(dateStr);
        return isNaN(parsed) ? Infinity : parsed;
    }

    // --- All your useEffect and handler functions remain exactly the same ---
    useEffect(() => {
        const storedTeacher = localStorage.getItem("user");

        if (storedTeacher && storedTeacher !== "undefined") {
            try {
                setTeacher(JSON.parse(storedTeacher));
            } catch (err) {
                console.error("Failed to parse teacher JSON:", err);
                setLoading(false);
                return;
            }

            Promise.all([
                apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/batches`, {
                    headers: {},
                })
                    .then((res) => {
                        if (!res.ok) throw new Error("Failed to fetch batches");
                        return res.json();
                    })
                    .then(setBatchesRecords)
                    .catch((err) => console.error("Batches fetch error:", err)),

                apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/today/timetable`, {
                    headers: {},
                })
                    .then((res) => {
                        if (!res.ok) throw new Error("Failed to fetch schedule");
                        return res.json();
                    })
                    .then((data) => setTodaysClasses(Array.isArray(data.classes) ? data.classes : []))
                    .catch((err) => console.error("Schedule fetch error:", err)),

                apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance`, {
                    headers: {}
                })
                    .then(res => res.json())
                    .then(data => {
                        setAttendanceRecords(data);
                        const newMap = {};
                        data.forEach((record) => {
                            const date = new Date(record.date);
                            const formattedDate = date.toISOString().split('T')[0];
                            const key = `${record.batchId}_${formattedDate}`;
                            newMap[key] = record.status;
                        });
                        setAttendanceMap1(newMap);
                    })
                    .catch(err => console.error("Attendance fetch error:", err)),
            ]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!batchesRecords || batchesRecords.length === 0) return;

        const fetchStudents = async (batchId) => {
            try {
                const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/batchStudents/${batchId}`, { headers: {} });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching students");
                setStudents((prev) => ({ ...prev, [batchId]: data.students }));
            } catch (err) {
                console.error(`Error fetching students for batch ${batchId}:`, err);
            }
        };

        const fetchAllTests = async (batchId) => {
            try {
                const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/getTest/${batchId}`, { headers: {} });
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
        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/timetable/${batchId}`, { headers: {} });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error fetching timetable");
            setTimetable((prev) => ({ ...prev, [batchId]: data.timetable || [] }));
        } catch (err) {
            console.error(`Error fetching timetable for batch ${batchId}:`, err);
        }
    };

    const setDraftStatus = (batchId, studentId, status) => {
        setAttendanceDraft(prev => {
            const next = { ...prev };
            const batchDraft = { ...(next[batchId] || {}) };
            if (status === 'present' || status === 'absent') {
                batchDraft[studentId] = status;
            } else {
                delete batchDraft[studentId]; // not used by UI now, harmless fallback
            }
            next[batchId] = batchDraft;
            return next;
        });
    };


    const saveAttendanceForBatch = async (batchId, dateObj) => {
        if (!dateObj) {
            alert("Please select a date first.");
            return;
        }

        const list = students[batchId] || [];
        if (list.length === 0) {
            alert("No students found for this batch.");
            return;
        }
        const dateOnly = new Date(dateObj.toDateString());
        const dateISO = dateOnly.toISOString();

        const draft = attendanceDraft[batchId] || {};

        // Build final status for EVERY student (default present)
        const finalEntries = list.map(s => {
            const status = draft[s._id] ?? "present";
            return [s._id, status];
        });

        try {
            await Promise.all(finalEntries.map(async ([studentId, status]) => {
                const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/mark`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ studentId, batchId, date: dateISO, status }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

                // reflect as "marked" in local UI
                setMarkedStatus(prev => ({
                    ...prev,
                    [`${studentId}_${batchId}_${dateOnly.toDateString()}`]: status,
                }));
            }));

            // keep draft (optional) or clear; we’ll clear to avoid stale overrides
            setAttendanceDraft(prev => {
                const copy = { ...prev };
                delete copy[batchId];
                return copy;
            });
            closeAttendanceModal(batchId);

        } catch (err) {
            console.error("Bulk attendance error:", err);
            alert("Failed to mark some or all attendance.");
        }
    };

    const addTest = async (studentId, batchId, name, maxMarks, marksScored, date) => {
        const dd = ("0" + date.getDate()).slice(-2);
        const mm = ("0" + (date.getMonth() + 1)).slice(-2);
        const yyyy = date.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/test/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
        setAttendanceMap({});
        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/${studentId}`, { headers: {} });
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
            setAttendanceMap(newMap);
        } catch (err) {
            console.error("Failed to fetch student attendance:", err);
            alert("Error fetching attendance");
        }
    };

    const preloadAttendanceForBatchDate = async (batchId, dateObj) => {
        const list = students[batchId] || [];
        if (list.length === 0 || !dateObj) return;

        const dateOnly = new Date(dateObj.toDateString());

        try {
            const results = await Promise.all(
                list.map(async (s) => {
                    const res = await apiFetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/${s._id}`,
                        { headers: {} }
                    );
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

                    const rec = (data.attendance || []).find((r) => {
                        const rd = new Date(r.date);
                        return (
                            r.batchId === batchId &&
                            rd.getFullYear() === dateOnly.getFullYear() &&
                            rd.getMonth() === dateOnly.getMonth() &&
                            rd.getDate() === dateOnly.getDate()
                        );
                    });

                    // status can be "present" | "absent" | undefined
                    return [s._id, rec?.status];
                })
            );

            setAttendanceDraft((prev) => {
                const next = { ...prev };
                const batchDraft = {};
                for (const [sid, status] of results) {
                    if (status === "present" || status === "absent") {
                        // set exactly what's saved; if undefined we'll default to "present" in UI
                        batchDraft[sid] = status;
                    }
                }
                next[batchId] = batchDraft;
                return next;
            });

            // Track whether any saved record exists for this date (to enable removal)
            const exists = results.some(([, status]) => status === "present" || status === "absent");
            setAttendanceExists((prev) => ({ ...prev, [batchId]: exists }));
        } catch (err) {
            console.error("Preload attendance error:", err);
        }
    };

    const removeAttendanceForBatch = async (batchId, dateObj) => {
        if (!dateObj) {
            alert("Please select a date first.");
            return;
        }
        if (!window.confirm("Remove attendance for all students on this date?")) return;
        const dateOnly = new Date(dateObj.toDateString());
        const dateISO = dateOnly.toISOString();

        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/attendance/remove`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batchId, date: dateISO }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to remove attendance");

            setAttendanceDraft((prev) => {
                const copy = { ...prev };
                delete copy[batchId];
                return copy;
            });
            setAttendanceExists((prev) => ({ ...prev, [batchId]: false }));
            closeAttendanceModal(batchId);
        } catch (err) {
            console.error("Remove attendance error:", err);
            alert("Failed to remove attendance.");
        }
    };

    const openAttendanceModal = (batchId) => {
        const date = selectedDates[batchId] || new Date(); // default to today if not chosen
        setOpenModalTwo((prev) => ({ ...prev, [batchId]: true }));
        setSelectedDates((prev) => ({ ...prev, [batchId]: date }));
        preloadAttendanceForBatchDate(batchId, date);
    };

    const startEditMarks = (testId, currentValue) => {
        setEditingMarks(prev => ({ ...prev, [testId]: { value: currentValue ?? "" } }));
    };

    const cancelEditMarks = (testId) => {
        setEditingMarks(prev => {
            const copy = { ...prev };
            delete copy[testId];
            return copy;
        });
    };

    const saveEditMarks = async (batchId, testObj) => {
        const draft = editingMarks[testObj._id];
        if (!draft) return;

        // IMPORTANT: send empty string to mark absent on backend
        const payload = { marksScored: draft.value === "" ? "" : draft.value };

        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/editMarks/${testObj._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update marks");

            // Update the UI list you keep for tests[batchId]
            setTests(prev => {
                const list = prev[batchId] || [];
                const updated = list.map(t => (t._id === testObj._id ? { ...t, ...data.test } : t));
                return { ...prev, [batchId]: updated };
            });

            cancelEditMarks(testObj._id);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to update marks");
        }
    };

    const handleDeleteTestGroup = async (batchId, test) => {
        if (!window.confirm(`Are you sure you want to delete the test "${test.name}" dated ${test.date} for the whole batch? This cannot be undone.`)) return;
        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/deleteTest`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchId, name: test.name, date: test.date }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete test');

            // remove all test entries matching this name+date from local state for this batch
            setTests(prev => {
                const list = prev[batchId] || [];
                const filtered = list.filter(t => !(t.name === test.name && t.date === test.date));
                return { ...prev, [batchId]: filtered };
            });

            setSelectedTest(null);
            cancelEditTestGroup();
        } catch (err) {
            console.error('Delete test group error:', err);
            alert(err.message || 'Failed to delete test');
        }
    };

    const startEditTestGroup = (test) => {
        setTestGroupEditForm({
            name: test.name || "",
            date: test.date ? new Date(test.date.split('-').reverse().join('-')) : null,
            maxMarks: test.maxMarks !== undefined && test.maxMarks !== null ? String(test.maxMarks) : "",
        });
        setIsEditingTestGroup(true);
    };

    const cancelEditTestGroup = () => {
        setIsEditingTestGroup(false);
        setTestGroupEditForm({
            name: "",
            date: null,
            maxMarks: "",
        });
    };

    const saveEditTestGroup = async (batchId, currentTest) => {
        const trimmedName = testGroupEditForm.name.trim();

        if (!trimmedName || !testGroupEditForm.date || testGroupEditForm.maxMarks === "") {
            alert("All test fields are required");
            return;
        }

        const formattedDate = new Date(testGroupEditForm.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).replace(/\//g, "-");

        const numericMaxMarks = Number(testGroupEditForm.maxMarks);

        if (Number.isNaN(numericMaxMarks) || numericMaxMarks <= 0) {
            alert("Max marks must be a positive number");
            return;
        }

        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/editTestGroup/${batchId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldName: currentTest.name,
                    oldDate: currentTest.date,
                    name: trimmedName,
                    date: formattedDate,
                    maxMarks: numericMaxMarks,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update test group");

            setTests(prev => {
                const list = prev[batchId] || [];
                const updated = list.map((t) => {
                    if (t.name === currentTest.name && t.date === currentTest.date) {
                        return { ...t, name: trimmedName, date: formattedDate, maxMarks: numericMaxMarks };
                    }
                    return t;
                });
                return { ...prev, [batchId]: updated };
            });

            setSelectedTest({
                ...currentTest,
                name: trimmedName,
                date: formattedDate,
                maxMarks: numericMaxMarks,
            });
            cancelEditTestGroup();
        } catch (err) {
            console.error("Edit test group error:", err);
            alert(err.message || "Failed to update test group.");
        }
    };

    const openTimetableModal = (batchId) => { fetchTimetable(batchId); setOpenModalThree((prev) => ({ ...prev, [batchId]: true })); };
    const closeTimetableModal = (batchId) => setOpenModalThree((prev) => ({ ...prev, [batchId]: false }));
    const closeAttendanceModal = (batchId) => setOpenModalTwo((prev) => ({ ...prev, [batchId]: false }));
    const openTestModal = (batchId) => setOpenModalFour((prev) => ({ ...prev, [batchId]: true }));
    const closeTestModal = (batchId) => setOpenModalFour((prev) => ({ ...prev, [batchId]: false }));

    if (loading || !teacher) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading teacher data...</p></div></div>);

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

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                    </svg>
                                    <div className="detail-label">DOB: {teacher.dob || "NA"}</div>
                                </div>
                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="detail-label">Address: {teacher.address || "NA"}</div>
                                </div>
                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M271.2 56C265.1 49.8 256.2 47.3 247.8 49.6C239.4 51.9 232.9 58.4 230.8 66.8L215.5 127C214.4 131.4 209.9 134 205.6 132.7L145.8 115.9C137.4 113.5 128.4 115.9 122.3 122C116.2 128.1 113.8 137.1 116.2 145.5L133.1 205.3C134.3 209.6 131.7 214.1 127.4 215.2L67.1 230.5C58.7 232.6 52.1 239.2 49.8 247.6C47.5 256 50 264.9 56.2 271L100.7 314.3C103.9 317.4 103.9 322.6 100.7 325.8L56.3 369.1C50.1 375.2 47.6 384.1 49.9 392.5C52.2 400.9 58.8 407.4 67.2 409.6L127.4 424.9C131.8 426 134.4 430.5 133.1 434.8L116.2 494.5C113.8 502.9 116.2 511.9 122.3 518C128.4 524.1 137.4 526.5 145.8 524.1L205.6 507.2C209.9 506 214.4 508.6 215.5 512.9L230.8 573.1C232.9 581.5 239.5 588.1 247.9 590.4C256.3 592.7 265.2 590.2 271.3 584L314.6 539.5C317.7 536.3 322.9 536.3 326.1 539.5L369.3 584C375.4 590.2 384.3 592.7 392.7 590.4C401.1 588.1 407.6 581.5 409.8 573.1L425.1 513C426.2 508.6 430.7 506 435 507.3L494.8 524.2C503.2 526.6 512.2 524.2 518.3 518.1C524.4 512 526.8 503 524.4 494.6L507.5 434.8C506.3 430.5 508.9 426 513.2 424.9L573.4 409.6C581.8 407.5 588.4 400.9 590.7 392.5C593 384.1 590.5 375.1 584.3 369.1L539.8 325.8C536.6 322.7 536.6 317.5 539.8 314.3L584.3 271C590.5 264.9 593 256 590.7 247.6C588.4 239.2 581.8 232.7 573.4 230.5L513.2 215.2C508.8 214.1 506.2 209.6 507.5 205.3L524.4 145.5C526.8 137.1 524.4 128.1 518.3 122C512.2 115.9 503.2 113.5 494.8 115.9L435 132.8C430.7 134 426.2 131.4 425.1 127.1L409.8 66.8C407.7 58.4 401.1 51.8 392.7 49.5C384.3 47.2 375.4 49.7 369.3 55.9L326 100.5C322.9 103.7 317.7 103.7 314.5 100.5L271.2 56z" /></svg>
                                    <div className="detail-label">Qualifications: {teacher.qualification || "NA"}</div>
                                </div>
                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M32 160C32 124.7 60.7 96 96 96L544 96C579.3 96 608 124.7 608 160L32 160zM32 208L608 208L608 480C608 515.3 579.3 544 544 544L96 544C60.7 544 32 515.3 32 480L32 208zM279.3 480C299.5 480 314.6 460.6 301.7 445C287 427.3 264.8 416 240 416L176 416C151.2 416 129 427.3 114.3 445C101.4 460.6 116.5 480 136.7 480L279.2 480zM208 376C238.9 376 264 350.9 264 320C264 289.1 238.9 264 208 264C177.1 264 152 289.1 152 320C152 350.9 177.1 376 208 376zM392 272C378.7 272 368 282.7 368 296C368 309.3 378.7 320 392 320L504 320C517.3 320 528 309.3 528 296C528 282.7 517.3 272 504 272L392 272zM392 368C378.7 368 368 378.7 368 392C368 405.3 378.7 416 392 416L504 416C517.3 416 528 405.3 528 392C528 378.7 517.3 368 504 368L392 368z" /></svg>
                                    <div className="detail-label">Aadhar: {teacher.aadhar || "NA"}</div>
                                </div>
                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M341.9 38.1C328.5 29.9 311.6 29.9 298.2 38.1C273.8 53 258.7 57 230.1 56.4C214.4 56 199.8 64.5 192.2 78.3C178.5 103.4 167.4 114.5 142.3 128.2C128.5 135.7 120.1 150.4 120.4 166.1C121.1 194.7 117 209.8 102.1 234.2C93.9 247.6 93.9 264.5 102.1 277.9C117 302.3 121 317.4 120.4 346C120 361.7 128.5 376.3 142.3 383.9C164.4 396 175.6 406 187.4 425.4L138.7 522.5C132.8 534.4 137.6 548.8 149.4 554.7L235.4 597.7C246.9 603.4 260.9 599.1 267.1 587.9L319.9 492.8L372.7 587.9C378.9 599.1 392.9 603.5 404.4 597.7L490.4 554.7C502.3 548.8 507.1 534.4 501.1 522.5L452.5 425.3C464.2 405.9 475.5 395.9 497.6 383.8C511.4 376.3 519.8 361.6 519.5 345.9C518.8 317.3 522.9 302.2 537.8 277.8C546 264.4 546 247.5 537.8 234.1C522.9 209.7 518.9 194.6 519.5 166C519.9 150.3 511.4 135.7 497.6 128.1C472.5 114.4 461.4 103.3 447.7 78.2C440.2 64.4 425.5 56 409.8 56.3C381.2 57 366.1 52.9 341.7 38zM320 160C373 160 416 203 416 256C416 309 373 352 320 352C267 352 224 309 224 256C224 203 267 160 320 160z" /></svg>
                                    <div className="detail-label">Experience (yrs): {teacher.experience ? `${teacher.experience}+` : "NA"}</div>
                                </div>
                            </div>
                        </div>
                        {teacher.role == 'Admin' &&
                            <Link className="fee-button" to="/admin" style={{ textAlign: "center" }}>
                                <i className="bi bi-controller me-1"></i>Control Room
                            </Link>
                        }
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
                                            <th style={{ padding: "10px 20px" }}>Batch</th>
                                            <th style={{ padding: "10px 20px" }}>Class</th>
                                            <th style={{ padding: "10px 20px" }}>Timings</th>
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
                                                        <div className="batch-avatar">
                                                            {(batch.batchName?.trim()?.charAt(0) || "?").toUpperCase()}
                                                        </div>
                                                        <div className="batch-name-block">
                                                            <span className="batch-eyebrow">Batch</span>
                                                            <h5 className="batch-name">{batch.batchName}</h5>
                                                        </div>
                                                    </div>

                                                    <div className="batch-actions">
                                                        <button className="action-button-t students" onClick={() => setShowModalOneFor(batchId)}>
                                                            <span className="tile-icon">
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H2v-2a4 4 0 0 1 3-3.87m12-3.13a4 4 0 1 0-5-5m-5 5a4 4 0 1 0-5-5m5 5a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" />
                                                                </svg>
                                                            </span>
                                                            <span className="tile-label">Students</span>
                                                        </button>

                                                        <button className="action-button-t attendance" onClick={() => openAttendanceModal(batchId)}>
                                                            <span className="tile-icon">
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-5 8 2 2 4-4" />
                                                                </svg>
                                                            </span>
                                                            <span className="tile-label">Mark</span>
                                                        </button>

                                                        <button className="action-button-t timetable" onClick={() => openTimetableModal(batchId)}>
                                                            <span className="tile-icon">
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                                                </svg>
                                                            </span>
                                                            <span className="tile-label">Timetable</span>
                                                        </button>

                                                        <button className="action-button-t add-test" onClick={() => openTestModal(batchId)}>
                                                            <span className="tile-icon">
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </span>
                                                            <span className="tile-label">Add Test</span>
                                                        </button>

                                                        <button className="action-button-t show-tests" onClick={() => setShowModalFiveFor(batchId)}>
                                                            <span className="tile-icon">
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                                                                </svg>
                                                            </span>
                                                            <span className="tile-label">Tests</span>
                                                        </button>

                                                        <button className="action-button-t my-attendance" onClick={() => setShowModalSix(batch.batchId)} title="View my attendance">
                                                            <span className="tile-icon">
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                                                </svg>
                                                            </span>
                                                            <span className="tile-label">My Attendance</span>
                                                        </button>
                                                    </div>

                                                    {/* ====== MODALS WITH THEIR CONTENT RESTORED ====== */}
                                                    <ModalOne
                                                        isOpen={showModalOneFor === batchId}
                                                        onClose={() => {
                                                            setShowModalOneFor(null);
                                                            setActiveStudentAttendance(null);
                                                            setStudentSearchQuery("");
                                                        }}
                                                    >
                                                        <div className="selectTeacherBox" style={{ minWidth: "300px" }}>
                                                            {!activeStudentAttendance ? (
                                                                <div>
                                                                    <h3 className="modal-title">Students of {batch.batchName}</h3>
                                                                    <input
                                                                        type="search"
                                                                        placeholder="Search students with name..."
                                                                        className="search-input"
                                                                        value={studentSearchQuery}
                                                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                                    />
                                                                    <ul className="list-group" style={{ maxHeight: "67vh", overflowY: "auto", margin: "10px 0" }}>
                                                                        {students[batchId]
                                                                            ?.slice()
                                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                                            .filter((student) =>
                                                                                student.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
                                                                            )
                                                                            .map((student) => (
                                                                                <li key={student._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                    <span className="text-break">{student.name}</span>
                                                                                    <button
                                                                                        className="text-primary"
                                                                                        style={{ border: "none", background: "transparent", fontSize: "13px" }}
                                                                                        onClick={() => {
                                                                                            setActiveStudentAttendance(student._id);
                                                                                            showStudentAttendance(student._id, batchId);
                                                                                        }}
                                                                                    >
                                                                                        View<i className="bi bi-arrow-right ms-1"></i>
                                                                                    </button>
                                                                                </li>
                                                                            ))}
                                                                    </ul>
                                                                </div>
                                                            ) : (
                                                                (() => {
                                                                    const selectedStudent = students[batchId]?.find(
                                                                        (s) => s._id === activeStudentAttendance
                                                                    );
                                                                    return (
                                                                        <div style={{ maxHeight: "85vh", overflowY: "auto" }}>
                                                                            <h3 className="modal-title" style={{ textAlign: "left", textWrap: "wrap" }}>
                                                                                <button
                                                                                    style={{ border: "none", background: "transparent" }}
                                                                                    onClick={() => setActiveStudentAttendance(null)}
                                                                                >
                                                                                    <i className="fas fa-arrow-left"></i>
                                                                                </button>
                                                                                {selectedStudent?.name || "Student"}
                                                                            </h3>
                                                                            <div className="attendance-calendar mt-2">
                                                                                <div id={`carousel-${activeStudentAttendance}`} className="carousel calendar-carousel slide">
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
                                                                                            const firstDayOffset = new Date(calendarYear, calendarMonth, 1).getDay();
                                                                                            const today = new Date();
                                                                                            const isCurrentMonth =
                                                                                                today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;
                                                                                            return (
                                                                                                <div className={`carousel-item ${monthIdx === activeMonthIndex ? "active" : ""}`} key={month}>
                                                                                                    <h6 className="month-title">{month} {calendarYear}</h6>
                                                                                                    <div className="weekday-header">
                                                                                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                                                                                            <span key={d}>{d}</span>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="calendar-grid">
                                                                                                        {[...Array(firstDayOffset)].map((_, i) => (
                                                                                                            <div key={`empty-${i}`} className="date-box empty" />
                                                                                                        ))}
                                                                                                        {[...Array(daysInMonth)].map((_, d) => {
                                                                                                            const date = new Date(calendarYear, calendarMonth, d + 1);
                                                                                                            const formatted = date.toISOString().split('T')[0];
                                                                                                            const key = `${batchId}_${formatted}`;
                                                                                                            const status = attendanceMap[key];
                                                                                                            const isToday = isCurrentMonth && today.getDate() === d + 1;
                                                                                                            return (
                                                                                                                <div
                                                                                                                    key={d}
                                                                                                                    className={`date-box ${status === "present" ? "present" : status === "absent" ? "absent" : ""} ${isToday ? "today" : ""}`}
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
                                                                                    <div className="calendar-controls">
                                                                                        <button className="calendar-button" type="button" data-bs-target={`#carousel-${activeStudentAttendance}`} data-bs-slide="prev">‹ Previous</button>
                                                                                        <button className="calendar-button" type="button" data-bs-target={`#carousel-${activeStudentAttendance}`} data-bs-slide="next">Next ›</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()
                                                            )}
                                                        </div>
                                                    </ModalOne>

                                                    <ModalTwo isOpen={openModalTwo[batchId]} onClose={() => closeAttendanceModal(batchId)}>
                                                        <div className="attendance-form">
                                                            <h3 className="modal-title">Mark Attendance for {batch.batchName}</h3>

                                                            <DatePicker
                                                                className="datePicker mt-1 mb-2"
                                                                dateFormat="dd-MM-yyyy"
                                                                selected={selectedDate}
                                                                onChange={(date) => {
                                                                    setSelectedDates((prev) => ({ ...prev, [batchId]: date }));
                                                                    preloadAttendanceForBatchDate(batchId, date);
                                                                }}
                                                                placeholderText="Select date"
                                                                required
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                yearDropdownItemNumber={10}
                                                                scrollableYearDropdown
                                                                maxDate={new Date()}
                                                                openToDate={new Date()}
                                                                minDate={new Date("1995-01-01")}
                                                            />

                                                            <small className="text-muted d-block text-center">
                                                                {(() => {
                                                                    const total = students[batchId]?.length || 0;
                                                                    const absentCount = Object.values(attendanceDraft[batchId] || {}).filter(v => v === "absent").length;
                                                                    const presentCount = total - absentCount; // default present
                                                                    return `Selected: ${presentCount} Present, ${absentCount} Absent`;
                                                                })()}
                                                            </small>

                                                            <div style={{ maxHeight: "55vh", overflowY: "auto", margin: "10px 0" }}>
                                                                <table className="table table-bordered mt-2">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ padding: "10px 20px" }}>Student Name</th>
                                                                            <th style={{ padding: "10px 20px" }}>Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {students[batchId]?.length > 0 ? (
                                                                            students[batchId]
                                                                                ?.slice() // make a shallow copy so original array isn’t mutated
                                                                                .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                                                                                .map((student) => {
                                                                                    const batchDraft = attendanceDraft[batchId] || {};
                                                                                    // Default to 'present' if not set
                                                                                    const currentStatus = batchDraft[student._id] ?? "present";

                                                                                    const alreadyMarkedKey = selectedDate
                                                                                        ? `${student._id}_${batchId}_${selectedDate.toDateString?.()}`
                                                                                        : null;
                                                                                    const alreadyMarked = alreadyMarkedKey ? markedStatus[alreadyMarkedKey] : undefined;

                                                                                    return (
                                                                                        <tr key={student._id}>
                                                                                            <td style={{ width: "50%", textWrap: "wrap" }}>{student.name}</td>
                                                                                            <td style={{ width: "50%" }}>
                                                                                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className={`btn btn-sm ${currentStatus === "present" ? "btn-success" : "btn-outline-success"}`}
                                                                                                        onClick={() => setDraftStatus(batchId, student._id, "present")}
                                                                                                    >
                                                                                                        Present
                                                                                                    </button>

                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className={`btn btn-sm ${currentStatus === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                                                                                                        onClick={() => setDraftStatus(batchId, student._id, "absent")}
                                                                                                    >
                                                                                                        Absent
                                                                                                    </button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                        ) : (
                                                                            <tr><td colSpan="2">Loading or no students found.</td></tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Summary & single submit button */}
                                                            <div className={`d-flex align-items-center mt-3 ${attendanceExists[batchId] ? "justify-content-between" : "justify-content-center"}`}>
                                                                {attendanceExists[batchId] && (
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        disabled={!selectedDate}
                                                                        onClick={() => removeAttendanceForBatch(batchId, selectedDate)}
                                                                    >
                                                                        Remove Attendance
                                                                    </button>
                                                                )}

                                                                <button
                                                                    className="btn btn-primary"
                                                                    disabled={!selectedDate || (students[batchId]?.length || 0) === 0}
                                                                    onClick={() => saveAttendanceForBatch(batchId, selectedDate)}
                                                                >
                                                                    Mark Attendance
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </ModalTwo>


                                                    <ModalThree isOpen={openModalThree[batchId]} onClose={() => closeTimetableModal(batchId)}>
                                                        <div className="timetable-details">
                                                            <h2 className="modal-title">Timetable for {batch.batchName}</h2>
                                                            {timetable[batchId]?.length > 0 ? (
                                                                <div style={{ maxHeight: "67vh", overflowY: "auto" }}>
                                                                    <table className="table table-colored mt-3">
                                                                        <thead className="table">
                                                                            <tr>
                                                                                <th style={{ padding: "10px 20px" }}>Weekday</th>
                                                                                <th style={{ padding: "10px 20px" }}>Time Slots</th>
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
                                                                </div>
                                                            ) : (
                                                                <p>No timetable found for this batch.</p>
                                                            )}
                                                        </div>
                                                    </ModalThree>

                                                    <ModalFour isOpen={openModalFour[batchId]} onClose={() => closeTestModal(batchId)}>
                                                        <div className="test-form">
                                                            <h3 className="modal-title mb-1">Add Test in {batch.batchName}</h3>
                                                            <form
                                                                onSubmit={async (e) => {
                                                                    e.preventDefault();
                                                                    if (isAddingTests) return;

                                                                    const { testName, maxMarks, testDate } = testDetails;
                                                                    if (!testName || !maxMarks || !testDate) { return alert("Please fill test name, max marks, and date."); }
                                                                    const date = new Date(testDate);

                                                                    setIsAddingTests(true);

                                                                    try {
                                                                        for (const student of students[batch.batchId] || []) {
                                                                            const ms = testFormData[student._id];
                                                                            const absent = ms === undefined || ms === "";

                                                                            await addTest(
                                                                                student._id,
                                                                                batch.batchId,
                                                                                testName,
                                                                                Number(maxMarks),
                                                                                absent ? null : Number(ms), // << send null if absent
                                                                                date,
                                                                                absent
                                                                            );
                                                                        }

                                                                        setTestDetails({ testName: "", maxMarks: "", testDate: null });
                                                                        setTestFormData({});
                                                                        closeTestModal(batch.batchId);
                                                                    } finally {
                                                                        setIsAddingTests(false);
                                                                    }
                                                                }}>
                                                                <div className="mb-2">
                                                                    <DatePicker
                                                                        selected={testDetails.testDate}
                                                                        onChange={(date) => setTestDetails((prev) => ({ ...prev, testDate: date }))}
                                                                        className="datePicker mb-2"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        placeholderText="Select test date"
                                                                        required
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        yearDropdownItemNumber={10}
                                                                        scrollableYearDropdown
                                                                        maxDate={new Date()}
                                                                        openToDate={new Date()}
                                                                        minDate={new Date("1995-01-01")}
                                                                    />
                                                                    <input type="text" placeholder="Test Name" value={testDetails.testName} onChange={(e) => setTestDetails((prev) => ({ ...prev, testName: e.target.value }))} className="form-control mb-2" required />
                                                                    <input type="number" placeholder="Max Marks" value={testDetails.maxMarks} onChange={(e) => setTestDetails((prev) => ({ ...prev, maxMarks: e.target.value }))} className="form-control mb-2" required />
                                                                </div>
                                                                <div style={{ maxHeight: "40vh", overflowY: "auto", margin: "10px 0" }}>
                                                                    <table className="table table-bordered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th style={{ padding: "10px 20px" }}>Student Name</th>
                                                                                <th style={{ padding: "10px 20px" }}>Marks Scored</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {(students[batch.batchId] || [])
                                                                                ?.slice() // make a shallow copy so original array isn’t mutated
                                                                                .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                                                                                .map((student) => (
                                                                                    <tr key={student._id}>
                                                                                        <td style={{ width: "57%", textWrap: "wrap" }}>{student.name}</td>
                                                                                        <td style={{ width: "43%" }}>
                                                                                            <input type="number" className="form-control" value={testFormData[student._id] || ""} onChange={(e) => setTestFormData((prev) => ({ ...prev, [student._id]: e.target.value }))} placeholder="Enter marks" />
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isAddingTests}>
                                                                    {isAddingTests ? "Adding..." : "Add Test"}
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </ModalFour>

                                                    <ModalFive isOpen={showModalFiveFor === batchId} onClose={() => setShowModalFiveFor(null)}>
                                                        <div className="editTestBox" style={{ minWidth: "300px" }}>
                                                            {students[batchId] && tests[batchId] ? (
                                                                tests[batchId].length === 0 ? (
                                                                    <div className="p-4 text-center text-muted">No tests found for this batch.</div>
                                                                ) : (
                                                                    <div>
                                                                        {!selectedTest ? (
                                                                            <div>
                                                                                <h5 className="mb-3 text-center">Tests for {batch.batchName}</h5>
                                                                                <input
                                                                                    type="search"
                                                                                    placeholder="Search tests with name..."
                                                                                    className="search-input"
                                                                                    value={testSearchQuery}
                                                                                    onChange={(e) => setTestSearchQuery(e.target.value)}
                                                                                    style={{
                                                                                        width:"100%",
                                                                                        marginBottom: "10px",
                                                                                        padding: "0.5rem 1rem",
                                                                                    }}
                                                                                />
                                                                                <ul className="list-group">
                                                                                    {Array.from(
                                                                                        new Map(
                                                                                            tests[batchId].map(test => [`${test.name}_${test.date}`, test])
                                                                                        ).values()
                                                                                    )
                                                                                        .slice() // copy so original isn't mutated
                                                                                        .filter(
                                                                                            (test) =>
                                                                                                test.name.toLowerCase().includes(testSearchQuery.toLowerCase())
                                                                                        )
                                                                                        .sort((a, b) => parseDateToTime(a.date) - parseDateToTime(b.date)) // ascending by parsed date
                                                                                        .map((test, idx) => (
                                                                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                <span>
                                                                                                    {test.name} <small className="text-muted">({test.date})</small>
                                                                                                </span>
                                                                                                <button
                                                                                                    className="text-primary"
                                                                                                    style={{ border: "none", background: "transparent", fontSize: "13px" }}
                                                                                                    onClick={() => setSelectedTest(test)}
                                                                                                >
                                                                                                    View<i className="bi bi-arrow-right ms-1"></i>
                                                                                                </button>
                                                                                            </li>
                                                                                        ))}
                                                                                </ul>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                <h3 className="modal-title" style={{ textAlign: "left", textWrap: "wrap" }}>
                                                                                    <button
                                                                                        style={{ border: "none", background: "transparent", marginRight:"5px" }}
                                                                                        onClick={() => {
                                                                                            if (isEditingTestGroup) {
                                                                                                cancelEditTestGroup();
                                                                                                return;
                                                                                            }
                                                                                            setSelectedTest(null);
                                                                                        }}
                                                                                    >
                                                                                        <i className="fas fa-arrow-left"></i>
                                                                                    </button>
                                                                                    {isEditingTestGroup ? (
                                                                                        <input
                                                                                            type="text"
                                                                                            className="form-control d-inline-block ms-2"
                                                                                            value={testGroupEditForm.name}
                                                                                            onChange={(e) => setTestGroupEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                                                            style={{
                                                                                                fontSize: 'inherit !important',
                                                                                                fontWeight: 'inherit !important',
                                                                                                color: "inherit !important",
                                                                                                width:"80%"
                                                                                            }}
                                                                                            placeholder="Test name"
                                                                                        />
                                                                                    ) : (
                                                                                        selectedTest.name
                                                                                    )}
                                                                                </h3>
                                                                                {!isEditingTestGroup ? (
                                                                                    <>
                                                                                        <button
                                                                                            className="btn btn-link btn-lg"
                                                                                            onClick={() => startEditTestGroup(selectedTest)}
                                                                                            style={{ position: "absolute", right: "60px", padding:"0"}}
                                                                                            title="Edit test group"
                                                                                        >
                                                                                            <i className="bi bi-pencil-square"></i>
                                                                                        </button>
                                                                                        <button className="btn btn-lg" onClick={() => handleDeleteTestGroup(batchId, selectedTest)} style={{ position: "absolute", right: "25px", color:"#dc3545",  padding:"0"}} title="Delete test group"><i className="bi bi-trash"></i></button>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="d-flex gap-3" style={{ position: "absolute", right: "25px" }}>
                                                                                        <button
                                                                                            className="btn btn-lg"
                                                                                            onClick={() => saveEditTestGroup(batchId, selectedTest)}
                                                                                            title="Save changes"
                                                                                            style={{color:"#198754", padding:"0"}}
                                                                                        >
                                                                                            <i className="bi bi-check-lg"></i>
                                                                                        </button>
                                                                                        <button
                                                                                            className="btn btn-lg"
                                                                                            onClick={cancelEditTestGroup}
                                                                                            title="Cancel editing"
                                                                                            style={{color:"#6c757d", padding:"0"}}
                                                                                        >
                                                                                            <i className="bi bi-x-lg"></i>
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                                <span style={{ textAlign: "left", marginBottom: "1rem" }}>
                                                                                    {isEditingTestGroup ? (
                                                                                        <>
                                                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                                                <span style={{ minWidth: "70px" }}>Date :</span>
                                                                                                <DatePicker
                                                                                                    selected={testGroupEditForm.date}
                                                                                                    onChange={(date) => setTestGroupEditForm(prev => ({ ...prev, date }))}
                                                                                                    dateFormat="dd-MM-yyyy"
                                                                                                    className="form-control"
                                                                                                    placeholderText="Select date"
                                                                                                    showYearDropdown
                                                                                                    dropdownMode="select"
                                                                                                    yearDropdownItemNumber={10}
                                                                                                    scrollableYearDropdown
                                                                                                    maxDate={new Date()}
                                                                                                    openToDate={new Date()}
                                                                                                    minDate={new Date("1995-01-01")}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <span style={{ minWidth: "70px" }}>Max Marks :</span>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    className="form-control"
                                                                                                    value={testGroupEditForm.maxMarks}
                                                                                                    onChange={(e) => setTestGroupEditForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                                                                                                    placeholder="Max marks"
                                                                                                    min="1"
                                                                                                    style={{ width: "30%" }}
                                                                                                />
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            Date : {selectedTest.date} <br /> Maximum Marks : {selectedTest.maxMarks}
                                                                                        </>
                                                                                    )}
                                                                                </span>
                                                                                <table className="table table-colored">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th style={{ padding: "10px 20px" }}>Student Name</th>
                                                                                            <th style={{ padding: "10px 20px" }}>Marks</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {students[batchId]
                                                                                            ?.slice() // make a shallow copy so original array isn’t mutated
                                                                                            .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                                                                                            .map((student) => {
                                                                                                const match = tests[batchId].find(
                                                                                                    (t) =>
                                                                                                        t.name === selectedTest.name &&
                                                                                                        t.date === selectedTest.date &&
                                                                                                        t.studentId === student._id
                                                                                                );

                                                                                                return (
                                                                                                    <tr key={student._id}>
                                                                                                        <td style={{ width: "50%", textWrap: "wrap" }}>{student.name}</td>
                                                                                                        <td style={{ width: "50%", textWrap: "wrap" }}>
                                                                                                            {/* match = the test row for that student you’re rendering */}
                                                                                                            {match ? (
                                                                                                                <>
                                                                                                                    {editingMarks[match._id] ? (
                                                                                                                        <div className="d-flex gap-2 align-items-center">
                                                                                                                            <input
                                                                                                                                type="number"
                                                                                                                                className="form-control form-control-sm"
                                                                                                                                value={editingMarks[match._id].value}
                                                                                                                                onChange={(e) =>
                                                                                                                                    setEditingMarks(prev => ({
                                                                                                                                        ...prev,
                                                                                                                                        [match._id]: { value: e.target.value }
                                                                                                                                    }))
                                                                                                                                }
                                                                                                                                placeholder="Empty = Absent"
                                                                                                                                style={{ maxWidth: 120 }}
                                                                                                                            />
                                                                                                                            <button
                                                                                                                                className="btn btn-sm btn-outline-success border-0"
                                                                                                                                onClick={() => saveEditMarks(batch.batchId, match)}
                                                                                                                            >
                                                                                                                                <i className="bi bi-check-lg"></i>
                                                                                                                            </button>
                                                                                                                            <button
                                                                                                                                className="btn btn-sm btn-outline-secondary border-0"
                                                                                                                                onClick={() => cancelEditMarks(match._id)}
                                                                                                                            >
                                                                                                                                <i className="bi bi-x-lg"></i>
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    ) : (
                                                                                                                        <div className="d-flex justify-content-between align-items-center" style={{ gap: 8 }}>
                                                                                                                            {/* Show -AB- if absent, else the marks (or -- if truly missing) */}
                                                                                                                            <span>{match.absent ? <span style={{ color: "red" }}>-AB-</span> : (match.marksScored ?? "--")}</span>
                                                                                                                            <button
                                                                                                                                className="btn btn-link btn-sm p-0"
                                                                                                                                onClick={() => startEditMarks(match._id, match.absent ? "" : (match.marksScored ?? ""))}
                                                                                                                                title="Edit marks"
                                                                                                                            >
                                                                                                                                <i className="bi bi-pencil-square"></i>
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </>
                                                                                                            ) : (
                                                                                                                "--"
                                                                                                            )}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="p-4 text-center">No records found</div>
                                                            )}
                                                        </div>
                                                    </ModalFive>

                                                    <ModalSix
                                                        isOpen={showModalSix !== null}
                                                        onClose={() => setShowModalSix(null)}
                                                    >
                                                        {showModalSix && (<>
                                                            <h3 className="modal-title mb-0">{batchesRecords.find((b) => b.batchId === showModalSix)?.batchName}</h3>
                                                            <div id={`carousel-${showModalSix}`} className="carousel calendar-carousel slide mt-2">
                                                                <div className="carousel-inner">
                                                                    {allMonths.map((month, idx) => {
                                                                        let calendarMonth, calendarYear;
                                                                        if (idx <= 8) {
                                                                            calendarMonth = idx + 3;
                                                                            calendarYear = academicYearStart;
                                                                        } else {
                                                                            calendarMonth = idx - 9;
                                                                            calendarYear = academicYearStart + 1;
                                                                        }
                                                                        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                                                                        const firstDayOffset = new Date(calendarYear, calendarMonth, 1).getDay();
                                                                        const today = new Date();
                                                                        const isCurrentMonth =
                                                                            today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;

                                                                        return (
                                                                            <div
                                                                                className={`carousel-item ${idx === activeMonthIndex ? "active" : ""}`}
                                                                                key={month}
                                                                            >
                                                                                <h6 className="month-title">{month} {calendarYear}</h6>
                                                                                <div className="weekday-header">
                                                                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                                                                        <span key={d}>{d}</span>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="calendar-grid">
                                                                                    {[...Array(firstDayOffset)].map((_, i) => (
                                                                                        <div key={`empty-${i}`} className="date-box empty" />
                                                                                    ))}
                                                                                    {[...Array(daysInMonth)].map((_, dateIdx) => {
                                                                                        const date = new Date(calendarYear, calendarMonth, dateIdx + 1);
                                                                                        const fullDate = date.toISOString().split('T')[0];
                                                                                        const key = `${showModalSix}_${fullDate}`;
                                                                                        const status = attendanceMap1[key];
                                                                                        const isToday = isCurrentMonth && today.getDate() === dateIdx + 1;

                                                                                        return (
                                                                                            <div
                                                                                                key={dateIdx}
                                                                                                className={`date-box ${status === "present"
                                                                                                    ? "present"
                                                                                                    : status === "absent"
                                                                                                        ? "absent"
                                                                                                        : ""
                                                                                                    } ${isToday ? "today" : ""}`}
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

                                                                <div className="calendar-controls">
                                                                    <button
                                                                        className="calendar-button"
                                                                        type="button"
                                                                        data-bs-target={`#carousel-${showModalSix}`}
                                                                        data-bs-slide="prev"
                                                                    >
                                                                        ‹ Previous
                                                                    </button>
                                                                    <button
                                                                        className="calendar-button"
                                                                        type="button"
                                                                        data-bs-target={`#carousel-${showModalSix}`}
                                                                        data-bs-slide="next"
                                                                    >
                                                                        Next ›
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>)}
                                                    </ModalSix>

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