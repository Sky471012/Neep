import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inter28ptRegular } from "../assets/fonts/Inter_28pt-Regular";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function StudentControls() {

    const { studentId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    console.log(token);

    const [student, setStudent] = useState({});
    const [batches, setBatches] = useState([]);
    const [fee, setFee] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res1 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getStudentDetails/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res2 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/studentBatches/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res3 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/student-fee-status/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const [sData, bData, fData] = await Promise.all([res1.json(), res2.json(), res3.json()]);
            setStudent(sData || {});
            setBatches(bData.batches || []);
            setFee(fData.feeStatus || []);
        };

        fetchData();
    }, [studentId]);


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

    return (<>

        <Navbar />

        <div className="main-content">
            <div className="container mt-4">
                <div className="card mb-5 p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <h2>{student?.name || "No name"}</h2>

                        <div className="dropdown">
                            <button
                                className="btn btn-sm"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                ⋮
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow">
                                <li>
                                    <button
                                        className={'dropdown-item text-danger'}
                                    >
                                        Delete Student
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p className="mt-3">Contact Number:<strong> {student.phone}<br /></strong>
                        DOB:<strong> {student.dob}<br /></strong>
                        Class:<strong> {student.class}<br /></strong>
                        Address:<strong> {student.address}<br /></strong>
                        Fee:<strong> {student.fee}<br /></strong>
                        Date of Joining:<strong> {student.dateOfJoining}<br /></strong>
                        Student ID:<strong> {student._id}<br /></strong>
                        Number of batches:<strong> {batches.length}</strong></p>
                </div>


                <div className="mt-4">
                    <h2>All Batches</h2>
                    <table className="table table-borderless align-middle">
                        <tbody>
                            {batches.map((b) => (
                                <tr key={b._id}>
                                    <td style={{ width: "40%" }}>{b.name}</td>
                                    <td style={{ width: "30%" }}>
                                        <Link to={`/batch/${b._id}`} className="btn btn-outline-primary btn-sm">Open Batch</Link>
                                    </td>
                                    <td style={{ width: "30%" }}>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeTeacher(b._id, teacherId)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <h2>Fee status</h2>
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
                            {fee.map((record, index) => {
                                const status = record.paidDate ? "Paid" : "Due";
                                return (
                                    <tr key={index}>
                                        <td>Installment {record.installmentNo}</td>
                                        <td>{record.amount || "--"}</td>
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
            </div>
        </div>


        <Footer />

    </>)
}
