import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import DatePicker from "react-datepicker";


export default function TeacherControls() {

    const { teacherId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [teacher, setTeacher] = useState({});
    const [batches, setBatches] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [activeBatch, setActiveBatch] = useState(null);
    const [batchSearch, setBatchSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [allBatches, setAllBatches] = useState([]);
    const [selectedToAdd, setSelectedToAdd] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [modalOne, setModalOne] = useState(false);
    const [modalTwo, setModalTwo] = useState(false);
    const [openModalThree, setOpenModalThree] = useState(false);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendanceDraft, setAttendanceDraft] = useState({});
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const academicYearStart = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    function getAcademicMonthIndex(month) {
        // Convert calendar month (0–11) to academic month index (0–11)
        return month >= 3 ? month - 3 : month + 9;
    }

    const today = new Date();
    const [activeMonthIndex, setActiveMonthIndex] = useState(getAcademicMonthIndex(today.getMonth()));


    useEffect(() => {
        const storedTeacher = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (storedTeacher && token) {
            setTeacher(JSON.parse(storedTeacher));

            // Fetch teacher details
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getTeacherDetails/${teacherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setTeacher(data || {}))
                .catch(err => console.error("Teacher fetch error:", err));

            // Fetch teacher batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherBatches/${teacherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setBatches(data.batches || []))
                .catch(err => console.error("Batches fetch error:", err));

            // Fetch teacher attendance
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherAttendance/${teacherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setAttendance(data.attendance || []))
                .catch(err => console.error("Attendance fetch error:", err));

            // Fetch all batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setAllBatches(data || {}))
                .catch(err => console.error("All batches fetch error:", err));
        }
    }, [teacherId]);

    useEffect(() => {
        if (teacher) {
            setEditForm({
                name: teacher.name || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                dob: teacher.dob || '',
                address: teacher.address || '',
                qualification: teacher.qualification || '',
                aadhar: teacher.aadhar || '',
                experience: teacher.experience || '',
            });
        }
    }, [teacher]);

    const deleteTeacher = async (teacherId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherDelete/${teacherId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete teacher.");
                return;
            }

            navigate("/admin");
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong while deleting.");
        }
    };

    const removeTeacher = async (batchId, teacherId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove teacher?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/removeTeacher`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ batchId, teacherId }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to remove teacher.");
                return;
            }

            setBatches((prev) => prev.filter(b => b._id !== batchId));
        } catch (error) {
            console.error("Remove error:", error);
            alert("Something went wrong while removing.");
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            name: teacher.name || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            dob: teacher.dob || '',
            address: teacher.address || '',
            qualification: teacher.qualification || '',
            aadhar: teacher.aadhar || '',
            experience: teacher.experience || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editTeacherProfile/${teacherId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedTeacher = await response.json();
                setTeacher(updatedTeacher);
                setIsEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('Error updating profile');
        }
    };

    const filteredBatches = allBatches.filter((b) => {
        const alreadyInBatch = batches.some((bt) => bt._id === b._id);
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = b.name.toLowerCase().includes(searchLower);
        return !alreadyInBatch && nameMatch;
    });

    const toggleSelectBatch = (batchId) => {
        setSelectedToAdd((prev) =>
            prev.includes(batchId)
                ? prev.filter((id) => id !== batchId)
                : [...prev, batchId]
        );
    };

    const handleAddToSelectedBatches = async () => {
        if (selectedToAdd.length === 0) {
            return alert("Please select at least one batch.");
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/addTeacherToBatches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    teacherId,
                    batchIds: selectedToAdd,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to Assign to batches.");
                return;
            }

            setModalOne(false);
            setBatches((prev) => [...prev, ...data.assignedBatches]);
            setSelectedToAdd([]);
            setSearchTerm("");
        } catch (err) {
            console.error("Assign to batches error:", err);
            alert("Error while assigning to batches.");
        }
    };

    const showAttendance = async (batch) => {
        setActiveBatch(batch);
        setModalTwo(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherAttendance/${batch._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            const newMap = {};
            data.attendance?.forEach((record) => {
                const date = new Date(record.date);
                const formattedDate = date.toISOString().split("T")[0];
                const key = `${record.teacherId}_${formattedDate}`;
                newMap[key] = record.status;
            });

            setAttendanceMap((prev) => ({ ...prev, ...newMap }));
        } catch (err) {
            console.error("Failed to fetch Teacher attendance:", err);
            alert("Error fetching attendance");
        }
    };

    const preloadAttendanceForDate = async (dateObj) => {
        const token = localStorage.getItem("authToken");
        const dateOnly = new Date(dateObj.toDateString());

        if (!activeBatch?._id) return; // safety check

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherAttendance/${activeBatch._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

            const rec = (data.attendance || []).find((r) => {
                const rd = new Date(r.date);
                return (
                    r.batchId === activeBatch._id &&
                    rd.getFullYear() === dateOnly.getFullYear() &&
                    rd.getMonth() === dateOnly.getMonth() &&
                    rd.getDate() === dateOnly.getDate()
                );
            });

            // Set state for this single batch
            setAttendanceDraft({
                [activeBatch._id]: rec?.status || undefined
            });

        } catch (err) {
            console.error("Preload attendance error:", err);
        }
    };

    const openModalThreeHandler = () => {
        const date = selectedDate || new Date();
        setOpenModalThree(true);
        setSelectedDate(date);
        preloadAttendanceForDate(date);
    };

    const closeAttendanceModalHandler = () => {
        setOpenModalThree(false);
    };

    const setDraftStatus = (batchId, status) => {
        setAttendanceDraft(prev => {
            const next = { ...prev };
            if (status === 'present' || status === 'absent') {
                next[batchId] = status;
            } else {
                delete next[batchId];
            }
            return next;
        });
    };

    const saveAttendanceForBatch = async (dateObj) => {
    if (!dateObj) {
        alert("Please select a date first.");
        return;
    }

    if (!activeBatch?._id) {
        alert("No active batch selected.");
        return;
    }

    const token = localStorage.getItem("authToken");
    const dateOnly = new Date(dateObj.toDateString());
    const dateISO = dateOnly.toISOString();

    const status = attendanceDraft[activeBatch._id] ?? "present"; // default present

    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendanceTeacher/mark`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                teacherId, // from useParams
                batchId: activeBatch._id,
                date: dateISO,
                status
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

        // Optional: update UI instantly
        setAttendanceDraft({});
        closeAttendanceModalHandler();
    } catch (err) {
        console.error("Teacher attendance error:", err);
        alert("Failed to mark attendance. Please try again.");
    }
};


    return (<>

        <Navbar />

        <div className="app-container">
            <div className="main-layout">
                <div className="teacher-sidebar">
                    <div className="d-flex">
                        <div style={{ margin: "0", padding: "0", width: "100%" }}>
                            <div style={{ position: "absolute", top: "10px", right: "10px" }} className="dropdown">
                                <button
                                    className="btn btn-sm"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <h4 style={{ color: 'white', padding: "0px" }}>⋮</h4>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow">
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => setModalOne(true)}
                                        >
                                            Assign to Batches
                                        </button>
                                    </li><li>
                                        <button
                                            className="dropdown-item"
                                            onClick={handleEditClick}
                                            disabled={isEditing}
                                        >
                                            Edit Profile
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`dropdown-item ${teacher.role === 'Admin' ? 'text-muted' : 'text-danger'}`}
                                            onClick={() => deleteTeacher(teacher._id)}
                                            disabled={teacher.role === 'Admin'}
                                        >
                                            Delete Teacher
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        // Edit Mode
                        <>
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="profile-title mb-2" style={{ margin: "0 auto" }}>
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                        style={{
                                            border: '1px solid #ffffffff',
                                            fontSize: 'inherit',
                                            fontWeight: 'inherit',
                                            background: 'transparent',
                                            padding: "0",
                                            boxShadow: "none",
                                            color: "inherit"
                                        }}
                                    />
                                </h2>
                            </div>

                            <div className="student-details-card" style={{ padding: "0.5rem 1.5rem" }}>
                                <div className="detail-item p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 600 600">

                                        <path d="M27 182L55.5 343.7C69.5 423.2 131.8 485.5 211.3 499.5L224 501.7C207.5 473.1 196.9 441 193.4 407.2L169.3 411.5C159.6 413.2 150.5 405.7 152.4 396C157.2 371.3 171.5 349.4 192.1 335.1L192.1 260.5C190.7 261.3 189.1 261.8 187.4 262.1L124.4 273.2C115.7 274.7 107.1 268.8 108.5 260.1C111.6 240.5 126.9 224.1 147.6 220.4C164.8 217.4 181.5 223.9 192.2 236.2L192.2 213.5C192.2 191 199.1 161.1 224.5 140.1C250.5 118.6 292.2 96.2 349.4 85.9C318.9 69.6 263.1 53.9 185.6 67.5C105.3 81.7 57.6 117.6 35.5 143.6C26.5 154.1 24.7 168.5 27.1 182.1zM240 202.7L240 377.5C240 458.2 290.5 530.4 366.4 557.9L394.1 568C408.2 573.1 423.7 573.1 437.8 568L465.6 558C541.5 530.4 592 458.3 592 377.5L592 202.7C592 195.8 589.9 188.9 585 184.1C562.4 161.6 506.8 128.1 416 128.1C325.2 128.1 269.6 161.7 247 184.1C242.1 189 240 195.8 240 202.7zM306.1 389.8C304.7 382.8 313.1 378.8 318.8 383.2C345.7 403.8 379.4 416.1 416 416.1C452.6 416.1 486.2 403.8 513.2 383.2C518.9 378.8 527.3 382.8 525.9 389.8C515.8 441.2 470.4 480.1 416 480.1C361.6 480.1 316.2 441.3 306.1 389.8zM306.6 288.3C313.2 269.5 331 256 352 256C373 256 390.9 269.5 397.4 288.3C400.3 296.7 392.9 304 384 304L320 304C311.2 304 303.7 296.6 306.6 288.3zM512 304L448 304C439.2 304 431.7 296.6 434.6 288.3C441.1 269.5 459 256 480 256C501 256 518.9 269.5 525.4 288.3C528.3 296.7 520.9 304 512 304z" />
                                    </svg>
                                    <div className="detail-label">Role: {teacher.role}</div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="detail-label">
                                        Phone:
                                        <input
                                            type="text"
                                            className="form-control d-inline-block ms-2"
                                            name="phone"
                                            value={editForm.phone}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '70%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    <div className="detail-label">
                                        Email:
                                        <input
                                            type="email"
                                            className="form-control d-inline-block ms-2"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '75%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                    </svg>
                                    <div className="detail-label d-flex flex-nowrap">DOB:
                                        <DatePicker
                                            selected={editForm.dob ? new Date(editForm.dob.split('-').reverse().join('-')) : null}
                                            onChange={(date) => {
                                                const formattedDate = date ?
                                                    `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
                                                    : '';
                                                setEditForm(prev => ({ ...prev, dob: formattedDate }));
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="DD-MM-YYYY"
                                            className="form-control d-inline-block ms-2"
                                            showYearDropdown
                                            yearDropdownItemNumber={10}
                                            scrollableYearDropdown
                                            dropdownMode="select"
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="detail-label">
                                        <input
                                            type="text"
                                            className="form-control d-inline-block"
                                            name="address"
                                            value={editForm.address}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M271.2 56C265.1 49.8 256.2 47.3 247.8 49.6C239.4 51.9 232.9 58.4 230.8 66.8L215.5 127C214.4 131.4 209.9 134 205.6 132.7L145.8 115.9C137.4 113.5 128.4 115.9 122.3 122C116.2 128.1 113.8 137.1 116.2 145.5L133.1 205.3C134.3 209.6 131.7 214.1 127.4 215.2L67.1 230.5C58.7 232.6 52.1 239.2 49.8 247.6C47.5 256 50 264.9 56.2 271L100.7 314.3C103.9 317.4 103.9 322.6 100.7 325.8L56.3 369.1C50.1 375.2 47.6 384.1 49.9 392.5C52.2 400.9 58.8 407.4 67.2 409.6L127.4 424.9C131.8 426 134.4 430.5 133.1 434.8L116.2 494.5C113.8 502.9 116.2 511.9 122.3 518C128.4 524.1 137.4 526.5 145.8 524.1L205.6 507.2C209.9 506 214.4 508.6 215.5 512.9L230.8 573.1C232.9 581.5 239.5 588.1 247.9 590.4C256.3 592.7 265.2 590.2 271.3 584L314.6 539.5C317.7 536.3 322.9 536.3 326.1 539.5L369.3 584C375.4 590.2 384.3 592.7 392.7 590.4C401.1 588.1 407.6 581.5 409.8 573.1L425.1 513C426.2 508.6 430.7 506 435 507.3L494.8 524.2C503.2 526.6 512.2 524.2 518.3 518.1C524.4 512 526.8 503 524.4 494.6L507.5 434.8C506.3 430.5 508.9 426 513.2 424.9L573.4 409.6C581.8 407.5 588.4 400.9 590.7 392.5C593 384.1 590.5 375.1 584.3 369.1L539.8 325.8C536.6 322.7 536.6 317.5 539.8 314.3L584.3 271C590.5 264.9 593 256 590.7 247.6C588.4 239.2 581.8 232.7 573.4 230.5L513.2 215.2C508.8 214.1 506.2 209.6 507.5 205.3L524.4 145.5C526.8 137.1 524.4 128.1 518.3 122C512.2 115.9 503.2 113.5 494.8 115.9L435 132.8C430.7 134 426.2 131.4 425.1 127.1L409.8 66.8C407.7 58.4 401.1 51.8 392.7 49.5C384.3 47.2 375.4 49.7 369.3 55.9L326 100.5C322.9 103.7 317.7 103.7 314.5 100.5L271.2 56z" /></svg>
                                    <div className="detail-label">Qualifications:
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={editForm.qualification}
                                            onChange={handleInputChange}
                                            className="form-control d-inline-block ms-2"
                                            style={{
                                                width: '90%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M32 160C32 124.7 60.7 96 96 96L544 96C579.3 96 608 124.7 608 160L32 160zM32 208L608 208L608 480C608 515.3 579.3 544 544 544L96 544C60.7 544 32 515.3 32 480L32 208zM279.3 480C299.5 480 314.6 460.6 301.7 445C287 427.3 264.8 416 240 416L176 416C151.2 416 129 427.3 114.3 445C101.4 460.6 116.5 480 136.7 480L279.2 480zM208 376C238.9 376 264 350.9 264 320C264 289.1 238.9 264 208 264C177.1 264 152 289.1 152 320C152 350.9 177.1 376 208 376zM392 272C378.7 272 368 282.7 368 296C368 309.3 378.7 320 392 320L504 320C517.3 320 528 309.3 528 296C528 282.7 517.3 272 504 272L392 272zM392 368C378.7 368 368 378.7 368 392C368 405.3 378.7 416 392 416L504 416C517.3 416 528 405.3 528 392C528 378.7 517.3 368 504 368L392 368z" /></svg>
                                    <div className="detail-label">Aadhar:
                                        <input
                                            type="number"
                                            name="aadhar"
                                            value={editForm.aadhar}
                                            onChange={handleInputChange}
                                            className="form-control d-inline-block ms-2"
                                            style={{
                                                width: '68%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M341.9 38.1C328.5 29.9 311.6 29.9 298.2 38.1C273.8 53 258.7 57 230.1 56.4C214.4 56 199.8 64.5 192.2 78.3C178.5 103.4 167.4 114.5 142.3 128.2C128.5 135.7 120.1 150.4 120.4 166.1C121.1 194.7 117 209.8 102.1 234.2C93.9 247.6 93.9 264.5 102.1 277.9C117 302.3 121 317.4 120.4 346C120 361.7 128.5 376.3 142.3 383.9C164.4 396 175.6 406 187.4 425.4L138.7 522.5C132.8 534.4 137.6 548.8 149.4 554.7L235.4 597.7C246.9 603.4 260.9 599.1 267.1 587.9L319.9 492.8L372.7 587.9C378.9 599.1 392.9 603.5 404.4 597.7L490.4 554.7C502.3 548.8 507.1 534.4 501.1 522.5L452.5 425.3C464.2 405.9 475.5 395.9 497.6 383.8C511.4 376.3 519.8 361.6 519.5 345.9C518.8 317.3 522.9 302.2 537.8 277.8C546 264.4 546 247.5 537.8 234.1C522.9 209.7 518.9 194.6 519.5 166C519.9 150.3 511.4 135.7 497.6 128.1C472.5 114.4 461.4 103.3 447.7 78.2C440.2 64.4 425.5 56 409.8 56.3C381.2 57 366.1 52.9 341.7 38zM320 160C373 160 416 203 416 256C416 309 373 352 320 352C267 352 224 309 224 256C224 203 267 160 320 160z" /></svg>
                                    <div className="detail-label">Experience (years):
                                        <input
                                            type="number"
                                            name="experience"
                                            value={editForm.experience}
                                            onChange={handleInputChange}
                                            className="form-control d-inline-block ms-2"
                                            style={{
                                                width: '20%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                    </svg>
                                    <div className="detail-label">Batches Assigned: {batches.length}</div>
                                </div>

                                <div className="d-flex mt-2 justify-content-around">
                                    <button
                                        className="green-button"
                                        onClick={handleSaveEdit}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        className="yellow-button"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // View Mode
                        <>
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="profile-title mb-2" style={{ margin: "0 auto" }}>{teacher?.name || "No name"}</h2>
                            </div>


                            <div className="teacher-details-card">
                                <div className="detail-item p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 600 600">

                                        <path d="M27 182L55.5 343.7C69.5 423.2 131.8 485.5 211.3 499.5L224 501.7C207.5 473.1 196.9 441 193.4 407.2L169.3 411.5C159.6 413.2 150.5 405.7 152.4 396C157.2 371.3 171.5 349.4 192.1 335.1L192.1 260.5C190.7 261.3 189.1 261.8 187.4 262.1L124.4 273.2C115.7 274.7 107.1 268.8 108.5 260.1C111.6 240.5 126.9 224.1 147.6 220.4C164.8 217.4 181.5 223.9 192.2 236.2L192.2 213.5C192.2 191 199.1 161.1 224.5 140.1C250.5 118.6 292.2 96.2 349.4 85.9C318.9 69.6 263.1 53.9 185.6 67.5C105.3 81.7 57.6 117.6 35.5 143.6C26.5 154.1 24.7 168.5 27.1 182.1zM240 202.7L240 377.5C240 458.2 290.5 530.4 366.4 557.9L394.1 568C408.2 573.1 423.7 573.1 437.8 568L465.6 558C541.5 530.4 592 458.3 592 377.5L592 202.7C592 195.8 589.9 188.9 585 184.1C562.4 161.6 506.8 128.1 416 128.1C325.2 128.1 269.6 161.7 247 184.1C242.1 189 240 195.8 240 202.7zM306.1 389.8C304.7 382.8 313.1 378.8 318.8 383.2C345.7 403.8 379.4 416.1 416 416.1C452.6 416.1 486.2 403.8 513.2 383.2C518.9 378.8 527.3 382.8 525.9 389.8C515.8 441.2 470.4 480.1 416 480.1C361.6 480.1 316.2 441.3 306.1 389.8zM306.6 288.3C313.2 269.5 331 256 352 256C373 256 390.9 269.5 397.4 288.3C400.3 296.7 392.9 304 384 304L320 304C311.2 304 303.7 296.6 306.6 288.3zM512 304L448 304C439.2 304 431.7 296.6 434.6 288.3C441.1 269.5 459 256 480 256C501 256 518.9 269.5 525.4 288.3C528.3 296.7 520.9 304 512 304z" />
                                    </svg>
                                    <div className="detail-label">Role: {teacher.role}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="detail-label">Phone: {teacher.phone}</div>
                                    {teacher.phone && (
                                            <span style={{ display: "inline-flex", gap: "0.4rem", flexShrink: 0 }}>
                                                <a
                                                    title="Call"
                                                    href={`tel:+91${teacher.phone}`}
                                                    className="phone-action-btn"
                                                >
                                                    <i className="bi bi-telephone-outbound"></i>
                                                </a>
                                                <a
                                                    title="WhatsApp"
                                                    href={`https://wa.me/91${teacher.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="phone-action-btn phone-action-btn-wa"
                                                >
                                                    <i className="bi bi-whatsapp"></i>
                                                </a>
                                            </span>
                                        )}
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    <div className="detail-label">Email: {teacher.email}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                    </svg>
                                    <div className="detail-label">DOB: {teacher.dob || 'NA'}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="detail-label">{teacher.address || 'NA'}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M271.2 56C265.1 49.8 256.2 47.3 247.8 49.6C239.4 51.9 232.9 58.4 230.8 66.8L215.5 127C214.4 131.4 209.9 134 205.6 132.7L145.8 115.9C137.4 113.5 128.4 115.9 122.3 122C116.2 128.1 113.8 137.1 116.2 145.5L133.1 205.3C134.3 209.6 131.7 214.1 127.4 215.2L67.1 230.5C58.7 232.6 52.1 239.2 49.8 247.6C47.5 256 50 264.9 56.2 271L100.7 314.3C103.9 317.4 103.9 322.6 100.7 325.8L56.3 369.1C50.1 375.2 47.6 384.1 49.9 392.5C52.2 400.9 58.8 407.4 67.2 409.6L127.4 424.9C131.8 426 134.4 430.5 133.1 434.8L116.2 494.5C113.8 502.9 116.2 511.9 122.3 518C128.4 524.1 137.4 526.5 145.8 524.1L205.6 507.2C209.9 506 214.4 508.6 215.5 512.9L230.8 573.1C232.9 581.5 239.5 588.1 247.9 590.4C256.3 592.7 265.2 590.2 271.3 584L314.6 539.5C317.7 536.3 322.9 536.3 326.1 539.5L369.3 584C375.4 590.2 384.3 592.7 392.7 590.4C401.1 588.1 407.6 581.5 409.8 573.1L425.1 513C426.2 508.6 430.7 506 435 507.3L494.8 524.2C503.2 526.6 512.2 524.2 518.3 518.1C524.4 512 526.8 503 524.4 494.6L507.5 434.8C506.3 430.5 508.9 426 513.2 424.9L573.4 409.6C581.8 407.5 588.4 400.9 590.7 392.5C593 384.1 590.5 375.1 584.3 369.1L539.8 325.8C536.6 322.7 536.6 317.5 539.8 314.3L584.3 271C590.5 264.9 593 256 590.7 247.6C588.4 239.2 581.8 232.7 573.4 230.5L513.2 215.2C508.8 214.1 506.2 209.6 507.5 205.3L524.4 145.5C526.8 137.1 524.4 128.1 518.3 122C512.2 115.9 503.2 113.5 494.8 115.9L435 132.8C430.7 134 426.2 131.4 425.1 127.1L409.8 66.8C407.7 58.4 401.1 51.8 392.7 49.5C384.3 47.2 375.4 49.7 369.3 55.9L326 100.5C322.9 103.7 317.7 103.7 314.5 100.5L271.2 56z" /></svg>
                                    <div className="detail-label">Qualification: {teacher.qualification || 'NA'}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M32 160C32 124.7 60.7 96 96 96L544 96C579.3 96 608 124.7 608 160L32 160zM32 208L608 208L608 480C608 515.3 579.3 544 544 544L96 544C60.7 544 32 515.3 32 480L32 208zM279.3 480C299.5 480 314.6 460.6 301.7 445C287 427.3 264.8 416 240 416L176 416C151.2 416 129 427.3 114.3 445C101.4 460.6 116.5 480 136.7 480L279.2 480zM208 376C238.9 376 264 350.9 264 320C264 289.1 238.9 264 208 264C177.1 264 152 289.1 152 320C152 350.9 177.1 376 208 376zM392 272C378.7 272 368 282.7 368 296C368 309.3 378.7 320 392 320L504 320C517.3 320 528 309.3 528 296C528 282.7 517.3 272 504 272L392 272zM392 368C378.7 368 368 378.7 368 392C368 405.3 378.7 416 392 416L504 416C517.3 416 528 405.3 528 392C528 378.7 517.3 368 504 368L392 368z" /></svg>
                                    <div className="detail-label">Aadhar: {teacher.aadhar || 'NA'}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 640 640"><path d="M341.9 38.1C328.5 29.9 311.6 29.9 298.2 38.1C273.8 53 258.7 57 230.1 56.4C214.4 56 199.8 64.5 192.2 78.3C178.5 103.4 167.4 114.5 142.3 128.2C128.5 135.7 120.1 150.4 120.4 166.1C121.1 194.7 117 209.8 102.1 234.2C93.9 247.6 93.9 264.5 102.1 277.9C117 302.3 121 317.4 120.4 346C120 361.7 128.5 376.3 142.3 383.9C164.4 396 175.6 406 187.4 425.4L138.7 522.5C132.8 534.4 137.6 548.8 149.4 554.7L235.4 597.7C246.9 603.4 260.9 599.1 267.1 587.9L319.9 492.8L372.7 587.9C378.9 599.1 392.9 603.5 404.4 597.7L490.4 554.7C502.3 548.8 507.1 534.4 501.1 522.5L452.5 425.3C464.2 405.9 475.5 395.9 497.6 383.8C511.4 376.3 519.8 361.6 519.5 345.9C518.8 317.3 522.9 302.2 537.8 277.8C546 264.4 546 247.5 537.8 234.1C522.9 209.7 518.9 194.6 519.5 166C519.9 150.3 511.4 135.7 497.6 128.1C472.5 114.4 461.4 103.3 447.7 78.2C440.2 64.4 425.5 56 409.8 56.3C381.2 57 366.1 52.9 341.7 38zM320 160C373 160 416 203 416 256C416 309 373 352 320 352C267 352 224 309 224 256C224 203 267 160 320 160z" /></svg>
                                    <div className="detail-label">Experience (yrs): {teacher.experience ? `${teacher.experience}+` : 'NA'}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                    </svg>
                                    <div className="detail-label">Batches Assigned: {batches.length}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>


                <div className="content-area">
                    <div className="welcome-card">
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

                        <table className="table table-borderless align-middle">
                            <tbody>
                                {batches
                                    .filter((b) =>
                                        b.name.toLowerCase().includes(batchSearch.toLowerCase())
                                    )
                                    .sort((a, b) => a.name.localeCompare(b.name)) // sort alphabetically
                                    .map((b) => (
                                        <tr key={b._id}>
                                            <td style={{ width: "50%" }}>
                                                {b.name}
                                                <Link className="ms-2 text-primary" to={`/batch/${b._id}`}>
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                </Link>
                                            </td>
                                            <td style={{ width: "50%", textAlign: "right" }}>
                                                <div className="d-none d-sm-flex justify-content-end gap-2">
                                                    <button className="btn btn-outline-success btn-sm" onClick={() => { setActiveBatch(b); openModalThreeHandler(); }}>
                                                        Mark Attendance
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => showAttendance(b)}>
                                                        Show Attendance
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeTeacher(b._id, teacherId)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="d-sm-none">
                                                    <div className="d-flex gap-2 mb-2">
                                                        <button className="btn btn-outline-success btn-sm flex-fill" onClick={() => { setActiveBatch(b); openModalThreeHandler(); }}>
                                                            Mark Attendance
                                                        </button>
                                                        <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => showAttendance(b)}>
                                                            Show Attendance
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm w-100"
                                                        onClick={() => removeTeacher(b._id, teacherId)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ModalOne
                    isOpen={modalOne}
                    onClose={() => {
                        setModalOne(false);
                        setSearchTerm("");
                    }}
                >
                    <div className="addToBatch-box">
                        <h3 className="modal-title">Assign Teacher to Batches</h3>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={{ maxHeight: "45vh", overflowY: "auto", margin: "10px" }}>
                            {filteredBatches
                                ?.slice() // make a shallow copy so original array isn’t mutated
                                .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                                .map((batch) => (
                                    <div key={batch._id} className="d-flex align-items-center mb-1 text-break w-100">
                                        <input
                                            className="checkbox"
                                            type="checkbox"
                                            id={batch._id}
                                            checked={selectedToAdd.includes(batch._id)}
                                            onChange={() => toggleSelectBatch(batch._id)}
                                        />
                                        <label htmlFor={batch._id}>
                                            <div className="d-flex">{batch.name} <div className="dot"></div> Class: {batch.class}</div>
                                        </label>
                                    </div>
                                ))}
                        </div>
                        <button className="btn btn-primary mt-3" style={{ width: "100%" }} onClick={handleAddToSelectedBatches}>
                            Assign to selected Batches
                        </button>
                    </div>
                </ModalOne>

                <ModalTwo
                    isOpen={modalTwo}
                    onClose={() => {
                        setModalTwo(false);
                        setActiveBatch(null);
                    }}
                >
                    {activeBatch && (<>
                        <h3 className="modal-title mb-0 mt-2">Attendance in {activeBatch.name}</h3>
                        <div id={`carousel-${activeBatch._id}`} className="carousel slide p-1 mt-2" style={{ backgroundColor: "#d4d4d4ff" }}>
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
                                            <h6 className="month-title">{month} {calendarYear}</h6>
                                            <div className="calendar-grid">
                                                {[...Array(daysInMonth)].map((_, d) => {
                                                    const date = new Date(calendarYear, calendarMonth, d + 1);
                                                    const formatted = date.toISOString().split("T")[0];
                                                    const key = `${teacherId}_${formatted}`;
                                                    const status = attendanceMap[key];

                                                    return (
                                                        <div
                                                            key={d}
                                                            className={`date-box ${status === "present"
                                                                ? "present"
                                                                : status === "absent"
                                                                    ? "absent"
                                                                    : ""
                                                                }`}
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
                            <div className="calendar-controls">
                                <button
                                    className="calendar-button ms-1 mb-1"
                                    onClick={() =>
                                        setActiveMonthIndex((prev) => (prev - 1 + 12) % 12)
                                    }
                                >
                                    ‹ Previous
                                </button>
                                <button
                                    className="calendar-button mb-1 me-1"
                                    onClick={() =>
                                        setActiveMonthIndex((prev) => (prev + 1) % 12)
                                    }
                                >
                                    Next ›
                                </button>
                            </div>
                        </div>
                    </>)}
                </ModalTwo>

                <ModalThree
                    isOpen={openModalThree}
                    onClose={closeAttendanceModalHandler}
                >
                    <div className="attendance-form" style={{minHeight:"450px"}}>
                        <h3 className="modal-title">Mark Attendance of <br />{teacher.name}</h3>

                        <DatePicker
                            className="datePicker mt-1 mb-2"
                            dateFormat="dd-MM-yyyy"
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                preloadAttendanceForDate(date);
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

                        <div style={{ maxHeight: "55vh", overflowY: "auto", margin: "10px 0" }}>
                            <table className="table table-bordered mt-3">
                                <thead>
                                    <tr>
                                        <th style={{ width: "40%", padding: "10px 20px" }}>Batch</th>
                                        <th style={{ width: "60%", padding: "10px 20px" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ width: "40%", wordWrap: "break-word" }}>
                                            {activeBatch?.name}
                                        </td>
                                        <td style={{ width: "60%" }}>
                                            <div className="d-flex gap-2 align-items-center flex-wrap" role="group" aria-label="attendance">
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${attendanceDraft[activeBatch?._id] === "present"
                                                        ? "btn-success"
                                                        : "btn-outline-success"
                                                        }`}
                                                    onClick={() => setDraftStatus(activeBatch._id, "present")}
                                                >
                                                    Present
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${attendanceDraft[activeBatch?._id] === "absent"
                                                        ? "btn-danger"
                                                        : "btn-outline-danger"
                                                        }`}
                                                    onClick={() => setDraftStatus(activeBatch._id, "absent")}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <button
                                className="btn btn-primary m-auto"
                                disabled={!selectedDate}
                                onClick={() => saveAttendanceForBatch(selectedDate)}
                            >
                                Mark Attendance
                            </button>
                        </div>
                    </div>
                </ModalThree>

            </div>
        </div>

    </>)
}
