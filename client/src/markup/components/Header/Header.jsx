import React, { useState, useRef, useEffect } from "react";
// Import the Link component from react-router-dom
import { Link, useNavigate } from "react-router-dom";
// Import the logo image
import logo from "../../../assets/images/logo.png";
// Import the login service to access the logout function
import loginService from "../../../services/login.service";
// Import the custom context hook
import { useAuth } from "../../../Contexts/AuthContext";
import TrackOrderModal from "../TrackOrder/TrackOrder";

function Header() {
  // Use the custom hook to access the data in the context
  const { isLogged, isAdmin, isManager, setIsLogged, employee } = useAuth();
  const navigate = useNavigate();
  // State to control the mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent body scroll
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset"; // Restore body scroll
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Log out event handler function
  const logOut = () => {
    loginService.logOut();
    setIsLogged(false);
    setDropdownOpen(false); // Close dropdown on logout
    setMobileMenuOpen(false); // Close mobile menu on logout
  };

  // Get first letter of first name for avatar
  const firstLetter =
    isLogged && employee?.employee_first_name
      ? employee.employee_first_name.charAt(0).toUpperCase()
      : "";

  return (
    <div>
      <header className="main-header perfect-header-design">
        {/* Top Row - Red & Blue Split */}
        <div className="perfect-header-top">
          <div className="auto-container">
            <div className="perfect-top-row">
              <div className="red-section">
                <span className="red-text">
                  Experience automotive artistry while your vehicle transforms
                </span>
              </div>
              <div className="blue-section">
                <span className="blue-text">
                  Monday - Saturday 7:00AM - 6:00PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Blue with Schedule Info */}
        <div className="perfect-header-middle">
          <div className="auto-container">
            <div className="perfect-middle-row">
              {isLogged && (isAdmin || isManager) && (
                <div className="admin-welcome-left">
                  <button
                    className="perfect-welcome-btn"
                    onClick={() => navigate("/admin")}
                  >
                    WELCOME ADMIN!
                  </button>
                </div>
              )}

              <div className="schedule-section">
                <span className="schedule-label">Schedule Appointment:</span>
                <span className="phone-text">1800 456 7890</span>
              </div>

              {isLogged && (isAdmin || isManager) && (
                <div className="admin-avatar-right">
                  <div className="perfect-admin-avatar">{firstLetter}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Row - White */}
        <div className="perfect-header-main">
          <div className="auto-container">
            <div className="perfect-main-row">
              {/* Mobile Navigation Toggle */}
              <div className="mobile-nav-toggle">
                <button
                  className="mobile-nav-toggler"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                  <div className="arrow-down"></div>
                </button>
              </div>

              {/* Logo */}
              <div className="perfect-logo">
                <a href="/">
                  <img src={logo} alt="ABE GARAGE" />
                </a>
              </div>

              {/* Desktop Navigation */}
              <nav className="perfect-desktop-nav">
                <ul className="perfect-nav-list">
                  <li>
                    <a href="/">HOME</a>
                  </li>
                  <li>
                    <a href="/about">ABOUT US</a>
                  </li>
                  <li>
                    <a href="/service">SERVICES</a>
                  </li>
                  <li>
                    <a href="/contact">CONTACT US</a>
                  </li>
                </ul>
              </nav>

              {/* Login/Logout Button */}
              <div className="perfect-login-section">
                {isLogged ? (
                  <Link to="/" className="perfect-logout-btn" onClick={logOut}>
                    LOG OUT
                  </Link>
                ) : (
                  <Link to="/login" className="perfect-login-btn">
                    LOGIN
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div
              className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
              ref={mobileMenuRef}
            >
              <div className="drawer-content">
                <button
                  className="drawer-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close mobile menu"
                >
                  &times;
                </button>
                <div className="drawer-logo">
                  <a href="/" onClick={() => setMobileMenuOpen(false)}>
                    <img src={logo} alt="ABE GARAGE" />
                  </a>
                </div>
                <nav className="drawer-nav">
                  <ul className="drawer-nav-list">
                    <li>
                      <a href="/" onClick={() => setMobileMenuOpen(false)}>
                        HOME
                      </a>
                    </li>
                    <li>
                      <a href="/about" onClick={() => setMobileMenuOpen(false)}>
                        ABOUT US
                      </a>
                    </li>
                    <li>
                      <a
                        href="/service"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        SERVICES
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        CONTACT US
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#trackOrderModal"
                        style={{ cursor: "pointer" }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        TRACK ORDER
                      </a>
                    </li>
                  </ul>
                </nav>
                <div className="drawer-actions">
                  {isLogged ? (
                    <Link
                      to="/"
                      className="theme-btn btn-style-one blue"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logOut();
                      }}
                    >
                      LOG OUT
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="theme-btn btn-style-one"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      LOGIN
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </header>
      <TrackOrderModal modalId="trackOrderModal" />
    </div>
  );
}

export default Header;
