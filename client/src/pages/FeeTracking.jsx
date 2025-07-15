import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function FeeTracking() {

    const [admin, setAdmin] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [totalUnpaidAmount, setTotalUnpaidAmount] = useState([]);

    const getDaysOverdue = (dueDate) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24)); // days
        return diff > 0 ? `${diff} days ago` : "Due today";
    };


    useEffect(() => {
        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (storedAdmin && token && storedAdmin !== "undefined") {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (err) {
                console.error("Failed to parse admin JSON:", err);
                localStorage.removeItem("admin");
                return;
            }

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/unpaid`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    const sorted = data.sort(
                        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
                    );

                    const totalOutstanding = sorted.reduce(
                        (sum, inst) => sum + (inst.amount || 0),
                        0
                    );

                    setInstallments(sorted);
                    setTotalUnpaidAmount(totalOutstanding);
                })
                .catch(err => console.error("Error loading unpaid installments:", err));
        }
    }, []);


    return (<>
        <Navbar />

        <div className="main-content">
            <h2>Daily Fee Tracking</h2>

            <div className="container mt-4">
                <div className="row justify-content-start gx-4 gy-3">
                    <div className="col-12 col-sm-6 col-md-4">
                        <div className="card text-center p-3 shadow-sm">
                            <h4>Unpaid</h4>
                            <div className="flex mt-3">

                                <div className="mt-3 mb-3">
                                    <span>Outstanding Payment</span>
                                    <h3>₹ {totalUnpaidAmount}</h3>
                                </div>

                                {installments.map((inst) => {
                                    const student = inst.studentId; // directly populated
                                    const name = student?.name || "Unknown";
                                    const className = student?.class || "--";
                                    const amount = inst.amount || 0;

                                    return (
                                        <div key={inst._id} className="student-box width-100 border border-2 border-secondary rounded mt-2">
                                            <Link to={`/student/${student._id}`} className="text-decoration-none text-dark">
                                                <div className="d-flex justify-content-between align-items-start pt-1 ps-2 pe-2">
                                                    <h5>{name}</h5>
                                                    <span>₹ {amount}/-</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-start pb-1 ps-2 pe-2">
                                                    <span>Class: {className}</span>
                                                    <span className="text-danger">{getDaysOverdue(inst.dueDate)}</span>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                        <div className="card text-center p-3 shadow-sm">
                            <h4>Upcoming</h4>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                        <div className="card text-center p-3 shadow-sm">
                            <h4>Paid</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>



        <Footer />
    </>)
}
