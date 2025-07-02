import React from 'react'
import Navbar from '../components/Navbar'
import Whatsapp from '../components/Whatsapp'
import Footer from '../components/Footer'
import Call from '../components/Call'

export default function Contactus() {
    return (<>
        <Navbar />

        <div className="contact-container">
            <h1>Reach Out to Us</h1>
            <span>Whether you visit us in person or contact us online, our team is ready to assist you with admissions and more.</span>

            <div className="contact-box card">
                <h3 className="contact-title">Need Help?</h3>
                <span className="contact-subtitle">
                    We'd love to hear from you! Fill in the form below.
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
