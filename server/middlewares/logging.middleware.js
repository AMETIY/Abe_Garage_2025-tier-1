/**
 * Logging Middleware
 * Provides request/response logging for debugging and monitoring
 */

import { performance } from "perf_hooks";

/**
 * Generate unique request ID
 * @returns {string} Unique request identifier
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  );
};

/**
 * Sanitize sensitive data from logs
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeLogData = (data) => {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = [
    "password",
    "token",
    "authorization",
    "cookie",
    "session",
    "employee_password",
    "employee_password_hashed",
    "customer_hash",
  ];

  // Create a deep copy to avoid modifying the original data
  const sanitized = JSON.parse(JSON.stringify(data));

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          obj[key] = "[REDACTED]";
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    }
  };

  sanitizeObject(sanitized);
  return sanitized;
};

/**
 * Format log message with consistent structure
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {Object} data - Additional log data
 * @returns {Object} Formatted log object
 */
const formatLogMessage = (level, message, data = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...data,
  };
};

/**
 * Request logging middleware
 * Logs incoming requests with sanitized data
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export const requestLogger = (options = {}) => {
  const {
    logBody = false,
    logQuery = true,
    logHeaders = false,
    excludePaths = ["/health", "/favicon.ico"],
    maxBodySize = 1000, // Maximum body size to log in characters
  } = options;

  return (req, res, next) => {
    // Skip logging for excluded paths
    if (excludePaths.includes(req.path)) {
      return next();
    }

    // Generate unique request ID
    req.requestId = generateRequestId();
    req.startTime = performance.now();

    // Prepare log data
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      ip: getClientIP(req),
      userAgent: req.get("User-Agent") || "unknown",
      employee: req.employee_email || "anonymous",
    };

    // Add query parameters if enabled
    if (logQuery && Object.keys(req.query).length > 0) {
      logData.query = sanitizeLogData(req.query);
    }

    // Add request body if enabled
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.length <= maxBodySize) {
        logData.body = sanitizeLogData(req.body);
      } else {
        logData.body = "[BODY TOO LARGE]";
        logData.bodySize = bodyString.length;
      }
    }

    // Add headers if enabled
    if (logHeaders) {
      logData.headers = sanitizeLogData(req.headers);
    }

    // Log the request in development only
    if (process.env.NODE_ENV === "development") {
      const logMessage = formatLogMessage("info", "Incoming Request", logData);
      console.log("📥 REQUEST:", JSON.stringify(logMessage, null, 2));
    }

    next();
  };
};

/**
 * Response logging middleware
 * Logs outgoing responses with performance metrics
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export const responseLogger = (options = {}) => {
  const { logBody = false, logHeaders = false, maxBodySize = 1000 } = options;

  return (req, res, next) => {
    // Skip if no request ID (not logged)
    if (!req.requestId) {
      return next();
    }

    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send
    res.send = function (data) {
      logResponse(req, res, data, "send");
      return originalSend.call(this, data);
    };

    // Override res.json
    res.json = function (data) {
      logResponse(req, res, data, "json");
      return originalJson.call(this, data);
    };

    function logResponse(req, res, data, method) {
      const endTime = performance.now();
      const duration = Math.round(endTime - req.startTime);

      const logData = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentType: res.get("Content-Type") || "unknown",
      };

      // Add response body if enabled
      if (logBody && data) {
        const dataString =
          typeof data === "string" ? data : JSON.stringify(data);
        if (dataString.length <= maxBodySize) {
          logData.responseBody =
            typeof data === "string" ? data : sanitizeLogData(data);
        } else {
          logData.responseBody = "[RESPONSE TOO LARGE]";
          logData.responseSize = dataString.length;
        }
      }

      // Add headers if enabled
      if (logHeaders) {
        logData.headers = res.getHeaders();
      }

      // Determine log level based on status code
      let level = "info";
      if (res.statusCode >= 400 && res.statusCode < 500) {
        level = "warn";
      } else if (res.statusCode >= 500) {
        level = "error";
      }

      // Log the response in development only
      if (process.env.NODE_ENV === "development") {
        const logMessage = formatLogMessage(
          level,
          "Outgoing Response",
          logData
        );
        const emoji = res.statusCode >= 400 ? "❌" : "✅";
        console.log(`${emoji} RESPONSE:`, JSON.stringify(logMessage, null, 2));
      }
    }

    next();
  };
};

/**
 * Error logging middleware
 * Logs errors with full context
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorLogger = (err, req, res, next) => {
  const endTime = performance.now();
  const duration = req.startTime ? Math.round(endTime - req.startTime) : 0;

  const logData = {
    requestId: req.requestId || "unknown",
    method: req.method,
    url: req.originalUrl,
    ip: getClientIP(req),
    userAgent: req.get("User-Agent") || "unknown",
    employee: req.employee_email || "anonymous",
    duration: `${duration}ms`,
    error: {
      name: err.name,
      message: err.message,
      type: err.type || "UNKNOWN",
      statusCode: err.statusCode || 500,
      severity: err.severity || "medium",
    },
  };

  // Add error details if available
  if (err.details && Object.keys(err.details).length > 0) {
    logData.error.details = sanitizeLogData(err.details);
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development" && err.stack) {
    logData.error.stack = err.stack;
  }

  // Log the error
  const logMessage = formatLogMessage("error", "Request Error", logData);
  console.error("🚨 ERROR:", JSON.stringify(logMessage, null, 2));

  next(err);
};

/**
 * Performance monitoring middleware
 * Logs slow requests for performance analysis
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export const performanceLogger = (options = {}) => {
  const {
    slowRequestThreshold = 1000, // Log requests slower than 1 second
    logAllRequests = false,
  } = options;

  return (req, res, next) => {
    if (!req.requestId) {
      return next();
    }

    const originalEnd = res.end;

    res.end = function (...args) {
      const endTime = performance.now();
      const duration = Math.round(endTime - req.startTime);

      // Log slow requests or all requests if enabled
      if (duration >= slowRequestThreshold || logAllRequests) {
        const logData = {
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          slow: duration >= slowRequestThreshold,
        };

        const level = duration >= slowRequestThreshold ? "warn" : "info";
        const emoji = duration >= slowRequestThreshold ? "🐌" : "⚡";
        const logMessage = formatLogMessage(level, "Performance Log", logData);

        // Log performance in development only
        if (process.env.NODE_ENV === "development") {
          console.log(
            `${emoji} PERFORMANCE:`,
            JSON.stringify(logMessage, null, 2)
          );
        }
      }

      return originalEnd.apply(this, args);
    };

    next();
  };
};

/**
 * Combined logging middleware
 * Applies all logging middlewares with default configuration
 * @param {Object} options - Configuration options
 * @returns {Array} Array of middleware functions
 */
export const createLoggingMiddleware = (options = {}) => {
  const {
    enableRequestLogging = true,
    enableResponseLogging = true,
    enableErrorLogging = true,
    enablePerformanceLogging = true,
    ...middlewareOptions
  } = options;

  const middlewares = [];

  if (enableRequestLogging) {
    middlewares.push(requestLogger(middlewareOptions));
  }

  if (enableResponseLogging) {
    middlewares.push(responseLogger(middlewareOptions));
  }

  if (enablePerformanceLogging) {
    middlewares.push(performanceLogger(middlewareOptions));
  }

  return middlewares;
};
