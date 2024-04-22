import { createElement, useRef } from "react";
import Annotation from "./Annotation";

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

var INVALID_PROTOCOL = /^([^\w]*)(javascript|data|vbscript)/im;
var HTML_ENTITIES = /&#(\w+)(^\w|;)?/g;
var CTRL_CHARS = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
var URL_SCHEME = /^([^:]+):/gm;
var decodeHtmlEntities = function (str) {
  return str.replace(HTML_ENTITIES, function (_, dec) {
    return String.fromCharCode(dec);
  });
};
let SpecialZoomLevel;
(function (SpecialZoomLevel) {
  SpecialZoomLevel["ActualSize"] = "ActualSize";
  SpecialZoomLevel["PageFit"] = "PageFit";
  SpecialZoomLevel["PageWidth"] = "PageWidth";
})(SpecialZoomLevel || (SpecialZoomLevel = {}));

var sanitizeUrl = function (url, defaultUrl) {
  if (defaultUrl === void 0) {
    defaultUrl = "about:blank";
  }
  var result = decodeHtmlEntities(url || "")
    .replace(CTRL_CHARS, "")
    .trim();
  if (!result) {
    return defaultUrl;
  }
  var firstChar = result[0];
  if (firstChar === "." || firstChar === "/") {
    return result;
  }
  var parsedUrlScheme = result.match(URL_SCHEME);
  if (!parsedUrlScheme) {
    return result;
  }
  var scheme = parsedUrlScheme[0];
  return INVALID_PROTOCOL.test(scheme) ? defaultUrl : result;
};

var normalizeDestination = function (pageIndex, destArray) {
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

var pageOutlinesMap = new Map();
var pagesMap = new Map();
var generateRefKey = function (doc, outline) {
  return ""
    .concat(doc.loadingTask.docId, "___")
    .concat(outline.num, "R")
    .concat(outline.gen === 0 ? "" : outline.gen);
};
var getPageIndex = function (doc, outline) {
  var key = generateRefKey(doc, outline);
  return pageOutlinesMap.has(key) ? pageOutlinesMap.get(key) : null;
};

var cacheOutlineRef = function (doc, outline, pageIndex) {
  pageOutlinesMap.set(generateRefKey(doc, outline), pageIndex);
};

var getDestination = function (doc, dest) {
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
var Link = function (_a) {
  var _b;
  var annotation = _a.annotation,
    annotationContainerRef = _a.annotationContainerRef,
    doc = _a.doc,
    outlines = _a.outlines,
    page = _a.page,
    pageIndex = _a.pageIndex,
    scale = _a.scale,
    viewport = _a.viewport,
    onExecuteNamedAction = _a.onExecuteNamedAction,
    onJumpFromLinkAnnotation = _a.onJumpFromLinkAnnotation,
    onJumpToDest = _a.onJumpToDest;
  var elementRef = useRef();
  var title =
    outlines && outlines.length && annotation.dest && typeof annotation.dest === "string"
      ? (_b = outlines.find(function (item) {
          return item.dest === annotation.dest;
        })) === null || _b === void 0
        ? void 0
        : _b.title
      : "";
  var link = function (e) {
    e.preventDefault();
    annotation.action
      ? onExecuteNamedAction(annotation.action)
      : getDestination(doc, annotation.dest).then(function (target) {
          var element = elementRef.current;
          var annotationContainer = annotationContainerRef.current;
          if (element && annotationContainer) {
            var linkRect = element.getBoundingClientRect();
            annotationContainer.style.setProperty("height", "100%");
            annotationContainer.style.setProperty("width", "100%");
            var annotationLayerRect = annotationContainer.getBoundingClientRect();
            annotationContainer.style.removeProperty("height");
            annotationContainer.style.removeProperty("width");
            var leftOffset = (linkRect.left - annotationLayerRect.left) / scale;
            var bottomOffset = (annotationLayerRect.bottom - linkRect.bottom + linkRect.height) / scale;
            onJumpFromLinkAnnotation({
              bottomOffset: bottomOffset,
              label: title,
              leftOffset: leftOffset,
              pageIndex: pageIndex,
            });
          }
          onJumpToDest(target);
        });
  };
  var isRenderable = !!(annotation.url || annotation.dest || annotation.action || annotation.unsafeUrl);
  var attrs = {};
  if (annotation.url || annotation.unsafeUrl) {
    var targetUrl = sanitizeUrl(annotation.url || annotation.unsafeUrl, "");
    if (targetUrl) {
      attrs = {
        "data-target": "external",
        href: targetUrl,
        rel: "noopener noreferrer nofollow",
        target: annotation.newWindow ? "_blank" : "",
        title: targetUrl,
      };
    } else {
      isRenderable = false;
    }
  } else {
    attrs = {
      href: "",
      "data-annotation-link": annotation.id,
      onClick: link,
    };
  }
  if (title) {
    attrs = Object.assign({}, attrs, {
      title: title,
      "aria-label": title,
    });
  }
  return createElement(
    Annotation,
    {
      annotation: annotation,
      hasPopup: false,
      ignoreBorder: false,
      isRenderable: isRenderable,
      page: page,
      viewport: viewport,
    },
    function (props) {
      return createElement(
        "div",
        __assign({}, props.slot.attrs, {
          className: "rpv-core__annotation rpv-core__annotation--link",
          "data-annotation-id": annotation.id,
          "data-testid": "core__annotation--link-".concat(annotation.id),
        }),
        createElement("a", __assign({ ref: elementRef }, attrs))
      );
    }
  );
};

export default Link;
