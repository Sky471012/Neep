"use client"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import Navbar from "../components/Navbar"
import ModalOne from "../modals/ModalOne"
import ModalTwo from "../modals/ModalTwo"
import ModalThree from "../modals/ModalThree"
import ModalFour from "../modals/ModalFour"
import Popup from "../modals/Popup"
import ExcelUpload from "../components/ExcelUpload"
import "@fortawesome/fontawesome-free/css/all.css"
import "../css/admin.css"

export default function Admin() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [batchesRecords, setBatchesRecords] = useState([])
  const [archivedBatchesRecords, setArchivedBatchesRecords] = useState([])
  const [studentsRecords, setStudentsRecords] = useState([])
  const [teachersRecords, setTeachersRecords] = useState([])
  const [teacher, setTeacher] = useState({})
  const [openModalOne, setOpenModalOne] = useState(false)
  const [openModalTwo, setOpenModalTwo] = useState(false)
  const [openModalThree, setOpenModalThree] = useState(false)
  const [openModalFour, setOpenModalFour] = useState(false)
  const [openPopupModal, setOpenPopupModal] = useState(false)
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [dob, setDob] = useState("")
  const [dateOfJoining, setDateOfJoining] = useState(new Date())
  const [startDate, setStartDate] = useState(new Date())
  const [showFeeTracking, setShowFeeTracking] = useState(false)
  const [todaysClasses, setTodaysClasses] = useState([])
  const [credentials, setCredentials] = useState({
    studentName: "",
    studentPhone: "",
    studentAddress: "",
    studentClass: "",
    teacherName: "",
    teacherEmail: "",
    teacherPhone: "",
  })
  const [showBatches, setShowBatches] = useState(false)
  const [showArchiveBatches, setShowArchiveBatches] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [showTeachers, setShowTeachers] = useState(false)
  const [batchSearchQuery, setBatchSearchQuery] = useState("")
  const [archivedBatchSearchQuery, setArchivedBatchSearchQuery] = useState("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [activeFeeTab, setActiveFeeTab] = useState("unpaid");

  // Fee tracking states (from QuickView)
  const [unpaidInstallments, setUnpaidInstallments] = useState([])
  const [totalUnpaidAmount, setTotalUnpaidAmount] = useState([])
  const [upcomingInstallments, setUpcomingInstallments] = useState([])
  const [totalUpcomingAmount, setTotalUpcomingAmount] = useState([])
  const [paidInstallments, setPaidInstallments] = useState([])
  const [totalPaidAmount, setTotalPaidAmount] = useState([])
  const [selectedUnpaidClass, setSelectedUnpaidClass] = useState(null)
  const [selectedUpcomingClass, setSelectedUpcomingClass] = useState(null)
  const [selectedPaidClass, setSelectedPaidClass] = useState(null)
  const [unpaidSortOrder, setUnpaidSortOrder] = useState("asc")
  const [upcomingSortOrder, setUpcomingSortOrder] = useState("asc")
  const [paidSortOrder, setPaidSortOrder] = useState("asc")
  const getDaysOverdue = (dueDate) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24))
    return diff > 0 ? `${diff} days ago` : "Due today"
  }

  function getDaysLeft(dueDate) {
    const now = new Date()
    const due = new Date(dueDate)
    now.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    const diffInMs = due - now
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
    if (diffInDays === 0) return "Due today"
    if (diffInDays === 1) return "Due tomorrow"
    return `${diffInDays} days left`
  }

  function getDaysSincePaid(paidDate) {
    if (!paidDate) return "Not Paid"
    const paid = new Date(paidDate)
    const today = new Date()
    paid.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffInMs = today - paid
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    return diffInDays === 0 ? "Paid today" : `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const sortInstallments = (data, order) => {
    return [...data].sort((a, b) =>
      order === "asc" ? new Date(a.dueDate) - new Date(b.dueDate) : new Date(b.dueDate) - new Date(a.dueDate),
    )
  }

  // Group classes by timing
  const groupClassesByTiming = (classes) => {
    const grouped = {}
    classes.forEach((entry) => {
      const timeKey = `${entry.timing.startTime} - ${entry.timing.endTime}`
      if (!grouped[timeKey]) {
        grouped[timeKey] = []
      }
      grouped[timeKey].push(entry)
    })
    return grouped
  }

  useEffect(() => {
    const storedAdmin = localStorage.getItem("user")
    const token = localStorage.getItem("authToken")
    if (storedAdmin && token && storedAdmin !== "undefined") {
      try {
        setAdmin(JSON.parse(storedAdmin))
      } catch (err) {
        console.error("Failed to parse admin JSON:", err)
        localStorage.removeItem("admin")
        return
      }
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch today's classes
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/today/timetable`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch timetable")
          return res.json()
        })
        .then((data) => setTodaysClasses(data.classes))
        .catch((err) => console.error("Error loading timetable", err))

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batches`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch all batches")
          return res.json()
        })
        .then(setBatchesRecords)
        .catch((err) => console.error("Batches fetch error:", err))

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/archivedBatches`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch all archived batches")
          return res.json()
        })
        .then(setArchivedBatchesRecords)
        .catch((err) => console.error("Archived Batches fetch error:", err))

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/students`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch all students")
          return res.json()
        })
        .then(setStudentsRecords)
        .catch((err) => console.error("Students fetch error:", err))

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch all teachers")
          return res.json()
        })
        .then(setTeachersRecords)
        .catch((err) => console.error("Teachers fetch error:", err))
    }
  }, [])

  const loadFeeTrackingData = () => {
    const token = localStorage.getItem("authToken")
    const headers = { Authorization: `Bearer ${token}` }

    // Fetch unpaid installments
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/unpaid`, { headers })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        const totalOutstanding = sorted.reduce((sum, inst) => sum + (inst.amount || 0), 0)
        setUnpaidInstallments(sorted)
        setTotalUnpaidAmount(totalOutstanding)
      })
      .catch((err) => console.error("Error loading unpaid installments:", err))

    // Fetch upcoming installments
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/upcoming`, { headers })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        const totalUpcoming = sorted.reduce((sum, inst) => sum + (inst.amount || 0), 0)
        setUpcomingInstallments(sorted)
        setTotalUpcomingAmount(totalUpcoming)
      })
      .catch((err) => console.error("Error loading upcoming installments:", err))

    // Fetch paid installments
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/fee/installments/paid`, { headers })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.installments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
        const totalPaid = sorted.reduce((sum, inst) => sum + (inst.amount || 0), 0)
        setPaidInstallments(sorted)
        setTotalPaidAmount(totalPaid)
      })
      .catch((err) => console.error("Error loading paid installments:", err))
  }

  const handleFeeTrackingClick = () => {
    if (!showFeeTracking) {
      loadFeeTrackingData()
    }
    setShowFeeTracking(!showFeeTracking)
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const findTeacher = async (batchId) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/findTeacher/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const teacherGet = await res.json()
        if (!res.ok) throw new Error(teacherGet.message || "Error fetching teacher")
        setTeacher((prev) => ({
          ...prev,
          [batchId]: teacherGet.teacher[0],
        }))
      } catch (err) {
        console.error("Failed to fetch assigned teacher:", err)
        alert("Error fetching assigned teacher.")
      }
    }

    batchesRecords.forEach((batch) => {
      findTeacher(batch._id)
    })
  }, [batchesRecords])

  const createBatch = async (batchName, batchClass, batchStartDate) => {
    if (!batchName.trim()) {
      alert("Please enter a batch name.")
      return
    }
    const formattedDate = format(batchStartDate, "dd-MM-yyyy")
    const code = `B-${Date.now().toString().slice(-6)}`
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batchCreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ name: batchName, code, batchClass, startDate: formattedDate }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message || "Error creating batch.")
        return
      }
      setOpenModalOne(false)
      setBatchesRecords((prev) => [...prev, data])
      setCredentials({ batch: "" })
      setStartDate(new Date())
      navigate(`/batch/${data._id}`)
    } catch (error) {
      console.error("Error creating batch:", error)
      alert("Something went wrong.")
    }
  }

  const createStudent = async (name, phone, dob, address, className, dateOfJoining) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/studentCreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name,
          phone,
          dob,
          address,
          class: className,
          dateOfJoining,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message)
        return
      }
      setOpenModalTwo(false)
      setStudentsRecords((prev) => [...prev, data])
      setCredentials({
        studentName: "",
        studentPhone: "",
        studentAddress: "",
        studentClass: "",
      })
      setDob(new Date())
      setDateOfJoining(new Date())
      navigate(`/student/${data._id}`)
    } catch (err) {
      console.error("Create student error:", err)
      alert("Error creating student.")
    }
  }

  const createTeacher = async (teacherName, teacherEmail, teacherPhone) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherCreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          phone: teacherPhone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message)
        return
      }
      setOpenModalThree(false)
      setTeachersRecords((prev) => [...prev, data])
      setCredentials((prev) => ({
        ...prev,
        teacherName: "",
        teacherEmail: "",
        teacherPhone: "",
      }))
    } catch (error) {
      console.error("Error creating teacher:", error)
      alert("Something went wrong.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("description", description)
    formData.append("image", image)
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/uploadPopup`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      if (res.status === 200) {
        alert("Popup updated successfully!")
        setOpenPopupModal(false)
      }
    } catch (error) {
      console.error("Popup upload error:", error.response?.data || error.message)
      alert("Failed to upload popup. Unauthorized or server error.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBatchFormSubmit = (e) => {
    e.preventDefault()
    createBatch(credentials.batch, credentials.batchClass, startDate)
  }

  const handleStudentFormSubmit = (e) => {
    e.preventDefault()
    const formattedDob = dob ? format(dob, "dd-MM-yyyy") : ""
    const formattedJoining = dateOfJoining ? format(dateOfJoining, "dd-MM-yyyy") : ""
    createStudent(
      credentials.studentName,
      credentials.studentPhone,
      formattedDob,
      credentials.studentAddress,
      credentials.studentClass,
      formattedJoining,
    )
  }

  const handleTeacherFormSubmit = (e) => {
    e.preventDefault()
    createTeacher(credentials.teacherName, credentials.teacherEmail, credentials.teacherPhone)
  }

  const groupedClasses = groupClassesByTiming(todaysClasses)

  return (
    <>
      <Navbar />
      <div className="admin-container">
        {/* Fixed Sidebar */}
        <div className={`admin-sidebar ${showFeeTracking || showBatches || showArchiveBatches || showStudents || showTeachers
          ? 'hide-on-mobile'
          : ''
          }`}>
          {/* Today's Classes Section */}
          <h3 className="sidebar-title">
            <i className="fas fa-clock"></i> Today's Classes
          </h3>
          <div className="sidebar-section">
            <div className="classes-container">
              {Object.keys(groupedClasses).length === 0 ? (
                <p className="no-classes">No classes scheduled today.</p>
              ) : (
                <div className="classes-list">
                  {Object.entries(groupedClasses).map(([timing, classes]) => (
                    <div key={timing} className="timing-item">
                      <div className="timing-header">{timing}</div>
                      <div className="timing-classes">
                        {classes.map((entry, index) => (
                          <Link to={`/batch/${entry.batch.id}`} className="class-link">
                            <div key={index} className="class-info">
                              <span>
                                {entry.batch.name}
                              </span>
                              Class: {entry.batch.class}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {!showFeeTracking && !showBatches && !showArchiveBatches && !showStudents && !showTeachers ? (
            <div className="dashboard-grid">
              <button className="dashboard-card all-batches" onClick={() => setShowBatches(true)}>
                <div className="card-icon">
                  <i className="fa-solid fa-book-open"></i>
                </div>
                <h3>All Batches</h3>
              </button>

              <button className="dashboard-card all-students" onClick={() => setShowStudents(true)}>
                <div className="card-icon">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3>All Students</h3>
              </button>

              <button className="dashboard-card all-teachers" onClick={() => setShowTeachers(true)}>
                <div className="card-icon">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <h3>All Teachers</h3>
              </button>

              <button className="dashboard-card fee-tracking" onClick={handleFeeTrackingClick}>
                <div className="card-icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <h3>Fee Tracking</h3>
              </button>

              <button className="dashboard-card add-batch" onClick={() => setOpenModalOne(true)}>
                <div className="card-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <h3>Add a Batch</h3>
              </button>

              <button className="dashboard-card add-student" onClick={() => setOpenModalTwo(true)}>
                <div className="card-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <h3>Add a Student</h3>
              </button>

              <button className="dashboard-card add-teacher" onClick={() => setOpenModalThree(true)}>
                <div className="card-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h3>Add a Teacher</h3>
              </button>

              <button className="dashboard-card update-popup" onClick={() => setOpenPopupModal(true)}>
                <div className="card-icon">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <h3>Update Popup</h3>
              </button>

              <button className="dashboard-card quick-add" onClick={() => setOpenModalFour(true)}>
                <div className="card-icon">
                  <i className="fas fa-file-excel"></i>
                </div>
                <h3>Quick Add (Excel)</h3>
              </button>

              <button className="dashboard-card archived-batches" onClick={() => setShowArchiveBatches(true)}>
                <div className="card-icon">
                  <i className="fas fa-archive"></i>
                </div>
                <h3>Archived Batches</h3>
              </button>
            </div>
          ) : showBatches ? (
            <div className="data-section">
              <div className="section-header">
                <div className="d-flex">
                  <button className="back-btn" onClick={() => setShowBatches(false)}>
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h2 className="batches-title">All Batches ({batchesRecords.length})</h2>
                </div>

                <div className="search-container">
                  <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search batches with name..."
                    className="search-input"
                    value={batchSearchQuery}
                    onChange={(e) => setBatchSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className='data-grid-container'>
                <div className="data-grid">
                  {batchesRecords.length > 0 ? (
                    batchesRecords
                      .filter(
                        (batch) =>
                          batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
                          batch.class.toLowerCase().includes(batchSearchQuery.toLowerCase()),
                      )
                      .map((batch, index) => (
                        <Link key={index} to={`/batch/${batch._id}`} className="data-card">
                          <h5 className="card-title">{batch.name}</h5>
                          <span className="card-subtitle">Class: {batch.class}</span>
                        </Link>
                      ))
                  ) : (
                    <p className="no-data">No batches found.</p>
                  )}
                </div>
              </div>
            </div>
          ) : showStudents ? (
            <div className="data-section">
              <div className="section-header">
                <div className="d-flex">
                  <button className="back-btn" onClick={() => setShowStudents(false)}>
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h2 className="batches-title">All Students ({studentsRecords.length})</h2>
                </div>
                <div className="search-container">
                  <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search students with name and contact number..."
                    className="search-input"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className='data-grid-container'>
                <div className="data-grid">
                  {studentsRecords.length > 0 ? (
                    studentsRecords
                      .filter(
                        (student) =>
                          student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          student.phone.includes(studentSearchQuery),
                      )
                      .map((student, index) => (
                        <Link key={index} to={`/student/${student._id}`} className="data-card">
                          <h5 className="card-title">{student.name}</h5>
                          <span className="card-subtitle">Phone: {student.phone}</span>
                          <span className="card-code">Class: {student.class}</span>
                        </Link>
                      ))
                  ) : (
                    <p className="no-data">No students found.</p>
                  )}
                </div>
              </div>
            </div>
          ) : showTeachers ? (
            <div className="data-section">
              <div className="section-header">
                <div className="d-flex">
                  <button className="back-btn" onClick={() => setShowTeachers(false)}>
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h2 className="batches-title">All Teachers ({teachersRecords.length})</h2>
                </div>
                <div className="search-container">
                  <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search teachers with name and contact number..."
                    className="search-input"
                    value={teacherSearchQuery}
                    onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className='data-grid-container'>
                <div className="data-grid">
                  {teachersRecords.length > 0 ? (
                    teachersRecords
                      .filter(
                        (teacher) =>
                          teacher.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                          teacher.phone.includes(teacherSearchQuery),
                      )
                      .map((teacher, index) => (
                        <Link key={index} to={`/teacher/${teacher._id}`} className="data-card">
                          <h5 className="card-title">{teacher.name}</h5>
                          <span className="card-subtitle">Phone: {teacher.phone}</span>
                        </Link>
                      ))
                  ) : (
                    <p className="no-data">No teachers found.</p>
                  )}
                </div>
              </div>
            </div>
          ) : showArchiveBatches ? (
            <div className="data-section">
              <div className="section-header">
                <div className="d-flex">
                  <button className="back-btn" onClick={() => setShowArchiveBatches(false)}>
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h2 className="batches-title">Archived Batches ({archivedBatchesRecords.length})</h2>
                </div>

                <div className="search-container">
                  <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search batches with name..."
                    className="search-input"
                    value={archivedBatchSearchQuery}
                    onChange={(e) => setArchivedBatchSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className='data-grid-container'>
                <div className="data-grid">
                  {archivedBatchesRecords.length > 0 ? (
                    archivedBatchesRecords
                      .filter(
                        (batch) =>
                          batch.name.toLowerCase().includes(archivedBatchSearchQuery.toLowerCase()) ||
                          batch.class.toLowerCase().includes(archivedBatchSearchQuery.toLowerCase()),
                      )
                      .map((batch, index) => (
                        <Link key={index} to={`/batch/${batch._id}`} className="data-card">
                          <h5 className="card-title">{batch.name}</h5>
                          <span className="card-subtitle">Class: {batch.class}</span>
                        </Link>
                      ))
                  ) : (
                    <p className="no-data">No archived batches found.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Fee tracking content
            <div className="data-section">
              <div className="section-header">
                <div className="d-flex">
                  <button className="back-btn" onClick={() => setShowFeeTracking(false)}>
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h2 className="batches-title">Fee Tracking</h2>
                </div>
              </div>

              <div className="fee-cards-container fee-card">
                <div className="fee-controls">
                  <button className={activeFeeTab === "unpaid" ? "unpaid-btn active" : "unpaid-btn"} onClick={() => setActiveFeeTab("unpaid")}>Unpaid</button>
                  <button className={activeFeeTab === "upcoming" ? "upcoming-btn active" : "upcoming-btn"} onClick={() => setActiveFeeTab("upcoming")}>Upcoming</button>
                  <button className={activeFeeTab === "paid" ? "paid-btn active" : "paid-btn"} onClick={() => setActiveFeeTab("paid")}>Paid</button>
                </div>
                {activeFeeTab === "unpaid" && (
                  <div className="unpaid">
                    <h4>Unpaid</h4>
                    <div className="fee-amount">₹ {totalUnpaidAmount}</div>
                    <div className="installments-section">
                      <div className="installments-header">
                        <span>Installments</span>
                        <div className="dropdown">
                          <button className="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Filter <i className="fas fa-cog"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  const sorted = sortInstallments(unpaidInstallments, "asc")
                                  setUnpaidInstallments(sorted)
                                  setUnpaidSortOrder("asc")
                                }}
                              >
                                Oldest First
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  const sorted = sortInstallments(unpaidInstallments, "desc")
                                  setUnpaidInstallments(sorted)
                                  setUnpaidSortOrder("desc")
                                }}
                              >
                                Newest First
                              </button>
                            </li>
                            <li>
                              <div className="dropdown-item p-2">
                                Filter by Class:
                                <ul className="list-unstyled border mt-1">
                                  {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(cls => (
                                    <li key={cls}>
                                      <button
                                        className="btn btn-sm text-start fw-normal pt-1 pb-0"
                                        onClick={() => setSelectedUnpaidClass(cls)}
                                      >
                                        {cls}
                                      </button>
                                    </li>
                                  ))}
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
                        {unpaidInstallments
                          .filter((inst) => !selectedUnpaidClass || inst.studentId?.class === selectedUnpaidClass)
                          .map((inst) => {
                            const student = inst.studentId
                            const name = student?.name || "Unknown"
                            const className = student?.class || "--"
                            const amount = inst.amount || 0
                            const num = inst.installmentNo || 0
                            return (
                              <Link key={inst._id} to={`/student/${student._id}`} className="installment-item">
                                <div className="installment-header">
                                  <h5>{name}</h5>
                                  <span className="amount">₹ {amount}/-</span>
                                </div>
                                <div className="installment-details">
                                  <div className="d-flex"><span>Class: {className}</span><div className="dot"></div><span>Installment #: {num}</span></div>
                                  <span className="overdue">{getDaysOverdue(inst.dueDate)}</span>
                                </div>
                              </Link>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {activeFeeTab === "upcoming" && (
                  <div className="upcoming">
                    <h4>Upcoming</h4>
                    <div className="fee-amount">₹ {totalUpcomingAmount}</div>
                    <div className="installments-section">
                      <div className="installments-header">
                        <span>Installments</span>
                        <div className="dropdown">
                          <button className="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Filter <i className="fas fa-cog"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  const sorted = sortInstallments(upcomingInstallments, "asc")
                                  setUpcomingInstallments(sorted)
                                  setUpcomingSortOrder("asc")
                                }}
                              >
                                Oldest First
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  const sorted = sortInstallments(upcomingInstallments, "desc")
                                  setUpcomingInstallments(sorted)
                                  setUpcomingSortOrder("desc")
                                }}
                              >
                                Newest First
                              </button>
                            </li>
                            <li>
                              <div className="dropdown-item p-2">
                                Filter by Class:
                                <ul className="list-unstyled border mt-1">
                                  {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(cls => (
                                    <li key={cls}>
                                      <button
                                        className="btn btn-sm text-start fw-normal pt-1 pb-0"
                                        onClick={() => setSelectedUpcomingClass(cls)}
                                      >
                                        {cls}
                                      </button>
                                    </li>
                                  ))}
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
                        {upcomingInstallments
                          .filter((inst) => !selectedUpcomingClass || inst.studentId?.class === selectedUpcomingClass)
                          .map((inst) => {
                            const student = inst.studentId
                            const name = student?.name || "Unknown"
                            const className = student?.class || "--"
                            const amount = inst.amount || 0
                            const num = inst.installmentNo || 0
                            return (
                              <Link key={inst._id} to={`/student/${student._id}`} className="installment-item">
                                <div className="installment-header">
                                  <h5>{name}</h5>
                                  <span className="amount">₹ {amount}/-</span>
                                </div>
                                <div className="installment-details">
                                  <div className="d-flex"><span>Class: {className}</span><div className="dot"></div><span>Installment #: {num}</span></div>
                                  <span className="upcoming-date">{getDaysLeft(inst.dueDate)}</span>
                                </div>
                              </Link>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {activeFeeTab === "paid" && (
                  <div className="paid">
                    <h4>Paid</h4>
                    <div className="fee-amount">₹ {totalPaidAmount}</div>
                    <div className="installments-section">
                      <div className="installments-header">
                        <span>Installments</span>
                        <div className="dropdown">
                          <button className="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Filter <i className="fas fa-cog"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  const sorted = sortInstallments(paidInstallments, "asc")
                                  setPaidInstallments(sorted)
                                  setPaidSortOrder("asc")
                                }}
                              >
                                Oldest First
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  const sorted = sortInstallments(paidInstallments, "desc")
                                  setPaidInstallments(sorted)
                                  setPaidSortOrder("desc")
                                }}
                              >
                                Newest First
                              </button>
                            </li>
                            <li>
                              <div className="dropdown-item p-2">
                                Filter by Class:
                                <ul className="list-unstyled border mt-1">
                                  {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map(cls => (
                                    <li key={cls}>
                                      <button
                                        className="btn btn-sm text-start fw-normal pt-1 pb-0"
                                        onClick={() => setSelectedPaidClass(cls)}
                                      >
                                        {cls}
                                      </button>
                                    </li>
                                  ))}
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
                        {paidInstallments
                          .filter((inst) => !selectedPaidClass || inst.studentId?.class === selectedPaidClass)
                          .map((inst) => {
                            const student = inst.studentId
                            const name = student?.name || "Unknown"
                            const className = student?.class || "--"
                            const amount = inst.amount || 0
                            const num = inst.installmentNo || 0
                            return (
                              <Link key={inst._id} to={`/student/${student._id}`} className="installment-item">
                                <div className="installment-header">
                                  <h5>{name}</h5>
                                  <span className="amount">₹ {amount}/-</span>
                                </div>
                                <div className="installment-details">
                                  <div className="d-flex"><span>Class: {className}</span><div className="dot"></div><span>Installment #: {num}</span></div>
                                  <span className="paid-date">{getDaysSincePaid(inst.paidDate)}</span>
                                </div>
                              </Link>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Modals */}
      <ModalOne isOpen={openModalOne} onClose={() => setOpenModalOne(false)} onCreate={createBatch}>
        <div className="adding-student-box" style={{ minWidth: "300px" }}>
          <h3 className="modal-title">Batch Creation</h3>
          <form className="login-form" onSubmit={handleBatchFormSubmit}>
            <div className="form-group">
              <label htmlFor="batch">Batch Name</label>
              <input
                type="text"
                id="batch"
                name="batch"
                value={credentials.batch}
                onChange={handleInputChange}
                required
                placeholder="Write Batch Name..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="class">Class</label>
              <select
                name="batchClass"
                className="form-select"
                value={credentials.batchClass}
                onChange={handleInputChange}
                required
                placeholder="Select Class..."
              >
                <option value="">Select Class</option>
                {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <DatePicker
                className="datePicker"
                dateFormat="dd-MM-yyyy"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Select Start Date"
                required
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={10}
                scrollableYearDropdown
                maxDate={new Date()}
                openToDate={new Date()}
                minDate={new Date("1995-01-01")}
              />
            </div>
            <button className="btn btn-success" style={{ width: "100%" }} type="submit">
              Create Batch
            </button>
          </form>
        </div>
      </ModalOne>

      <ModalTwo isOpen={openModalTwo} onClose={() => setOpenModalTwo(false)} onCreate={createStudent}>
        <div className="selectTeacherBox" style={{ minWidth: "300px" }}>
          <h3 className="modal-title mb-2">Adding a Student</h3>
          <form onSubmit={handleStudentFormSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                className="form-control"
                name="studentName"
                placeholder="Write Student's Name..."
                value={credentials.studentName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div  className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                className="form-control"
                name="studentPhone"
                placeholder="Write Student's Phone..."
                value={credentials.studentPhone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div  className="form-group">
              <label>DOB (dd-mm-yyyy):</label>
              <DatePicker
                className="form-control"
                dateFormat="dd-MM-yyyy"
                selected={dob}
                onChange={(date) => setDob(date)}
                placeholderText="Select DOB"
                required
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={10}
                scrollableYearDropdown
                maxDate={new Date()}
                openToDate={new Date()}
                minDate={new Date("1995-01-01")}
              />
            </div>
            <div  className="form-group">
              <label>Address:</label>
              <input
                type="text"
                className="form-control"
                name="studentAddress"
                placeholder="Write Student's Address..."
                value={credentials.studentAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div  className="form-group">
              <label>Class:</label>
              <select
                className="form-select"
                name="studentClass"
                value={credentials.studentClass}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Class</option>
                {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date of Joining (dd-mm-yyyy):</label>
              <DatePicker
                className="form-control"
                dateFormat="dd-MM-yyyy"
                selected={dateOfJoining}
                onChange={(date) => setDateOfJoining(date)}
                placeholderText="Select Joining Date"
                required
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={10}
                scrollableYearDropdown
                maxDate={new Date()}
                openToDate={new Date()}
                minDate={new Date("1995-01-01")}
              />
            </div>
            <button className="btn btn-success mt-3" style={{width:"100%"}} type="submit">
              Add Student
            </button>
          </form>
        </div>
      </ModalTwo>

      <ModalThree isOpen={openModalThree} onClose={() => setOpenModalThree(false)} onCreate={createTeacher}>
        <div className="selectTeacherBox" style={{ minWidth: "300px" }}>
          <h3 className="modal-title">Adding a Teacher</h3>
          <form onSubmit={handleTeacherFormSubmit}>
            <div className="form-group">
              <label htmlFor="teacherName">Teacher Name</label>
              <input
                type="text"
                id="teacherName"
                name="teacherName"
                value={credentials.teacherName}
                onChange={handleInputChange}
                required
                placeholder="Write Teacher Name..."
              />
              <label htmlFor="teacherEmail">Teacher Email</label>
              <input
                type="email"
                id="teacherEmail"
                name="teacherEmail"
                value={credentials.teacherEmail}
                onChange={handleInputChange}
                required
                placeholder="Write Teacher Email..."
              />
              <label htmlFor="teacherPhone">Teacher Phone</label>
              <input
                type="tel"
                id="teacherPhone"
                name="teacherPhone"
                value={credentials.teacherPhone}
                onChange={handleInputChange}
                required
                placeholder="Write Teacher Phone..."
              />
            </div>
            <button className="btn btn-success mt-2" type="submit" style={{ width: "100%" }}>
              Add Teacher
            </button>
          </form>
        </div>
      </ModalThree>

      <Popup isOpen={openPopupModal} onClose={() => setOpenPopupModal(false)}>
        <h3>Updating Popup</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" required />
          <br />
          <textarea
            rows={4}
            placeholder="Enter popup description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <br />
          <button type="submit">Upload</button>
        </form>
      </Popup>

      <ModalFour isOpen={openModalFour} onClose={() => setOpenModalFour(false)}>
        <div className="selectTeacherBox">
          <h3 className="modal-title">Upload Excel to Add Students</h3>
          <ExcelUpload />
        </div>
      </ModalFour>

    </>
  )
}
