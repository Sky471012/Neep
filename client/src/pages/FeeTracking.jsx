"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function FeeTracking() {

    const [admin, setAdmin] = useState(null);
    const [unpaidInstallments, setUnpaidInstallments] = useState([])
    const [totalUnpaidAmount, setTotalUnpaidAmount] = useState([])
    const [upcomingInstallments, setUpcomingInstallments] = useState([])
    const [totalUpcomingAmount, setTotalUpcomingAmount] = useState([])
    const [paidInstallments, setPaidInstallments] = useState([])
    const [totalPaidAmount, setTotalPaidAmount] = useState([])
    const [selectedUnpaidClass, setSelectedUnpaidClass] = useState(null)
    const [selectedUpcomingClass, setSelectedUpcomingClass] = useState(null)
    const [selectedPaidClass, setSelectedPaidClass] = useState(null)
    const [unpaidSortOrder, setUnpaidSortOrder] = useState("desc")
    const [upcomingSortOrder, setUpcomingSortOrder] = useState("asc")
    const [paidSortOrder, setPaidSortOrder] = useState("asc")
    const [activeFeeTab, setActiveFeeTab] = useState("unpaid");

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

    const sortInstallments = (data, order) => {
        return [...data].sort((a, b) =>
            order === "asc"
                ? new Date(a.dueDate) - new Date(b.dueDate)
                : new Date(b.dueDate) - new Date(a.dueDate)
        );
    };


    useEffect(() => {
        const storedAdmin = localStorage.getItem("user");
        const token = localStorage.getItem("authToken")
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch unpaid installments
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/unpaid`, { headers })
            .then((res) => res.json())
            .then((data) => {
                const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                setUnpaidInstallments(sorted)
            })
            .catch((err) => console.error("Error loading unpaid installments:", err))

        // Fetch upcoming installments
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/upcoming`, { headers })
            .then((res) => res.json())
            .then((data) => {
                const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                setUpcomingInstallments(sorted)
            })
            .catch((err) => console.error("Error loading upcoming installments:", err))

        // Fetch paid installments
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/paid`, { headers })
            .then((res) => res.json())
            .then((data) => {
                const sorted = data.installments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                setPaidInstallments(sorted)
            })
            .catch((err) => console.error("Error loading paid installments:", err))

    }, []);


    // Compute filtered lists & totals before return
const filteredUnpaid = unpaidInstallments.filter(
  (inst) => !selectedUnpaidClass || inst.studentId?.class === selectedUnpaidClass
);
const unpaidTotal = filteredUnpaid.reduce((sum, inst) => sum + (inst.amount || 0), 0);

const filteredUpcoming = upcomingInstallments.filter(
  (inst) => !selectedUpcomingClass || inst.studentId?.class === selectedUpcomingClass
);
const upcomingTotal = filteredUpcoming.reduce((sum, inst) => sum + (inst.amount || 0), 0);

const filteredPaid = paidInstallments.filter(
  (inst) => !selectedPaidClass || inst.studentId?.class === selectedPaidClass
);
const paidTotal = filteredPaid.reduce((sum, inst) => sum + (inst.amount || 0), 0);

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
            <h4>Unpaid</h4>
            <div className="fee-amount">₹ {unpaidTotal}</div>
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
                      <div className="dropdown-item p-2">
                        Filter by Class:
                        <ul className="list-unstyled border mt-1">
                          {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(
                            (cls) => (
                              <li key={cls}>
                                <button
                                  className="btn btn-sm text-start fw-normal pt-1 pb-0"
                                  onClick={() => setSelectedUnpaidClass(cls)}
                                >
                                  {cls}
                                </button>
                              </li>
                            )
                          )}
                          <li>
                            <button
                              className="btn btn-sm text-start text-danger"
                              onClick={() => setSelectedUnpaidClass(null)}
                            >
                              Clear Filter
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="installments-list">
                {filteredUnpaid.map((inst) => {
                  const student = inst.studentId;
                  return (
                    <Link key={inst._id} to={`/student/${student._id}`} className="installment-item">
                      <div className="installment-header">
                        <h5>{student?.name || "Unknown"}</h5>
                        <span className="amount">₹ {inst.amount || 0}/-</span>
                      </div>
                      <div className="installment-details">
                        <div className="d-flex">
                          <span>Class: {student?.class || "--"}
                          <br/>
                          Installment #: {inst.installmentNo || 0}</span>
                        </div>
                        <span className="overdue">{getDaysOverdue(inst.dueDate)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Tab */}
        {activeFeeTab === "upcoming" && (
          <div className="upcoming">
            <h4>Upcoming</h4>
            <div className="fee-amount">₹ {upcomingTotal}</div>
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
                      <div className="dropdown-item p-2">
                        Filter by Class:
                        <ul className="list-unstyled border mt-1">
                          {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(
                            (cls) => (
                              <li key={cls}>
                                <button
                                  className="btn btn-sm text-start fw-normal pt-1 pb-0"
                                  onClick={() => setSelectedUpcomingClass(cls)}
                                >
                                  {cls}
                                </button>
                              </li>
                            )
                          )}
                          <li>
                            <button
                              className="btn btn-sm text-start text-danger"
                              onClick={() => setSelectedUpcomingClass(null)}
                            >
                              Clear Filter
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="installments-list">
                {filteredUpcoming.map((inst) => {
                  const student = inst.studentId;
                  return (
                    <Link key={inst._id} to={`/student/${student._id}`} className="installment-item">
                      <div className="installment-header">
                        <h5>{student?.name || "Unknown"}</h5>
                        <span className="amount">₹ {inst.amount || 0}/-</span>
                      </div>
                      <div className="installment-details">
                        <div className="d-flex">
                          <span>Class: {student?.class || "--"}
                            <br/>
                          Installment #: {inst.installmentNo || 0}</span>
                        </div>
                        <span className="upcoming-date">{getDaysLeft(inst.dueDate)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Paid Tab */}
        {activeFeeTab === "paid" && (
          <div className="paid">
            <h4>Paid</h4>
            <div className="fee-amount">₹ {paidTotal}</div>
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
                          const sorted = sortInstallments(paidInstallments, "asc");
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
                          const sorted = sortInstallments(paidInstallments, "desc");
                          setPaidInstallments(sorted);
                          setPaidSortOrder("desc");
                        }}
                      >
                        Newest First
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
                                  className="btn btn-sm text-start fw-normal pt-1 pb-0"
                                  onClick={() => setSelectedPaidClass(cls)}
                                >
                                  {cls}
                                </button>
                              </li>
                            )
                          )}
                          <li>
                            <button
                              className="btn btn-sm text-start text-danger"
                              onClick={() => setSelectedPaidClass(null)}
                            >
                              Clear Filter
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="installments-list">
                {filteredPaid.map((inst) => {
                  const student = inst.studentId;
                  return (
                    <Link key={inst._id} to={`/student/${student._id}`} className="installment-item">
                      <div className="installment-header">
                        <h5>{student?.name || "Unknown"}</h5>
                        <span className="amount">₹ {inst.amount || 0}/-</span>
                      </div>
                      <div className="installment-details">
                        <div className="d-flex">
                          <span>Class: {student?.class || "--"}
                            <br/>
                          Installment #: {inst.installmentNo || 0}</span>
                        </div>
                        <span className="paid-date">{getDaysSincePaid(inst.paidDate)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);

}
