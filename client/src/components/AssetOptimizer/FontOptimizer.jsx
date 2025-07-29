import React, { useEffect, useState } from "react";
import "./FontOptimizer.css";

const FontOptimizer = ({
  children,
  fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontDisplay = "swap",
  preload = false,
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      // Fallback for older browsers
      setTimeout(() => setFontsLoaded(true), 100);
    }

    // Only preload if explicitly requested and fonts exist
    if (preload) {
      // Use system fonts instead of problematic custom fonts
      console.info("📝 Using system fonts for better performance");
    }
  }, [preload]);

  return (
    <div
      className={`font-optimizer ${fontsLoaded ? "fonts-loaded" : ""}`}
      style={{
        fontFamily,
        fontDisplay: fontDisplay === "swap" ? "swap" : "block",
      }}
    >
      {children}
    </div>
  );
};

export default FontOptimizer;
