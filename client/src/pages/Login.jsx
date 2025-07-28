import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Whatsapp from '../components/Whatsapp';
import Call from '../components/Call';
import Instagram from '../components/Instagram';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/login.css';

export default function Login() {
  // Generic login management
  const [loginType, setLoginType] = useState('student');
  const navigate = useNavigate();

  // Student state
  const [dob, setDob] = useState();
  const [studentCredentials, setStudentCredentials] = useState({ phone: "", dob: "" });

  // Admin state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Timer for resend cooldown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset login form when switching
  const switchLoginType = (type) => {
    setLoginType(type);
    setShowOtpSection(false);
    setOtp('');
    setEmail('');
    setStudentCredentials({ phone: "", dob: "" });
    setDob(null);
    setCanResend(true);
    setResendTimer(0);
    setIsLoading(false);
  };

  // Student login handler
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!dob) {
      alert("Please select your date of birth");
      return;
    }

    const formattedDob =
      ("0" + dob.getDate()).slice(-2) +
      "-" +
      ("0" + (dob.getMonth() + 1)).slice(-2) +
      "-" +
      dob.getFullYear();

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login/student`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: studentCredentials.phone,
            dob: formattedDob,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to login");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("role", "student");
      localStorage.setItem("authToken", data.authToken);
      localStorage.setItem("user", JSON.stringify(data.student));
      navigate("/student");
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      alert("Something went wrong");
    }
  };

  const onStudentChange = (e) => {
    setStudentCredentials({ ...studentCredentials, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setDob(date);
    setStudentCredentials((prev) => ({
      ...prev,
      dob: date.toISOString(),
    }));
  };

  // Admin login handlers
  const sendOtp = async (isResend = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login/admin-teacher/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (response.status === 404) {
        alert("User not found.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        alert(data.message || "Failed to send OTP.");
        setIsLoading(false);
        return;
      }

      if (isResend) {
        setOtp("");
      }
      setShowOtpSection(true);
      setCanResend(false);
      setResendTimer(30);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      alert("Something went wrong while sending OTP.");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return alert("Please enter your email");
    await sendOtp(false);
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    await sendOtp(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return alert("Please enter the OTP");

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login/admin-teacher/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "OTP verification failed.");
      } else {
        if (data.user.role === "Teacher") {
          localStorage.setItem("role", "teacher");
          navigate("/teacher");
        } else if (data.user.role === "Admin") {
          localStorage.setItem("role", "admin");
          navigate("/admin");
        } else {
          alert("Unknown role. Contact support.");
        }
        localStorage.setItem("authToken", data.authToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      alert("Something went wrong during OTP verification.");
    }
  };

  const handleChangeEmail = () => {
    setShowOtpSection(false);
    setOtp('');
    setCanResend(true);
    setResendTimer(0);
  };

  return (
    <div>
      <Navbar />
      <div
        className="login-page-container"
      >
        <div
          className="login-page-card"
        >
          <div className="login-page-box">
            <h3
              className="login-heading"
            >
              New Era Education Point
            </h3>

            {/* Role Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(220, 220, 220, 0.8)',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '20px',
              }}
            >
              <button
                onClick={() => switchLoginType('student')}
                className={`role-switch-button ${loginType === 'student' ? 'active' : ''
                  }`}
              >
                Student
              </button>
              <button
                onClick={() => switchLoginType('admin')}
                className={`role-switch-button ${loginType === 'admin' ? 'active' : ''
                  }`}
              >
                Admin/Teacher
              </button>
            </div>

            {/* Student Login Form */}
            {loginType === 'student' && (
              <form className="login-page-form" onSubmit={handleStudentSubmit}>
                <div className="input-group">
                  <input
                    type="tel"
                    name="phone"
                    value={studentCredentials.phone}
                    onChange={onStudentChange}
                    required
                    placeholder="Phone number"
                  />
                </div>
                <div className="input-group">
                  <DatePicker
                    selected={dob}
                    onChange={handleDateChange}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Date of birth (dd-mm-yyyy)"
                    className="datePicker"
                    required
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    openToDate={new Date('2005-01-01')}
                    minDate={new Date("1995-01-01")}
                  />
                </div>
                <button
                  type="submit"
                  className="login-page-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {/* Admin Login Form */}
            {loginType === 'admin' && !showOtpSection && (
              <form className="login-page-form" onSubmit={handleSendOtp}>
                <div className="input-group">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="login-page-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* OTP Verification Form */}
            {loginType === 'admin' && showOtpSection && (
              <form className="login-page-form" onSubmit={handleVerifyOtp}>
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                    placeholder="Email"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                  />
                </div>
                <button
                  type="submit"
                  className="login-page-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: canResend ? '#3498db' : '#bdc3c7',
                      cursor: canResend ? 'pointer' : 'not-allowed',
                      textDecoration: 'underline',
                      fontSize: '14px',
                    }}
                  >
                    {resendTimer > 0
                      ? `Resend OTP (${resendTimer}s)`
                      : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px',
                    }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Whatsapp />
      <Call />
      <Instagram />
      <Footer />
    </div>
  );
}
