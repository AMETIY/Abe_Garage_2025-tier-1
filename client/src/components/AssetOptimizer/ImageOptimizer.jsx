import React, { useState, useRef, useEffect } from "react";
import "./ImageOptimizer.css";

const ImageOptimizer = ({
  src,
  alt,
  className = "",
  placeholder = "/src/assets/images/placeholder.jpg",
  sizes = "100vw",
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate optimized image sources
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return placeholder;

    // If it's already a data URL or external URL, return as is
    if (originalSrc.startsWith("data:") || originalSrc.startsWith("http")) {
      return originalSrc;
    }

    // For local images, we could implement WebP conversion here
    // For now, return the original source
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = getOptimizedSrc(src);
  const shouldLoad = priority || isInView;

  return (
    <div
      ref={imgRef}
      className={`image-optimizer ${className} ${isLoaded ? "loaded" : ""}`}
      {...props}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          <div className="placeholder-shimmer"></div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="image-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5zM8.5 6c.8 0 1.5.7 1.5 1.5S9.3 9 8.5 9 7 8.3 7 7.5S7.7 6 8.5 6zm7.5 12H8l4-4 4 4z" />
          </svg>
          <span>Image failed to load</span>
        </div>
      )}

      {/* Actual image */}
      {shouldLoad && !hasError && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`optimized-image ${isLoaded ? "fade-in" : ""}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
        />
      )}
    </div>
  );
};

export default ImageOptimizer;
