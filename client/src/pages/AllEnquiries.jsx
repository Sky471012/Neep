import { apiFetch } from "../api";
"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import ModalOne from "../modals/ModalOne"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"
import DatePicker from "react-datepicker"

export default function AllEnquiries() {
    const navigate = useNavigate()
    const [admin, setAdmin] = useState(null)
    const [enquiriesRecords, setEnquiriesRecords] = useState([])
    const [enquirySearchQuery, setEnquirySearchQuery] = useState("")
    const [openModalOne, setOpenModalOne] = useState(false);
    const [sortOrder, setSortOrder] = useState("oldest"); // "oldest" | "newest"
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "converted" | "lost" | "unmarked"
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedAdmin = localStorage.getItem("user");

        if (storedAdmin && storedAdmin !== "undefined") {
            try {
                setAdmin(JSON.parse(storedAdmin))
            } catch (err) {
                console.error("Failed to parse admin JSON:", err)
                localStorage.removeItem("admin")
                navigate("/login");
                return
            }
            const headers = {}

            apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/allEnquiries`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch enquiries")
                    return res.json()
                })
                .then(setEnquiriesRecords)
                .catch((err) => console.error("Enquiries fetch error:", err))
                .finally(() => setLoading(false))
        } else {
            navigate("/login");
        }
    }, [navigate])

        const [enquiryForm, setEnquiryForm] = useState({
        studentName: "",
        phone: "",
        enquiryDate: new Date(),
        followupDate: new Date(),
        classSubject: "",
        followupType: "demo",
        notes: "",
    })

    function formatDateToDDMMYYYY(dateOrString) {
        if (!dateOrString) return "";
        // If it's a Date object
        if (dateOrString instanceof Date) {
            const d = dateOrString;
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        }
        // If it's an ISO-like string yyyy-mm-dd
        const parts = String(dateOrString).split("-");
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return String(dateOrString);
    }

    function parseEnquiryDateToTime(dateOrString) {
        if (!dateOrString) return Number.POSITIVE_INFINITY;
        if (dateOrString instanceof Date) return dateOrString.getTime();
        const s = String(dateOrString);
        const parts = s.split("-");
        if (parts.length === 3) {
            // assume dd-mm-yyyy
            const [dd, mm, yyyy] = parts;
            const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
            if (!isNaN(d)) return d.getTime();
        }
        const d = new Date(s);
        return isNaN(d) ? Number.POSITIVE_INFINITY : d.getTime();
    }

    const handleEnquiryInputChange = (e) => {
        const { name, value } = e.target;
        setEnquiryForm((prev) => ({ ...prev, [name]: value }));
    }

    const handleEnquiryFormSubmit = async (e) => {
        e.preventDefault();

        const { studentName, phone, enquiryDate, followupDate, classSubject, followupType, notes } = enquiryForm;

        // Basic client-side validation matching backend requirements
        if (!studentName.trim() || !phone.trim() || !enquiryDate || !followupDate || !classSubject.trim() || !followupType) {
            alert("Please fill all required fields.");
            return;
        }

        const payload = {
            studentName: studentName.trim(),
            phone: phone.trim(),
            enquiryDate: formatDateToDDMMYYYY(enquiryDate),
            followupDate: formatDateToDDMMYYYY(followupDate),
            classSubject: classSubject.trim(),
            followupType,
            notes: notes.trim(),
        };

        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/enquiryCreate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to create enquiry.");
                return;
            }

            // Add newly created enquiry to list and close modal
            setEnquiriesRecords((prev) => [data.enquiry || data, ...prev]);
            setOpenModalOne(false);
            setEnquiryForm({ studentName: "", phone: "", enquiryDate: new Date(), followupDate: new Date(), classSubject: "", followupType: "demo", notes: "" });
        } catch (err) {
            console.error("Error creating enquiry:", err);
            alert("Something went wrong while creating enquiry.");
        }
    }

    const goToEnquiry = (enquiryId) => {
        localStorage.setItem("enquiryId", enquiryId);
        navigate(`/enquiry/${enquiryId}`);
    }


    if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading enquiries...</p></div></div>);

    return (<>

        <Navbar />

        <div className="data-section">
            <div className="section-header mx-2">
                <div className="d-flex flex-row justify-content-between align-items-end" style={{ width: "fit-content" }}>
                    <div><h2 className="students-title">All Enquiries ({enquiriesRecords.length})</h2></div>
                    <div><button className="btn btn-outline-primary btn-sm ms-4" onClick={() => setOpenModalOne(true)}>
                        <i className="fas fa-plus me-1"></i>Add
                    </button></div>
                </div>

                <div className="search-container">
                    <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search enquiries..."
                        className="search-input"
                        value={enquirySearchQuery}
                        onChange={(e) => setEnquirySearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-3 d-flex gap-0 align-items-stretch w-100" style={{height: '45px'}}>
                <div className="enquiry-tabs w-50 d-flex align-items-center justify-content-start ps-3">
                    <div className="dropdown">
                        <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                            Sort By <i className="fas fa-caret-down ms-1"></i>
                        </button>
                        <ul className="dropdown-menu shadow">
                            <li>
                                <button className={`dropdown-item ${sortOrder === 'newest' ? 'active' : ''}`} onClick={() => setSortOrder('newest')}>Newest First</button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${sortOrder === 'oldest' ? 'active' : ''}`} onClick={() => setSortOrder('oldest')}>Oldest First</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="enquiry-tabs w-50 d-flex align-items-center justify-content-end pe-3">
                    <div className="dropdown">
                        <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                            Filter <i className="fas fa-cog ms-1"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow">
                            <li>
                                <button className={`dropdown-item ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${statusFilter === 'converted' ? 'active' : ''}`} onClick={() => setStatusFilter('converted')}>Converted</button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${statusFilter === 'lost' ? 'active' : ''}`} onClick={() => setStatusFilter('lost')}>Lost</button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${statusFilter === 'unmarked' ? 'active' : ''}`} onClick={() => setStatusFilter('unmarked')}>Unmarked</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='data-grid-container' style={{overflowY: 'auto'}}>
                <div className="data-grid">
                    {enquiriesRecords.length > 0 ? (
                        (() => {
                            // Apply search filter
                            const searched = enquiriesRecords.filter((enq) =>
                                (enq.studentName || "").toLowerCase().includes(enquirySearchQuery.toLowerCase()) ||
                                (enq.classSubject || "").toLowerCase().includes(enquirySearchQuery.toLowerCase()) ||
                                (enq.phone || "").toLowerCase().includes(enquirySearchQuery.toLowerCase())
                            );

                            // Apply status filter
                            const statusFiltered = searched.filter((enq) => {
                                if (statusFilter === 'all') return true;
                                if (statusFilter === 'unmarked') return !enq.status;
                                return (enq.status || '').toLowerCase() === statusFilter;
                            });

                            // Sort by date according to sortOrder
                            const sorted = [...statusFiltered].sort((a, b) => {
                                const ta = parseEnquiryDateToTime(a.enquiryDate);
                                const tb = parseEnquiryDateToTime(b.enquiryDate);
                                if (ta === tb) return (a.studentName || "").localeCompare(b.studentName || "");
                                return sortOrder === 'oldest' ? ta - tb : tb - ta;
                            });

                            return sorted.map((enq) => (
                                <div key={enq._id} onClick={() => goToEnquiry(enq._id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') goToEnquiry(enq._id) }} style={{ cursor: 'pointer' }} className="data-card">
                                    <h5 className="card-title">{enq.studentName}</h5>
                                    <span className="card-subtitle">Phone: {enq.phone}</span>
                                    <span className="card-subtitle">Enquired on: {enq.enquiryDate || "-"}</span>
                                    <span className="card-subtitle">Followup: {enq.followupDate || "-"} <span className="text-primary text-capitalize">({enq.followupType || "-"})</span></span>
                                    {enq.status ? (
                                        <span className="card-status">
                                            Status:
                                            <span className={` ms-1 text-capitalize ${enq.status === 'converted' ? 'text-success' : enq.status === 'lost' ? 'text-danger' : ''}`}>
                                                {enq.status}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="card-status">
                                            Status:
                                            <span className=" ms-1">NA</span>
                                        </span>
                                    )}
                                </div>
                            ));
                        })()
                    ) : (
                        <p className="no-data">No enquiries found.</p>
                    )}
                </div>
            </div>

            <ModalOne isOpen={openModalOne} onClose={() => setOpenModalOne(false)}>
                <div className="adding-student-box" style={{ minWidth: "320px" }}>
                    <h3 className="modal-title">Add Enquiry</h3>
                    <form className="login-form" onSubmit={handleEnquiryFormSubmit}>
                        <div className="form-group">
                            <label htmlFor="studentName">Student Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="studentName"
                                name="studentName"
                                value={enquiryForm.studentName}
                                onChange={handleEnquiryInputChange}
                                required
                                placeholder="Write Student Name..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={enquiryForm.phone}
                                onChange={handleEnquiryInputChange}
                                required
                                placeholder="Enter phone number..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="classSubject">Subject / Class <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="classSubject"
                                name="classSubject"
                                value={enquiryForm.classSubject}
                                onChange={handleEnquiryInputChange}
                                required
                                placeholder="e.g. Maths, 10th..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="enquiryDate">Enquiry Date <span className="text-danger">*</span></label>
                            <DatePicker
                                    className="datePicker"
                                    placeholderText="Select Enquiry Date"
                                    required
                                    showYearDropdown
                                    dropdownMode="select"
                                    yearDropdownItemNumber={10}
                                    scrollableYearDropdown
                                    maxDate={new Date()}
                                    openToDate={new Date()}
                                    minDate={new Date("1995-01-01")}
                                    selected={enquiryForm.enquiryDate}
                                    onChange={(date) => setEnquiryForm(prev => ({ ...prev, enquiryDate: date }))}
                                    dateFormat="dd-MM-yyyy"
                                />
                        </div>

                        <div className="form-group">
                            <label htmlFor="followupDate">Followup Date <span className="text-danger">*</span></label>
                            <DatePicker
                                className="datePicker"
                                dateFormat="dd-MM-yyyy"
                                placeholderText="Select Followup Date"
                                required
                                showYearDropdown
                                dropdownMode="select"
                                yearDropdownItemNumber={10}
                                scrollableYearDropdown
                                openToDate={new Date()}
                                minDate={new Date("1995-01-01")}
                                selected={enquiryForm.followupDate}
                                onChange={(date) => setEnquiryForm(prev => ({ ...prev, followupDate: date }))}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="followupType">Followup Type <span className="text-danger">*</span></label>
                            <select
                                id="followupType"
                                name="followupType"
                                className="form-select"
                                value={enquiryForm.followupType}
                                onChange={handleEnquiryInputChange}
                                required
                            >
                                <option value="demo">Demo</option>
                                <option value="call">Call</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={enquiryForm.notes}
                                onChange={handleEnquiryInputChange}
                                placeholder="Optional notes..."
                            />
                        </div>

                        <button className="btn btn-success" style={{ width: "100%" }} type="submit">
                            Create Enquiry
                        </button>
                    </form>
                </div>
            </ModalOne>
        </div>
    </>)
}
