import React from "react";

// Custom comparison function for deep object comparison
const deepEqual = (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (key === "children") continue; // Skip children comparison for performance

    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    if (typeof prevValue === "function" && typeof nextValue === "function") {
      // For functions, compare by reference (assuming they're stable)
      if (prevValue !== nextValue) return false;
    } else if (typeof prevValue === "object" && prevValue !== null) {
      // Deep comparison for objects
      if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
        return false;
      }
    } else {
      // Simple comparison for primitives
      if (prevValue !== nextValue) return false;
    }
  }

  return true;
};

// HOC for memoization with custom comparison
export const withMemo = (Component, comparisonFn = deepEqual) => {
  return React.memo(Component, comparisonFn);
};

// HOC for shallow comparison (faster for simple props)
export const withShallowMemo = (Component) => {
  return React.memo(Component, (prevProps, nextProps) => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (key === "children") continue;
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }

    return true;
  });
};

// HOC for specific prop comparison
export const withPropMemo = (Component, propNames) => {
  return React.memo(Component, (prevProps, nextProps) => {
    for (const propName of propNames) {
      if (prevProps[propName] !== nextProps[propName]) {
        return false;
      }
    }
    return true;
  });
};

// Performance monitoring wrapper
export const withPerformanceMonitoring = (
  Component,
  componentName = "Component"
) => {
  return React.memo((props) => {
    const startTime = performance.now();

    const result = <Component {...props} />;

    const endTime = performance.now();
    if (endTime - startTime > 16) {
      // Log if render takes more than 16ms (60fps)
      console.warn(
        `⚠️ Slow render detected in ${componentName}: ${(
          endTime - startTime
        ).toFixed(2)}ms`
      );
    }

    return result;
  });
};
