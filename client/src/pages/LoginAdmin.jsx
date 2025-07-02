import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Whatsapp from '../components/Whatsapp'
import Call from '../components/Call'

export default function LoginAdmin() {
    return (<>
        <Navbar />

        <div className='login-container main-content'>
            <div className="card login-card">
                <div className="login-box">
                    <h3>New Era Education Point</h3>

                    <form className='login-form'>
                        <div className="input-group">
                            <input type="text" id="username" name="username" required placeholder='Phone number' />
                        </div>
                        <div className="input-group">
                            <input type="password" id="password" name="password" required placeholder='Password' />
                        </div>
                        <div className='button' type="submit">Login</div>
                    </form>

                    <div className="divider">
                        <hr />
                        <span>OR</span>
                        <hr />
                    </div>

                    <Link to="/login" style={{ padding: "10px", border: "1px solid #3498db", borderRadius: "7px", color: "#3498db" }}><span style={{ display: "flex", gap: "5px" }}><i className="bi bi-person-fill"></i>Login as Student</span></Link>
                </div>
            </div>
        </div>

        <Whatsapp />
        <Call />

        <Footer />
    </>)
}
