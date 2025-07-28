import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { logIn } from "../../../services/login.service";
import { Spinner } from "react-bootstrap";

function Login() {
  const location = useLocation();
  const [employee_email, setEmail] = useState("");
  const [employee_password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials
  const demoCredentials = {
    email: "admin@admin.com",
    password: "123456",
  };

  // Auto-fill demo login function
  const handleAutoFill = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setEmailError("");
    setPasswordError("");
    setServerError("");
  };

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setServerError("");

    // Handle client side validations here
    let valid = true; // Flag
    // Email validation
    if (!employee_email) {
      setEmailError("Please enter your email address first");
      valid = false;
    } else if (!employee_email.includes("@")) {
      setEmailError("Invalid email format");
    } else {
      const regex = /^\S+@\S+\.\S+$/;
      if (!regex.test(employee_email)) {
        setEmailError("Invalid email format");
        valid = false;
      } else {
        setEmailError("");
      }
    }
    // Password has to be at least 6 characters long
    if (!employee_password || employee_password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!valid) {
      setIsLoading(false);
      return;
    }
    // Handle form submission here
    const formData = {
      employee_email,
      employee_password,
    };
    console.log(formData);
    // Call the service
    const loginEmployee = logIn(formData);
    console.log(loginEmployee);
    loginEmployee
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (response.status === "success") {
          // Save the user in the local storage
          if (response.data.employee_token) {
            console.log("Storing employee data:", response.data);
            localStorage.setItem("employee", JSON.stringify(response.data));

            // Ensure localStorage write is complete before redirect
            setTimeout(() => {
              console.log("Redirecting after successful login...");
              if (location.pathname === "/login") {
                window.location.replace("/");
              } else {
                window.location.reload();
              }
            }, 100); // Small delay to ensure localStorage write completes
          } else {
            setServerError("Login successful but no token received");
            setIsLoading(false);
          }
        } else {
          // Show an error message
          setServerError(response.message);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setServerError("An error has occurred. Please try again later." + err);
        setIsLoading(false);
      });
  };

  return (
    <div className="modern-login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to your account to continue
            </p>
          </div>

          {/* Demo Login Section */}
          <div className="demo-login-section">
            <div className="demo-header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"
                  fill="currentColor"
                />
              </svg>
              <span className="demo-title">Demo Login</span>
              <button
                type="button"
                className="auto-fill-btn"
                onClick={handleAutoFill}
                disabled={isLoading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    fill="currentColor"
                  />
                </svg>
                AUTO-FILL
              </button>
            </div>
            <div className="demo-credentials">
              <div
                className="credential-item"
                onClick={() => copyToClipboard(demoCredentials.email)}
                title="Click to copy email"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="credential-label">EMAIL</span>
                <span className="credential-value">
                  {demoCredentials.email}
                </span>
              </div>
              <div
                className="credential-item"
                onClick={() => copyToClipboard(demoCredentials.password)}
                title="Click to copy password"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="credential-label">PASSWORD</span>
                <span className="credential-value">
                  {demoCredentials.password}
                </span>
              </div>
            </div>
            <div className="demo-note">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"
                  fill="currentColor"
                />
              </svg>
              <span>Full Admin Access • Click any credential to copy</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {serverError && (
              <div className="modern-error-alert" role="alert">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="currentColor"
                  />
                </svg>
                {serverError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="employee_email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  id="employee_email"
                  type="email"
                  name="employee_email"
                  value={employee_email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className={`modern-input ${emailError ? "error" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <div className="field-error" role="alert">
                  {emailError}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="employee_password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  id="employee_password"
                  type="password"
                  name="employee_password"
                  value={employee_password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className={`modern-input ${passwordError ? "error" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {passwordError && (
                <div className="field-error" role="alert">
                  {passwordError}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="modern-login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"
                      fill="currentColor"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .modern-login-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #e2e8f0 50%,
            #cbd5e1 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #475569 0%, #334155 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          margin: 0;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .modern-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: #ffffff;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .modern-input:focus {
          border-color: #475569;
          box-shadow: 0 0 0 3px rgba(71, 85, 105, 0.1);
        }

        .modern-input.error {
          border-color: #ef4444;
        }

        .modern-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .field-error {
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .modern-error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modern-login-btn {
          background: linear-gradient(135deg, #475569 0%, #334155 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 56px;
        }

        .modern-login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(71, 85, 105, 0.3);
        }

        .modern-login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .modern-login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .demo-login-section {
          background: linear-gradient(135deg, #fef3f2 0%, #fef2f2 100%);
          border: 2px solid #fecaca;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .demo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .demo-header svg {
          color: #dc2626;
        }

        .demo-title {
          font-weight: 700;
          color: #dc2626;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          margin-left: 8px;
        }

        .auto-fill-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.5px;
        }

        .auto-fill-btn:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .auto-fill-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .demo-credentials {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .credential-item {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .credential-item:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
        }

        .credential-item svg {
          color: #9ca3af;
          align-self: flex-start;
        }

        .credential-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .credential-value {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        }

        .demo-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }

        .demo-note svg {
          color: #9ca3af;
        }

        @media (max-width: 480px) {
          .demo-credentials {
            grid-template-columns: 1fr;
          }

          .demo-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .auto-fill-btn {
            align-self: stretch;
            justify-content: center;
          }
          .login-card {
            padding: 24px;
            border-radius: 16px;
          }

          .login-title {
            font-size: 24px;
          }

          .modern-login-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
