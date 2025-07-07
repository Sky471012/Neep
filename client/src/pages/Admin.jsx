import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BatchControls from "../components/BatchControls";
import StudentControls from "../components/StudentControls";
import TeacherControls from "../components/TeacherControls";

export default function Admin() {
    const [admin, setAdmin] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [studentsRecords, setStudentsRecords] = useState([]);
    const [teachersRecords, setTeachersRecords] = useState([]);

    useEffect(() => {
        const storedAdmin = localStorage.getItem("teacher");
        const token = localStorage.getItem("authToken");

        if (storedAdmin && token && storedAdmin !== "undefined") {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (err) {
                console.error("Failed to parse admin JSON:", err);
                localStorage.removeItem("admin");
                return;
            }

            // Fetching batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all batches");
                    return res.json();
                })
                .then(setBatchesRecords)
                .catch((err) => console.error("Batches fetch error:", err));


            // fetching students
            fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/students`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all stuents");
                    return res.json();
                })
                .then(setStudentsRecords)
                .catch((err) => console.error("Students fetch error:", err));

            
            // fetching teachers
            fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/teachers`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all teacher");
                    return res.json();
                })
                .then(setTeachersRecords)
                .catch((err) => console.error("Teachers fetch error:", err));
        }
    }, []);

    return (
        <>
            <Navbar />

            <div className="main-content">
                <div className="flex gap-5">
                    <div className="adminbar d-flex gap-3 m-5">
                        <a href="#batches">Batches</a>
                        <a href="#students">Students</a>
                        <a href="#teachers">Teachers</a>
                        <button className="button">Add a batch</button>
                        <button className="button">Add student</button>
                        <button className="button">Add teacher</button>
                    </div>

                    {/* <BatchControls batchesRecords={batchesRecords} /> */}

                    <StudentControls studentsRecords={studentsRecords} />

                    {/* <TeacherControls teachersRecords={teachersRecords} /> */}
                </div>
            </div>

            <Footer />
        </>
    );
}