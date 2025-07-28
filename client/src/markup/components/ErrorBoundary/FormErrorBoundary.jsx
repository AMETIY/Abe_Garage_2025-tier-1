import React from "react";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Specialized Error Boundary for Form Components
 * Provides form-specific error handling and recovery
 */
const FormErrorBoundary = ({ children, formName = "Form" }) => {
  const formFallback = (error, retry) => (
    <div className="form-error-boundary">
      <div className="alert alert-danger" role="alert">
        <div className="error-header">
          <i className="fas fa-exclamation-circle"></i>
          <strong>Form Error</strong>
        </div>
        <p>
          There was an error with the {formName.toLowerCase()}. Please refresh
          the page and try again.
        </p>
        <div className="error-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={retry}
          >
            Retry
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
        {import.meta.env.DEV && (
          <details className="mt-3">
            <summary>Technical Details</summary>
            <pre className="text-muted small mt-2">{error?.toString()}</pre>
          </details>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary name={`${formName}ErrorBoundary`} fallback={formFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default FormErrorBoundary;
