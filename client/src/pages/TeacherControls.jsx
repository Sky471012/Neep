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
        const fetchData = async () => {
            const res1 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getTeacherDetails/${teacherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res2 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherBatches/${teacherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const [tData, bData] = await Promise.all([res1.json(), res2.json()]);
            setTeacher(tData || {});
            setBatches(bData.batches || []);
        };

        fetchData();
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

        <div className="main-content">
            <div className="container mt-4">
                <div className="card mb-5 p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <h2>{teacher?.name || "No name"}</h2>

                        <div className="dropdown">
                            <button
                                className="btn btn-sm"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <h3>⋮</h3>
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

                    {isEditing ? (
                        // Edit Mode
                        <div className="mt-3">
                            <div className="mb-3">
                                <label className="form-label">Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Contact Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Non-editable fields */}
                            <div className="mb-3">
                                <label className="form-label">Role:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={teacher.role}
                                    disabled
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Number of batches:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={batches.length}
                                    disabled
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-success"
                                    onClick={handleSaveEdit}
                                >
                                    Save Changes
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <p className="mt-3">
                            Contact Number:<strong> {teacher.phone}<br /></strong>
                            Role:<strong> {teacher.role}<br /></strong>
                            Email:<strong> {teacher.email}<br /></strong>
                            Number of batches:<strong> {batches.length}</strong>
                        </p>
                    )}
                </div>


                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>All Batches</h2>
                        <input
                            type="search"
                            placeholder="Search batches with name..."
                            className="form-control w-50"
                            onChange={(e) => setBatchSearch(e.target.value)}
                        />
                    </div>

                    <table className="table table-borderless align-middle">
                        <tbody>
                            {batches
                                .filter((b) =>
                                    b.name.toLowerCase().includes(batchSearch.toLowerCase())
                                )
                                .map((b) => (
                                    <tr key={b._id}>
                                        <td style={{ width: "40%" }}>{b.name}</td>
                                        <td style={{ width: "30%" }}>
                                            <Link
                                                to={`/batch/${b._id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Open Batch
                                            </Link>
                                        </td>
                                        <td style={{ width: "30%" }}>
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


        <Footer />
    </>)
}
