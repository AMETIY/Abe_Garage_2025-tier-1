import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Optimized useState with debouncing
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return [debouncedValue, setValue];
};

// Optimized useCallback with dependency tracking
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

// Optimized useMemo with cache invalidation
export const useCachedMemo = (factory, dependencies, cacheKey = null) => {
  const cacheRef = useRef(new Map());
  const lastDepsRef = useRef(dependencies);

  return useMemo(() => {
    const depsKey = JSON.stringify(dependencies);
    const key = cacheKey || depsKey;
    const _depsChanged = JSON.stringify(lastDepsRef.current) !== depsKey;

    lastDepsRef.current = dependencies;

    if (_depsChanged || !cacheRef.current.has(key)) {
      const result = factory();
      cacheRef.current.set(key, result);
      return result;
    }

    return cacheRef.current.get(key);
  }, [dependencies, cacheKey, factory]);
};

// Optimized useEffect with cleanup
export const useOptimizedEffect = (effect, dependencies = []) => {
  const cleanupRef = useRef(null);
  const prevDepsRef = useRef(dependencies);

  useEffect(() => {
    const _depsChanged =
      JSON.stringify(prevDepsRef.current) !== JSON.stringify(dependencies);
    prevDepsRef.current = dependencies;

    if (cleanupRef.current) {
      cleanupRef.current();
    }

    cleanupRef.current = effect();
  }, [dependencies, effect]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTimeRef.current;

    if (timeSinceLastRender < 1000) {
      // Only log if renders are frequent
      console.info(
        `🔄 ${componentName} rendered ${
          renderCountRef.current
        } times in ${timeSinceLastRender.toFixed(2)}ms`
      );
    }

    lastRenderTimeRef.current = currentTime;
  }, [dependencies, componentName]);

  return renderCountRef.current;
};

// Optimized event handler hook
export const useEventHandler = (handler) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((event) => {
    if (handlerRef.current) {
      handlerRef.current(event);
    }
  }, []);
};

// Optimized state with validation
export const useValidatedState = (initialValue, validator) => {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);

  const setValidatedValue = useCallback(
    (newValue) => {
      setValue(newValue);

      if (validator) {
        try {
          const validationResult = validator(newValue);
          setIsValid(validationResult === true);
          setError(validationResult === true ? null : validationResult);
        } catch (err) {
          setIsValid(false);
          setError(err.message);
        }
      }
    },
    [validator]
  );

  return [value, setValidatedValue, isValid, error];
};
