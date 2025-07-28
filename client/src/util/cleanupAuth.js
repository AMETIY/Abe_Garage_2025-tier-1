// Utility to clean up corrupted authentication data
// This should be run on app startup to ensure clean state

const cleanupCorruptedAuth = () => {
  try {
    const employeeData = localStorage.getItem("employee");

    if (!employeeData) {
      console.log("No auth data found in localStorage");
      return true; // No data is fine
    }

    // Try to parse the data
    let employee;
    try {
      employee = JSON.parse(employeeData);
    } catch (parseError) {
      console.warn("Corrupted JSON in localStorage, clearing...", parseError);
      localStorage.removeItem("employee");
      return true;
    }

    // Check if employee object is valid
    if (!employee || typeof employee !== "object") {
      console.warn("Invalid employee object in localStorage, clearing...");
      localStorage.removeItem("employee");
      return true;
    }

    // Check if token exists and has proper format
    if (!employee.employee_token) {
      console.warn("No token found in employee data, clearing...");
      localStorage.removeItem("employee");
      return true;
    }

    if (typeof employee.employee_token !== "string") {
      console.warn("Token is not a string, clearing...");
      localStorage.removeItem("employee");
      return true;
    }

    // Check JWT format (should have 3 parts separated by dots)
    const tokenParts = employee.employee_token.split(".");
    if (tokenParts.length !== 3) {
      console.warn("Invalid JWT format in localStorage, clearing...");
      localStorage.removeItem("employee");
      return true;
    }

    // Check if any part is empty
    if (tokenParts.some((part) => !part || part.trim() === "")) {
      console.warn("JWT has empty parts, clearing...");
      localStorage.removeItem("employee");
      return true;
    }

    console.log("Auth data validation passed");
    return true;
  } catch (error) {
    console.error("Error during auth cleanup:", error);
    // If anything goes wrong, clear the data to be safe
    localStorage.removeItem("employee");
    return true;
  }
};

// Function to be called on app startup
const initializeAuth = () => {
  console.log("🔧 Initializing authentication...");

  // Only run cleanup once per session
  const cleanupKey = "auth_cleanup_done";
  const sessionCleanupDone = sessionStorage.getItem(cleanupKey);

  if (!sessionCleanupDone) {
    const isClean = cleanupCorruptedAuth();
    sessionStorage.setItem(cleanupKey, "true");

    if (isClean) {
      console.log("✅ Authentication initialization complete");
    } else {
      console.log("⚠️ Authentication data was cleaned up");
    }

    return isClean;
  } else {
    console.log("✅ Authentication already initialized this session");
    return true;
  }
};

export { cleanupCorruptedAuth, initializeAuth };
export default initializeAuth;
