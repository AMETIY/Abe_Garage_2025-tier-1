import React, { useEffect, useState } from "react";
// import employee.service.js
// Import the useAuth hook
import { useAuth } from "../../../../Contexts/AuthContext";
import employeeService from "../../../../services/employee.service";
import { useNavigate } from "react-router";
// Import validation utilities
import {
  useFormValidation,
  ValidationRules,
} from "../../../../util/validation.js";
import { VALIDATION_MESSAGES } from "../../../../util/validationConstants.js";

function EmployeeUpdate({ id }) {
  // Form initial values
  const initialValues = {
    employee_first_name: "",
    employee_last_name: "",
    employee_phone_number: "",
    employee_email: "",
    active_employee_status: 1,
    company_role_id: 1,
  };

  // Validation rules for the form (email is read-only in update)
  const validationRules = {
    employee_first_name: ValidationRules.firstName(),
    employee_last_name: ValidationRules.lastName(),
    employee_phone_number: ValidationRules.phone(),
    company_role_id: ValidationRules.employeeRole(),
  };

  // Use the form validation hook
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
  } = useFormValidation(initialValues, validationRules);

  // Additional state for success and server errors
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigator = useNavigate();

  // Create a variable to hold the user's token
  let loggedInEmployeeToken = "";
  // Destructure the auth hook and get the token
  const { employee } = useAuth();
  if (employee && employee.employee_token) {
    loggedInEmployeeToken = employee.employee_token;
  }

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await employeeService.getSingleEmployee(
          id,
          loggedInEmployeeToken
        );
        const data = await response.json();

        // If Error is returned from the API server, set the error message
        if (data.error) {
          setServerError(data.error);
        } else {
          console.log("employee -> ", data.data);
          // Handle successful response - populate form with employee data
          setValues({
            employee_first_name: data.data.employee_first_name || "",
            employee_last_name: data.data.employee_last_name || "",
            employee_phone_number: data.data.employee_phone || "",
            employee_email: data.data.employee_email || "",
            active_employee_status: data.data.active_employee || 1,
            company_role_id: data.data.company_role_id || 1,
          });
        }
      } catch (err) {
        console.log(err);
        setServerError(VALIDATION_MESSAGES.NETWORK_ERROR);
      }
    };

    fetchEmployee();
  }, [id, loggedInEmployeeToken, setValues]);
  const handleSubmit = (e) => {
    // Prevent the default behavior of the form
    e.preventDefault();

    // Clear any previous server errors
    setServerError("");

    // Validate all fields using the validation hook
    const isValid = validateAll();

    // If the form is not valid, do not submit
    if (!isValid) {
      return;
    }

    // Prepare form data using values from the validation hook
    const formData = {
      employee_first_name: values.employee_first_name,
      employee_last_name: values.employee_last_name,
      employee_phone_number: values.employee_phone_number,
      company_role_id: values.company_role_id,
      active_employee_status: values.active_employee_status,
    };

    // Pass the form data to the service
    const updateEmployee = employeeService.UpdateEmploye(
      formData,
      loggedInEmployeeToken,
      id
    );
    updateEmployee
      .then((response) => response.json())
      .then((data) => {
        // If Error is returned from the API server, set the error message
        if (data.error) {
          setServerError(data.error);
        } else {
          // Handle successful response
          setSuccess(true);
          setServerError("");
          // Redirect to the employees page after 2 seconds
          setTimeout(() => {
            navigator("/admin/employees");
          }, 2000);
        }
      })
      // Handle Catch
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setServerError(resMessage || VALIDATION_MESSAGES.FORM_SUBMISSION_ERROR);
      });
  };

  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Edit: employee Name</h2>
          <h4 style={{ fontWeight: "bold" }}>
            Employee email: {values.employee_email}{" "}
          </h4>
        </div>
        <div></div>
        <div className="row clearfix">
          <div className="form-column col-lg-7">
            <div className="inner-column">
              <div className="contact-form">
                <form onSubmit={handleSubmit}>
                  <div className="row clearfix">
                    <div className="form-group col-md-12">
                      {serverError && (
                        <div className="validation-error" role="alert">
                          {serverError}
                        </div>
                      )}
                      {success && (
                        <div className="success-message" role="alert">
                          Employee updated successfully! Redirecting...
                        </div>
                      )}
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="employee_first_name"
                        value={values.employee_first_name}
                        onChange={(event) =>
                          handleChange(
                            "employee_first_name",
                            event.target.value
                          )
                        }
                        onBlur={() => handleBlur("employee_first_name")}
                        placeholder="Employee first name"
                        className={
                          errors.employee_first_name &&
                          touched.employee_first_name
                            ? "error"
                            : ""
                        }
                      />
                      {errors.employee_first_name &&
                        touched.employee_first_name && (
                          <div className="validation-error" role="alert">
                            {errors.employee_first_name}
                          </div>
                        )}
                    </div>

                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="employee_last_name"
                        value={values.employee_last_name}
                        onChange={(event) =>
                          handleChange("employee_last_name", event.target.value)
                        }
                        onBlur={() => handleBlur("employee_last_name")}
                        placeholder="Employee last name"
                        className={
                          errors.employee_last_name &&
                          touched.employee_last_name
                            ? "error"
                            : ""
                        }
                      />
                      {errors.employee_last_name &&
                        touched.employee_last_name && (
                          <div className="validation-error" role="alert">
                            {errors.employee_last_name}
                          </div>
                        )}
                    </div>

                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="employee_phone_number"
                        value={values.employee_phone_number}
                        onChange={(event) =>
                          handleChange(
                            "employee_phone_number",
                            event.target.value
                          )
                        }
                        onBlur={() => handleBlur("employee_phone_number")}
                        placeholder="Employee phone (555-555-5555)"
                        className={
                          errors.employee_phone_number &&
                          touched.employee_phone_number
                            ? "error"
                            : ""
                        }
                      />
                      {errors.employee_phone_number &&
                        touched.employee_phone_number && (
                          <div className="validation-error" role="alert">
                            {errors.employee_phone_number}
                          </div>
                        )}
                    </div>

                    <div className="form-group col-md-12">
                      <select
                        name="employee_role"
                        value={values.company_role_id}
                        onChange={(event) =>
                          handleChange("company_role_id", event.target.value)
                        }
                        onBlur={() => handleBlur("company_role_id")}
                        className={`custom-select-box ${
                          errors.company_role_id && touched.company_role_id
                            ? "error"
                            : ""
                        }`}
                      >
                        <option value="">Select Role</option>
                        <option value="1">Employee</option>
                        <option value="2">Manager</option>
                        <option value="3">Admin</option>
                      </select>
                      {errors.company_role_id && touched.company_role_id && (
                        <div className="validation-error" role="alert">
                          {errors.company_role_id}
                        </div>
                      )}
                    </div>

                    <div className="form-group col-md-12">
                      {/* is active ustome check box */}
                      <label className="checkbox ">
                        <input
                          type="checkbox"
                          name="active_employee_status"
                          checked={values.active_employee_status === 1}
                          onChange={(event) =>
                            handleChange(
                              "active_employee_status",
                              event.target.checked ? 1 : 0
                            )
                          }
                        />
                        <span className="p-2">Is Active employee </span>
                      </label>
                      {/* end of is active employee check box */}
                    </div>

                    <div className="form-group col-md-12">
                      <button
                        className="theme-btn btn-style-one"
                        type="submit"
                        data-loading-text="Please wait..."
                        disabled={success}
                      >
                        <span>{success ? "Success!" : "Update Employee"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmployeeUpdate;
