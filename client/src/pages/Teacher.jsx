import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Teacher() {
    const [teacher, setTeacher] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [students, setStudents] = useState({});

    useEffect(() => {
        const storedTeacher = localStorage.getItem("teacher");
        const token = localStorage.getItem("authToken");

        if (storedTeacher && token && storedTeacher !== "undefined") {
            try {
                setTeacher(JSON.parse(storedTeacher));
            } catch (err) {
                console.error("Failed to parse teacher JSON:", err);
                localStorage.removeItem("teacher"); // cleanup
                return;
            }

            // Fetch batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/teacher/batches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch batches");
                    return res.json();
                })
                .then(setBatchesRecords)
                .catch(err => console.error("Batches fetch error:", err));
        }
    }, []);

    // fetching batch students
    useEffect(() => {
        const token = localStorage.getItem("authToken");

        const fetchStudents = async (batchId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/teacher/batchStudents/${batchId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Error fetching students');

                setStudents(prev => ({
                    ...prev,
                    [batchId]: data.students
                }));
            } catch (err) {
                console.error(`Error fetching students for batch ${batchId}:`, err);
            }
        };

        batchesRecords.forEach(batch => {
            fetchStudents(batch.batchId); // ✅ Call for each batch
        });
    }, [batchesRecords]);

    if (!teacher) return <p>Loading teacher data...</p>;

    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="student-details">
                    <h1>Teacher details</h1>
                    <div className="container">
                        <span>Name : {teacher.name}</span><br />
                        <span>Email : {teacher.email}</span><br />
                        <span>Role : {teacher.role}</span>
                    </div>
                </div>

                <div className="batches-container">
                    <h1>Batches</h1>
                    <div className="container">
                        <div className="row">
                            {batchesRecords.length > 0 ? (
                                batchesRecords.map((batch, index) => (
                                    <div className="col-12 col-md-6 col-lg-5" key={index}>
                                        <div className="card batch-card mb-3">
                                            <h5 className="card-title">{batch.batchName}</h5>
                                            <span><strong>Student list:</strong></span>
                                            <ul className="mt-2">
                                                {students[batch.batchId]?.length > 0 ? (
                                                    students[batch.batchId].map((student, idx) => (
                                                        <li key={idx}>{student.name}</li>
                                                    ))
                                                ) : (
                                                    <li>Loading or no students found.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                ))
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
