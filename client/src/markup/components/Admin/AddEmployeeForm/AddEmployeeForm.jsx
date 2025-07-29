import React, { useState } from "react";
// import employee.service.js
import employeeService from "../../../../services/employee.service";
// Import the useAuth hook
import { useAuth } from "../../../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
// Import validation utilities
import {
  useFormValidation,
  ValidationRules,
} from "../../../../util/validation.js";
import { VALIDATION_MESSAGES } from "../../../../util/validationConstants.js";

function AddEmployeeForm() {
  // Form initial values
  const initialValues = {
    employee_email: "",
    employee_first_name: "",
    employee_last_name: "",
    employee_phone: "",
    employee_password: "",
    active_employee: 1,
    company_role_id: 1,
  };

  // Validation rules for the form
  const validationRules = {
    employee_email: ValidationRules.email(),
    employee_first_name: ValidationRules.firstName(),
    employee_last_name: ValidationRules.lastName(),
    employee_phone: ValidationRules.phone(),
    employee_password: ValidationRules.password(),
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
    reset,
  } = useFormValidation(initialValues, validationRules);

  // Additional state for success and server errors
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  // Create a variable to hold the user's token
  let loggedInEmployeeToken = "";
  // Destructure the auth hook and get the token
  const { employee } = useAuth();
  if (employee && employee.employee_token) {
    loggedInEmployeeToken = employee.employee_token;
  }

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
      employee_email: values.employee_email,
      employee_first_name: values.employee_first_name,
      employee_last_name: values.employee_last_name,
      employee_phone: values.employee_phone,
      employee_password: values.employee_password,
      active_employee: values.active_employee,
      company_role_id: values.company_role_id,
    };

    // Pass the form data to the service
    const newEmployee = employeeService.createEmployee(
      formData,
      loggedInEmployeeToken
    );
    newEmployee
      .then((response) => response.json())
      .then((data) => {
        // If Error is returned from the API server, set the error message
        if (data.error) {
          setServerError(data.error);
        } else {
          // Handle successful response
          setSuccess(true);
          setServerError("");
          // Reset form on success
          reset();
          // Redirect to the employees page after 2 seconds
          setTimeout(() => {
            navigate("/admin/employees");
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
          <h2>Add a new employee</h2>
        </div>
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
                      <input
                        type="email"
                        name="employee_email"
                        value={values.employee_email}
                        onChange={(event) =>
                          handleChange("employee_email", event.target.value)
                        }
                        onBlur={() => handleBlur("employee_email")}
                        placeholder="Employee email"
                        className={
                          errors.employee_email && touched.employee_email
                            ? "error"
                            : ""
                        }
                      />
                      {errors.employee_email && touched.employee_email && (
                        <div className="validation-error" role="alert">
                          {errors.employee_email}
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
                        name="employee_phone"
                        value={values.employee_phone}
                        onChange={(event) =>
                          handleChange("employee_phone", event.target.value)
                        }
                        onBlur={() => handleBlur("employee_phone")}
                        placeholder="Employee phone (555-555-5555)"
                        className={
                          errors.employee_phone && touched.employee_phone
                            ? "error"
                            : ""
                        }
                      />
                      {errors.employee_phone && touched.employee_phone && (
                        <div className="validation-error" role="alert">
                          {errors.employee_phone}
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
                      <input
                        type="password"
                        name="employee_password"
                        value={values.employee_password}
                        onChange={(event) =>
                          handleChange("employee_password", event.target.value)
                        }
                        onBlur={() => handleBlur("employee_password")}
                        placeholder="Employee password"
                        className={
                          errors.employee_password && touched.employee_password
                            ? "error"
                            : ""
                        }
                      />
                      {errors.employee_password &&
                        touched.employee_password && (
                          <div className="validation-error" role="alert">
                            {errors.employee_password}
                          </div>
                        )}
                    </div>

                    {success && (
                      <div className="form-group col-md-12">
                        <div className="success-message" role="alert">
                          Employee added successfully! Redirecting...
                        </div>
                      </div>
                    )}

                    <div className="form-group col-md-12">
                      <button
                        className="theme-btn btn-style-one"
                        type="submit"
                        data-loading-text="Please wait..."
                        disabled={success}
                      >
                        <span>{success ? "Success!" : "Add employee"}</span>
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

export default AddEmployeeForm;
