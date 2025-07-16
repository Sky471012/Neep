import React from 'react'
import MovingBanner from '../components/MovingBanner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Whatsapp from '../components/Whatsapp'
import Call from '../components/Call'
import Popup from '../components/Popup'
import Instagram from '../components/Instagram'

export default function Home() {
  return (<>
    <Navbar />
    <Popup />
    <MovingBanner />
    <Call />
    <Whatsapp />
    <Instagram />
    <Footer />
  </>)
}
