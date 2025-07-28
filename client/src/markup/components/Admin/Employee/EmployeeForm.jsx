import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import employeeService from "../../../../services/employee.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import {
  useFormValidation,
  ValidationRules,
} from "../../../../util/validation.js";
import { VALIDATION_MESSAGES } from "../../../../util/validationConstants.js";
import "./EmployeeForm.css";

/**
 * EmployeeForm - Reusable form component for creating and editing employees
 *
 * @param {object} initialData - Initial form data (for editing)
 * @param {string} mode - Form mode: 'create' or 'edit'
 * @param {function} onSuccess - Callback when form is successfully submitted
 * @param {function} onCancel - Callback when form is cancelled
 * @param {boolean} showActions - Whether to show form action buttons
 */
const EmployeeForm = ({
  initialData = null,
  mode = "create",
  onSuccess,
  onCancel,
  showActions = true,
}) => {
  // Form initial values
  const getInitialValues = () => {
    if (initialData && mode === "edit") {
      return {
        employee_email: initialData.employee_email || "",
        employee_first_name: initialData.employee_first_name || "",
        employee_last_name: initialData.employee_last_name || "",
        employee_phone: initialData.employee_phone || "",
        employee_password: "", // Always empty for security
        active_employee: initialData.active_employee ? 1 : 0,
        company_role_id: initialData.company_role_id || 1,
      };
    }

    return {
      employee_email: "",
      employee_first_name: "",
      employee_last_name: "",
      employee_phone: "",
      employee_password: "",
      active_employee: 1,
      company_role_id: 1,
    };
  };

  // Validation rules for the form
  const validationRules = {
    employee_email: ValidationRules.email(),
    employee_first_name: ValidationRules.firstName(),
    employee_last_name: ValidationRules.lastName(),
    employee_phone: ValidationRules.phone(),
    employee_password:
      mode === "create"
        ? ValidationRules.password()
        : ValidationRules.optionalPassword(),
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
    setValues,
  } = useFormValidation(getInitialValues(), validationRules);

  // Additional state
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token;

  // Update form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setValues(getInitialValues());
    }
  }, [initialData, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setServerError("Authentication required. Please login again.");
      return;
    }

    setServerError("");
    setIsSubmitting(true);

    // Validate all fields
    const isValid = validateAll();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare form data
      const formData = {
        employee_email: values.employee_email,
        employee_first_name: values.employee_first_name,
        employee_last_name: values.employee_last_name,
        employee_phone: values.employee_phone,
        active_employee: values.active_employee,
        company_role_id: values.company_role_id,
      };

      // Only include password if it's provided (for create mode or when updating password)
      if (values.employee_password) {
        formData.employee_password = values.employee_password;
      }

      let response;
      if (mode === "create") {
        response = await employeeService.createEmployee(formData, token);
      } else {
        response = await employeeService.UpdateEmploye(
          formData,
          token,
          initialData.employee_id
        );
      }

      const data = await response.json();

      if (data.error) {
        setServerError(data.error);
      } else {
        setSuccess(true);
        setServerError("");

        if (onSuccess) {
          onSuccess(data);
        } else {
          // Default behavior: redirect after success
          setTimeout(() => {
            navigate("/admin/employees");
          }, 2000);
        }

        if (mode === "create") {
          reset();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);

      let errorMessage = VALIDATION_MESSAGES.FORM_SUBMISSION_ERROR;

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (status === 409) {
          errorMessage = "An employee with this email already exists.";
        } else if (status === 422) {
          errorMessage =
            data?.message || "Validation failed. Please check your input.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage =
            data?.message || error.response.data?.error || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        // Other error
        errorMessage = error.message || errorMessage;
      }

      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin/employees");
    }
  };

  return (
    <div className="employee-form">
      <Form onSubmit={handleSubmit}>
        {/* Server Error Alert */}
        {serverError && (
          <Alert
            variant="danger"
            className="mb-3"
            dismissible
            onClose={() => setServerError("")}
          >
            <Alert.Heading className="h6">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Form Submission Error
            </Alert.Heading>
            {serverError}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert variant="success" className="mb-3">
            <Alert.Heading className="h6">
              <i className="fas fa-check-circle me-2"></i>
              Success!
            </Alert.Heading>
            Employee {mode === "create" ? "added" : "updated"} successfully!
            {!onSuccess && " Redirecting..."}
          </Alert>
        )}

        <Row>
          {/* Email */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="employee_email" className="fw-medium">
                Email Address *
              </Form.Label>
              <Form.Control
                id="employee_email"
                type="email"
                name="employee_email"
                value={values.employee_email}
                onChange={(e) => handleChange("employee_email", e.target.value)}
                onBlur={() => handleBlur("employee_email")}
                placeholder="Enter employee email"
                isInvalid={errors.employee_email && touched.employee_email}
                isValid={
                  touched.employee_email &&
                  !errors.employee_email &&
                  values.employee_email
                }
                disabled={isSubmitting}
                className={`form-control ${
                  touched.employee_email &&
                  !errors.employee_email &&
                  values.employee_email
                    ? "is-valid"
                    : ""
                }`}
              />
              <Form.Control.Feedback type="invalid">
                <i className="fas fa-exclamation-circle me-1"></i>
                {errors.employee_email}
              </Form.Control.Feedback>
              <Form.Control.Feedback type="valid">
                <i className="fas fa-check-circle me-1"></i>
                Email looks good!
              </Form.Control.Feedback>
              {!touched.employee_email && (
                <Form.Text className="text-muted">
                  We'll use this email for login and notifications
                </Form.Text>
              )}
            </Form.Group>
          </Col>

          {/* First Name */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="employee_first_name">
                First Name *
              </Form.Label>
              <Form.Control
                id="employee_first_name"
                type="text"
                name="employee_first_name"
                value={values.employee_first_name}
                onChange={(e) =>
                  handleChange("employee_first_name", e.target.value)
                }
                onBlur={() => handleBlur("employee_first_name")}
                placeholder="Enter first name"
                isInvalid={
                  errors.employee_first_name && touched.employee_first_name
                }
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.employee_first_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Last Name */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="employee_last_name">Last Name *</Form.Label>
              <Form.Control
                id="employee_last_name"
                type="text"
                name="employee_last_name"
                value={values.employee_last_name}
                onChange={(e) =>
                  handleChange("employee_last_name", e.target.value)
                }
                onBlur={() => handleBlur("employee_last_name")}
                placeholder="Enter last name"
                isInvalid={
                  errors.employee_last_name && touched.employee_last_name
                }
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.employee_last_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Phone */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="employee_phone">Phone Number *</Form.Label>
              <Form.Control
                id="employee_phone"
                type="text"
                name="employee_phone"
                value={values.employee_phone}
                onChange={(e) => handleChange("employee_phone", e.target.value)}
                onBlur={() => handleBlur("employee_phone")}
                placeholder="555-555-5555"
                isInvalid={errors.employee_phone && touched.employee_phone}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.employee_phone}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Role */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="company_role_id">Role *</Form.Label>
              <Form.Select
                id="company_role_id"
                name="company_role_id"
                value={values.company_role_id}
                onChange={(e) =>
                  handleChange("company_role_id", e.target.value)
                }
                onBlur={() => handleBlur("company_role_id")}
                isInvalid={errors.company_role_id && touched.company_role_id}
                disabled={isSubmitting}
              >
                <option value="">Select Role</option>
                <option value="1">Employee</option>
                <option value="2">Manager</option>
                <option value="3">Admin</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.company_role_id}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Active Status */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="active_employee">Status</Form.Label>
              <Form.Select
                id="active_employee"
                name="active_employee"
                value={values.active_employee}
                onChange={(e) =>
                  handleChange("active_employee", parseInt(e.target.value))
                }
                disabled={isSubmitting}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Password */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="employee_password" className="fw-medium">
                Password{" "}
                {mode === "create" ? "*" : "(leave blank to keep current)"}
              </Form.Label>
              <Form.Control
                id="employee_password"
                type="password"
                name="employee_password"
                value={values.employee_password}
                onChange={(e) =>
                  handleChange("employee_password", e.target.value)
                }
                onBlur={() => handleBlur("employee_password")}
                placeholder={
                  mode === "create"
                    ? "Enter password"
                    : "Enter new password (optional)"
                }
                isInvalid={
                  errors.employee_password && touched.employee_password
                }
                isValid={
                  touched.employee_password &&
                  !errors.employee_password &&
                  values.employee_password &&
                  values.employee_password.length >= 6
                }
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                <i className="fas fa-exclamation-circle me-1"></i>
                {errors.employee_password}
              </Form.Control.Feedback>
              <Form.Control.Feedback type="valid">
                <i className="fas fa-check-circle me-1"></i>
                Password meets requirements!
              </Form.Control.Feedback>
              {mode === "create" && !touched.employee_password && (
                <Form.Text className="text-muted">
                  Password must be at least 6 characters with uppercase,
                  lowercase, and number
                </Form.Text>
              )}
              {mode === "edit" && !touched.employee_password && (
                <Form.Text className="text-muted">
                  Leave blank to keep current password unchanged
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Form Actions */}
        {showActions && (
          <div className="d-flex gap-2 mt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {mode === "create" ? "Adding..." : "Updating..."}
                </>
              ) : success ? (
                "Success!"
              ) : mode === "create" ? (
                "Add Employee"
              ) : (
                "Update Employee"
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default EmployeeForm;
