import { useRef, useLayoutEffect } from "react";

const useRunOnce = (cb, condition) => {
  var isCalledRef = useRef(false);
  useLayoutEffect(() => {
    if (condition && !isCalledRef.current) {
      isCalledRef.current = true;
      cb();
    }
  }, [cb, condition]);
};

export default useRunOnce;
