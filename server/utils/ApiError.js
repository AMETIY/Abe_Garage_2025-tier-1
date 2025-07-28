/**
 * Standardized API Error Class for Backend
 * Provides consistent error handling and response formatting
 */

// Error types for categorization
export const ERROR_TYPES = {
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  DATABASE: "DATABASE",
  EXTERNAL_SERVICE: "EXTERNAL_SERVICE",
  INTERNAL: "INTERNAL",
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

/**
 * Custom API Error class extending the built-in Error class
 */
class ApiError extends Error {
  /**
   * Create an API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} type - Error type from ERROR_TYPES
   * @param {string} severity - Error severity from ERROR_SEVERITY
   * @param {boolean} isOperational - Whether the error is operational (expected)
   * @param {Object} details - Additional error details
   */
  constructor(
    statusCode = 500,
    message = "Internal Server Error",
    type = ERROR_TYPES.INTERNAL,
    severity = ERROR_SEVERITY.MEDIUM,
    isOperational = true,
    details = {}
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.type = type;
    this.severity = severity;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   * @param {boolean} includeStack - Whether to include stack trace
   * @returns {Object} JSON response object
   */
  toJSON(includeStack = false) {
    const response = {
      status: "error",
      error: {
        type: this.type,
        message: this.message,
        statusCode: this.statusCode,
        severity: this.severity,
        timestamp: this.timestamp,
      },
    };

    // Include additional details if present
    if (Object.keys(this.details).length > 0) {
      response.error.details = this.details;
    }

    // Include stack trace in development
    if (includeStack && this.stack) {
      response.error.stack = this.stack;
    }

    return response;
  }

  // Static factory methods for common error types

  /**
   * Create a validation error
   * @param {string} message - Error message
   * @param {Object} details - Validation details
   * @returns {ApiError} Validation error instance
   */
  static validation(message = "Validation failed", details = {}) {
    return new ApiError(
      400,
      message,
      ERROR_TYPES.VALIDATION,
      ERROR_SEVERITY.MEDIUM,
      true,
      details
    );
  }

  /**
   * Create an authentication error
   * @param {string} message - Error message
   * @returns {ApiError} Authentication error instance
   */
  static authentication(message = "Authentication failed") {
    return new ApiError(
      401,
      message,
      ERROR_TYPES.AUTHENTICATION,
      ERROR_SEVERITY.HIGH,
      true
    );
  }

  /**
   * Create an authorization error
   * @param {string} message - Error message
   * @returns {ApiError} Authorization error instance
   */
  static authorization(message = "Access denied") {
    return new ApiError(
      403,
      message,
      ERROR_TYPES.AUTHORIZATION,
      ERROR_SEVERITY.HIGH,
      true
    );
  }

  /**
   * Create a not found error
   * @param {string} resource - Resource that was not found
   * @returns {ApiError} Not found error instance
   */
  static notFound(resource = "Resource") {
    return new ApiError(
      404,
      `${resource} not found`,
      ERROR_TYPES.NOT_FOUND,
      ERROR_SEVERITY.MEDIUM,
      true
    );
  }

  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @param {Object} details - Conflict details
   * @returns {ApiError} Conflict error instance
   */
  static conflict(message = "Resource conflict", details = {}) {
    return new ApiError(
      409,
      message,
      ERROR_TYPES.CONFLICT,
      ERROR_SEVERITY.MEDIUM,
      true,
      details
    );
  }

  /**
   * Create a database error
   * @param {string} message - Error message
   * @param {Object} details - Database error details
   * @returns {ApiError} Database error instance
   */
  static database(message = "Database operation failed", details = {}) {
    return new ApiError(
      500,
      message,
      ERROR_TYPES.DATABASE,
      ERROR_SEVERITY.HIGH,
      true,
      details
    );
  }

  /**
   * Create an internal server error
   * @param {string} message - Error message
   * @param {Object} details - Error details
   * @returns {ApiError} Internal server error instance
   */
  static internal(message = "Internal server error", details = {}) {
    return new ApiError(
      500,
      message,
      ERROR_TYPES.INTERNAL,
      ERROR_SEVERITY.HIGH,
      false,
      details
    );
  }

  /**
   * Create an external service error
   * @param {string} service - Service name
   * @param {string} message - Error message
   * @returns {ApiError} External service error instance
   */
  static externalService(service, message = "External service unavailable") {
    return new ApiError(
      503,
      `${service}: ${message}`,
      ERROR_TYPES.EXTERNAL_SERVICE,
      ERROR_SEVERITY.HIGH,
      true,
      { service }
    );
  }

  /**
   * Create error from existing error object
   * @param {Error} error - Original error
   * @param {number} statusCode - HTTP status code
   * @param {string} type - Error type
   * @returns {ApiError} API error instance
   */
  static fromError(error, statusCode = 500, type = ERROR_TYPES.INTERNAL) {
    const apiError = new ApiError(
      statusCode,
      error.message || "An error occurred",
      type,
      ERROR_SEVERITY.HIGH,
      false,
      { originalError: error.name }
    );

    // Preserve original stack trace
    apiError.stack = error.stack;
    return apiError;
  }
}

export default ApiError;
