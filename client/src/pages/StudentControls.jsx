import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inter28ptRegular } from "../assets/fonts/Inter_28pt-Regular";
import { Inter18ptBold } from "../assets/fonts/Inter_18pt-Bold-bold";
import Navbar from "../components/Navbar";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";

export default function StudentControls() {

    const { studentId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

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
    const [batchSearch, setBatchSearch] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        dob: '',
        address: '',
        class: '',
        dateOfJoining: ''
    });

    const classOptions = ["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"];

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
        const token = localStorage.getItem("authToken");

        if (token && studentId) {
            // Fetch student details
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getStudentDetails/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setStudent(data || {}))
                .catch(err => console.error("Student details fetch error:", err));

            // Fetch student's batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/studentBatches/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setBatches(data.batches || []))
                .catch(err => console.error("Student batches fetch error:", err));

            // Fetch fee info
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setFee(Array.isArray(data.fee) ? data.fee[0] : {}))
                .catch(err => console.error("Fee fetch error:", err));

            // Fetch all batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setAllBatches(data || {}))
                .catch(err => console.error("All batches fetch error:", err));

            // Fetch installments
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/installments/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setInstallments(Array.isArray(data) ? data : data.installments || []))
                .catch(err => console.error("Installments fetch error:", err));
        }
    }, [studentId]);

    useEffect(() => {
        if (student) {
            setEditForm({
                name: student.name || '',
                phone: student.phone || '',
                dob: student.dob || '',
                address: student.address || '',
                class: student.class || '',
                dateOfJoining: student.dateOfJoining || ''
            });
        }
    }, [student]);

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

            setModalOne(false);
            setBatches((prev) => [...prev, ...data.addedBatches]);
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
    const handleCancelEditInstallment = () => {
        setEditingInstallmentData(null);
        setEditedAmount(0);
        setEditedDueDate(null);
        setEditedPaidDate(null);
        setEditedMethod("Cash");
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEditStudent = () => {
        setIsEditing(false);
        // Reset form to original values
        setEditForm({
            name: student.name || '',
            phone: student.phone || '',
            dob: student.dob || '',
            address: student.address || '',
            class: student.class || '',
            dateOfJoining: student.dateOfJoining || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!editForm.name || !editForm.phone || !editForm.dob || !editForm.address || !editForm.class || !editForm.dateOfJoining) {
            alert('All fields are required');
            return false;
        }

        // Validate DOB format (DD-MM-YYYY)
        const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
        if (!dobRegex.test(editForm.dob)) {
            alert('Date of birth must be in DD-MM-YYYY format');
            return false;
        }

        return true;
    };

    const handleSaveEdit = async () => {
        if (!validateForm()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editStudntProfile/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedStudent = await response.json();
                setStudent(updatedStudent);
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Error updating profile');
        }
    };

    return (<>

        <Navbar />

        <div className="app-container">
            <div className="main-layout">
                <div className="student-sidebar">
                    <div className="d-flex">
                        <div style={{ margin: "0", padding: "0", width: "100%" }}>
                            <div style={{ position: "absolute", top: "10px", right: "10px" }} className="dropdown">
                                <button
                                    className="btn btn-sm"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <h4 style={{ color: 'white', padding: "0px" }}>⋮</h4>
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
                                        <button
                                            className="dropdown-item"
                                            onClick={handleEditClick}
                                            disabled={isEditing}
                                        >
                                            Edit Profile
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
                    </div>

                    {isEditing ? (
                        <>
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="profile-title mb-2" style={{ margin: "0 auto" }}>
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                        style={{
                                            border: '1px solid #ffffffff',
                                            fontSize: 'inherit',
                                            fontWeight: 'inherit',
                                            background: 'transparent',
                                            padding: "0",
                                            boxShadow: "none",
                                            color: "inherit"
                                        }}
                                    />
                                </h2>
                            </div>


                            <div className="student-details-card" style={{ padding: "0.5rem 1.5rem" }}>
                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="detail-label">
                                        Phone:
                                        <input
                                            type="text"
                                            className="form-control d-inline-block ms-2"
                                            name="phone"
                                            value={editForm.phone}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '70%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                    </svg>
                                    <div className="detail-label d-flex flex-nowrap">
                                        <label className="mb-0 white-space-nowrap">Date of Birth:</label>
                                        <DatePicker
                                            selected={editForm.dob ? new Date(editForm.dob.split('-').reverse().join('-')) : null}
                                            onChange={(date) => {
                                                const formattedDate = date ?
                                                    `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
                                                    : '';
                                                setEditForm(prev => ({ ...prev, dob: formattedDate }));
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            className="form-control d-inline-block ms-2"
                                            placeholderText="Select date of birth"
                                            showYearDropdown
                                            yearDropdownItemNumber={10}
                                            scrollableYearDropdown
                                            dropdownMode="select"
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    <div className="detail-label">
                                        Class:
                                        <select
                                            className="form-control d-inline-block ms-2 detail-item-select"
                                            name="class"
                                            value={editForm.class}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '73%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        >
                                            <option value="">Select Class</option>
                                            {classOptions.map(option => (
                                                <option key={option} value={option} className="text-dark">{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="detail-value">
                                        <input
                                            className="form-control"
                                            name="address"
                                            value={editForm.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter address"
                                            style={{
                                                width: '103%',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0px 8px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                    <div className="detail-label d-flex flex-nowrap">
                                        <label className="mb-0 white-space-nowrap">Joining Date:</label>
                                        <DatePicker
                                            selected={editForm.dateOfJoining ? new Date(editForm.dateOfJoining.split('-').reverse().join('-')) : null}
                                            onChange={(date) => {
                                                const formattedDate = date ?
                                                    `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
                                                    : '';
                                                setEditForm(prev => ({ ...prev, dateOfJoining: formattedDate }));
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            className="form-control d-inline-block ms-2"
                                            placeholderText="Select date of joining"
                                            showYearDropdown
                                            yearDropdownItemNumber={10}
                                            scrollableYearDropdown
                                            dropdownMode="select"
                                        />
                                    </div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                    </svg>
                                    <div className="detail-label">Batches Enrolled: {batches.length}</div>
                                </div>

                                <div className="d-flex mt-2 justify-content-around">
                                    <button
                                        className="green-button"
                                        onClick={handleSaveEdit}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        className="yellow-button"
                                        onClick={handleCancelEditStudent}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // View Mode - unchanged
                        <>
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="profile-title mb-2" style={{ margin: "0 auto" }}>{student?.name || "No name"}</h2>
                            </div>

                            <div className="student-details-card">
                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="detail-label">Phone: {student.phone}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                    </svg>
                                    <div className="detail-label">DOB: {student.dob}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    <div className="detail-label">Class: {student.class}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="detail-value">{student.address}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                    <div className="detail-label">Joining Date: {student.dateOfJoining}</div>
                                </div>

                                <div className="detail-item p-1">
                                    <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                    </svg>
                                    <div className="detail-label">Batches Enrolled: {batches.length}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>


                <div className="content-area">
                    <div className="welcome-card">
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

                        <table className="table table-borderless align-middle">
                            <tbody>
                                {batches
                                    .filter((b) =>
                                        b.name.toLowerCase().includes(batchSearch.toLowerCase())
                                    )
                                    .map((b) => (
                                        <tr key={b._id}>
                                            <td style={{ width: "70%" }}>
                                                {b.name}
                                                <Link className="ms-2 text-primary" to={`/batch/${b._id}`}>
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                </Link>
                                            </td>
                                            <td style={{ width: "30%", textAlign: "right" }}>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeStudent(b._id, student._id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>


                    <div className="batches-section">
                        <div className="d-flex mb-2 justify-content-between">
                            <h2 className="batches-title">Fee Status</h2>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={handleAddInstallment}
                            >
                                Add Installment
                            </button>
                        </div>

                        <div className="balance-header m-0 ps-3 pe-3" style={{ fontSize: "1.2rem" }}>
                            {isEditingFee ? (
                                <>
                                    <div className="d-flex gap-1">Total Fee:  ₹
                                        <input
                                            type="number"
                                            value={editedFee}
                                            onChange={(e) => setEditedFee(e.target.value)}
                                            style={{
                                                width: '74px',
                                                fontSize: 'inherit',
                                                fontWeight: 'inherit',
                                                background: 'transparent',
                                                padding: "0 4px",
                                                boxShadow: "none",
                                                color: "inherit"
                                            }}
                                        />
                                        <button
                                            className="btn btn-outline-success pt-1 pb-1"
                                            onClick={() => editTotalAmount(editedFee)}
                                        >
                                            Done
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary pt-1 pb-1"
                                            onClick={() => setIsEditingFee(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex gap-3">
                                    <span>Total Fee: ₹{totalFee}</span>
                                    {totalFee ? <button className="btn btn-outline-secondary pt-1 pb-1" onClick={() => {
                                        setEditedFee(totalFee);
                                        setIsEditingFee(true);
                                    }}>
                                        Edit
                                    </button> : ("")
                                    }
                                </div>
                            )}
                            <span>Paid: ₹ {totalPaid}</span>
                            <span>Balance: ₹ {balance}</span>
                        </div>

                        <div className="row row-cols-1 row-cols-md-2 g-4 mt-2">
                            {installments.map((record, index) => {
                                const status = record.paidDate ? "Paid" : "Due";
                                const statusClass = record.paidDate ? "text-success" : "text-warning";
                                const isEditing = editingInstallmentData === record._id;
                                const isMarkingPaid = editingInstallmentId === record._id;

                                return (
                                    <div className="col" key={record._id}>
                                        <div className="batch-card ps-3 pe-3 pb-3">
                                            <div className="batch-header ps-0">
                                                <h5 className="batch-name">Installment {record.installmentNo}</h5>
                                            </div>

                                            {/* Amount Field */}
                                            <div className="mb-1 d-flex align-items-center">
                                                Amount: ₹
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editedAmount}
                                                        onChange={(e) => setEditedAmount(Number(e.target.value))}
                                                        className="form-control d-inline-block ms-2"
                                                        style={{
                                                            width: '100px',
                                                            fontSize: 'inherit',
                                                            fontWeight: 'inherit',
                                                            background: 'transparent',
                                                            padding: "0px 8px",
                                                            boxShadow: "none",
                                                            color: "inherit"
                                                        }}
                                                    />
                                                ) : (
                                                    ` ${record.amount || "--"}`
                                                )}
                                            </div>

                                            {/* Due Date Field */}
                                            <div className="mb-1 d-flex align-items-center flex-nowrap">
                                                <label className="me-2 mb-0 white-space-nowrap">Due Date:</label>
                                                {isEditing ? (
                                                    <DatePicker
                                                        scrollableYearDropdown
                                                        maxDate={new Date()}
                                                        selected={editedDueDate}
                                                        onChange={(date) => setEditedDueDate(date)}
                                                        dateFormat="dd-MM-yyyy"
                                                        className="form-control d-inline-block ms-2"
                                                        showYearDropdown
                                                        yearDropdownItemNumber={10}
                                                        dropdownMode="select"
                                                    />
                                                ) : (
                                                    ` ${formatDateToDDMMYYYY(record.dueDate) || "--"}`
                                                )}
                                            </div>

                                            {/* Paid Date Field */}
                                            {isMarkingPaid ? (
                                                <div className="mb-1 d-flex align-items-center flex-nowrap">
                                                    <label className="me-2 mb-0 white-space-nowrap">Paid Date:</label>
                                                    <DatePicker
                                                        scrollableYearDropdown
                                                        maxDate={new Date()}
                                                        selected={paidDateInput}
                                                        onChange={(date) => setPaidDateInput(date)}
                                                        dateFormat="dd-MM-yyyy"
                                                        className="form-control"
                                                        placeholderText="Select date"
                                                        yearDropdownItemNumber={10}
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mb-1 d-flex align-items-center flex-nowrap">
                                                    <label className="me-2 mb-0 white-space-nowrap">Paid Date:</label>
                                                    {isEditing ? (
                                                        <DatePicker
                                                            selected={editedPaidDate}
                                                            onChange={(date) => setEditedPaidDate(date)}
                                                            dateFormat="dd-MM-yyyy"
                                                            className="form-control d-inline-block ms-2"
                                                            placeholderText="Select date"
                                                            yearDropdownItemNumber={10}
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                        />
                                                    ) : (
                                                        ` ${formatDateToDDMMYYYY(record.paidDate) || "--"}`
                                                    )}
                                                </div>
                                            )}

                                            {/* Method Field */}
                                            {isMarkingPaid ? (
                                                <div className="mb-1">
                                                    Method:
                                                    <select
                                                        className="form-select d-inline-block ms-2 w-auto"
                                                        value={methodInput}
                                                        onChange={(e) => setMethodInput(e.target.value)}
                                                        style={{
                                                            width: '103%',
                                                            fontSize: 'inherit',
                                                            fontWeight: 'inherit',
                                                            background: 'transparent',
                                                            padding: "0px 8px",
                                                            boxShadow: "none",
                                                            color: "inherit"
                                                        }}
                                                    >
                                                        <option value="Cash">Cash</option>
                                                        <option value="Online">Online</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <p className="mb-1">
                                                    Method:
                                                    {isEditing ? (
                                                        <select
                                                            className="form-select d-inline-block ms-2 w-auto"
                                                            value={editedMethod}
                                                            onChange={(e) => setEditedMethod(e.target.value)}
                                                            disabled={!editedPaidDate}
                                                            style={{
                                                                width: '103%',
                                                                fontSize: 'inherit',
                                                                fontWeight: 'inherit',
                                                                background: 'transparent',
                                                                padding: "0px 8px",
                                                                boxShadow: "none",
                                                                color: "inherit"
                                                            }}
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
                                                                className="btn btn-outline-warning btn-sm pt-0 pb-0"
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
                                                                className="btn btn-outline-success btn-sm pt-0 pb-0"
                                                                onClick={() => handleSaveEditedInstallment(record._id)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm pt-0 pb-0"
                                                                onClick={handleCancelEditInstallment}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : isMarkingPaid ? (
                                                        // Mark as paid mode buttons
                                                        <>
                                                            <button
                                                                className="btn btn-outline-success btn-sm pt-0 pb-0"
                                                                onClick={() => handleMarkPaid(record._id)}
                                                            >
                                                                Mark Paid
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm pt-0 pb-0"
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
                        <div className="addToBatch-box">
                            <h3 className="modal-title">Add Student to Batches</h3>
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div style={{ maxHeight: "45vh", overflowY: "auto", margin: "10px" }}>
                                {filteredBatches.map((batch) => (
                                    <div key={batch._id} className="d-flex align-items-center mb-1 text-break w-100">
                                        <input
                                            className="checkbox"
                                            type="checkbox"
                                            id={batch._id}
                                            checked={selectedToAdd.includes(batch._id)}
                                            onChange={() => toggleSelectBatch(batch._id)}
                                        />
                                        <label htmlFor={batch._id}>
                                            <div className="d-flex">{batch.name} <div className="dot"></div> Class: {batch.class}</div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary mt-3" style={{ width: "100%" }} onClick={handleAddToSelectedBatches}>
                                Add to selected Batches
                            </button>
                        </div>
                    </ModalOne>

                    <ModalTwo
                        isOpen={modalTwo}
                        onClose={() => {
                            setModalTwo(false);
                        }}
                    >
                        <div className="addFeeBox">
                            <h3 className="modal-title">Adding Fee Structure of {student.name}</h3>

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

                            <button className="btn btn-primary mt-2" style={{ width: "100%" }} onClick={handleAddFeeStructureSubmit}>
                                Create Fee Structure
                            </button>
                        </div>
                    </ModalTwo>

                </div>

            </div>
        </div >

    </>)
}