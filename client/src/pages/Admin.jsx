import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BatchControls from "../components/BatchControls";
import StudentControls from "../components/StudentControls";
import TeacherControls from "../components/TeacherControls";
import Batch from "../modals/Batch";
import Student from "../modals/Student";
import Teacher from "../modals/Teacher";

export default function Admin() {
    const [admin, setAdmin] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [studentsRecords, setStudentsRecords] = useState([]);
    const [teachersRecords, setTeachersRecords] = useState([]);
    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [openStudentModal, setOpenStudentModal] = useState(false);
    const [openTeacherModal, setOpenTeacherModal] = useState(false);
    const [credentials, setCredentials] = useState({
        batch: "",
        studentName: "",
        studentPhone: "",
        studentDob: "",
        teacherName: "",
        teacherEmail:""
    });
    const [dob, setDob] = useState(null);



    useEffect(() => {
        const storedAdmin = localStorage.getItem("teacher");
        const token = localStorage.getItem("authToken");

        if (storedAdmin && token && storedAdmin !== "undefined") {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (err) {
                console.error("Failed to parse admin JSON:", err);
                localStorage.removeItem("admin");
                return;
            }

            // Fetch batches
            fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all batches");
                    return res.json();
                })
                .then(setBatchesRecords)
                .catch((err) => console.error("Batches fetch error:", err));

            // Fetch students
            fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/students`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all students");
                    return res.json();
                })
                .then(setStudentsRecords)
                .catch((err) => console.error("Students fetch error:", err));

            // Fetch teachers
            fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/teachers`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all teachers");
                    return res.json();
                })
                .then(setTeachersRecords)
                .catch((err) => console.error("Teachers fetch error:", err));
        }
    }, []);

    const createBatch = async (batchName) => {
        if (!batchName.trim()) {
            alert("Please enter a batch name.");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/batchCreate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ name: batchName }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error creating batch.");
                return;
            }

            setOpenBatchModal(false); // close modal
            setBatchesRecords((prev) => [...prev, data]); // update state
            setCredentials({ batch: "" }); // reset form
        } catch (error) {
            console.error("Error creating batch:", error);
            alert("Something went wrong.");
        }
    };

    const createStudent = async (studentName, studentPhone, studentDob) => {

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/studentCreate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ name: studentName, phone: studentPhone, dob: studentDob }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message );
                return;
            }

            setOpenStudentModal(false); // close modal
            setStudentsRecords((prev) => [...prev, data]); // update state
            setCredentials((prev) => ({
                ...prev,
                studentName: "",
                studentPhone: "",
                studentDob: ""
            }));
            // reset form
        } catch (error) {
            console.error("Error creating student:", error);
            alert("Something went wrong.");
        }
    };

    
    const createTeacher = async (teacherName, teacherEmail) => {

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/teacherCreate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ name: teacherName, email: teacherEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message );
                return;
            }

            setOpenTeacherModal(false); // close modal
            setTeachersRecords((prev) => [...prev, data]); // update state
            setCredentials((prev) => ({
                ...prev,
                teacherName: "",
                teacherEmail: ""
            }));
            // reset form
        } catch (error) {
            console.error("Error creating teacher:", error);
            alert("Something went wrong.");
        }
    };

    const handleInputChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setDob(date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDob = `${day}-${month}-${year}`;

        setCredentials((prev) => ({
            ...prev,
            studentDob: formattedDob,
        }));
    };

    const handleBatchFormSubmit = (e) => {
        e.preventDefault();
        createBatch(credentials.batch);
    };

    const handleStudentFormSubmit = (e) => {
        e.preventDefault();
        createStudent(
            credentials.studentName,
            credentials.studentPhone,
            credentials.studentDob
        );
    };

    const handleTeacherFormSubmit = (e) => {
        e.preventDefault();
        createTeacher(
            credentials.teacherName,
            credentials.teacherEmail
        );
    };


    return (
        <>
            <Navbar />

            <div className="main-content">
                <div className="adminbar d-flex gap-3 m-5">
                    <a href="#batches">Batches</a>
                    <a href="#students">Students</a>
                    <a href="#teachers">Teachers</a>
                    <button className="button" onClick={() => setOpenBatchModal(true)}>Add a batch</button>
                    <button className="button" onClick={() => setOpenStudentModal(true)}>Add student</button>
                    <button className="button" onClick={() => setOpenTeacherModal(true)}>Add teacher</button>
                </div>

                <BatchControls batchesRecords={batchesRecords} setBatchesRecords={setBatchesRecords} />
                <StudentControls studentsRecords={studentsRecords} setStudentsRecords={setStudentsRecords} />
                <TeacherControls teachersRecords={teachersRecords} setTeachersRecords={setTeachersRecords} />
            </div>

            <Footer />


            <Batch
                isOpen={openBatchModal}
                onClose={() => setOpenBatchModal(false)}
                onCreate={createBatch}
            >
                <h3>Batch Creation</h3>
                <form className='login-form mt-3' onSubmit={handleBatchFormSubmit}>
                    <div className="input-group flex gap-1">
                        <label htmlFor="batch">Batch Name</label>
                        <input
                            type="text"
                            id="batch"
                            name="batch"
                            value={credentials.batch}
                            onChange={handleInputChange}
                            required
                            placeholder='Write Batch Name...'
                        />
                    </div>
                    <button className='btn btn-success mt-2' type="submit">Create Batch</button>
                </form>
            </Batch>


            <Student
                isOpen={openStudentModal}
                onClose={() => setOpenStudentModal(false)}
                onCreate={createStudent}
            >
                <h3>Adding a Student</h3>
                <form className='login-form mt-3' onSubmit={handleStudentFormSubmit}>
                    <div className="input-group flex gap-1">
                        <label htmlFor="studentName">Student Name</label>
                        <input
                            type="text"
                            id="studentName"
                            name="studentName"
                            value={credentials.studentName}
                            onChange={handleInputChange}
                            required
                            placeholder='Write Student Name...'
                        />
                        <label htmlFor="studentPhone">Student Phone</label>
                        <input
                            type="tel"
                            id="studentPhone"
                            name="studentPhone"
                            value={credentials.studentPhone}
                            onChange={handleInputChange}
                            required
                            placeholder='Write Student Phone Number...'
                        />
                        <label htmlFor="studentDob">Student DOB</label>
                        <DatePicker
                            className='datePicker'
                            dateFormat="dd-MM-yyyy"
                            id="studentDob"
                            name="studentDob"
                            selected={dob}
                            onChange={handleDateChange}
                            required
                            placeholderText='Select Student DOB (dd-mm-yyyy)'
                        />
                    </div>
                    <button className='btn btn-success mt-2' type="submit">Add Student</button>
                </form>
            </Student>
            
            <Teacher
                isOpen={openTeacherModal}
                onClose={() => setOpenTeacherModal(false)}
                onCreate={createTeacher}
            >
                <h3>Adding a Teacher</h3>
                <form className='login-form mt-3' onSubmit={handleTeacherFormSubmit}>
                    <div className="input-group flex gap-1">
                        <label htmlFor="studentName">Teacher Name</label>
                        <input
                            type="text"
                            id="teacherName"
                            name="teacherName"
                            value={credentials.teacherName}
                            onChange={handleInputChange}
                            required
                            placeholder='Write Teacher Name...'
                        />
                        <label htmlFor="teacherEmail">Teacher Email</label>
                        <input
                            type="email"
                            id="teacherhone"
                            name="teacherEmail"
                            value={credentials.teacherEmail}
                            onChange={handleInputChange}
                            required
                            placeholder='Write Teacher email...'
                        />
                    </div>
                    <button className='btn btn-success mt-2' type="submit">Add Teacher</button>
                </form>
            </Teacher>
        </>
    );
}