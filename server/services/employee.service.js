import { query } from "../config/db.config.js";
// Import bcrypt for password hashing using ES6 default import syntax
import bcrypt from "bcrypt";
// A function to check if employee exists in the database
async function checkIfEmployeeExists(email) {
  const sql = "SELECT * FROM company_employees WHERE employee_email = $1";
  const rows = await query(sql, [email]);
  if (rows.length > 0) {
    return true;
  }
  return false;
}

// A function to create a new employee
async function createEmployee(employee) {
  let createdEmployee = {};
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    const hashedPassword = await bcrypt.hash(employee.employee_password, salt);
    // Insert the email in to the employee table
    const sql =
      "INSERT INTO employee (employee_email, active_employee) VALUES (?, ?)";
    const rows = await query(sql, [
      employee.employee_email,
      employee.active_employee,
    ]);
    if (rows.affectedRows !== 1) {
      return false;
    }

    // Get the employee id from the insert
    const employee_id = rows.insertId;
    // Insert the remaining data in to the employee_info, employee_pass, and employee_role tables
    const sql2 =
      "INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone) VALUES (?, ?, ?, ?)";
    await query(sql2, [
      employee_id,
      employee.employee_first_name,
      employee.employee_last_name,
      employee.employee_phone,
    ]);
    const sql3 =
      "INSERT INTO employee_pass (employee_id, employee_password_hashed) VALUES (?, ?)";
    await query(sql3, [employee_id, hashedPassword]);
    const sql4 =
      "INSERT INTO employee_role (employee_id, company_role_id) VALUES (?, ?)";
    await query(sql4, [employee_id, employee.company_role_id]);
    // construct to the employee object to return
    createdEmployee = {
      employee_id: employee_id,
    };
  } catch (err) {
    console.error("Error creating employee:", err);
  }
  // Return the employee object
  return createdEmployee;
}
// A function to get employee by email
async function getEmployeeByEmail(employee_email) {
  const sql = `
    SELECT 
      ce.employee_id,
      ce.employee_email,
      ce.employee_first_name,
      ce.employee_last_name,
      ce.employee_phone,
      ce.employee_password_hashed,
      ce.employee_added_date,
      ce.company_role_id,
      ce.active_employee,
      cr.company_role_name
    FROM company_employees ce
    INNER JOIN company_roles cr ON ce.company_role_id = cr.company_role_id
    WHERE ce.employee_email = $1 AND ce.active_employee = 1
  `;
  const rows = await query(sql, [employee_email]);
  return rows;
}

// A function to verify password
async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
/**
 * Retrieves all employees with advanced pagination, filtering, and search capabilities
 *
 * @param {number} page - Page number (1-based, default: 1)
 * @param {number} limit - Number of items per page (default: 10)
 * @param {object} filters - Filter criteria object
 * @param {boolean} filters.active - Filter by active status (true/false)
 * @param {number} filters.role_id - Filter by company role ID
 * @param {object} search - Search configuration object
 * @param {string} search.term - Search term to match against
 * @param {string[]} search.fields - Fields to search in ['name', 'email', 'phone']
 *
 * @returns {Promise<object>} Object containing:
 *   - data: Array of employee objects with joined information
 *   - pagination: Pagination metadata (currentPage, totalPages, totalItems, etc.)
 *
 * @throws {Error} Database connection or query errors
 *
 * @example
 * // Get first page with 10 employees
 * const result = await getAllEmployees(1, 10);
 *
 * // Search for employees by name
 * const searchResult = await getAllEmployees(1, 10, {}, {
 *   term: 'john',
 *   fields: ['name', 'email']
 * });
 *
 * // Filter active employees only
 * const activeEmployees = await getAllEmployees(1, 10, { active: true });
 */
async function getAllEmployees(
  page = 1,
  limit = 10,
  filters = {},
  search = null
) {
  // Optimized base query with table aliases for better performance
  let baseQuery = `
    SELECT 
      e.employee_id,
      e.employee_email,
      e.active_employee,
      ei.employee_first_name,
      ei.employee_last_name,
      ei.employee_phone,
      cr.company_role_name,
      er.company_role_id
    FROM employee e
    INNER JOIN employee_info ei ON e.employee_id = ei.employee_id 
    INNER JOIN employee_role er ON e.employee_id = er.employee_id 
    INNER JOIN company_roles cr ON er.company_role_id = cr.company_role_id
  `;

  const conditions = [];
  const queryParams = [];

  // Apply filters with optimized conditions
  if (filters.active !== undefined) {
    conditions.push("e.active_employee = ?");
    queryParams.push(filters.active);
  }

  if (filters.role_id) {
    conditions.push("er.company_role_id = ?");
    queryParams.push(filters.role_id);
  }

  // Apply search with optimized LIKE queries
  if (search && search.term && search.fields.length > 0) {
    const searchConditions = [];
    const searchTerm = `%${search.term}%`;

    search.fields.forEach((field) => {
      switch (field) {
        case "name":
          // Use CONCAT for better performance on name search
          searchConditions.push(
            "CONCAT(ei.employee_first_name, ' ', ei.employee_last_name) LIKE ?"
          );
          queryParams.push(searchTerm);
          break;
        case "email":
          searchConditions.push("e.employee_email LIKE ?");
          queryParams.push(searchTerm);
          break;
        case "phone":
          searchConditions.push("ei.employee_phone LIKE ?");
          queryParams.push(searchTerm);
          break;
      }
    });

    if (searchConditions.length > 0) {
      conditions.push(`(${searchConditions.join(" OR ")})`);
    }
  }

  // Add WHERE clause if conditions exist
  if (conditions.length > 0) {
    baseQuery += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Add ORDER BY with index-friendly ordering
  baseQuery += " ORDER BY e.employee_id DESC";

  // Calculate pagination
  const offset = (page - 1) * limit;
  const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

  // Optimized count query - avoid subquery when possible
  let countQuery;
  if (conditions.length === 0) {
    // Simple count when no filters
    countQuery = "SELECT COUNT(*) as total FROM employee e";
  } else {
    // Use the same conditions for count but without unnecessary JOINs if possible
    countQuery = `
      SELECT COUNT(*) as total 
      FROM employee e
      INNER JOIN employee_info ei ON e.employee_id = ei.employee_id 
      INNER JOIN employee_role er ON e.employee_id = er.employee_id 
      INNER JOIN company_roles cr ON er.company_role_id = cr.company_role_id
    `;
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }
  }

  try {
    // Execute both queries in parallel for better performance
    const [employees, countResult] = await Promise.all([
      query(paginatedQuery, queryParams),
      query(countQuery, queryParams),
    ]);

    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: employees,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error in getAllEmployees:", error);
    throw error;
  }
}

// A function to get a single employee by ID
async function getEmployeeById(employeeId) {
  const sql = `
    SELECT * FROM employee 
    INNER JOIN employee_info ON employee.employee_id = employee_info.employee_id 
    INNER JOIN employee_role ON employee.employee_id = employee_role.employee_id 
    INNER JOIN company_roles ON employee_role.company_role_id = company_roles.company_role_id 
    WHERE employee.employee_id = ? 
    LIMIT 1
  `;

  const rows = await query(sql, [employeeId]);
  return rows[0]; // Return the first row
}

// Service function to update an employee
async function updateEmployee(employee) {
  let updatedEmployee = {};
  try {
    // Update only if `active_employee` is provided
    if (employee.active_employee_status !== undefined) {
      const sql = `
        UPDATE employee 
        SET active_employee = ? 
        WHERE employee_id = ?;
      `;
      const result = await query(sql, [
        employee.active_employee_status,
        employee.employee_id,
      ]);
      if (result.affectedRows !== 1) return false;
    }

    // Update fields in employee_info only if at least one is provided
    const infoFields = [];
    const infoValues = [];

    if (employee.employee_first_name !== undefined) {
      infoFields.push("employee_first_name = ?");
      infoValues.push(employee.employee_first_name);
    }
    if (employee.employee_last_name !== undefined) {
      infoFields.push("employee_last_name = ?");
      infoValues.push(employee.employee_last_name);
    }
    if (employee.employee_phone_number !== undefined) {
      infoFields.push("employee_phone = ?");
      infoValues.push(employee.employee_phone_number);
    }

    if (infoFields.length > 0) {
      const sql = `
        UPDATE employee_info 
        SET ${infoFields.join(", ")} 
        WHERE employee_id = ?;
      `;
      infoValues.push(employee.employee_id);
      await query(sql, infoValues);
    }

    // Update role if `company_role_id` is provided
    if (employee.company_role_id !== undefined) {
      const sql = `
        UPDATE employee_role 
        SET company_role_id = ? 
        WHERE employee_id = ?;
      `;
      await query(sql, [employee.company_role_id, employee.employee_id]);
    }

    // Final updated object
    updatedEmployee = {
      employee_id: employee.employee_id,
    };
  } catch (err) {
    console.error("Error updating employee:", err);
    return false;
  }

  return updatedEmployee;
}

// Service function to delete an employee
async function deleteEmployee(employee_id) {
  try {
    // Delete employee record from dependent tables first (to maintain referential integrity)
    await query("DELETE FROM employee_role WHERE employee_id = ?", [
      employee_id,
    ]);
    await query("DELETE FROM employee_info WHERE employee_id = ?", [
      employee_id,
    ]);
    await query("DELETE FROM employee_pass WHERE employee_id = ?", [
      employee_id,
    ]);

    // Finally, delete the employee from the main employee table
    const result = await query("DELETE FROM employee WHERE employee_id = ?", [
      employee_id,
    ]);

    return result.affectedRows > 0; // Returns true if deletion was successful
  } catch (err) {
    console.error("Error deleting employee:", err);
    return false;
  }
}

// Export all service functions using ES6 named export syntax
// Named exports are ideal for service modules that provide multiple related functions
// This allows consumers to import specific functions: import { createEmployee, getAllEmployees } from './employee.service.js'
// or import all functions: import * as employeeService from './employee.service.js'
export {
  checkIfEmployeeExists,
  createEmployee,
  getEmployeeByEmail,
  verifyPassword,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
