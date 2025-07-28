/**
 * Centralized Error Handler for Frontend
 * Provides consistent error handling and user-friendly message mapping
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: "NETWORK",
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  SERVER: "SERVER",
  CLIENT: "CLIENT",
  UNKNOWN: "UNKNOWN",
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

/**
 * Main ErrorHandler class for centralized error management
 */
class ErrorHandler {
  /**
   * Handle API errors and return user-friendly messages
   * @param {Error|Object} error - The error object
   * @param {Object} context - Additional context for error handling
   * @returns {Object} Formatted error object with user-friendly message
   */
  static handleApiError(error, context = {}) {
    console.error("API Error:", error, "Context:", context);

    const errorInfo = this.categorizeError(error);
    const userMessage = this.getUserFriendlyMessage(errorInfo);

    return {
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: userMessage,
      originalError: error,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Categorize error based on status code and error properties
   * @param {Error|Object} error - The error object
   * @returns {Object} Error categorization info
   */
  static categorizeError(error) {
    // Handle fetch response errors
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode;

      switch (status) {
        case 400:
          return {
            type: ERROR_TYPES.VALIDATION,
            severity: ERROR_SEVERITY.MEDIUM,
          };
        case 401:
          return {
            type: ERROR_TYPES.AUTHENTICATION,
            severity: ERROR_SEVERITY.HIGH,
          };
        case 403:
          return {
            type: ERROR_TYPES.AUTHORIZATION,
            severity: ERROR_SEVERITY.HIGH,
          };
        case 404:
          return { type: ERROR_TYPES.CLIENT, severity: ERROR_SEVERITY.MEDIUM };
        case 422:
          return {
            type: ERROR_TYPES.VALIDATION,
            severity: ERROR_SEVERITY.MEDIUM,
          };
        case 429:
          return { type: ERROR_TYPES.CLIENT, severity: ERROR_SEVERITY.MEDIUM };
        case 500:
        case 502:
        case 503:
        case 504:
          return { type: ERROR_TYPES.SERVER, severity: ERROR_SEVERITY.HIGH };
        default:
          return { type: ERROR_TYPES.UNKNOWN, severity: ERROR_SEVERITY.MEDIUM };
      }
    }

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return { type: ERROR_TYPES.NETWORK, severity: ERROR_SEVERITY.HIGH };
    }

    // Handle validation errors
    if (error.name === "ValidationError" || error.type === "validation") {
      return { type: ERROR_TYPES.VALIDATION, severity: ERROR_SEVERITY.MEDIUM };
    }

    // Default categorization
    return { type: ERROR_TYPES.UNKNOWN, severity: ERROR_SEVERITY.MEDIUM };
  }

  /**
   * Get user-friendly error message based on error type and status
   * @param {Object} errorInfo - Categorized error information
   * @returns {string} User-friendly error message
   */
  static getUserFriendlyMessage(errorInfo) {
    const { type, severity } = errorInfo;

    switch (type) {
      case ERROR_TYPES.AUTHENTICATION:
        return "Your session has expired. Please log in again to continue.";

      case ERROR_TYPES.AUTHORIZATION:
        return "You don't have permission to perform this action. Please contact your administrator.";

      case ERROR_TYPES.VALIDATION:
        return "Please check your input and try again. Some fields may contain invalid data.";

      case ERROR_TYPES.NETWORK:
        return "Unable to connect to the server. Please check your internet connection and try again.";

      case ERROR_TYPES.SERVER:
        if (severity === ERROR_SEVERITY.CRITICAL) {
          return "The server is currently unavailable. Please try again later or contact support.";
        }
        return "A server error occurred. Please try again in a few moments.";

      case ERROR_TYPES.CLIENT:
        return "The requested resource could not be found. Please refresh the page and try again.";

      default:
        return "An unexpected error occurred. Please try again or contact support if the problem persists.";
    }
  }

  /**
   * Handle form validation errors
   * @param {Object} validationErrors - Object containing field validation errors
   * @returns {Object} Formatted validation error object
   */
  static handleValidationErrors(validationErrors) {
    const formattedErrors = {};

    Object.keys(validationErrors).forEach((field) => {
      const error = validationErrors[field];
      formattedErrors[field] = {
        message: error.message || error,
        type: ERROR_TYPES.VALIDATION,
        severity: ERROR_SEVERITY.MEDIUM,
      };
    });

    return {
      type: ERROR_TYPES.VALIDATION,
      severity: ERROR_SEVERITY.MEDIUM,
      fields: formattedErrors,
      message: "Please correct the highlighted fields and try again.",
    };
  }

  /**
   * Log error for debugging and monitoring
   * @param {Object} errorInfo - Formatted error information
   * @param {Object} additionalContext - Additional context for logging
   */
  static logError(errorInfo, additionalContext = {}) {
    const logData = {
      ...errorInfo,
      ...additionalContext,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // In development, log to console
    if (import.meta.env.DEV) {
      console.group("🚨 Error Log");
      console.error("Error Info:", logData);
      console.groupEnd();
    }

    // In production, you might want to send to an error tracking service
    // Example: sendToErrorTrackingService(logData);
  }

  /**
   * Create a standardized error response for components
   * @param {string} message - Error message
   * @param {string} type - Error type
   * @param {string} severity - Error severity
   * @returns {Object} Standardized error object
   */
  static createError(
    message,
    type = ERROR_TYPES.UNKNOWN,
    severity = ERROR_SEVERITY.MEDIUM
  ) {
    return {
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}

export default ErrorHandler;
