"use client"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import axios from "axios"
import { parse } from "date-fns";
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
  const [openModalOne, setOpenModalOne] = useState(false)
  const [openModalTwo, setOpenModalTwo] = useState(false)
  const [openModalThree, setOpenModalThree] = useState(false)
  const [openModalFour, setOpenModalFour] = useState(false)
  const [openPopupModal, setOpenPopupModal] = useState(false)
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [dob, setDob] = useState(null)
  const [dateOfJoining, setDateOfJoining] = useState(new Date())
  const [startDate, setStartDate] = useState(new Date())
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
    const storedAdmin = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

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

    }
  }, [])

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
        <div className="admin-sidebar">
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
          <div className="dashboard-grid">
            <Link to='/all-batches' className="dashboard-card all-batches">
              <div className="card-icon">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3>All Batches</h3>
            </Link>

            <Link to='/all-students' className="dashboard-card all-students">
              <div className="card-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>All Students</h3>
            </Link>

            <Link to='/all-teachers' className="dashboard-card all-teachers">
              <div className="card-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>All Teachers</h3>
            </Link>

            <Link to='/fee-tracking' className="dashboard-card fee-tracking">
              <div className="card-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <h3>Fee Tracking</h3>
            </Link>

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

            <Link to='/all-archived-batches' className="dashboard-card archived-batches">
              <div className="card-icon">
                <i className="fas fa-archive"></i>
              </div>
              <h3>Archived Batches</h3>
            </Link>

            <Link to='/todaysBirthdays' className="dashboard-card todaysBirthdays">
              <div className="card-icon">
                <i className="bi bi-cake-fill"></i>
              </div>
              <h3>Birthday Alerts</h3>
            </Link>
          </div>
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
            <div className="form-group">
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
            <div className="form-group">
              <label>DOB (dd-mm-yyyy):</label>
              <DatePicker
                className="datePicker"
                dateFormat="dd-MM-yyyy"
                selected={dob}
                onChange={(date) => setDob(date)}   // keep only this
                placeholderText="Select DOB"
                required
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={10}
                scrollableYearDropdown
                maxDate={new Date()}
                openToDate={new Date("2007-01-01")}
                minDate={new Date("1995-01-01")}
              />
            </div>
            <div className="form-group">
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
            <div className="form-group">
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
                className="datePicker"
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
            <button className="btn btn-success mt-3" style={{ width: "100%" }} type="submit">
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
        <div
          className="selectTeacherBox"
          style={{ cursor: "move" }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", "drag");
          }}
        >
          <h3 className="modal-title mb-2">Upload Popup</h3>
          <p className="text-info text-center">(Upload image with 1:1 ratio)</p>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="mt-3">
            <div
              className={`border border-secondary border-3 rounded text-center p-4 mb-3`}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("bg-light");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("bg-light");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("bg-light");
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && droppedFile.type.startsWith("image")) {
                  setImage(droppedFile);
                } else {
                  alert("Please drop a valid image file.");
                }
              }}
              style={{ backgroundColor: "#eef7ffff" }}
            >
              <label htmlFor="popup-upload" style={{ cursor: "pointer" }}>
                <i className="bi bi-upload fs-1 text-secondary"></i>
                <p className="mb-1 text-secondary">Click or drag & drop image here</p>
              </label>
              <input
                id="popup-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={{ display: "none" }}
              />
              {image && (
                <div className="mt-2 text-success flex justify-content-center align-items-center gap-2">
                  <div style={{ maxWidth: "250px" }}>{image.name}</div>
                  <button
                    type="button"
                    className="btn btn-sm text-danger"
                    onClick={() => setImage(null)}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <input
              type="text"
              rows={4}
              className="form-control mb-3"
              placeholder="Enter popup title..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-success w-100 mt-3">
              Upload
            </button>
          </form>
        </div>
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
