// Import the express module using ES6 default import syntax
import express from "express";
// Call the router method from express to create the router
const router = express.Router();

// Import the login controller function using named import with .js extension
import { logIn } from "../controllers/login.controller.js";

// Create a route to handle the login request on post
router.post("/api/employee/login", logIn);

// Export the router using default export pattern
export default router;
