// Import the dotenv package for environment variables
import "dotenv/config";
// Import the jsonwebtoken package for JWT token verification
import jwt from "jsonwebtoken";
// Import the employee service for user role verification
import * as employeeService from "../services/employee.service.js";
// Import the enhanced error handling utilities
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "./errorHandler.middleware.js";

// A function to verify the token received from the frontend
const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    throw ApiError.authentication("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employee_email = decoded.employee_email;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw ApiError.authentication("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw ApiError.authentication("Invalid token");
    } else {
      throw ApiError.authentication("Token verification failed");
    }
  }
});

// A function to check if the user is an admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const employee_email = req.employee_email;

  if (!employee_email) {
    throw ApiError.authentication("Employee email not found in token");
  }

  try {
    const employee = await employeeService.getEmployeeByEmail(employee_email);

    if (!employee || employee.length === 0) {
      throw ApiError.authentication("Employee not found");
    }

    if (employee[0].company_role_id === 3) {
      next();
    } else {
      throw ApiError.authorization("Admin access required");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to verify admin status");
  }
});

// A function to check if the user is a manager or admin
const isManagerOrAdmin = asyncHandler(async (req, res, next) => {
  const employee_email = req.employee_email;

  if (!employee_email) {
    throw ApiError.authentication("Employee email not found in token");
  }

  try {
    const employee = await employeeService.getEmployeeByEmail(employee_email);

    if (!employee || employee.length === 0) {
      throw ApiError.authentication("Employee not found");
    }

    const role = employee[0].company_role_id;
    if (role === 2 || role === 3) {
      // Manager or Admin
      next();
    } else {
      throw ApiError.authorization("Manager or Admin access required");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to verify role");
  }
});

// A function to check if the user has any of the specified roles
const hasRole = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const employee_email = req.employee_email;

    if (!employee_email) {
      throw ApiError.authentication("Employee email not found in token");
    }

    try {
      const employee = await employeeService.getEmployeeByEmail(employee_email);

      if (!employee || employee.length === 0) {
        throw ApiError.authentication("Employee not found");
      }

      const userRole = employee[0].company_role_id;
      if (allowedRoles.includes(userRole)) {
        req.employee_role = userRole;
        next();
      } else {
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

// Export middleware functions using named exports
// This allows importing specific functions or the entire module
export { verifyToken, isAdmin, isManagerOrAdmin, hasRole };
