import { useRef, useEffect, useCallback } from "react";

const useDebounceCallback = (callback, wait) => {
  var timeout = useRef();
  var cleanup = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  };
  useEffect(() => {
    return () => {
      return cleanup();
    };
  }, []);
  return useCallback(
    function () {
      var args = [];
      for (let _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      cleanup();
      timeout.current = setTimeout(() => {
        callback.apply(void 0, args);
      }, wait);
    },
    [callback, wait]
  );
};

export default useDebounceCallback;
