import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function TeacherControls() {

    const { teacherId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [teacher, setTeacher] = useState({});
    const [batches, setBatches] = useState([]);
    const [batchSearch, setBatchSearch] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: ''
    });


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
        }
    }, [teacherId]);

    useEffect(() => {
        if (teacher) {
            setEditForm({
                name: teacher.name || '',
                email: teacher.email || '',
                phone: teacher.phone || ''
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
        // Reset form to original values
        setEditForm({
            name: teacher.name || '',
            email: teacher.email || '',
            phone: teacher.phone || ''
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
                                                width: '73%',
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
                                    .map((b) => (
                                        <tr key={b._id}>
                                            <td style={{ width: "40%" }}>
                                                {b.name}
                                                <Link className="ms-2 text-primary" to={`/batch/${b._id}`}>
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                </Link>
                                            </td>
                                            <td style={{ width: "30%", textAlign: "right" }}>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeTeacher(b._id, teacherId)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </>)
}
