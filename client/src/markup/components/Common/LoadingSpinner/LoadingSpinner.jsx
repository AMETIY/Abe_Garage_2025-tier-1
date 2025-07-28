import React from "react";
import { withShallowMemo } from "../../../components/ReactOptimizer/index.js";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  const sizeClass = `spinner-${size}`;

  return (
    <div className={`loading-spinner ${sizeClass}`}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";

const MemoizedLoadingSpinner = withShallowMemo(LoadingSpinner);
MemoizedLoadingSpinner.displayName = "MemoizedLoadingSpinner";

export default MemoizedLoadingSpinner;
