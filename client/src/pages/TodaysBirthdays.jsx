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
    const [teachersBirthdays, setTeachersBirthdays] = useState([]);
    const [totalTeachersBirthdays, setTotalTeachersBirthdays] = useState(0);
    const [activeTab, setActiveTab] = useState("students");

    useEffect(() => {

        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken")
        const headers = { Authorization: `Bearer ${token}` }


        // Fetch today's Students birthdays directly
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthday/today`, { headers })
            .then((res) => res.json())
            .then((data) => {
                setBirthdays(data.students);
                setTotalBirthdays(data.totalBirthdays);
            })
            .catch((err) => console.error("Error fetching birthdays", err));

        // Fetch today's Teachers birthdays directly
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthdayTeacher/today`, { headers })
            .then((res) => res.json())
            .then((data) => {
                setTeachersBirthdays(data.teachers);
                setTotalTeachersBirthdays(data.totalTeachersBirthdays);
            })
            .catch((err) => console.error("Error fetching birthdays", err));

    }, []);


    // Mark a Student birthday as wished
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

    // Mark a Teacher birthday as wished
    const sendTeacherWish = async (teacherId, phone, name) => {
        try {
            const message = "🎉 Happy Birthday " + name + "! 🎂\n\n" +
                "*New Era Education Point (NEEP)* wishes you a day full of joy, success, and wonderful memories! 🎈✨🎊";
            const encodedMessage = encodeURIComponent(message).replace(/[!'()*]/g, escape);
            const waURL = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodedMessage}`;
            window.open(waURL, "_blank");

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/birthdayTeacher/wish`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ teacherId }),
                }
            );

            const data = await res.json();

            if (data.wished) {
                // Update the state to reflect that the wish has been sent
                setTeachersBirthdays((prev) =>
                    prev.map((s) =>
                        s._id === teacherId ? { ...s, wished: true } : s
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


    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="batches-title">Birthday Alerts ({totalBirthdays + totalTeachersBirthdays})</h2>
                </div>
            </div>

            <div className="birthday-tabs">
                <button
                    className={activeTab === "students" ? "students-btn active" : "students-btn"}
                    onClick={() => setActiveTab("students")}
                >
                    Students ({totalBirthdays})
                </button>
                <button
                    className={activeTab === "teachers" ? "teachers-btn active" : "teachers-btn"}
                    onClick={() => setActiveTab("teachers")}
                >
                    Teachers ({totalTeachersBirthdays})
                </button>
            </div>

            {/* Student Birthdays Tab */}
            {activeTab === "students" && (
                <div className='data-grid-container pt-3' style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", overflowY:"auto"}}>
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
            )}

            {/* Teacher Birthdays Tab */}
            {activeTab === "teachers" && (
                <div className='data-grid-container pt-3' style={{borderTopLeftRadius:"0", borderTopRightRadius:"0"}}>
                    <div className="data-grid">
                        {teachersBirthdays.length > 0 ? (
                            teachersBirthdays
                                .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                                .map((teacher, index) => (
                                    <div className="data-card d-flex justify-content-between align-items-start" key={index} >
                                        <div>
                                            <h5 className="card-title">{teacher.name}</h5>
                                            <span className="card-subtitle">Phone: {teacher.phone}</span>
                                        </div>
                                        <button className="btn btn-success" onClick={() => sendTeacherWish(teacher._id, teacher.phone, teacher.name)} disabled={teacher.wished}>{teacher.wished ? "Wished ✨" : "Send Wishes ✨"}</button>
                                    </div>
                                ))
                        ) : (
                            <p className="no-data">No teacher to be wished.</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    </>)
}
