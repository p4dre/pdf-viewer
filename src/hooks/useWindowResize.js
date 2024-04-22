import { useState, useLayoutEffect } from "react";
import useDebounceCallback from "./useDebounceCallback";
var RESIZE_EVENT_OPTIONS = {
  capture: false,
  passive: true,
};

var ZERO_RECT$1 = {
  height: 0,
  width: 0,
};
var useWindowResize = function () {
  var _a = useState(ZERO_RECT$1),
    windowRect = _a[0],
    setWindowRect = _a[1];
  var handleResize = useDebounceCallback(function () {
    setWindowRect({
      height: window.innerHeight,
      width: window.innerWidth,
    });
  }, 100);
  useLayoutEffect(function () {
    window.addEventListener("resize", handleResize, RESIZE_EVENT_OPTIONS);
    return function () {
      window.removeEventListener("resize", handleResize, RESIZE_EVENT_OPTIONS);
    };
  }, []);
  return windowRect;
};

export default useWindowResize;
