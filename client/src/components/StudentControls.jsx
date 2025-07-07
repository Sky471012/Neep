import React, { useEffect, useState } from "react";
import BatchList from "../modals/BatchList";
import Fee from "../modals/Fee";

export default function StudentControls({ studentsRecords, setStudentsRecords }) {

    const [batches, setBatches] = useState({});
    const [showBatchListFor, setShowBatchListFor] = useState(null);
    const [showFee, setShowFee] = useState(null);
    const [feeStatus, setFeeStatus] = useState(null);

    const jsMonth = new Date().getMonth(); // 0 = Jan ... 11 = Dec
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const now = new Date();
    // Fix: Calculate academic year start based on current month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Jan, 3 = April
    const academicYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        // fetching students batches
        const fetchBatches = async (studentId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/studentBatches/${studentId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching batches");

                setBatches((prev) => ({
                    ...prev,
                    [studentId]: data.batches,
                }));
            } catch (err) {
                console.error(`Error fetching batches for student ${studentId}:`, err);
            }
        };


        // fetching fee details
        const fetchFeeStatus = async (studentId) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/admin/student-fee-status/${studentId}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                const fetchedFeeStatus = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching fee status");

                setFeeStatus((prev) => ({
                    ...prev,
                    [studentId]: fetchedFeeStatus.feeStatus,
                }));

            } catch (err) {
                console.error(`Error fetching feeStatus for student ${studentId}:`, err);
            }

        }


        studentsRecords.forEach((student) => {
            fetchBatches(student._id);
            fetchFeeStatus(student._id);
        });

    }, [studentsRecords]);


    const deleteStudent = async (studentId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/admin/studentDelete/${studentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete student.");
                return;
            }

            alert("Student deleted successfully!");
             // ✅ Remove student from local list without refresh
            const updated = studentsRecords.filter(s => s._id !== studentId);
            setStudentsRecords(updated);


        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong while deleting.");
        }
    };




    return (<>

        <div id="students" className="batches-container">
            <h1>Students</h1>
            <div className="container">
                <div className="row">
                    {studentsRecords.length > 0 ? (
                        studentsRecords.map((student, index) => {
                            const studentId = student._id;

                            return (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{student.name}</h5>
                                        <span>Dob: {student.dob}</span>
                                        <span>Phone: {student.phone}</span>
                                        <span>Joined on: {student.createdAt}</span>
                                        <div className="d-flex gap-3">
                                            <button className="button" onClick={() => setShowBatchListFor(studentId)}>
                                                Show all Batches
                                            </button>
                                            <BatchList
                                                isOpen={showBatchListFor === studentId}
                                                onClose={() => setShowBatchListFor(null)}
                                            >
                                                <div>
                                                    <h3>{student.name}</h3>
                                                    <ul className="mt-2">
                                                        {batches[studentId]?.map((batch) => (
                                                            <li key={batch._id} className="mb-3">
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    <span>{batch.name}</span>
                                                                    <button
                                                                        className="button"
                                                                    >
                                                                        Remove Student
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </BatchList>

                                            <button className="button" onClick={() => setShowFee(studentId)}>
                                                Check Fee status
                                            </button>
                                            <Fee
                                                isOpen={showFee === studentId}
                                                onClose={() => setShowFee(null)}
                                            >
                                                <div className="fee-details">
                                                    <h1>Fee Details</h1>
                                                    <h3>{student.name}</h3>
                                                    <table className="table table-bordered table-striped text-center">
                                                        <thead className="table-dark">
                                                            <tr>
                                                                <th>Month</th>
                                                                <th>Status</th>
                                                                <th>Amount</th>
                                                                <th>Paid On</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {allMonths.map((month, index) => {
                                                                const year = index < 9 ? academicYearStart : academicYearStart + 1;
                                                                const fullMonth = `${month} ${year}`;
                                                                const studentFeeStatus = feeStatus?.[studentId] || [];  // ✅ safe access
                                                                const record = studentFeeStatus.find(r =>
                                                                    r.month.trim().toLowerCase() === fullMonth.trim().toLowerCase()
                                                                );

                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{fullMonth}</td>
                                                                        <td className={record ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                                            {record ? "Paid" : "Pending"}
                                                                        </td>
                                                                        <td>{record ? `₹${record.amount}` : "--"}</td>
                                                                        <td>{record?.paidOn ? new Date(record.paidOn).toLocaleDateString() : "--"}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Fee>


                                        </div>
                                        <div className="d-flex mt-3 gap-3">
                                            <button className="button">Add to a Batch</button>
                                            <button className="button">Update Fee</button>
                                            <button className="btn btn-danger" onClick={() => deleteStudent(student._id)}>Delete Student</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No Students found.</p>
                    )}
                </div>
            </div>
        </div>
    </>)
}
