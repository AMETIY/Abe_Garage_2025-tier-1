// Utility to clear authentication data from localStorage
// This can be useful for debugging or when localStorage gets corrupted

const clearAuthData = () => {
  try {
    localStorage.removeItem("employee");
    console.log("Authentication data cleared from localStorage");
    return true;
  } catch (error) {
    console.error("Error clearing authentication data:", error);
    return false;
  }
};

// Function to check if localStorage has valid auth data
const validateAuthData = () => {
  try {
    const employeeData = localStorage.getItem("employee");
    if (!employeeData) {
      return { valid: false, reason: "No auth data found" };
    }

    const employee = JSON.parse(employeeData);
    if (!employee || typeof employee !== "object") {
      return { valid: false, reason: "Invalid auth data format" };
    }

    if (
      !employee.employee_token ||
      typeof employee.employee_token !== "string"
    ) {
      return { valid: false, reason: "Missing or invalid token" };
    }

    // Basic JWT format check
    const tokenParts = employee.employee_token.split(".");
    if (tokenParts.length !== 3) {
      return { valid: false, reason: "Invalid JWT format" };
    }

    return { valid: true, reason: "Auth data is valid" };
  } catch (error) {
    return { valid: false, reason: `Parse error: ${error.message}` };
  }
};

export { clearAuthData, validateAuthData };
export default clearAuthData;
