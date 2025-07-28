// Import the employee service using ES6 modules
import * as employeeService from "../services/employee.service.js";
// Import enhanced error handling utilities
import ApiError from "../utils/ApiError.js";
import {
  asyncHandler,
  sendSuccessResponse,
  handleValidationErrors,
} from "../middlewares/errorHandler.middleware.js";
// Import validation utilities
import {
  validateData,
  CommonSchemas,
} from "../middlewares/validation.middleware.js";

// Validation helper for employee data using new validation system
const validateEmployeeData = (employeeData, isUpdate = false) => {
  // Create validation schema based on whether it's an update or create
  const schema = { ...CommonSchemas.employee };

  // For updates, make password optional
  if (isUpdate) {
    delete schema.employee_password;
  }

  const { isValid, errors } = validateData(employeeData, schema);

  if (!isValid) {
    throw ApiError.validation("Employee data validation failed", {
      fields: errors,
    });
  }
};

// Create the add employee controller
const createEmployee = asyncHandler(async (req, res, next) => {
  const employeeData = req.body;

  // Validate input data
  validateEmployeeData(employeeData);

  // Check if employee email already exists in the database
  const employeeExists = await employeeService.checkIfEmployeeExists(
    employeeData.employee_email
  );

  if (employeeExists) {
    throw ApiError.conflict(
      "This email address is already associated with another employee",
      {
        field: "employee_email",
      }
    );
  }

  try {
    // Create the employee
    const employee = await employeeService.createEmployee(employeeData);

    // Ensure employee_id is present
    if (!employee || !employee.employee_id) {
      throw ApiError.internal("Failed to create employee - no ID returned");
    }

    // Prepare response data
    const responseData = {
      employee_id: employee.employee_id,
      employee_email: employeeData.employee_email,
      employee_first_name: employeeData.employee_first_name,
      employee_last_name: employeeData.employee_last_name,
      employee_phone: employeeData.employee_phone,
      employee_role: employeeData.company_role_id,
      employee_active: employeeData.active_employee,
    };

    sendSuccessResponse(
      res,
      responseData,
      "Employee created successfully",
      201
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to create employee", {
      originalError: error.message,
    });
  }
});

// Create the getAllEmployees controller with pagination support
const getAllEmployees = asyncHandler(async (req, res, next) => {
  try {
    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Extract filters
    const filters = {};
    if (req.query.active !== undefined) {
      filters.active = req.query.active === "true" ? 1 : 0;
    }
    if (req.query.role_id) {
      filters.role_id = parseInt(req.query.role_id);
    }

    // Extract search parameters
    let search = null;
    if (req.query.search) {
      const searchFields = req.query.searchField
        ? [req.query.searchField]
        : ["name", "email", "phone"];
      search = {
        term: req.query.search.trim(),
        fields: searchFields,
      };
    }

    // Call the getAllEmployees method with pagination
    const result = await employeeService.getAllEmployees(
      page,
      limit,
      filters,
      search
    );

    if (!result || !result.data) {
      throw ApiError.notFound("No employees found");
    }

    // Send paginated response
    res.status(200).json({
      status: "success",
      message: "Employees retrieved successfully",
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to retrieve employees", {
      originalError: error.message,
    });
  }
});

// Create the getEmployeeById controller
const getEmployeeById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate ID parameter
  if (!id || isNaN(id)) {
    throw ApiError.validation("Invalid employee ID provided");
  }

  try {
    const employee = await employeeService.getEmployeeById(id);

    if (!employee || employee.length === 0) {
      throw ApiError.notFound("Employee");
    }

    sendSuccessResponse(res, employee, "Employee retrieved successfully");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to retrieve employee", {
      originalError: error.message,
    });
  }
});

const updateEmployee = asyncHandler(async (req, res, next) => {
  const employeeData = req.body;
  const { id } = req.params;

  // Validate ID parameter
  if (!id || isNaN(id)) {
    throw ApiError.validation("Invalid employee ID provided");
  }

  employeeData.employee_id = Number(id);

  // Validate employee data (excluding password for updates)
  const updateValidation = { ...employeeData };
  delete updateValidation.employee_password; // Password is optional for updates

  // Validate employee data for update (password is optional)
  validateEmployeeData(employeeData, true);

  try {
    // Check if the employee exists before updating
    const employeeExists = await employeeService.getEmployeeById(
      employeeData.employee_id
    );

    if (!employeeExists || employeeExists.length === 0) {
      throw ApiError.notFound("Employee");
    }

    // Update the employee
    const updatedEmployee = await employeeService.updateEmployee(employeeData);

    if (!updatedEmployee) {
      throw ApiError.internal("Failed to update employee");
    }

    sendSuccessResponse(res, null, "Employee updated successfully");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to update employee", {
      originalError: error.message,
    });
  }
});

const deleteEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate ID parameter
  if (!id || isNaN(id)) {
    throw ApiError.validation("Invalid employee ID provided");
  }

  try {
    // Check if employee exists before deletion
    const employeeExists = await employeeService.getEmployeeById(id);

    if (!employeeExists || employeeExists.length === 0) {
      throw ApiError.notFound("Employee");
    }

    // Delete the employee
    const success = await employeeService.deleteEmployee(id);

    if (!success) {
      throw ApiError.internal("Failed to delete employee");
    }

    sendSuccessResponse(res, null, "Employee deleted successfully");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.database("Failed to delete employee", {
      originalError: error.message,
    });
  }
});
// Export the employee controller functions using ES6 named exports
export {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
