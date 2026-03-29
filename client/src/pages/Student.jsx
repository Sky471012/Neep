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
    const [loading, setLoading] = useState(true);


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

    // Parse date strings used in tests. Accepts dd-MM-yyyy or ISO-like strings.
    // Returns milliseconds since epoch, or Infinity when invalid/missing so they sort last.
    function parseDateToTime(dateStr) {
        if (!dateStr) return Infinity;
        // dd-mm-yyyy (e.g. 05-11-2025)
        const ddmmyyyy = /^([0-3]?\d)-([0-1]?\d)-(\d{4})$/;
        const m = String(dateStr).trim().match(ddmmyyyy);
        if (m) {
            const dd = Number(m[1]);
            const mm = Number(m[2]);
            const yyyy = Number(m[3]);
            const dt = new Date(yyyy, mm - 1, dd);
            return isNaN(dt.getTime()) ? Infinity : dt.getTime();
        }

        // Try native parse for ISO or other formats
        const parsed = Date.parse(dateStr);
        return isNaN(parsed) ? Infinity : parsed;
    }

    useEffect(() => {
        const storedStudent = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        const branch = localStorage.getItem("branch");

        if (storedStudent && token) {
            setStudent(JSON.parse(storedStudent));

            Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/batches`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(setBatchesRecords)
                    .catch(err => console.error("Batches fetch error:", err)),

                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/attendance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        setAttendanceRecords(data);
                        const newMap = {};
                        data.forEach((record) => {
                            const date = new Date(record.date);
                            const formattedDate = date.toISOString().split('T')[0];
                            const key = `${record.batchId}_${formattedDate}`;
                            newMap[key] = record.status;
                        });
                        setAttendanceMap(newMap);
                    })
                    .catch(err => console.error("Attendance fetch error:", err)),

                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/test`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(setTestRecords)
                    .catch(err => console.error("Test fetch error:", err)),

                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/fee-status`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                    .then(res => res.json())
                    .then(data => {
                        setFeeRecord(data.fee || null);
                        setInstallments(Array.isArray(data.installments) ? data.installments : []);
                    })
                    .catch(err => console.error("Fee status fetch error:", err)),
            ]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [localStorage.getItem("branch")]);

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
        const { base64: logoBase64, width: originalWidth, height: originalHeight } = await getBase64FromImagePath("/logo_rectangle.jpg");

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
        doc.text("This is a computer generated pay receipt and does not require a signature.", 20, doc.lastAutoTable.finalY + 30);
        doc.text("The submitted fee will not be subject to refund or adjustment.", 20, doc.lastAutoTable.finalY + 37);

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

    if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading student data...</p></div></div>);

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

                        <div className="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4" fill="currentColor">
                                <path d="M320 32C342.1 32 360 49.9 360 72C360 94.1 342.1 112 320 112C297.9 112 280 94.1 280 72C280 49.9 297.9 32 320 32zM40 128C62.1 128 80 145.9 80 168L80 328.2C80 345.2 86.7 361.5 98.7 373.5L149.8 424.6C158.1 432.9 171.1 434.2 180.8 427.7C193.7 419.1 195.5 400.8 184.5 389.9C177.2 382.6 161.4 366.8 137.3 342.7C124.8 330.2 124.8 309.9 137.3 297.4C149.8 284.9 170.1 284.9 182.6 297.4C206.7 321.5 222.5 337.3 229.8 344.6L229.8 344.6L255.1 369.9C276.1 390.9 287.9 419.4 287.9 449.1L287.9 528C287.9 554.5 266.4 576 239.9 576L173.2 576C156.2 576 139.9 569.3 127.9 557.3L28.1 457.4C10.1 439.4 0 415 0 389.5L0 168C0 145.9 17.9 128 40 128zM600 128C622.1 128 640 145.9 640 168L640 389.5C640 415 629.9 439.4 611.9 457.4L512 557.3C500 569.3 483.7 576 466.7 576L400 576C373.5 576 352 554.5 352 528L352 449.1C352 419.4 363.8 390.9 384.8 369.9L410.1 344.6L410.1 344.6C417.4 337.3 433.2 321.5 457.3 297.4C469.8 284.9 490.1 284.9 502.6 297.4C515.1 309.9 515.1 330.2 502.6 342.7C478.5 366.8 462.7 382.6 455.4 389.9C444.4 400.9 446.2 419.1 459.1 427.7C468.8 434.2 481.8 432.9 490.1 424.6L541.2 373.5C553.2 361.5 559.9 345.2 559.9 328.2L560 168C560 145.9 577.9 128 600 128zM384.5 213L364.7 196.3L375.8 285.1C377.4 298.3 368.1 310.2 355 311.9C341.9 313.6 329.9 304.2 328.2 291.1L323.8 256.1L316.2 256.1L311.8 291.1C310.2 304.3 298.2 313.6 285 311.9C271.8 310.2 262.5 298.3 264.2 285.1L275.3 196.3L255.5 213C245.4 221.6 230.2 220.3 221.7 210.2C213.2 200.1 214.4 184.9 224.5 176.4L252.4 152.8C271.3 136.8 295.3 128 320 128C344.7 128 368.7 136.8 387.6 152.7L415.5 176.3C425.6 184.9 426.9 200 418.3 210.1C409.7 220.2 394.6 221.5 384.5 212.9z" />
                            </svg>
                            <div className="detail-label">Guardian: {student.guardianName || "NA"}</div>
                        </div>

                        <div className="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="w-4 h-4">
                                <path d="M32 256C32 220.7 60.7 192 96 192L160 192L287.9 76.9C306.2 60.5 333.9 60.5 352.1 76.9L480 192L544 192C579.3 192 608 220.7 608 256L608 512C608 547.3 579.3 576 544 576L96 576C60.7 576 32 547.3 32 512L32 256zM256 440L256 528L384 528L384 440C384 417.9 366.1 400 344 400L296 400C273.9 400 256 417.9 256 440zM144 448C152.8 448 160 440.8 160 432L160 400C160 391.2 152.8 384 144 384L112 384C103.2 384 96 391.2 96 400L96 432C96 440.8 103.2 448 112 448L144 448zM160 304L160 272C160 263.2 152.8 256 144 256L112 256C103.2 256 96 263.2 96 272L96 304C96 312.8 103.2 320 112 320L144 320C152.8 320 160 312.8 160 304zM528 448C536.8 448 544 440.8 544 432L544 400C544 391.2 536.8 384 528 384L496 384C487.2 384 480 391.2 480 400L480 432C480 440.8 487.2 448 496 448L528 448zM544 304L544 272C544 263.2 536.8 256 528 256L496 256C487.2 256 480 263.2 480 272L480 304C480 312.8 487.2 320 496 320L528 320C536.8 320 544 312.8 544 304zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z" />
                            </svg>
                            <div className="detail-label">School: {student.schoolType || "NA"}</div>
                        </div>

                    </div>

                    {/* Fee Details Button */}
                    <button className="fee-button" onClick={() => setShowModalFour(student._id)}>
                        Show Fee Details
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="content-area pb-5">
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

        <a
            href={`https://wa.me/919313214643`}
            target="_blank"
            rel="noopener noreferrer"
            className='whatsapp-link'
            style={{ borderRadius: "10px", fontSize: "20px", right: "20px", left: "auto" }}
        >
            <i className="bi bi-whatsapp me-1"></i><span style={{}}>Need Help</span>
        </a>

        {/* Attendance Modal */}
        <ModalOne
            isOpen={showModalOne !== null}
            onClose={() => setShowModalOne(null)}
        >
            {showModalOne && (<>
                <h3 className="modal-title mb-0">{batchesRecords.find((b) => b.batchId === showModalOne)?.batchName}</h3>
                <div id={`carousel-${showModalOne}`} className="carousel slide p-1 mt-2" style={{ backgroundColor: "#d4d4d4ff" }}>
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
                            className="calendar-button ms-1 mb-1"
                            type="button"
                            data-bs-target={`#carousel-${showModalOne}`}
                            data-bs-slide="prev"
                        >
                            ‹ Previous
                        </button>
                        <button
                            className="calendar-button mb-1 me-1"
                            type="button"
                            data-bs-target={`#carousel-${showModalOne}`}
                            data-bs-slide="next"
                        >
                            Next ›
                        </button>
                    </div>
                </div>
            </>)}
        </ModalOne>

        {/* Tests Modal */}
        <ModalTwo
            isOpen={showModalTwo !== null}
            onClose={() => setShowModalTwo(null)}
        >
            <div className="test-details">
                <h3 className="modal-title">
                    All Tests of {batchesRecords.find((b) => b.batchId === showModalTwo)?.batchName}
                </h3>
                <table className="table table-colored">
                    <thead>
                        <tr>
                            <th style={{ padding: "10px 20px" }}>Test Name</th>
                            <th style={{ padding: "10px 20px" }}>Date</th>
                            <th style={{ padding: "10px 20px" }}>Max Marks</th>
                            <th style={{ padding: "10px 20px" }}>Marks Scored</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testRecords
                                    .filter(test => test.batchId === showModalTwo)
                                    .sort((a, b) => parseDateToTime(a.date) - parseDateToTime(b.date))
                                    .map((test, index) => (
                                <tr key={index}>
                                    <td>{test.name}</td>
                                    <td>{test.date}</td>
                                    <td>{test.maxMarks}</td>
                                    <td>
                                        {test.absent
                                            ? <span style={{ color: "red" }}>-AB-</span>
                                            : test.marksScored}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {testRecords.filter(test => test.batchId === showModalTwo).length === 0 && (
                    <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
                        No tests found for this batch.
                    </p>
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
                    <div style={{ maxHeight: "67vh", overflowY: "auto" }}>
                        <table className="table table-colored">
                            <thead>
                                <tr>
                                    <th style={{ padding: "10px 20px" }}>Weekday</th>
                                    <th style={{ padding: "10px 20px" }}>Time Slots</th>
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
                                                    <>
                                                        <span key={idx} className="time-slot">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span><br />
                                                    </>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
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
                <h3 className="modal-title">Fee Details</h3>
                <div className="fee-summary mb-3">
                    <span>Total Fee:<strong> ₹ {totalFee}</strong></span>
                    <span>Paid:<strong> ₹ {totalPaid}</strong></span>
                    <span>Balance:<strong> ₹ {balance}</strong></span>
                </div>
                <div className="flex fee-flex" style={{ maxHeight: "55vh", overflowY: "auto" }}>
                    {Array.isArray(installments) && installments.map((record, index) => {
                        const status = record.paidDate ? "Paid" : "Due";
                        const isPaid = !!record.paidDate;

                        return (
                            <div className="batch-card h-100 p-3 mb-3" style={{ minWidth: "300px" }}>
                                <div className="batch-header ps-0 pt-0">
                                    <h5 className="batch-name">Installment {record.installmentNo}</h5>
                                </div>
                                <p className="mb-1">Amount: ₹ {record.amount || "--"}</p>
                                <p className="mb-1">Due Date: {formatDate(record.dueDate)}</p>
                                <p className="mb-1">Paid Date: {formatDate(record.paidDate) || "--"}</p>
                                <p className="mb-1">Method: {record.method || "--"}</p>

                                <div className="d-flex mt-3 align-items-center justify-content-between">
                                    <p className={`fw-bold m-0 ${isPaid ? "text-success" : "text-warning"}`}>
                                        {status}
                                    </p>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => generatePDFReceipt(student, record)}
                                        disabled={!record.paidDate}
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ModalFour>

    </>);
}