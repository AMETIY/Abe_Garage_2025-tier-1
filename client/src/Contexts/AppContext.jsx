import React, { createContext, useContext, useReducer } from "react";
import ErrorHandler from "../util/ErrorHandler";

// Action types for the app reducer
const APP_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  CLEAR_ALL_NOTIFICATIONS: "CLEAR_ALL_NOTIFICATIONS",
};

// Initial state for the app context
const initialState = {
  loading: false,
  error: null,
  notifications: [],
};

// Reducer function for managing app state
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    case APP_ACTIONS.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    default:
      return state;
  }
};

// Create the context
const AppContext = createContext();

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// App provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setLoading = (loading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error, context = {}) => {
    const errorInfo = ErrorHandler.handleApiError(error, context);
    ErrorHandler.logError(errorInfo, context);
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: errorInfo });
    return errorInfo;
  };

  const clearError = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
  };

  const addNotification = (message, type = "info", duration = 5000) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: APP_ACTIONS.ADD_NOTIFICATION, payload: notification });

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  };

  const removeNotification = (id) => {
    dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ALL_NOTIFICATIONS });
  };

  // Helper function to show error notifications
  const showErrorNotification = (error, context = {}) => {
    const errorInfo = setError(error, context);
    addNotification(errorInfo.message, "error", 8000);
    return errorInfo;
  };

  // Helper function to show success notifications
  const showSuccessNotification = (message, duration = 5000) => {
    return addNotification(message, "success", duration);
  };

  // Helper function to show warning notifications
  const showWarningNotification = (message, duration = 6000) => {
    return addNotification(message, "warning", duration);
  };

  const value = {
    // State
    loading: state.loading,
    error: state.error,
    notifications: state.notifications,

    // Actions
    setLoading,
    setError,
    clearError,
    addNotification,
    removeNotification,
    clearAllNotifications,

    // Helper functions
    showErrorNotification,
    showSuccessNotification,
    showWarningNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
