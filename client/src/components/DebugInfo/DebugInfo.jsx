import React from "react";

const DebugInfo = () => {
  const debugInfo = {
    apiUrl: import.meta.env.VITE_API_URL,
    environment: import.meta.env.VITE_APP_ENVIRONMENT,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href,
  };

  // Only show in development or when debug is enabled
  if (import.meta.env.PROD && !import.meta.env.VITE_ENABLE_DEBUG_MODE) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
        wordBreak: "break-all",
      }}
    >
      <h4>Debug Info</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default DebugInfo;
