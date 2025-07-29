import { query } from "../config/db.config.js";
// Import bcrypt for password hashing using ES6 default import syntax
import bcrypt from "bcrypt";
// A function to check if employee exists in the database
async function checkIfEmployeeExists(email) {
  const sql =
    "SELECT employee_id FROM company_employees WHERE employee_email = $1";
  const rows = await query(sql, [email]);
  return rows.length > 0;
}

// A function to create a new employee
async function createEmployee(employee) {
  let createdEmployee = {};
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    const hashedPassword = await bcrypt.hash(employee.employee_password, salt);

    // Insert all employee data into the single company_employees table
    const sql = `
      INSERT INTO company_employees (
        employee_email, 
        employee_first_name, 
        employee_last_name, 
        employee_phone, 
        employee_password_hashed, 
        company_role_id, 
        active_employee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING employee_id
    `;

    const rows = await query(sql, [
      employee.employee_email,
      employee.employee_first_name,
      employee.employee_last_name,
      employee.employee_phone,
      hashedPassword,
      employee.company_role_id,
      employee.active_employee || 1,
    ]);

    if (rows.length === 0) {
      return false;
    }

    // Get the employee id from the PostgreSQL RETURNING clause
    const employee_id = rows[0].employee_id;

    // construct the employee object to return
    createdEmployee = {
      employee_id: employee_id,
    };
  } catch (err) {
    console.error("Error creating employee:", err);
    throw err; // Re-throw to let controller handle the error
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
  // Simplified query using the single company_employees table
  let baseQuery = `
    SELECT 
      ce.employee_id,
      ce.employee_email,
      ce.employee_first_name,
      ce.employee_last_name,
      ce.employee_phone,
      ce.employee_added_date,
      ce.company_role_id,
      ce.active_employee,
      cr.company_role_name
    FROM company_employees ce
    INNER JOIN company_roles cr ON ce.company_role_id = cr.company_role_id
  `;

  const conditions = [];
  const queryParams = [];
  let paramIndex = 1;

  // Apply filters with PostgreSQL parameter syntax
  if (filters.active !== undefined) {
    conditions.push(`ce.active_employee = $${paramIndex++}`);
    queryParams.push(filters.active);
  }

  if (filters.role_id) {
    conditions.push(`ce.company_role_id = $${paramIndex++}`);
    queryParams.push(filters.role_id);
  }

  // Apply search with PostgreSQL ILIKE for case-insensitive search
  if (search && search.term && search.fields.length > 0) {
    const searchConditions = [];
    const searchTerm = `%${search.term}%`;

    search.fields.forEach((field) => {
      switch (field) {
        case "name":
          // Use PostgreSQL string concatenation
          searchConditions.push(
            `(ce.employee_first_name || ' ' || ce.employee_last_name) ILIKE $${paramIndex++}`
          );
          queryParams.push(searchTerm);
          break;
        case "email":
          searchConditions.push(`ce.employee_email ILIKE $${paramIndex++}`);
          queryParams.push(searchTerm);
          break;
        case "phone":
          searchConditions.push(`ce.employee_phone ILIKE $${paramIndex++}`);
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

  // Add ORDER BY
  baseQuery += " ORDER BY ce.employee_id DESC";

  // Calculate pagination
  const offset = (page - 1) * limit;
  const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

  // Count query
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM company_employees ce
    INNER JOIN company_roles cr ON ce.company_role_id = cr.company_role_id
  `;
  if (conditions.length > 0) {
    countQuery += ` WHERE ${conditions.join(" AND ")}`;
  }

  try {
    // Execute both queries in parallel for better performance
    const [employees, countResult] = await Promise.all([
      query(paginatedQuery, queryParams),
      query(countQuery, queryParams),
    ]);

    const totalItems = parseInt(countResult[0]?.total || 0);
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
    SELECT 
      ce.employee_id,
      ce.employee_email,
      ce.employee_first_name,
      ce.employee_last_name,
      ce.employee_phone,
      ce.employee_added_date,
      ce.company_role_id,
      ce.active_employee,
      cr.company_role_name
    FROM company_employees ce
    INNER JOIN company_roles cr ON ce.company_role_id = cr.company_role_id 
    WHERE ce.employee_id = $1 
    LIMIT 1
  `;

  const rows = await query(sql, [employeeId]);
  return rows[0]; // Return the first row
}

// Service function to update an employee
async function updateEmployee(employee) {
  let updatedEmployee = {};
  try {
    // Build dynamic update query for the single company_employees table
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    // Check which fields are provided and add them to the query
    if (employee.active_employee_status !== undefined) {
      updateFields.push(`active_employee = $${paramIndex++}`);
      updateValues.push(employee.active_employee_status);
    }
    if (employee.employee_first_name !== undefined) {
      updateFields.push(`employee_first_name = $${paramIndex++}`);
      updateValues.push(employee.employee_first_name);
    }
    if (employee.employee_last_name !== undefined) {
      updateFields.push(`employee_last_name = $${paramIndex++}`);
      updateValues.push(employee.employee_last_name);
    }
    if (employee.employee_phone_number !== undefined) {
      updateFields.push(`employee_phone = $${paramIndex++}`);
      updateValues.push(employee.employee_phone_number);
    }
    if (employee.company_role_id !== undefined) {
      updateFields.push(`company_role_id = $${paramIndex++}`);
      updateValues.push(employee.company_role_id);
    }

    // If no fields were provided, throw an error
    if (updateFields.length === 0) {
      throw new Error("No data to update");
    }

    // Construct the final SQL
    const sql = `
      UPDATE company_employees 
      SET ${updateFields.join(", ")} 
      WHERE employee_id = $${paramIndex};
    `;

    // Add employee_id to the values array
    updateValues.push(employee.employee_id);

    // Execute the query
    const result = await query(sql, updateValues);

    // Check if any rows were affected (PostgreSQL uses rowCount)
    if (result.rowCount === 0) {
      throw new Error("Employee not found or no changes made");
    }

    // Final updated object
    updatedEmployee = {
      employee_id: employee.employee_id,
    };
  } catch (err) {
    console.error("Error updating employee:", err);
    throw err;
  }

  return updatedEmployee;
}

// Service function to delete an employee
async function deleteEmployee(employee_id) {
  try {
    // With the single table structure, we just need to delete from company_employees
    // Foreign key constraints will handle referential integrity
    const result = await query(
      "DELETE FROM company_employees WHERE employee_id = $1",
      [employee_id]
    );

    return result.rowCount > 0; // Returns true if deletion was successful
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
