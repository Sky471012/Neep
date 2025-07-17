import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inter28ptRegular } from "../assets/fonts/Inter_28pt-Regular";
import { Inter18ptBold } from "../assets/fonts/Inter_18pt-Bold-bold";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";

export default function StudentControls() {

    const { studentId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    console.log(token);

    const [student, setStudent] = useState({});
    const [batches, setBatches] = useState([]);
    const [installments, setInstallments] = useState([]);
    const [fee, setFee] = useState({});
    const [allBatches, setAllBatches] = useState([]);
    const [modalOne, setModalOne] = useState(false);
    const [modalTwo, setModalTwo] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedToAdd, setSelectedToAdd] = useState([]);
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [editedFee, setEditedFee] = useState(fee?.totalAmount || 0);
    const [numInstallments, setNumInstallments] = useState(3); // Default 3
    const [editingInstallmentId, setEditingInstallmentId] = useState(null);
    const [paidDateInput, setPaidDateInput] = useState(null); // use Date object
    const [methodInput, setMethodInput] = useState("Cash");
    const [editingInstallmentData, setEditingInstallmentData] = useState(null);
    const [editedAmount, setEditedAmount] = useState(0);
    const [editedDueDate, setEditedDueDate] = useState(null);
    const [editedPaidDate, setEditedPaidDate] = useState(null);
    const [editedMethod, setEditedMethod] = useState("Cash");

    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return "--";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "--";

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

     function formatDate(dateStr) {
        if (!dateStr) return "--";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }


    useEffect(() => {
        const fetchData = async () => {
            const res1 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getStudentDetails/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res2 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/studentBatches/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res3 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res4 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res5 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/installments/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const [sData, bData, fData, abData, iData] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json(), res5.json()]);
            setStudent(sData || {});
            setBatches(bData.batches || []);
            setFee(Array.isArray(fData.fee) ? fData.fee[0] : {});
            setAllBatches(abData || {});
            setInstallments(Array.isArray(iData) ? iData : iData.installments || []);
        };

        fetchData();
    }, [studentId]);


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

    const totalPaid = installments.reduce((sum, record) => {
        return sum + (record.paidDate ? (record.amount || 0) : 0);
    }, 0);

    const totalFee = fee?.totalAmount || 0;
    const balance = totalFee - totalPaid;

    const removeStudent = async (batchId, studentId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove student?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/removeStudent`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ batchId, studentId }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to remove student.");
                return;
            }

            setBatches((prevBatches) => prevBatches.filter((b) => b._id !== batchId));
        } catch (error) {
            console.error("Remove error:", error);
            alert("Something went wrong while removing.");
        }
    };

    const deleteStudent = async (studentId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/studentDelete/${studentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to delete student.");

            navigate("/admin");
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong while deleting.");
        }
    };

    const handleAddToSelectedBatches = async () => {
        if (selectedToAdd.length === 0) {
            return alert("Please select at least one batch.");
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/addBatches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId,
                    batchIds: selectedToAdd,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to add to batches.");
                return;
            }

            setBatches((prev) => [...prev, ...data.addedBatches]);
            setModalOne(false); // ✅ correct modal
            setSelectedToAdd([]);
            setSearchTerm("");
        } catch (err) {
            console.error("Add to batches error:", err);
            alert("Error while adding to batches.");
        }
    };

    const filteredBatches = allBatches.filter((b) => {
        const alreadyInBatch = batches.some((bt) => bt._id === b._id);
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = b.name.toLowerCase().includes(searchLower);
        return !alreadyInBatch && nameMatch;
    });

    const toggleSelectBatch = (batchId) => {
        setSelectedToAdd((prev) =>
            prev.includes(batchId)
                ? prev.filter((id) => id !== batchId)
                : [...prev, batchId]
        );
    };

    const handleAddInstallment = async () => {
        const newInstallment = {
            feeId: fee._id,
            studentId: student._id,
            installmentNo: installments.length + 1,
            dueDate: new Date().toISOString().split("T")[0],
            amount: 0
        };

        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/addInstallment`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newInstallment),
            }
        );

        if (response.ok) {
            const data = await response.json();
            setInstallments((prev) => [...prev, data.installment]);
        } else {
            alert("Failed to add installment");
        }
    };

    const handleRemoveInstallment = async (record) => {
        const confirm = window.confirm("Are you sure you want to remove this installment?");
        if (!confirm) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/removeInstallment/${record._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete installment");
                return;
            }

            // 🟢 Fetch updated installments after backend redistribution & renumbering
            const refreshed = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/installments/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedList = await refreshed.json();

            setInstallments(Array.isArray(updatedList) ? updatedList : updatedList.installments || []);
        } catch (error) {
            console.error("Error removing installment:", error);
            alert("Something went wrong.");
        }
    };

    const editTotalAmount = async (newAmount) => {
        try {
            // 1. Update fee total amount
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/update-fee/${studentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: newAmount }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to change Total Amount.");
                return;
            }

            setFee(data.fee); // update fee state

            // 2. Redistribute unpaid installments
            const unpaid = installments.filter((i) => !i.paidDate);

            if (unpaid.length > 0) {
                const totalPaid = installments.reduce(
                    (sum, inst) => sum + (inst.paidDate ? inst.amount : 0),
                    0
                );

                const remaining = newAmount - totalPaid;
                const equalShare = Math.floor(remaining / unpaid.length);
                const remainder = remaining % unpaid.length;

                const updated = await Promise.all(
                    unpaid.map(async (i, index) => {
                        const res = await fetch(
                            `${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/redistributeInstallment/${i._id}`,
                            {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    amount: index === 0 ? equalShare + remainder : equalShare, // distribute remainder to first
                                }),
                            }
                        );
                        return res.ok ? (await res.json()).updatedInstallment : i;
                    })
                );

                setInstallments((prev) =>
                    prev.map((i) => {
                        const updatedOne = updated.find((u) => u._id === i._id);
                        return updatedOne || i;
                    })
                );
            }

            setIsEditingFee(false); // close edit mode
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong while updating.");
        }
    };

    const handleAddFeeStructureSubmit = async () => {
        if (!editedFee || !numInstallments || editedFee <= 0 || numInstallments <= 0) {
            alert("Please enter valid fee and number of installments.");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/createFeeWithInstallments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId,
                    amount: editedFee,
                    numberOfInstallments: numInstallments, // ✅ include this
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to create fee structure.");
                return;
            }

            // Save fee and installment data from response
            setFee(data.fee);
            setInstallments(data.installments);
            setModalTwo(false);
        } catch (error) {
            console.error("Error creating fee structure:", error);
            alert("Something went wrong while adding fee structure.");
        }
    };

    const handleRemoveFeeStructure = async () => {
        const confirm = window.confirm("Are you sure you want to delete this fee structure?");
        if (!confirm) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/deleteFeeStructure/${studentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete fee structure.");
                return;
            }

            // Clear local fee and installments
            setFee({});
            setInstallments([]);
        } catch (err) {
            console.error("Delete fee error:", err);
            alert("Something went wrong while deleting fee structure.");
        }
    };

    const handleMarkPaid = async (installmentId) => {

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/mark-paid/${installmentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    paidDate: paidDateInput?.toISOString().split("T")[0],
                    method: methodInput,
                }),
            });

            const updated = await res.json();
            if (res.ok) {
                setInstallments(prev =>
                    prev.map(inst =>
                        inst._id === installmentId ? { ...inst, paidDate: paidDateInput, method: methodInput } : inst
                    )
                );
                setEditingInstallmentId(null);
                setPaidDateInput("");
                setMethodInput("Cash");
            } else {
                console.error(updated.message || "Failed to update");
            }
        } catch (err) {
            console.error("Error marking as paid:", err);
        }
    };

    // Add this function to handle starting edit mode
    const handleEditInstallment = (record) => {
        setEditingInstallmentData(record._id);
        setEditedAmount(record.amount || 0);
        setEditedDueDate(record.dueDate ? new Date(record.dueDate) : new Date());

        const parsedPaidDate = record.paidDate ? new Date(record.paidDate) : null;
        setEditedPaidDate(isNaN(parsedPaidDate) ? null : parsedPaidDate);

        setEditedMethod(record.method || "Cash");
    };


    // Add this function to handle saving edited installment
    const handleSaveEditedInstallment = async (installmentId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/updateInstallment/${installmentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: editedAmount,
                    dueDate: editedDueDate?.toISOString().split("T")[0],
                    paidDate: editedPaidDate?.toISOString().split("T")[0] || null,
                    method: editedPaidDate ? editedMethod : null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to update installment");
                return;
            }

            // Update the installment in local state
            setInstallments(prev =>
                prev.map(inst =>
                    inst._id === installmentId ? {
                        ...inst,
                        amount: editedAmount,
                        dueDate: editedDueDate?.toISOString().split("T")[0],
                        paidDate: editedPaidDate?.toISOString().split("T")[0] || null,
                        method: editedPaidDate ? editedMethod : null,
                    } : inst
                )
            );

            // Reset editing state
            setEditingInstallmentData(null);
            setEditedAmount(0);
            setEditedDueDate(null);
            setEditedPaidDate(null);
            setEditedMethod("Cash");
        } catch (error) {
            console.error("Error updating installment:", error);
            alert("Something went wrong while updating installment.");
        }
    };

    // Add this function to handle canceling edit
    const handleCancelEdit = () => {
        setEditingInstallmentData(null);
        setEditedAmount(0);
        setEditedDueDate(null);
        setEditedPaidDate(null);
        setEditedMethod("Cash");
    };

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
                                <h3>⋮</h3>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow">
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => setModalOne(true)}
                                    >
                                        Add to Batches
                                    </button>
                                </li>
                                <li>
                                    {fee?._id ? (
                                        <button
                                            className="dropdown-item text-warning"
                                            onClick={handleRemoveFeeStructure}
                                        >
                                            Remove Fee Structure
                                        </button>
                                    ) : (
                                        <button
                                            className="dropdown-item"
                                            onClick={() => setModalTwo(true)}
                                        >
                                            Add Fee Structure
                                        </button>
                                    )}
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item text-danger"
                                        onClick={() => deleteStudent(student._id)}
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
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeStudent(b._id, student._id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h2 className="card-title">Fee Status</h2>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleAddInstallment}
                        >
                            Add Installment
                        </button>
                    </div>

                    <div className="d-flex gap-4 mt-3 mb-1" style={{ fontSize: "1.2rem" }}>
                        {isEditingFee ? (
                            <>
                                <span><strong>Total Fee: </strong>₹
                                    <input
                                        type="number"
                                        value={editedFee}
                                        onChange={(e) => setEditedFee(e.target.value)}
                                        style={{ width: "120px", padding: "2px 5px" }}
                                    />
                                    <button
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => editTotalAmount(editedFee)}
                                    >
                                        Done
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => setIsEditingFee(false)}
                                    >
                                        Cancel
                                    </button>
                                </span>
                            </>
                        ) : (
                            <>
                                <span><strong>Total Fee:</strong> ₹ {totalFee}
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                                        setEditedFee(totalFee);
                                        setIsEditingFee(true);
                                    }}>
                                        Edit
                                    </button>
                                </span>
                            </>
                        )}
                        <span><strong>Paid:</strong> ₹ {totalPaid}</span>
                        <span><strong>Balance:</strong> ₹ {balance}</span>
                    </div>

                    <div className="row row-cols-1 row-cols-md-2 g-4 mt-2">
                        {installments.map((record, index) => {
                            const status = record.paidDate ? "Paid" : "Due";
                            const statusClass = record.paidDate ? "text-success" : "text-danger";
                            const isEditing = editingInstallmentData === record._id;
                            const isMarkingPaid = editingInstallmentId === record._id;

                            return (
                                <div className="col" key={record._id}>
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title">Installment {record.installmentNo}</h5>

                                            {/* Amount Field */}
                                            <p className="mb-1">
                                                <strong>Amount:</strong>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editedAmount}
                                                        onChange={(e) => setEditedAmount(Number(e.target.value))}
                                                        className="form-control d-inline-block ms-2"
                                                        style={{ width: "120px" }}
                                                    />
                                                ) : (
                                                    ` ₹ ${record.amount || "--"}`
                                                )}
                                            </p>

                                            {/* Due Date Field */}
                                            <p className="mb-1">
                                                <strong>Due Date:</strong>
                                                {isEditing ? (
                                                    <DatePicker
                                                        selected={editedDueDate}
                                                        onChange={(date) => setEditedDueDate(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="form-control d-inline-block ms-2"
                                                        style={{ width: "150px" }}
                                                    />
                                                ) : (
                                                    ` ${formatDateToDDMMYYYY(record.dueDate) || "--"}`
                                                )}
                                            </p>

                                            {/* Paid Date Field */}
                                            {isMarkingPaid ? (
                                                <div className="mb-1 d-flex align-items-center">
                                                    <strong className="me-2">Paid Date:</strong>
                                                    <DatePicker
                                                        selected={paidDateInput}
                                                        onChange={(date) => setPaidDateInput(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="form-control"
                                                        placeholderText="Select date"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="mb-1">
                                                    <strong>Paid Date:</strong>
                                                    {isEditing ? (
                                                        <DatePicker
                                                            selected={editedPaidDate}
                                                            onChange={(date) => setEditedPaidDate(date)}
                                                            dateFormat="yyyy-MM-dd"
                                                            className="form-control d-inline-block ms-2"
                                                            style={{ width: "150px" }}
                                                            placeholderText="Select date"
                                                            isClearable
                                                        />
                                                    ) : (
                                                        ` ${formatDateToDDMMYYYY(record.paidDate) || "--"}`
                                                    )}
                                                </p>
                                            )}

                                            {/* Method Field */}
                                            {isMarkingPaid ? (
                                                <div className="mb-1">
                                                    <strong>Method:</strong>
                                                    <select
                                                        className="form-select d-inline-block ms-2 w-auto"
                                                        value={methodInput}
                                                        onChange={(e) => setMethodInput(e.target.value)}
                                                    >
                                                        <option value="Cash">Cash</option>
                                                        <option value="Online">Online</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <p className="mb-1">
                                                    <strong>Method:</strong>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-select d-inline-block ms-2 w-auto"
                                                            value={editedMethod}
                                                            onChange={(e) => setEditedMethod(e.target.value)}
                                                            disabled={!editedPaidDate}
                                                        >
                                                            <option value="Cash">Cash</option>
                                                            <option value="Online">Online</option>
                                                        </select>
                                                    ) : (
                                                        ` ${record.method || "--"}`
                                                    )}
                                                </p>
                                            )}

                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className={`fw-bold ${statusClass}`}>{status}</span>

                                                <div className="d-flex gap-2">
                                                    {isEditing ? (
                                                        // Edit mode buttons
                                                        <>
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                onClick={() => {
                                                                    if (editedPaidDate) {
                                                                        setEditedPaidDate(null);
                                                                        setEditedMethod("Cash");
                                                                    } else {
                                                                        setEditedPaidDate(new Date());
                                                                        setEditedMethod("Cash");
                                                                    }
                                                                }}
                                                            >
                                                                {editedPaidDate ? "Mark as Due" : "Mark as Paid"}
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => handleSaveEditedInstallment(record._id)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : isMarkingPaid ? (
                                                        // Mark as paid mode buttons
                                                        <>
                                                            <button
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => handleMarkPaid(record._id)}
                                                            >
                                                                Mark Paid
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => {
                                                                    setEditingInstallmentId(null);
                                                                    setPaidDateInput("");
                                                                    setMethodInput("Cash");
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        // Normal mode buttons
                                                        <>
                                                            {record.paidDate ? (
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => generatePDFReceipt(student, record)}
                                                                >
                                                                    Download
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-outline-success btn-sm"
                                                                    onClick={() => {
                                                                        setEditingInstallmentId(record._id);
                                                                        setPaidDateInput(new Date());
                                                                        setMethodInput("Cash");
                                                                    }}
                                                                >
                                                                    Paid
                                                                </button>
                                                            )}

                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => handleEditInstallment(record)}
                                                            >
                                                                Edit
                                                            </button>

                                                            {!record.paidDate && (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleRemoveInstallment(record)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <ModalOne
                    isOpen={modalOne}
                    onClose={() => {
                        setModalOne(false);
                        setSearchTerm("");
                    }}
                >
                    <h3>Add Student to batches</h3>

                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div style={{ maxHeight: "300px", overflowY: "auto", margin: "10px" }}>
                        {filteredBatches.map((batch) => (
                            <div key={batch._id} className="form-check mt-1">
                                <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    id={batch._id}
                                    checked={selectedToAdd.includes(batch._id)}
                                    onChange={() => toggleSelectBatch(batch._id)}
                                />
                                <label className="form-check-label" htmlFor={batch._id}>
                                    {batch.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button className="button" onClick={handleAddToSelectedBatches}>
                        Add to selected Batches
                    </button>
                </ModalOne>

                <ModalTwo
                    isOpen={modalTwo}
                    onClose={() => {
                        setModalTwo(false);
                    }}
                >
                    <h3 className="mb-3">Adding Fee Structure of {student.name}</h3>

                    <div className="mb-3">
                        <label className="form-label">Total Fee Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            value={editedFee}
                            onChange={(e) => setEditedFee(e.target.value)}
                            min="1"
                            placeholder="Enter total fee amount"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Number of Installments</label>
                        <input
                            type="number"
                            className="form-control"
                            value={numInstallments}
                            onChange={(e) => setNumInstallments(e.target.value)}
                            min="1"
                            placeholder="Enter number of installments"
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleAddFeeStructureSubmit}>
                        Create Fee Structure
                    </button>
                </ModalTwo>


            </div>
        </div >


        <Footer />

    </>)
}