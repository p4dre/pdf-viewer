import { useRef, useLayoutEffect } from "react";
let LayerRenderStatus;
(function (LayerRenderStatus) {
  LayerRenderStatus[(LayerRenderStatus["PreRender"] = 0)] = "PreRender";
  LayerRenderStatus[(LayerRenderStatus["DidRender"] = 1)] = "DidRender";
})(LayerRenderStatus || (LayerRenderStatus = {}));
const floatToRatio = (x, limit) => {
  if (Math.floor(x) === x) {
    return [x, 1];
  }
  const y = 1 / x;
  if (y > limit) {
    return [1, limit];
  }
  if (Math.floor(y) === y) {
    return [1, y];
  }
  const value = x > 1 ? y : x;
  let a = 0,
    b = 1,
    c = 1,
    d = 1;
  while (true) {
    const numerator = a + c;
    const denominator = b + d;
    if (denominator > limit) {
      break;
    }
    if (value <= numerator / denominator) {
      [c, d] = [numerator, denominator];
    } else {
      [a, b] = [numerator, denominator];
    }
  }
  const middle = (a / b + c / d) / 2;
  return value < middle ? (value === x ? [a, b] : [b, a]) : value === x ? [c, d] : [d, c];
};

const roundToDivide = function (a, b) {
  var remainder = a % b;
  return remainder === 0 ? a : Math.floor(a - remainder);
};
const MAX_CANVAS_SIZE = 4096 * 4096;
const CanvasLayer = function (props) {
  const { canvasLayerRef, height, page, pageIndex, plugins, rotation, scale, width, onRenderCanvasCompleted } = props;
  var renderTask = useRef();
  useLayoutEffect(function () {
    var task = renderTask.current;
    if (task) {
      task.cancel();
    }
    var canvasEle = canvasLayerRef.current;
    canvasEle.removeAttribute("data-testid");
    // plugins.forEach(function (plugin) {
    //   if (plugin.onCanvasLayerRender) {
    //     plugin.onCanvasLayerRender({
    //       ele: canvasEle,
    //       pageIndex: pageIndex,
    //       rotation: rotation,
    //       scale: scale,
    //       status: LayerRenderStatus.PreRender,
    //     });
    //   }
    // });
    var viewport = page.getViewport({
      rotation: rotation,
      scale: scale,
    });
    var outputScale = window.devicePixelRatio || 1;
    var maxScale = Math.sqrt(MAX_CANVAS_SIZE / (viewport.width * viewport.height));
    var shouldScaleByCSS = outputScale > maxScale;
    shouldScaleByCSS ? (canvasEle.style.transform = "scale(1, 1)") : canvasEle.style.removeProperty("transform");
    var possibleScale = Math.min(maxScale, outputScale);
    var _a = floatToRatio(possibleScale, 8),
      x = _a[0],
      y = _a[1];
    canvasEle.width = roundToDivide(viewport.width * possibleScale, x);
    canvasEle.height = roundToDivide(viewport.height * possibleScale, x);
    canvasEle.style.width = "".concat(roundToDivide(viewport.width, y), "px");
    canvasEle.style.height = "".concat(roundToDivide(viewport.height, y), "px");
    canvasEle.hidden = true;
    var canvasContext = canvasEle.getContext("2d", { alpha: false });
    var transform = shouldScaleByCSS || outputScale !== 1 ? [possibleScale, 0, 0, possibleScale, 0, 0] : null;
    renderTask.current = page.render({
      canvasContext: canvasContext,
      transform: transform,
      viewport: viewport,
    });
    renderTask.current.promise.then(
      function () {
        canvasEle.hidden = false;
        canvasEle.setAttribute("data-testid", "core__canvas-layer-".concat(pageIndex));
        plugins.forEach(function (plugin) {
          if (plugin.onCanvasLayerRender) {
            plugin.onCanvasLayerRender({
              ele: canvasEle,
              pageIndex: pageIndex,
              rotation: rotation,
              scale: scale,
              status: LayerRenderStatus.DidRender,
            });
          }
        });
        onRenderCanvasCompleted();
      },
      function () {
        onRenderCanvasCompleted();
      }
    );
    return function () {
      if (canvasEle) {
        canvasEle.width = 0;
        canvasEle.height = 0;
      }
    };
  }, []);
  return (
    <div className="rpv-core__canvas-layer" style={{ width: `${width}px`, height: `${height}px` }}>
      <canvas ref={canvasLayerRef} />
    </div>
  );
};

export default CanvasLayer;
