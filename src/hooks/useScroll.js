import { useState, useRef, useCallback, useLayoutEffect } from "react";

var ZERO_OFFSET$6 = {
  left: 0,
  top: 0,
};

var ScrollDirection;
(function (ScrollDirection) {
  ScrollDirection["Horizontal"] = "Horizontal";
  ScrollDirection["Vertical"] = "Vertical";
  ScrollDirection["Both"] = "Both";
})(ScrollDirection || (ScrollDirection = {}));
var SCROLL_DURATION = 400;

var easeOutQuart = function (t) {
  return 1 - Math.pow(1 - t, 4);
};
var SCROLL_EVENT_OPTIONS = {
  capture: false,
  passive: true,
};
var EPS = 0.0001;
var smoothScroll = function (ele, scrollDirection, targetPosition, duration, easing, onReachTarget) {
  if (easing === void 0) {
    easing = function (t) {
      return t;
    };
  }
  if (onReachTarget === void 0) {
    onReachTarget = function () {};
  }
  var top = 0;
  var left = 0;
  var reachTarget = false;
  switch (scrollDirection) {
    case ScrollDirection.Horizontal:
      left = ele.scrollLeft;
      top = 0;
    case ScrollDirection.Both:
      left = ele.scrollLeft;
      top = ele.scrollTop;
      break;
    case ScrollDirection.Vertical:
    default:
      left = 0;
      top = ele.scrollTop;
      break;
  }
  var markTargetReached = function () {
    if (!reachTarget) {
      reachTarget = true;
      ele.scrollLeft = targetPosition.left;
      ele.scrollTop = targetPosition.top;
      onReachTarget();
    }
  };
  if (Math.abs(top - targetPosition.top) <= EPS && scrollDirection === ScrollDirection.Vertical) {
    markTargetReached();
    return;
  }
  if (Math.abs(left - targetPosition.left) <= EPS && scrollDirection === ScrollDirection.Horizontal) {
    markTargetReached();
    return;
  }
  var startTime = -1;
  var requestId;
  var offset = {
    left: left - targetPosition.left,
    top: top - targetPosition.top,
  };
  var loop = function (currentTime) {
    if (startTime === -1) {
      startTime = currentTime;
    }
    var time = currentTime - startTime;
    var percent = Math.min(time / duration, 1);
    var easedPercent = easing(percent);
    var updatePosition = {
      left: left - offset.left * easedPercent,
      top: top - offset.top * easedPercent,
    };
    switch (scrollDirection) {
      case ScrollDirection.Horizontal:
        ele.scrollLeft = updatePosition.left;
        break;
      case ScrollDirection.Both:
        ele.scrollLeft = updatePosition.left;
        ele.scrollTop = updatePosition.top;
        break;
      case ScrollDirection.Vertical:
      default:
        ele.scrollTop = updatePosition.top;
        break;
    }
    if (Math.abs(updatePosition.top - targetPosition.top) <= EPS && Math.abs(updatePosition.left - targetPosition.left) <= EPS && !reachTarget) {
      window.cancelAnimationFrame(requestId);
      markTargetReached();
    }
    if (time < duration) {
      requestId = window.requestAnimationFrame(loop);
    } else {
      window.cancelAnimationFrame(requestId);
    }
  };
  requestId = window.requestAnimationFrame(loop);
};

const useScroll = (props) => {
  const { elementRef, enableSmoothScroll, isRtl, scrollDirection, onSmoothScroll } = props;
  const [scrollOffset, setScrollOffset] = useState(ZERO_OFFSET$6);
  const [element, setElement] = useState(elementRef.current);
  const factor = isRtl ? -1 : 1;
  const latestRef = useRef(scrollDirection);
  latestRef.current = scrollDirection;
  const latestOffsetRef = useRef(ZERO_OFFSET$6);
  const isSmoothScrollingDoneRef = useRef(true);
  const handleSmoothScrollingComplete = useCallback(() => {
    isSmoothScrollingDoneRef.current = true;
    if (enableSmoothScroll) {
      setScrollOffset(latestOffsetRef.current);
    }
    onSmoothScroll(false);
  }, []);
  var handleScroll = useCallback(
    function () {
      if (!element) {
        return;
      }
      switch (latestRef.current) {
        case ScrollDirection.Horizontal:
          latestOffsetRef.current = {
            left: factor * element.scrollLeft,
            top: 0,
          };
          break;
        case ScrollDirection.Both:
          latestOffsetRef.current = {
            left: factor * element.scrollLeft,
            top: element.scrollTop,
          };
          break;
        case ScrollDirection.Vertical:
        default:
          latestOffsetRef.current = {
            left: 0,
            top: element.scrollTop,
          };
          break;
      }
      if (!enableSmoothScroll || isSmoothScrollingDoneRef.current) {
        setScrollOffset(latestOffsetRef.current);
      }
    },
    [element]
  );
  useLayoutEffect(() => {
    setElement(elementRef.current);
  });
  useLayoutEffect(() => {
    if (!element) {
      return;
    }
    element.addEventListener("scroll", handleScroll, SCROLL_EVENT_OPTIONS);
    return function () {
      element.removeEventListener("scroll", handleScroll, SCROLL_EVENT_OPTIONS);
    };
  }, [element]);
  var scrollTo = useCallback(
    function (targetPosition, withSmoothScroll) {
      var ele = elementRef.current;
      if (!ele) {
        return Promise.resolve();
      }
      var updatePosition = {
        left: 0,
        top: 0,
      };
      switch (latestRef.current) {
        case ScrollDirection.Horizontal:
          updatePosition.left = factor * targetPosition.left;
          break;
        case ScrollDirection.Both:
          updatePosition.left = factor * targetPosition.left;
          updatePosition.top = targetPosition.top;
          break;
        case ScrollDirection.Vertical:
        default:
          updatePosition.top = targetPosition.top;
          break;
      }
      if (withSmoothScroll) {
        isSmoothScrollingDoneRef.current = false;
        onSmoothScroll(true);
        return new Promise(function (resolve, _) {
          smoothScroll(ele, latestRef.current, updatePosition, SCROLL_DURATION, easeOutQuart, function () {
            handleSmoothScrollingComplete();
            resolve();
          });
        });
      }
      return new Promise(function (resolve, _) {
        switch (latestRef.current) {
          case ScrollDirection.Horizontal:
            ele.scrollLeft = updatePosition.left;
            break;
          case ScrollDirection.Both:
            ele.scrollLeft = updatePosition.left;
            ele.scrollTop = updatePosition.top;
            break;
          case ScrollDirection.Vertical:
          default:
            ele.scrollTop = updatePosition.top;
            break;
        }
        resolve();
      });
    },
    [elementRef]
  );
  return {
    scrollOffset: scrollOffset,
    scrollTo: scrollTo,
  };
};

export default useScroll;
