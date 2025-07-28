// Enhanced validation utilities for forms
import {
  VALIDATION_MESSAGES,
  FIELD_NAMES,
  VALIDATION_PATTERNS,
} from "./validationConstants.js";

// Individual validation functions
export const validateEmail = (email) => {
  if (!email) return VALIDATION_MESSAGES.EMAIL_REQUIRED;
  if (!VALIDATION_PATTERNS.EMAIL.test(email))
    return VALIDATION_MESSAGES.EMAIL_INVALID;
  return "";
};

export const validateName = (name, fieldName = FIELD_NAMES.FIRST_NAME) => {
  if (!name || name.trim().length === 0)
    return VALIDATION_MESSAGES.NAME_REQUIRED(fieldName);
  if (name.trim().length < 2)
    return VALIDATION_MESSAGES.NAME_TOO_SHORT(fieldName);
  if (name.trim().length > 50)
    return VALIDATION_MESSAGES.NAME_TOO_LONG(fieldName);
  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return VALIDATION_MESSAGES.PHONE_REQUIRED;
  if (!VALIDATION_PATTERNS.PHONE.test(phone))
    return VALIDATION_MESSAGES.PHONE_INVALID;
  return "";
};

export const validatePassword = (password) => {
  if (!password) return VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  if (password.length < 6) return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > 100) return VALIDATION_MESSAGES.PASSWORD_TOO_LONG;
  if (!VALIDATION_PATTERNS.PASSWORD_LOWERCASE.test(password))
    return VALIDATION_MESSAGES.PASSWORD_LOWERCASE;
  if (!VALIDATION_PATTERNS.PASSWORD_UPPERCASE.test(password))
    return VALIDATION_MESSAGES.PASSWORD_UPPERCASE;
  if (!VALIDATION_PATTERNS.PASSWORD_NUMBER.test(password))
    return VALIDATION_MESSAGES.PASSWORD_NUMBER;
  return "";
};

export const validateRequired = (value, fieldName) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim().length === 0)
  ) {
    return VALIDATION_MESSAGES.REQUIRED(fieldName);
  }
  return "";
};

// Comprehensive ValidationRules object with common validation functions
export const ValidationRules = {
  // Basic validation rules
  required: (fieldName) => (value) => validateRequired(value, fieldName),
  email: () => (value) => validateEmail(value),
  phone: () => (value) => validatePhone(value),
  password: () => (value) => validatePassword(value),

  // Name validation rules
  firstName: () => (value) => validateName(value, FIELD_NAMES.FIRST_NAME),
  lastName: () => (value) => validateName(value, FIELD_NAMES.LAST_NAME),
  name: (fieldName) => (value) => validateName(value, fieldName),

  // Length validation rules
  minLength: (min, fieldName) => (value) => {
    if (!value) return "";
    if (value.length < min)
      return `${fieldName} must be at least ${min} characters`;
    return "";
  },

  maxLength: (max, fieldName) => (value) => {
    if (!value) return "";
    if (value.length > max)
      return `${fieldName} must be less than ${max} characters`;
    return "";
  },

  // Pattern validation rules
  pattern: (pattern, message) => (value) => {
    if (!value) return "";
    if (!pattern.test(value)) return message;
    return "";
  },

  // Number validation rules
  number: (fieldName) => (value) => {
    if (!value) return "";
    if (isNaN(value)) return `${fieldName} must be a valid number`;
    return "";
  },

  // Role validation for employees
  employeeRole: () => (value) => {
    if (!value) return VALIDATION_MESSAGES.REQUIRED(FIELD_NAMES.EMPLOYEE_ROLE);
    const roleNum = parseInt(value);
    if (![1, 2, 3].includes(roleNum))
      return "Please select a valid employee role";
    return "";
  },

  // Optional password validation (for edit forms)
  optionalPassword: () => (value) => {
    if (!value || value.trim() === "") return ""; // Empty is valid for optional
    return validatePassword(value); // If provided, must be valid
  },
};

// Real-time validation hook
import { useState, useCallback } from "react";

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value) => {
      if (validationRules[name]) {
        return validationRules[name](value);
      }
      return "";
    },
    [validationRules]
  );

  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Real-time validation for touched fields that have validation rules
      if (touched[name] && validationRules[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField, validationRules]
  );

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validationRules[name]) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [values, validateField, validationRules]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    return isValid;
  }, [values, validationRules, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid:
      Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
  };
};
