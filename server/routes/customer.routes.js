// Import express using ES6 default import syntax
import express from "express";
const router = express.Router();

// Import controller functions using named imports with .js extension
import {
  addCustomer,
  getCustomers,
  getCustomer,
  updateCustomerController,
} from "../controllers/customer.controller.js";

// Import middleware functions using named imports with .js extension
import { verifyToken } from "../middlewares/auth.middleware.js";

// Define routes using imported controller functions
router.post("/api/customer", [verifyToken], addCustomer);

router.get("/api/customer", [verifyToken], getCustomers);

router.get("/api/customers", [verifyToken], getCustomers);

router.get("/api/customer/:id", [verifyToken], getCustomer);

router.patch("/api/customer/:id", [verifyToken], updateCustomerController);

// Export router using default export pattern
export default router;
