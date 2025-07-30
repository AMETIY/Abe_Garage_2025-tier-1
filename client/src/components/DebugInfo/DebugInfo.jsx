import React, { useState, useEffect } from "react";
import { FaBug, FaTimes, FaCopy, FaDownload, FaSyncAlt } from "react-icons/fa";

const DebugInfo = () => {
  const [activeTab, setActiveTab] = useState("environment");
  const [isMinimized, setIsMinimized] = useState(true);
  const [debugData, setDebugData] = useState({});

  // Collect comprehensive debug information
  const collectDebugInfo = () => {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return {
        environment: {
          apiUrl: import.meta.env.VITE_API_URL || "Not set",
          environment: import.meta.env.VITE_APP_ENVIRONMENT || "development",
          mode: import.meta.env.MODE,
          isDev: import.meta.env.DEV,
          isProd: import.meta.env.PROD,
          nodeEnv: import.meta.env.NODE_ENV,
          debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE,
          appName: import.meta.env.VITE_APP_NAME || "Abe Garage",
          appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
        },
      };
    }

    const now = new Date();
    return {
      environment: {
        apiUrl: import.meta.env.VITE_API_URL || "Not set",
        environment: import.meta.env.VITE_APP_ENVIRONMENT || "development",
        mode: import.meta.env.MODE,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
        nodeEnv: import.meta.env.NODE_ENV,
        debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE,
        appName: import.meta.env.VITE_APP_NAME || "Abe Garage",
        appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
      },
      system: {
        timestamp: now.toISOString(),
        localTime: now.toLocaleString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator?.language || "Unknown",
        platform: navigator?.userAgentData?.platform || "Unknown",
        cookieEnabled: navigator?.cookieEnabled || false,
        onlineStatus: navigator?.onLine ? "Online" : "Offline",
        userAgent: navigator?.userAgent || "Unknown",
      },
      page: {
        url: window?.location?.href || "Unknown",
        pathname: window?.location?.pathname || "Unknown",
        search: window?.location?.search || "",
        hash: window?.location?.hash || "",
        referrer: document?.referrer || "Direct",
        title: document?.title || "Unknown",
      },
      performance: {
        loadTime:
          typeof performance !== "undefined"
            ? performance.now().toFixed(2) + "ms"
            : "Unknown",
        memoryUsage:
          typeof performance !== "undefined" && performance.memory
            ? {
                used:
                  (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) +
                  "MB",
                total:
                  (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(
                    2
                  ) + "MB",
                limit:
                  (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(
                    2
                  ) + "MB",
              }
            : "Not available",
        connectionType: navigator?.connection?.effectiveType || "Unknown",
        connectionSpeed: navigator?.connection?.downlink
          ? navigator.connection.downlink + "Mbps"
          : "Unknown",
      },
      screen: {
        resolution:
          typeof screen !== "undefined"
            ? `${screen.width}x${screen.height}`
            : "Unknown",
        availableSize:
          typeof screen !== "undefined"
            ? `${screen.availWidth}x${screen.availHeight}`
            : "Unknown",
        colorDepth:
          typeof screen !== "undefined"
            ? screen.colorDepth + " bits"
            : "Unknown",
        pixelRatio:
          typeof window !== "undefined" ? window.devicePixelRatio : "Unknown",
        viewport:
          typeof window !== "undefined"
            ? `${window.innerWidth}x${window.innerHeight}`
            : "Unknown",
      },
      storage: {
        localStorage: (() => {
          try {
            return typeof localStorage !== "undefined"
              ? Object.keys(localStorage).length + " items"
              : "Not available";
          } catch {
            return "Not accessible";
          }
        })(),
        sessionStorage: (() => {
          try {
            return typeof sessionStorage !== "undefined"
              ? Object.keys(sessionStorage).length + " items"
              : "Not available";
          } catch {
            return "Not accessible";
          }
        })(),
        cookies:
          typeof document !== "undefined"
            ? document.cookie
              ? "Enabled"
              : "Disabled/Empty"
            : "Not available",
      },
    };
  };

  // Update debug data periodically
  useEffect(() => {
    const updateData = () => setDebugData(collectDebugInfo());
    updateData();

    const interval = setInterval(updateData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Only show in development or when debug is enabled
  if (import.meta.env.PROD && !import.meta.env.VITE_ENABLE_DEBUG_MODE) {
    return null;
  }

  // Don't render during SSR
  if (typeof window === "undefined") {
    return null;
  }

  const copyToClipboard = (data) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert("Debug info copied to clipboard!");
    } else {
      alert("Clipboard not available");
    }
  };

  const downloadDebugInfo = () => {
    if (typeof window === "undefined") return;

    const dataStr = JSON.stringify(debugData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `debug-info-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "environment", label: "Environment", icon: "🌍" },
    { id: "system", label: "System", icon: "💻" },
    { id: "page", label: "Page", icon: "📄" },
    { id: "performance", label: "Performance", icon: "⚡" },
    { id: "screen", label: "Screen", icon: "🖥️" },
    { id: "storage", label: "Storage", icon: "💾" },
  ];

  const renderDebugSection = (data, title) => (
    <div style={{ marginBottom: "15px" }}>
      <h4
        style={{
          color: "#4CAF50",
          marginBottom: "10px",
          fontSize: "14px",
          borderBottom: "1px solid #333",
          paddingBottom: "5px",
        }}
      >
        {title}
      </h4>
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            padding: "4px 8px",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "3px",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#81C784", fontWeight: "500" }}>{key}:</span>
          <span
            style={{
              color: "#E0E0E0",
              textAlign: "right",
              maxWidth: "60%",
              wordBreak: "break-word",
              fontSize: "11px",
            }}
          >
            {typeof value === "object"
              ? JSON.stringify(value, null, 1)
              : String(value)}
          </span>
        </div>
      ))}
    </div>
  );

  // Floating debug button
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          backgroundColor: "#FF5722",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10000,
          boxShadow: "0 4px 12px rgba(255, 87, 34, 0.4)",
          transition: "all 0.3s ease",
          animation: "pulse 2s infinite",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 20px rgba(255, 87, 34, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(255, 87, 34, 0.4)";
        }}
      >
        <FaBug size={20} color="white" />
        <style>
          {`
            @keyframes pulse {
              0% { box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4); }
              50% { box-shadow: 0 4px 20px rgba(255, 87, 34, 0.8); }
              100% { box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4); }
            }
          `}
        </style>
      </div>
    );
  }

  // Full debug panel
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "400px",
        maxHeight: "80vh",
        backgroundColor: "#1E1E1E",
        border: "2px solid #FF5722",
        borderRadius: "12px",
        zIndex: 10000,
        fontFamily: "'Courier New', monospace",
        boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#FF5722",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaBug size={16} />
          <span>Debug Panel</span>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: "2px 6px",
              borderRadius: "10px",
              fontSize: "10px",
            }}
          >
            {import.meta.env.MODE?.toUpperCase()}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <FaSyncAlt
            size={14}
            style={{ cursor: "pointer" }}
            onClick={() => setDebugData(collectDebugInfo())}
            title="Refresh data"
          />
          <FaCopy
            size={14}
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(debugData)}
            title="Copy all data"
          />
          <FaDownload
            size={14}
            style={{ cursor: "pointer" }}
            onClick={downloadDebugInfo}
            title="Download debug info"
          />
          <FaTimes
            size={14}
            style={{ cursor: "pointer" }}
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#2D2D2D",
          borderBottom: "1px solid #444",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              backgroundColor: activeTab === tab.id ? "#FF5722" : "transparent",
              color: activeTab === tab.id ? "white" : "#B0B0B0",
              border: "none",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "11px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ marginRight: "4px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          padding: "16px",
          maxHeight: "60vh",
          overflowY: "auto",
          backgroundColor: "#1E1E1E",
          color: "#E0E0E0",
          fontSize: "12px",
        }}
      >
        {debugData[activeTab] &&
          renderDebugSection(
            debugData[activeTab],
            tabs.find((t) => t.id === activeTab)?.label
          )}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#2D2D2D",
          padding: "8px 16px",
          borderTop: "1px solid #444",
          fontSize: "10px",
          color: "#888",
          textAlign: "center",
        }}
      >
        Last updated: {new Date().toLocaleTimeString()} • Auto-refresh: 5s
      </div>
    </div>
  );
};

export default DebugInfo;
