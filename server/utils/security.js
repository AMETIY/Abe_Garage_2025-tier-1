import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Password validation rules
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
};

// Token configuration
export const TOKEN_CONFIG = {
  accessTokenExpiry: "1h", // Reduced from 24h for better security
  refreshTokenExpiry: "7d",
  refreshTokenLength: 64,
};

// Password validation function
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_POLICY.minLength} characters long`
    );
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(
      `Password must be no more than ${PASSWORD_POLICY.maxLength} characters long`
    );
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    PASSWORD_POLICY.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate secure password hash
export const hashPassword = async (password) => {
  const saltRounds = 12; // Increased from default for better security
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate access token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_CONFIG.accessTokenExpiry,
    issuer: "abe-garage",
    audience: "abe-garage-users",
  });
};

// Generate refresh token
export const generateRefreshToken = () => {
  return crypto.randomBytes(TOKEN_CONFIG.refreshTokenLength).toString("hex");
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "abe-garage",
      audience: "abe-garage-users",
    });
  } catch (error) {
    throw error;
  }
};

// Security headers configuration
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    error: {
      type: "RATE_LIMIT",
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429,
      severity: "medium",
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Authentication rate limiting
export const AUTH_RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 authentication attempts per windowMs
  message: {
    status: "error",
    error: {
      type: "RATE_LIMIT",
      message: "Too many authentication attempts, please try again later.",
      statusCode: 429,
      severity: "high",
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Session management
export const SESSION_CONFIG = {
  maxSessionsPerUser: 5,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
};

// Audit logging levels
export const AUDIT_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Audit log entry
export const createAuditLog = (
  action,
  userId,
  details,
  level = AUDIT_LEVELS.MEDIUM
) => {
  return {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    level,
    ip: null, // Will be set by middleware
    userAgent: null, // Will be set by middleware
  };
};
