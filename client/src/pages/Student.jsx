import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inter28ptRegular } from "../assets/fonts/Inter_28pt-Regular";
import { Inter18ptBold } from "../assets/fonts/Inter_18pt-Bold-bold";
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
    const [feeRecord, setFeeRecord] = useState([]);
    const [installments, setInstallments] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [showModalOne, setShowModalOne] = useState(null);
    const [showModalTwo, setShowModalTwo] = useState(null);
    const [showModalThree, setShowModalThree] = useState(null);
    const [showModalFour, setShowModalFour] = useState(null);
    const [batchSearch, setBatchSearch] = useState("");


    const jsMonth = new Date().getMonth(); // 0 = Jan ... 11 = Dec
    const activeMonthIndex = jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const weekdayOrder = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7
    };


    const now = new Date();
    // Fix: Calculate academic year start based on current month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Jan, 3 = April
    const academicYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;

    function formatDate(dateStr) {
        if (!dateStr) return "--";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

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
                .then(data => {
                    setFeeRecord(data.fee || null);
                    setInstallments(Array.isArray(data.installments) ? data.installments : []);
                })
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
        doc.addFileToVFS("Inter-Bold.ttf", Inter18ptBold);
        doc.addFont("Inter-Regular.ttf", "Inter", "normal");
        doc.addFont("Inter-Bold.ttf", "Inter", "bold");
        doc.setFont("Inter");

        const feeAmount = record.amount || 12000;
        const amountInWords = convertAmountToWords(feeAmount);
        const receiptId = `NEEPed-${record._id?.slice(-4) || Math.floor(Math.random() * 10000)}`;
        const paidDate = formatDate(record.paidDate);

        const method = record.method || "N/A";

        const alignRight = (text, y) => {
            const textWidth = doc.getTextWidth(text);
            doc.text(text, pageWidth - 20 - textWidth, y);
        };

        // Header
        doc.setFontSize(16);
        doc.setFont("Inter", "bold");
        doc.text("Mr. Mohan Verma", 20, 20);

        doc.setFontSize(12);
        doc.setFont("Inter", "normal");
        doc.text("Managing Director", 20, 24);
        doc.text("Phone: +91 9313214643", 20, 32);
        doc.text("+91 9891214643", 34, 37);
        doc.text("Email: neep.md@gmail.com", 20, 42);

        doc.setFontSize(16);
        doc.setFont("Inter", "bold");
        doc.text("INVOICE", pageWidth / 2, 51, null, null, "center");

        doc.setFontSize(12);
        doc.setFont("Inter", "normal");
        doc.text(`Payment Method: ${method}`, 20, 61);
        alignRight(`Receipt #: ${receiptId}`, 68);
        alignRight(`Receipt Date: ${paidDate}`, 75);

        alignRight(`Bill to: ${student.name}`, 82);
        alignRight(`Class: ${student.class || "N/A"}`, 89);
        alignRight(`Phone: ${student.phone}`, 96);

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
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
            'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
            'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const b = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
            'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];

        function numToWords(n) {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
            if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
            if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
            return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
        }

        const numberPart = Math.floor(amount);
        const decimalPart = Math.round((amount - numberPart) * 100);

        let words = numToWords(numberPart) + ' Rupees';
        if (decimalPart > 0) {
            words += ' and ' + numToWords(decimalPart) + ' Paise';
        }
        return words + ' only';
    }

    if (!student) return <p>Loading student data...</p>;

    const totalPaid = Array.isArray(installments)
        ? installments.reduce((sum, inst) => sum + (inst.paidDate ? inst.amount || 0 : 0), 0)
        : 0;

    const totalFee = feeRecord?.totalAmount || 0;
    const balance = totalFee - totalPaid;

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
                <button className="button" onClick={() => setShowModalFour(student._id)}>
                    Show Fee details
                </button>
            </div>

            {/* Batches with Attendance Calendar */}
            <div className="batches-container">
                <div className="container d-flex justify-content-between align-items-center mb-3">
                    <h2>All Batches</h2>
                    <input
                        type="search"
                        placeholder="Search batches with name..."
                        className="form-control w-50"
                        onChange={(e) => setBatchSearch(e.target.value)}
                    />
                </div>

                <div className="container">
                    <div className="row">
                        {batchesRecords.length > 0 ? (
                            batchesRecords
                                .filter((b) =>
                                    b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
                                )
                                .map((batch, index) => (
                                    <div className="col-12 col-sm-6 col-lg-4" key={index}>
                                        <div className="card batch-card mb-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h5 className="card-title mt-1">{batch.batchName}</h5>

                                                <div className="dropdown ms-auto">
                                                    <button
                                                        className="btn btn-sm"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <h5>⋮</h5>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow">
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setShowModalThree(batch.batchId);
                                                                    fetchTimetable(batch.batchId);
                                                                }}
                                                            >
                                                                Show Timetable
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => setShowModalOne(batch.batchId)}
                                                            >
                                                                Show Attendance
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => setShowModalTwo(batch.batchId)}
                                                            >
                                                                Show All Tests
                                                            </button>
                                                        </li>
                                                    </ul>

                                                    {/* Attendance Modal */}
                                                    <ModalOne
                                                        isOpen={showModalOne === batch.batchId}
                                                        onClose={() => setShowModalOne(null)}
                                                    >
                                                        {showModalOne && (
                                                            <div id={`carousel-${batch.batchId}`} className="carousel slide">
                                                                <h5 className="card-title">{batch.batchName}</h5>
                                                                <div className="carousel-inner">
                                                                    {allMonths.map((month, idx) => {
                                                                        let calendarMonth, calendarYear;
                                                                        if (idx <= 8) {
                                                                            calendarMonth = idx + 3;
                                                                            calendarYear = academicYearStart;
                                                                        } else {
                                                                            calendarMonth = idx - 9;
                                                                            calendarYear = academicYearStart + 1;
                                                                        }
                                                                        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

                                                                        return (
                                                                            <div
                                                                                className={`carousel-item ${idx === activeMonthIndex ? "active" : ""}`}
                                                                                key={month}
                                                                            >
                                                                                <h6>{month} {calendarYear}</h6>
                                                                                <div className="calendar-grid">
                                                                                    {[...Array(daysInMonth)].map((_, dateIdx) => {
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

                                                                <div className="calendar-controls d-flex justify-content-between mt-2">
                                                                    <button
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        type="button"
                                                                        data-bs-target={`#carousel-${batch.batchId}`}
                                                                        data-bs-slide="prev"
                                                                    >
                                                                        ‹ Previous
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        type="button"
                                                                        data-bs-target={`#carousel-${batch.batchId}`}
                                                                        data-bs-slide="next"
                                                                    >
                                                                        Next ›
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </ModalOne>

                                                    {/* Tests Modal */}
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

                                                    {/* Timetable Modal */}
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
                                                                        {[...timetableRecords[batch.batchId]]
                                                                            .sort((a, b) => weekdayOrder[a.weekday] - weekdayOrder[b.weekday])
                                                                            .map((entry, index) => (
                                                                                <tr key={index}>
                                                                                    <td>{entry.weekday}</td>
                                                                                    <td>
                                                                                        {entry.timetable.map((slot, idx) => (
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
                                    </div>
                                ))
                        ) : (
                            <p>No batches assigned.</p>
                        )}
                    </div>
                </div>
            </div>


            {/* Fee Table */}
            <ModalFour isOpen={showModalFour === student._id} onClose={() => setShowModalFour(null)}>
                <div className="fee-details">
                    <h1>Fee Details</h1>
                    <table className="table table-bordered table-striped text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>Installment</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Paid Date</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(installments) && installments.map((record, index) => {
                                const status = record.paidDate ? "Paid" : "Due";
                                return (
                                    <tr key={index}>
                                        <td>Installment {record.installmentNo}</td>
                                        <td>{record.amount || "--"}</td>
                                        <td>{formatDate(record.dueDate)}</td>
                                        <td>{formatDate(record.paidDate)}</td>
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
                    <div className="d-flex gap-4 mt-3" style={{ fontSize: "1.5rem" }}>
                        <span><strong>Total Fee:</strong> ₹ {totalFee}</span>
                        <span><strong>Paid:</strong> ₹ {totalPaid}</span>
                        <span><strong>Balance:</strong> ₹ {balance}</span>
                    </div>
                </div>
            </ModalFour>

        </div>


        <Footer />


    </>);
}