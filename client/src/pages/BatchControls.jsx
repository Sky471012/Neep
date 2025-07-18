import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format, parse } from 'date-fns';
import axios from 'axios';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TimetableEditor from "../components/TimetableEditor";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import ModalFive from "../modals/ModalFive";
import ModalSix from "../modals/ModalSix";
import ModalSeven from "../modals/ModalSeven";

export default function BatchControls() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [batch, setBatch] = useState({});
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [teachersList, setTeachersList] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModalOne, setOpenModalOne] = useState(false);
  const [modalTwo, setModalTwo] = useState(false);
  const [modalThree, setModalThree] = useState(false);
  const [modalFour, setModalFour] = useState(false);
  const [modalFive, setModalFive] = useState(false);
  const [modalSix, setModalSix] = useState(false);
  const [modalSeven, setModalSeven] = useState(false);
  const [studentTests, setStudentTests] = useState([]);
  const [allStudents, setAllStudents] = useState({});
  const [markedStatus, setMarkedStatus] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  const [activeStudent, setActiveStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [mode, setMode] = useState("select"); // "select" or "create"
  const [testDetails, setTestDetails] = useState({
    testName: "",
    maxMarks: "",
    testDate: null
  });
  const [newStudentData, setNewStudentData] = useState({
    name: "",
    phone: "",
    dob: format(new Date(), "dd-MM-yyyy"),
    address: "",
    class: "Kids",
    dateOfJoining: format(new Date(), "dd-MM-yyyy"),
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [testFormData, setTestFormData] = useState({});
  const [tests, setTests] = useState({});
  

  const academicYearStart = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();

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

  function getAcademicMonthIndex(month) {
    // Convert calendar month (0–11) to academic month index (0–11)
    return month >= 3 ? month - 3 : month + 9;
  }

  const today = new Date();
  const [activeMonthIndex, setActiveMonthIndex] = useState(getAcademicMonthIndex(today.getMonth()));


  useEffect(() => {
    console.log(token);

    const fetchData = async () => {
      const res1 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getBatchDetails/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res2 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batchStudents/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res3 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/findTeacher/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res4 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res5 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batchTimetable/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res6 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [bData, sData, tData, tList, ttData, asData] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json(), res5.json(), res6.json()]);
      setBatch(bData || {});
      setStudents(sData.students || []);
      setTeacher(tData.teacher[0] || null);
      setTeachersList(tList || []);
      setTimetable(ttData.timetable || []);
      setAllStudents(asData || {});
    };

    fetchData();
  }, [batchId]);

  const showStudentAttendance = async (student) => {
    setActiveStudent(student);
    setModalThree(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const newMap = {};
      data.attendance?.forEach((record) => {
        const date = new Date(record.date);
        const formattedDate = date.toISOString().split("T")[0];
        const key = `${record.batchId}_${formattedDate}`;
        newMap[key] = record.status;
      });

      setAttendanceMap((prev) => ({ ...prev, ...newMap }));
    } catch (err) {
      console.error("Failed to fetch student attendance:", err);
      alert("Error fetching attendance");
    }
  };

  const showStudentAllTests = async (student) => {
    setActiveStudent(student);
    setModalSix(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/tests/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load tests");

      // ✅ Only keep tests for the opened batch
      const filteredTests = (data.tests || []).filter(test => test.batchId === batchId);

      setStudentTests(filteredTests);
    } catch (err) {
      console.error("Failed to fetch student tests:", err);
      alert("Error fetching tests");
    }
  };

  const deleteBatch = async (batchId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this batch?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/batchDelete/${batchId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete batch.");
        return;
      }

      navigate("/admin");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting.");
    }
  };

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

      setStudents((prevStudents) => prevStudents.filter((s) => s._id !== studentId));
    } catch (error) {
      console.error("Remove error:", error);
      alert("Something went wrong while removing.");
    }
  };

  const assignTeacherToBatch = async (batchId, teacherId) => {
    if (!teacherId) return alert("Please select a teacher first.");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/assignTeacher/${batchId}/${teacherId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Assignment failed");

      setTeacher(data.teacherUpdated);
      setModalTwo(false);
    } catch (err) {
      console.error("Error assigning teacher:", err);
      alert("Failed to assign teacher.");
    }
  };

  const markAttendance = async (studentId, status) => {
    if (!selectedDate) return alert("Please select a date first.");

    const dateOnly = new Date(selectedDate.toDateString());
    const dateISO = dateOnly.toISOString();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId, batchId, date: dateISO, status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

      setMarkedStatus((prev) => ({
        ...prev,
        [`${studentId}_${dateOnly.toDateString()}`]: status,
      }));
    } catch (err) {
      console.error("Attendance error:", err);
      alert("Failed to mark attendance.");
    }
  };

  const openModalOneHandler = () => {
    setOpenModalOne(true);
  };

  const closeAttendanceModalHandler = () => {
    setOpenModalOne(false);
  };


  const updateTimetable = async (finalTimetable) => {
    try {
      // Filter out empty classTimings
      const cleanedTimetable = finalTimetable.filter(
        (entry) => entry.classTimings && entry.classTimings.length > 0
      );

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/updateTimetable/${batchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timetable: cleanedTimetable }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setTimetable(cleanedTimetable); // Update state locally with filtered data
      setModalFour(false);
    } catch (err) {
      alert("Failed to update timetable");
      console.error(err);
    }
  };

  const handleAddSelectedStudents = async () => {
    if (selectedToAdd.length === 0) {
      return alert("Please select at least one student.");
    }

    const studentsToAdd = Object.values(allStudents).filter((s) =>
      selectedToAdd.includes(s._id)
    );

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/addStudents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId,
          studentIds: selectedToAdd, // just IDs
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add students.");
        return;
      }

      setStudents((prev) => [...prev, ...data.addedStudents]);
      setModalFive(false);
      setSelectedToAdd([]);
      setSearchTerm("");
    } catch (err) {
      console.error("Add students error:", err);
      alert("Error while adding students.");
    }
  };

  const filteredStudents = Object.values(allStudents).filter((s) => {
    const alreadyInBatch = students.some((st) => st._id === s._id);
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(searchLower);
    const phoneMatch = s.phone && s.phone.includes(searchLower);
    return !alreadyInBatch && (nameMatch || phoneMatch);
  });

  const toggleSelectStudent = (studentId) => {
    setSelectedToAdd((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleArchiveToggle = async (batchId, newArchiveStatus) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/${batchId}/archive`,
        { archive: newArchiveStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        // Update the local state to reflect archive change
        setBatch((prev) => ({
          ...prev,
          archive: newArchiveStatus,
        }));
      }
    } catch (error) {
      console.error("Error updating archive status:", error);
      alert("Failed to update archive status.");
    }
  };

  const addTest = async (studentId, batchId, name, maxMarks, marksScored, date) => {
    if (!studentId || !batchId || !name || !maxMarks || marksScored === undefined || marksScored === null || isNaN(date.getTime())) {
      return alert("All fields are required.");
    }


    console.log("DEBUG:", { studentId, batchId, name, maxMarks, marksScored, date });

    // ✅ Format date to dd-mm-yyyy
    const dd = ("0" + date.getDate()).slice(-2);
    const mm = ("0" + (date.getMonth() + 1)).slice(-2);
    const yyyy = date.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/test/addEdit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          batchId,
          name,
          maxMarks,
          marksScored,
          date: formattedDate // ✅ dd-mm-yyyy
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add test");

      setTests((prev) => ({
        ...prev,
        [batchId]: [
          ...(prev[batchId] || []).filter(
            t => !(t.name === name && t.date === formattedDate && t.studentId === studentId)
          ), // remove old entry if exists
          {
            _id: data.test._id, // if returned by backend
            studentId,
            batchId,
            name,
            maxMarks,
            marksScored,
            date: formattedDate
          }
        ]
      }));
    } catch (err) {
      console.error("Test error:", err);
      alert("Failed to add test.");
    }
  };

  const openTestModal = (batchId) => {
    setModalSeven((prev) => ({ ...prev, [batchId]: true }));
  };

  const closeTestModal = (batchId) => {
    setModalSeven((prev) => ({ ...prev, [batchId]: false }));
  };

  return (<>
    <Navbar />


    <div className="main-content">
      <div className="container mt-4">
        <div className="card mb-5 p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h2>{batch?.name || "No name"}</h2>

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
                  <button className="dropdown-item" onClick={() => setModalFour(true)}>
                    Add / Edit Timetable
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => setModalFive(true)}>
                    Add Students
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => setModalTwo(true)}>
                    Assign / Change Teacher
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={openModalOneHandler}>
                    Mark / Change Attendance
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => openTestModal(batch.batchId)}>
                    Add / Change Test Scores
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${batch.archive ? 'text-success' : 'text-danger'}`}
                    onClick={() => handleArchiveToggle(batch._id, !batch.archive)}
                  >
                    {batch.archive ? 'Unarchive Batch' : 'Archive Batch'}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={() => deleteBatch(batch._id)}>
                    Delete Batch
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-3">
            Class: <strong>{batch.class}<br /></strong>
            Code: <strong>{batch.code}<br /></strong>
            Started on: <strong>{batch.startDate}<br /></strong>
            Teacher:
            <strong>
              {teacher?.name || "Not assigned"}
              {teacher && (
                <Link to={`/teacher/${teacher._id}`} className="ms-1 text-primary">
                  <i className="bi bi-box-arrow-up-right"></i>
                </Link>
              )}
              <br />
            </strong>
            Number of students: <strong>{students.length}</strong>
          </p>
        </div>

        {/* Timetable */}
        <div className="timetable-details">
          <h2>Timetable</h2>
          {timetable && timetable.length > 0 ? (
            <table className="table table-bordered text-center mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Weekday</th>
                  <th>Time Slots</th>
                </tr>
              </thead>
              <tbody>
                {timetable
                  .sort((a, b) => weekdayOrder[a.weekday] - weekdayOrder[b.weekday])
                  .map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.weekday}</td>
                      <td>
                        {entry.classTimings.map((slot, idx) => {
                          const parsedStart = parse(slot.startTime, 'hh:mm a', new Date());
                          const parsedEnd = parse(slot.endTime, 'hh:mm a', new Date());
                          const displayStart = isNaN(parsedStart) ? slot.startTime : format(parsedStart, 'hh:mm a');
                          const displayEnd = isNaN(parsedEnd) ? slot.endTime : format(parsedEnd, 'hh:mm a');

                          return (
                            <div key={idx}>
                              {displayStart} - {displayEnd}
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No timetable made.</p>
          )}
        </div>

        {/* Students List Section */}
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>All Students</h2>
            <input
              type="search"
              placeholder="Search students with name and contact number..."
              className="form-control w-50"
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          <table className="table table-borderless align-middle">
            <tbody>
              {students
                .filter((s) =>
                  s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                  s.phone.includes(studentSearch)
                )
                .map((s) => (
                  <tr key={s._id}>
                    <td style={{ width: "40%" }}>
                      {s.name} ({s.phone})
                      <Link className="ms-1 text-primary" to={`/student/${s._id}`}>
                        <i className="bi bi-box-arrow-up-right"></i>
                      </Link>
                    </td>
                    <td style={{ width: "20%" }}>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => showStudentAttendance(s)}
                      >
                        Show Attendance
                      </button>
                    </td>
                    <td style={{ width: "20%" }}>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => showStudentAllTests(s)}
                      >
                        Show All Tests
                      </button>
                    </td>
                    <td style={{ width: "20%" }}>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeStudent(batchId, s._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Attendance Modal */}
        <ModalOne isOpen={openModalOne} onClose={closeAttendanceModalHandler}>
          <div>
            <h3>{batch.name}</h3>
            <DatePicker
              className="datePicker"
              dateFormat="yyyy-MM-dd"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Select date"
            />
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const key = `${student._id}_${selectedDate.toDateString()}`;
                  return (
                    <tr key={student._id}>
                      <td>{student.name} ({student.phone})</td>
                      <td>
                        <button
                          className={`btn btn-success btn-sm me-2 ${markedStatus[key] === "present" ? "active" : ""
                            }`}
                          onClick={() => markAttendance(student._id, "present")}
                        >
                          Present
                        </button>
                        <button
                          className={`btn btn-danger btn-sm ${markedStatus[key] === "absent" ? "active" : ""
                            }`}
                          onClick={() => markAttendance(student._id, "absent")}
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModalOne>

        {/* Assign Teacher Modal */}
        <ModalTwo
          isOpen={modalTwo}
          onClose={() => setModalTwo(false)}
        >
          <h3>Assigning Teacher to {batch.name}</h3>

          <div className="input-group mt-3 gap-3">
            <label>Select Teacher:</label>
            <select
              className="form-select mt-1"
              value={selectedTeacher[batchId] || ""}
              onChange={(e) =>
                setSelectedTeacher((prev) => ({ ...prev, [batchId]: e.target.value }))
              }
            >
              <option value="">-- Select a teacher --</option>
              {teachersList.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="button mt-3"
            onClick={() => assignTeacherToBatch(batchId, selectedTeacher[batchId])}
          >
            Assign Teacher
          </button>
        </ModalTwo>


        <ModalThree
          isOpen={modalThree}
          onClose={() => {
            setModalThree(false);
            setActiveStudent(null);
          }}
        >
          {activeStudent && (
            <div className="attendance-calendar mt-2">
              <div id={`carousel-${activeStudent._id}`} className="carousel slide">
                <div className="carousel-inner">
                  {allMonths.map((month, monthIdx) => {
                    let calendarMonth, calendarYear;
                    if (monthIdx <= 8) {
                      calendarMonth = monthIdx + 3;
                      calendarYear = academicYearStart;
                    } else {
                      calendarMonth = monthIdx - 9;
                      calendarYear = academicYearStart + 1;
                    }

                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

                    return (
                      <div
                        key={month}
                        className={`carousel-item ${monthIdx === activeMonthIndex ? "active" : ""}`}
                      >
                        <h6>{month} {calendarYear}</h6>
                        <div className="calendar-grid">
                          {[...Array(daysInMonth)].map((_, d) => {
                            const date = new Date(calendarYear, calendarMonth, d + 1);
                            const formatted = date.toISOString().split("T")[0];
                            const key = `${batchId}_${formatted}`;
                            const status = attendanceMap[key];

                            return (
                              <div
                                key={d}
                                className={`date-box ${status === "present"
                                  ? "present"
                                  : status === "absent"
                                    ? "absent"
                                    : ""
                                  }`}
                                title={`${month} ${d + 1}, ${calendarYear} - ${status || "No record"}`}
                              >
                                {d + 1}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="calendar-controls d-flex justify-content-between mt-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      setActiveMonthIndex((prev) => (prev - 1 + 12) % 12)
                    }
                  >
                    ‹ Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      setActiveMonthIndex((prev) => (prev + 1) % 12)
                    }
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModalThree>

        <ModalFour isOpen={modalFour} onClose={() => setModalFour(false)}>
          <TimetableEditor
            batch={batch}
            timetable={timetable}
            onSave={updateTimetable}
            initialDay="Monday" // 👈 Add this line
          />
        </ModalFour>


        <ModalFive
          isOpen={modalFive}
          onClose={() => {
            setModalFive(false);
            setSelectedToAdd([]);
            setSearchTerm("");
            setMode("select");
            setNewStudentData({
              name: "",
              phone: "",
              dob: format(new Date(), "dd-MM-yyyy"),
              address: "",
              class: "Kids",
              dateOfJoining: format(new Date(), "dd-MM-yyyy"),
            });
          }}
        >
          <h3>Add Students to {batch.name}</h3>

          <div className="btn-group mb-3 mt-3">
            <button
              className={`btn btn-outline-primary ${mode === "select" ? "active" : ""}`}
              onClick={() => setMode("select")}
            >
              Select Existing
            </button>
            <button
              className={`btn btn-outline-primary ${mode === "create" ? "active" : ""}`}
              onClick={() => setMode("create")}
            >
              Create New
            </button>
          </div>

          {mode === "select" ? (
            <>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div style={{ maxHeight: "300px", overflowY: "auto", margin: "10px" }}>
                {filteredStudents.map((student) => (
                  <div key={student._id} className="form-check mt-1">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id={student._id}
                      checked={selectedToAdd.includes(student._id)}
                      onChange={() => toggleSelectStudent(student._id)}
                    />
                    <label className="form-check-label" htmlFor={student._id}>
                      {student.name} ({student.phone})
                    </label>
                  </div>
                ))}
              </div>
              <button className="button" onClick={handleAddSelectedStudents}>
                Add Selected Students
              </button>
            </>
          ) : (
            <>
              <input
                className="form-control mb-2"
                placeholder="Name"
                value={newStudentData.name}
                onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
              />
              <input
                className="form-control mb-2"
                placeholder="Phone"
                value={newStudentData.phone}
                onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
              />
              <DatePicker
                selected={parse(newStudentData.dob, "dd-MM-yyyy", new Date())}
                onChange={(date) =>
                  setNewStudentData({
                    ...newStudentData,
                    dob: format(date, "dd-MM-yyyy"),
                  })
                }
                dateFormat="dd-MM-yyyy"
                className="form-control mb-2"
                placeholderText="Date of Birth"
              />
              <input
                className="form-control mb-2"
                placeholder="Address"
                value={newStudentData.address}
                onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
              />
              <select
                className="form-select mb-2"
                value={newStudentData.class}
                onChange={(e) => setNewStudentData({ ...newStudentData, class: e.target.value })}
              >
                {["Kids", "English Spoken", "9", "10", "11", "12"].map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <DatePicker
                selected={parse(newStudentData.dateOfJoining, "dd-MM-yyyy", new Date())}
                onChange={(date) =>
                  setNewStudentData({
                    ...newStudentData,
                    dateOfJoining: format(date, "dd-MM-yyyy"),
                  })
                }
                dateFormat="dd-MM-yyyy"
                className="form-control mb-3"
                placeholderText="Date of Joining"
              />
              <button className="button" onClick={async () => {
                try {
                  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/addStudentByCreating/${batchId}`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...newStudentData, batchName: batch.name }),
                  });
                  const data = await res.json();
                  if (!res.ok) return alert(data.message || "Error creating student");
                  setStudents((prev) => [...prev, data.student]);
                  setModalFive(false);
                } catch (err) {
                  alert("Failed to create student.");
                  console.error(err);
                }
              }}>
                Create Student
              </button>
            </>
          )}
        </ModalFive>

        <ModalSix
          isOpen={modalSix}
          onClose={() => {
            setModalSix(false);
            setActiveStudent(null);
          }}
        >
          <div className="p-3">
            <h3>Tests for {activeStudent?.name}</h3>

            {studentTests.length === 0 ? (
              <p>No test records found for this batch.</p>
            ) : (
              <table className="table table-bordered mt-3">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Date</th>
                    <th>Marks Scored</th>
                    <th>Max Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentTests
                    .sort((a, b) => {
                      const parseDate = (d) => new Date(d.split("-").reverse().join("-"));
                      return parseDate(b.date) - parseDate(a.date); // latest first
                    })
                    .map((test) => (
                      <tr key={test._id}>
                        <td>{test.name}</td>
                        <td>{test.date}</td>
                        <td>{test.marksScored}</td>
                        <td>{test.maxMarks}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </ModalSix>

        <ModalSeven
          isOpen={modalSeven[batch.batchId]}
          onClose={() => closeTestModal(batch.batchId)}
        >
          <div>
            <h3>Add Test for {batch.batchName}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { testName, maxMarks, testDate } = testDetails;
                if (!testName || !maxMarks || !testDate) {
                  return alert("Please fill test name, max marks, and date.");
                }

                const date = new Date(testDate);
                for (const student of students || []) {
                  const marksScored = testFormData[student._id];
                  if (marksScored !== undefined && marksScored !== "") {
                    await addTest(
                      student._id,
                      batch._id,
                      testName,
                      Number(maxMarks),
                      Number(marksScored),
                      date
                    );
                  }
                }

                setTestDetails({ testName: "", maxMarks: "", testDate: null });
                setTestFormData({});
                closeTestModal(batch.batchId);
              }}
            >
              <div className="mb-2">
                <DatePicker
                  selected={testDetails.testDate}
                  onChange={(date) =>
                    setTestDetails((prev) => ({ ...prev, testDate: date }))
                  }
                  className="form-control mb-2"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select test date"
                  required
                />
                <input
                  type="text"
                  placeholder="Test Name"
                  value={testDetails.testName}
                  onChange={(e) =>
                    setTestDetails((prev) => ({ ...prev, testName: e.target.value }))
                  }
                  className="form-control mb-1"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Marks"
                  value={testDetails.maxMarks}
                  onChange={(e) =>
                    setTestDetails((prev) => ({ ...prev, maxMarks: e.target.value }))
                  }
                  className="form-control mb-1"
                  required
                />
              </div>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Marks Scored</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={testFormData[student._id] || ""}
                          onChange={(e) =>
                            setTestFormData((prev) => ({
                              ...prev,
                              [student._id]: e.target.value
                            }))
                          }
                          placeholder="Enter marks"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="submit" className="button">
                Add
              </button>
            </form>
          </div>
        </ModalSeven>

      </div>
    </div>


    <Footer />
  </>);
}