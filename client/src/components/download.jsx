import React from "react";
import googleplay from "../assets/images/googleplay.webp";
import qr from "../assets/images/qr.webp";
import app from "../assets/images/app.webp";

export default function DownloadApp() {
  return (
    <>
      <style>{`
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
          --bs-primary-rgb: 13, 110, 253;
          --bs-secondary-rgb: 108, 117, 125;
          --bs-success-rgb: 25, 135, 84;
          --bs-info-rgb: 13, 202, 240;
          --bs-warning-rgb: 255, 193, 7;
          --bs-danger-rgb: 220, 53, 69;
          --bs-light-rgb: 248, 249, 250;
          --bs-dark-rgb: 33, 37, 41;
        }
          
        .download-app {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding-top: 70px;
          background-color: #f2f4f8;
        }

        .download-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.8rem;
          font-weight: 700;
          line-height: 1.2;
          background: linear-gradient(135deg, #1e293b 0%, #475569 25%, #3b82f6 50%, #10b981 75%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          text-align: center,
        }

        .download-heading::after {
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

        .download-title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--bs-primary);
          margin-bottom: 1rem;
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 90%;
          justify-content: space-between;
          padding: 0px 20px;
        }

        .features-box {
          display: flex;
          flex-direction: column;
          text-align: left;
          width: 60%;
          gap: 20px;
          padding-left: 0px;
        }

        .features-box h5 {
          color: #3498db;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 50px;
          padding: 10px 25px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          width: 250px;
        }

        .section-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
        }

        .section-badge::before {
          content: '✦';
          margin-right: 8px;
          font-size: 0.875rem;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 30px auto;
          justify-content: space-between;
        }

        .features-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-box li {
          margin-bottom: 13px;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .features-box li::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
        }

        .features-box h5 {
          color: #3b82f6;
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .features-box h5 i {
          margin-right: 12px;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }

        .features-box p {
          text-align: left;
          width: 90%;
          color: #475569;
          line-height: 1;
          font-size: 0.9rem;
          margin-left: 2.5rem;
          transition: all 0.3s ease;
        }

        .app-image {
          width: 35%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .app-image-container {
          position: relative;
          max-width: 350px;
          animation: float 6s ease-in-out infinite;
        }

        .app-image-container::before {
          content: '';
          position: absolute;
          top: -20px;
          left: -20px;
          right: -20px;
          bottom: -20px;
          border-radius: 40px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%);
          z-index: -1;
          animation: pulse 3s ease-in-out infinite;
        }

        .app-image-container::after {
          content: '';
          position: absolute;
          top: -40px;
          left: -40px;
          right: -40px;
          bottom: -40px;
          border-radius: 50px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(139, 92, 246, 0.08) 100%);
          z-index: -2;
          animation: pulse 3s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-10px) rotate(1deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(0deg); 
          }
          75% { 
            transform: translateY(-10px) rotate(-1deg); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.8; 
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.4; 
          }
        }

        .app-image img {
          height: 500px;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 25px 50px rgba(59, 130, 246, 0.3));
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 20px;
        }

        /* Floating elements around the app */
        .floating-element {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatIcon 4s ease-in-out infinite;
        }

        .floating-element:nth-child(1) {
          top: -10%;
          right: 10%;
          animation-delay: -1s;
        }

        .floating-element:nth-child(2) {
          bottom: 20%;
          left: -20%;
          animation-delay: -2s;
        }

        .floating-element:nth-child(3) {
          top: 50%;
          right: -21%;
          animation-delay: -3s;
        }

        .floating-element i {
          font-size: 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes floatIcon {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-15px) rotate(120deg); 
          }
          66% { 
            transform: translateY(10px) rotate(240deg); 
          }
        }

        /* Entrance animations */
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .features-box {
          animation: fadeInLeft 1s ease forwards;
        }

        .app-image {
          animation: fadeInRight 1s ease forwards;
        }

        .app-image {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .app-image img {
          height: 450px;
          max-width: 100%;
          object-fit: contain;
        }

        .outline {
          width: 87%;
          padding: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 7px rgba(0, 0, 0, 0.1);
          margin: 30px auto;
          border-radius: 17px;
          align-items: center;
          background: linear-gradient(225deg, #1e293b 0%, #475569 25%, #3b82f6 50%, #10b981 75%, #8b5cf6 100%);
        }

        .download-app-container {
          display: flex;
          flex-direction: row;
          text-align: center;
          padding: 50px 20px 0;
          background: linear-gradient(to top, #b5dffcff, #ffffff);
          border-radius: 10px;
          align-items: end;
        }

        .content {
          display: flex;
          flex-direction: column;
          width: 50%;
          text-align: right;
          gap: 20px;
          padding: 30px;
          align-self: center;
        }

        .content p {
        font-family: 'Inter', sans-serif;
          text-align: right;
          width: 100%;
        }

        .app-box {
          display: flex;
          flex-direction: row-reverse;
          gap: 20px;
        }

        .googleplay {
          height: 60px;
          transition: transform 0.3s ease-in-out;
          margin: 0;
          max-width: 100%;
          object-fit: contain;
          border-radius: 7px;
          filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.575));
        }

        .googleplay:hover {
          transform: scale(1.05);
        }

        .qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 50%;
        }

        .qr {
          height: 450px;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.575));
        }

        /* Tablet Responsive Styles */
        @media (max-width: 1024px) and (min-width: 769px) {
          .download-app {
            padding: 60px 25px 25px;
          }

          .features {
            gap: 50px;
            padding: 25px 20px;
            max-width: 100%;
          }

          .features-box {
            flex: 1;
            gap: 5px;
          }

          .app-image {
            width: 300px;
          }

          .app-image img {
            height: clamp(350px, 45vw, 400px);
          }

          .floating-element {
            width: 50px;
            height: 50px;
          }

          .floating-element i {
            font-size: 1.3rem;
          }

          .download-app-container {
            padding: 40px 25px 0;
            width: 100%;
            gap: 35px;
          }

          .content {
            padding: 25px 20px;
          }

          .qr-box {
            width: 280px;
          }

          .qr {
            height: clamp(280px, 35vw, 320px);
          }

          .outline {
            width: 95%;
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .download-app {
            padding: 50px 15px 15px;
            gap: 30px;
          }

          .features {
            flex-direction: column;
            gap: 40px;
            padding: 20px 15px;
            width: 100%;
          }

          .features-box {
            width: 100%;
            order: 2;
          }

          .app-image {
            width: 100%;
            order: 1;
            margin-bottom: 20px;
          }

          .floating-element {
            display: none;
          }

          .download-app-container {
            flex-direction: column;
            padding: 0px;
            gap: 0;
            background: none;
          }

          .content {
            text-align: center;
            width: 100%;
            background: #e7f5ffff;
            padding: 30px 20px;
          }

          .content p {
            text-align: center;
          }

          .app-box {
            justify-content: center;
          }

          .qr-box {
            width: 100%;
            padding: 20px 10px 0;
            background: linear-gradient(to top, #b5dffcff, #ffffff);
          }

          .qr {
            height: 380px;
            filter: drop-shadow(0 8px 10px rgba(129, 117, 117, 0));
          }

          .outline {
            width: 98%;
            margin: 20px auto;
          }

          .features-box li {
            padding: 0.8rem;
          }

          .features-box h5 i {
            margin-right: 8px;
          }

          .features-box p {
            margin-left: calc(clamp(1rem, 3vw, 1.2rem) + 8px);
          }
        }

        /* Small Tablet / Large Mobile Styles */
        @media (max-width: 768px) and (min-width: 601px) {
          .download-app {
            padding: 55px 20px 20px;
            gap: 35px;
          }

          .features {
            flex-direction: row;
            gap: 45px;
            padding: 25px 20px;
            width: 100%;
          }

          .features-box {
            width: 55%;
            gap: 22px;
          }

          .app-image {
            width: 45%;
            max-width: 280px;
          }

          .app-image img {
            height: 380px;
          }

          .floating-element {
            width: 45px;
            height: 45px;
          }

          .floating-element i {
            font-size: 1.2rem;
          }

          .section-badge {
            width: auto;
            max-width: 220px;
            padding: 8px 20px;
            font-size: 0.85rem;
          }

          .features-box li {
            padding: 0.7rem 0.9rem;
            margin-bottom: 12px;
          }

          .features-box h5 {
            font-size: 1rem;
          }

          .features-box h5 i {
            font-size: 1.3rem;
            margin-right: 10px;
          }

          .features-box p {
            font-size: 0.85rem;
            margin-left: 2.3rem;
          }

          .download-app-container {
            flex-direction: column;
            padding: 0px;
            gap: 0;
            background: none;
          }

          .content {
            text-align: center;
            width: 100%;
            background: #e7f5ffff;
            padding: 25px 20px;
          }

          .content p {
            text-align: center;
            font-size: 0.95rem;
          }

          .download-title {
            font-size: clamp(2.2rem, 4.5vw, 2.5rem);
          }

          .app-box {
            justify-content: center;
          }

          .googleplay {
            height: 55px;
          }

          .qr-box {
            width: 100%;
            padding: 20px 15px 0;
            background: linear-gradient(to top, #b5dffcff, #ffffff);
          }

          .qr {
            height: 320px;
            filter: drop-shadow(0 8px 10px rgba(129, 117, 117, 0));
          }

          .outline {
            width: 96%;
            margin: 25px auto;
          }
        }

        /* Mobile Portrait Styles */
        @media (max-width: 600px) {
          .download-app {
            padding: 50px 15px 15px;
            gap: 30px;
          }

          .features {
            flex-direction: column;
            gap: 40px;
            padding: 20px 15px;
            width: 100%;
          }

          .features-box {
            width: 100%;
            order: 2;
          }

          .app-image {
            width: 100%;
            order: 1;
            margin-bottom: 20px;
          }

          .floating-element {
            display: none;
          }

          .download-app-container {
            flex-direction: column;
            padding: 0px;
            gap: 0;
            background: none;
          }

          .content {
            text-align: center;
            width: 100%;
            background: #e7f5ffff;
            padding: 30px 20px;
          }

          .content p {
            text-align: center;
          }

          .app-box {
            justify-content: center;
          }

          .qr-box {
            width: 100%;
            padding: 20px 10px 0;
            background: linear-gradient(to top, #b5dffcff, #ffffff);
          }

          .qr {
            height: 380px;
            filter: drop-shadow(0 8px 10px rgba(129, 117, 117, 0));
          }

          .outline {
            width: 98%;
            margin: 20px auto;
          }

          .features-box li {
            padding: 0.8rem;
          }

          .features-box h5 i {
            margin-right: 8px;
          }

          .features-box p {
            margin-left: calc(clamp(1rem, 3vw, 1.2rem) + 8px);
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .download-app {
            padding: 40px 10px 10px;
          }

          .features {
            padding: 15px 10px;
            gap: 30px;
          }

          .features-box {
            gap: 20px;
          }

          .features-box li {
            padding: 0.7rem;
            margin-bottom: 12px;
          }

          .section-badge {
            padding: 8px 20px;
            font-size: 0.8rem;
          }

          .download-app-container {
            padding: 0px;
          }

          .content {
            padding: 25px 15px;
            gap: 15px;
          }

          .app-box {
            gap: 15px;
          }
          
          .content {
            border-bottom-right-radius: 13px;
            border-bottom-left-radius: 13px;
          }

          .qr-box {
            border-top-right-radius: 13px;
            border-top-left-radius: 13px;
          }

          .qr {
            height: 320px;
          }

          .googleplay {
            height: 50px;
          }

          .outline {
            width: 100%;
            margin: 15px auto;
            padding: 6px;

          }
        }
        /* Large screen adjustments */
        @media (min-width: 1400px) {
          .features {
            max-width: 1600px;
            gap: 80px;
          }

          .app-image {
            width: 400px;
          }

`}</style>

      <div id="download" className="download-app">
        <h2 className="download-heading">Our App</h2>

        <div className="features">
          <div className="features-box">
            <h3 className="section-badge">Features of the App</h3>
            <ul>
              <li>
                <h5>
                  <i className="bi bi-chat-dots"></i> Live Chat
                </h5>
                <p>
                  Communicate easily with teachers or classmates — either
                  one-on-one or in group chats.
                </p>
              </li>
              <li>
                <h5>
                  <i className="bi bi-graph-up"></i> Track Student Progress
                </h5>
                <p>
                  View performance, attendance, and test reports in a clear and
                  organized way.
                </p>
              </li>
              <li>
                <h5>
                  <i className="bi bi-check2-circle"></i> Smart Attendance
                </h5>
                <p>
                  Mark and monitor attendance digitally — say goodbye to
                  paperwork.
                </p>
              </li>
              <li>
                <h5>
                  <i className="bi bi-credit-card"></i> Manage Fees
                </h5>
                <p>
                  Easily track fee payments and send receipts to parents in just
                  a few taps.
                </p>
              </li>
              <li>
                <h5>
                  <i className="bi bi-file-earmark-text"></i> Online Assignments
                </h5>
                <p>
                  Assign, attempt, and evaluate tests digitally — accessible
                  from anywhere.
                </p>
              </li>
            </ul>
          </div>

          <div className="app-image">
            <div className="app-image-container">
              <div className="floating-element">
                <i className="bi bi-star"></i>
              </div>
              <div className="floating-element">
                <i className="bi bi-heart"></i>
              </div>
              <div className="floating-element">
                <i className="bi bi-lightning"></i>
              </div>
              <img src={app} alt="Mobile App Interface" />
            </div>
          </div>
        </div>

        <div className="outline">
          <div className="download-app-container">
            <div className="qr-box">
              <img src={qr} alt="QR" className="qr" />
            </div>
            <div className="content">
              <h2 className="download-title">Download Our App</h2>
              <p>
                Get the best learning experience with our mobile app. Download
                now and start your journey towards success!
              </p>
              <div className="app-box">
                <a href="https://play.google.com/store/apps/details?id=co.classplus.neep">
                  <img
                    className="googleplay"
                    src={googleplay}
                    alt="Get it on Google Play"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
