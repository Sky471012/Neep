import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModalOne from "../modals/ModalOne";
import ModalTwo from "../modals/ModalTwo";
import ModalThree from "../modals/ModalThree";
import Popup from "../modals/Popup";

export default function Admin() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [batchesRecords, setBatchesRecords] = useState([]);
    const [studentsRecords, setStudentsRecords] = useState([]);
    const [teachersRecords, setTeachersRecords] = useState([]);
    const [teacher, setTeacher] = useState({});
    const [openModalOne, setOpenModalOne] = useState(false);
    const [openModalTwo, setOpenModalTwo] = useState(false);
    const [openModalThree, setOpenModalThree] = useState(false);
    const [openPopupModal, setOpenPopupModal] = useState(false);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [dob, setDob] = useState(new Date());
    const [dateOfJoining, setDateOfJoining] = useState(new Date());
    const [credentials, setCredentials] = useState({
        studentName: "",
        studentPhone: "",
        studentAddress: "",
        studentClass: "",
        studentFee: "",
        teacherName: "",
        teacherEmail: ""
    });



    useEffect(() => {
        const storedAdmin = localStorage.getItem("user");
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
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all batches");
                    return res.json();
                })
                .then(setBatchesRecords)
                .catch((err) => console.error("Batches fetch error:", err));

            // Fetch students
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/students`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch all students");
                    return res.json();
                })
                .then(setStudentsRecords)
                .catch((err) => console.error("Students fetch error:", err));

            // Fetch teachers
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`, {
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

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        // finding assigned teacher of batch
        const findTeacher = async (batchId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/findTeacher/${batchId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const teacherGet = await res.json();
                if (!res.ok) throw new Error(teacherGet.message || "Error fetching teacher");

                setTeacher(prev => ({
                    ...prev,
                    [batchId]: teacherGet.teacher[0],
                }));

            } catch (err) {
                console.error("Failed to fetch assigned teacher:", err);
                alert("Error fetching assigned teacher.");
            }
        };

        batchesRecords.forEach((batch) => {
            findTeacher(batch._id);
        });

    }, [batchesRecords]);

    const createBatch = async (batchName) => {
        if (!batchName.trim()) {
            alert("Please enter a batch name.");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/batchCreate`, {
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

            setOpenModalOne(false); // close modal
            setBatchesRecords((prev) => [...prev, data]); // update state
            setCredentials({ batch: "" }); // reset form
        } catch (error) {
            console.error("Error creating batch:", error);
            alert("Something went wrong.");
        }
    };

    const createStudent = async (name, phone, dob, address, className, fee, dateOfJoining) => {
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
                    fee,
                    dateOfJoining
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setOpenModalTwo(false);
            setStudentsRecords((prev) => [...prev, data]);

            // reset
            setCredentials({
                studentName: "",
                studentPhone: "",
                studentAddress: "",
                studentClass: "",
                studentFee: ""
            });
            setDob(new Date());
            setDateOfJoining(new Date());
            navigate(`/student/${data._id}`);
        } catch (err) {
            console.error("Create student error:", err);
            alert("Error creating student.");
        }
    };

    const createTeacher = async (teacherName, teacherEmail) => {

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/teacherCreate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ name: teacherName, email: teacherEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setOpenModalThree(false); // close modal
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('description', description);
        formData.append('image', image);

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/uploadPopup`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (res.status === 200) {
                alert('Popup updated successfully!');
                setOpenPopupModal(false);
            }
        } catch (error) {
            console.error('Popup upload error:', error.response?.data || error.message);
            alert('Failed to upload popup. Unauthorized or server error.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBatchFormSubmit = (e) => {
        e.preventDefault();
        createBatch(credentials.batch);
    };

    const handleStudentFormSubmit = (e) => {
        e.preventDefault();

        const formattedDob = dob ? format(dob, "dd-MM-yyyy") : "";
        const formattedJoining = dateOfJoining ? format(dateOfJoining, "dd-MM-yyyy") : "";

        createStudent(
            credentials.studentName,
            credentials.studentPhone,
            formattedDob,
            credentials.studentAddress,
            credentials.studentClass,
            parseInt(credentials.studentFee),
            formattedJoining
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
                    <button className="button" onClick={() => setOpenModalOne(true)}>Add a Batch</button>
                    <button className="button" onClick={() => setOpenModalTwo(true)}>Add a Student</button>
                    <button className="button" onClick={() => setOpenModalThree(true)}>Add a Teacher</button>
                    <button className="button" onClick={() => setOpenPopupModal(true)}>Update Popup</button>
                </div>

                <div id="batches" className="batches-container">
                    <h1>Batches</h1>
                    <div className="container">
                        <div className="row">
                            {batchesRecords.length > 0 ? (
                                batchesRecords.map((batch, index) => (

                                    <div className="col-12 col-sm-6 col-lg-4" key={index}>
                                        <Link to={`/batch/${batch._id}`} className="text-decoration-none text-dark">
                                            <div className="card batch-card mb-3">
                                                <h5 className="card-title">{batch.name}</h5>
                                                <span>Code: {batch.code}</span>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>No batches found.</p>
                            )}
                        </div>
                    </div>
                </div>


                <div id="students" className="batches-container">
                    <h1>Students</h1>
                    <div className="container">
                        <div className="row">
                            {studentsRecords.length > 0 ? (
                                studentsRecords.map((student, index) => (
                                    <div className="col-12 col-sm-6 col-lg-4" key={index}>
                                        <Link to={`/student/${student._id}`} className="text-decoration-none text-dark">
                                            <div className="card batch-card mb-3">
                                                <h5 className="card-title">{student.name}</h5>
                                                <span>Phone: {student.phone}</span>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>No student found.</p>
                            )}
                        </div>
                    </div>
                </div>


                <div id="teachers" className="batches-container">
                    <h1>Teachers</h1>
                    <div className="container">
                        <div className="row">
                            {teachersRecords.length > 0 ? (
                                teachersRecords.map((teacher, index) => (
                                    <div className="col-12 col-sm-6 col-lg-4" key={index}>
                                        <Link to={`/teacher/${teacher._id}`} className="text-decoration-none text-dark">
                                            <div className="card batch-card mb-3">
                                                <h5 className="card-title">{teacher.name}</h5>
                                                <span>Phone: {teacher.phone}</span>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>No teacher found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />


            <ModalOne
                isOpen={openModalOne}
                onClose={() => setOpenModalOne(false)}
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
            </ModalOne>


            <ModalTwo
                isOpen={openModalTwo}
                onClose={() => setOpenModalTwo(false)}
                onCreate={createStudent}
            >
                <h3>Adding a Student</h3>
                <form className='login-form mt-3' onSubmit={handleStudentFormSubmit}>
                    <div className="mb-2 d-flex gap-3 w-75">
                        <label className="form-label">Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="studentName"
                            value={credentials.studentName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="d-flex gap-3 w-75">
                        <label className="form-label">Phone:</label>
                        <input
                            type="tel"
                            className="form-control"
                            name="studentPhone"
                            value={credentials.studentPhone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="d-flex gap-3 w-75">
                        <label className="form-label">DOB (dd-mm-yyyy):</label>
                        <DatePicker
                            className="form-control"
                            dateFormat="dd-MM-yyyy"
                            selected={dob}
                            onChange={(date) => setDob(date)}
                            placeholderText="Select DOB"
                            required
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="d-flex gap-3 w-75">
                        <label className="form-label">Address:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="studentAddress"
                            value={credentials.studentAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="d-flex gap-3 w-75">
                        <label className="form-label">Class:</label>
                        <select
                            className="form-select"
                            name="studentClass"
                            value={credentials.studentClass}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Class</option>
                            {["Kids", "English Spoken", "9", "10", "11", "12"].map((cls) => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>

                    <div className="d-flex gap-3 w-75">
                        <label className="form-label">Fee:</label>
                        <input
                            type="number"
                            className="form-control"
                            name="studentFee"
                            value={credentials.studentFee}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="d-flex gap-3 w-75">
                        <label className="form-label">Date of Joining (dd-mm-yyyy):</label>
                        <DatePicker
                            className="form-control"
                            dateFormat="dd-MM-yyyy"
                            selected={dateOfJoining}
                            onChange={(date) => setDateOfJoining(date)}
                            placeholderText="Select Joining Date"
                            required
                        />
                    </div>

                    <button className="btn btn-success mt-3" type="submit">Add Student</button>
                </form>
            </ModalTwo>

            <ModalThree
                isOpen={openModalThree}
                onClose={() => setOpenModalThree(false)}
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
            </ModalThree>

            <Popup
                isOpen={openPopupModal}
                onClose={() => setOpenPopupModal(false)}
            >
                <h3>Updating Popup</h3>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        accept="image/*"
                        required
                    />
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
        </>
    );
}