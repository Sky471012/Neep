import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format, parse } from 'date-fns';
import axios from 'axios';
import Navbar from "../components/Navbar";
import TimetableEditor from "../components/TimetableEditor";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import ModalFour from "../modals/ModalFour";
import ModalFive from "../modals/ModalFive";
import ModalSix from "../modals/ModalSix";
import ModalSeven from "../modals/ModalSeven";
import ModalEight from "../modals/ModalEight";
import ModalNine from "../modals/ModalNine";

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
  const [modalEight, setModalEight] = useState(false);
  const [modalNine, setModalNine] = useState(false);
  const [teacherAttendanceDraft, setTeacherAttendanceDraft] = useState(undefined);
  const [studentTests, setStudentTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [allStudents, setAllStudents] = useState({});
  const [markedStatus, setMarkedStatus] = useState({});
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [attendanceExists, setAttendanceExists] = useState(false);
  const [teacherAttendanceExists, setTeacherAttendanceExists] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  const [activeStudent, setActiveStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [mode, setMode] = useState("select"); // "select" or "create"
  const [editingMarks, setEditingMarks] = useState({});
  const [testDetails, setTestDetails] = useState({
    testName: "",
    maxMarks: "",
    testDate: null
  });
  const [newStudentData, setNewStudentData] = useState({
    name: "",
    phone: "",
    dob: "",
    address: "",
    class: "",
    dateOfJoining: "",
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [testFormData, setTestFormData] = useState({});
  const [tests, setTests] = useState({});
  const [alltests, setAllTests] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    startDate: '',
    class: '',
  });
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const classOptions = ["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"];


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

  // Robust parser for dd-MM-yyyy and ISO-like date strings. Returns timestamp or Infinity.
  function parseDateToTime(dateStr) {
    if (!dateStr) return Infinity;
    const ddmmyyyy = /^([0-3]?\d)-([0-1]?\d)-(\d{4})$/;
    const m = String(dateStr).trim().match(ddmmyyyy);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      const yyyy = Number(m[3]);
      const dt = new Date(yyyy, mm - 1, dd);
      return isNaN(dt.getTime()) ? Infinity : dt.getTime();
    }
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? Infinity : parsed;
  }


  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getBatchDetails/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setBatch(data || {}))
          .catch(err => console.error("Batch fetch error:", err)),

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batchStudents/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setStudents(data.students || []))
          .catch(err => console.error("Batch students fetch error:", err)),

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/findTeacher/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setTeacher(data.teacher?.[0] || null))
          .catch(err => console.error("Assigned teacher fetch error:", err)),

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setTeachersList(data || []))
          .catch(err => console.error("Teachers list fetch error:", err)),

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batchTimetable/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setTimetable(data.timetable || []))
          .catch(err => console.error("Timetable fetch error:", err)),

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setAllStudents(data || {}))
          .catch(err => console.error("All students fetch error:", err)),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (batch) {
      setEditForm({
        name: batch.name || '',
        startDate: batch.startDate || '',
        class: batch.class || '',
      });
    }
  }, [batch]);

  const showStudentAttendance = async (student) => {
    setActiveStudent(student);
    setAttendanceMap({});
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

      setAttendanceMap(newMap);
    } catch (err) {
      console.error("Failed to fetch student attendance:", err);
      alert("Error fetching attendance");
    }
  };

  const showStudentAllTests = async (student) => {
    setActiveStudent(student);
    setStudentTests([]);
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

  const fetchAllTests = async (batchId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getTest/${batchId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error fetching tests");
      setAllTests((prev) => ({ ...prev, [batchId]: data.test }));
    } catch (err) {
      console.error(`Error fetching tests for batch ${batchId}:`, err);
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

  const setDraftStatus = (studentId, status) => {
    setAttendanceDraft(prev => {
      const next = { ...prev };
      if (status === 'present' || status === 'absent') {
        next[studentId] = status;
      } else {
        delete next[studentId];
      }
      return next;
    });
  };

  const preloadAttendanceForDate = async (dateObj) => {
    const token = localStorage.getItem("authToken");
    if (!token || !dateObj || !Array.isArray(students) || students.length === 0) return;

    const dateOnly = new Date(dateObj.toDateString());

    try {
      // Fetch each student's attendance then find the record for this batch & date
      const results = await Promise.all(
        students.map(async (s) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/${s._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

          const rec = (data.attendance || []).find((r) => {
            const rd = new Date(r.date);
            return (
              r.batchId === batchId &&
              rd.getFullYear() === dateOnly.getFullYear() &&
              rd.getMonth() === dateOnly.getMonth() &&
              rd.getDate() === dateOnly.getDate()
            );
          });

          return [s._id, rec?.status]; // 'present' | 'absent' | undefined
        })
      );

      // Populate draft with saved values only; others default to present in UI
      setAttendanceDraft(() => {
        const next = {};
        for (const [sid, status] of results) {
          if (status === "present" || status === "absent") next[sid] = status;
        }
        return next;
      });

      // Track whether any saved record exists for this date (to enable removal)
      setAttendanceExists(
        results.some(([, status]) => status === "present" || status === "absent")
      );
    } catch (err) {
      console.error("Preload attendance error:", err);
    }
  };

  const removeAttendanceForBatch = async (dateObj) => {
    if (!dateObj) {
      alert("Please select a date first.");
      return;
    }
    if (!window.confirm("Remove attendance for all students on this date?")) return;

    const token = localStorage.getItem("authToken");
    const dateOnly = new Date(dateObj.toDateString());
    const dateISO = dateOnly.toISOString();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ batchId, date: dateISO }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove attendance");

      setAttendanceDraft({});
      setAttendanceExists(false);
      closeAttendanceModalHandler();
    } catch (err) {
      console.error("Remove attendance error:", err);
      alert("Failed to remove attendance.");
    }
  };

  const saveAttendanceForBatch = async (dateObj) => {
    if (!dateObj) {
      alert("Please select a date first.");
      return;
    }

    if (!Array.isArray(students) || students.length === 0) {
      alert("No students found for this batch.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const dateOnly = new Date(dateObj.toDateString());
    const dateISO = dateOnly.toISOString();

    // Default everyone to 'present' unless draft says 'absent'
    const finalEntries = students.map(s => {
      const status = attendanceDraft[s._id] ?? "present";
      return [s._id, status];
    });

    try {
      await Promise.all(finalEntries.map(async ([studentId, status]) => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/mark`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ studentId, batchId, date: dateISO, status }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

        // reflect locally as "marked"
        setMarkedStatus(prev => ({
          ...prev,
          [`${studentId}_${batchId}_${dateOnly.toDateString()}`]: status,
        }));
      }));

      // Clear draft to avoid accidental carry-over
      setAttendanceDraft({});
      closeAttendanceModalHandler();
    } catch (err) {
      console.error("Bulk attendance error:", err);
      alert("Failed to mark some or all attendance.");
    }
  };

  const openModalOneHandler = () => {
    const date = selectedDate || new Date();
    setOpenModalOne(true);
    setSelectedDate(date);
    preloadAttendanceForDate(date);
  };

  const closeAttendanceModalHandler = () => {
    setOpenModalOne(false);
    setAttendanceExists(false);
  };

  const preloadTeacherAttendanceForDate = async (dateObj) => {
    const token = localStorage.getItem("authToken");
    if (!token || !dateObj || !teacher?._id) return;

    const dateOnly = new Date(dateObj.toDateString());

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherAttendance/${batchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

      const rec = (data.attendance || []).find((r) => {
        const rd = new Date(r.date);
        return (
          r.teacherId === teacher._id &&
          r.batchId === batchId &&
          rd.getFullYear() === dateOnly.getFullYear() &&
          rd.getMonth() === dateOnly.getMonth() &&
          rd.getDate() === dateOnly.getDate()
        );
      });

      setTeacherAttendanceDraft(rec?.status || undefined);
      setTeacherAttendanceExists(rec?.status === "present" || rec?.status === "absent");
    } catch (err) {
      console.error("Preload teacher attendance error:", err);
    }
  };

  const removeTeacherAttendance = async (dateObj) => {
    if (!dateObj) {
      alert("Please select a date first.");
      return;
    }
    if (!teacher?._id) {
      alert("No teacher assigned to this batch.");
      return;
    }
    if (!window.confirm("Remove teacher attendance on this date?")) return;

    const token = localStorage.getItem("authToken");
    const dateOnly = new Date(dateObj.toDateString());
    const dateISO = dateOnly.toISOString();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendanceTeacher/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacherId: teacher._id, batchId, date: dateISO }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove attendance");

      setTeacherAttendanceExists(false);
      closeTeacherAttendanceModalHandler();
    } catch (err) {
      console.error("Remove teacher attendance error:", err);
      alert("Failed to remove attendance.");
    }
  };

  const openModalNineHandler = () => {
    if (!teacher?._id) {
      alert("No teacher assigned to this batch.");
      return;
    }
    const date = selectedDate || new Date();
    setSelectedDate(date);
    setModalNine(true);
    preloadTeacherAttendanceForDate(date);
  };

  const closeTeacherAttendanceModalHandler = () => {
    setModalNine(false);
    setTeacherAttendanceDraft(undefined);
    setTeacherAttendanceExists(false);
  };

  const saveTeacherAttendance = async (dateObj) => {
    if (!dateObj) {
      alert("Please select a date first.");
      return;
    }
    if (!teacher?._id) {
      alert("No teacher assigned to this batch.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const dateOnly = new Date(dateObj.toDateString());
    const dateISO = dateOnly.toISOString();
    const status = teacherAttendanceDraft ?? "present";

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/attendanceTeacher/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: teacher._id,
          batchId,
          date: dateISO,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark attendance");

      closeTeacherAttendanceModalHandler();
    } catch (err) {
      console.error("Teacher attendance error:", err);
      alert("Failed to mark attendance. Please try again.");
    }
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
    if (!studentId || !batchId || !name || !maxMarks || !date || isNaN(date.getTime())) {
      return alert("All fields are required (marks can be blank for absent).");
    }

    const token = localStorage.getItem("authToken");

    // dd-mm-yyyy
    const dd = ("0" + date.getDate()).slice(-2);
    const mm = ("0" + (date.getMonth() + 1)).slice(-2);
    const yyyy = date.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    // derive absent
    const isEmpty = marksScored === "" || marksScored === undefined || marksScored === null;
    const absent = isEmpty;
    const payloadMarks = absent ? null : Number(marksScored);

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
          maxMarks: Number(maxMarks),
          marksScored: payloadMarks,  // null when absent
          date: formattedDate,
          absent
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add test");

      setTests((prev) => ({
        ...prev,
        [batchId]: [
          ...(prev[batchId] || []).filter(
            t => !(t.name === name && t.date === formattedDate && t.studentId === studentId)
          ),
          {
            _id: data.test?._id,
            studentId,
            batchId,
            name,
            maxMarks: Number(maxMarks),
            marksScored: absent ? 0 : Number(marksScored),
            date: formattedDate,
            absent
          }
        ]
      }));

      setAllTests(prev => ({
        ...prev,
        [batchId]: [
          ...(prev[batchId] || []).filter(
            t => !(t.name === name && t.date === formattedDate && t.studentId === studentId)
          ),
          {
            _id: data.test?._id,
            studentId,
            batchId,
            name,
            maxMarks: Number(maxMarks),
            marksScored: absent ? 0 : Number(marksScored),
            date: formattedDate,
            absent
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

  const openAllTestModal = async (id) => {
    await fetchAllTests(id);
    setSelectedTest(null);
    setModalEight(prev => ({ ...prev, [id]: true }));
  };


  const closeTestModal = (batchId) => {
    setModalSeven((prev) => ({ ...prev, [batchId]: false }));
  };

  const closeAllTestModal = (batchId) => {
    setModalEight((prev) => ({ ...prev, [batchId]: false }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEditBatch = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      name: batch.name || '',
      startDate: batch.startDate || '',
      class: batch.class || '',
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
    if (!editForm.name || !editForm.startDate || !editForm.class) {
      alert('All fields are required');
      return false;
    }

    // Validate DOB format (DD-MM-YYYY)
    const startDateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!startDateRegex.test(editForm.startDate)) {
      alert('Date of birth must be in DD-MM-YYYY format');
      return false;
    }

    return true;
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editBatchProfile/${batchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedBatch = await response.json();
        setBatch(updatedBatch);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update details');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      alert('Error updating profile');
    }
  };

  // begin editing a specific test's marks
  const startEditMarks = (testId, currentValue) => {
    setEditingMarks(prev => ({ ...prev, [testId]: { value: currentValue ?? "" } }));
  };

  const cancelEditMarks = (testId) => {
    setEditingMarks(prev => {
      const copy = { ...prev };
      delete copy[testId];
      return copy;
    });
  };

  // persist the edit, then refresh local UI lists
  const saveEditMarks = async (batchIdForList, testObj) => {
    const token = localStorage.getItem("authToken");
    const draft = editingMarks[testObj._id];
    if (!draft) return;

    // IMPORTANT: empty string means "absent" on backend (same rule as Teacher view)
    const payload = { marksScored: draft.value === "" ? "" : draft.value };

    try {
      // If your admin route differs, adjust below (Teacher uses /api/teacher/editMarks/:id)
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/editMarks/${testObj._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update marks");

      // Update both `tests` (if present) and `alltests` (ModalEight uses this)
      setTests(prev => {
        const list = prev[batchIdForList] || [];
        const updated = list.map(t => (t._id === testObj._id ? { ...t, ...data.test } : t));
        return { ...prev, [batchIdForList]: updated };
      });

      setAllTests(prev => {
        const list = prev[batchIdForList] || [];
        const updated = list.map(t => (t._id === testObj._id ? { ...t, ...data.test } : t));
        return { ...prev, [batchIdForList]: updated };
      });

      cancelEditMarks(testObj._id);
    } catch (err) {
      console.error("Edit marks error:", err);
      alert("Failed to update marks.");
    }
  };

  const handleDeleteTestGroup = async (batchId, test) => {
    if (!window.confirm(`Are you sure you want to delete the test "${test.name}" dated ${test.date} for the whole batch? This cannot be undone.`)) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/deleteTest`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ batchId, name: test.name, date: test.date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete test');

      // remove all test entries matching this name+date from local state for this batch
      setTests(prev => {
        const list = prev[batchId] || [];
        const filtered = list.filter(t => !(t.name === test.name && t.date === test.date));
        return { ...prev, [batchId]: filtered };
      });

      // Also remove from the aggregated `alltests` cache so the All Tests modal updates
      setAllTests(prev => {
        const list = prev[batchId] || [];
        const filtered = list.filter(t => !(t.name === test.name && t.date === test.date));
        return { ...prev, [batchId]: filtered };
      });

      setSelectedTest(null);
    } catch (err) {
      console.error('Delete test group error:', err);
      alert(err.message || 'Failed to delete test');
    }
  };

  if (loading) return (<div className="loading-container"><div className="loading-content"><div className="loading-spinner"></div><p className="loading-text">Loading batch details...</p></div></div>);

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
                      Student Attendance
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={openModalNineHandler}>
                      Teacher Attendance
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => openTestModal(batch.batchId)}>
                      Add Test Scores
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => openAllTestModal(batch._id)}>
                      Show Tests
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleEditClick} disabled={isEditing}>
                      Edit Batch Details
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item ${batch.archive ? 'text-warning' : 'text-warning'}`}
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
          </div>


          {isEditing ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-blue-900"
                    viewBox="0 0 640 640"
                    fill="currentColor"
                  >
                    <path d="M320 205.3L320 514.6L320.5 514.4C375.1 491.7 433.7 480 492.8 480L512 480L512 160L492.8 160C450.6 160 408.7 168.4 369.7 184.6C352.9 191.6 336.3 198.5 320 205.3zM294.9 125.5L320 136L345.1 125.5C391.9 106 442.1 96 492.8 96L528 96C554.5 96 576 117.5 576 144L576 496C576 522.5 554.5 544 528 544L492.8 544C442.1 544 391.9 554 345.1 573.5L332.3 578.8C324.4 582.1 315.6 582.1 307.7 578.8L294.9 573.5C248.1 554 197.9 544 147.2 544L112 544C85.5 544 64 522.5 64 496L64 144C64 117.5 85.5 96 112 96L147.2 96C197.9 96 248.1 106 294.9 125.5z" />
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
                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                  <div className="detail-label">Code: {batch.code}</div>
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
                      }}
                    >
                      <option value="">Select Class</option>
                      {classOptions.map(option => (
                        <option key={option} value={option} className="text-dark">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <div className="detail-label">Teacher Asssigned: <br />{teacher?.name || "Not assigned"}</div>
                </div>

                <div className="detail-item">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                  </svg>
                  <div className="detail-label d-flex flex-nowrap">
                    <label className="mb-0 white-space-nowrap">Started On:</label>
                    <DatePicker
                      selected={
                        editForm.startDate
                          ? new Date(editForm.startDate.split('-').reverse().join('-'))
                          : null
                      }
                      onChange={(startDate) => {
                        const formattedDate = startDate
                          ? `${startDate.getDate().toString().padStart(2, '0')}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`
                          : '';
                        setEditForm((prev) => ({ ...prev, startDate: formattedDate }));
                      }}
                      dateFormat="dd-MM-yyyy"
                      className="form-control d-inline-block ms-2"
                      placeholderText="Select Start Date"
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
                  <div className="detail-label">Enrolled Students	: {students.length}</div>
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
                    onClick={handleCancelEditBatch}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-blue-900"
                    viewBox="0 0 640 640"
                    fill="currentColor"
                  >
                    <path d="M320 205.3L320 514.6L320.5 514.4C375.1 491.7 433.7 480 492.8 480L512 480L512 160L492.8 160C450.6 160 408.7 168.4 369.7 184.6C352.9 191.6 336.3 198.5 320 205.3zM294.9 125.5L320 136L345.1 125.5C391.9 106 442.1 96 492.8 96L528 96C554.5 96 576 117.5 576 144L576 496C576 522.5 554.5 544 528 544L492.8 544C442.1 544 391.9 554 345.1 573.5L332.3 578.8C324.4 582.1 315.6 582.1 307.7 578.8L294.9 573.5C248.1 554 197.9 544 147.2 544L112 544C85.5 544 64 522.5 64 496L64 144C64 117.5 85.5 96 112 96L147.2 96C197.9 96 248.1 106 294.9 125.5z" />
                  </svg>
                </div>
                <h2 className="profile-title mb-2" style={{ margin: "0 auto" }}>{batch?.name || "No name"}</h2>
              </div>

              <div className="student-details-card">
                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                  <div className="detail-label">Code: {batch.code}</div>
                </div>

                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <div className="detail-label">Class: {batch.class}</div>
                </div>

                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <div className="detail-label">Teacher Asssigned: <br />{teacher?.name || "Not assigned"}
                    {teacher && (
                      <Link to={`/teacher/${teacher._id}`} className="ms-1 text-light">
                        <i className="bi bi-box-arrow-up-right"></i>
                      </Link>
                    )}</div>
                </div>

                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                  </svg>
                  <div className="detail-label">Started on: {batch.startDate}</div>
                </div>

                <div className="detail-item p-1">
                  <svg className="w-4 h-4" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                  </svg>
                  <div className="detail-label">Enrolled Students	: {students.length}</div>
                </div>
              </div>
            </>
          )}
        </div>



        {/* Timetable */}
        <div className="content-area">
          <div className="welcome-card">
            <div className="batches-header">
              <h2 className="batches-title">Timetable</h2>
              {timetable && timetable.length > 0 ? (
                <table className="table table-bordered text-center mt-3">
                  <thead className="table">
                    <tr>
                      <th style={{ padding: "10px 20px" }}>Weekday</th>
                      <th style={{ textAlign: "right", padding: "10px 20px" }}>Time Slots</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable
                      .sort((a, b) => weekdayOrder[a.weekday] - weekdayOrder[b.weekday])
                      .map((entry, index) => (
                        <tr key={index}>
                          <td>{entry.weekday}</td>
                          <td style={{ textAlign: "right" }}>
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
          </div>

          {/* Students List Section */}
          <div className="batches-section">
            <div className="flex justify-content-between">
              <div className="batches-header">
                <h2 className="batches-title">All Students</h2>
                <div className="search-container">
                  <svg className="search-icon w-4 h-4 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search students with name and contact number..."
                    className="search-input"
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <table className="table table-borderless align-middle">
              <tbody>
                {students
                  .filter((s) =>
                    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.phone.includes(studentSearch)
                  )
                  .sort((a, b) => a.name.localeCompare(b.name)) // sort alphabetically
                  .map((s) => (
                    <tr key={s._id}>
                      <td style={{ width: "60%" }}>
                        {s.name} ({s.phone})
                        <Link className="ms-1 text-primary" to={`/student/${s._id}`}>
                          <i className="bi bi-box-arrow-up-right"></i>
                        </Link>
                      </td>
                      <td style={{ width: "40%" }}>
                        {/* For medium+ screens: all buttons in a row */}
                        <div className="d-none d-sm-flex justify-content-end gap-2">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => showStudentAttendance(s)}>
                            Attendance
                          </button>
                          <button className="btn btn-outline-primary btn-sm" onClick={() => showStudentAllTests(s)}>
                            Tests
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => removeStudent(batchId, s._id)}>
                            Remove
                          </button>
                        </div>

                        {/* For small screens: 2 in one row, 1 below */}
                        <div className="d-sm-none">
                          <div className="d-flex gap-2 mb-2">
                            <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => showStudentAttendance(s)}>
                              Attendance
                            </button>
                            <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => showStudentAllTests(s)}>
                              Tests
                            </button>
                          </div>
                          <button className="btn btn-outline-danger btn-sm w-100" onClick={() => removeStudent(batchId, s._id)}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Attendance Modal */}
        <ModalOne isOpen={openModalOne} onClose={closeAttendanceModalHandler}>
          <div className="attendance-form">
            <h3 className="modal-title">Mark Attendance for {batch.name}</h3>

            <DatePicker
              className="datePicker mt-1 mb-2"
              dateFormat="dd-MM-yyyy"
              selected={selectedDate}
              onChange={(date) => { setSelectedDate(date); preloadAttendanceForDate(date); }}
              placeholderText="Select date"
              required
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={10}
              scrollableYearDropdown
              maxDate={new Date()}
              openToDate={new Date()}
              minDate={new Date("1995-01-01")}
            />

            <small className="text-muted d-block text-center">
              {(() => {
                const total = students.length || 0;
                const absentCount = Object.values(attendanceDraft || {}).filter(v => v === "absent").length;
                const presentCount = total - absentCount; // default present
                return `Selected: ${presentCount} Present, ${absentCount} Absent`;
              })()}
            </small>

            <div style={{ maxHeight: "50vh", overflowY: "auto", margin: "15px 0" }}>
              <table className="table table-bordered mt-3">
                <thead>
                  <tr>
                    <th style={{ width: "50%", padding: "10px 20px" }}>Student</th>
                    <th style={{ width: "50%", padding: "10px 20px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    ?.slice() // make a shallow copy so original array isn’t mutated
                    .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                    .map((student) => {
                      const chosen = attendanceDraft[student._id]; // 'present' | 'absent' | undefined
                      const effective = chosen ?? "present";
                      return (
                        <tr key={student._id}>
                          <td style={{ width: "50%", textWrap: "wrap" }}>{student.name} ({student.phone})</td>
                          <td style={{ width: "50%" }}>
                            <div className="d-flex gap-2 align-items-center flex-wrap" role="group" aria-label="attendance">
                              <button
                                type="button"
                                className={`btn btn-sm ${effective === "present" ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setDraftStatus(student._id, "present")}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${effective === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => setDraftStatus(student._id, "absent")}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className={`d-flex align-items-center mt-2 ${attendanceExists ? "justify-content-between" : "justify-content-center"}`}>
              {attendanceExists && (
                <button
                  className="btn btn-outline-danger"
                  disabled={!selectedDate}
                  onClick={() => removeAttendanceForBatch(selectedDate)}
                >
                  Remove Attendance
                </button>
              )}

              <button
                className="btn btn-primary"
                disabled={!selectedDate || (students.length || 0) === 0}
                onClick={() => saveAttendanceForBatch(selectedDate)}
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </ModalOne>

        {/* Assign Teacher Modal */}
        <ModalTwo
          isOpen={modalTwo}
          onClose={() => setModalTwo(false)}
        >
          <div className="selectTeacherBox">
            <h3 className="modal-title">Assigning Teacher to {batch.name}</h3>

            <div className="form-group">
              <label>Select Teacher</label>
              <select
                className="form-select mt-1"
                value={selectedTeacher[batchId] || ""}
                onChange={(e) =>
                  setSelectedTeacher((prev) => ({ ...prev, [batchId]: e.target.value }))
                }
              >
                <option value="">-- Select a teacher --</option>
                {teachersList
                  ?.slice() // make a shallow copy so original array isn’t mutated
                  .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                  .map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              className="btn btn-primary mt-3"
              style={{ width: "100%" }}
              onClick={() => assignTeacherToBatch(batchId, selectedTeacher[batchId])}
            >
              Assign Teacher
            </button>
          </div>
        </ModalTwo>

        <ModalThree
          isOpen={modalThree}
          onClose={() => {
            setModalThree(false);
            setActiveStudent(null);
          }}
        >
          {activeStudent && (<>
            <h3 className="modal-title mb-0">Attendance of {activeStudent.name}</h3>
            <div id={`carousel-${activeStudent._id}`} className="carousel calendar-carousel calendar-static slide mt-2">
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
                  const firstDayOffset = new Date(calendarYear, calendarMonth, 1).getDay();
                  const today = new Date();
                  const isCurrentMonth =
                    today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;

                  return (
                    <div
                      key={month}
                      className={`carousel-item ${monthIdx === activeMonthIndex ? "active" : ""}`}
                    >
                      <h6 className="month-title">{month} {calendarYear}</h6>
                      <div className="weekday-header">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>
                      <div className="calendar-grid">
                        {[...Array(firstDayOffset)].map((_, i) => (
                          <div key={`empty-${i}`} className="date-box empty" />
                        ))}
                        {[...Array(daysInMonth)].map((_, d) => {
                          const date = new Date(calendarYear, calendarMonth, d + 1);
                          const formatted = date.toISOString().split("T")[0];
                          const key = `${batchId}_${formatted}`;
                          const status = attendanceMap[key];
                          const isToday = isCurrentMonth && today.getDate() === d + 1;

                          return (
                            <div
                              key={d}
                              className={`date-box ${status === "present"
                                ? "present"
                                : status === "absent"
                                  ? "absent"
                                  : ""
                                } ${isToday ? "today" : ""}`}
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
              <div className="calendar-controls">
                <button
                  className="calendar-button"
                  onClick={() =>
                    setActiveMonthIndex((prev) => (prev - 1 + 12) % 12)
                  }
                >
                  ‹ Previous
                </button>
                <button
                  className="calendar-button"
                  onClick={() =>
                    setActiveMonthIndex((prev) => (prev + 1) % 12)
                  }
                >
                  Next ›
                </button>
              </div>
            </div>
          </>)}
        </ModalThree>

        <ModalFour isOpen={modalFour} onClose={() => setModalFour(false)}>
          <TimetableEditor
            batch={batch}
            timetable={timetable}
            onSave={updateTimetable}
            initialDay="Monday"
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
          <div className="adding-student-box">
            <h3 className="modal-title">Add Students to {batch.name}</h3>

            {/* Role Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(220, 220, 220, 0.8)',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '20px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setMode("select")}
                className={`role-switch-button ${mode === "select" ? "active" : ""
                  }`}
              >
                Select Existing
              </button>
              <button
                onClick={() => setMode("create")}
                className={`role-switch-button ${mode === "create" ? "active" : ""
                  }`}
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
                <div style={{ maxHeight: "53vh", overflowY: "auto", margin: "10px" }}>
                  {filteredStudents
                    ?.slice() // make a shallow copy so original array isn’t mutated
                    .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                    .map((student) => (
                      <div key={student._id} className="d-flex align-items-center mb-1 text-break w-100">
                        <input
                          type="checkbox"
                          className="checkbox"
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
                <button className="btn btn-primary mt-2" style={{ width: "100%" }} onClick={handleAddSelectedStudents}>
                  Add Selected Students
                </button>
              </>
            ) : (
              <>
                <input
                  className="form-control mb-2"
                  placeholder="Student's Name..."
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Student's Phone..."
                  value={newStudentData.phone}
                  onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Guardian's Name..."
                  value={newStudentData.guardianName || ""}
                  onChange={(e) => setNewStudentData({ ...newStudentData, guardianName: e.target.value })}
                />
                <select
                  className="form-select mb-2"
                  value={newStudentData.class}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, class: e.target.value })
                  }
                >
                  <option value="" disabled hidden>
                    Select Class
                  </option>
                  {["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"].map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select mb-2"
                  value={newStudentData.schoolType || ""}
                  onChange={(e) => setNewStudentData({ ...newStudentData, schoolType: e.target.value })}
                >
                  <option value="" disabled hidden>
                    Select School Type
                  </option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                </select>
                <div className="form-group">
                  <DatePicker
                    selected={
                      newStudentData.dob
                        ? parse(newStudentData.dob, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) =>
                      setNewStudentData({
                        ...newStudentData,
                        dob: format(date, "dd-MM-yyyy"),
                      })
                    }
                    dateFormat="dd-MM-yyyy"
                    className="datePicker"
                    placeholderText="Date of Birth..."
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    openToDate={new Date('2007-01-01')}
                    minDate={new Date("1995-01-01")}
                  />
                </div>
                <input
                  className="form-select"
                  placeholder="Student's Address..."
                  value={newStudentData.address}
                  onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                />
                <div className="form-group">
                  <DatePicker
                    selected={
                      newStudentData.dateOfJoining
                        ? parse(newStudentData.dateOfJoining, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) =>
                      setNewStudentData({
                        ...newStudentData,
                        dateOfJoining: format(date, "dd-MM-yyyy"),
                      })
                    }
                    dateFormat="dd-MM-yyyy"
                    className="datePicker"
                    placeholderText="Date of Joining..."
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    openToDate={new Date()}
                    minDate={new Date("1995-01-01")}
                  />
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={async () => {
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
          </div>
        </ModalFive>

        <ModalSix
          isOpen={modalSix}
          onClose={() => {
            setModalSix(false);
            setActiveStudent(null);
          }}
        >
          <div className="test-details">
            <h3 className="modal-title">Tests Scores of {activeStudent?.name}</h3>

            {studentTests.length === 0 ? (
              <p>No test records found for this batch.</p>
            ) : (
              <table className="table table-colored">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 20px" }}>Test Name</th>
                    <th style={{ padding: "10px 20px" }}>Date</th>
                    <th style={{ padding: "10px 20px" }}>Marks Scored</th>
                    <th style={{ padding: "10px 20px" }}>Max Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentTests
                    .sort((a, b) => parseDateToTime(a.date) - parseDateToTime(b.date))
                    .map((test) => (
                      <tr key={test._id}>
                        <td>{test.name}</td>
                        <td>{test.date}</td>
                        <td>
                          {test.absent
                            ? <span style={{ color: "red" }}>-AB-</span>
                            : test.marksScored}
                        </td>
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
          <div className="test-form">
            <h3 className="modal-title mb-1">Add Test in {batch.name}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { testName, maxMarks, testDate } = testDetails;
                if (!testName || !maxMarks || !testDate) {
                  return alert("Please fill test name, max marks, and date.");
                }

                const date = new Date(testDate);

                // ✅ Call for every student; pass raw value (can be "", undefined, or "0")
                for (const student of students || []) {
                  const ms = testFormData[student._id]; // raw input
                  await addTest(
                    student._id,
                    batch._id,
                    testName,
                    Number(maxMarks),
                    ms,          // leave as-is; addTest will infer absent if empty
                    date
                  );
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
                  className="datePicker mb-2"
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select test date"
                  required
                  showYearDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={10}
                  scrollableYearDropdown
                  maxDate={new Date()}
                  openToDate={new Date()}
                  minDate={new Date("1995-01-01")}
                />
                <input
                  type="text"
                  placeholder="Test Name"
                  value={testDetails.testName}
                  onChange={(e) =>
                    setTestDetails((prev) => ({ ...prev, testName: e.target.value }))
                  }
                  className="form-control mb-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Marks"
                  value={testDetails.maxMarks}
                  onChange={(e) =>
                    setTestDetails((prev) => ({ ...prev, maxMarks: e.target.value }))
                  }
                  className="form-control mb-2"
                  required
                />
              </div>
              <div style={{ maxHeight: "40vh", overflowY: "auto", margin: "10px 0" }}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ padding: "10px 20px" }}>Student Name</th>
                      <th style={{ padding: "10px 20px" }}>Marks Scored</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      ?.slice() // make a shallow copy so original array isn’t mutated
                      .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                      .map((student) => (
                        <tr key={student._id}>
                          <td style={{ width: "57%", textWrap: "wrap" }}>{student.name} ({student.phone})</td>
                          <td style={{ width: "43%" }}>
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
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Add
              </button>
            </form>
          </div>
        </ModalSeven>

        <ModalEight
          isOpen={modalEight[batch._id]}
          onClose={() => closeAllTestModal(batch._id)}
        >
          <div className="selectTeacherBox" style={{ minWidth: "300px" }}>
            {(() => {
              const batchIdKey = batch._id;
              const batchStudents = students || [];                 // array, not students[batchId]
              const batchTests = alltests[batchIdKey] || [];        // <-- server-fetched tests ONLY

              if (!batchTests.length) {
                return <div className="p-4 text-center text-muted">No tests found for this batch.</div>;
              }

              // Unique (name+date) test headers for list view
              const uniqueTestHeaders = Array.from(
                new Map(
                  batchTests.map(t => [
                    `${t.name}_${t.date}`,
                    { name: t.name, date: t.date, maxMarks: t.maxMarks }
                  ])
                ).values()
              ).sort((a, b) => parseDateToTime(a.date) - parseDateToTime(b.date))
              return (
                <div>
                  {!selectedTest ? (
                    <div>
                      <h5 className="mb-3 text-center">Tests for {batch.name}</h5>
                      <input
                        type="search"
                        placeholder="Search tests with name..."
                        className="search-input"
                        value={testSearchQuery}
                        onChange={(e) => setTestSearchQuery(e.target.value)}
                      />
                      <ul className="list-group">
                        {uniqueTestHeaders
                          .filter(
                            (test) =>
                              test.name.toLowerCase().includes(testSearchQuery.toLowerCase())
                          ).map((test, idx) => (
                            <li
                              key={`${test.name}_${test.date}_${idx}`}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <span>{test.name} <small className="text-muted">({test.date})</small></span>
                              <button
                                className="text-primary"
                                style={{ border: "none", background: "transparent", fontSize: "13px" }}
                                onClick={() => setSelectedTest(test)}
                              >
                                View<i className="bi bi-arrow-right ms-1"></i>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div style={{ height: "85vh", overflowY: "auto" }}>
                      <h3 className="modal-title" style={{ textAlign: "left" }}>
                        <button
                          style={{ border: "none", background: "transparent" }}
                          onClick={() => setSelectedTest(null)}
                        >
                          <i className="fas fa-arrow-left"></i>
                        </button>
                        {selectedTest.name}
                      </h3>
                      <button className="btn btn-outline-danger" onClick={() => handleDeleteTestGroup(batchId, selectedTest)} style={{ position: "absolute", right: "45px" }}><i className="bi bi-trash"></i></button>
                      <span style={{ textAlign: "left", marginBottom: "1rem", display: "inline-block" }}>
                        Date :- {selectedTest.date} <br />
                        Maximum Marks :- {selectedTest.maxMarks}
                      </span>

                      <table className="table table-colored">
                        <thead>
                          <tr>
                            <th style={{ padding: "10px 20px" }}>Student Name</th>
                            <th style={{ padding: "10px 20px" }}>Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchStudents
                            ?.slice() // make a shallow copy so original array isn’t mutated
                            .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical sort
                            .map((student) => {
                              const match = batchTests.find(
                                (t) =>
                                  t.name === selectedTest.name &&
                                  t.date === selectedTest.date &&
                                  t.studentId === student._id
                              );

                              return (
                                <tr key={student._id}>
                                  <td style={{ width: "50%", textWrap: "wrap" }}>{student.name}</td>
                                  <td style={{ width: "50%", textWrap: "wrap" }}>
                                    {match ? (
                                      editingMarks[match._id] ? (
                                        <div className="d-flex align-items-center" style={{ gap: 8 }}>
                                          <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={editingMarks[match._id].value}
                                            onChange={(e) =>
                                              setEditingMarks(prev => ({ ...prev, [match._id]: { value: e.target.value } }))
                                            }
                                            placeholder="Empty = Absent"
                                            style={{ maxWidth: 120 }}
                                          />
                                          <button
                                            className="btn btn-sm btn-outline-success border-0"
                                            onClick={() => saveEditMarks(batch._id, match)}
                                            title="Save"
                                          >
                                            <i className="bi bi-check-lg"></i>
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-secondary border-0"
                                            onClick={() => cancelEditMarks(match._id)}
                                            title="Cancel"
                                          >
                                            <i className="bi bi-x-lg"></i>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="d-flex justify-content-between align-items-center" style={{ gap: 8 }}>
                                          {/* Show -AB- if absent, else the marks (or -- if truly missing) */}
                                          <span>{match.absent ? <span style={{ color: "red" }}>-AB-</span> : (match.marksScored ?? "--")}</span>
                                          <button
                                            className="btn btn-link btn-sm p-0"
                                            onClick={() => startEditMarks(match._id, match.absent ? "" : (match.marksScored ?? ""))}
                                            title="Edit marks"
                                          >
                                            <i className="bi bi-pencil-square"></i>
                                          </button>
                                        </div>
                                      )
                                    ) : (
                                      "--"
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </ModalEight>

        {/* Teacher Attendance Modal */}
        <ModalNine isOpen={modalNine} onClose={closeTeacherAttendanceModalHandler}>
          <div className="attendance-form" style={{ minHeight: "450px" }}>
            <h3 className="modal-title">Mark Attendance for {batch.name}</h3>

            <div className="text-center mb-2 mt-1" style={{ fontWeight: 500 }}>
              Teacher: {teacher?.name || "Not assigned"}
            </div>

            <DatePicker
              className="datePicker mt-1 mb-2"
              dateFormat="dd-MM-yyyy"
              selected={selectedDate}
              onChange={(date) => { setSelectedDate(date); preloadTeacherAttendanceForDate(date); }}
              placeholderText="Select date"
              required
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={10}
              scrollableYearDropdown
              maxDate={new Date()}
              openToDate={new Date()}
              minDate={new Date("1995-01-01")}
            />

            <div style={{ maxHeight: "55vh", overflowY: "auto", margin: "10px 0" }}>
              <table className="table table-bordered mt-3">
                <thead>
                  <tr>
                    <th style={{ width: "40%", padding: "10px 20px" }}>Teacher</th>
                    <th style={{ width: "60%", padding: "10px 20px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: "40%", wordWrap: "break-word" }}>
                      {teacher?.name || "—"}
                    </td>
                    <td style={{ width: "60%" }}>
                      <div className="d-flex gap-2 align-items-center flex-wrap" role="group" aria-label="attendance">
                        <button
                          type="button"
                          className={`btn btn-sm ${(teacherAttendanceDraft ?? "present") === "present" ? "btn-success" : "btn-outline-success"}`}
                          onClick={() => setTeacherAttendanceDraft("present")}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${teacherAttendanceDraft === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                          onClick={() => setTeacherAttendanceDraft("absent")}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              {teacherAttendanceExists ? (
                <button
                  className="btn btn-outline-danger"
                  disabled={!selectedDate || !teacher?._id}
                  onClick={() => removeTeacherAttendance(selectedDate)}
                >
                  Remove Attendance
                </button>
              ) : (
                <span />
              )}
              <button
                className="btn btn-primary"
                disabled={!selectedDate || !teacher?._id}
                onClick={() => saveTeacherAttendance(selectedDate)}
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </ModalNine>

      </div>
    </div>

  </>);
}