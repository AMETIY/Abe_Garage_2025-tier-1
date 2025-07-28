import React, { useState, useEffect, useMemo } from "react";
import { Table, Alert } from "react-bootstrap";
import { format } from "date-fns";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import employeeService from "../../../../services/employee.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import Loader from "../../Loader/Loader";
import StatusToggleButton from "../../Common/StatusToggleButton/StatusToggleButton";
import PaginationComponent from "../../Common/PaginationComponent/PaginationComponent";
import "./EmployeesList.css";

/**
 * EmployeesList - Displays a paginated list of employees with status filtering
 *
 * @param {string} searchTerm - Search term for filtering employees
 * @param {boolean} showInactive - Whether to show inactive employees
 * @param {function} onStatusToggle - Callback when status filter is toggled
 */
const EmployeesList = ({
  searchTerm = "",
  showInactive = false,
  onStatusToggle,
}) => {
  // State management
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { employee } = useAuth();
  const token = employee?.employee_token;

  // Filter employees based on search term and status
  const filteredEmployees = useMemo(() => {
    try {
      let filtered = employees;

      // Filter by active/inactive status
      if (showInactive) {
        filtered = filtered.filter((emp) => !emp.active_employee);
      } else {
        filtered = filtered.filter((emp) => emp.active_employee);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((emp) => {
          const firstName = emp.employee_first_name?.toLowerCase() || "";
          const lastName = emp.employee_last_name?.toLowerCase() || "";
          const email = emp.employee_email?.toLowerCase() || "";
          const phone = emp.employee_phone?.toLowerCase() || "";

          return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower)
          );
        });
      }

      return filtered;
    } catch (err) {
      console.error("Filter error:", err);
      return [];
    }
  }, [employees, searchTerm, showInactive]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle employee deletion
  const handleDelete = async (id) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this employee?"
      );
      if (!confirm) return;

      const response = await employeeService.DeleteEmployee(id, token);
      const data = await response.json();

      if (data?.success) {
        setSuccess("Employee deleted successfully");
        setEmployees((prev) => prev.filter((emp) => emp.employee_id !== id));
        // Reset to first page if current page becomes empty
        if (paginatedEmployees.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        setError("Failed to delete employee");
      }
    } catch (err) {
      setError("Something went wrong");
      console.error("Delete error:", err);
    }
  };

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setApiError(false);

        const response = await employeeService.getAllEmployees(token);

        if (!response.ok) {
          setApiError(true);
          if (response.status === 401) {
            setApiErrorMessage("Please login again");
          } else if (response.status === 403) {
            setApiErrorMessage("You are not authorized to view this page");
          } else {
            setApiErrorMessage("Please try again later");
          }
          return;
        }

        const data = await response.json();
        if (data.data && data.data.length >= 0) {
          setEmployees(data.data);
        }
      } catch (err) {
        setApiError(true);
        setApiErrorMessage("Failed to fetch employees");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchEmployees();
    }
  }, [token]);

  // Reset current page when search term or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showInactive]);

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Error boundary check
  if (isLoading) {
    return <Loader />;
  }

  if (apiError) {
    return (
      <section className="contact-section">
        <div className="auto-container">
          <div className="contact-title">
            <h2>{apiErrorMessage}</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="employees-list">
      {/* Success/Error Messages */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Header with count and status toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="employee-count">
          <span className="fw-semibold">{filteredEmployees.length}</span>{" "}
          <span
            className={
              showInactive ? "text-danger fw-medium" : "text-success fw-medium"
            }
          >
            {showInactive ? "inactive" : "active"}
          </span>{" "}
          employee{filteredEmployees.length !== 1 ? "s" : ""}
          {searchTerm && (
            <span className="text-info ms-1">(filtered by search)</span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Filter by status:</small>
          <StatusToggleButton
            isActive={!showInactive}
            onToggle={() => onStatusToggle && onStatusToggle()}
            activeText="Active Employees"
            inactiveText="Inactive Employees"
            size="sm"
            className="status-filter-toggle"
          />
        </div>
      </div>

      {/* Employees Table - Desktop View */}
      <div className="d-none d-lg-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Active</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Added Date</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  {searchTerm
                    ? `No ${
                        showInactive ? "inactive" : "active"
                      } employees found matching your search criteria.`
                    : `No ${
                        showInactive ? "inactive" : "active"
                      } employees found.`}
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>
                    <span
                      className={`badge ${
                        emp.active_employee ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {emp.active_employee ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>{emp.employee_first_name}</td>
                  <td>{emp.employee_last_name}</td>
                  <td className="text-break">{emp.employee_email}</td>
                  <td>{emp.employee_phone}</td>
                  <td>
                    {emp.added_date
                      ? (() => {
                          try {
                            const date = new Date(emp.added_date);
                            if (isNaN(date.getTime()) || date.getTime() < 0) {
                              return "Invalid Date";
                            }
                            try {
                              return format(date, "MM/dd/yyyy");
                            } catch {
                              return "Invalid Date";
                            }
                          } catch {
                            return "Invalid Date";
                          }
                        })()
                      : "N/A"}
                  </td>
                  <td>{emp.company_role_name}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <a
                        href={`/admin/employee/edit/${emp.employee_id}`}
                        className="text-decoration-none"
                        title="Edit Employee"
                      >
                        <FaRegEdit
                          className="text-primary cursor-pointer"
                          size={18}
                        />
                      </a>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-danger"
                        onClick={() => handleDelete(emp.employee_id)}
                        title="Delete Employee"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Employees Cards - Mobile/Tablet View */}
      <div className="d-lg-none">
        {paginatedEmployees.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              {searchTerm
                ? `No ${
                    showInactive ? "inactive" : "active"
                  } employees found matching your search criteria.`
                : `No ${showInactive ? "inactive" : "active"} employees found.`}
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {paginatedEmployees.map((emp) => (
              <div key={emp.employee_id} className="col-12 col-md-6">
                <div className="card employee-card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">
                        {emp.employee_first_name} {emp.employee_last_name}
                      </h6>
                      <span
                        className={`badge ${
                          emp.active_employee ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {emp.active_employee ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="employee-details">
                      <div className="detail-item mb-2">
                        <small className="text-muted d-block">Email</small>
                        <span className="text-break">{emp.employee_email}</span>
                      </div>

                      <div className="detail-item mb-2">
                        <small className="text-muted d-block">Phone</small>
                        <span>{emp.employee_phone}</span>
                      </div>

                      <div className="row">
                        <div className="col-6">
                          <div className="detail-item mb-2">
                            <small className="text-muted d-block">Role</small>
                            <span className="fw-medium">
                              {emp.company_role_name}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="detail-item mb-2">
                            <small className="text-muted d-block">Added</small>
                            <span>
                              {emp.added_date
                                ? (() => {
                                    try {
                                      const date = new Date(emp.added_date);
                                      if (
                                        isNaN(date.getTime()) ||
                                        date.getTime() < 0
                                      ) {
                                        return "Invalid Date";
                                      }
                                      try {
                                        return format(date, "MM/dd/yyyy");
                                      } catch {
                                        return "Invalid Date";
                                      }
                                    } catch {
                                      return "Invalid Date";
                                    }
                                  })()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3 pt-2 border-top">
                      <a
                        href={`/admin/employee/edit/${emp.employee_id}`}
                        className="btn btn-outline-primary btn-sm flex-fill"
                        title="Edit Employee"
                      >
                        <FaRegEdit className="me-1" size={14} />
                        Edit
                      </a>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm flex-fill"
                        onClick={() => handleDelete(emp.employee_id)}
                        title="Delete Employee"
                      >
                        <FaTrashAlt className="me-1" size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          className="mt-3"
        />
      )}
    </div>
  );
};

export default EmployeesList;
