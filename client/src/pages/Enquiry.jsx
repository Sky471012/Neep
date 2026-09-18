import { apiFetch } from "../api";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/admin.css';
import DatePicker from 'react-datepicker';

export default function Enquiry() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [enquiry, setEnquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    // notes are view-only now (no inline edit)
    const [isEditingTimeline, setIsEditingTimeline] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const [infoForm, setInfoForm] = useState({ studentName: '', phone: '', classSubject: '' });
    const [notesForm, setNotesForm] = useState({ notes: '' });
    const [timelineForm, setTimelineForm] = useState({ enquiryDate: null, followupDate: null, followupType: 'demo' });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser || storedUser === "undefined") {
            navigate("/login");
            return;
        }

        try {
            JSON.parse(storedUser);
        } catch (err) {
            localStorage.removeItem("user");
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const enquiryId = localStorage.getItem("enquiryId");

        apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getEnquiry/${enquiryId}`, {
            headers: {},
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch enquiry');
                return res.json();
            })
            .then((data) => {
                setEnquiry(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Enquiry fetch error:', err);
                setError(err.message || 'Error');
                setLoading(false);
            });
    }, [id]);

    function formatDate(str) {
        if (!str) return '-';
        // already in dd-mm-yyyy or maybe ISO; try to handle both
        if (str.includes('-')) return str;
        const d = new Date(str);
        if (isNaN(d)) return str;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }

    // parse dd-mm-yyyy (or ISO) into a Date object (or null)
    function parseDDMMYYYYToDate(str) {
        if (!str) return null;
        const parts = String(str).split('-');
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
            return isNaN(d) ? null : d;
        }
        const d = new Date(str);
        return isNaN(d) ? null : d;
    }

    // format Date object (or ISO string) to dd-mm-yyyy
    function dateToDDMMYYYY(dateOrStr) {
        if (!dateOrStr) return '';
        const d = dateOrStr instanceof Date ? dateOrStr : new Date(dateOrStr);
        if (isNaN(d)) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }

    const updateStatus = async (newStatus) => {

        setUpdating(true);
        try {
            const enquiryId = localStorage.getItem("enquiryId");

            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/enquiryStatus/${enquiryId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update status');
            setEnquiry((prev) => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Status update error:', err);
            alert(err.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    // NOTE: copy logic is called inline from the button click handler below.

    // prepare edit forms when entering edit mode
    useEffect(() => {
        if (enquiry) {
            setInfoForm({ studentName: enquiry.studentName || '', phone: enquiry.phone || '', classSubject: enquiry.classSubject || '' });
            setNotesForm({ notes: enquiry.notes || '' });
            setTimelineForm({ enquiryDate: parseDDMMYYYYToDate(enquiry.enquiryDate), followupDate: parseDDMMYYYYToDate(enquiry.followupDate), followupType: enquiry.followupType || 'demo' });
        }
    }, [enquiry]);

    // Delete enquiry handler (separate function)
    const handleDeleteEnquiry = async () => {
        if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const enquiryId = id || localStorage.getItem('enquiryId');
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/enquiryDelete/${enquiryId}`, {
                method: 'DELETE',
                headers: {},
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Failed to delete enquiry');
            // Navigate back to list after successful delete
            navigate('/all-enquiries');
        } catch (err) {
            console.error('Delete enquiry error:', err);
            alert(err.message || 'Failed to delete enquiry');
        } finally {
            setDeleting(false);
        }
    };

    const saveInfo = async () => {
        setUpdating(true);
        try {
            const enquiryId = id || localStorage.getItem('enquiryId');
            const payload = {
                studentName: infoForm.studentName,
                phone: infoForm.phone,
                classSubject: infoForm.classSubject,
            };
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editEnquiry/${enquiryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save info');
            setEnquiry((prev) => ({ ...prev, ...payload }));
            setIsEditingInfo(false);
        } catch (err) {
            console.error('Save info error:', err);
            alert(err.message || 'Failed to save');
        } finally {
            setUpdating(false);
        }
    };

    const saveNotes = async () => {
        setUpdating(true);
        try {
            const enquiryId = id || localStorage.getItem('enquiryId');
            const payload = { notes: notesForm.notes };
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editEnquiry/${enquiryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save notes');
            setEnquiry((prev) => ({ ...prev, ...payload }));
            setIsEditingNotes(false);
        } catch (err) {
            console.error('Save notes error:', err);
            alert(err.message || 'Failed to save');
        } finally {
            setUpdating(false);
        }
    };

    const saveTimeline = async () => {
        setUpdating(true);
        try {
            const enquiryId = id || localStorage.getItem('enquiryId');
            const payload = {
                enquiryDate: dateToDDMMYYYY(timelineForm.enquiryDate),
                followupDate: dateToDDMMYYYY(timelineForm.followupDate),
                followupType: timelineForm.followupType,
            };
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editEnquiry/${enquiryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save timeline');
            setEnquiry((prev) => ({ ...prev, ...payload }));
            setIsEditingTimeline(false);
        } catch (err) {
            console.error('Save timeline error:', err);
            alert(err.message || 'Failed to save');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading enquiry...</p></div></div>;
    if (error) return <div className="no-data">Error: {error}</div>;
    if (!enquiry) return <div className="no-data">Enquiry not found.</div>;

    return (
        <>
            <Navbar />
            <style>{`
                .enquiry-container {
                    padding: 2rem;
                    background: #f8fafc;
                    min-height: 100vh;
                }
                .enquiry-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .enquiry-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }
                @media (max-width: 768px) {
                    .enquiry-container {
                        padding: 1rem;
                    }
                    .enquiry-grid {
                        grid-template-columns: 1fr;
                    }
                    .enquiry-header h2 {
                        font-size: 1.25rem !important;
                    }
                }
            `}</style>
            <div className="enquiry-container">
                {/* Header with back button and status badge */}
                <div className="enquiry-header">
                    <div className='d-flex justify-content-between align-items-start' style={{ width: 'auto' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                            Enquiry Dashboard
                        </h2>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={handleDeleteEnquiry}
                            disabled={deleting}
                            aria-label="Delete enquiry"
                            title="Delete enquiry"
                        >
                            {deleting ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <i className="bi bi-trash" style={{ fontSize: '1rem' }}></i>
                            )}
                        </button>
                    </div>
                    {enquiry.status && (
                        <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            background: enquiry.status === 'converted' ? '#dcfce7' : '#fee2e2',
                            color: enquiry.status === 'converted' ? '#166534' : '#991b1b'
                        }}>
                            {enquiry.status}
                        </span>
                    )}
                </div>

                {/* Main Grid Layout - 2x2 on desktop, 4 column on mobile */}
                <div className="enquiry-grid">
                    {/* Student Info Card */}
                    <div style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                        {!isEditingInfo && <button
                            type="button"
                            aria-label="Edit info"
                            title="Edit Info"
                            onClick={() => setIsEditingInfo(true)}
                            style={{ position: 'absolute', right: '12px', top: '12px', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        }

                        {isEditingInfo ? (
                            <div>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <input value={infoForm.studentName} onChange={(e) => setInfoForm(prev => ({ ...prev, studentName: e.target.value }))} placeholder="Student name" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input value={infoForm.phone} onChange={(e) => setInfoForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none' }} />
                                    <input value={infoForm.classSubject} onChange={(e) => setInfoForm(prev => ({ ...prev, classSubject: e.target.value }))} placeholder="Subject/Class" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-sm btn-light" onClick={saveInfo} disabled={updating}>Save</button>
                                    <button className="btn btn-sm btn-outline-light" onClick={() => { setIsEditingInfo(false); setInfoForm({ studentName: enquiry.studentName, phone: enquiry.phone, classSubject: enquiry.classSubject }); }} disabled={updating}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '1rem'
                                    }}>
                                        <i className="fas fa-user" style={{ fontSize: '1.5rem' }}></i>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: "white" }}>{enquiry.studentName}</h3>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <i className="fas fa-phone" style={{ width: '20px', marginRight: '0.75rem' }}></i>
                                        <span style={{ fontSize: '0.95rem' }}>{enquiry.phone}</span>
                                        {enquiry.phone ? (<>
                                            <a
                                                href={`tel:${enquiry.phone}`}
                                                aria-label="make call"
                                                title="Make Call"
                                                className="phone-action-btn ms-2"
                                                style={{color:"white"}}
                                            >
                                                <i className="bi bi-telephone-outbound"></i>
                                            </a>
                                            <a
                                                title="WhatsApp"
                                                href={`https://wa.me/91${enquiry.phone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="phone-action-btn phone-action-btn-wa ms-2"
                                                style={{color:"white"}}
                                            >
                                                <i className="bi bi-whatsapp"></i>
                                            </a>
                                        </>) : (<>
                                            <button
                                                type="button"
                                                aria-label="make call"
                                                title="Make Call"
                                                className="phone-action-btn ms-2"
                                                style={{color:"white"}}
                                                disabled
                                            >
                                                <i className="bi bi-telephone-outbound"></i>
                                            </button>
                                            <button
                                                type="button"
                                                title="WhatsApp"
                                                aria-label="make call"
                                                disabled
                                                className="phone-action-btn phone-action-btn-wa ms-2"
                                                style={{color:"white"}}
                                            >
                                                <i className="bi bi-whatsapp"></i>
                                            </button>
                                        </>)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <i className="fas fa-book" style={{ width: '20px', marginRight: '0.75rem' }}></i>
                                        <span style={{ fontSize: '0.95rem' }}>{enquiry.classSubject}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>


                    {/* Notes Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                    }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                            <i className="fas fa-sticky-note me-2" style={{ color: '#6366f1' }}></i>
                            Notes
                        </h4>

                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '8px',
                            padding: '1rem',
                            minHeight: '100px',
                            color: '#4b5563',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            {isEditingNotes ? (
                                <div>
                                    <textarea
                                        value={notesForm.notes}
                                        onChange={(e) => setNotesForm(prev => ({ ...prev, notes: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            resize: 'vertical',
                                            fontSize: '0.95rem',
                                            color: '#374151'
                                        }}
                                        aria-label="Edit notes"
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button className="btn btn-sm btn-primary" onClick={saveNotes} disabled={updating}>Save</button>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => { setIsEditingNotes(false); setNotesForm({ notes: enquiry.notes || '' }); }} disabled={updating}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setIsEditingNotes(true)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingNotes(true); }}
                                    title="Click to edit notes"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {enquiry.notes || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>No notes available</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates Info Card */}
                    <div style={{
                        position: 'relative',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                    }}>
                        {!isEditingTimeline &&
                            <button
                                type="button"
                                aria-label="Edit timeline"
                                title="Edit Timeline"
                                onClick={() => setIsEditingTimeline(true)}
                                style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: '#6b7280', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                        }

                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                            <i className="fas fa-calendar-alt me-2" style={{ color: '#6366f1' }}></i>
                            Timeline
                        </h4>

                        {isEditingTimeline ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Enquiry Date</label>
                                        <DatePicker
                                            className="datePicker"
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="Select Followup Date"
                                            required
                                            showYearDropdown
                                            dropdownMode="select"
                                            yearDropdownItemNumber={10}
                                            scrollableYearDropdown
                                            selected={timelineForm.enquiryDate}
                                            onChange={(date) => setTimelineForm(prev => ({ ...prev, enquiryDate: date }))}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Followup Date</label>
                                        <DatePicker
                                            className="datePicker"
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="Select Followup Date"
                                            required
                                            showYearDropdown
                                            dropdownMode="select"
                                            yearDropdownItemNumber={10}
                                            scrollableYearDropdown
                                            selected={timelineForm.followupDate}
                                            onChange={(date) => setTimelineForm(prev => ({ ...prev, followupDate: date }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Followup Type</label>
                                    <select value={timelineForm.followupType} onChange={(e) => setTimelineForm(prev => ({ ...prev, followupType: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                        <option value="demo">Demo</option>
                                        <option value="call">Call</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-sm btn-primary" onClick={saveTimeline} disabled={updating}>Save</button>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => { setIsEditingTimeline(false); setTimelineForm({ enquiryDate: parseDDMMYYYYToDate(enquiry.enquiryDate), followupDate: parseDDMMYYYYToDate(enquiry.followupDate), followupType: enquiry.followupType || 'demo' }); }} disabled={updating}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f1f8ffff', borderRadius: '8px', width: '50%' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Enquiry Date</p>
                                        <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>{formatDate(enquiry.enquiryDate)}</p>
                                    </div>
                                    <i className="fas fa-calendar-check" style={{ fontSize: '1.5rem', color: '#6366f1', opacity: 0.6 }}></i>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', width: '50%' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>Followup Date</p>
                                        <p style={{ margin: 0, fontSize: '1rem', color: '#78350f', fontWeight: '600' }}>{formatDate(enquiry.followupDate)}</p>
                                    </div>
                                    <i className="fas fa-clock" style={{ fontSize: '1.5rem', color: '#f59e0b', opacity: 0.8 }}></i>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                    }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                            <i className="fas fa-tasks me-2" style={{ color: '#6366f1' }}></i>
                            Actions
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <i className="fas fa-phone-alt me-2" style={{ color: '#6366f1' }}></i>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
                                {enquiry.followupType}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem' }}>
                            <button
                                className="btn btn-success"
                                disabled={updating || enquiry.status === 'converted'}
                                onClick={() => updateStatus('converted')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    opacity: enquiry.status === 'converted' ? 0.5 : 1
                                }}
                            >
                                <i className="fas fa-check-circle me-2"></i>
                                {enquiry.status === 'converted' ? 'Converted' : 'Mark Converted'}
                            </button>
                            <button
                                className="btn btn-danger"
                                disabled={updating || enquiry.status === 'lost'}
                                onClick={() => updateStatus('lost')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    opacity: enquiry.status === 'lost' ? 0.5 : 1
                                }}
                            >
                                <i className="fas fa-times-circle me-2"></i>
                                {enquiry.status === 'lost' ? 'Lost' : 'Mark Lost'}
                            </button>
                            {enquiry.status && (
                                <button
                                    className="btn btn-secondary"
                                    disabled={updating}
                                    onClick={() => updateStatus(null)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <i className="fas fa-undo-alt me-2"></i>
                                    Clear Status
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
