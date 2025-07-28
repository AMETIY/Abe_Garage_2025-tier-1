// Import express using ES6 default import syntax
import express from "express";
const router = express.Router();

// Import service controller functions using named imports with .js extension
import {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

// Import middleware functions using named imports with .js extension
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

// Route to add a new service
router.post("/api/service", [verifyToken, isAdmin], addService);

// Route to get all services
router.get("/api/services", getAllServices);

// Route to get a service by ID
router.get("/api/service/:id", getServiceById);

// Route to update a service
router.patch("/api/service", [verifyToken, isAdmin], updateService);

// Route to delete a service
router.delete("/api/service/:id", [verifyToken, isAdmin], deleteService);

// Export the router using default export pattern
export default router;
