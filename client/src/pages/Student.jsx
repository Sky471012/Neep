import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inter28ptRegular } from "../assets/fonts/Inter_28pt-Regular";
import { Inter18ptBold } from "../assets/fonts/Inter_18pt-Bold-bold";
import Navbar from '../components/Navbar';
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import '../css/student.css';

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

    function getBase64FromImagePath(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const base64 = canvas.toDataURL("image/png");
                resolve({ base64, width: img.width, height: img.height });
            };
            img.onerror = (e) => reject(e);
            img.src = path;
        });
    }

    async function generatePDFReceipt(student, record) {
        const { base64: logoBase64, width: originalWidth, height: originalHeight } = await getBase64FromImagePath("/logo_rectagle.jpg");

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

        const imgHeight = 17;
        const scale = imgHeight / originalHeight;
        const imgWidth = originalWidth * scale;
        doc.addImage(logoBase64, "PNG", pageWidth - imgWidth - 20, 15, imgWidth, imgHeight);

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

    if (!student) return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading student data...</p>
            </div>
        </div>
    );

    const totalPaid = Array.isArray(installments)
        ? installments.reduce((sum, inst) => sum + (inst.paidDate ? inst.amount || 0 : 0), 0)
        : 0;

    const totalFee = feeRecord?.totalAmount || 0;
    const balance = totalFee - totalPaid;

    return (<>

        <Navbar />

        <div className="app-container">
            <div className="main-layout">
                {/* Sidebar */}
                <div className="student-sidebar">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="profile-title">{student.name}</h2>
                    </div>

                    {/* Student Details */}
                    <div className="student-details-card">
                        <div className="detail-item">
                            <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <div className="detail-label">Phone: {student.phone}</div>
                        </div>

                        <div className="detail-item">
                            <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                            </svg>
                            <div className="detail-label">DOB: {student.dob}</div>
                        </div>

                        <div className="detail-item">
                            <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            <div className="detail-label">Class: {student.class}</div>
                        </div>

                        <div className="detail-item">
                            <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="detail-value">{student.address}</div>
                        </div>

                        <div className="detail-item">
                            <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                            </svg>
                            <div className="detail-label">Joining Date: {student.dateOfJoining}</div>
                        </div>
                    </div>

                    {/* Fee Details Button */}
                    <button className="fee-button" onClick={() => setShowModalFour(student._id)}>
                        Show Fee Details
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="content-area">
                    {/* Welcome Card */}
                    <div className="welcome-card">
                        <h1 className="welcome-title">Welcome back, {student.name}!</h1>
                        <p className="welcome-subtitle">Manage your academic journey with ease</p>
                    </div>

                    {/* Batches Section */}
                    <div className="batches-section">
                        <div className="batches-header">
                            <h2 className="batches-title">All Batches</h2>
                            <div className="search-container">
                                <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="search"
                                    placeholder="Search batches with name..."
                                    className="search-input"
                                    onChange={(e) => setBatchSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="batches-grid">
                            {batchesRecords.length > 0 ? (
                                batchesRecords
                                    .filter((b) =>
                                        b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
                                    )
                                    .map((batch, index) => (
                                        <div className="batch-card" key={index}>
                                            <div className="batch-header">
                                                <h5 className="batch-name">{batch.batchName}</h5>
                                            </div>

                                            <div className="batch-actions">
                                                <button
                                                    className="action-button attendance"
                                                    onClick={() => setShowModalOne(batch.batchId)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1h-3v2a1 1 0 01-1-1H9a1 1 0 01-1-1v-2H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                                                    </svg>
                                                    Attendance
                                                </button>

                                                <button
                                                    className="action-button tests"
                                                    onClick={() => setShowModalTwo(batch.batchId)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Tests
                                                </button>
                                                
                                                <button
                                                    className="action-button timetable"
                                                    onClick={() => {
                                                        setShowModalThree(batch.batchId);
                                                        fetchTimetable(batch.batchId);
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                                                    </svg>
                                                    Timetable
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="no-batches">
                                    <p>No batches assigned.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Attendance Modal */}
        <ModalOne
            isOpen={showModalOne !== null}
            onClose={() => setShowModalOne(null)}
        >
            {showModalOne && (
                <div id={`carousel-${showModalOne}`} className="carousel slide">
                    <h5 className="modal-title">{batchesRecords.find((b) => b.batchId === showModalOne)?.batchName}</h5>
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
                                    <h6 className="month-title">{month} {calendarYear}</h6>
                                    <div className="calendar-grid">
                                        {[...Array(daysInMonth)].map((_, dateIdx) => {
                                            const date = new Date(calendarYear, calendarMonth, dateIdx + 1);
                                            const fullDate = date.toISOString().split('T')[0];
                                            const key = `${showModalOne}_${fullDate}`;
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

                    <div className="calendar-controls">
                        <button
                            className="calendar-button"
                            type="button"
                            data-bs-target={`#carousel-${showModalOne}`}
                            data-bs-slide="prev"
                        >
                            ‹ Previous
                        </button>
                        <button
                            className="calendar-button"
                            type="button"
                            data-bs-target={`#carousel-${showModalOne}`}
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
            isOpen={showModalTwo !== null}
            onClose={() => setShowModalTwo(null)}
        >
            <div className="test-details">
                <h3 className="modal-title">All Tests of {batchesRecords.find((b) => b.batchId === showModalTwo)?.batchName}</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Date</th>
                            <th>Max Marks</th>
                            <th>Marks Scored</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testRecords
                            .filter(test => test.batchId === showModalTwo)
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
                {testRecords.filter(test => test.batchId === showModalTwo).length === 0 && (
                    <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>No tests found for this batch.</p>
                )}
            </div>
        </ModalTwo>

        {/* Timetable Modal */}
        <ModalThree
            isOpen={showModalThree !== null}
            onClose={() => setShowModalThree(null)}
        >
            <div className="timetable-details">
                <h3 className="modal-title">Timetable for {batchesRecords.find((b) => b.batchId === showModalThree)?.batchName}</h3>
                {timetableRecords[showModalThree]?.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Weekday</th>
                                <th>Time Slots</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...timetableRecords[showModalThree]]
                                .sort((a, b) => weekdayOrder[a.weekday] - weekdayOrder[b.weekday])
                                .map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.weekday}</td>
                                        <td>
                                            {entry.timetable.map((slot, idx) => (
                                                <span key={idx} className="time-slot">
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
                        No timetable found for this batch.
                    </p>
                )}
            </div>
        </ModalThree>

        {/* Fee Table */}
        <ModalFour isOpen={showModalFour === student._id} onClose={() => setShowModalFour(null)}>
            <div className="fee-details">
                <h1 className="modal-title">Fee Details</h1>
                <table className="table">
                    <thead>
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
                                    <td className={record.paidDate ? "text-success" : "text-danger"}>
                                        {status}
                                    </td>
                                    <td>
                                        {record.paidDate ? (
                                            <button
                                                className="download-button"
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
                <div className="fee-summary">
                    <span><strong>Total Fee:</strong> ₹ {totalFee}</span>
                    <span><strong>Paid:</strong> ₹ {totalPaid}</span>
                    <span><strong>Balance:</strong> ₹ {balance}</span>
                </div>
            </div>
        </ModalFour>

    </>);
}