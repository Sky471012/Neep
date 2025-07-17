import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ExcelUpload from '../components/ExcelUpload';

export default function FeeTracking() {

    const [admin, setAdmin] = useState(null);
    const [unpaidInstallments, setUnpaidInstallments] = useState([]);
    const [totalUnpaidAmount, setTotalUnpaidAmount] = useState([]);
    const [upcomingInstallments, setUpcomingInstallments] = useState([]);
    const [totalUpcomingAmount, setTotalUpcomingAmount] = useState([]);
    const [paidInstallments, setPaidInstallments] = useState([]);
    const [totalPaidAmount, setTotalPaidAmount] = useState([]);
    const [selectedUnpaidClass, setSelectedUnpaidClass] = useState(null);
    const [selectedUpcomingClass, setSelectedUpcomingClass] = useState(null);
    const [selectedPaidClass, setSelectedPaidClass] = useState(null);

    const [unpaidSortOrder, setUnpaidSortOrder] = useState("asc");
    const [upcomingSortOrder, setUpcomingSortOrder] = useState("asc");
    const [paidSortOrder, setPaidSortOrder] = useState("asc");


    const getDaysOverdue = (dueDate) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24)); // days
        return diff > 0 ? `${diff} days ago` : "Due today";
    };

    function getDaysLeft(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);

        // Clear time components for accurate day difference
        now.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffInMs = due - now;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Due today";
        if (diffInDays === 1) return "Due tomorrow";
        return `${diffInDays} days left`;
    }

    function getDaysSincePaid(paidDate) {
        if (!paidDate) return "Not Paid";

        const paid = new Date(paidDate);
        const today = new Date();

        // Clear time part
        paid.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffInMs = today - paid;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return diffInDays === 0
            ? "Paid today"
            : `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const sortInstallments = (data, order) => {
        return [...data].sort((a, b) =>
            order === "asc"
                ? new Date(a.dueDate) - new Date(b.dueDate)
                : new Date(b.dueDate) - new Date(a.dueDate)
        );
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

            // ferching unpaid installments
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

                    setUnpaidInstallments(sorted);
                    setTotalUnpaidAmount(totalOutstanding);
                })
                .catch(err => console.error("Error loading unpaid installments:", err));

            // ferching upcoming installments
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/upcoming`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    const sorted = data.sort(
                        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
                    );

                    const totalUpcoming = sorted.reduce(
                        (sum, inst) => sum + (inst.amount || 0),
                        0
                    );

                    setUpcomingInstallments(sorted);
                    setTotalUpcomingAmount(totalUpcoming);
                })
                .catch(err => console.error("Error loading upcoming installments:", err));

            // ferching paid installments
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/paid`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    const sorted = data.installments.sort(
                        (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
                    );

                    const totalPaid = sorted.reduce(
                        (sum, inst) => sum + (inst.amount || 0),
                        0
                    );

                    setPaidInstallments(sorted);
                    setTotalPaidAmount(totalPaid);
                })
                .catch(err => console.error("Error loading paid installments:", err));
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

                                <div className='d-flex justify-content-between align-items-center'>
                                    <span>Installments</span>
                                    <div className="dropdown">
                                        <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                                            Filter <i className="bi bi-funnel"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow">
                                            <li>
                                                <button className="dropdown-item" onClick={() => {
                                                    const sorted = sortInstallments(unpaidInstallments, "asc");
                                                    setUnpaidInstallments(sorted);
                                                    setUnpaidSortOrder("asc");
                                                }}>
                                                    Oldest First
                                                </button>
                                            </li>
                                            <li>
                                                <button className="dropdown-item" onClick={() => {
                                                    const sorted = sortInstallments(unpaidInstallments, "desc");
                                                    setUnpaidInstallments(sorted);
                                                    setUnpaidSortOrder("desc");
                                                }}>
                                                    Newest First
                                                </button>
                                            </li>
                                            <li>
                                                <div className="dropdown-item">
                                                    Filter by Class:
                                                    <ul className="list-unstyled ms-2 mt-1">
                                                        {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(cls => (
                                                            <li key={cls}>
                                                                <button
                                                                    className="btn btn-sm text-start"
                                                                    onClick={() => setSelectedUnpaidClass(cls)}
                                                                >
                                                                    {cls}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li>
                                                            <button
                                                                className="btn btn-sm text-start text-danger"
                                                                onClick={() => setSelectedUnpaidClass(null)}
                                                            >
                                                                Clear Filter
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>


                                {unpaidInstallments
                                    .filter(inst => !selectedUnpaidClass || inst.studentId?.class === selectedUnpaidClass)
                                    .map(inst => {
                                        const student = inst.studentId;
                                        const name = student?.name || "Unknown";
                                        const className = student?.class || "--";
                                        const amount = inst.amount || 0;
                                        const num = inst.installmentNo || 0;

                                        return (
                                            <div key={inst._id} className="student-box width-100 border border-2 border-secondary rounded mt-2">
                                                <Link to={`/student/${student._id}`} className="text-decoration-none text-dark">
                                                    <div className="d-flex justify-content-between align-items-start pt-1 ps-2 pe-2">
                                                        <h5>{name}</h5>
                                                        <span>₹ {amount}/-</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-start pb-1 ps-2 pe-2">
                                                        <span>Class: {className}</span>
                                                        <span>Installment #: {num}</span>
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
                            <div className="flex mt-3">

                                <div className="mt-3 mb-3">
                                    <span>Upcoming Payment</span>
                                    <h3>₹ {totalUpcomingAmount}</h3>
                                </div>

                                <div className='d-flex justify-content-between align-items-center'>
                                    <span>Installments</span>
                                    <div className="dropdown">
                                        <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                                            Filter <i className="bi bi-funnel"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow">
                                            <li>
                                                <button className="dropdown-item" onClick={() => {
                                                    const sorted = sortInstallments(upcomingInstallments, "asc");
                                                    setUpcomingInstallments(sorted);
                                                    setUpcomingSortOrder("asc");
                                                }}>
                                                    Oldest First
                                                </button>
                                            </li>
                                            <li>
                                                <button className="dropdown-item" onClick={() => {
                                                    const sorted = sortInstallments(upcomingInstallments, "desc");
                                                    setUpcomingInstallments(sorted);
                                                    setUpcomingSortOrder("desc");
                                                }}>
                                                    Newest First
                                                </button>
                                            </li>
                                            <li>
                                                <div className="dropdown-item">
                                                    Filter by Class:
                                                    <ul className="list-unstyled ms-2 mt-1">
                                                        {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(cls => (
                                                            <li key={cls}>
                                                                <button
                                                                    className="btn btn-sm text-start"
                                                                    onClick={() => setSelectedUpcomingClass(cls)}
                                                                >
                                                                    {cls}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li>
                                                            <button
                                                                className="btn btn-sm text-start text-danger"
                                                                onClick={() => setSelectedUpcomingClass(null)}
                                                            >
                                                                Clear Filter
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {upcomingInstallments
                                .filter(inst => !selectedUpcomingClass || inst.studentId?.class === selectedUpcomingClass)
                                .map((inst) => {
                                    const student = inst.studentId; // directly populated
                                    const name = student?.name || "Unknown";
                                    const className = student?.class || "--";
                                    const amount = inst.amount || 0;
                                    const num = inst.installmentNo || 0;

                                    return (
                                        <div key={inst._id} className="student-box width-100 border border-2 border-secondary rounded mt-2">
                                            <Link to={`/student/${student._id}`} className="text-decoration-none text-dark">
                                                <div className="d-flex justify-content-between align-items-start pt-1 ps-2 pe-2">
                                                    <h5>{name}</h5>
                                                    <span>₹ {amount}/-</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-start pb-1 ps-2 pe-2">
                                                    <span>Class: {className}</span>
                                                    <span>Installment #: {num}</span>
                                                    <span className="text-primary">{getDaysLeft(inst.dueDate)}</span>
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
                            <h4>Paid</h4>
                            <div className="flex mt-3">

                                <div className="mt-3 mb-3">
                                    <span>Earned Payment</span>
                                    <h3>₹ {totalPaidAmount}</h3>
                                </div>

                                <div className='d-flex justify-content-between align-items-center'>
                                    <span>Installments</span>
                                    <div className="dropdown">
                                        <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                                            Filter <i className="bi bi-funnel"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow">
                                            <li>
                                                <button className="dropdown-item" onClick={() => {
                                                    const sorted = sortInstallments(paidInstallments, "asc");
                                                    setPaidInstallments(sorted);
                                                    setPaidSortOrder("asc");
                                                }}>
                                                    Oldest First
                                                </button>
                                            </li>
                                            <li>
                                                <button className="dropdown-item" onClick={() => {
                                                    const sorted = sortInstallments(paidInstallments, "desc");
                                                    setPaidInstallments(sorted);
                                                    setPaidSortOrder("desc");
                                                }}>
                                                    Newest First
                                                </button>
                                            </li>
                                            <li>
                                                <div className="dropdown-item">
                                                    Filter by Class:
                                                    <ul className="list-unstyled ms-2 mt-1">
                                                        {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(cls => (
                                                            <li key={cls}>
                                                                <button
                                                                    className="btn btn-sm text-start"
                                                                    onClick={() => setSelectedPaidClass(cls)}
                                                                >
                                                                    {cls}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li>
                                                            <button
                                                                className="btn btn-sm text-start text-danger"
                                                                onClick={() => setSelectedPaidClass(null)}
                                                            >
                                                                Clear Filter
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {paidInstallments
                                .filter(inst => !selectedPaidClass || inst.studentId?.class === selectedPaidClass)
                                .map((inst) => {
                                    const student = inst.studentId; // directly populated
                                    const name = student?.name || "Unknown";
                                    const className = student?.class || "--";
                                    const amount = inst.amount || 0;
                                    const num = inst.installmentNo || 0;

                                    return (
                                        <div key={inst._id} className="student-box width-100 border border-2 border-secondary rounded mt-2">
                                            <Link to={`/student/${student._id}`} className="text-decoration-none text-dark">
                                                <div className="d-flex justify-content-between align-items-start pt-1 ps-2 pe-2">
                                                    <h5>{name}</h5>
                                                    <span>₹ {amount}/-</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-start pb-1 ps-2 pe-2">
                                                    <span>Class: {className}</span>
                                                    <span>Installment #: {num}</span>
                                                    <span className="text-success">{getDaysSincePaid(inst.paidDate)}</span>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>


        <ExcelUpload />


        <Footer />
    </>)
}
