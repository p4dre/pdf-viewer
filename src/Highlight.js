import { createElement, Fragment } from "react";
import Annotation from "./Annotation";
import Popup from "./Popup";

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

let AnnotationType;
(function (AnnotationType) {
  AnnotationType[(AnnotationType["Text"] = 1)] = "Text";
  AnnotationType[(AnnotationType["Link"] = 2)] = "Link";
  AnnotationType[(AnnotationType["FreeText"] = 3)] = "FreeText";
  AnnotationType[(AnnotationType["Line"] = 4)] = "Line";
  AnnotationType[(AnnotationType["Square"] = 5)] = "Square";
  AnnotationType[(AnnotationType["Circle"] = 6)] = "Circle";
  AnnotationType[(AnnotationType["Polygon"] = 7)] = "Polygon";
  AnnotationType[(AnnotationType["Polyline"] = 8)] = "Polyline";
  AnnotationType[(AnnotationType["Highlight"] = 9)] = "Highlight";
  AnnotationType[(AnnotationType["Underline"] = 10)] = "Underline";
  AnnotationType[(AnnotationType["Squiggly"] = 11)] = "Squiggly";
  AnnotationType[(AnnotationType["StrikeOut"] = 12)] = "StrikeOut";
  AnnotationType[(AnnotationType["Stamp"] = 13)] = "Stamp";
  AnnotationType[(AnnotationType["Caret"] = 14)] = "Caret";
  AnnotationType[(AnnotationType["Ink"] = 15)] = "Ink";
  AnnotationType[(AnnotationType["Popup"] = 16)] = "Popup";
  AnnotationType[(AnnotationType["FileAttachment"] = 17)] = "FileAttachment";
})(AnnotationType || (AnnotationType = {}));

var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
const Highlight = (props) => {
  const { annotation, childAnnotation, page, viewport } = props;
  var hasPopup = annotation.hasPopup === false;
  var title = getTitle(annotation);
  var contents = getContents(annotation);
  var isRenderable = !!(annotation.hasPopup || title || contents);
  var hasQuadPoints = annotation.quadPoints && annotation.quadPoints.length > 0;
  if (hasQuadPoints) {
    var annotations = annotation.quadPoints.map(function (quadPoint) {
      return Object.assign({}, annotation, {
        rect: [quadPoint[2].x, quadPoint[2].y, quadPoint[1].x, quadPoint[1].y],
        quadPoints: [],
      });
    });
    return createElement(
      Fragment,
      null,
      annotations.map(function (ann, index) {
        return createElement(Highlight, {
          key: index,
          annotation: ann,
          childAnnotation: childAnnotation,
          page: page,
          viewport: viewport,
        });
      })
    );
  }
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
        Fragment,
        null,
        createElement(
          "div",
          __assign({}, props.slot.attrs, {
            className: "rpv-core__annotation rpv-core__annotation--highlight",
            "data-annotation-id": annotation.id,
            onClick: props.popup.toggleOnClick,
            onMouseEnter: props.popup.openOnHover,
            onMouseLeave: props.popup.closeOnHover,
          }),
          props.slot.children
        ),
        childAnnotation &&
          childAnnotation.annotationType === AnnotationType.Popup &&
          props.popup.opened &&
          createElement(Popup, {
            annotation: childAnnotation,
            page: page,
            viewport: viewport,
          })
      );
    }
  );
};

export default Highlight;
