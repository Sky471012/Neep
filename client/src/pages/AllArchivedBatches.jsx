"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function AllArchivedBatches() {
    const [admin, setAdmin] = useState(null)
    const [archivedBatchesRecords, setArchivedBatchesRecords] = useState([])
    const [archivedBatchSearchQuery, setArchivedBatchSearchQuery] = useState("")
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

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/archivedBatches`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all archived batches")
                    return res.json()
                })
                .then(setArchivedBatchesRecords)
                .catch((err) => console.error("Archived Batches fetch error:", err))
                .finally(() => setLoading(false))
        } else {
            setLoading(false);
        }
    }, [])


    if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading archived batches...</p></div></div>);

    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="batches-title">Archived Batches ({archivedBatchesRecords.length})</h2>
                </div>

                <div className="search-container">
                    <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search batches with name..."
                        className="search-input"
                        value={archivedBatchSearchQuery}
                        onChange={(e) => setArchivedBatchSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className='data-grid-container'>
                <div className="data-grid">
                    {archivedBatchesRecords.length > 0 ? (
                        archivedBatchesRecords
                            .filter(
                                (batch) =>
                                    batch.name.toLowerCase().includes(archivedBatchSearchQuery.toLowerCase()) ||
                                    batch.class.toLowerCase().includes(archivedBatchSearchQuery.toLowerCase()),
                            )
                            .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                            .map((batch) => (
                                <Link key={batch._id} to={`/batch/${batch._id}`} className="data-card">
                                    <h5 className="card-title">{batch.name}</h5>
                                    <span className="card-subtitle">Class: {batch.class}</span>
                                </Link>
                            ))
                    ) : (
                        <p className="no-data">No archived batches found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
