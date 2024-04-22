import { useRef, createElement, useLayoutEffect } from "react";
import * as PdfJsApi from "pdfjs-dist/build/pdf";

var SvgLayer = function (_a) {
  var height = _a.height,
    page = _a.page,
    rotation = _a.rotation,
    scale = _a.scale,
    width = _a.width;
  var containerRef = useRef();
  var empty = function () {
    var containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    containerEle.innerHTML = "";
  };
  useLayoutEffect(function () {
    var containerEle = containerRef.current;
    var viewport = page.getViewport({ rotation: rotation, scale: scale });
    page.getOperatorList().then(function (operatorList) {
      empty();
      var graphic = new PdfJsApi.SVGGraphics(page.commonObjs, page.objs);
      graphic.getSVG(operatorList, viewport).then(function (svg) {
        svg.style.height = "".concat(height, "px");
        svg.style.width = "".concat(width, "px");
        containerEle.appendChild(svg);
      });
    });
  }, []);
  return createElement("div", {
    className: "rpv-core__svg-layer",
    ref: containerRef,
  });
};

export default SvgLayer;
