// Validation message constants for consistency across the application

export const VALIDATION_MESSAGES = {
  REQUIRED: (fieldName) => `${fieldName} is required`,
  EMAIL_INVALID: "Please enter a valid email address",
  EMAIL_REQUIRED: "Email is required",
  PHONE_INVALID: "Please enter a valid phone number (e.g., 555-555-5555)",
  PHONE_REQUIRED: "Phone number is required",
  NAME_REQUIRED: (fieldName = "Name") => `${fieldName} is required`,
  NAME_TOO_SHORT: (fieldName = "Name") =>
    `${fieldName} must be at least 2 characters`,
  NAME_TOO_LONG: (fieldName = "Name") =>
    `${fieldName} must be less than 50 characters`,
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  PASSWORD_TOO_LONG: "Password must be less than 100 characters",
  PASSWORD_LOWERCASE: "Password must contain at least one lowercase letter",
  PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
  PASSWORD_NUMBER: "Password must contain at least one number",
  GENERIC_ERROR: "Something went wrong. Please try again",
  FORM_SUBMISSION_ERROR:
    "There was an error submitting the form. Please check your inputs and try again",
  NETWORK_ERROR: "Network error. Please check your connection and try again",
  SERVER_ERROR: "Server error. Please try again later",
};

// Field name constants for consistency
export const FIELD_NAMES = {
  EMAIL: "Email",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  PHONE: "Phone Number",
  PASSWORD: "Password",
  EMPLOYEE_ROLE: "Employee Role",
  CUSTOMER_ID: "Customer ID",
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  PASSWORD_LOWERCASE: /(?=.*[a-z])/,
  PASSWORD_UPPERCASE: /(?=.*[A-Z])/,
  PASSWORD_NUMBER: /(?=.*\d)/,
};
