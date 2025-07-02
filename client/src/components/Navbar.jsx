import React, { useState, useEffect } from 'react';

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
          <li><a href="#home">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#contact">Contact Us</a></li>
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
        <a href="#home" onClick={() => setSidebarOpen(false)}>Home</a>
        <a href="#features" onClick={() => setSidebarOpen(false)}>Features</a>
        <a href="#contact" onClick={() => setSidebarOpen(false)}>Contact</a>
      </div>

      {/* Background overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
}