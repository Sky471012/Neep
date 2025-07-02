import React from 'react'
import MovingBanner from '../components/MovingBanner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Whatsapp from '../components/Whatsapp'
import Call from '../components/Call'

export default function Home() {
  return (<>
    <Navbar />
    <MovingBanner />
    <Call />
    <Whatsapp />
    <Footer />
  </>)
}
