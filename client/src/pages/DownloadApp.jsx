import React from 'react'
import Navbar from '../components/Navbar'
import Whatsapp from '../components/Whatsapp'
import Footer from '../components/Footer'
import Call from '../components/Call'
import googleplay from "../assets/images/googleplay.png";
import app1 from "../assets/images/app1.png";
import app2 from "../assets/images/app2.png";
import app3 from "../assets/images/app3.png";
import app4 from "../assets/images/app4.png";
import app5 from "../assets/images/app5.png";

export default function DownloadApp() {
  return (<>
    <Navbar />
    
    <div className="main-content download-app">
      <div className="image-container">
        <img src={app1} alt="Download App" />
        <img src={app2} alt="Download App" />
        <img src={app3} alt="Download App" />
        <img src={app4} alt="Download App" />
        <img src={app5} alt="Download App" />
      </div>
      <a href="https://play.google.com/store/apps/details?id=co.classplus.neep&hl=en_IN"><img className='googleplay' src={googleplay} alt="" /></a>
    </div>

    <Whatsapp />
    <Call />

    <Footer />
  </>)
}
