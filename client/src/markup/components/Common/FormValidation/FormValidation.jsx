import React, { useState, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";
import "./FormValidation.css";

/**
 * FormValidation - A comprehensive form validation component system
 *
 * @param {object} schema - Validation schema for form fields
 * @param {object} initialValues - Initial form values
 * @param {function} onSubmit - Callback when form is submitted with valid data
 * @param {function} onValidationChange - Callback when validation state changes
 * @param {boolean} validateOnChange - Whether to validate on field change
 * @param {boolean} validateOnBlur - Whether to validate on field blur
 * @param {boolean} showErrorSummary - Whether to show error summary at top
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Form fields as children
 */
const FormValidation = ({
  schema = {},
  initialValues = {},
  onSubmit,
  onValidationChange,
  validateOnChange = true,
  validateOnBlur = true,
  showErrorSummary = false,
  className = "",
  children,
  ...props
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules engine
  const validateField = (fieldName, value, rules) => {
    const fieldErrors = [];

    if (
      rules.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      fieldErrors.push(`${rules.label || fieldName} is required`);
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(
        `${rules.label || fieldName} must be at least ${
          rules.minLength
        } characters`
      );
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      fieldErrors.push(
        `${rules.label || fieldName} must not exceed ${
          rules.maxLength
        } characters`
      );
    }

    if (value && rules.min && parseFloat(value) < rules.min) {
      fieldErrors.push(
        `${rules.label || fieldName} must be at least ${rules.min}`
      );
    }

    if (value && rules.max && parseFloat(value) > rules.max) {
      fieldErrors.push(
        `${rules.label || fieldName} must not exceed ${rules.max}`
      );
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      fieldErrors.push(
        rules.patternMessage || `${rules.label || fieldName} format is invalid`
      );
    }

    if (value && rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldErrors.push(
        `${rules.label || fieldName} must be a valid email address`
      );
    }

    if (
      value &&
      rules.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ""))
    ) {
      fieldErrors.push(
        `${rules.label || fieldName} must be a valid phone number`
      );
    }

    if (rules.custom && typeof rules.custom === "function") {
      const customError = rules.custom(value, values);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    return fieldErrors;
  };

  // Validate all fields
  const validateForm = (formValues = values) => {
    const newErrors = {};

    Object.keys(schema).forEach((fieldName) => {
      const fieldErrors = validateField(
        fieldName,
        formValues[fieldName],
        schema[fieldName]
      );
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
      }
    });

    return newErrors;
  };

  // Handle field value change
  const handleFieldChange = (fieldName, value) => {
    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);

    if (validateOnChange) {
      const fieldErrors = validateField(
        fieldName,
        value,
        schema[fieldName] || {}
      );
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldErrors.length > 0 ? fieldErrors : undefined,
      }));
      // Mark field as touched when validating on change
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const fieldErrors = validateField(
        fieldName,
        values[fieldName],
        schema[fieldName] || {}
      );
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldErrors.length > 0 ? fieldErrors : undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(schema).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate entire form
    const formErrors = validateForm();
    setErrors(formErrors);

    const isValid = Object.keys(formErrors).length === 0;

    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }

    setIsSubmitting(false);
  };

  // Update validation state callback
  useEffect(() => {
    if (onValidationChange) {
      const isValid = Object.keys(errors).length === 0;
      onValidationChange({ isValid, errors, values });
    }
  }, [errors, values, onValidationChange]);

  // Get field props for child components
  const getFieldProps = (fieldName) => ({
    value: values[fieldName] || "",
    onChange: (e) => handleFieldChange(fieldName, e.target.value),
    onBlur: () => handleFieldBlur(fieldName),
    isInvalid:
      touched[fieldName] && errors[fieldName] && errors[fieldName].length > 0,
    "aria-describedby": errors[fieldName] ? `${fieldName}-error` : undefined,
  });

  // Get error message for field
  const getFieldError = (fieldName) => {
    if (
      touched[fieldName] &&
      errors[fieldName] &&
      errors[fieldName].length > 0
    ) {
      return errors[fieldName][0]; // Return first error
    }
    return null;
  };

  // Get all errors for summary
  const getAllErrors = () => {
    const allErrors = [];
    Object.keys(errors).forEach((fieldName) => {
      if (errors[fieldName] && errors[fieldName].length > 0) {
        allErrors.push(...errors[fieldName]);
      }
    });
    return allErrors;
  };

  const allErrors = getAllErrors();

  return (
    <Form
      onSubmit={handleSubmit}
      className={`form-validation ${className}`}
      noValidate
      {...props}
    >
      {/* Error Summary */}
      {showErrorSummary && allErrors.length > 0 && (
        <Alert variant="danger" className="error-summary" role="alert">
          <Alert.Heading>Please correct the following errors:</Alert.Heading>
          <ul className="mb-0">
            {allErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Render children with enhanced props */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props.name) {
          const fieldName = child.props.name;
          const fieldError = getFieldError(fieldName);

          return (
            <div className="form-field-wrapper">
              {React.cloneElement(child, {
                ...getFieldProps(fieldName),
                ...child.props, // Allow child props to override
              })}
              {fieldError && (
                <Form.Control.Feedback
                  type="invalid"
                  id={`${fieldName}-error`}
                  className="d-block"
                  role="alert"
                  aria-live="polite"
                >
                  {fieldError}
                </Form.Control.Feedback>
              )}
            </div>
          );
        }
        return child;
      })}
    </Form>
  );
};

// Helper component for form fields
export const FormField = ({
  name,
  label,
  type = "text",
  required = false,
  helpText,
  className = "",
  ...props
}) => {
  return (
    <Form.Group className={`mb-3 ${className}`}>
      {label && (
        <Form.Label htmlFor={name}>
          {label}
          {required && (
            <span className="text-danger ms-1" aria-label="required">
              *
            </span>
          )}
        </Form.Label>
      )}
      <Form.Control id={name} name={name} type={type} {...props} />
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

export default FormValidation;
