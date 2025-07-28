// Import express using ES6 default import syntax
import express from "express";
const router = express.Router();

// Import vehicle controller functions using named imports with .js extension
import {
  addVehicle,
  getVehicle,
  getVehiclesByCustomer,
  updateVehicle,
  getAllVehicles,
} from "../controllers/vehicle.controller.js";

// Import middleware functions using named imports with .js extension
import { verifyToken } from "../middlewares/auth.middleware.js";

// Route to add a new vehicle
router.post("/api/vehicle", [verifyToken], addVehicle);

// Route to get a vehicle by ID
router.get("/api/vehicle/:id", [verifyToken], getVehicle);

// Route to get vehicles by customer ID
router.get(
  "/api/vehicle/customer/:customer_id",
  [verifyToken],
  getVehiclesByCustomer
);

// Route to get all vehicles
router.get("/api/vehicle", [verifyToken], getAllVehicles);

// Route to update a vehicle
router.patch("/api/vehicle/:id", [verifyToken], updateVehicle);

// Export the router using default export pattern
export default router;
