import React, { useEffect, useState } from "react";
import BatchList from "../modals/BatchList";

export default function StudentControls({ studentsRecords }) {

    const [batches, setBatches] = useState({});
    const [showBatchListFor, setShowBatchListFor] = useState(null);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchBatches = async (studentId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/studentBatches/${studentId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching batches");

                setBatches((prev) => ({
                    ...prev,
                    [studentId]: data.batches,
                }));
            } catch (err) {
                console.error(`Error fetching batches for student ${studentId}:`, err);
            }
        };

        studentsRecords.forEach((student) => {
            fetchBatches(student._id);
        });
    }, [studentsRecords]);



    return (<>

        <div id="students" className="batches-container">
            <h1>Students</h1>
            <div className="container">
                <div className="row">
                    {studentsRecords.length > 0 ? (
                        studentsRecords.map((student, index) => {
                            const studentId = student._id;

                            return (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{student.name}</h5>
                                        <span>Dob: {student.dob}</span>
                                        <span>Phone: {student.phone}</span>
                                        <span>Joined on: {student.createdAt}</span>
                                        <div className="d-flex gap-3">
                                            <button className="button" onClick={() => setShowBatchListFor(studentId)}>
                                                Show all Batches
                                            </button>
                                            <BatchList
                                                isOpen={showBatchListFor === studentId}
                                                onClose={() => setShowBatchListFor(null)}
                                            >
                                                <div>
                                                    <h3>{student.name}</h3>
                                                    <ul className="mt-2">
                                                        {batches[studentId]?.map((batch) => (
                                                            <li key={batch._id} className="mb-3">
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    <span>{batch.name}</span>
                                                                    <button
                                                                        className="button"
                                                                    >
                                                                        Remove Student
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </BatchList>

                                            <button className="button" >
                                                Check Fee status
                                            </button>

                                        </div>
                                        <div className="d-flex mt-3 gap-3">
                                            <button className="button">Add to a batch</button>
                                            <button className="button">Update Fee</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No Students found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
