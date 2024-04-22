import { createElement, useLayoutEffect } from "react";
import Annotation from "./Annotation";
import PopupWrapper from "./PopupWrapper";

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

var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
var Popup = function (_a) {
  var annotation = _a.annotation,
    page = _a.page,
    viewport = _a.viewport;
  var title = getTitle(annotation);
  var contents = getContents(annotation);
  var isRenderable = !!(title || contents);
  var ignoredParents = ["Circle", "Ink", "Line", "Polygon", "PolyLine", "Square"];
  var hasPopup = !annotation.parentType || ignoredParents.indexOf(annotation.parentType) !== -1;
  useLayoutEffect(function () {
    if (!annotation.parentId) {
      return;
    }
    var parent = document.querySelector('[data-annotation-id="'.concat(annotation.parentId, '"]'));
    var container = document.querySelector('[data-annotation-id="'.concat(annotation.id, '"]'));
    if (!parent || !container) {
      return;
    }
    var left = parseFloat(parent.style.left);
    var top = parseFloat(parent.style.top) + parseFloat(parent.style.height);
    container.style.left = "".concat(left, "px");
    container.style.top = "".concat(top, "px");
    container.style.transformOrigin = "-".concat(left, "px -").concat(top, "px");
  }, []);
  return createElement(
    Annotation,
    {
      annotation: annotation,
      hasPopup: hasPopup,
      ignoreBorder: false,
      isRenderable: isRenderable,
      page: page,
      viewport: viewport,
    },
    function (props) {
      return createElement(
        "div",
        __assign({}, props.slot.attrs, {
          className: "rpv-core__annotation rpv-core__annotation--popup",
          "data-annotation-id": annotation.id,
        }),
        createElement(PopupWrapper, { annotation: annotation })
      );
    }
  );
};

export default Popup;
