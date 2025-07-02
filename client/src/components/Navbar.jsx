import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="logo">MySite</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="#features">Features</a></li>
          <li><Link to="/contactus" href="#contact">Contact Us</Link></li>
          <li><Link to="/login" className='button'>Login</Link></li>
        </ul>
        {/* Fixed: Added onClick handler */}
        <div className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          &times;
        </button>
        <Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
        <a href="#features" onClick={() => setSidebarOpen(false)}>Features</a>
        <Link to="/contactus" onClick={() => setSidebarOpen(false)}>Contact</Link>
        <Link to="/login" className='button'>Login</Link>
      </div>

      {/* Background overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
}