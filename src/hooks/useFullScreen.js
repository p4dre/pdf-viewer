import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import useWindowResize from "./useWindowResize";

let ScrollMode;
(function (ScrollMode) {
  ScrollMode["Page"] = "Page";
  ScrollMode["Horizontal"] = "Horizontal";
  ScrollMode["Vertical"] = "Vertical";
  ScrollMode["Wrapped"] = "Wrapped";
})(ScrollMode || (ScrollMode = {}));

var Api;
(function (Api) {
  Api[(Api["ExitFullScreen"] = 0)] = "ExitFullScreen";
  Api[(Api["FullScreenChange"] = 1)] = "FullScreenChange";
  Api[(Api["FullScreenElement"] = 2)] = "FullScreenElement";
  Api[(Api["FullScreenEnabled"] = 3)] = "FullScreenEnabled";
  Api[(Api["RequestFullScreen"] = 4)] = "RequestFullScreen";
})(Api || (Api = {}));

var defaultVendor = {
  ExitFullScreen: "exitFullscreen",
  FullScreenChange: "fullscreenchange",
  FullScreenElement: "fullscreenElement",
  FullScreenEnabled: "fullscreenEnabled",
  RequestFullScreen: "requestFullscreen",
};
var webkitVendor = {
  ExitFullScreen: "webkitExitFullscreen",
  FullScreenChange: "webkitfullscreenchange",
  FullScreenElement: "webkitFullscreenElement",
  FullScreenEnabled: "webkitFullscreenEnabled",
  RequestFullScreen: "webkitRequestFullscreen",
};
var msVendor = {
  ExitFullScreen: "msExitFullscreen",
  FullScreenChange: "msFullscreenChange",
  FullScreenElement: "msFullscreenElement",
  FullScreenEnabled: "msFullscreenEnabled",
  RequestFullScreen: "msRequestFullscreen",
};
var ZERO_RECT = {
  height: 0,
  width: 0,
};

var isBrowser = typeof window !== "undefined";
var vendor = isBrowser ? (Api.FullScreenEnabled in document && defaultVendor) || (webkitVendor.FullScreenEnabled in document && webkitVendor) || (msVendor.FullScreenEnabled in document && msVendor) || defaultVendor : defaultVendor;

let FullScreenMode = void 0;
(function (FullScreenMode) {
  FullScreenMode["Normal"] = "Normal";
  FullScreenMode["Entering"] = "Entering";
  FullScreenMode["Entered"] = "Entered";
  FullScreenMode["EnteredCompletely"] = "EnteredCompletely";
  FullScreenMode["Exitting"] = "Exitting";
  FullScreenMode["Exited"] = "Exited";
})(FullScreenMode || (FullScreenMode = {}));

var addFullScreenChangeListener = function (handler) {
  if (isBrowser) {
    document.addEventListener(vendor.FullScreenChange, handler);
  }
};

var removeFullScreenChangeListener = function (handler) {
  if (isBrowser) {
    document.removeEventListener(vendor.FullScreenChange, handler);
  }
};

var isFullScreenEnabled = function () {
  return isBrowser && vendor.FullScreenEnabled in document && document[vendor.FullScreenEnabled] === true;
};

var requestFullScreen = function (element) {
  if (isBrowser) {
    element[vendor.RequestFullScreen]();
  }
};

var getFullScreenElement = function () {
  return isBrowser ? document[vendor.FullScreenElement] : null;
};

var exitFullScreen = function (element) {
  return isBrowser ? element[vendor.ExitFullScreen]() : Promise.resolve({});
};

const useFullScreen = (props) => {
  const { getCurrentPage, getCurrentScrollMode, jumpToPage, targetRef } = props;
  const [fullScreenMode, setFullScreenMode] = useState(FullScreenMode.Normal);
  const windowRect = useWindowResize();
  const [targetRect, setTargetRect] = useState(ZERO_RECT);
  const windowSizeBeforeFullScreenRef = useRef(ZERO_RECT);
  const targetPageRef = useRef(getCurrentPage());
  const fullScreenSizeRef = useRef(ZERO_RECT);
  const [element, setElement] = useState(targetRef.current);
  const fullScreenElementRef = useRef();
  useLayoutEffect(() => {
    if (targetRef.current !== element) {
      setElement(targetRef.current);
    }
  }, []);
  useLayoutEffect(() => {
    if (!element) {
      return;
    }
    const io = new ResizeObserver((entries) => {
      entries.forEach(function (entry) {
        const _a = entry.target.getBoundingClientRect(),
          height = _a.height,
          width = _a.width;
        setTargetRect({ height: height, width: width });
      });
    });
    io.observe(element);
    return () => {
      io.unobserve(element);
      io.disconnect();
    };
  }, [element]);
  const closeOtherFullScreen = useCallback((target) => {
    const currentFullScreenEle = getFullScreenElement();
    if (currentFullScreenEle && currentFullScreenEle !== target) {
      setFullScreenMode(FullScreenMode.Normal);
      return exitFullScreen(currentFullScreenEle);
    }
    return Promise.resolve();
  }, []);
  const enterFullScreenMode = useCallback((target) => {
    if (!target || !isFullScreenEnabled()) {
      return;
    }
    setElement(target);
    closeOtherFullScreen(target).then(() => {
      fullScreenElementRef.current = target;
      setFullScreenMode(FullScreenMode.Entering);
      requestFullScreen(target);
    });
  }, []);
  const exitFullScreenMode = useCallback(() => {
    const currentFullScreenEle = getFullScreenElement();
    if (currentFullScreenEle) {
      setFullScreenMode(FullScreenMode.Exitting);
      exitFullScreen(document);
    }
  }, []);
  const handleFullScreenChange = useCallback(
    function () {
      if (!element) {
        return;
      }
      const currentFullScreenEle = getFullScreenElement();
      if (currentFullScreenEle !== element) {
        setFullScreenMode(FullScreenMode.Exitting);
      }
    },
    [element]
  );
  useEffect(() => {
    switch (fullScreenMode) {
      case FullScreenMode.Entering:
        if (fullScreenElementRef.current) {
          fullScreenElementRef.current.style.backgroundColor = "var(--rpv-core__full-screen-target-background-color)";
        }
        targetPageRef.current = getCurrentPage();
        windowSizeBeforeFullScreenRef.current = {
          height: window.innerHeight,
          width: window.innerWidth,
        };
        break;
      case FullScreenMode.Entered:
        if (getCurrentScrollMode() === ScrollMode.Page) {
          jumpToPage(targetPageRef.current).then(() => {
            setFullScreenMode(FullScreenMode.EnteredCompletely);
          });
        } else {
          setFullScreenMode(FullScreenMode.EnteredCompletely);
        }
        break;
      case FullScreenMode.Exitting:
        if (fullScreenElementRef.current) {
          fullScreenElementRef.current.style.backgroundColor = "";
          fullScreenElementRef.current = null;
        }
        targetPageRef.current = getCurrentPage();
        break;
      case FullScreenMode.Exited:
        setFullScreenMode(FullScreenMode.Normal);
        if (getCurrentScrollMode() === ScrollMode.Page) {
          jumpToPage(targetPageRef.current);
        }
        break;
    }
  }, [fullScreenMode]);
  useEffect(() => {
    if (fullScreenMode === FullScreenMode.Normal) {
      return;
    }
    if (fullScreenMode === FullScreenMode.Entering && windowRect.height === targetRect.height && windowRect.width === targetRect.width && windowRect.height > 0 && windowRect.width > 0 && (fullScreenSizeRef.current.height === 0 || windowRect.height == fullScreenSizeRef.current.height)) {
      fullScreenSizeRef.current = {
        height: window.innerHeight,
        width: window.innerWidth,
      };
      setFullScreenMode(FullScreenMode.Entered);
      return;
    }
    if (fullScreenMode === FullScreenMode.Exitting && windowSizeBeforeFullScreenRef.current.height === windowRect.height && windowSizeBeforeFullScreenRef.current.width === windowRect.width && windowRect.height > 0 && windowRect.width > 0) {
      setFullScreenMode(FullScreenMode.Exited);
    }
  }, [fullScreenMode, windowRect, targetRect]);
  useEffect(() => {
    addFullScreenChangeListener(handleFullScreenChange);
    return () => {
      removeFullScreenChangeListener(handleFullScreenChange);
    };
  }, [element]);
  return {
    enterFullScreenMode: enterFullScreenMode,
    exitFullScreenMode: exitFullScreenMode,
    fullScreenMode: fullScreenMode,
  };
};

export default useFullScreen;
