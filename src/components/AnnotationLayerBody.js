import { useRef, useLayoutEffect, createElement, Fragment } from "react";
import Caret from "./Caret";
import Circle from "./Circle";
import FileAttachment from "./FileAttachment";
import FreeText from "./FreeText";
import Highlight from "./Highlight";
import Ink from "./Ink";
import Line from "./Line";
import Link from "./Link";
import Polygon from "./Polygon";
import Polyline from "./Polyline";
import Popup from "./Popup";
import Square from "./Square";
import Squiggly from "./Squiggly";
import Stamp from "./Stamp";
import StrikeOut from "./StrikeOut";
import Underline from "./Underline";

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

var AnnotationLayerBody = function (_a) {
  var annotations = _a.annotations,
    doc = _a.doc,
    outlines = _a.outlines,
    page = _a.page,
    pageIndex = _a.pageIndex,
    plugins = _a.plugins,
    rotation = _a.rotation,
    scale = _a.scale,
    onExecuteNamedAction = _a.onExecuteNamedAction,
    onJumpFromLinkAnnotation = _a.onJumpFromLinkAnnotation,
    onJumpToDest = _a.onJumpToDest;
  var containerRef = useRef();
  var viewport = page.getViewport({ rotation: rotation, scale: scale });
  var clonedViewPort = viewport.clone({ dontFlip: true });
  var filterAnnotations = annotations.filter(function (annotation) {
    return !annotation.parentId;
  });
  useLayoutEffect(function () {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    plugins.forEach(function (plugin) {
      if (plugin.onAnnotationLayerRender) {
        plugin.onAnnotationLayerRender({
          annotations: filterAnnotations,
          container: container,
          pageIndex: pageIndex,
          rotation: rotation,
          scale: scale,
        });
      }
    });
  }, []);
  return createElement(
    "div",
    {
      ref: containerRef,
      className: "rpv-core__annotation-layer",
      "data-testid": "core__annotation-layer-".concat(pageIndex),
    },
    filterAnnotations.map(function (annotation) {
      var childAnnotation = annotations.find(function (item) {
        return item.parentId === annotation.id;
      });
      switch (annotation.annotationType) {
        case AnnotationType.Caret:
          return createElement(Caret, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Circle:
          return createElement(Circle, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.FileAttachment:
          return createElement(FileAttachment, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.FreeText:
          return createElement(FreeText, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Highlight:
          return createElement(Highlight, {
            key: annotation.id,
            annotation: annotation,
            childAnnotation: childAnnotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Ink:
          return createElement(Ink, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Line:
          return createElement(Line, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Link:
          return createElement(Link, {
            key: annotation.id,
            annotation: annotation,
            annotationContainerRef: containerRef,
            doc: doc,
            outlines: outlines,
            page: page,
            pageIndex: pageIndex,
            scale: scale,
            viewport: clonedViewPort,
            onExecuteNamedAction: onExecuteNamedAction,
            onJumpFromLinkAnnotation: onJumpFromLinkAnnotation,
            onJumpToDest: onJumpToDest,
          });
        case AnnotationType.Polygon:
          return createElement(Polygon, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Polyline:
          return createElement(Polyline, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Popup:
          return createElement(Popup, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Square:
          return createElement(Square, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Squiggly:
          return createElement(Squiggly, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Stamp:
          return createElement(Stamp, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.StrikeOut:
          return createElement(StrikeOut, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Text:
          return createElement(Text, {
            key: annotation.id,
            annotation: annotation,
            childAnnotation: childAnnotation,
            page: page,
            viewport: clonedViewPort,
          });
        case AnnotationType.Underline:
          return createElement(Underline, {
            key: annotation.id,
            annotation: annotation,
            page: page,
            viewport: clonedViewPort,
          });
        default:
          return createElement(Fragment, { key: annotation.id });
      }
    })
  );
};

export default AnnotationLayerBody;
