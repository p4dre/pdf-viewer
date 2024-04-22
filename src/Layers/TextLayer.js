import { useRef, createElement, useLayoutEffect } from "react";

import * as PdfJsApi from "pdfjs-dist/build/pdf";

let LayerRenderStatus;
(function (LayerRenderStatus) {
  LayerRenderStatus[(LayerRenderStatus["PreRender"] = 0)] = "PreRender";
  LayerRenderStatus[(LayerRenderStatus["DidRender"] = 1)] = "DidRender";
})(LayerRenderStatus || (LayerRenderStatus = {}));
var TextLayer = function (props) {
  const { containerRef, page, pageIndex, plugins, rotation, scale, onRenderTextCompleted } = props;
  var renderTask = useRef();
  var empty = function () {
    var containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    var spans = [].slice.call(containerEle.querySelectorAll(".rpv-core__text-layer-text"));
    spans.forEach(function (span) {
      return containerEle.removeChild(span);
    });
    var breaks = [].slice.call(containerEle.querySelectorAll('br[role="presentation"]'));
    breaks.forEach(function (br) {
      return containerEle.removeChild(br);
    });
  };
  useLayoutEffect(function () {
    var task = renderTask.current;
    if (task) {
      task.cancel();
    }
    var containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    containerEle.removeAttribute("data-testid");
    var viewport = page.getViewport({ rotation: rotation, scale: scale });
    plugins.forEach(function (plugin) {
      if (plugin.onTextLayerRender) {
        plugin.onTextLayerRender({
          ele: containerEle,
          pageIndex: pageIndex,
          scale: scale,
          status: LayerRenderStatus.PreRender,
        });
      }
    });
    page.getTextContent().then(function (textContent) {
      empty();
      renderTask.current = PdfJsApi.renderTextLayer({
        container: containerEle,
        textContent: textContent,
        textContentSource: textContent,
        viewport: viewport,
      });
      renderTask.current.promise.then(
        function () {
          containerEle.setAttribute("data-testid", "core__text-layer-".concat(pageIndex));
          var spans = [].slice.call(containerEle.children);
          spans.forEach(function (span) {
            if (!span.classList.contains("rpv-core__text-layer-text--not")) {
              span.classList.add("rpv-core__text-layer-text");
            }
          });
          plugins.forEach(function (plugin) {
            if (plugin.onTextLayerRender) {
              plugin.onTextLayerRender({
                ele: containerEle,
                pageIndex: pageIndex,
                scale: scale,
                status: LayerRenderStatus.DidRender,
              });
            }
          });
          onRenderTextCompleted();
        },
        function () {
          containerEle.removeAttribute("data-testid");
          onRenderTextCompleted();
        }
      );
    });
    return function () {
      var _a;
      empty();
      (_a = renderTask.current) === null || _a === void 0 ? void 0 : _a.cancel();
    };
  }, []);
  return createElement("div", {
    className: "rpv-core__text-layer",
    ref: containerRef,
  });
};

export default TextLayer;
