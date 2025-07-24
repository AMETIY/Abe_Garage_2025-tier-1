// import the employee service
const {
  checkIfEmployeeExists,
  createEmploye,
  getAllEmployees,
  updateEmployeeService,
  ServicedeleteEmployee,
  getSingleEmployeeService,
} = require("../services/employee.service");

// create Employee controller
async function createEmployee(req, res, next) {
  const { employee_email } = req.body;

  const employeeExists = await checkIfEmployeeExists(employee_email);

  // if employee exists, send a response to a client
  if (employeeExists) {
    return res.status(400).json({
      msg: "This email address is already associated with  another employee!",
    });
  } else {
    try {
      const employeeData = req.body;

      // Validate required fields
      if (!employeeData.employee_email || !employeeData.employee_first_name || 
          !employeeData.employee_last_name || !employeeData.employee_password || 
          !employeeData.company_role_id) {
        return res.status(400).json({
          error: "All required fields must be provided",
        });
      }

      // create the employee
      const employee = await createEmploye(employeeData);

      if (!employee || !employee.success) {
        return res.status(400).json({
          error: "Failed to add the employee!",
        });
      } else {
        return res.status(200).json({
          status: "Employee added successfully! ",
        });
      }
    } catch (error) {
      console.error("Employee creation error:", error);
      return res.status(400).json({
        error: error.message || "Failed to create employee",
      });
    }
  }
}

// get all Employee data controller
async function getAllEmployeees(req, res, next) {
  try {
    // call the getAllEmployees methosd from the emplyees service
    const employees = await getAllEmployees();

    if (!employees) {
      res.status(400).json({
        error: "Failed to get all employees!",
      });
    } else {
      res.status(200).json({
        status: "Employees retrieved successfully! ",
        employees: employees,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong!",
    });
  }
}

// get single employee data controller
async function getSingleEmployee(req, res, next) {
  const employee_hash = req.params.id;
  try {
    const singleEmployee = await getSingleEmployeeService(employee_hash);

    if (!singleEmployee) {
      res.status(400).json({
        error: "Failed to get employee!",
      });
    } else {
      res.status(200).json({
        status: "Employee retrieved successfully! ",
        singleEmployee: singleEmployee,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong!",
    });
  }
}

// update Employee controller
async function updateEmployee(req, res, next) {
  try {
    const updateEmployee = await updateEmployeeService(req.body);

    // the returned rows value
    const rows1 = updateEmployee.rows1.affectedRows;
    const rows2 = updateEmployee.rows2.affectedRows;
    const rows3 = updateEmployee.rows3.affectedRows;

    if (!updateEmployee) {
      res.status(400).json({
        error: "Failed to Update Employee",
      });
    } else if (rows1 === 1 && rows2 === 1 && rows3 === 1) {
      res.status(200).json({
        status: "Employee Succesfully Updated! ",
      });
    } else {
      res.status(400).json({
        status: "Update Incomplete!",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong!",
    });
  }
}

// delete Employee controller
async function deleteEmployee(req, res, next) {
  const id = req.params.id;
  try {
    const deleteEmployeeResult = await ServicedeleteEmployee(id);

    if (deleteEmployeeResult) {
      res.status(200).json({
        message: "Employee successfully deleted!",
      });
    } else {
      res.status(400).json({
        status: "Delete incomplete!",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong!",
    });
  }
}

module.exports = {
  createEmployee,
  getAllEmployeees,
  updateEmployee,
  deleteEmployee,
  getSingleEmployee,
};
