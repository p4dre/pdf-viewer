import { Api, Position, SpecialZoomLevel, ViewMode } from "../enums";
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
const SCROLL_BAR_WIDTH = 17;
const PAGE_PADDING = 8;
var isBrowser = typeof window !== "undefined";
var vendor = isBrowser ? (Api.FullScreenEnabled in document && defaultVendor) || (webkitVendor.FullScreenEnabled in document && webkitVendor) || (msVendor.FullScreenEnabled in document && msVendor) || defaultVendor : defaultVendor;
const getDestination = function (doc, dest) {
  return new Promise(function (res) {
    new Promise(function (resolve) {
      if (typeof dest === "string") {
        doc.getDestination(dest).then(function (destArray) {
          resolve(destArray);
        });
      } else {
        resolve(dest);
      }
    }).then(function (destArray) {
      if ("object" === typeof destArray[0] && destArray[0] !== null) {
        var outlineRef_1 = destArray[0];
        var pageIndex = getPageIndex(doc, outlineRef_1);
        if (pageIndex === null) {
          doc.getPageIndex(outlineRef_1).then(function (pageIndex) {
            cacheOutlineRef(doc, outlineRef_1, pageIndex);
            getDestination(doc, dest).then(function (result) {
              return res(result);
            });
          });
        } else {
          res(normalizeDestination(pageIndex, destArray));
        }
      } else {
        var target = normalizeDestination(destArray[0], destArray);
        res(target);
      }
    });
  });
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

const isMac = function () {
  return typeof window !== "undefined" ? /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) : false;
};
var pageOutlinesMap = new Map();
var pagesMap = new Map();
const cacheOutlineRef = function (doc, outline, pageIndex) {
  pageOutlinesMap.set(generateRefKey(doc, outline), pageIndex);
};

const generateRefKey = function (doc, outline) {
  return ""
    .concat(doc.loadingTask.docId, "___")
    .concat(outline.num, "R")
    .concat(outline.gen === 0 ? "" : outline.gen);
};
const getPageIndex = function (doc, outline) {
  var key = generateRefKey(doc, outline);
  return pageOutlinesMap.has(key) ? pageOutlinesMap.get(key) : null;
};

const isFullScreenEnabled = function () {
  return isBrowser && vendor.FullScreenEnabled in document && document[vendor.FullScreenEnabled] === true;
};

const createStore = (initialState) => {
  var state = initialState || {};
  var listeners = {};
  var update = function (key, data) {
    var _a;
    state = __assign(__assign({}, state), ((_a = {}), (_a[key] = data), _a));
    (listeners[key] || []).forEach(function (handler) {
      return handler(state[key]);
    });
  };
  var get = function (key) {
    return state[key];
  };
  return {
    subscribe: function (key, handler) {
      listeners[key] = (listeners[key] || []).concat(handler);
    },
    unsubscribe: function (key, handler) {
      listeners[key] = (listeners[key] || []).filter(function (f) {
        return f !== handler;
      });
    },
    update: function (key, data) {
      update(key, data);
    },
    updateCurrentValue: function (key, updater) {
      var currentValue = get(key);
      if (currentValue !== undefined) {
        update(key, updater(currentValue));
      }
    },
    get: function (key) {
      return get(key);
    },
  };
};

const calculatePosition = (content, target, position, offset) => {
  var targetRect = target.getBoundingClientRect();
  var contentRect = content.getBoundingClientRect();
  var height = contentRect.height,
    width = contentRect.width;
  var top = 0;
  var left = 0;
  switch (position) {
    case Position.TopLeft:
      top = targetRect.top - height;
      left = targetRect.left;
      break;
    case Position.TopCenter:
      top = targetRect.top - height;
      left = targetRect.left + targetRect.width / 2 - width / 2;
      break;
    case Position.TopRight:
      top = targetRect.top - height;
      left = targetRect.left + targetRect.width - width;
      break;
    case Position.RightTop:
      top = targetRect.top;
      left = targetRect.left + targetRect.width;
      break;
    case Position.RightCenter:
      top = targetRect.top + targetRect.height / 2 - height / 2;
      left = targetRect.left + targetRect.width;
      break;
    case Position.RightBottom:
      top = targetRect.top + targetRect.height - height;
      left = targetRect.left + targetRect.width;
      break;
    case Position.BottomLeft:
      top = targetRect.top + targetRect.height;
      left = targetRect.left;
      break;
    case Position.BottomCenter:
      top = targetRect.top + targetRect.height;
      left = targetRect.left + targetRect.width / 2 - width / 2;
      break;
    case Position.BottomRight:
      top = targetRect.top + targetRect.height;
      left = targetRect.left + targetRect.width - width;
      break;
    case Position.LeftTop:
      top = targetRect.top;
      left = targetRect.left - width;
      break;
    case Position.LeftCenter:
      top = targetRect.top + targetRect.height / 2 - height / 2;
      left = targetRect.left - width;
      break;
    case Position.LeftBottom:
      top = targetRect.top + targetRect.height - height;
      left = targetRect.left - width;
      break;
  }
  return {
    left: left + (offset.left || 0),
    top: top + (offset.top || 0),
  };
};

const getPage = function (doc, pageIndex) {
  if (!doc) {
    return Promise.reject("The document is not loaded yet");
  }
  var pageKey = "".concat(doc.loadingTask.docId, "___").concat(pageIndex);
  var page = pagesMap.get(pageKey);
  if (page) {
    return Promise.resolve(page);
  }
  return new Promise(function (resolve, _) {
    doc.getPage(pageIndex + 1).then(function (page) {
      pagesMap.set(pageKey, page);
      if (page.ref) {
        cacheOutlineRef(doc, page.ref, pageIndex);
      }
      resolve(page);
    });
  });
};

let id = 0;
const uniqueId = function () {
  return id++;
};

const chunk = (arr, size) => {
  return arr.reduce((acc, e, i) => {
    return i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc;
  }, []);
};

const normalizeDestination = function (pageIndex, destArray) {
  switch (destArray[1].name) {
    case "XYZ":
      return {
        bottomOffset: function (_, viewportHeight) {
          return destArray[3] === null ? viewportHeight : destArray[3];
        },
        leftOffset: function (_, __) {
          return destArray[2] === null ? 0 : destArray[2];
        },
        pageIndex: pageIndex,
        scaleTo: destArray[4],
      };
    case "Fit":
    case "FitB":
      return {
        bottomOffset: 0,
        leftOffset: 0,
        pageIndex: pageIndex,
        scaleTo: SpecialZoomLevel.PageFit,
      };
    case "FitH":
    case "FitBH":
      return {
        bottomOffset: destArray[2],
        leftOffset: 0,
        pageIndex: pageIndex,
        scaleTo: SpecialZoomLevel.PageWidth,
      };
    default:
      return {
        bottomOffset: 0,
        leftOffset: 0,
        pageIndex: pageIndex,
        scaleTo: 1,
      };
  }
};

const calculateScale = (container, pageHeight, pageWidth, scale, viewMode, numPages) => {
  var w = pageWidth;
  switch (true) {
    case viewMode === ViewMode.DualPageWithCover && numPages >= 3:
    case viewMode === ViewMode.DualPage && numPages >= 3:
      w = 2 * pageWidth;
      break;
    default:
      w = pageWidth;
      break;
  }
  switch (scale) {
    case SpecialZoomLevel.ActualSize:
      return 1;
    case SpecialZoomLevel.PageFit:
      return Math.min((container.clientWidth - SCROLL_BAR_WIDTH) / w, (container.clientHeight - 2 * PAGE_PADDING) / pageHeight);
    case SpecialZoomLevel.PageWidth:
      return (container.clientWidth - SCROLL_BAR_WIDTH) / w;
  }
};

export { isMac, getDestination, isFullScreenEnabled, createStore, uniqueId, calculatePosition, getPage, chunk, getPageIndex, calculateScale };
