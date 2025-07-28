import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Import the auth hook
import { useAuth } from "../../../Contexts/AuthContext";
// Import the login form component
import LoginForm from "../../components/LoginForm/LoginForm";
// Import the admin menu component
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";
// Import the new EmployeeForm component
import EmployeeForm from "../../components/Admin/Employee/EmployeeForm";
import employeeService from "../../../services/employee.service";
import Loader from "../../components/Loader/Loader";
import Unauthorized from "../Unauthorized";

function EmployeeUpdatePage() {
  const { id } = useParams();
  const { isLogged, isAdmin, isManager, employee } = useAuth();

  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const token = employee?.employee_token;

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!token || !id) return;

      try {
        setIsLoading(true);
        const response = await employeeService.getSingleEmployee(id, token);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setEmployeeData(data.data);
        }
      } catch (err) {
        setError("Failed to fetch employee data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id, token]);

  if (!isLogged) {
    return (
      <div>
        <LoginForm />
      </div>
    );
  }

  if (!isManager && !isAdmin) {
    return (
      <div>
        <Unauthorized />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div className="container-fluid admin-pages">
          <div className="row">
            <div className="col-md-3 admin-left-side">
              <AdminMenu />
            </div>
            <div className="col-md-9 admin-right-side">
              <Loader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                  <div className="contact-title">
                    <h2>Error</h2>
                    <p>{error}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="contact-title">
                  <h2>Edit Employee</h2>
                  {employeeData && (
                    <h4 style={{ fontWeight: "normal", color: "#666" }}>
                      Employee: {employeeData.employee_first_name}{" "}
                      {employeeData.employee_last_name}
                    </h4>
                  )}
                </div>
                <div className="row clearfix">
                  <div className="form-column col-lg-8">
                    <div className="inner-column">
                      {employeeData && (
                        <EmployeeForm mode="edit" initialData={employeeData} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeUpdatePage;
