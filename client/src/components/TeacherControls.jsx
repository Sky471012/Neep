import React, { useEffect, useState } from "react";
import BatchList from "../modals/BatchList";

export default function TeacherControls({ teachersRecords }) {

    const [batches, setBatches] = useState({});
    const [showBatchListFor, setShowBatchListFor] = useState(null);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchBatches = async (teacherId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/teacherBatches/${teacherId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching batches");

                setBatches((prev) => ({
                    ...prev,
                    [teacherId]: data.batches,
                }));
            } catch (err) {
                console.error(`Error fetching batches for teacher ${teacherId}:`, err);
            }
        };

        teachersRecords.forEach((teacher) => {
            fetchBatches(teacher._id);
        });
    }, [teachersRecords]);



    return (<>

        <div id="teachers" className="batches-container">
            <h1>Teachers</h1>
            <div className="container">
                <div className="row">
                    {teachersRecords.length > 0 ? (
                        teachersRecords.map((teacher, index) => {
                            const teacherId = teacher._id;

                            return (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{teacher.name}</h5>
                                        <span>Email: {teacher.email}</span>
                                        <span>Joined on: {teacher.createdAt}</span>
                                        <div className="d-flex gap-3">
                                            <button className="button" onClick={() => setShowBatchListFor(teacherId)}>
                                                Show all Batches
                                            </button>
                                            <BatchList
                                                isOpen={showBatchListFor === teacherId}
                                                onClose={() => setShowBatchListFor(null)}
                                            >
                                                <div>
                                                    <h3>{teacher.name}</h3>
                                                    <ul className="mt-2">
                                                        {batches[teacherId]?.map((batch) => (
                                                            <li key={batch._id} className="mb-3">
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    <span>{batch.name}</span>
                                                                    <button
                                                                        className="button"
                                                                    >
                                                                        Remove Teacher
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </BatchList>
                                           
                                            <button className="btn btn-danger" >
                                                Remove Teacher
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No teachers found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
