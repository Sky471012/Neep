"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function AllTeachers() {
    const navigate = useNavigate()
    const [admin, setAdmin] = useState(null)
    const [teachersRecords, setTeachersRecords] = useState([])
    const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (storedAdmin && token && storedAdmin !== "undefined") {
            try {
                setAdmin(JSON.parse(storedAdmin))
            } catch (err) {
                console.error("Failed to parse admin JSON:", err)
                localStorage.removeItem("admin")
                setLoading(false);
                return
            }
            const headers = { Authorization: `Bearer ${token}` }

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all teachers")
                    return res.json()
                })
                .then(setTeachersRecords)
                .catch((err) => console.error("Teachers fetch error:", err))
                .finally(() => setLoading(false))
        } else {
            setLoading(false);
        }
    }, [])


    if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading teachers...</p></div></div>);

    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="students-title">All Teachers ({teachersRecords.length})</h2>
                </div>

                <div className="search-container">
                    <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search teachers with name..."
                        className="search-input"
                        value={teacherSearchQuery}
                        onChange={(e) => setTeacherSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className='data-grid-container'>
                <div className="data-grid">
                    {teachersRecords.length > 0 ? (
                        teachersRecords
                            .filter(
                                (teacher) =>
                                    teacher.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                                    teacher.phone.includes(teacherSearchQuery),
                            )
                            .sort((a, b) => a.name.localeCompare(b.name)) // sort alphabetically
                            .map((teacher) => (
                                <Link key={teacher._id} to={`/teacher/${teacher._id}`} className="data-card">
                                    <h5 className="card-title">{teacher.name}</h5>
                                    <span className="card-subtitle">Phone: {teacher.phone}</span>
                                </Link>
                            ))
                    ) : (
                        <p className="no-data">No teachers found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
