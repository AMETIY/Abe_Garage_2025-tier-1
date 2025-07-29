/**
 * Validation Middleware
 * Provides structured request data validation with consistent error formatting
 */

import ApiError from "../utils/ApiError.js";

/**
 * Enhanced sanitization function
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
export const sanitizeData = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Remove null bytes and other dangerous characters
    const sanitized = data
      .replace(/\0/g, "") // Remove null bytes
      .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
      .trim();

    // Check for boolean strings
    if (sanitized === "true") {
      return true;
    } else if (sanitized === "false") {
      return false;
    } else if (!isNaN(sanitized) && sanitized !== "" && sanitized !== null) {
      // Convert numeric strings to numbers
      return Number(sanitized);
    } else {
      // Keep as trimmed string
      return sanitized;
    }
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize key names to prevent prototype pollution
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, "");
      sanitized[sanitizedKey] = sanitizeData(value);
    }
    return sanitized;
  }

  return data;
};

/**
 * Validation rules for different data types
 */
export const ValidationRules = {
  // String validation
  string: {
    required: (value, fieldName) => {
      if (!value || typeof value !== "string" || value.trim().length === 0) {
        return `${fieldName} is required and must be a non-empty string`;
      }
      return null;
    },
    minLength: (min) => (value, fieldName) => {
      if (value && value.length < min) {
        return `${fieldName} must be at least ${min} characters long`;
      }
      return null;
    },
    maxLength: (max) => (value, fieldName) => {
      if (value && value.length > max) {
        return `${fieldName} must be no more than ${max} characters long`;
      }
      return null;
    },
    pattern: (regex, message) => (value, fieldName) => {
      if (value && !regex.test(value)) {
        return message || `${fieldName} format is invalid`;
      }
      return null;
    },
    // Prevent XSS in strings
    noXSS: (value, fieldName) => {
      if (
        value &&
        /<script|javascript:|on\w+\s*=|data:text\/html/i.test(value)
      ) {
        return `${fieldName} contains potentially dangerous content`;
      }
      return null;
    },
  },

  // Email validation with enhanced security
  email: (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    // Prevent email injection
    if (value.includes("\n") || value.includes("\r") || value.length > 254) {
      return `${fieldName} contains invalid characters or is too long`;
    }
    return null;
  },

  // Phone validation with enhanced security
  phone: (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },

  // Number validation
  number: {
    required: (value, fieldName) => {
      if (value === undefined || value === null || isNaN(value)) {
        return `${fieldName} is required and must be a number`;
      }
      return null;
    },
    min: (min) => (value, fieldName) => {
      if (value !== undefined && value < min) {
        return `${fieldName} must be at least ${min}`;
      }
      return null;
    },
    max: (max) => (value, fieldName) => {
      if (value !== undefined && value > max) {
        return `${fieldName} must be no more than ${max}`;
      }
      return null;
    },
    integer: (value, fieldName) => {
      if (value !== undefined && !Number.isInteger(Number(value))) {
        return `${fieldName} must be an integer`;
      }
      return null;
    },
    positive: (value, fieldName) => {
      if (value !== undefined && value <= 0) {
        return `${fieldName} must be a positive number`;
      }
      return null;
    },
  },

  // Boolean validation
  boolean: (value, fieldName) => {
    if (
      value !== undefined &&
      typeof value !== "boolean" &&
      value !== "true" &&
      value !== "false" &&
      value !== 0 &&
      value !== 1
    ) {
      return `${fieldName} must be a boolean value`;
    }
    return null;
  },

  // Array validation
  array: {
    required: (value, fieldName) => {
      if (!Array.isArray(value) || value.length === 0) {
        return `${fieldName} is required and must be a non-empty array`;
      }
      return null;
    },
    minLength: (min) => (value, fieldName) => {
      if (Array.isArray(value) && value.length < min) {
        return `${fieldName} must contain at least ${min} items`;
      }
      return null;
    },
    maxLength: (max) => (value, fieldName) => {
      if (Array.isArray(value) && value.length > max) {
        return `${fieldName} must contain no more than ${max} items`;
      }
      return null;
    },
  },

  // Password validation with security requirements
  password: (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    if (typeof value !== "string") return `${fieldName} must be a string`;
    if (value.length < 8)
      return `${fieldName} must be at least 8 characters long`;
    if (value.length > 128)
      return `${fieldName} must be less than 128 characters`;
    if (!/[a-z]/.test(value))
      return `${fieldName} must contain at least one lowercase letter`;
    if (!/[A-Z]/.test(value))
      return `${fieldName} must contain at least one uppercase letter`;
    if (!/\d/.test(value))
      return `${fieldName} must contain at least one number`;
    return null;
  },

  // ID validation
  id: (value, fieldName) => {
    if (value === undefined || value === null) {
      return `${fieldName} is required`;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      return `${fieldName} must be a positive integer`;
    }
    return null;
  },
};

/**
 * Validate a single field against rules
 * @param {any} value - Field value
 * @param {Array|Function} rules - Validation rules
 * @param {string} fieldName - Field name for error messages
 * @returns {Array} Array of error messages
 */
export const validateField = (value, rules, fieldName) => {
  const errors = [];
  const ruleArray = Array.isArray(rules) ? rules : [rules];

  for (const rule of ruleArray) {
    if (typeof rule === "function") {
      const error = rule(value, fieldName);
      if (error) {
        errors.push(error);
      }
    }
  }

  return errors;
};

/**
 * Validate request data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export const validateData = (data, schema) => {
  const errors = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[fieldName], rules, fieldName);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Create validation middleware for request body
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    // Sanitize data first
    req.body = sanitizeData(req.body);

    const { isValid, errors } = validateData(req.body, schema);

    if (!isValid) {
      const validationError = ApiError.validation("Request validation failed", {
        fields: errors,
      });
      return next(validationError);
    }

    next();
  };
};

/**
 * Create validation middleware for query parameters
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    // Sanitize data first
    req.query = sanitizeData(req.query);

    const { isValid, errors } = validateData(req.query, schema);

    if (!isValid) {
      const validationError = ApiError.validation(
        "Query parameter validation failed",
        {
          fields: errors,
        }
      );
      return next(validationError);
    }

    next();
  };
};

/**
 * Create validation middleware for URL parameters
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    // Sanitize data first
    req.params = sanitizeData(req.params);

    const { isValid, errors } = validateData(req.params, schema);

    if (!isValid) {
      const validationError = ApiError.validation(
        "URL parameter validation failed",
        {
          fields: errors,
        }
      );
      return next(validationError);
    }

    next();
  };
};

/**
 * Sanitization middleware for request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeData(req.body);
  }
  next();
};

/**
 * Sanitization middleware for query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeData(req.query);
  }
  next();
};

/**
 * Combined sanitization and validation middleware
 * @param {Object} bodySchema - Body validation schema
 * @param {Object} querySchema - Query validation schema
 * @param {Object} paramsSchema - Params validation schema
 * @returns {Function} Express middleware
 */
export const validateAndSanitize = (
  bodySchema = null,
  querySchema = null,
  paramsSchema = null
) => {
  return (req, res, next) => {
    // Sanitize data first
    if (req.body) req.body = sanitizeData(req.body);
    if (req.query) req.query = sanitizeData(req.query);
    if (req.params) req.params = sanitizeData(req.params);

    const errors = {};

    // Validate body
    if (bodySchema) {
      const bodyValidation = validateData(req.body, bodySchema);
      if (!bodyValidation.isValid) {
        errors.body = bodyValidation.errors;
      }
    }

    // Validate query
    if (querySchema) {
      const queryValidation = validateData(req.query, querySchema);
      if (!queryValidation.isValid) {
        errors.query = queryValidation.errors;
      }
    }

    // Validate params
    if (paramsSchema) {
      const paramsValidation = validateData(req.params, paramsSchema);
      if (!paramsValidation.isValid) {
        errors.params = paramsValidation.errors;
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      const validationError = ApiError.validation(
        "Request validation failed",
        errors
      );
      return next(validationError);
    }

    next();
  };
};

// Common validation schemas for reuse
export const CommonSchemas = {
  id: {
    id: [ValidationRules.id],
  },
  pagination: {
    page: [ValidationRules.number.min(1)],
    limit: [ValidationRules.number.min(1), ValidationRules.number.max(100)],
  },
  employee: {
    employee_email: [ValidationRules.email],
    employee_first_name: [
      ValidationRules.string.required,
      ValidationRules.string.minLength(2),
      ValidationRules.string.maxLength(50),
      ValidationRules.string.noXSS,
    ],
    employee_last_name: [
      ValidationRules.string.required,
      ValidationRules.string.minLength(2),
      ValidationRules.string.maxLength(50),
      ValidationRules.string.noXSS,
    ],
    employee_phone: [ValidationRules.phone],
    employee_password: [ValidationRules.password],
    active_employee: [ValidationRules.boolean],
    company_role_id: [
      ValidationRules.number.required,
      ValidationRules.number.integer,
      ValidationRules.number.min(1),
      ValidationRules.number.max(3),
    ],
  },
  customer: {
    customer_email: [ValidationRules.email],
    customer_first_name: [
      ValidationRules.string.required,
      ValidationRules.string.minLength(2),
      ValidationRules.string.maxLength(50),
      ValidationRules.string.noXSS,
    ],
    customer_last_name: [
      ValidationRules.string.required,
      ValidationRules.string.minLength(2),
      ValidationRules.string.maxLength(50),
      ValidationRules.string.noXSS,
    ],
    customer_phone_number: [ValidationRules.phone],
    active_customer_status: [ValidationRules.boolean],
  },
  service: {
    service_name: [
      ValidationRules.string.required,
      ValidationRules.string.minLength(2),
      ValidationRules.string.maxLength(100),
      ValidationRules.string.noXSS,
    ],
    service_description: [
      ValidationRules.string.maxLength(500),
      ValidationRules.string.noXSS,
    ],
  },
  login: {
    employee_email: [ValidationRules.email],
    employee_password: [ValidationRules.string.required],
  },
};
