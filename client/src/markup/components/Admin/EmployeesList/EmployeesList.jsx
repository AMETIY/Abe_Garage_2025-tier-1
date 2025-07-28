// Import the necessary components
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Button } from "react-bootstrap";
// Import the auth hook
import { useAuth } from "../../../../Contexts/AuthContext";
// Import the date-fns library
import { format } from "date-fns"; // To properly format the date on the table
// Import the getAllEmployees function
import employeeService from "../../../../services/employee.service";
import { FaEdit, FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { MdAdsClick } from "react-icons/md";
import Loader from "../../Loader/Loader";

// Create the EmployeesList component

const EmployeesList = () => {
  // Create all the states we need to store the data

  // Create the employees state to store the employees data
  const [employees, setEmployees] = useState([]);
  // A state to serve as a flag to show the error message
  const [apiError, setApiError] = useState(false);
  // A state to store the error message
  const [apiErrorMessage, setApiErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search functionality states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Filter functionality states
  const [showInactive, setShowInactive] = useState(false);

  const { employee } = useAuth();
  let token = null; // To store the token
  if (employee) {
    token = employee.employee_token;
  }

  // Debounced search effect to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search input handler
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Toggle handler for active/inactive filter
  const handleToggleStatus = useCallback(() => {
    setShowInactive((prev) => !prev);
  }, []);

  // Combined filter logic for search and active/inactive status
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // First filter by active/inactive status
    if (showInactive) {
      filtered = filtered.filter((employee) => !employee.active_employee);
    } else {
      filtered = filtered.filter((employee) => employee.active_employee);
    }

    // Then apply search filter within the status-filtered results
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((employee) => {
        const firstName = employee.employee_first_name?.toLowerCase() || "";
        const lastName = employee.employee_last_name?.toLowerCase() || "";
        const email = employee.employee_email?.toLowerCase() || "";
        const phone = employee.employee_phone?.toLowerCase() || "";

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [employees, debouncedSearchTerm, showInactive]);

  const handleDelete = (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirm) return;

    employeeService
      .DeleteEmployee(id, token)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setEmployees((prev) => prev.filter((emp) => emp.employee_id !== id));
        }
      });
  };

  useEffect(() => {
    // Call the getAllEmployees function
    setIsLoading(true);
    const allEmployees = employeeService.getAllEmployees(token);
    allEmployees
      .then((res) => {
        if (!res.ok) {
          console.log(res.status);
          setApiError(true);
          setIsLoading(false);
          if (res.status === 401) {
            setIsLoading(false);
            setApiErrorMessage("Please login again");
          } else if (res.status === 403) {
            setApiErrorMessage("You are not authorized to view this page");
            setIsLoading(false);
          } else {
            setApiErrorMessage("Please try again later");
            setIsLoading(false);
          }
        }
        return res.json();
      })
      .then((data) => {
        if (data.data.length !== 0) {
          setEmployees(data.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [token]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : apiError ? (
        <section className="contact-section">
          <div className="auto-container">
            <div className="contact-title">
              <h2>{apiErrorMessage}</h2>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title d-flex justify-content-between align-items-center">
                <h2>Employees</h2>
                <div className="employee-count text-muted">
                  {filteredEmployees.length}{" "}
                  {showInactive ? "inactive" : "active"} employee
                  {filteredEmployees.length !== 1 ? "s" : ""}
                  {debouncedSearchTerm && ` (filtered)`}
                </div>
              </div>
              <div className="employee-controls mb-3 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                <div className="search-container">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search employees by name, email, or phone..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ maxWidth: "400px" }}
                  />
                </div>
                <div className="filter-controls">
                  <Button
                    variant={showInactive ? "danger" : "outline-secondary"}
                    onClick={handleToggleStatus}
                    className="toggle-status-btn"
                    style={{
                      minWidth: "140px",
                      fontWeight: "500",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {showInactive ? "Show Active" : "Show Inactive"}
                  </Button>
                </div>
              </div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Active</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Added Date</th>
                    <th>Role</th>
                    <th>Edit/Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {debouncedSearchTerm
                          ? `No ${
                              showInactive ? "inactive" : "active"
                            } employees found matching your search criteria.`
                          : `No ${
                              showInactive ? "inactive" : "active"
                            } employees found.`}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.employee_id}>
                        <td>{employee.active_employee ? "Yes" : "No"}</td>
                        <td>{employee.employee_first_name}</td>
                        <td>{employee.employee_last_name}</td>
                        <td>{employee.employee_email}</td>
                        <td>{employee.employee_phone}</td>
                        <td>
                          {employee.added_date
                            ? (() => {
                                try {
                                  const date = new Date(employee.added_date);
                                  if (
                                    isNaN(date.getTime()) ||
                                    date.getTime() < 0
                                  ) {
                                    return "Invalid Date";
                                  }
                                  try {
                                    return format(
                                      date,
                                      "MM - dd - yyyy | kk:mm"
                                    );
                                  } catch {
                                    return "Invalid Date";
                                  }
                                } catch {
                                  return "Invalid Date";
                                }
                              })()
                            : "N/A"}
                        </td>
                        <td>{employee.company_role_name}</td>
                        <td>
                          <a
                            href={`/admin/employee/edit/${employee.employee_id}`}
                            className="pr-3"
                          >
                            <FaRegEdit
                              className="text-dark cursor-pointer mr-2"
                              size={18}
                            />
                          </a>

                          <a>
                            <a
                              onClick={() => handleDelete(employee.employee_id)}
                            >
                              <FaTrashAlt
                                className="text-danger cursor-pointer "
                                size={18}
                              />
                            </a>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </section>
        </>
      )}
    </>
  );
};

// Export the EmployeesList component
export default EmployeesList;
