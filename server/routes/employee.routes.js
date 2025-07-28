// Import express using ES6 default import syntax
import express from "express";
// Call the router method from express to create the router
const router = express.Router();

// Import the employee controller functions using named imports with .js extension
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";

// Import middleware functions using named imports with .js extension
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

// Create a route to handle the add employee request on post
router.post("/api/employee", createEmployee);

// Create a route to handle the get all employees request on get
router.get("/api/employees", getAllEmployees);

// Get employee by ID route
router.get("/api/employee/:id", [verifyToken], getEmployeeById);

// Update employee route
router.patch("/api/employee/:id", [verifyToken, isAdmin], updateEmployee);

// Delete employee route
router.delete("/api/employee/:id", [verifyToken, isAdmin], deleteEmployee);

// Export the router using default export pattern
export default router;
