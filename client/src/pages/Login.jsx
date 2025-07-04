import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Whatsapp from '../components/Whatsapp'
import Call from '../components/Call'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Login() {

    const [dob, setdob] = useState();
    const [credentials, setCredentials] = useState({ phone: "", dob: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedDob =
            ("0" + dob.getDate()).slice(-2) +
            "-" +
            ("0" + (dob.getMonth() + 1)).slice(-2) +
            "-" +
            dob.getFullYear();


        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: credentials.phone, dob: formattedDob })

        });
        const json = await response.json();
        console.log(json);

        if (!json.success) {
            alert("Student not found!");
        } else {
            console.log("Logined");
            localStorage.setItem("student", JSON.stringify(json.student));
            localStorage.setItem("authToken", json.authToken);
            console.log(json.authToken);
            navigate("/student")
        }
    }

    const onChange = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value })
    }

    const handleDateChange = (date) => {
        setdob(date);
        setCredentials(prev => ({
            ...prev,
            dob: date.toISOString() // Make sure backend expects this format
        }));
    };



    return (<>
        <Navbar />

        <div className='login-container main-content'>
            <div className="card login-card">
                <div className="login-box">
                    <h3>New Era Education Point</h3>

                    <form className='login-form' onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input type="tel" id="phone" name="phone" value={credentials.phone} onChange={onChange} required placeholder='Phone number' />
                        </div>
                        <div className="input-group">
                            <DatePicker className='datePicker' selected={dob} dateFormat="dd-MM-yyyy" onChange={handleDateChange} name='dob' required placeholderText='Date of Birth(dd-mm-yyyy)' />
                        </div>
                        <button className='button' type="submit">Login</button>
                    </form>

                    <div className="divider">
                        <hr />
                        <span>OR</span>
                        <hr />
                    </div>

                    <Link to="/loginAdmin" style={{ padding: "10px", border: "1px solid #3498db", borderRadius: "7px", color: "#3498db" }}><span style={{ display: "flex", gap: "5px" }}><i className="bi bi-person-fill-lock"></i>Login as Admin</span></Link>
                </div>
            </div>
        </div>

        <Whatsapp />
        <Call />

        <Footer />
    </>)
}
