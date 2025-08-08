"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function AllStudents() {
    const navigate = useNavigate()
    const [admin, setAdmin] = useState(null)
    const [studentsRecords, setStudentsRecords] = useState([])
    const [studentSearchQuery, setStudentSearchQuery] = useState("")

    useEffect(() => {

        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        console.log(token);

        if (storedAdmin && token && storedAdmin !== "undefined") {
            try {
                setAdmin(JSON.parse(storedAdmin))
            } catch (err) {
                console.error("Failed to parse admin JSON:", err)
                localStorage.removeItem("admin")
                return
            }
            const headers = { Authorization: `Bearer ${token}` }

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/students`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all students")
                    return res.json()
                })
                .then(setStudentsRecords)
                .catch((err) => console.error("Students fetch error:", err))
        }
    }, [])


    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="students-title">All Students ({studentsRecords.length})</h2>
                </div>

                <div className="search-container">
                    <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search students with name..."
                        className="search-input"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className='data-grid-container'>
                <div className="data-grid">
                    {studentsRecords.length > 0 ? (
                        studentsRecords
                            .filter(
                                (student) =>
                                    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                    student.class.toLowerCase().includes(studentSearchQuery.toLowerCase()),
                            )
                            .map((student, index) => (
                                <Link key={index} to={`/student/${student._id}`} className="data-card">
                                    <h5 className="card-title">{student.name}</h5>
                                    <span className="card-subtitle">Phone: {student.phone}</span>
                                    <span className="card-code">Class: {student.class}</span>
                                </Link>
                            ))
                    ) : (
                        <p className="no-data">No students found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
