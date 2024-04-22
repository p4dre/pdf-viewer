import { useState, useRef, useReducer, useLayoutEffect, useEffect } from "react";

var rectReducer = function (state, action) {
  var rect = action.rect;
  return state.height !== rect.height || state.width !== rect.width ? rect : state;
};

var useMeasureRect = function (props) {
  const elementRef = props.elementRef;
  const [element, setElement] = useState(elementRef.current);
  const initializedRectRef = useRef(false);
  const [rect, dispatch] = useReducer(rectReducer, { height: 0, width: 0 });
  useLayoutEffect(function () {
    if (elementRef.current !== element) {
      setElement(elementRef.current);
    }
  });
  useLayoutEffect(
    function () {
      if (element && !initializedRectRef.current) {
        initializedRectRef.current = true;
        var _a = element.getBoundingClientRect(),
          height = props.height,
          width = props.width;
        dispatch({
          rect: { height: height, width: width },
        });
      }
    },
    [element]
  );
  useEffect(
    function () {
      if (!element) {
        return;
      }
      var tracker = new ResizeObserver(function (entries, __) {
        entries.forEach(function (entry) {
          if (entry.target === element) {
            var _a = entry.contentRect,
              height = props.height,
              width = props.width;
            dispatch({
              rect: { height: height, width: width },
            });
          }
        });
      });
      tracker.observe(element);
      return function () {
        tracker.unobserve(element);
      };
    },
    [element]
  );
  return rect;
};

export default useMeasureRect;
