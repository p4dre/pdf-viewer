import { useRef, useEffect } from "react";
const useIsMounted = function () {
  var isMountedRef = useRef(false);
  useEffect(function () {
    isMountedRef.current = true;
    return function () {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
};

export default useIsMounted;
