"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function TodaysBirthdays() {
    const token = localStorage.getItem("authToken");
    const [birthdays, setBirthdays] = useState([]);
    const [totalBirthdays, setTotalBirthdays] = useState(0);


    // Mark a birthday as wished
    const sendWish = async (studentId, phone, name) => {
        try {
            const message = "🎉 Happy Birthday " + name + "! 🎂\n\n" +
                          "*New Era Education Point (NEEP)* wishes you a day full of joy, success, and wonderful memories! 🎈✨🎊";
            const encodedMessage = encodeURIComponent(message).replace(/[!'()*]/g, escape);
            const waURL = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodedMessage}`;
            window.open(waURL, "_blank");

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/birthday/wish`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ studentId }),
                }
            );

            const data = await res.json();

            if (data.wished) {
                // Update the state to reflect that the wish has been sent
                setBirthdays((prev) =>
                    prev.map((s) =>
                        s._id === studentId ? { ...s, wished: true } : s
                    )
                );
            } else {
                alert(data.message || "Could not send wish.");
            }
        } catch (error) {
            console.error("Error sending wish:", error);
            alert("Something went wrong while sending wish.");
        }
    };

    useEffect(() => {

        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken")
        const headers = { Authorization: `Bearer ${token}` }


        // Fetch today's birthdays directly
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthday/today`, { headers })
            .then((res) => res.json())
            .then((data) => {
                setBirthdays(data.students);
                setTotalBirthdays(data.totalBirthdays);
            })
            .catch((err) => console.error("Error fetching birthdays", err));

    }, []);


    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="batches-title">Birthday Alerts ({totalBirthdays})</h2>
                </div>
            </div>

            <div className='data-grid-container'>
                <div className="data-grid">
                    {birthdays.length > 0 ? (
                        birthdays
                            .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                            .map((student, index) => (
                                <div className="data-card d-flex justify-content-between align-items-start" key={index} >
                                    <div>
                                        <h5 className="card-title">{student.name}</h5>
                                        <span className="card-subtitle">Class: {student.class}</span>
                                    </div>
                                    <button className="btn btn-success" onClick={() => sendWish(student._id, student.phone, student.name)} disabled={student.wished}>{student.wished ? "Wished ✨" : "Send Wishes ✨"}</button>
                                </div>
                            ))
                    ) : (
                        <p className="no-data">No student to be wished.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
