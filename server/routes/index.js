// Import the express module using ES6 default import syntax
import express from "express";
// Call the router method from express to create the router
const router = express.Router();
// Import the install router using default import with .js extension
import installRouter from "./install.routes.js";
// Import the employee routes using default import with .js extension
import employeeRouter from "./employee.routes.js";
// Import the login routes using default import with .js extension
import loginRoutes from "./login.routes.js";
// Import the auth routes using default import with .js extension
import authRoutes from "./auth.routes.js";
// Import the service routes using default import with .js extension
import serviceRoute from "./service.routes.js";
// Import the customer routes using default import with .js extension
import customerRoute from "./customer.routes.js";
// Import the vehicle routes using default import with .js extension
import vehicleRoute from "./vehicle.routes.js";
// Import the order routes using default import with .js extension
import orderRoute from "./order.routes.js";
// Import the performance routes using default import with .js extension
import performanceRoute from "./performance.routes.js";
// Import the database performance routes using default import with .js extension
import databasePerformanceRoutes from "./database-performance.routes.js";
// Add the install router to the main router
router.use(installRouter);
// Add the employee routes to the main router
router.use(employeeRouter);
// Add the login routes to the main router
router.use(loginRoutes);
// Add the auth routes to the main router
router.use(authRoutes);
// Add the service routes to the main router
router.use(serviceRoute);
// Add the customer routes to the main router
router.use(customerRoute);
// Add the vehicle routes to the main router
router.use(vehicleRoute);
// Add the order routes to the main router
router.use(orderRoute);
// Add the performance routes to the main router
router.use(performanceRoute);
// Add the database performance routes to the main router
router.use("/api/database", databasePerformanceRoutes);

// Health check endpoint
router.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Export the router using default export
export default router;
