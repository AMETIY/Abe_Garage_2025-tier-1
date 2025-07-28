// Function to read the data from the user's local storage
const getAuth = async () => {
  try {
    const employeeData = localStorage.getItem("employee");
    console.log("🔍 getAuth: Raw localStorage data:", employeeData);

    if (!employeeData) {
      console.log("🔍 getAuth: No employee data found");
      return {};
    }

    let employee;
    try {
      employee = JSON.parse(employeeData);
      console.log("🔍 getAuth: Parsed employee data:", employee);
    } catch (parseError) {
      console.warn("❌ Invalid JSON in localStorage, clearing...", parseError);
      localStorage.removeItem("employee");
      return {};
    }

    if (!employee || !employee.employee_token) {
      console.log("🔍 getAuth: No employee object or token found");
      return {};
    }

    console.log(
      "🔍 getAuth: Token found:",
      employee.employee_token.substring(0, 50) + "..."
    );

    // Validate token format before decoding
    if (typeof employee.employee_token !== "string") {
      console.warn("❌ Token is not a string, clearing...");
      localStorage.removeItem("employee");
      return {};
    }

    const tokenParts = employee.employee_token.split(".");
    if (tokenParts.length !== 3) {
      console.warn(
        "❌ Invalid token format (expected 3 parts, got " +
          tokenParts.length +
          "), clearing..."
      );
      localStorage.removeItem("employee");
      return {};
    }

    const decodedToken = decodeTokenPayload(employee.employee_token);

    // If decoding failed (returns default object), clear data
    if (!decodedToken.employee_role && !decodedToken.employee_id) {
      console.warn("Token decoding failed, clearing...");
      localStorage.removeItem("employee");
      return {};
    }

    // Check if token is expired
    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      console.warn("Token has expired, clearing localStorage");
      localStorage.removeItem("employee");
      return {};
    }

    // Add decoded token data to employee object
    employee.employee_role = decodedToken.employee_role;
    employee.employee_id = decodedToken.employee_id;
    employee.employee_first_name = decodedToken.employee_first_name;

    return employee;
  } catch (error) {
    console.error("Error reading auth data from localStorage:", error.message);
    // Clear potentially corrupted data
    localStorage.removeItem("employee");
    return {};
  }
};

// Function to decode the payload from the token
// The purpose of this code is to take a JWT token, extract its payload, decode it from Base64Url encoding, and then convert the decoded payload into a JavaScript object for further use and manipulation
const decodeTokenPayload = (token) => {
  try {
    // Validate token format
    if (!token || typeof token !== "string") {
      throw new Error(
        "Invalid token: token is null, undefined, or not a string"
      );
    }

    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token: JWT must have 3 parts separated by dots");
    }

    const base64Url = tokenParts[1];
    if (!base64Url) {
      throw new Error("Invalid token: payload part is missing");
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decoding failed:", error.message);
    // Return a default object instead of throwing to prevent app crashes
    return {
      employee_role: null,
      employee_id: null,
      employee_first_name: null,
      exp: 0, // Expired token
    };
  }
};

export default getAuth;
