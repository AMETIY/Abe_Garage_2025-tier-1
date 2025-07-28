import ApiError from "../utils/ApiError.js";

/**
 * Enhanced Error Handling Middleware
 * Provides centralized error handling with proper logging and response formatting
 */

/**
 * Async wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found middleware - handles 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Default error values
  let error = err;

  // Convert non-ApiError instances to ApiError
  if (!(error instanceof ApiError)) {
    // Handle specific error types
    if (error.name === "ValidationError") {
      error = ApiError.validation("Validation failed", {
        fields: error.errors || error.details,
      });
    } else if (error.name === "JsonWebTokenError") {
      error = ApiError.authentication("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      error = ApiError.authentication("Token expired");
    } else if (error.code === "ER_DUP_ENTRY") {
      error = ApiError.conflict("Duplicate entry", {
        field: extractDuplicateField(error.message),
      });
    } else if (error.code && error.code.startsWith("ER_")) {
      // MySQL errors
      error = ApiError.database("Database operation failed", {
        code: error.code,
        sqlMessage: error.sqlMessage,
      });
    } else {
      // Generic error conversion
      error = ApiError.fromError(error);
    }
  }

  // Log error details
  logError(error, req);

  // Send error response
  const includeStack = process.env.NODE_ENV === "development";
  const response = error.toJSON(includeStack);

  res.status(error.statusCode).json(response);
};

/**
 * Validation error handler for form submissions
 * @param {Array} validationErrors - Array of validation errors
 * @returns {ApiError} Formatted validation error
 */
export const handleValidationErrors = (validationErrors) => {
  const errors = {};

  validationErrors.forEach((error) => {
    const field = error.param || error.field || "unknown";
    errors[field] = error.msg || error.message || "Invalid value";
  });

  return ApiError.validation("Validation failed", { fields: errors });
};

/**
 * Database error handler
 * @param {Error} dbError - Database error
 * @returns {ApiError} Formatted database error
 */
export const handleDatabaseError = (dbError) => {
  // Handle common MySQL errors
  switch (dbError.code) {
    case "ER_DUP_ENTRY":
      return ApiError.conflict("Duplicate entry detected", {
        field: extractDuplicateField(dbError.message),
      });

    case "ER_NO_REFERENCED_ROW_2":
      return ApiError.validation("Referenced record does not exist");

    case "ER_ROW_IS_REFERENCED_2":
      return ApiError.conflict(
        "Cannot delete record - it is referenced by other records"
      );

    case "ER_DATA_TOO_LONG":
      return ApiError.validation("Data too long for field");

    case "ER_BAD_NULL_ERROR":
      return ApiError.validation("Required field cannot be null");

    case "ECONNREFUSED":
      return ApiError.database("Database connection refused");

    case "ETIMEDOUT":
      return ApiError.database("Database connection timeout");

    default:
      return ApiError.database("Database operation failed", {
        code: dbError.code,
        message: dbError.sqlMessage || dbError.message,
      });
  }
};

/**
 * Authentication error handler
 * @param {string} message - Error message
 * @param {Object} details - Additional details
 * @returns {ApiError} Authentication error
 */
export const handleAuthError = (
  message = "Authentication failed",
  details = {}
) => {
  return ApiError.authentication(message);
};

/**
 * Authorization error handler
 * @param {string} message - Error message
 * @param {Object} details - Additional details
 * @returns {ApiError} Authorization error
 */
export const handleAuthorizationError = (
  message = "Access denied",
  details = {}
) => {
  return ApiError.authorization(message);
};

/**
 * Log error with context information
 * @param {ApiError} error - Error to log
 * @param {Object} req - Express request object
 */
const logError = (error, req) => {
  const logData = {
    timestamp: error.timestamp,
    type: error.type,
    severity: error.severity,
    statusCode: error.statusCode,
    message: error.message,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    employee: req.employee_email || "anonymous",
  };

  // Include additional details if present
  if (Object.keys(error.details).length > 0) {
    logData.details = error.details;
  }

  // Log based on severity
  if (error.severity === "critical" || error.severity === "high") {
    console.error("🚨 API Error:", logData);

    // Include stack trace for high severity errors
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  } else {
    console.warn("⚠️ API Warning:", logData);
  }

  // In production, you might want to send to an error tracking service
  // Example: sendToErrorTrackingService(logData);
};

/**
 * Extract duplicate field from MySQL duplicate entry error message
 * @param {string} message - Error message
 * @returns {string} Field name
 */
const extractDuplicateField = (message) => {
  const match = message.match(/for key '(.+?)'/);
  return match ? match[1] : "unknown";
};

/**
 * Create success response helper
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Success response object
 */
export const createSuccessResponse = (
  data = null,
  message = "Success",
  statusCode = 200
) => {
  const response = {
    status: "success",
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccessResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  const response = createSuccessResponse(data, message, statusCode);
  res.status(statusCode).json(response);
};
