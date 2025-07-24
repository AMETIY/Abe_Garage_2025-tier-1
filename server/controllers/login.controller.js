// Import the login service
const loginService = require("../services/login.service");
// Import the jsonwebtoken module
const jwt = require("jsonwebtoken");
// Import the secret key from the environment variables
const jwtSecret = process.env.JWT_SECRET_KEY;

// Handle employee login
async function logIn(req, res, next) {
  try {
    console.log(req.body);
    const employeeData = req.body;

    console.log("req data", employeeData);
    // Call the logIn method from the login service
    const employee = await loginService.logIn(employeeData);

    // Check if the service returned undefined (error occurred)
    if (!employee) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error occurred during login",
      });
    }

    // If the employee is not found
    if (employee.status === "fail") {
      return res.status(403).json({
        status: employee.status,
        message: employee.message,
      });
      // console.log(employee.message);
    }
    // If successful, send a response to the client
    const payload = {
      employee_id: employee.data.employee_id,
      employee_email: employee.data.employee_email,
      active_employee: employee.data.active_employee,
      employee_phone: employee.data.employee_phone,
      employee_role: employee.data.company_role_id,
      employee_first_name: employee.data.employee_first_name,
      employee_last_name: employee.data.employee_last_name,
      date_of_employeed: employee.data.added_date,
    };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: "24h",
    });
    // console.log(token);
    const sendBack = {
      employee_token: token,
      employee_id: employee.data.employee_id,
      employee_email: employee.data.employee_email,
      employee_first_name: employee.data.employee_first_name,
      employee_last_name: employee.data.employee_last_name,
      employee_phone: employee.data.employee_phone,
      employee_role: employee.data.company_role_id,
      active_employee: employee.data.active_employee,
    };
    res.status(200).json({
      status: "success",
      message: "Employee logged in successfully",
      data: sendBack,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error occurred during login",
      error: error.message,
    });
  }
}

// Export the functions
module.exports = {
  logIn,
};
