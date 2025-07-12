import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";

export default function BatchDetails() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  console.log(token);

  const [batch, setBatch] = useState({});
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [teachersList, setTeachersList] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModalOne, setOpenModalOne] = useState(false);
  const [modalTwo, setModalTwo] = useState(false);
  const [modalThree, setModalThree] = useState(false);
  const [markedStatus, setMarkedStatus] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  const [activeStudent, setActiveStudent] = useState(null);
  const academicYearStart = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();

  const allMonths = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ];

  function getAcademicMonthIndex(month) {
    // Convert calendar month (0–11) to academic month index (0–11)
    return month >= 3 ? month - 3 : month + 9;
  }

  const today = new Date();
  const [activeMonthIndex, setActiveMonthIndex] = useState(getAcademicMonthIndex(today.getMonth()));


  useEffect(() => {
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

      const [bData, sData, tData, tList, ttData] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json(), res5.json()]);
      setBatch(bData || {});
      setStudents(sData.students || []);
      setTeacher(tData.teacher[0] || null);
      setTeachersList(tList || []);
      setTimetable(ttData.timetable || []);
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

      alert("Batch deleted successfully!");
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

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="container mt-4">
          <div className="card mb-5" style={{ padding: "20px" }}>
            <h2>{batch?.name || "No name"}</h2>
            <p><strong>Batch code:</strong> {batch.code}</p>
            <p><strong>Started on:</strong> {batch.startDate}</p>
            <p><strong>Teacher:</strong> {teacher?.name || "Not assigned"}</p>

            <div className="d-flex gap-3 mt-3">
              <button className="button" onClick={openModalOneHandler}>Mark / Change Attendance</button>
              <button className="button" onClick={() => setModalTwo(true)}>Assign / Change Teacher</button>
              <button className="button">Add / Edit Timetable</button>
              <button className="button">Add Student</button>
              <button className="btn btn-danger" onClick={() => deleteBatch(batch._id)}>Delete Batch</button>
            </div>
          </div>

          {/* Timetable */}
          <div className="timetable-details">
            <h3>Timetable</h3>
            {timetable && timetable.length > 0 ? (
              <table className="table table-bordered text-center mt-3">
                <thead className="table-dark">
                  <tr>
                    <th>Weekday</th>
                    <th>Time Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.weekday}</td>
                      <td>
                        {entry.classTimings.map((slot, idx) => (
                          <div key={idx}>
                            {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
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
            <h2>All Students</h2>
            <table className="table table-borderless align-middle">
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td style={{ width: "40%" }}>{s.name}</td>
                    <td style={{ width: "30%" }}>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => showStudentAttendance(s)}>Show Attendance</button>
                    </td>
                    <td style={{ width: "30%" }}>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => removeStudent(batchId, s._id)}>Remove</button>
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
                        <td>{student.name}</td>
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

        </div>
      </div>
      <Footer />
    </>
  );
}