import React from 'react'
import BannerSection from '../components/MovingBanner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OurCourses from '../components/ourcourses'
import MessageFromFounder from '../components/messagefoun.jsx'
import ToppersList from '../components/topperslist'
import Popup from '../components/Popup'
import Call from '../components/Call'
import Whatsapp from '../components/Whatsapp'
import Instagram from '../components/Instagram'
import DownloadApp from '../components/download.jsx'
import StudentsReviews from '../components/studentsreview.jsx'
import Regarding from '../components/Regarding.jsx'

export default function Home() {
  return (<>
    <Navbar />
    <Popup />
    <BannerSection />
    <OurCourses />
    <MessageFromFounder />
    <ToppersList/>
    <StudentsReviews />
    <Regarding />
    <DownloadApp />
    <Call />
    <Whatsapp />
    <Instagram />
    <Footer />
  </>)
}
