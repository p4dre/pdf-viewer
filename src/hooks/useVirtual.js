import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useScroll from "./useScroll";
import useMeasureRect from "./useMeasureRect";
var COMPARE_EPSILON = 0.000000000001;

var chunk = function (arr, size) {
  return arr.reduce(function (acc, e, i) {
    return i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc;
  }, []);
};

var __assign = function () {
  __assign =
    Object.assign ||
    function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
};

var buildContainerStyles = function (totalSize, scrollMode) {
  switch (scrollMode) {
    case ScrollMode.Horizontal:
      return {
        position: "relative",
        height: "100%",
        width: "".concat(totalSize.width, "px"),
      };
    case ScrollMode.Vertical:
    default:
      return {
        position: "relative",
        height: "".concat(totalSize.height, "px"),
        width: "100%",
      };
  }
};

var buildItemContainerStyles = function (item, parentRect, scrollMode) {
  return scrollMode !== ScrollMode.Page
    ? {}
    : {
        height: "".concat(parentRect.height, "px"),
        width: "100%",
        position: "absolute",
        top: 0,
        transform: "translateY(".concat(item.start.top, "px)"),
      };
};

var buildItemStyles = function (item, isRtl, sizes, viewMode, scrollMode) {
  var _a, _b, _c, _d, _e, _f, _g;
  var sideProperty = isRtl ? "right" : "left";
  var factor = isRtl ? -1 : 1;
  var numberOfItems = sizes.length;
  var left = item.start.left * factor;
  var _h = item.size,
    height = _h.height,
    width = _h.width;
  if (viewMode === ViewMode.DualPageWithCover) {
    var transformTop = scrollMode === ScrollMode.Page ? 0 : item.start.top;
    if (item.index === 0 || (numberOfItems % 2 === 0 && item.index === numberOfItems - 1)) {
      return (
        (_a = {
          height: "".concat(height, "px"),
          minWidth: "".concat(getMinWidthOfCover(sizes, viewMode), "px"),
          width: "100%",
        }),
        (_a[sideProperty] = 0),
        (_a.position = "absolute"),
        (_a.top = 0),
        (_a.transform = "translate(".concat(left, "px, ").concat(transformTop, "px)")),
        _a
      );
    }
    return (
      (_b = {
        height: "".concat(height, "px"),
        width: "".concat(width, "px"),
      }),
      (_b[sideProperty] = 0),
      (_b.position = "absolute"),
      (_b.top = 0),
      (_b.transform = "translate(".concat(left, "px, ").concat(transformTop, "px)")),
      _b
    );
  }
  if (viewMode === ViewMode.DualPage) {
    return (
      (_c = {
        height: "".concat(height, "px"),
        width: "".concat(width, "px"),
      }),
      (_c[sideProperty] = 0),
      (_c.position = "absolute"),
      (_c.top = 0),
      (_c.transform = "translate(".concat(left, "px, ").concat(scrollMode === ScrollMode.Page ? 0 : item.start.top, "px)")),
      _c
    );
  }
  switch (scrollMode) {
    case ScrollMode.Horizontal:
      return (
        (_d = {
          height: "100%",
          width: "".concat(width, "px"),
        }),
        (_d[sideProperty] = 0),
        (_d.position = "absolute"),
        (_d.top = 0),
        (_d.transform = "translateX(".concat(left, "px)")),
        _d
      );
    case ScrollMode.Page:
      return (
        (_e = {
          height: "".concat(height, "px"),
          width: "".concat(width, "px"),
        }),
        (_e[sideProperty] = 0),
        (_e.position = "absolute"),
        (_e.top = 0),
        _e
      );
    case ScrollMode.Wrapped:
      return (
        (_f = {
          height: "".concat(height, "px"),
          width: "".concat(width, "px"),
        }),
        (_f[sideProperty] = 0),
        (_f.position = "absolute"),
        (_f.top = 0),
        (_f.transform = "translate(".concat(left, "px, ").concat(item.start.top, "px)")),
        _f
      );
    case ScrollMode.Vertical:
    default:
      return (
        (_g = {
          height: "".concat(height, "px"),
          width: "100%",
        }),
        (_g[sideProperty] = 0),
        (_g.position = "absolute"),
        (_g.top = 0),
        (_g.transform = "translateY(".concat(item.start.top, "px)")),
        _g
      );
  }
};

var hasDifferentSizes = function (sizes) {
  var numberOfItems = sizes.length;
  if (numberOfItems === 1) {
    return false;
  }
  for (var i = 1; i < numberOfItems; i++) {
    if (sizes[i].height !== sizes[0].height || sizes[i].width !== sizes[0].width) {
      return true;
    }
  }
  return false;
};

var getMinWidthOfCover = function (sizes, viewMode) {
  if (viewMode !== ViewMode.DualPageWithCover) {
    return 0;
  }
  if (!hasDifferentSizes(sizes)) {
    return 2 * sizes[0].width;
  }
  var chunkWidths = chunk(sizes.slice(1), 2).map(function (eachChunk) {
    return eachChunk.length === 2 ? eachChunk[0].width + eachChunk[1].width : eachChunk[0].width;
  });
  var widths = [sizes[0].width].concat(chunkWidths);
  return Math.max.apply(Math, widths);
};

var VIRTUAL_INDEX_ATTR = "data-virtual-index";
var IO_THRESHOLD = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
var ZERO_OFFSET$1 = {
  left: 0,
  top: 0,
};

var ZERO_OFFSET$2 = {
  left: 0,
  top: 0,
};

var ZERO_OFFSET$3 = {
  left: 0,
  top: 0,
};

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
}

var ZERO_OFFSET$5 = {
  left: 0,
  top: 0,
};

var ZERO_RECT$2 = {
  height: 0,
  width: 0,
};

var clamp = function (min, max, value) {
  return Math.max(min, Math.min(value, max));
};

var indexOfMax = function (arr) {
  return arr.reduce(function (prev, curr, i, a) {
    return curr > a[prev] ? i : prev;
  }, 0);
};

var findNearest = function (low, high, value, getItemValue) {
  while (low <= high) {
    var middle = ((low + high) / 2) | 0;
    var currentValue = getItemValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  return low > 0 ? low - 1 : 0;
};

var calculateRange = function (scrollDirection, measurements, outerSize, scrollOffset) {
  var currentOffset = 0;
  switch (scrollDirection) {
    case ScrollDirection.Horizontal:
      currentOffset = scrollOffset.left;
      break;
    case ScrollDirection.Vertical:
    default:
      currentOffset = scrollOffset.top;
      break;
  }
  var size = measurements.length - 1;
  var getOffset = function (index) {
    switch (scrollDirection) {
      case ScrollDirection.Horizontal:
        return measurements[index].start.left;
      case ScrollDirection.Both:
      case ScrollDirection.Vertical:
      default:
        return measurements[index].start.top;
    }
  };
  var start = findNearest(0, size, currentOffset, getOffset);
  if (scrollDirection === ScrollDirection.Both) {
    var startTop = measurements[start].start.top;
    while (start - 1 >= 0 && measurements[start - 1].start.top === startTop && measurements[start - 1].start.left >= scrollOffset.left) {
      start--;
    }
  }
  var end = start;
  while (end <= size) {
    var topLeftCorner = {
      top: measurements[end].start.top - scrollOffset.top,
      left: measurements[end].start.left - scrollOffset.left,
    };
    var visibleSize = {
      height: outerSize.height - topLeftCorner.top,
      width: outerSize.width - topLeftCorner.left,
    };
    if (scrollDirection === ScrollDirection.Horizontal && visibleSize.width < 0) {
      break;
    }
    if (scrollDirection === ScrollDirection.Vertical && visibleSize.height < 0) {
      break;
    }
    if (scrollDirection === ScrollDirection.Both && (visibleSize.width < 0 || visibleSize.height < 0)) {
      break;
    }
    end++;
  }
  return {
    start: start,
    end: end,
  };
};

var measure = function (numberOfItems, parentRect, sizes, scrollMode) {
  var measurements = [];
  var totalWidth = 0;
  var firstOfRow = {
    left: 0,
    top: 0,
  };
  var maxHeight = 0;
  var start = ZERO_OFFSET$5;
  for (var i = 0; i < numberOfItems; i++) {
    var size = sizes[i];
    if (i === 0) {
      totalWidth = size.width;
      firstOfRow = {
        left: 0,
        top: 0,
      };
      maxHeight = size.height;
    } else {
      switch (scrollMode) {
        case ScrollMode.Wrapped:
          totalWidth += size.width;
          if (totalWidth < parentRect.width) {
            start = {
              left: measurements[i - 1].end.left,
              top: firstOfRow.top,
            };
            maxHeight = Math.max(maxHeight, size.height);
          } else {
            totalWidth = size.width;
            start = {
              left: firstOfRow.left,
              top: firstOfRow.top + maxHeight,
            };
            firstOfRow = {
              left: start.left,
              top: start.top,
            };
            maxHeight = size.height;
          }
          break;
        case ScrollMode.Horizontal:
        case ScrollMode.Vertical:
        default:
          start = measurements[i - 1].end;
          break;
      }
    }
    var end = {
      left: start.left + size.width,
      top: start.top + size.height,
    };
    measurements[i] = {
      index: i,
      start: start,
      size: size,
      end: end,
      visibility: -1,
    };
  }
  return measurements;
};

var ZERO_OFFSET$4 = {
  left: 0,
  top: 0,
};
var measureDualPage = function (numberOfItems, parentRect, sizes, scrollMode) {
  var measurements = [];
  var top = 0;
  var maxHeight = 0;
  var start = ZERO_OFFSET$4;
  for (var i = 0; i < numberOfItems; i++) {
    var size = {
      height: scrollMode === ScrollMode.Page ? Math.max(parentRect.height, sizes[i].height) : sizes[i].height,
      width: Math.max(parentRect.width / 2, sizes[i].width),
    };
    if (scrollMode === ScrollMode.Page) {
      start = {
        left: i % 2 === 0 ? 0 : size.width,
        top: Math.floor(i / 2) * size.height,
      };
    } else {
      if (i % 2 === 0) {
        top = top + maxHeight;
        start = {
          left: 0,
          top: top,
        };
        maxHeight = i === numberOfItems - 1 ? sizes[i].height : Math.max(sizes[i].height, sizes[i + 1].height);
      } else {
        start = {
          left: measurements[i - 1].end.left,
          top: top,
        };
      }
    }
    var end = {
      left: start.left + size.width,
      top: start.top + size.height,
    };
    measurements[i] = {
      index: i,
      start: start,
      size: size,
      end: end,
      visibility: -1,
    };
  }
  return measurements;
};

var measureDualPageWithCover = function (numberOfItems, parentRect, sizes, scrollMode) {
  var measurements = [];
  var top = 0;
  var maxHeight = 0;
  var start = ZERO_OFFSET$3;
  for (var i = 0; i < numberOfItems; i++) {
    var size =
      i === 0
        ? {
            height: scrollMode === ScrollMode.Page ? Math.max(parentRect.height, sizes[i].height) : sizes[i].height,
            width: scrollMode === ScrollMode.Page ? Math.max(parentRect.width, sizes[i].width) : sizes[i].width,
          }
        : {
            height: scrollMode === ScrollMode.Page ? Math.max(parentRect.height, sizes[i].height) : sizes[i].height,
            width: Math.max(parentRect.width / 2, sizes[i].width),
          };
    if (scrollMode === ScrollMode.Page) {
      start =
        i === 0
          ? ZERO_OFFSET$3
          : {
              left: i % 2 === 0 ? size.width : 0,
              top: Math.floor((i - 1) / 2) * size.height + measurements[0].end.top,
            };
    } else {
      if (i === 0) {
        start = ZERO_OFFSET$3;
        top = sizes[0].height;
        maxHeight = 0;
      } else if (i % 2 === 1) {
        top = top + maxHeight;
        start = {
          left: 0,
          top: top,
        };
        maxHeight = i === numberOfItems - 1 ? sizes[i].height : Math.max(sizes[i].height, sizes[i + 1].height);
      } else {
        start = {
          left: measurements[i - 1].end.left,
          top: top,
        };
      }
    }
    var end = {
      left: start.left + size.width,
      top: start.top + size.height,
    };
    measurements[i] = {
      index: i,
      start: start,
      size: size,
      end: end,
      visibility: -1,
    };
  }
  return measurements;
};

let ScrollMode;
(function (ScrollMode) {
  ScrollMode["Page"] = "Page";
  ScrollMode["Horizontal"] = "Horizontal";
  ScrollMode["Vertical"] = "Vertical";
  ScrollMode["Wrapped"] = "Wrapped";
})(ScrollMode || (ScrollMode = {}));

let ViewMode;
(function (ViewMode) {
  ViewMode["DualPage"] = "DualPage";
  ViewMode["DualPageWithCover"] = "DualPageWithCover";
  ViewMode["SinglePage"] = "SinglePage";
})(ViewMode || (ViewMode = {}));

var ScrollDirection;
(function (ScrollDirection) {
  ScrollDirection["Horizontal"] = "Horizontal";
  ScrollDirection["Vertical"] = "Vertical";
  ScrollDirection["Both"] = "Both";
})(ScrollDirection || (ScrollDirection = {}));

var measureSinglePage = function (numberOfItems, parentRect, sizes) {
  var measurements = [];
  for (var i = 0; i < numberOfItems; i++) {
    var size = {
      height: Math.max(parentRect.height, sizes[i].height),
      width: Math.max(parentRect.width, sizes[i].width),
    };
    var start = i === 0 ? ZERO_OFFSET$2 : measurements[i - 1].end;
    var end = {
      left: start.left + size.width,
      top: start.top + size.height,
    };
    measurements[i] = {
      index: i,
      start: start,
      size: size,
      end: end,
      visibility: -1,
    };
  }
  return measurements;
};

const useVirtual = function (props) {
  const { enableSmoothScroll, isRtl, numberOfItems, parentRef, setRenderRange, sizes, scrollMode, viewMode } = props;
  const [isSmoothScrolling, setSmoothScrolling] = useState(false);
  const onSmoothScroll = useCallback((isSmoothScrolling) => {
    return setSmoothScrolling(isSmoothScrolling);
  }, []);
  var scrollModeRef = useRef(scrollMode);
  scrollModeRef.current = scrollMode;
  var viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  var scrollDirection = scrollMode === ScrollMode.Wrapped || viewMode === ViewMode.DualPageWithCover || viewMode === ViewMode.DualPage ? ScrollDirection.Both : scrollMode === ScrollMode.Horizontal ? ScrollDirection.Horizontal : ScrollDirection.Vertical;
  var _c = useScroll({
      elementRef: parentRef,
      enableSmoothScroll: enableSmoothScroll,
      isRtl: isRtl,
      scrollDirection: scrollDirection,
      onSmoothScroll: onSmoothScroll,
    }),
    scrollOffset = _c.scrollOffset,
    scrollTo = _c.scrollTo;
  var parentRect = useMeasureRect({
    elementRef: parentRef,
  });
  var latestRef = useRef({
    scrollOffset: ZERO_OFFSET$1,
    measurements: [],
  });
  latestRef.current.scrollOffset = scrollOffset;
  var defaultVisibilities = useMemo(function () {
    return Array(numberOfItems).fill(-1);
  }, []);
  var _d = useState(defaultVisibilities),
    visibilities = _d[0],
    setVisibilities = _d[1];
  var intersectionTracker = useMemo(function () {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var ratio = entry.isIntersecting ? entry.intersectionRatio : -1;
          var target = entry.target;
          var indexAttribute = target.getAttribute(VIRTUAL_INDEX_ATTR);
          if (!indexAttribute) {
            return;
          }
          var index = parseInt(indexAttribute, 10);
          if (0 <= index && index < numberOfItems) {
            setVisibilities(function (old) {
              old[index] = ratio;
              return __spreadArray([], old, true);
            });
          }
        });
      },
      {
        threshold: IO_THRESHOLD,
      }
    );
    return io;
  }, []);
  var measurements = useMemo(
    function () {
      if (scrollMode === ScrollMode.Page && viewMode === ViewMode.SinglePage) {
        return measureSinglePage(numberOfItems, parentRect, sizes);
      }
      if (viewMode === ViewMode.DualPageWithCover) {
        return measureDualPageWithCover(numberOfItems, parentRect, sizes, scrollMode);
      }
      if (viewMode === ViewMode.DualPage) {
        return measureDualPage(numberOfItems, parentRect, sizes, scrollMode);
      }
      return measure(numberOfItems, parentRect, sizes, scrollMode);
    },
    [scrollMode, sizes, viewMode, parentRect]
  );
  var totalSize = measurements[numberOfItems - 1]
    ? {
        height: measurements[numberOfItems - 1].end.top,
        width: measurements[numberOfItems - 1].end.left,
      }
    : ZERO_RECT$2;
  latestRef.current.measurements = measurements;
  var _e = useMemo(
      function () {
        var _a = calculateRange(scrollDirection, measurements, parentRect, scrollOffset),
          start = _a.start,
          end = _a.end;
        var visiblePageVisibilities = visibilities.slice(clamp(0, numberOfItems, start), clamp(0, numberOfItems, end));
        var maxVisbilityItem = start + indexOfMax(visiblePageVisibilities);
        maxVisbilityItem = clamp(0, numberOfItems - 1, maxVisbilityItem);
        var maxVisbilityIndex = maxVisbilityItem;
        var _b = setRenderRange({
            endPage: end,
            numPages: numberOfItems,
            startPage: start,
          }),
          startPage = _b.startPage,
          endPage = _b.endPage;
        startPage = Math.max(startPage, 0);
        endPage = Math.min(endPage, numberOfItems - 1);
        switch (viewMode) {
          case ViewMode.DualPageWithCover:
            if (maxVisbilityItem > 0) {
              maxVisbilityIndex = maxVisbilityItem % 2 === 1 ? maxVisbilityItem : maxVisbilityItem - 1;
            }
            startPage = startPage === 0 ? 0 : startPage % 2 === 1 ? startPage : startPage - 1;
            endPage = endPage % 2 === 1 ? endPage - 1 : endPage;
            if (numberOfItems - endPage <= 2) {
              endPage = numberOfItems - 1;
            }
            break;
          case ViewMode.DualPage:
            maxVisbilityIndex = maxVisbilityItem % 2 === 0 ? maxVisbilityItem : maxVisbilityItem - 1;
            startPage = startPage % 2 === 0 ? startPage : startPage - 1;
            endPage = endPage % 2 === 1 ? endPage : endPage - 1;
            break;
          case ViewMode.SinglePage:
          default:
            maxVisbilityIndex = maxVisbilityItem;
            break;
        }
        return {
          startPage: startPage,
          endPage: endPage,
          maxVisbilityIndex: maxVisbilityIndex,
        };
      },
      [measurements, parentRect, scrollOffset, viewMode, visibilities]
    ),
    startPage = _e.startPage,
    endPage = _e.endPage,
    maxVisbilityIndex = _e.maxVisbilityIndex;
  var virtualItems = useMemo(
    function () {
      var virtualItems = [];
      var _loop_1 = function (i) {
        var item = measurements[i];
        var virtualItem = __assign(__assign({}, item), {
          visibility: visibilities[i] !== undefined ? visibilities[i] : -1,
          measureRef: function (ele) {
            if (!ele) {
              return;
            }
            ele.setAttribute(VIRTUAL_INDEX_ATTR, "".concat(i));
            intersectionTracker.observe(ele);
          },
        });
        virtualItems.push(virtualItem);
      };
      for (var i = startPage; i <= endPage; i++) {
        _loop_1(i);
      }
      return virtualItems;
    },
    [startPage, endPage, visibilities, measurements]
  );
  var scrollToItem = useCallback(
    function (index, offset) {
      var measurements = latestRef.current.measurements;
      var normalizedIndex = clamp(0, numberOfItems - 1, index);
      var measurement = measurements[normalizedIndex];
      var withOffset = scrollModeRef.current === ScrollMode.Page ? ZERO_OFFSET$1 : offset;
      return measurement
        ? scrollTo(
            {
              left: withOffset.left + measurement.start.left,
              top: withOffset.top + measurement.start.top,
            },
            enableSmoothScroll
          )
        : Promise.resolve();
    },
    [scrollTo, enableSmoothScroll]
  );
  var scrollToSmallestItemAbove = useCallback(function (index, offset) {
    var measurements = latestRef.current.measurements;
    var start = measurements[index].start;
    var nextItem = measurements.find(function (item) {
      return item.start.top - start.top > COMPARE_EPSILON;
    });
    if (!nextItem) {
      return Promise.resolve();
    }
    var nextIndex = nextItem.index;
    switch (viewModeRef.current) {
      case ViewMode.DualPage:
        nextIndex = nextIndex % 2 === 0 ? nextIndex : nextIndex + 1;
        break;
      case ViewMode.DualPageWithCover:
        nextIndex = nextIndex % 2 === 1 ? nextIndex : nextIndex + 1;
        break;
    }
    return scrollToItem(nextIndex, offset);
  }, []);
  var scrollToBiggestItemBelow = useCallback(function (index, offset) {
    var measurements = latestRef.current.measurements;
    var start = measurements[index].start;
    var prevIndex = index;
    var found = false;
    for (var i = numberOfItems - 1; i >= 0; i--) {
      if (start.top - measurements[i].start.top > COMPARE_EPSILON) {
        found = true;
        prevIndex = measurements[i].index;
        break;
      }
    }
    if (!found) {
      return Promise.resolve();
    }
    switch (viewModeRef.current) {
      case ViewMode.DualPage:
        prevIndex = prevIndex % 2 === 0 ? prevIndex : prevIndex - 1;
        break;
      case ViewMode.DualPageWithCover:
        prevIndex = prevIndex % 2 === 0 ? prevIndex - 1 : prevIndex;
        break;
    }
    if (prevIndex === index) {
      prevIndex = index - 1;
    }
    return scrollToItem(prevIndex, offset);
  }, []);
  var scrollToNextItem = useCallback(function (index, offset) {
    if (viewModeRef.current === ViewMode.DualPageWithCover || viewModeRef.current === ViewMode.DualPage) {
      return scrollToSmallestItemAbove(index, offset);
    }
    switch (scrollModeRef.current) {
      case ScrollMode.Wrapped:
        return scrollToSmallestItemAbove(index, offset);
      case ScrollMode.Horizontal:
      case ScrollMode.Vertical:
      default:
        return scrollToItem(index + 1, offset);
    }
  }, []);
  var scrollToPreviousItem = useCallback(function (index, offset) {
    if (viewModeRef.current === ViewMode.DualPageWithCover || viewModeRef.current === ViewMode.DualPage) {
      return scrollToBiggestItemBelow(index, offset);
    }
    switch (scrollModeRef.current) {
      case ScrollMode.Wrapped:
        return scrollToBiggestItemBelow(index, offset);
      case ScrollMode.Horizontal:
      case ScrollMode.Vertical:
      default:
        return scrollToItem(index - 1, offset);
    }
  }, []);
  var getContainerStyles = useCallback(
    function () {
      return buildContainerStyles(totalSize, scrollModeRef.current);
    },
    [totalSize]
  );
  var getItemContainerStyles = useCallback(
    function (item) {
      return buildItemContainerStyles(item, parentRect, scrollModeRef.current);
    },
    [parentRect]
  );
  var getItemStyles = useCallback(
    function (item) {
      return buildItemStyles(item, isRtl, sizes, viewModeRef.current, scrollModeRef.current);
    },
    [isRtl, sizes]
  );
  var zoom = useCallback(function (scale, index) {
    var _a = latestRef.current,
      measurements = _a.measurements,
      scrollOffset = _a.scrollOffset;
    var normalizedIndex = clamp(0, numberOfItems - 1, index);
    var measurement = measurements[normalizedIndex];
    if (measurement) {
      var updateOffset =
        scrollModeRef.current === ScrollMode.Page
          ? {
              left: measurement.start.left,
              top: measurement.start.top,
            }
          : {
              left: scrollOffset.left * scale,
              top: scrollOffset.top * scale,
            };
      return scrollTo(updateOffset, false);
    }
    return Promise.resolve();
  }, []);
  useEffect(function () {
    return function () {
      intersectionTracker.disconnect();
    };
  }, []);
  return {
    boundingClientRect: parentRect,
    isSmoothScrolling: isSmoothScrolling,
    startPage: startPage,
    endPage: endPage,
    maxVisbilityIndex: maxVisbilityIndex,
    virtualItems: virtualItems,
    getContainerStyles: getContainerStyles,
    getItemContainerStyles: getItemContainerStyles,
    getItemStyles: getItemStyles,
    scrollToItem: scrollToItem,
    scrollToNextItem: scrollToNextItem,
    scrollToPreviousItem: scrollToPreviousItem,
    zoom: zoom,
  };
};

export default useVirtual;
