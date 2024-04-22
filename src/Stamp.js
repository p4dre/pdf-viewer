import { createElement } from "react";
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

var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
var Stamp = function (_a) {
  var annotation = _a.annotation,
    page = _a.page,
    viewport = _a.viewport;
  var hasPopup = annotation.hasPopup === false;
  var title = getTitle(annotation);
  var contents = getContents(annotation);
  var isRenderable = !!(annotation.hasPopup || title || contents);
  return createElement(
    Annotation,
    {
      annotation: annotation,
      hasPopup: hasPopup,
      ignoreBorder: true,
      isRenderable: isRenderable,
      page: page,
      viewport: viewport,
    },
    function (props) {
      return createElement(
        "div",
        __assign({}, props.slot.attrs, {
          className: "rpv-core__annotation rpv-core__annotation--stamp",
          "data-annotation-id": annotation.id,
          onClick: props.popup.toggleOnClick,
          onMouseEnter: props.popup.openOnHover,
          onMouseLeave: props.popup.closeOnHover,
        }),
        props.slot.children
      );
    }
  );
};

export default Stamp;
