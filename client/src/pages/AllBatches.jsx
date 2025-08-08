"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function AllBatches() {
    const [admin, setAdmin] = useState(null)
    const [batchesRecords, setBatchesRecords] = useState([])
    const [batchSearchQuery, setBatchSearchQuery] = useState("")

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

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batches`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all batches")
                    return res.json()
                })
                .then(setBatchesRecords)
                .catch((err) => console.error("Batches fetch error:", err))
        }
    }, [])


    return (<>
    
        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="batches-title">All Batches ({batchesRecords.length})</h2>
                </div>

                <div className="search-container">
                    <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search batches with name..."
                        className="search-input"
                        value={batchSearchQuery}
                        onChange={(e) => setBatchSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className='data-grid-container'>
                <div className="data-grid">
                    {batchesRecords.length > 0 ? (
                        batchesRecords
                            .filter(
                                (batch) =>
                                    batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
                                    batch.class.toLowerCase().includes(batchSearchQuery.toLowerCase()),
                            )
                            .map((batch, index) => (
                                <Link key={index} to={`/batch/${batch._id}`} className="data-card">
                                    <h5 className="card-title">{batch.name}</h5>
                                    <span className="card-subtitle">Class: {batch.class}</span>
                                </Link>
                            ))
                    ) : (
                        <p className="no-data">No batches found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
