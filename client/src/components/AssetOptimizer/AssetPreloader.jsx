import React, { useState, useEffect } from "react";
import "./AssetPreloader.css";

const AssetPreloader = ({
  children,
  criticalAssets = [],
  onLoadComplete,
  showProgress = true,
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (criticalAssets.length === 0) {
      setIsLoading(false);
      onLoadComplete?.();
      return;
    }

    let loadedCount = 0;
    const totalAssets = criticalAssets.length;

    const loadAsset = (asset) => {
      return new Promise((resolve, reject) => {
        if (asset.type === "image") {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            setLoadingProgress((loadedCount / totalAssets) * 100);
            resolve();
          };
          img.onerror = reject;
          img.src = asset.src;
        } else if (asset.type === "font") {
          // Font loading
          if (document.fonts) {
            document.fonts
              .load(`1em ${asset.family}`)
              .then(() => {
                loadedCount++;
                setLoadingProgress((loadedCount / totalAssets) * 100);
                resolve();
              })
              .catch(reject);
          } else {
            // Fallback for older browsers
            loadedCount++;
            setLoadingProgress((loadedCount / totalAssets) * 100);
            resolve();
          }
        } else if (asset.type === "script") {
          const script = document.createElement("script");
          script.src = asset.src;
          script.onload = () => {
            loadedCount++;
            setLoadingProgress((loadedCount / totalAssets) * 100);
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        }
      });
    };

    // Load all critical assets with better error handling
    Promise.allSettled(criticalAssets.map(loadAsset))
      .then((results) => {
        const failed = results.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failed > 0) {
          console.warn(`⚠️ ${failed} assets failed to load, but continuing...`);
        }

        setIsLoading(false);
        onLoadComplete?.();
      })
      .catch((error) => {
        console.error("Asset loading error:", error);
        setIsLoading(false);
        onLoadComplete?.();
      });
  }, [criticalAssets, onLoadComplete]);

  if (!isLoading) {
    return children;
  }

  return (
    <div className="asset-preloader">
      {showProgress && (
        <div className="preloader-overlay">
          <div className="preloader-content">
            <div className="preloader-spinner"></div>
            <div className="preloader-text">
              Loading assets... {Math.round(loadingProgress)}%
            </div>
            <div className="preloader-progress">
              <div
                className="progress-bar"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default AssetPreloader;
