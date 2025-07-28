import React from "react";
import ErrorHandler, {
  ERROR_TYPES,
  ERROR_SEVERITY,
} from "../../../util/ErrorHandler";

/**
 * Error Boundary Component for catching React errors
 * Provides fallback UI when component errors occur
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our centralized error handler
    const errorData = ErrorHandler.createError(
      error.message,
      ERROR_TYPES.CLIENT,
      ERROR_SEVERITY.HIGH
    );

    ErrorHandler.logError(errorData, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || "Unknown",
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </p>
            <div className="error-actions">
              <button
                className="theme-btn btn-style-one"
                onClick={this.handleRetry}
              >
                <span>Try Again</span>
              </button>
              <button
                className="theme-btn btn-style-two"
                onClick={() => window.location.reload()}
              >
                <span>Refresh Page</span>
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 * @param {React.Component} Component - Component to wrap
 * @param {Object} options - Error boundary options
 * @returns {React.Component} Wrapped component with error boundary
 */
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary
      name={options.name || Component.displayName || Component.name}
      fallback={options.fallback}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

export default ErrorBoundary;
