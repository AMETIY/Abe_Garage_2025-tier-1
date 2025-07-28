import React, { useState, useCallback } from "react";
import { Button, Row, Col } from "react-bootstrap";
import { FaPlus, FaFilter } from "react-icons/fa";
// Import the auth hook
import { useAuth } from "../../../Contexts/AuthContext";
// Import the login form component
import LoginForm from "../../components/LoginForm/LoginForm";
// Import the admin menu component
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";
// Import the new employee components
import EmployeesList from "../../components/Admin/Employee/EmployeesList";
import EmployeeSearch from "../../components/Admin/Employee/EmployeeSearch";
import Unauthorized from "../Unauthorized";

function Employees() {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Destructure the auth hook
  const { isLogged, isAdmin, isManager } = useAuth();

  // Handle search term changes
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }, []);

  // Handle status filter toggle
  const handleStatusToggle = useCallback(() => {
    setShowInactive((prev) => !prev);
  }, []);

  if (isLogged) {
    if (isManager || isAdmin) {
      return (
        <div>
          <div className="container-fluid admin-pages">
            <div className="row">
              <div className="col-md-3 admin-left-side">
                <AdminMenu />
              </div>
              <div className="col-md-9 admin-right-side">
                <section className="contact-section">
                  <div className="auto-container">
                    {/* Page Header - Mobile Responsive */}
                    <div className="page-header-container mb-3">
                      <Row className="align-items-center">
                        <Col xs={12} sm={8} md={8} lg={8}>
                          <div className="page-title-section">
                            <h2 className="page-title mb-1">
                              Employee Management
                            </h2>
                            <p className="page-subtitle text-muted mb-0">
                              Manage your team members and their roles
                            </p>
                          </div>
                        </Col>
                        <Col xs={12} sm={4} md={4} lg={4}>
                          <div className="add-employee-button-container">
                            <Button
                              variant="primary"
                              href="/admin/add-employee"
                              className="add-employee-btn w-100"
                              size="lg"
                            >
                              <FaPlus size={14} />
                              <span className="btn-text">Add Employee</span>
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="search-filter-container mb-4">
                      <Row className="g-3">
                        <Col lg={8} md={7} sm={12}>
                          <EmployeeSearch
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                          />
                        </Col>
                        <Col lg={4} md={5} sm={12}>
                          <div className="filter-controls d-flex align-items-end h-100">
                            <Button
                              variant={showInactive ? "danger" : "success"}
                              onClick={handleStatusToggle}
                              className="w-100 d-flex align-items-center justify-content-center gap-2"
                              style={{
                                borderRadius: "8px",
                                padding: "0.75rem 1rem",
                                fontWeight: "500",
                                transition: "all 0.3s ease",
                                minHeight: "48px",
                                boxShadow: showInactive
                                  ? "0 2px 4px rgba(220, 53, 69, 0.2)"
                                  : "0 2px 4px rgba(40, 167, 69, 0.2)",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow = showInactive
                                  ? "0 4px 8px rgba(220, 53, 69, 0.3)"
                                  : "0 4px 8px rgba(40, 167, 69, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = showInactive
                                  ? "0 2px 4px rgba(220, 53, 69, 0.2)"
                                  : "0 2px 4px rgba(40, 167, 69, 0.2)";
                              }}
                            >
                              <FaFilter size={14} />
                              {showInactive ? "Show Active" : "Show Inactive"}
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Employees List Component */}
                    <EmployeesList
                      searchTerm={searchTerm}
                      showInactive={showInactive}
                      onStatusToggle={handleStatusToggle}
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <Unauthorized />
        </div>
      );
    }
  } else {
    return (
      <div>
        <LoginForm />
      </div>
    );
  }
}

export default Employees;
