import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AttendanceList from "../modals/AttendanceMarking";
import Teacher from "../modals/Teacher";
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BatchDetails() {
  const { batchId } = useParams();
  const token = localStorage.getItem("authToken");

  const [batch, setBatch] = useState({});
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [teachersList, setTeachersList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [attendanceModal, setAttendanceModal] = useState(false);
  const [teacherModal, setTeacherModal] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");

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

      const [bData, sData, tData, tList] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json()]);
      setBatch(bData || {});
      setStudents(sData.students || []);
      setTeacher(tData.teacher[0] || null);
      setTeachersList(tList || []);
    };

    fetchData();
  }, [batchId]);

  const deleteBatch = async (batchId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this batch?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/batchDelete/${batchId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete batch.");
        return;
      }

      alert("Batch deleted successfully!");

      // ✅ Remove batch from local list without refresh
      const updated = batchesRecords.filter(b => b._id !== batchId);
      setBatchesRecords(updated);



    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting.");
    }
  };

  return (<>
    <Navbar />

    <div className="main-content">
      <div className="container mt-4">
        <h2>{batch?.name || "No name"}</h2>
        <p><strong>Batch code:</strong> {batch.code}</p>
        <p><strong>Started on:</strong> {batch.startDate}</p>
        <p><strong>Teacher:</strong> {teacher?.name || "Not assigned"}</p>

        <div className="d-flex gap-3 mt-3">
          <button className="button" onClick={() => setAttendanceModal(true)}>Mark / Change Attendance</button>
          <button className="button" onClick={() => setTeacherModal(true)}>Assign / Change Teacher</button>
          <button className="btn btn-danger" onClick={() => deleteBatch(batch._id)}>Delete Batch</button>
        </div>

        {/* Students List Section */}
        <div className="mt-4">
          <h2>All Students</h2>
          <table className="table table-borderless align-middle">
            <tbody>
              {students.map((s) => (
                <tr key={s._id} style={{ backgroundClip: "red" }}>
                  <td style={{ width: "40%" }}>{s.name}</td>
                  <td style={{ width: "30%" }}>
                    <button className="btn btn-outline-primary btn-sm">
                      Show Attendance
                    </button>
                  </td>
                  <td style={{ width: "30%" }}>
                    <button className="btn btn-outline-danger btn-sm">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Attendance Modal */}
        <AttendanceList
          isOpen={attendanceModal}
          onClose={() => setAttendanceModal(false)}
        >
          <h3>Mark Attendance</h3>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
          />
          <table className="table mt-3">
            <thead>
              <tr>
                <th>Student</th>
                <th>Present</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td><button className="btn btn-success btn-sm">Present</button></td>
                  <td><button className="btn btn-danger btn-sm">Absent</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </AttendanceList>

        {/* Assign Teacher Modal */}
        <Teacher
          isOpen={teacherModal}
          onClose={() => setTeacherModal(false)}
        >
          <h3>Assign a Teacher</h3>
          <select
            className="form-select"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Select --</option>
            {teachersList.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
          <button className="btn btn-primary mt-3">Assign</button>
        </Teacher>
      </div>
    </div>

    <Footer />
  </>);
}
