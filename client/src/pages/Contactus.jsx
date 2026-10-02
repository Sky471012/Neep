import React, {useState} from "react";
import Navbar from "../components/Navbar";
import Whatsapp from "../components/Whatsapp";
import Footer from "../components/Footer";
import Call from "../components/Call";
import Instagram from "../components/Instagram";
import axios from "axios";
import { apiUrl } from "../api";
import { toast } from 'react-toastify';

export default function Contactus() {

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(apiUrl("/api/contactus"), formData);
      toast.success("Message sent successfully!");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap");

        :root {
          --bs-blue: #0d6efd;
          --bs-indigo: #6610f2;
          --bs-purple: #6f42c1;
          --bs-pink: #d63384;
          --bs-red: #dc3545;
          --bs-orange: #fd7e14;
          --bs-yellow: #ffc107;
          --bs-green: #198754;
          --bs-teal: #20c997;
          --bs-cyan: #0dcaf0;
          --bs-black: #000;
          --bs-white: #fff;
          --bs-gray: #6c757d;
          --bs-gray-dark: #343a40;
          --bs-gray-100: #f8f9fa;
          --bs-gray-200: #e9ecef;
          --bs-gray-300: #dee2e6;
          --bs-gray-400: #ced4da;
          --bs-gray-500: #adb5bd;
          --bs-gray-600: #6c757d;
          --bs-gray-700: #495057;
          --bs-gray-800: #343a40;
          --bs-gray-900: #212529;
          --bs-primary: #0d6efd;
          --bs-secondary: #6c757d;
          --bs-success: #198754;
          --bs-info: #0dcaf0;
          --bs-warning: #ffc107;
          --bs-danger: #dc3545;
          --bs-light: #f8f9fa;
          --bs-dark: #212529;
          --bs-border-radius: 0.375rem;
          --bs-border-radius-lg: 0.5rem;
          --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .contact-container {
        padding: 50px 0 0 !important; 
          display: flex;
          flex-direction: column;
          flex: 1;
          align-items: center;
          padding: 20px 0px;
          text-align: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          background: linear-gradient(
            135deg,
            #fafbfc 0%,
            #f8fafc 25%,
            #ffffff 50%,
            #f1f5f9 75%,
            #e2e8f0 100%
          );
        }

        .contact-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 800px;
          width: 100%;
          padding: 20px 50px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
          margin-bottom: 50px;
        }

        .contact-box::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            135deg,
            #3b82f6 0%,
            #10b981 50%,
            #8b5cf6 100%
          );
        }

        .contact-box::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            135deg,
            #8b5cf6 0%,
            #10b981 50%,
            #3b82f6 100%
          );
        }

        .contact-title {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
          background: linear-gradient(
            135deg,
            #1e293b 0%,
            #475569 25%,
            #3b82f6 50%,
            #10b981 75%,
            #8b5cf6 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .contact-title::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          border-radius: 2px;
        }

        .contact-subtitle {
          font-size: 1.2rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          align-items: center;
        }

        .input-row {
          display: flex;
          flex-direction: row;
          width: 100%;
          justify-content: space-between;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 0px;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          letter-spacing: 0.5px;
          font-size: 1rem;
          padding-left: 10px;
          margin: 0;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 15px;
          border: 2px solid rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          font-size: 1rem;
          font-family: "Inter", sans-serif;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          color: #1e293b;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #94a3b8;
          font-style: italic;
        }

        .form-group textarea {
          min-height: 120px;
          max-height: 120px;
          resize: vertical;
          font-family: "Inter", sans-serif;
          line-height: 1.6;
        }

        .button {
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          color: white;
          padding: 16px 40px;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          min-width: 200px;
          margin-top: 10px;
        }

        .button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #059669 100%);
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }

        .button:active {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .contact-box {
            padding: 30px 25px;
            gap: 25px;
          }

          .contact-title {
            font-size: 2.2rem;
          }

          .contact-subtitle {
            font-size: 1.1rem;
          }

          .input-row {
            flex-direction: column;
            gap: 25px;
          }

          .form-group input,
          .form-group textarea {
            padding: 14px 18px;
          }

          .button {
            padding: 14px 35px;
            font-size: 1rem;
            min-width: 180px;
          }
        }

        @media (max-width: 480px) {
          .contact-box {
            padding: 25px 20px;
          }

          .contact-title {
            font-size: 1.8rem;
          }

          .contact-subtitle {
            font-size: 1rem;
          }

          .form-group label {
            font-size: 0.8rem;
          }

          .form-group input,
          .form-group textarea {
            padding: 12px 16px;
            font-size: 0.95rem;
          }

          .button {
            padding: 12px 30px;
            font-size: 0.95rem;
            min-width: 160px;
          }
        }

        /* Animation for form elements */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-box {
          animation: fadeInUp 0.8s ease forwards;
        }

        .form-group {
          animation: fadeInUp 0.6s ease forwards;
        }

        .form-group:nth-child(1) {
          animation-delay: 0.1s;
        }
        .form-group:nth-child(2) {
          animation-delay: 0.2s;
        }
        .form-group:nth-child(3) {
          animation-delay: 0.3s;
        }
        .form-group:nth-child(4) {
          animation-delay: 0.4s;
        }

        .button {
          animation: fadeInUp 0.6s ease forwards;
          animation-delay: 0.5s;
        }
      `}</style>

      <Navbar />

      <div className="contact-container">
        <div className="contact-box">
          <h3 className="contact-title">Reach Out to Us</h3>
          <span className="contact-subtitle">
            Contact us online and let our team assist you with admissions and
            more.
          </span>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="form-group">
                <div className="form-label">Your Name</div>
                <input type="text" placeholder="Aakash Sharma" name="name" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <div className="form-label">Your Phone</div>
                <input type="tel" placeholder="8929676776" name="phone" required value={formData.phone} onChange={handleChange}/>
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">Your Email</div>
              <input type="email" placeholder="sharma.aakash1012@gmail.com" name="email" value={formData.email} onChange={handleChange}/>
            </div>

            <div className="form-group">
              <div className="form-label">Your Message</div>
              <textarea placeholder="How can we help you?" rows="5" name="message" required value={formData.message} onChange={handleChange}></textarea>
            </div>

            <button type="submit" className="button">Send Message</button>
          </form>
        </div>
      </div>

      <Whatsapp />
      <Call />
      <Instagram />
      <Footer />
    </>
  );
}
