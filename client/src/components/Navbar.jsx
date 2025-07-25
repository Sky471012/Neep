import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const authToken = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isRouteActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="logo">MySite</div>
        <ul className="nav-links">
          <li><Link to="/" className={isRouteActive("/") ? "active" : ""}>Home</Link></li>
          {/* <li><Link to="/courses-title" className={isRouteActive("/courses") ? "active" : ""}>Courses</Link></li> */}
          <li><a href="#courses" className="nav-link">Courses</a></li>
          <li><Link to="/downloadapp" className={isRouteActive("/downloadapp") ? "active" : ""}>Download App</Link></li>
          <li><Link to="/contactus" className={isRouteActive("/contactus") ? "active" : ""}>Contact Us</Link></li>

          {authToken && role === "student" && (
            <>
              <li><Link to="/student" className={isRouteActive("/student") ? "active" : ""}>Student</Link></li>
              <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
            </>
          )}

          {authToken && role === "teacher" && (
            <>
              <li><Link to="/teacher" className={isRouteActive("/teacher") ? "active" : ""}>Teacher</Link></li>
              <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
            </>
          )}

          {authToken && role === "admin" && (
            <>
              <li><Link to="/teacher" className={isRouteActive("/teacher") ? "active" : ""}>Teacher</Link></li>
              <li><Link to="/admin" className={isRouteActive("/admin") ? "active" : ""}>Admin</Link></li>
              <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
            </>
          )}

          {!authToken && (
            <li><Link to="/login" className={isRouteActive("/login") ? "active" : ""}>Login</Link></li>
          )}
        </ul>

        <div className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          &times;
        </button>

        <Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
        <Link to="/courses" onClick={() => setSidebarOpen(false)}>Courses</Link>
        <Link to="/downloadapp" onClick={() => setSidebarOpen(false)}>Download App</Link>
        <Link to="/contactus" onClick={() => setSidebarOpen(false)}>Contact Us</Link>

        {authToken && role === "student" && (
          <>
            <Link to="/student" onClick={() => setSidebarOpen(false)}>Student</Link>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </>
        )}

        {authToken && role === "teacher" && (
          <>
            <Link to="/teacher" onClick={() => setSidebarOpen(false)}>Teacher</Link>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </>
        )}

        {authToken && role === "admin" && (
          <>
            <Link to="/teacher" onClick={() => setSidebarOpen(false)}>Teacher</Link>
            <Link to="/admin" onClick={() => setSidebarOpen(false)}>Admin</Link>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </>
        )}

        {!authToken && (
          <Link to="/login" onClick={() => setSidebarOpen(false)}>Login</Link>
        )}
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Styles */}
      <style jsx>{`
        /* Global reset to remove default margins and padding */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
        }

        :root {
          --primary: #0d6efd;
          --primary-light: #e6f0ff;
          --success: #198754;
          --bg-cream: #f7f8fc;
          --bg-hover: #eef0f5;
          --gray-800: #343a40;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
          --radius-sm: 8px;
          --radius-md: 16px;
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --transition: all 0.2s ease;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 2rem;
          background: var(--bg-cream);
          box-shadow: ${scrolled ? "0 2px 12px rgba(0, 0, 0, 0.08)" : "none"};
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: var(--transition);
          margin: 0; /* Remove any margin */
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.5px;
          margin-right: var(--space-lg);
        }

        .nav-links {
          display: flex;
          gap: var(--space-sm);
          list-style: none;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        .nav-links li a {
          text-decoration: none;
          color: var(--gray-800);
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          display: inline-block;
        }

        .nav-links li a:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .nav-links li a.active {
          background: none;
          color: var(--primary);
          box-shadow: none;
          position: relative;
          font-weight: 600;
        }

        .nav-links li a.active:after {
          content: "";
          display: block;
          position: absolute;
          bottom: 0;
          left: 1rem;
          right: 1rem;
          height: 2px;
          background: var(--primary);
          border-radius: 1px;
        }

        .nav-links li a:active {
          background: none;
          transform: none;
        }

        .hamburger {
          display: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: var(--gray-800);
          background: none;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
        }

        .hamburger:hover {
          background: var(--bg-hover);
          outline: none;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          right: -100%;
          width: 280px;
          height: 100vh;
          background: var(--bg-cream);
          box-shadow: var(--shadow-md);
          transition: right 0.3s ease;
          padding: 2rem 1.5rem 1.5rem;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .sidebar.open {
          right: 0;
        }

        .sidebar a {
          text-decoration: none;
          color: var(--gray-800);
          font-weight: 500;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          border: 1px solid transparent;
          background: var(--bg-cream);
          display: block;
        }

        .sidebar a:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .sidebar a:active, .sidebar a.active {
          background: none;
          color: var(--primary);
          font-weight: 600;
          box-shadow: none;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          background: none;
          border: none;
          color: var(--gray-800);
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .close-btn:hover {
          color: var(--primary);
          background: transparent;
          transform: scale(1.1);
          outline: none;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1500;
          display: none;
        }

        .overlay.active {
          display: block;
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .hamburger {
            display: block;
          }
          .sidebar {
            width: 80%;
            padding-top: 3rem;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 0.75rem 1rem;
          }
          .logo {
            font-size: 1.25rem;
          }
          .sidebar {
            width: 85%;
          }
        }
      `}</style>
    </>
  );
}