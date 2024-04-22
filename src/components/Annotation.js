import { createElement, Fragment } from "react";
import useTogglePopup from "../hooks/useTogglePopup";
import PopupWrapper from "./PopupWrapper";
var AnnotationBorderStyleType;
(function (AnnotationBorderStyleType) {
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Solid"] = 1)] = "Solid";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Dashed"] = 2)] = "Dashed";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Beveled"] = 3)] = "Beveled";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Inset"] = 4)] = "Inset";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Underline"] = 5)] = "Underline";
})(AnnotationBorderStyleType || (AnnotationBorderStyleType = {}));
const Annotation = (props) => {
  const { annotation, children, ignoreBorder, hasPopup, isRenderable, page, viewport } = props;

  const rect = annotation.rect;
  var _b = useTogglePopup(),
    closeOnHover = _b.closeOnHover,
    opened = _b.opened,
    openOnHover = _b.openOnHover,
    toggleOnClick = _b.toggleOnClick;
  var normalizeRect = function (r) {
    return [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];
  };
  var bound = normalizeRect([rect[0], page.view[3] + page.view[1] - rect[1], rect[2], page.view[3] + page.view[1] - rect[3]]);
  var width = rect[2] - rect[0];
  var height = rect[3] - rect[1];
  var styles = {
    borderColor: "",
    borderRadius: "",
    borderStyle: "",
    borderWidth: "",
  };
  if (!ignoreBorder && annotation.borderStyle.width > 0) {
    switch (annotation.borderStyle.style) {
      case AnnotationBorderStyleType.Dashed:
        styles.borderStyle = "dashed";
        break;
      case AnnotationBorderStyleType.Solid:
        styles.borderStyle = "solid";
        break;
      case AnnotationBorderStyleType.Underline:
        styles = Object.assign(
          {
            borderBottomStyle: "solid",
          },
          styles
        );
        break;
      case AnnotationBorderStyleType.Beveled:
      case AnnotationBorderStyleType.Inset:
    }
    var borderWidth = annotation.borderStyle.width;
    styles.borderWidth = "".concat(borderWidth, "px");
    if (annotation.borderStyle.style !== AnnotationBorderStyleType.Underline) {
      width = width - 2 * borderWidth;
      height = height - 2 * borderWidth;
    }
    var _c = annotation.borderStyle,
      horizontalCornerRadius = _c.horizontalCornerRadius,
      verticalCornerRadius = _c.verticalCornerRadius;
    if (horizontalCornerRadius > 0 || verticalCornerRadius > 0) {
      styles.borderRadius = "".concat(horizontalCornerRadius, "px / ").concat(verticalCornerRadius, "px");
    }
    annotation.color
      ? (styles.borderColor = "rgb("
          .concat(annotation.color[0] | 0, ", ")
          .concat(annotation.color[1] | 0, ", ")
          .concat(annotation.color[2] | 0, ")"))
      : (styles.borderWidth = "0");
  }
  return createElement(
    Fragment,
    null,
    isRenderable &&
      children({
        popup: {
          opened: opened,
          closeOnHover: closeOnHover,
          openOnHover: openOnHover,
          toggleOnClick: toggleOnClick,
        },
        slot: {
          attrs: {
            style: Object.assign(
              {
                height: "".concat(height, "px"),
                left: "".concat(bound[0], "px"),
                top: "".concat(bound[1], "px"),
                transform: "matrix(".concat(viewport.transform.join(","), ")"),
                transformOrigin: "-".concat(bound[0], "px -").concat(bound[1], "px"),
                width: "".concat(width, "px"),
              },
              styles
            ),
          },
          children: createElement(Fragment, null, hasPopup && opened && createElement(PopupWrapper, { annotation: annotation })),
        },
      })
  );
};

export default Annotation;
