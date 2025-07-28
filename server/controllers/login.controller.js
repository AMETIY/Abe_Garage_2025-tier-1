// Import the enhanced authentication middleware
import { loginWithSession } from "../middlewares/enhancedAuth.middleware.js";

// Handle employee login with enhanced security
async function logIn(req, res, next) {
  try {
    await loginWithSession(req, res, next);
  } catch (error) {
    next(error);
  }
}

// Export the functions using ES6 named exports
export { logIn };
