import { asyncHandler } from "./errorHandler.middleware.js";
import ApiError from "../utils/ApiError.js";
import * as employeeService from "../services/employee.service.js";
import crypto from "crypto";
import {
  verifyAccessToken,
  generateAccessToken,
  generateRefreshToken,
  createAuditLog,
  AUDIT_LEVELS,
} from "../utils/security.js";

// In-memory session store (in production, use Redis or database)
const sessions = new Map();
const refreshTokens = new Map();

// Clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
      refreshTokens.delete(session.refreshToken);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes

// Enhanced token verification with session management
export const verifyTokenEnhanced = asyncHandler(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  const sessionId = req.headers["x-session-id"];

  if (!token) {
    throw ApiError.authentication("No token provided");
  }

  try {
    const decoded = verifyAccessToken(token);

    // Check if session exists and is valid
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      if (session.userId !== decoded.employee_id) {
        throw ApiError.authentication("Session mismatch");
      }
      if (Date.now() > session.expiresAt) {
        sessions.delete(sessionId);
        refreshTokens.delete(session.refreshToken);
        throw ApiError.authentication("Session expired");
      }
    }

    req.employee_email = decoded.employee_email;
    req.employee_id = decoded.employee_id;
    req.employee_role = decoded.employee_role;
    req.session_id = sessionId;

    // Audit log for successful authentication
    const auditLog = createAuditLog(
      "AUTH_SUCCESS",
      decoded.employee_id,
      { endpoint: req.path, method: req.method },
      AUDIT_LEVELS.MEDIUM
    );
    auditLog.ip = req.ip;
    auditLog.userAgent = req.get("User-Agent");
    console.log("🔐 AUDIT:", auditLog);

    next();
  } catch (error) {
    // Audit log for failed authentication
    const auditLog = createAuditLog(
      "AUTH_FAILURE",
      null,
      {
        endpoint: req.path,
        method: req.method,
        error: error.message,
      },
      AUDIT_LEVELS.HIGH
    );
    auditLog.ip = req.ip;
    auditLog.userAgent = req.get("User-Agent");
    console.log("🚨 AUDIT:", auditLog);

    if (error.name === "TokenExpiredError") {
      throw ApiError.authentication("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw ApiError.authentication("Invalid token");
    } else {
      throw error;
    }
  }
});

// Enhanced login with session management
export const loginWithSession = asyncHandler(async (req, res) => {
  const { employee_email, employee_password } = req.body;

  // Validate input
  if (!employee_email || !employee_password) {
    throw ApiError.validation("Email and password are required");
  }

  try {
    // Verify credentials
    const employee = await employeeService.getEmployeeByEmail(employee_email);

    if (!employee || employee.length === 0) {
      throw ApiError.authentication("Invalid credentials");
    }

    const employeeData = employee[0];

    // Debug: Log available fields
    console.log(
      "🔍 DEBUG: Available employee fields:",
      Object.keys(employeeData)
    );
    console.log("🔍 DEBUG: Password field check:", {
      employee_password: employeeData.employee_password,
      employee_password_hashed: employeeData.employee_password_hashed,
    });

    // Verify password (assuming password is hashed in database)
    const isValidPassword = await employeeService.verifyPassword(
      employee_password,
      employeeData.employee_password_hashed || employeeData.employee_password
    );

    if (!isValidPassword) {
      throw ApiError.authentication("Invalid credentials");
    }

    // Check if user has too many active sessions
    const userSessions = Array.from(sessions.values()).filter(
      (session) => session.userId === employeeData.employee_id
    );

    if (userSessions.length >= 5) {
      // Remove oldest session
      const oldestSession = userSessions.sort(
        (a, b) => a.createdAt - b.createdAt
      )[0];
      sessions.delete(oldestSession.sessionId);
      refreshTokens.delete(oldestSession.refreshToken);
    }

    // Generate tokens
    const payload = {
      employee_id: employeeData.employee_id,
      employee_email: employeeData.employee_email,
      employee_role: employeeData.company_role_id,
      employee_first_name: employeeData.employee_first_name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();
    const sessionId = crypto.randomBytes(32).toString("hex");

    // Create session
    const session = {
      sessionId,
      userId: employeeData.employee_id,
      refreshToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      lastActivity: Date.now(),
    };

    sessions.set(sessionId, session);
    refreshTokens.set(refreshToken, sessionId);

    // Audit log for successful login
    const auditLog = createAuditLog(
      "LOGIN_SUCCESS",
      employeeData.employee_id,
      { email: employee_email },
      AUDIT_LEVELS.MEDIUM
    );
    auditLog.ip = req.ip;
    auditLog.userAgent = req.get("User-Agent");
    console.log("🔐 AUDIT:", auditLog);

    res.status(200).json({
      status: "success",
      message: "Employee logged in successfully",
      data: {
        employee_token: accessToken,
        refresh_token: refreshToken,
        session_id: sessionId,
        expires_in: 3600, // 1 hour
      },
    });
  } catch (error) {
    // Audit log for failed login
    const auditLog = createAuditLog(
      "LOGIN_FAILURE",
      null,
      {
        email: employee_email,
        error: error.message,
      },
      AUDIT_LEVELS.HIGH
    );
    auditLog.ip = req.ip;
    auditLog.userAgent = req.get("User-Agent");
    console.log("🚨 AUDIT:", auditLog);

    throw error;
  }
});

// Refresh token endpoint
export const refreshToken = asyncHandler(async (req, res) => {
  const { refresh_token, session_id } = req.body;

  if (!refresh_token || !session_id) {
    throw ApiError.validation("Refresh token and session ID are required");
  }

  try {
    // Verify refresh token
    const sessionId = refreshTokens.get(refresh_token);
    if (!sessionId || sessionId !== session_id) {
      throw ApiError.authentication("Invalid refresh token");
    }

    const session = sessions.get(session_id);
    if (!session) {
      throw ApiError.authentication("Session not found");
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(session_id);
      refreshTokens.delete(refresh_token);
      throw ApiError.authentication("Session expired");
    }

    // Get employee data
    const employee = await employeeService.getEmployeeById(session.userId);
    if (!employee || employee.length === 0) {
      throw ApiError.authentication("Employee not found");
    }

    const employeeData = employee[0];

    // Generate new access token
    const payload = {
      employee_id: employeeData.employee_id,
      employee_email: employeeData.employee_email,
      employee_role: employeeData.company_role_id,
      employee_first_name: employeeData.employee_first_name,
    };

    const newAccessToken = generateAccessToken(payload);

    // Update session
    session.lastActivity = Date.now();
    session.expiresAt = Date.now() + 30 * 60 * 1000; // Extend session

    // Audit log for token refresh
    const auditLog = createAuditLog(
      "TOKEN_REFRESH",
      employeeData.employee_id,
      { session_id },
      AUDIT_LEVELS.LOW
    );
    auditLog.ip = req.ip;
    auditLog.userAgent = req.get("User-Agent");
    console.log("🔄 AUDIT:", auditLog);

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: {
        employee_token: newAccessToken,
        expires_in: 3600, // 1 hour
      },
    });
  } catch (error) {
    throw error;
  }
});

// Logout endpoint
export const logout = asyncHandler(async (req, res) => {
  const sessionId = req.headers["x-session-id"];
  const refreshToken = req.headers["x-refresh-token"];

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);

    // Audit log for logout
    const auditLog = createAuditLog(
      "LOGOUT",
      session.userId,
      { session_id: sessionId },
      AUDIT_LEVELS.MEDIUM
    );
    auditLog.ip = req.ip;
    auditLog.userAgent = req.get("User-Agent");
    console.log("🚪 AUDIT:", auditLog);

    // Clean up session
    sessions.delete(sessionId);
    if (session.refreshToken) {
      refreshTokens.delete(session.refreshToken);
    }
  }

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// Enhanced role-based access control
export const hasRoleEnhanced = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const employee_email = req.employee_email;
    const employee_id = req.employee_id;

    if (!employee_email || !employee_id) {
      throw ApiError.authentication("Employee information not found in token");
    }

    try {
      const employee = await employeeService.getEmployeeByEmail(employee_email);

      if (!employee || employee.length === 0) {
        throw ApiError.authentication("Employee not found");
      }

      const userRole = employee[0].company_role_id;

      if (allowedRoles.includes(userRole)) {
        req.employee_role = userRole;

        // Audit log for role-based access
        const auditLog = createAuditLog(
          "ROLE_ACCESS",
          employee_id,
          {
            required_roles: allowedRoles,
            user_role: userRole,
            endpoint: req.path,
            method: req.method,
          },
          AUDIT_LEVELS.MEDIUM
        );
        auditLog.ip = req.ip;
        auditLog.userAgent = req.get("User-Agent");
        console.log("🔐 AUDIT:", auditLog);

        next();
      } else {
        // Audit log for access denied
        const auditLog = createAuditLog(
          "ACCESS_DENIED",
          employee_id,
          {
            required_roles: allowedRoles,
            user_role: userRole,
            endpoint: req.path,
            method: req.method,
          },
          AUDIT_LEVELS.HIGH
        );
        auditLog.ip = req.ip;
        auditLog.userAgent = req.get("User-Agent");
        console.log("🚨 AUDIT:", auditLog);

        throw ApiError.authorization(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.database("Failed to verify role");
    }
  });
};

// Export aliases for backward compatibility
export const verifyToken = verifyTokenEnhanced;
export const hasRole = hasRoleEnhanced;

// All functions are exported as named exports above
