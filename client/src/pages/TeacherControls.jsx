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
                                        className={`dropdown-item ${teacher.role === 'admin' ? 'text-muted' : 'text-danger'}`}
                                        onClick={() => deleteTeacher(teacher._id)}
                                        disabled={teacher.role === 'admin'}
                                    >
                                        Delete Teacher
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p className="mt-3">Contact Number:<strong> {teacher.phone}<br /></strong>
                        Role:<strong> {teacher.role}<br /></strong>
                        Email:<strong> {teacher.email}<br /></strong>
                        Number of batches:<strong> {batches.length}</strong></p>
                </div>


                <div className="mt-4">
                    <h2>All Batches</h2>
                    <table className="table table-borderless align-middle">
                        <tbody>
                            {batches.map((b) => (
                                <tr key={b._id}>
                                    <td style={{ width: "40%" }}>{b.name}</td>
                                    <td style={{ width: "30%" }}>
                                        <Link to={`/batch/${b._id}`} className="btn btn-outline-primary btn-sm">Open Batch</Link>
                                    </td>
                                    <td style={{ width: "30%" }}>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeTeacher(b._id, teacherId)}>Remove</button>
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
