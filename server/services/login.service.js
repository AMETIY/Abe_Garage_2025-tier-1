// Database query function is imported in employee.service.js
// Import the bcrypt module to do the password comparison using ES6 default import syntax
import bcrypt from "bcrypt";
// Import the employee service to get employee by email using ES6 named import syntax
import { getEmployeeByEmail } from "./employee.service.js";
// Handle employee login
async function logIn(employeeData) {
  try {
    let returnData = {}; // Object to be returned

    const employee = await getEmployeeByEmail(employeeData.employee_email);

    if (employee.length === 0) {
      returnData = {
        status: "fail",
        message: "Employee does not exist",
      };
      return returnData;
    }

    const passwordMatch = await bcrypt.compare(
      employeeData.employee_password,
      employee[0].employee_password_hashed
    );

    if (!passwordMatch) {
      returnData = {
        status: "fail",
        message: "Incorrect password",
      };
      return returnData;
    }

    returnData = {
      status: "success",
      data: employee[0],
    };
    return returnData;
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: "fail",
      message: "Login error occurred",
    };
  }
}

// Export the login function using ES6 named export syntax
// Named export is used since this module provides a specific login function
// This allows consumers to import the function: import { logIn } from './login.service.js'
export { logIn };
