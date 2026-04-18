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
    const [upcomingStudents, setUpcomingStudents] = useState([]);
    const [upcomingTeachers, setUpcomingTeachers] = useState([]);
    const [activeTab, setActiveTab] = useState("students");
    const [subTab, setSubTab] = useState("today");
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken")
        const headers = { Authorization: `Bearer ${token}` }

        Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthday/today`, { headers })
                .then((res) => res.json())
                .then((data) => {
                    setBirthdays(data.students);
                    setTotalBirthdays(data.totalBirthdays);
                })
                .catch((err) => console.error("Error fetching birthdays", err)),

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthdayTeacher/today`, { headers })
                .then((res) => res.json())
                .then((data) => {
                    setTeachersBirthdays(data.teachers);
                    setTotalTeachersBirthdays(data.totalTeachersBirthdays);
                })
                .catch((err) => console.error("Error fetching birthdays", err)),

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthday/upcoming`, { headers })
                .then((res) => res.json())
                .then((data) => setUpcomingStudents(data.students || []))
                .catch((err) => console.error("Error fetching upcoming student birthdays", err)),

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/birthdayTeacher/upcoming`, { headers })
                .then((res) => res.json())
                .then((data) => setUpcomingTeachers(data.teachers || []))
                .catch((err) => console.error("Error fetching upcoming teacher birthdays", err)),
        ]).finally(() => setLoading(false));

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


    if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading birthdays...</p></div></div>);

    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex">
                    <h2 className="batches-title">Birthday Alerts</h2>
                </div>
            </div>

            <div className={`birthday-tabs ${activeTab === "students" ? "tabs-student-active" : "tabs-teacher-active"}`}>
                <button
                    className={activeTab === "students" ? "students-btn active" : "students-btn"}
                    onClick={() => { setActiveTab("students"); setSubTab("today"); }}
                >
                    Students ({totalBirthdays + upcomingStudents.length})
                </button>
                <button
                    className={activeTab === "teachers" ? "teachers-btn active" : "teachers-btn"}
                    onClick={() => { setActiveTab("teachers"); setSubTab("today"); }}
                >
                    Teachers ({totalTeachersBirthdays + upcomingTeachers.length})
                </button>
            </div>

            {/* Secondary Tabs */}
            <div className={`birthday-sub-tabs ${activeTab === "students" ? "sub-tabs-student" : "sub-tabs-teacher"}`}>
                <button
                    className={subTab === "today" ? "sub-tab sub-tab-today active" : "sub-tab sub-tab-today"}
                    onClick={() => setSubTab("today")}
                >
                    Today ({activeTab === "students" ? birthdays.length : teachersBirthdays.length})
                </button>
                <button
                    className={subTab === "upcoming" ? "sub-tab sub-tab-upcoming active" : "sub-tab sub-tab-upcoming"}
                    onClick={() => setSubTab("upcoming")}
                >
                    Upcoming ({activeTab === "students" ? upcomingStudents.length : upcomingTeachers.length})
                </button>
            </div>

            {/* ===== STUDENTS TAB ===== */}
            {activeTab === "students" && subTab === "today" && (
                <div className='data-grid-container pt-3 birthday-content-student' style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", overflowY:"auto"}}>
                    <div className="data-grid">
                        {birthdays.length > 0 ? (
                            birthdays
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((student) => (
                                    <div className="data-card d-flex justify-content-between align-items-start" key={student._id} >
                                        <div>
                                            <h5 className="card-title">{student.name}</h5>
                                            <span className="card-subtitle">Class: {student.class}</span>
                                        </div>
                                        <button className="btn btn-success" onClick={() => sendWish(student._id, student.phone, student.name)} disabled={student.wished}>{student.wished ? "Wished ✨" : "Send Wishes ✨"}</button>
                                    </div>
                                ))
                        ) : (
                            <p className="no-data">No student birthdays today.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "students" && subTab === "upcoming" && (
                <div className='data-grid-container pt-3 birthday-content-student' style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", overflowY:"auto"}}>
                    <div className="data-grid">
                        {upcomingStudents.length > 0 ? (
                            upcomingStudents.map((student) => (
                                    <div className="data-card" key={student._id}>
                                        <h5 className="card-title">{student.name}</h5>
                                        <span className="card-subtitle">Class: {student.class}</span>
                                        <span className="card-subtitle" style={{ marginTop: "4px" }}>DOB: {student.dob}</span>
                                    </div>
                                ))
                        ) : (
                            <p className="no-data">No student birthdays in the next 7 days.</p>
                        )}
                    </div>
                </div>
            )}

            {/* ===== TEACHERS TAB ===== */}
            {activeTab === "teachers" && subTab === "today" && (
                <div className='data-grid-container pt-3 birthday-content-teacher' style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", overflowY:"auto"}}>
                    <div className="data-grid">
                        {teachersBirthdays.length > 0 ? (
                            teachersBirthdays
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((teacher) => (
                                    <div className="data-card d-flex justify-content-between align-items-start" key={teacher._id} >
                                        <div>
                                            <h5 className="card-title">{teacher.name}</h5>
                                            <span className="card-subtitle">Phone: {teacher.phone}</span>
                                        </div>
                                        <button className="btn btn-success" onClick={() => sendTeacherWish(teacher._id, teacher.phone, teacher.name)} disabled={teacher.wished}>{teacher.wished ? "Wished ✨" : "Send Wishes ✨"}</button>
                                    </div>
                                ))
                        ) : (
                            <p className="no-data">No teacher birthdays today.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "teachers" && subTab === "upcoming" && (
                <div className='data-grid-container pt-3 birthday-content-teacher' style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", overflowY:"auto"}}>
                    <div className="data-grid">
                        {upcomingTeachers.length > 0 ? (
                            upcomingTeachers.map((teacher) => (
                                    <div className="data-card" key={teacher._id}>
                                        <h5 className="card-title">{teacher.name}</h5>
                                        <span className="card-subtitle">Phone: {teacher.phone}</span>
                                        <span className="card-subtitle" style={{ marginTop: "4px" }}>DOB: {teacher.dob}</span>
                                    </div>
                                ))
                        ) : (
                            <p className="no-data">No teacher birthdays in the next 7 days.</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    </>)
}
