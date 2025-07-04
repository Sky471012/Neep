import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Handle hash-based active links for sections
      if (location.pathname === "/") {
        const sections = ["features", "about", "services"]; // Add your section IDs here
        const scrollPosition = window.scrollY + 100; // Offset for navbar height

        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
              scrollPosition >= offsetTop &&
              scrollPosition < offsetTop + offsetHeight
            ) {
              setActiveHash(`#${sectionId}`);
              break;
            }
          }
        }

        // Clear hash if at top of page
        if (window.scrollY < 100) {
          setActiveHash("");
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", handleEscape);

    // Set initial hash if present
    if (location.hash) {
      setActiveHash(location.hash);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [location]);

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname === path;
  };

  // Function to check if a hash link is active
  const isHashActive = (hash) => {
    return location.pathname === "/" && activeHash === hash;
  };

  // Handle hash navigation
  const handleHashClick = (hash, e) => {
    e.preventDefault();

    // If not on home page, navigate to home first
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    setActiveHash(hash);
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="logo">MySite</div>
        <ul className="nav-links">
          <li>
            <Link
              to="/"
              className={isRouteActive("/") && !activeHash ? "active" : ""}
              onClick={() => setActiveHash("")}
            >
              Home
            </Link>
          </li>
          <li>
            <a
              href="#features"
              className={isHashActive("#features") ? "active" : ""}
              onClick={(e) => handleHashClick("#features", e)}
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#about"
              className={isHashActive("#about") ? "active" : ""}
              onClick={(e) => handleHashClick("#about", e)}
            >
              About
            </a>
          </li>
          <li>
            <Link
              to="/downloadapp"
              className={isRouteActive("/downloadapp") ? "active" : ""}
            >
              Download App
            </Link>
          </li>
          <li>
            <Link
              to="/contactus"
              className={isRouteActive("/contactus") ? "active" : ""}
            >
              Contact Us
            </Link>
          </li>

          {(localStorage.getItem("authToken")) &&
            <li >
              <Link
                to="/student"
                className={`button ${isRouteActive("/student") ? "active" : ""}`}
              >
                User
              </Link>
            </li>
          }

          <li>
            {(!localStorage.getItem("authToken")) ?
              <Link
                to="/login"
                className={`button ${isRouteActive("/login") ? "active" : ""}`}
              >
                Login
              </Link>
              :
              <Link
                to="/"
                onClick={handleLogout}
                className={`button ${isRouteActive("/login") ? "active" : ""}`}
              >
                Logout
              </Link>
            }
          </li>
        </ul>

        <div className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </div>
      </nav >




      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`
      }>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          &times;
        </button>

        <Link
          to="/"
          className={isRouteActive("/") && !activeHash ? "active" : ""}
          onClick={() => {
            setActiveHash("");
            setSidebarOpen(false);
          }}
        >
          <i className="bi bi-house-door-fill"></i>Home
        </Link>

        <a
          href="#features"
          className={isHashActive("#features") ? "active" : ""}
          onClick={(e) => handleHashClick("#features", e)}
        >
          Features
        </a>

        <a
          href="#about"
          className={isHashActive("#about") ? "active" : ""}
          onClick={(e) => handleHashClick("#about", e)}
        >
          About
        </a>

        <Link
          to="/downloadapp"
          className={isRouteActive("/downloadapp") ? "active" : ""}
          onClick={() => setSidebarOpen(false)}
        >
          <i className="bi bi-google-play"></i>Download App
        </Link>

        <Link
          to="/contactus"
          className={isRouteActive("/contactus") ? "active" : ""}
          onClick={() => setSidebarOpen(false)}
        >
          <i className="bi bi-envelope-fill"></i>Contact Us
        </Link>

        {(localStorage.getItem("authToken")) &&
              <Link
                to="/student"
                onClick={() => setSidebarOpen(false)}
                className={`button ${isRouteActive("/student") ? "active" : ""}`}
              >
                User
              </Link>
          }

        {
          (!localStorage.getItem("authToken")) ?
            <Link
              to="/login"
              className={`button ${isRouteActive("/login") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-box-arrow-in-right"></i>Login
            </Link>
            :
            <Link
              to="/"
              onClick={handleLogout}
              className={`button ${isRouteActive("/login") ? "active" : ""}`}
            >
              <i className="bi bi-box-arrow-left me-1"></i>Logout
            </Link>
        }


      </div >

      {/* Background overlay */}
      {
        sidebarOpen && (
          <div
            className={`overlay ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />
        )
      }
    </>
  );
}
