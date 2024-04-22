import { createElement } from "react";
import Annotation from "./Annotation";

var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
const Circle = (props) => {
  const { annotation, page, viewport } = props;
  const hasPopup = annotation.hasPopup === false;
  const title = getTitle(annotation);
  const contents = getContents(annotation);
  const isRenderable = !!(annotation.hasPopup || title || contents);
  const rect = annotation.rect;
  const width = rect[2] - rect[0];
  const height = rect[3] - rect[1];
  const borderWidth = annotation.borderStyle.width;
  const annotationProps = {
    annotation: annotation,
    hasPopup: hasPopup,
    ignoreBorder: true,
    isRenderable: isRenderable,
    page: page,
    viewport: viewport,
  };
  const svgProps = {
    height: "".concat(height, "px"),
    preserveAspectRatio: "none",
    version: "1.1",
    viewBox: "0 0 ".concat(width, " ").concat(height),
    width: "".concat(width, "px"),
  };
  const circleProps = {
    cy: height / 2,
    fill: "none",
    rx: width / 2 - borderWidth / 2,
    ry: height / 2 - borderWidth / 2,
    stroke: "transparent",
    strokeWidth: borderWidth || 1,
  };
  return (
    <Annotation {...annotationProps}>
      {(props) => (
        <div className={`rpv-core__annotation rpv-core__annotation--circle`} onClick={props.popup.toggleOnClick} onMouseEnter={props.popup.openOnHover} onMouseLeave={props.popup.closeOnHover}>
          <svg {...svgProps}>
            <circle {...circleProps} />
          </svg>
        </div>
      )}
    </Annotation>
  );
};

export default Circle;
