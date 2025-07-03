import React from 'react'
import Navbar from '../components/Navbar'
import Whatsapp from '../components/Whatsapp'
import Footer from '../components/Footer'
import Call from '../components/Call'
import googleplay from "../assets/images/googleplay.png";
import appstore from "../assets/images/appstore.png";
import qr from "../assets/images/qr.png";
import app from "../assets/images/app.png";

export default function DownloadApp() {
  return (<>
    <Navbar />

    <div className="main-content download-app">
      <h1>Download Our App</h1>

      <div className="features">



        <div className="features-box">
          <h3>Features of the App</h3>
          <ul>
            <li>
              <h5><i className="bi bi-check2-circle me-2"></i>Live Chat</h5>
              <p className='ms-4'>Communicate easily with teachers or classmates — either one-on-one or in group chats.</p>
            </li>
            <li>
              <h5><i className="bi bi-check2-circle me-2"></i>Track Student Progress</h5>
              <p className='ms-4'>View performance, attendance, and test reports in a clear and organized way.</p>
            </li>
            <li>
              <h5><i className="bi bi-check2-circle me-2"></i>Smart Attendance</h5>
              <p className='ms-4'>Mark and monitor attendance digitally — say goodbye to paperwork.</p>
            </li>
            <li>
              <h5><i className="bi bi-check2-circle me-2"></i>Manage Fees</h5>
              <p className='ms-4'>Easily track fee payments and send receipts to parents in just a few taps.</p>
            </li>
            <li>
              <h5><i className="bi bi-check2-circle me-2"></i>Online Assignments</h5>
              <p className='ms-4'>Assign, attempt, and evaluate tests digitally — accessible from anywhere.</p>
            </li>
          </ul>
        </div>

        <div className="app-image">
          <img src={app} alt="" />
        </div>

      </div>


      <div className="download-app-container">

        <div className="qr-box">
          <img src={qr} alt="" className="qr" />
        </div>
        <div className="content">
          <h1>Download Our App</h1>
          <p>Get the best learning experience with our mobile app. Download now and start your journey towards success!</p>
          <div className='app-box'>
            <a href="https://play.google.com/store/apps/details?id=co.classplus.neep&hl=en_IN"><img className='googleplay' src={googleplay} alt="" /></a>
          </div>
        </div>
      </div>
    </div>

    <Whatsapp />
    <Call />

    <Footer />
  </>)
}
