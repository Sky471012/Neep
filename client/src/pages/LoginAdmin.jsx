import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Whatsapp from '../components/Whatsapp';
import Call from '../components/Call';

export default function LoginAdmin() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpSection, setShowOtpSection] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const navigate = useNavigate();

    // Timer for resend cooldown
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => {
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

    const sendOtp = async (isResend = false) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login/admin-teacher/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const json = await response.json();
            setIsLoading(false);

            if (response.status === 404) {
                alert("User not found.");
                return;
            }

            if (!response.ok) {
                alert(json.message || "Failed to send OTP.");
                return;
            }


            if (isResend) {
                setOtp(''); // Clear previous OTP
                setCanResend(false);
                setResendTimer(30); // 30 seconds cooldown
            } else {
                setShowOtpSection(true);
                setCanResend(false);
                setResendTimer(30); // 30 seconds cooldown
            }
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            alert("Something went wrong while sending OTP.");
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) return alert("Enter a valid email");
        await sendOtp(false);
    };

    const handleResendOtp = async () => {
        if (!canResend || isLoading) return;
        await sendOtp(true);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) return alert("Enter the OTP");

        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login/admin-teacher/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const json = await response.json();
            setIsLoading(false);

            if (!response.ok) {
                alert(json.message || "OTP verification failed.");
            } else {
                console.log("Logined");

                if (json.user.role === "teacher") {
                    localStorage.setItem("role", "teacher");
                    localStorage.setItem("user", JSON.stringify(json.user));
                    navigate("/teacher"); // ✅ navigate to teacher dashboard
                } else if (json.user.role === "admin") {
                    localStorage.setItem("role", "admin");
                    localStorage.setItem("user", JSON.stringify(json.user));
                    navigate("/admin"); // ✅ optionally change route to /admin
                } else {
                    // 🚨 Safety fallback for unknown role
                    alert("Unknown role. Login aborted.");
                    return;
                }

                localStorage.setItem("authToken", json.authToken);
                console.log(json.authToken);
            }

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
        <>
            <Navbar />

            <div className='login-container main-content'>
                <div className="card login-card">
                    <div className="login-box">
                        <h3>New Era Education Point</h3>

                        {!showOtpSection ? (
                            <form className='login-form' onSubmit={handleSendOtp}>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        required
                                        placeholder='Enter your email address'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button className='button' type="submit" disabled={isLoading}>
                                    {isLoading ? "Sending..." : "Send OTP"}
                                </button>
                            </form>
                        ) : (
                            <form className='login-form' onSubmit={handleVerifyOtp}>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        required
                                        placeholder='Enter 6-digit OTP'
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                    />
                                </div>
                                <button className='button' type="submit" disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Verify OTP & Login"}
                                </button>

                                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={!canResend || isLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: canResend ? '#3498db' : '#6c757d',
                                            cursor: canResend ? 'pointer' : 'not-allowed',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                                    </button>
                                    <span style={{ margin: '0 10px', color: '#6c757d' }}>|</span>
                                    <button
                                        type="button"
                                        onClick={handleChangeEmail}
                                        disabled={isLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#3498db',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="divider">
                            <hr />
                            <span>OR</span>
                            <hr />
                        </div>

                        <Link to="/login" style={{ padding: "10px", border: "1px solid #3498db", borderRadius: "7px", color: "#3498db" }}>
                            <span style={{ display: "flex", gap: "5px" }}>
                                <i className="bi bi-person-fill"></i>
                                Login as Student
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            <Whatsapp />
            <Call />
            <Footer />
        </>
    );
}