// Import React and the Hooks we need here
import React, { useState, useEffect, useContext } from "react";
// Import the Util function we created to handle the reading from the local storage
import getAuth from "../util/auth";
// Import the ErrorHandler for centralized error management
import ErrorHandler from "../util/ErrorHandler";
// Create a context object
const AuthContext = React.createContext();
// Create a custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};
// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Error handling functions
  const handleError = (error, context = {}) => {
    const errorInfo = ErrorHandler.handleApiError(error, context);
    setError(errorInfo);
    ErrorHandler.logError(errorInfo, context);
    return errorInfo;
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    isLogged,
    isAdmin,
    isManager,
    setIsAdmin,
    setIsLogged,
    employee,
    error,
    loading,
    handleError,
    clearError,
  };

  useEffect(() => {
    // Retrieve the logged in user from local storage
    const loggedInEmployee = getAuth();
    loggedInEmployee
      .then((response) => {
        if (response.employee_token) {
          setIsLogged(true);
          // 3 is the employee_role for admin
          if (response.employee_role === 3) {
            setIsAdmin(true);
          }
          if (response.employee_role === 2) {
            setIsManager(true);
          }
          setEmployee(response);
        }
        setLoading(false);
      })
      .catch((error) => {
        // Handle authentication errors
        handleError(error, { context: "AuthContext initialization" });
        setLoading(false);
      });
  }, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
