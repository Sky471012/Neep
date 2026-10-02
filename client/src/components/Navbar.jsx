import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation, matchPath } from "react-router-dom";
import logo from "/logo_rectangle-1.png";
import BranchSelectModal from "../modals/BranchSelectModal";
import { apiFetch, clearStoredSession } from "../api";

// Routes that stay reachable when the session dies; anything else is left
// from the authExpired listener below.
const PUBLIC_PATHS = ["/", "/login", "/all-courses", "/contactus"];

// Paint the role-gated links (Control Room, Student, ...) at mount instead of
// waiting for /api/auth/me; every login writes localStorage.role before
// navigate(), and the check below still corrects this state (401 clears it).
const seedSession = () => {
  const role = localStorage.getItem("role");
  return role ? { success: true, user: { role } } : null;
};

export default function Navbar() {
  const [session, setSession] = useState(seedSession);
  const role = session?.user?.role?.toLowerCase();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [hasMultipleBranches, setHasMultipleBranches] = useState(false);
  // Bumped on logout and on every new check so a reply arriving after either
  // event can no longer resurrect a dead session.
  const epochRef = useRef(0);

  const checkSession = useCallback(() => {
    // Signed out locally → nothing to validate.
    if (!localStorage.getItem("role")) return;
    const epoch = ++epochRef.current;
    apiFetch("/api/auth/me")
      .then((response) => {
        if (response.status === 401) return { unauthorized: true };
        if (!response.ok) return { transient: true, status: response.status };
        return response.json();
      })
      .then((result) => {
        if (epoch !== epochRef.current) return;
        // A failed request (offline, cold server) is not a logout.
        if (result?.transient) return;
        // Only a real 401 means the session is gone.
        if (result?.unauthorized) {
          clearStoredSession();
          setSession(null);
          return;
        }
        // A success that raced with a logout (role already cleared) is stale.
        setSession(result?.success && localStorage.getItem("role") ? result : null);
      })
      .catch(() => {
        // Network or cold-server errors are not logouts: keep the session
        // state we already have instead of clearing it.
      });
  }, []);

  useEffect(() => {
    checkSession();
  }, [location.pathname, checkSession]);

  // Expired token anywhere: api.js clears storage and fires authExpired, so
  // drop the UI session and leave protected pages. Also revalidate when the
  // tab comes back so an idle expiry is caught without waiting for a click.
  useEffect(() => {
    const onAuthExpired = () => {
      epochRef.current += 1;
      setSession(null);
      if (!PUBLIC_PATHS.includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("authExpired", onAuthExpired);

    let lastCheckedAt = Date.now();
    const revalidate = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheckedAt < 60 * 1000) return;
      lastCheckedAt = Date.now();
      checkSession();
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("focus", revalidate);

    return () => {
      window.removeEventListener("authExpired", onAuthExpired);
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("focus", revalidate);
    };
  }, [checkSession, location.pathname, navigate]);

  // 🔹 Recheck branches whenever the route changes
  useEffect(() => {
    const storedBranches = JSON.parse(localStorage.getItem("branches") || "[]");
    setHasMultipleBranches(Array.isArray(storedBranches) && storedBranches.length > 1);
  }, [location.pathname]);

  useEffect(() => {
    const updateBranches = () => {
      const storedBranches = JSON.parse(localStorage.getItem("branches") || "[]");
      setHasMultipleBranches(Array.isArray(storedBranches) && storedBranches.length > 1);
    };

    // Run initially
    updateBranches();

    // Also run whenever localStorage changes
    window.addEventListener("storage", updateBranches);

    return () => {
      window.removeEventListener("storage", updateBranches);
    };
  }, []);

  const handleLogout = () => {
    // Sign out locally before anything else: this handler sits on a <Link>,
    // so the router navigates on this same click while the POST below is
    // still in flight. If storage still said "logged in" at that point, the
    // next page's navbar would re-seed a live session.
    epochRef.current += 1;
    clearStoredSession();
    setSession(null);
    apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {
      // Best-effort: if this fails the cookie stays until it expires, but
      // this device is already signed out locally.
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Check if reviews section is in view
      const reviewsSection = document.getElementById("reviews");
      if (reviewsSection) {
        const rect = reviewsSection.getBoundingClientRect();
        const isInView = rect.top <= 100 && rect.bottom >= 100;
        if (isInView && location.pathname === "/") {
          setActiveSection("reviews");
        } else if (!isInView && activeSection === "reviews") {
          setActiveSection("");
        }
      }
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
  }, [activeSection, location.pathname]);

  // Reset active section when route changes
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
    }
  }, [location.pathname]);

  const isRouteActive = (path) => location.pathname === path;
  const isAnchorActive = (anchor) => activeSection === anchor && location.pathname === "/";

  const handleAnchorClick = (anchor) => {
    setActiveSection(anchor);
    setSidebarOpen(false);

    // Smooth scroll to section
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isDashboardRoute =
    ["/student", "/teacher", "/admin"].includes(location.pathname) ||
    matchPath("/batch/:batchId", location.pathname) ||
    matchPath("/student/:studentId", location.pathname) ||
    matchPath("/teacher/:teacherId", location.pathname);

  return (
    <>
      <nav className={`navbar ${scrolled || isDashboardRoute ? "navbar-scrolled" : ""}`}>
        <Link to="/#home"><img className="logo" src={logo} /></Link>
        <ul className="nav-links">
          <li><Link to="/all-courses" className={isRouteActive("/all-courses") ? "active" : ""}>Courses</Link></li>
          <li><Link to="/#reviews" className={isAnchorActive("reviews") ? "active" : ""} onClick={() => handleAnchorClick("reviews")}>Student Reviews</Link></li>
          <li><Link to="/#download" className={isAnchorActive("download") ? "active" : ""} onClick={() => handleAnchorClick("download")}>Download App</Link></li>
          <li><Link to="/contactus" className={isRouteActive("/contactus") ? "active" : ""}>Contact Us</Link></li>

          {session && hasMultipleBranches && (
            <li><button
              className="switch-branch-btn"
              onClick={() => setShowBranchModal(true)}
            >
              <i className="bi bi-arrow-left-right me-1"></i>Switch Center
            </button></li>
          )}


          {session && role === "student" && (
            <>
              <li><Link to="/student" className={isRouteActive("/student") ? "active" : ""}><i className="bi bi-person-fill me-1"></i>Student Portal</Link></li>
              <li><Link to="/#home" className="login-button" onClick={handleLogout}>Logout</Link></li>
            </>
          )}

          {session && role === "teacher" && (
            <>
              <li><Link to="/teacher" className={isRouteActive("/teacher") ? "active" : ""}><i className="bi bi-person-fill me-1"></i>Faculty Panel</Link></li>
              <li><Link to="/#home" className="login-button" onClick={handleLogout}>Logout</Link></li>
            </>
          )}

          {session && role === "admin" && (
            <>
              <li><Link to="/teacher" className={isRouteActive("/teacher") ? "active" : ""}><i className="bi bi-person-fill me-1"></i>Faculty Panel</Link></li>
              <li><Link to="/admin" className={isRouteActive("/admin") ? "active" : ""}><i className="bi bi-controller me-1"></i>Control Room</Link></li>
              <li><Link to="/#home" className="login-button" onClick={handleLogout}>Logout</Link></li>
            </>
          )}

          {!session && (
            <li><Link to="/login" className="login-button">Login</Link></li>
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

        <Link to="/#home" className={isAnchorActive("home") ? "active" : ""} onClick={() => handleAnchorClick("home")}>Home</Link>
        <Link to="/all-courses" className={isRouteActive("/all-courses") ? "active" : ""} onClick={() => setSidebarOpen(false)}>Courses</Link>
        <Link to="/#reviews" className={isAnchorActive("reviews") ? "active" : ""} onClick={() => handleAnchorClick("reviews")}>Student Reviews</Link>
        <Link to="/#download" className={isAnchorActive("download") ? "active" : ""} onClick={() => handleAnchorClick("download")}>Download App</Link>
        <Link to="/contactus" className={isRouteActive("/contactus") ? "active" : ""} onClick={() => setSidebarOpen(false)}>Contact Us</Link>

        {session && hasMultipleBranches && (
          <button
            className={`switch-branch-btn ${isAnchorActive("home") ? "active" : ""}`}
            onClick={() => { setSidebarOpen(false); setShowBranchModal(true); }}
          >
            <i className="bi bi-arrow-left-right me-1"></i>Switch Center
          </button>
        )}

        {session && role === "student" && (
          <>
            <Link to="/student" className={isRouteActive("/student") ? "active" : ""} onClick={() => setSidebarOpen(false)}><i className="bi bi-person-fill me-1"></i>Student Portal</Link>
            <Link to="/" className="login-button mt-3" onClick={handleLogout}>Logout</Link>
          </>
        )}

        {session && role === "teacher" && (
          <>
            <Link to="/teacher" className={isRouteActive("/teacher") ? "active" : ""} onClick={() => setSidebarOpen(false)}><i className="bi bi-person-fill me-1"></i>Faculty Panel</Link>
            <Link to="/" className="login-button mt-3" onClick={handleLogout}>Logout</Link>
          </>
        )}

        {session && role === "admin" && (
          <>
            <Link to="/teacher" className={isRouteActive("/teacher") ? "active" : ""} onClick={() => setSidebarOpen(false)}><i className="bi bi-person-fill me-1"></i>Faculty Panel</Link>
            <Link to="/admin" className={isRouteActive("/admin") ? "active" : ""} onClick={() => setSidebarOpen(false)}><i className="bi bi-controller me-1"></i>Control Room</Link>
            <Link to="/" className="login-button mt-3" onClick={handleLogout}>Logout</Link>
          </>
        )}

        {!session && (
          <Link to="/login" className="login-button mt-3" onClick={() => setSidebarOpen(false)}>Login</Link>
        )}
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      {showBranchModal && (
        <BranchSelectModal
          branches={JSON.parse(localStorage.getItem("branches") || "[]")}
          onSelect={async (branch) => {
            try {
              const res = await apiFetch("/api/auth/switch-branch", {
                method: "POST",
                body: JSON.stringify({ branch }),
              });

              const data = await res.json();

              if (!data.success) {
                alert(data.message || "Failed to switch branch");
                return;
              }

              localStorage.setItem("branch", data.branch);

              // ✅ Fetch latest student data for this branch before reload
              if (localStorage.getItem("role") === "student") {
                apiFetch("/api/student/profile")
                  .then(res => res.json())
                  .then(profile => {
                    if (profile.success) {
                      localStorage.setItem("user", JSON.stringify(profile.student));
                    }
                    // Proceed to reload only after updating student data
                    setShowBranchModal(false);
                    setTimeout(() => window.location.reload(), 400);
                    window.dispatchEvent(new Event("branchChanged"));
                  })
                  .catch(err => {
                    console.error("Profile fetch after branch switch failed:", err);
                    setTimeout(() => window.location.reload(), 400);
                  });
              } else {
                // For admin/teacher
                setShowBranchModal(false);
                window.dispatchEvent(new Event("branchChanged"));
                const currentRole = localStorage.getItem("role");
                if (currentRole === "admin") {
                  window.location.href = "/admin";
                } else {
                  setTimeout(() => window.location.reload(), 400);
                }
              }
            } catch (err) {
              console.error("Switch branch error:", err);
              alert("Error switching branch");
            }
          }}
          onClose={() => setShowBranchModal(false)}
        />
      )}

      {/* Styles */}
      <style>{`
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
          padding: 0.75rem 2rem;;
          background: var(--bg-cream);
          box-shadow: ${scrolled ? "0 2px 12px rgba(0, 0, 0, 0.08)" : "none"};
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: var(--transition);
          margin: 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .logo {
          height: 50px;
          margin-right: var(--space-lg);
          margin: 0;
          border-radius: var(--radius-sm);
        }

        .login-button{
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-info) 100%
          ) !important;
          color: var(--bs-white) !important;
          border: none !important;
          border-radius: var(--bs-border-radius)!important;
          padding: 0.5rem 1.5rem !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          box-shadow: 0 3px 20px rgba(33, 118, 184, 0.2) !important;
          transition: all 0.25s ease !important;
          font-family: "Inter", sans-serif !important;
          margin-right: auto;
          margin-left: 1rem;
        }

        .login-button:hover{
          background: linear-gradient(
            135deg,
            var(--bs-link-hover-color) 0%,
            var(--bs-primary) 100%
          ) !important;
          box-shadow: 0 5px 24px rgba(33, 118, 184, 0.25) !important;
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
          font-weight: 700;
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
          font-weight: 700;
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

        /* Make any button inside nav-links match the anchor styling */
        .nav-links li button {
          background: none;
          color: var(--gray-800);
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          display: inline-block;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .nav-links li button:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .nav-links li button.active {
          background: none;
          color: var(--primary);
          box-shadow: none;
          position: relative;
          font-weight: 700;
        }

        .nav-links li button.active:after {
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

        .navbar-scrolled {
          padding: 0.4rem 2rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
          font-weight: 700;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          border: 1px solid transparent;
          display: block;
          position: relative;
        }

        .sidebar a:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .sidebar a.active {
          background: none;
          color: var(--primary)!important;
          font-weight: 700;
          box-shadow: none;
        }

        .sidebar a.active:after {
          content: "";
          display: block;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--primary);
          border-radius: 0 2px 2px 0;
        }

        /* Make the Switch button visually consistent with other nav/sidebar items */
        .sidebar button.switch-branch-btn {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          color: var(--gray-800);
          border: none;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
        }

        .sidebar button.switch-branch-btn:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .sidebar button.switch-branch-btn.active {
          color: var(--primary)!important;
          background: none;
        }

        .sidebar a:active {
          background: none;
          transform: none;
        }

        .close-btn {
          position: absolute;
          top: 0.8rem;
          right: 1.65rem;
          font-size: 2.5rem;
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
            padding-top: 4rem;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 0.75rem 1rem;
          }
          .sidebar {
            width: 85%;
          }
          .logo{
            height:40px;
          }
        }
      `}</style>
    </>
  );
}