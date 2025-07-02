import React from 'react'
import Navbar from '../components/Navbar'
import Whatsapp from '../components/Whatsapp'
import Footer from '../components/Footer'
import Call from '../components/Call'

export default function Contactus() {
    return (<>
        <Navbar />

        <div className="contact-container main-content">

            <div className="contact-box card">
                <h3 className="contact-title">Reach Out to Us</h3>
                <span className="contact-subtitle">
                    Contact us online and let our team assist you with admissions and more.
                </span>

                <form className="contact-form">
                    <div className="input-row">
                        <div className="form-group">
                            <label>Your Name</label>
                            <input type="text" placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label>Your Phone</label>
                            <input type="tel" placeholder="9876543210" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Your Email</label>
                        <input type="email" placeholder="you@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Your Message</label>
                        <textarea placeholder="How can we help you?" rows="5"></textarea>
                    </div>

                    <div className="button">Send Message</div>
                </form>
            </div>
        </div>

        <Whatsapp />
        <Call />

        <Footer />
    </>)
}
