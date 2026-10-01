"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"
import DatePicker from "react-datepicker";

export default function FeeTracking() {

  const [admin, setAdmin] = useState(null);
  const [unpaidInstallments, setUnpaidInstallments] = useState([])
  const [upcomingInstallments, setUpcomingInstallments] = useState([])
  const [paidInstallments, setPaidInstallments] = useState([])
  const [selectedUnpaidClass, setSelectedUnpaidClass] = useState(null)
  const [selectedUpcomingClass, setSelectedUpcomingClass] = useState(null)
  const [selectedPaidClass, setSelectedPaidClass] = useState(null)
  const [unpaidSortOrder, setUnpaidSortOrder] = useState("desc")
  const [upcomingSortOrder, setUpcomingSortOrder] = useState("asc")
  const [paidSortOrder, setPaidSortOrder] = useState("asc")
  const [activeFeeTab, setActiveFeeTab] = useState("unpaid");
  const [medium, setMedium] = useState(null);
  const [unpaidSearch, setUnpaidSearch] = useState("");
  const [upcomingSearch, setUpcomingSearch] = useState("");
  const [paidSearch, setPaidSearch] = useState("");
  const [modalOne, setModalOne] = useState(false);
  const [modalTwo, setModalTwo] = useState(false);
  const [modalThree, setModalThree] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState(null);
  const [editingSource, setEditingSource] = useState(null); // "unpaid" | "upcoming"
  const [editedAmount, setEditedAmount] = useState(0);
  const [editedDueDate, setEditedDueDate] = useState(null);
  const [editedPaidDate, setEditedPaidDate] = useState(null);
  const [editedMethod, setEditedMethod] = useState("Cash");
  const [fromDateUnpaid, setFromDateUnpaid] = useState(null);
  const [toDateUnpaid, setToDateUnpaid] = useState(null);
  const [fromDateUpcoming, setFromDateUpcoming] = useState(null);
  const [toDateUpcoming, setToDateUpcoming] = useState(null);
  const [fromDatePaid, setFromDatePaid] = useState(null);
  const [toDatePaid, setToDatePaid] = useState(null);
  const [draftFromDateUnpaid, setDraftFromDateUnpaid] = useState(null);
  const [draftToDateUnpaid, setDraftToDateUnpaid] = useState(null);
  const [draftFromDateUpcoming, setDraftFromDateUpcoming] = useState(null);
  const [draftToDateUpcoming, setDraftToDateUpcoming] = useState(null);
  const [draftFromDatePaid, setDraftFromDatePaid] = useState(null);
  const [draftToDatePaid, setDraftToDatePaid] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDaysOverdue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24)); // days
    return diff > 0 ? `${diff} days ago` : "Due today";
  };

  function getDaysLeft(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);

    // Clear time components for accurate day difference
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffInMs = due - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Due today";
    if (diffInDays === 1) return "Due tomorrow";
    return `${diffInDays} days left`;
  }

  function getDaysSincePaid(paidDate) {
    if (!paidDate) return "Not Paid";

    const paid = new Date(paidDate);
    const today = new Date();

    // Clear time part
    paid.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffInMs = today - paid;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays === 0
      ? "Paid today"
      : `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const sortInstallments = (data, order, dateField = "dueDate") => {
    return [...data].sort((a, b) =>
      order === "asc"
        ? new Date(a[dateField]) - new Date(b[dateField])
        : new Date(b[dateField]) - new Date(a[dateField])
    );
  };

  const handleToggleMedium = (m) => () => {
    setMedium((prev) => (prev === m ? null : m));
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem("user");
    const token = localStorage.getItem("authToken")
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/unpaid`, { headers })
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          setUnpaidInstallments(sorted)
        })
        .catch((err) => console.error("Error loading unpaid installments:", err)),

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/upcoming`, { headers })
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          setUpcomingInstallments(sorted)
        })
        .catch((err) => console.error("Error loading upcoming installments:", err)),

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/paid`, { headers })
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.installments.sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))
          setPaidInstallments(sorted)
        })
        .catch((err) => console.error("Error loading paid installments:", err)),
    ]).finally(() => setLoading(false));

  }, []);


  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  // Format a Date as YYYY-MM-DD using local time (avoids the UTC shift that
  // toISOString() introduces for timezones ahead of UTC, e.g. IST).
  const toLocalDateStr = (d) => {
    if (!d) return null;
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const formatWhatsAppDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };
  const inDateRange = (value, from, to) => {
    if (!value) return !from && !to;
    const d = new Date(value);
    return (!from || d >= startOfDay(from)) && (!to || d <= endOfDay(to));
  };

  // Compute filtered lists & totals before return
  const filteredUnpaid = unpaidInstallments.filter((inst) => {
    const matchClass = !selectedUnpaidClass || inst.studentId?.class === selectedUnpaidClass;
    const matchDate =
      (!fromDateUnpaid && !toDateUnpaid) ||
      inDateRange(inst.dueDate, fromDateUnpaid, toDateUnpaid);
    return matchClass && matchDate;
  });
  const unpaidTotal = filteredUnpaid.reduce((sum, inst) => sum + (inst.amount || 0), 0);

  const filteredUpcoming = upcomingInstallments.filter((inst) => {
    const matchClass = !selectedUpcomingClass || inst.studentId?.class === selectedUpcomingClass;
    const matchDate =
      (!fromDateUpcoming && !toDateUpcoming) ||
      inDateRange(inst.dueDate, fromDateUpcoming, toDateUpcoming);
    return matchClass && matchDate;
  });
  const upcomingTotal = filteredUpcoming.reduce((sum, inst) => sum + (inst.amount || 0), 0);

  const filteredPaid = paidInstallments.filter((inst) => {
    const matchClass = !selectedPaidClass || inst.studentId?.class === selectedPaidClass;
    const matchMedium = !medium || inst.method?.toLowerCase() === medium.toLowerCase();
    const matchDate =
      (!fromDatePaid && !toDatePaid) ||
      inDateRange(inst.paidDate, fromDatePaid, toDatePaid);
    return matchClass && matchMedium && matchDate;
  });
  const paidTotal = filteredPaid.reduce((sum, inst) => sum + (inst.amount || 0), 0);

  const openEditModal = (inst, source) => {
    setEditingInst(inst);
    setEditingSource(source);
    setEditedAmount(inst.amount || 0);
    setEditedDueDate(inst.dueDate ? new Date(inst.dueDate) : new Date());
    const parsedPaid = inst.paidDate ? new Date(inst.paidDate) : null;
    setEditedPaidDate(parsedPaid && !isNaN(parsedPaid) ? parsedPaid : null);
    setEditedMethod(inst.method || "Cash");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingInst(null);
    setEditingSource(null);
    setEditedAmount(0);
    setEditedDueDate(null);
    setEditedPaidDate(null);
    setEditedMethod("Cash");
  };

  const handleSaveEditedInstallment = async (sendWhatsApp = false) => {
    if (!editingInst) return;
    const token = localStorage.getItem("authToken");
    const whatsappWindow = sendWhatsApp ? window.open("about:blank", "_blank") : null;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/updateInstallment/${editingInst._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: editedAmount,
            dueDate: toLocalDateStr(editedDueDate),
            paidDate: toLocalDateStr(editedPaidDate) || null,
            method: editedPaidDate ? editedMethod : null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update installment");
        return;
      }

      const newDueDateStr = toLocalDateStr(editedDueDate);
      const newPaidDateStr = toLocalDateStr(editedPaidDate) || null;
      const updated = {
        ...editingInst,
        amount: editedAmount,
        dueDate: newDueDateStr,
        paidDate: newPaidDateStr,
        method: newPaidDateStr ? editedMethod : null,
      };

      const removeFrom = (list, id) => list.filter((i) => i._id !== id);
      const today = startOfDay(new Date());
      const isPaid = !!newPaidDateStr;
      const isOverdue = !isPaid && new Date(newDueDateStr) < today;
      const destination = isPaid ? "paid" : isOverdue ? "unpaid" : "upcoming";

      setUnpaidInstallments((prev) => {
        let next = removeFrom(prev, updated._id);
        if (destination === "unpaid") next = sortInstallments([...next, updated], unpaidSortOrder);
        return next;
      });
      setUpcomingInstallments((prev) => {
        let next = removeFrom(prev, updated._id);
        if (destination === "upcoming") next = sortInstallments([...next, updated], upcomingSortOrder);
        return next;
      });
      setPaidInstallments((prev) => {
        let next = removeFrom(prev, updated._id);
        if (destination === "paid") next = sortInstallments([...next, updated], paidSortOrder, "paidDate");
        return next;
      });

      if (sendWhatsApp) {
        const getId = (value) => String(value?._id || value || "");
        const studentId = getId(editingInst.studentId);
        const feeId = getId(editingInst.feeId);
        const remainingItems = [
          ...unpaidInstallments,
          ...upcomingInstallments,
        ].filter((installment) => {
          if (installment._id === updated._id || installment.paidDate) return false;
          const sameFee = feeId && getId(installment.feeId) === feeId;
          const sameStudent = !feeId && getId(installment.studentId) === studentId;
          return sameFee || sameStudent;
        });
        const remainingInstallments = remainingItems.length + (newPaidDateStr ? 0 : 1);
        const totalInstallments = Number(editingInst.installmentNo || 0) + remainingInstallments;
        const nextInstallment = remainingItems
          .filter((installment) => !installment.paidDate)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
        const phone = String(editingInst.studentId?.phone || "").replace(/\D/g, "");
        if (!phone) {
          whatsappWindow?.close();
          alert("This student does not have a phone number for WhatsApp.");
        } else {
          const whatsappPhone = phone.length === 10 ? `91${phone}` : phone;
          const status = newPaidDateStr ? "Paid" : "Due";
          const paidMessage = newPaidDateStr
            ? remainingInstallments > 0
              ? `A fee payment of *₹${Number(editedAmount || 0).toLocaleString("en-IN")}* has been successfully received for the *installment number ${editingInst.installmentNo || "N/A"} of toatl ${totalInstallments} installments*. The installment was due on *${formatWhatsAppDate(newDueDateStr)}* and is paid on *${formatWhatsAppDate(newPaidDateStr)}*.The next installment is due on *${formatWhatsAppDate(nextInstallment?.dueDate)}*.`
              : `A fee payment of *₹${Number(editedAmount || 0).toLocaleString("en-IN")}* has been successfully received for the *final installment of total ${totalInstallments} installments*. The installment was due on *${formatWhatsAppDate(newDueDateStr)}* and was paid on *${formatWhatsAppDate(newPaidDateStr)}*. All scheduled installments have now been paid.`
            : `Your installment details have been updated successfully. The *due date* is *${formatWhatsAppDate(newDueDateStr)}*, and the current *status* is *${status}*.`;
          const message = [
            `Dear *${editingInst.studentId?.name || "Student"}*,\n`,
            paidMessage,
            "Your payment receipt is available on the NEEP website. Please visit *www.neep.in*, log in to your account and download the receipt.\n",
            "*NEEP – New Era Education Point*",
          ].filter((line) => line !== null).join("\n");
          const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
          if (whatsappWindow) whatsappWindow.location.href = whatsappUrl;
          else window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }
      }

      closeEditModal();
    } catch (err) {
      console.error("Error updating installment:", err);
      alert("Something went wrong while updating installment.");
    }
  };

  if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading fee tracking...</p></div></div>);

  return (
    <>
      <Navbar />

      <div className="data-section">
        <div className="section-header justify-content-center">
          <div className="d-flex mx-2">
            <h2 className="batches-title">Fee Tracking</h2>
          </div>
        </div>

        <div className="fee-cards-container fee-card">
          <div className="fee-controls">
            <button
              className={activeFeeTab === "unpaid" ? "unpaid-btn active" : "unpaid-btn"}
              onClick={() => setActiveFeeTab("unpaid")}
            >
              Unpaid
            </button>
            <button
              className={activeFeeTab === "upcoming" ? "upcoming-btn active" : "upcoming-btn"}
              onClick={() => setActiveFeeTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={activeFeeTab === "paid" ? "paid-btn active" : "paid-btn"}
              onClick={() => setActiveFeeTab("paid")}
            >
              Paid
            </button>
          </div>

          {/* Unpaid Tab */}
          {activeFeeTab === "unpaid" && (
            <div className="unpaid">

              <div className="fee-search">
                <i className="bi bi-search"></i>
                <input
                  type="search"
                  placeholder="Search by Student's Name..."
                  value={unpaidSearch}
                  onChange={(e) => setUnpaidSearch(e.target.value)}
                />
              </div>

              <h4>Unpaid</h4>
              <div className="fee-amount">₹ {unpaidTotal.toLocaleString("en-IN")}</div>
              <div className="fee-summary-count">
                {filteredUnpaid.length} {filteredUnpaid.length === 1 ? "installment" : "installments"}
              </div>
              <div className="installments-section">
                <div className="installments-header">
                  <span>Installments</span>
                  <div className="dropdown">
                    <button className="btn" type="button" data-bs-toggle="dropdown">
                      Filter <i className="fas fa-cog"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            const sorted = sortInstallments(unpaidInstallments, "asc");
                            setUnpaidInstallments(sorted);
                            setUnpaidSortOrder("asc");
                          }}
                        >
                          Oldest First
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            const sorted = sortInstallments(unpaidInstallments, "desc");
                            setUnpaidInstallments(sorted);
                            setUnpaidSortOrder("desc");
                          }}
                        >
                          Newest First
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setDraftFromDateUnpaid(fromDateUnpaid);
                            setDraftToDateUnpaid(toDateUnpaid);
                            setModalOne(true);
                          }}
                        >
                          Filter by Date
                        </button>
                      </li>
                      <li>
                        <div className="dropdown-item p-2">
                          Filter by Class:
                          <ul className="list-unstyled border mt-1">
                            {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(
                              (cls) => (
                                <li key={cls}>
                                  <button
                                    className="btn btn-sm text-start fw-normal pt-1 pb-0 w-100"
                                    onClick={() => setSelectedUnpaidClass(cls)}
                                  >
                                    {cls}
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                            <button
                              className="btn btn-sm text-start text-danger w-100"
                              onClick={() => { setSelectedUnpaidClass(null); setFromDateUnpaid(null); setToDateUnpaid(null); setDraftFromDateUnpaid(null); setDraftToDateUnpaid(null); }}
                            >
                              Clear Filters
                            </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="installments-list">
                  {filteredUnpaid
                    .filter(
                      (inst) =>
                        inst.studentId.name.toLowerCase().includes(unpaidSearch.toLowerCase())
                    )
                    .map((inst) => {
                      const student = inst.studentId;
                      return (
                        <div key={inst._id} className="installment-item">
                          <div className="installment-header">
                            <h5>{student?.name || "Unknown"}</h5>
                            <div className="d-flex align-items-center gap-2">
                              <span className="amount">₹ {inst.amount || 0}/-</span>
                              <Link to={`/student/${student._id}`} className="installment-link" title="Open student page">
                                <i className="bi bi-box-arrow-up-right"></i>
                              </Link>
                            </div>
                          </div>
                          <div className="installment-details">
                            <div className="d-flex">
                              <span>Class: {student?.class || "--"}
                                <br />
                                Installment #: {inst.installmentNo || 0}</span>
                            </div>
                            <div className="d-flex flex-column align-items-end gap-1">
                              <button
                                type="button"
                                className="installment-edit-btn"
                                title="Edit installment"
                                onClick={() => openEditModal(inst, "unpaid")}
                              >
                                <i className="bi bi-pencil-square"></i>
                                <span>Edit</span>
                              </button>
                              <span className="overdue">{getDaysOverdue(inst.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Tab */}
          {activeFeeTab === "upcoming" && (
            <div className="upcoming">

              <div className="fee-search">
                <i className="bi bi-search"></i>
                <input
                  type="search"
                  placeholder="Search by Student's Name..."
                  value={upcomingSearch}
                  onChange={(e) => setUpcomingSearch(e.target.value)}
                />
              </div>

              <h4>Upcoming</h4>
              <div className="fee-amount">₹ {upcomingTotal.toLocaleString("en-IN")}</div>
              <div className="fee-summary-count">
                {filteredUpcoming.length} {filteredUpcoming.length === 1 ? "installment" : "installments"}
              </div>
              <div className="installments-section">
                <div className="installments-header">
                  <span>Installments</span>
                  <div className="dropdown">
                    <button className="btn" type="button" data-bs-toggle="dropdown">
                      Filter <i className="fas fa-cog"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            const sorted = sortInstallments(upcomingInstallments, "asc");
                            setUpcomingInstallments(sorted);
                            setUpcomingSortOrder("asc");
                          }}
                        >
                          Oldest First
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            const sorted = sortInstallments(upcomingInstallments, "desc");
                            setUpcomingInstallments(sorted);
                            setUpcomingSortOrder("desc");
                          }}
                        >
                          Newest First
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setDraftFromDateUpcoming(fromDateUpcoming);
                            setDraftToDateUpcoming(toDateUpcoming);
                            setModalTwo(true);
                          }}
                        >
                          Filter by Date
                        </button>
                      </li>
                      <li>
                        <div className="dropdown-item p-2">
                          Filter by Class:
                          <ul className="list-unstyled border mt-1">
                            {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(
                              (cls) => (
                                <li key={cls}>
                                  <button
                                    className="btn btn-sm text-start fw-normal pt-1 pb-0 w-100"
                                    onClick={() => setSelectedUpcomingClass(cls)}
                                  >
                                    {cls}
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                            <button
                              className="btn btn-sm text-start text-danger w-100"
                              onClick={() => { setSelectedUpcomingClass(null); setFromDateUpcoming(null); setToDateUpcoming(null); setDraftFromDateUpcoming(null); setDraftToDateUpcoming(null); }}
                            >
                              Clear Filter
                            </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="installments-list">
                  {filteredUpcoming
                    .filter(
                      (inst) =>
                        inst.studentId.name.toLowerCase().includes(upcomingSearch.toLowerCase())
                    )
                    .map((inst) => {
                      const student = inst.studentId;
                      return (
                        <div key={inst._id} className="installment-item">
                          <div className="installment-header">
                            <h5>{student?.name || "Unknown"}</h5>
                            <div className="d-flex align-items-center gap-2">
                              <span className="amount">₹ {inst.amount || 0}/-</span>
                              <Link to={`/student/${student._id}`} className="installment-link" title="Open student page">
                                <i className="bi bi-box-arrow-up-right"></i>
                              </Link>
                            </div>
                          </div>
                          <div className="installment-details">
                            <div className="d-flex">
                              <span>Class: {student?.class || "--"}
                                <br />
                                Installment #: {inst.installmentNo || 0}</span>
                            </div>
                            <div className="d-flex flex-column align-items-end gap-1">
                              <button
                                type="button"
                                className="installment-edit-btn"
                                title="Edit installment"
                                onClick={() => openEditModal(inst, "upcoming")}
                              >
                                <i className="bi bi-pencil-square"></i>
                                <span>Edit</span>
                              </button>
                              <span className="upcoming-date">{getDaysLeft(inst.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Paid Tab */}
          {activeFeeTab === "paid" && (
            <div className="paid">

              <div className="fee-search">
                <i className="bi bi-search"></i>
                <input
                  type="search"
                  placeholder="Search by Student's Name..."
                  value={paidSearch}
                  onChange={(e) => setPaidSearch(e.target.value)}
                />
              </div>

              <h4>Paid</h4>
              <div className="fee-amount">₹ {paidTotal.toLocaleString("en-IN")}</div>
              <div className="fee-summary-count">
                {filteredPaid.length} {filteredPaid.length === 1 ? "installment" : "installments"}
              </div>
              <div className="medium-container">
                <button
                  type="button"
                  className={`btn ${medium === "Cash" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={handleToggleMedium("Cash")}
                >
                  Cash
                </button>

                <button
                  type="button"
                  className={`btn ${medium === "Online" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={handleToggleMedium("Online")}
                >
                  Online
                </button>
              </div>
              <div className="installments-section">
                <div className="installments-header">
                  <span>Installments</span>
                  <div className="dropdown">
                    <button className="btn" type="button" data-bs-toggle="dropdown">
                      Filter <i className="fas fa-cog"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            const sorted = sortInstallments(paidInstallments, "asc", "paidDate");
                            setPaidInstallments(sorted);
                            setPaidSortOrder("asc");
                          }}
                        >
                          Oldest First
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            const sorted = sortInstallments(paidInstallments, "desc", "paidDate");
                            setPaidInstallments(sorted);
                            setPaidSortOrder("desc");
                          }}
                        >
                          Newest First
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setDraftFromDatePaid(fromDatePaid);
                            setDraftToDatePaid(toDatePaid);
                            setModalThree(true);
                          }}
                        >
                          Filter by Date
                        </button>
                      </li>
                      <li>
                        <div className="dropdown-item p-2">
                          Filter by Class:
                          <ul className="list-unstyled border mt-1">
                            {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(
                              (cls) => (
                                <li key={cls}>
                                  <button
                                    className="btn btn-sm text-start fw-normal pt-1 pb-0 w-100"
                                    onClick={() => setSelectedPaidClass(cls)}
                                  >
                                    {cls}
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                            <button
                              className="btn btn-sm text-start text-danger w-100"
                              onClick={() => { setSelectedPaidClass(null); setFromDatePaid(null); setToDatePaid(null); setDraftFromDatePaid(null); setDraftToDatePaid(null); }}
                            >
                              Clear Filter
                            </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="installments-list">
                  {filteredPaid
                    .filter(
                      (inst) =>
                        inst.studentId.name.toLowerCase().includes(paidSearch.toLowerCase())
                    )
                    .map((inst) => {
                      const student = inst.studentId;
                      return (
                        <div key={inst._id} className="installment-item">
                          <div className="installment-header">
                            <h5>{student?.name || "Unknown"}</h5>
                            <div className="d-flex align-items-center gap-2">
                              <span className="amount">₹ {inst.amount || 0}/-</span>
                              <Link to={`/student/${student._id}`} className="installment-link" title="Open student page">
                                <i className="bi bi-box-arrow-up-right"></i>
                              </Link>
                            </div>
                          </div>
                          <div className="installment-details">
                            <div className="d-flex">
                              <span>Class: {student?.class || "--"}
                                <br />
                                Installment #: {inst.installmentNo || 0}</span>
                            </div>
                            <span className="paid-date">{getDaysSincePaid(inst.paidDate)}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalOne
        isOpen={modalOne}
        onClose={() => {
          setModalOne(false);
          setDraftFromDateUnpaid(fromDateUnpaid);
          setDraftToDateUnpaid(toDateUnpaid);
        }}
      >
        <div className="addToBatch-box d-flex flex-column">
          <h3 className="modal-title">Filter by Date</h3>

          <div className="mb-3">
            <label className="form-label">From:</label>
            <DatePicker
              selected={draftFromDateUnpaid}
              onChange={(date) => setDraftFromDateUnpaid(date)}
              scrollableYearDropdown
              className="form-control"
              dateFormat="dd-MM-yyyy"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              placeholderText="DD-MM-YYYY"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">To:</label>
            <DatePicker
              selected={draftToDateUnpaid}
              onChange={(date) => setDraftToDateUnpaid(date)}
              scrollableYearDropdown
              className="form-control"
              dateFormat="dd-MM-yyyy"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              placeholderText="DD-MM-YYYY"
            />
          </div>

          <button
            className="btn btn-primary mt-4 m-auto"
            onClick={() => {
              setFromDateUnpaid(draftFromDateUnpaid);
              setToDateUnpaid(draftToDateUnpaid);
              setModalOne(false);
            }}
          >
            Apply Filter
          </button>
        </div>
      </ModalOne>

      <ModalTwo
        isOpen={modalTwo}
        onClose={() => {
          setModalTwo(false);
          setDraftFromDateUpcoming(fromDateUpcoming);
          setDraftToDateUpcoming(toDateUpcoming);
        }}
      >
        <div className="addToBatch-box d-flex flex-column">
          <h3 className="modal-title">Filter by Date</h3>

          <div className="mb-3">
            <label className="form-label">From:</label>
            <DatePicker
              selected={draftFromDateUpcoming}
              onChange={(date) => setDraftFromDateUpcoming(date)}
              scrollableYearDropdown
              className="form-control"
              dateFormat="dd-MM-yyyy"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              placeholderText="DD-MM-YYYY"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">To:</label>
            <DatePicker
              selected={draftToDateUpcoming}
              onChange={(date) => setDraftToDateUpcoming(date)}
              scrollableYearDropdown
              className="form-control"
              dateFormat="dd-MM-yyyy"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              placeholderText="DD-MM-YYYY"
            />
          </div>

          <div className="d-flex gap-2 mb-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => {
                const t = startOfDay(new Date());
                t.setDate(t.getDate() + 1);
                setDraftFromDateUpcoming(t);
                setDraftToDateUpcoming(t);
              }}
            >
              Tomorrow
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => {
                const t = startOfDay(new Date());
                setDraftFromDateUpcoming(t);
                setDraftToDateUpcoming(t);
              }}
            >
              Today
            </button>
          </div>

          <button
            className="btn btn-primary mt-4 m-auto"
            onClick={() => {
              setFromDateUpcoming(draftFromDateUpcoming);
              setToDateUpcoming(draftToDateUpcoming);
              setModalTwo(false);
            }}
          >
            Apply Filter
          </button>
        </div>
      </ModalTwo>

      <ModalThree
        isOpen={modalThree}
        onClose={() => {
          setModalThree(false);
          setDraftFromDatePaid(fromDatePaid);
          setDraftToDatePaid(toDatePaid);
        }}
      >
        <div className="addToBatch-box d-flex flex-column">
          <h3 className="modal-title">Filter by Date</h3>

          <div className="mb-3">
            <label className="form-label">From:</label>
            <DatePicker
              selected={draftFromDatePaid}
              onChange={(date) => setDraftFromDatePaid(date)}
              scrollableYearDropdown
              className="form-control"
              dateFormat="dd-MM-yyyy"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              placeholderText="DD-MM-YYYY"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">To:</label>
            <DatePicker
              selected={draftToDatePaid}
              onChange={(date) => setDraftToDatePaid(date)}
              scrollableYearDropdown
              className="form-control"
              dateFormat="dd-MM-yyyy"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              placeholderText="DD-MM-YYYY"
            />
          </div>

          <div className="d-flex gap-2 mb-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => {
                const t = startOfDay(new Date());
                t.setDate(t.getDate() - 1);
                setDraftFromDatePaid(t);
                setDraftToDatePaid(t);
              }}
            >
              Yesterday
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => {
                const t = startOfDay(new Date());
                setDraftFromDatePaid(t);
                setDraftToDatePaid(t);
              }}
            >
              Today
            </button>
          </div>

          <button
            className="btn btn-primary mt-4 m-auto"
            onClick={() => {
              setFromDatePaid(draftFromDatePaid);
              setToDatePaid(draftToDatePaid);
              setModalThree(false);
            }}
          >
            Apply Filter
          </button>
        </div>
      </ModalThree>

      <ModalFour isOpen={editModalOpen} onClose={closeEditModal}>
        <div className="addToBatch-box" style={{ minWidth: "320px" }}>
          <h3 className="modal-title mb-3">
            Installment {editingInst?.installmentNo ?? ""}
            {editingInst?.studentId?.name ? ` - ${editingInst.studentId.name}` : ""}
          </h3>

          <div className="mb-2 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: "90px" }}>Amount: ₹</label>
            <input
              type="number"
              className="form-control"
              value={editedAmount}
              onChange={(e) => setEditedAmount(Number(e.target.value))}
            />
          </div>

          <div className="mb-2 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: "90px" }}>Due Date:</label>
            <DatePicker
              scrollableYearDropdown
              selected={editedDueDate}
              onChange={(date) => setEditedDueDate(date)}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              isClearable
              portalId="datepicker-portal"
              popperProps={{ strategy: "fixed" }}
            />
          </div>

          <div className="mb-2 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: "90px" }}>Paid Date:</label>
            <DatePicker
              scrollableYearDropdown
              selected={editedPaidDate}
              onChange={(date) => setEditedPaidDate(date)}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="Not paid"
              showYearDropdown
              yearDropdownItemNumber={10}
              dropdownMode="select"
              isClearable
              portalId="datepicker-portal"
              popperProps={{ strategy: "fixed" }}
            />
          </div>

          <div className="mb-3 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: "90px" }}>Method:</label>
            <select
              className="form-select"
              value={editedMethod}
              onChange={(e) => setEditedMethod(e.target.value)}
              disabled={!editedPaidDate}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span
              className={`fw-bold ${editedPaidDate ? "text-success" : "text-warning"}`}
            >
              {editedPaidDate ? "Paid" : "Due"}
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
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
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleSaveEditedInstallment}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleSaveEditedInstallment(true)}
              >
                Save & send
              </button>
            </div>
          </div>
        </div>
      </ModalFour>

    </>
  );

}
