import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inter28ptRegular } from "../assets/fonts/Inter_28pt-Regular";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";

export default function Student() {

    const [student, setStudent] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [timetableRecords, setTimetableRecords] = useState({});
    const [testRecords, setTestRecords] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [showModalOne, setShowModalOne] = useState(null);
    const [showModalTwo, setShowModalTwo] = useState(null);
    const [showModalThree, setShowModalThree] = useState(null);
    const [showModalFour, setShowModalFour] = useState(null);


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

    useEffect(() => {
        const storedStudent = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        console.log(token);

        if (storedStudent && token) {
            setStudent(JSON.parse(storedStudent));

            //fetching batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/batches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(setBatchesRecords)
                .catch(err => console.error("Batches fetch error:", err));


            //fetching attendance
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/attendance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setAttendanceRecords(data);
                    const newMap = {};
                    data.forEach((record) => {
                        // Fix: Ensure proper date formatting
                        const date = new Date(record.date);
                        const formattedDate = date.toISOString().split('T')[0];
                        const key = `${record.batchId}_${formattedDate}`;
                        newMap[key] = record.status;
                    });
                    setAttendanceMap(newMap);
                })
                .catch(err => console.error("Attendance fetch error:", err));

            //fetching test
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/test`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(setTestRecords)
                .catch(err => console.error("Test fetch error:", err));


            //fetching fee
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/fee-status`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(setFeeRecords)
                .catch(err => console.error("Fee status fetch error:", err));
        }
    }, []);

    function fetchTimetable(batchId) {
        const token = localStorage.getItem("authToken");

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/timetable`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batchId })
        })
            .then(res => res.json())
            .then(data => {
                setTimetableRecords(prev => ({
                    ...prev,
                    [batchId]: data
                }));
            })
            .catch(err => console.error("Timetable fetch error:", err));
    }

    function generatePDFReceipt(student, record) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // ✅ Register custom Inter font
        doc.addFileToVFS("Inter-Regular.ttf", Inter28ptRegular);
        doc.addFont("Inter-Regular.ttf", "Inter", "normal");
        doc.setFont("Inter");

        const feeAmount = record.amount || 12000;
        const amountInWords = convertAmountToWords(feeAmount);
        const receiptId = `NEEPed-${record._id?.slice(-4) || Math.floor(Math.random() * 10000)}`;
        const paidDate = record.paidDate || "--";
        const method = record.method || "N/A";

        const alignRight = (text, y) => {
            const textWidth = doc.getTextWidth(text);
            doc.text(text, pageWidth - 20 - textWidth, y);
        };

        // Header
        doc.setFontSize(22);
        doc.text("NEEP", 20, 20);

        doc.setFontSize(12);
        doc.text("Phone: 919313214643", 20, 28);
        doc.text("Email: mohan.mahi13@gmail.com", 20, 34);

        doc.setFontSize(16);
        doc.text("INVOICE", pageWidth / 2, 45, null, null, "center");

        doc.setFontSize(12);
        doc.text(`Payment Method: ${method}`, 20, 55);
        alignRight(`Receipt #: ${receiptId}`, 62);
        alignRight(`Receipt Date: ${paidDate}`, 69);

        alignRight(`Bill to: ${student.name}`, 76);
        alignRight(`Class: ${student.class || "N/A"}`, 83);
        alignRight(`Phone: ${student.phone}`, 90);

        // Table with proper ₹ symbol
        autoTable(doc, {
            startY: 100,
            head: [['# Item & Description', 'Amount']],
            body: [
                [`Installment-${record.installmentNo}_class_${student.class}`, `₹ ${feeAmount}`],
                ['Sub Total', `\u20B9 ${feeAmount}`],
                ['Total', `\u20B9 ${feeAmount}`],
                ['Amount Received', `\u20B9 ${feeAmount}`],
                ['Amount Received in Words:', `${amountInWords}`]
            ],
            styles: {
                font: "Inter",
                fontSize: 12,
                cellPadding: 4
            },
            headStyles: {
                font: "Inter",
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 80, halign: 'right' }
            }
        });


        doc.setDrawColor(0);
        doc.line(20, doc.lastAutoTable.finalY + 5, pageWidth - 20, doc.lastAutoTable.finalY + 5);

        doc.text(`Notes: Received by ${method.toLowerCase()}`, 20, doc.lastAutoTable.finalY + 20);
        doc.setFontSize(10);
        doc.text("This is a computer generated pay receipt and does not require a signature", 20, doc.lastAutoTable.finalY + 30);

        doc.save(`${student.name}_Installment${record.installmentNo}_Receipt.pdf`);
    }

    function convertAmountToWords(amount) {
        const words = {
            1000: "One Thousand",
            12000: "Twelve Thousands",
            14000: "Fourteen Thousands"
        };
        return words[amount] ? `${words[amount]} Rupees only` : `${amount} Rupees only`;
    }

    if (!student) return <p>Loading student data...</p>;


    return (<>

        <Navbar />


        <div className="main-content student-container">

            {/* Student Details */}
            <div className="student-details container card mb-5 p-3">
                <h1>Student details</h1>
                <div className="container">
                    <span>Name : <strong>{student.name}</strong></span><br />
                    <span>Phone : <strong>{student.phone}</strong></span><br />
                    <span>DOB : <strong>{student.dob}</strong></span><br />
                    <span>Class : <strong>{student.class}</strong></span><br />
                    <span>Address : <strong>{student.address}</strong></span><br />
                    <span>Date of Joining : <strong>{student.dateOfJoining}</strong></span><br />
                </div>
            </div>

            {/* Batches with Attendance Calendar */}
            <div className="batches-container">
                <h1>Batches</h1>
                <div className="container">
                    <div className="row">
                        {batchesRecords.length > 0 ? (
                            batchesRecords.map((batch, index) => (
                                <div className="col-12 col-md-6 col-lg-5" key={index}>
                                    <div className="card batch-card mb-3">
                                        <h5 className="card-title">{batch.batchName}</h5>


                                        <div className="d-flex gap-3">
                                            <button className="button" onClick={() => setShowModalOne(batch.batchId)}>
                                                Show Attendance
                                            </button>
                                            <ModalOne
                                                isOpen={showModalOne === batch.batchId}
                                                onClose={() => setShowModalOne(null)}
                                            >
                                                {showModalOne && (
                                                    <div id={`carousel-${batch.batchId}`} className="carousel slide">
                                                        <h5 className="card-title">{batch.batchName}</h5>
                                                        <div className="carousel-inner">
                                                            {allMonths.map((month, idx) => {
                                                                // Fix: Map academic months to calendar months/years
                                                                // Academic year: April(0) to March(11)
                                                                // Calendar mapping: April=3, May=4, ..., Dec=11, Jan=0, Feb=1, Mar=2
                                                                let calendarMonth, calendarYear;

                                                                if (idx <= 8) { // April to December
                                                                    calendarMonth = idx + 3; // April=3, May=4, ..., Dec=11
                                                                    calendarYear = academicYearStart;
                                                                } else { // January to March
                                                                    calendarMonth = idx - 9; // Jan=0, Feb=1, Mar=2
                                                                    calendarYear = academicYearStart + 1;
                                                                }

                                                                const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

                                                                return (
                                                                    <div className={`carousel-item ${idx === activeMonthIndex ? "active" : ""}`} key={month}>
                                                                        <h6>{month} {calendarYear}</h6>
                                                                        <div className="calendar-grid">
                                                                            {[...Array(daysInMonth)].map((_, dateIdx) => {
                                                                                // Fix: Use proper calendar month and year for date construction
                                                                                const date = new Date(calendarYear, calendarMonth, dateIdx + 1);
                                                                                const fullDate = date.toISOString().split('T')[0];
                                                                                const key = `${batch.batchId}_${fullDate}`;
                                                                                const status = attendanceMap[key];

                                                                                return (
                                                                                    <div
                                                                                        key={dateIdx}
                                                                                        className={`date-box ${status === "present"
                                                                                            ? "present"
                                                                                            : status === "absent"
                                                                                                ? "absent"
                                                                                                : ""
                                                                                            }`}
                                                                                        title={`${month} ${dateIdx + 1}, ${calendarYear} - ${status || 'No record'}`}
                                                                                    >
                                                                                        {dateIdx + 1}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Custom Carousel Controls */}
                                                        <div className="calendar-controls d-flex justify-content-between mt-2">
                                                            <button className="btn btn-outline-secondary btn-sm"
                                                                type="button"
                                                                data-bs-target={`#carousel-${batch.batchId}`}
                                                                data-bs-slide="prev">
                                                                ‹ Previous
                                                            </button>
                                                            <button className="btn btn-outline-secondary btn-sm"
                                                                type="button"
                                                                data-bs-target={`#carousel-${batch.batchId}`}
                                                                data-bs-slide="next">
                                                                Next ›
                                                            </button>
                                                        </div>
                                                    </div>

                                                )}
                                            </ModalOne>

                                            <button className="button" onClick={() => setShowModalTwo(batch.batchId)}>
                                                Show all Tests
                                            </button>
                                            <ModalTwo
                                                isOpen={showModalTwo === batch.batchId}
                                                onClose={() => setShowModalTwo(null)}
                                            >
                                                <div className="test-details">
                                                    <h3>All Tests of {batch.batchName}</h3>
                                                    <table className="table table-bordered table-striped text-center mt-3">
                                                        <thead className="table-dark">
                                                            <tr>
                                                                <th>Test Name</th>
                                                                <th>Date</th>
                                                                <th>Max Marks</th>
                                                                <th>Marks Scored</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {testRecords
                                                                .filter(test => test.batchId === batch.batchId)
                                                                .map((test, index) => (
                                                                    <tr key={index}>
                                                                        <td>{test.name}</td>
                                                                        <td>{test.date}</td>
                                                                        <td>{test.maxMarks}</td>
                                                                        <td>{test.marksScored}</td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                    {testRecords.filter(test => test.batchId === batch.batchId).length === 0 && (
                                                        <p>No tests found for this batch.</p>
                                                    )}
                                                </div>
                                            </ModalTwo>

                                            <button
                                                className="button"
                                                onClick={() => {
                                                    setShowModalThree(batch.batchId);
                                                    fetchTimetable(batch.batchId);
                                                }}
                                            >
                                                Show Timetable
                                            </button>
                                            <ModalThree
                                                isOpen={showModalThree === batch.batchId}
                                                onClose={() => setShowModalThree(null)}
                                            >
                                                <div className="timetable-details">
                                                    <h3>Timetable for {batch.batchName}</h3>
                                                    {timetableRecords[batch.batchId]?.length > 0 ? (
                                                        <table className="table table-bordered text-center mt-3">
                                                            <thead className="table-dark">
                                                                <tr>
                                                                    <th>Weekday</th>
                                                                    <th>Time Slots</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {timetableRecords[batch.batchId].map((entry, index) => (
                                                                    <tr key={index}>
                                                                        <td>{entry.weekday}</td>
                                                                        <td>
                                                                            {entry.classTimings.map((slot, idx) => (
                                                                                <div key={idx}>
                                                                                    {slot.startTime} - {slot.endTime}
                                                                                </div>
                                                                            ))}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p>No timetable found for this batch.</p>
                                                    )}
                                                </div>
                                            </ModalThree>
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No batches assigned.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Fee Table */}
            <button className="button" onClick={() => setShowModalFour(student._id)}>
                Show Fee details
            </button>
            <ModalFour isOpen={showModalFour === student._id} onClose={() => setShowModalFour(null)}>
                <div className="fee-details">
                    <h1>Fee Details</h1>
                    <table className="table table-bordered table-striped text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>Installment</th>
                                <th>Due Date</th>
                                <th>Paid Date</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeRecords.map((record, index) => {
                                const status = record.paidDate ? "Paid" : "Due";
                                return (
                                    <tr key={index}>
                                        <td>Installment {record.installmentNo}</td>
                                        <td>{record.dueDate || "--"}</td>
                                        <td>{record.paidDate || "--"}</td>
                                        <td>{record.method || "--"}</td>
                                        <td className={record.paidDate ? "text-success fw-bold" : "text-danger fw-bold"}>
                                            {status}
                                        </td>
                                        <td>
                                            {record.paidDate ? (
                                                <button
                                                    className="button"
                                                    onClick={() => generatePDFReceipt(student, record)}
                                                >
                                                    Download
                                                </button>
                                            ) : "--"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ModalFour>

        </div>


        <Footer />


    </>);
}