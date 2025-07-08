import React, { useEffect, useState } from "react";
import BatchList from "../modals/BatchList";
import Fee from "../modals/Fee";
import Batch from "../modals/Batch";
import Student from "../modals/Student";

export default function StudentControls({ studentsRecords, setStudentsRecords }) {
    const [batches, setBatches] = useState({});
    const [showBatchListFor, setShowBatchListFor] = useState(null);
    const [showFee, setShowFee] = useState(null);
    const [feeStatus, setFeeStatus] = useState(null);
    const [openBatchModalFor, setOpenBatchModalFor] = useState(null);
    const [openStudentModalFor, setOpenStudentModalFor] = useState(null);
    const [batchesList, setBatchesList] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState({});

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const academicYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;

    const token = localStorage.getItem("authToken");

    useEffect(() => {

        // fetching all students
        const fetchBatches = async (studentId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/studentBatches/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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

        // fetching students fee
        const fetchFeeStatus = async (studentId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/student-fee-status/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedFeeStatus = await res.json();
                if (!res.ok) throw new Error(fetchedFeeStatus.message || "Error fetching fee status");

                setFeeStatus((prev) => ({
                    ...prev,
                    [studentId]: fetchedFeeStatus.feeStatus,
                }));
            } catch (err) {
                console.error(`Error fetching feeStatus for student ${studentId}:`, err);
            }
        };

        // fetching all batches
        const fetchAllBatches = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/batches`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error fetching batches");

                setBatchesList(data);
            } catch (err) {
                console.error("Error fetching all batches:", err);
            }
        };

        studentsRecords.forEach((student) => {
            fetchBatches(student._id);
            fetchFeeStatus(student._id);
        });

        fetchAllBatches();
    }, [studentsRecords]);

    const deleteStudent = async (studentId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/studentDelete/${studentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to delete student.");

            alert("Student deleted successfully!");
            const updated = studentsRecords.filter(s => s._id !== studentId);
            setStudentsRecords(updated);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong while deleting.");
        }
    };

    const removeStudentFromBatch = async (studentId, batchId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/removeStudent/${studentId}/${batchId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to remove student.");

            setBatches((prev) => ({
                ...prev,
                [studentId]: prev[studentId].filter(b => b._id !== batchId)
            }));
        } catch (error) {
            console.error("Remove error:", error);
            alert("Something went wrong while removing.");
        }
    };

    const addStudentToBatch = async (studentId, batchId) => {
        if (!batchId) return alert("Please select a batch first.");

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/addStudent/${studentId}/${batchId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add student to batch");

            setBatches((prev) => ({
                ...prev,
                [studentId]: [...(prev[studentId] || []), data.batch],
            }));
            setOpenBatchModalFor(null);
        } catch (err) {
            console.error("Error adding student to batch:", err);
            alert("Error adding student to batch");
        }
    };

    const updateFee = async (studentId, month, amount) => {
        if (!month || !amount) return alert("Please select month and enter amount.");

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/admin/update-fee/${studentId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ month, amount }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update fee");

            setOpenStudentModalFor(null);
            // Optional: refetch fee status
            const updatedFeeStatusRes = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/admin/student-fee-status/${studentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedData = await updatedFeeStatusRes.json();
            setFeeStatus((prev) => ({
                ...prev,
                [studentId]: updatedData.feeStatus,
            }));
        } catch (err) {
            console.error("Error updating fee:", err);
            alert("Error updating fee");
        }
    };


    return (
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
                                            <button className="button" onClick={() => setShowBatchListFor(studentId)}>Show all Batches</button>
                                            <BatchList isOpen={showBatchListFor === studentId} onClose={() => setShowBatchListFor(null)}>
                                                <div>
                                                    <h3>{student.name}</h3>
                                                    <ul className="mt-2">
                                                        {batches[studentId]?.map((batch) =>
                                                            batch ? (
                                                                <li key={batch._id} className="mb-3">
                                                                    <div className="d-flex flex-wrap gap-2">
                                                                        <span>{batch.name}</span>
                                                                        <button className="button" onClick={() => removeStudentFromBatch(studentId, batch._id)}>
                                                                            Remove Student
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ) : null // skip if batch is undefined
                                                        )}

                                                    </ul>
                                                </div>
                                            </BatchList>

                                            <button className="button" onClick={() => setShowFee(studentId)}>Check Fee status</button>
                                            <Fee isOpen={showFee === studentId} onClose={() => setShowFee(null)}>
                                                <div className="fee-details">
                                                    <h3>Fee Details</h3>
                                                    <span><b>{student.name}</b></span>
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
                                                            {allMonths.map((month, idx) => {
                                                                const year = idx < 9 ? academicYearStart : academicYearStart + 1;
                                                                const fullMonth = `${month} ${year}`;
                                                                const studentFeeStatus = feeStatus?.[studentId] || [];
                                                                const record = studentFeeStatus.find(r =>
                                                                    r.month.trim().toLowerCase() === fullMonth.trim().toLowerCase()
                                                                );

                                                                return (
                                                                    <tr key={idx}>
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
                                            <button className="button" onClick={() => setOpenBatchModalFor(studentId)}>Add to a Batch</button>
                                            <Batch
                                                isOpen={openBatchModalFor === studentId}
                                                onClose={() => setOpenBatchModalFor(null)}
                                            >
                                                <h3>Adding {student.name} to:</h3>
                                                <div className="input-group mt-3 gap-3">
                                                    <label>Select Batch:</label>
                                                    <select
                                                        className="form-select mt-1"
                                                        value={selectedBatch[student._id] || ""}
                                                        onChange={(e) =>
                                                            setSelectedBatch((prev) => ({
                                                                ...prev,
                                                                [student._id]: e.target.value
                                                            }))
                                                        }
                                                    >
                                                        <option value="">-- Select a Batch --</option>
                                                        {batchesList?.map((batch) => (
                                                            <option key={batch._id} value={batch._id}>
                                                                {batch.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <button
                                                    className="button mt-3"
                                                    onClick={() => addStudentToBatch(studentId, selectedBatch[student._id])}
                                                >
                                                    Add to Batch
                                                </button>
                                            </Batch>



                                            <button className="button" onClick={() => setOpenStudentModalFor(studentId)}>Update Fee</button>
                                            <Student
                                                isOpen={openStudentModalFor === studentId}
                                                onClose={() => setOpenStudentModalFor(null)}
                                            >
                                                <h3>Fee Updation of {student.name}</h3>

                                                <div className="input-group mt-3">
                                                    <label>Enter Amount in Rupees:</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter Amount..."
                                                        className="form-control"
                                                        value={selectedBatch[`${studentId}_amount`] || ""}
                                                        onChange={(e) =>
                                                            setSelectedBatch((prev) => ({
                                                                ...prev,
                                                                [`${studentId}_amount`]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mt-2">Select Month:</label>
                                                    <select
                                                        className="form-select"
                                                        value={selectedBatch[`${studentId}_month`] || ""}
                                                        onChange={(e) =>
                                                            setSelectedBatch((prev) => ({
                                                                ...prev,
                                                                [`${studentId}_month`]: e.target.value,
                                                            }))
                                                        }
                                                    >
                                                        <option value="">-- Select a Month --</option>
                                                        {allMonths.map((month, idx) => {
                                                            const year = idx < 9 ? academicYearStart : academicYearStart + 1;
                                                            const fullMonth = `${month} ${year}`;
                                                            return (
                                                                <option key={fullMonth} value={fullMonth}>
                                                                    {fullMonth}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                <button
                                                    className="button mt-3"
                                                    onClick={() =>
                                                        updateFee(
                                                            studentId,
                                                            selectedBatch[`${studentId}_month`],
                                                            selectedBatch[`${studentId}_amount`]
                                                        )
                                                    }
                                                >
                                                    Update
                                                </button>
                                            </Student>


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
    );
}
