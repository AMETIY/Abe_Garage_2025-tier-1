// Import the query function from the db.config.js file using ES6 named import syntax
import { query as conn } from "../config/db.config.js";
// Import the bcrypt module to do the password comparison using ES6 default import syntax
import bcrypt from "bcrypt";
// Import the employee service to get employee by email using ES6 named import syntax
import { getEmployeeByEmail } from "./employee.service.js";
// Handle employee login
async function logIn(employeeData) {
  try {
    let returnData = {}; // Object to be returned
    console.log("Login attempt for email:", employeeData.employee_email);

    const employee = await getEmployeeByEmail(employeeData.employee_email);
    console.log("Employee found:", employee.length > 0 ? "Yes" : "No");

    if (employee.length === 0) {
      returnData = {
        status: "fail",
        message: "Employee does not exist",
      };
      console.log("Login failed: Employee does not exist");
      return returnData;
    }

    const passwordMatch = await bcrypt.compare(
      employeeData.employee_password,
      employee[0].employee_password_hashed
    );
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      returnData = {
        status: "fail",
        message: "Incorrect password",
      };
      console.log("Login failed: Incorrect password");
      return returnData;
    }

    console.log("Login successful for:", employeeData.employee_email);
    returnData = {
      status: "success",
      data: employee[0],
    };
    return returnData;
  } catch (error) {
    console.log("Login error:", error);
    return {
      status: "fail",
      message: "Login error occurred",
    };
  }
}

// Export the login function using ES6 named export syntax
// Named export is used since this module provides a specific login function
// This allows consumers to import the function: import { logIn } from './login.service.js'
export { logIn }
