import { useState, useRef, useEffect, Fragment } from "react";
import Spinner from "./Spinner";
import AnnotationLayer from "./AnnotationLayer";
import CanvasLayer from "./CanvasLayer";
import SvgLayer from "./SvgLayer";
import TextLayer from "./TextLayer";
import useIsMounted from "./hooks/useIsMounted";

let ViewMode;
(function (ViewMode) {
  ViewMode["DualPage"] = "DualPage";
  ViewMode["DualPageWithCover"] = "DualPageWithCover";
  ViewMode["SinglePage"] = "SinglePage";
})(ViewMode || (ViewMode = {}));

var pageOutlinesMap = new Map();
var pagesMap = new Map();

var cacheOutlineRef = function (doc, outline, pageIndex) {
  pageOutlinesMap.set(generateRefKey(doc, outline), pageIndex);
};

var generateRefKey = function (doc, outline) {
  return ""
    .concat(doc.loadingTask.docId, "___")
    .concat(outline.num, "R")
    .concat(outline.gen === 0 ? "" : outline.gen);
};

var getPage = function (doc, pageIndex) {
  if (!doc) {
    return Promise.reject("The document is not loaded yet");
  }
  var pageKey = "".concat(doc.loadingTask.docId, "___").concat(pageIndex);
  var page = pagesMap.get(pageKey);
  if (page) {
    return Promise.resolve(page);
  }
  return new Promise(function (resolve, _) {
    doc.getPage(pageIndex + 1).then(function (page) {
      pagesMap.set(pageKey, page);
      if (page.ref) {
        cacheOutlineRef(doc, page.ref, pageIndex);
      }
      resolve(page);
    });
  });
};

const PageLayer = (props) => {
  const { doc, measureRef, outlines, pageIndex, pageRotation, pageSize, plugins, renderPage, renderQueueKey, rotation, scale, shouldRender, viewMode, onExecuteNamedAction, onJumpFromLinkAnnotation, onJumpToDest, onRenderCompleted, onRotatePage } = props;

  const isMounted = useIsMounted();
  const [page, setPage] = useState(null);

  const [canvasLayerRendered, setCanvasLayerRendered] = useState(false);
  const [textLayerRendered, setTextLayerRendered] = useState(false);
  const canvasLayerRef = useRef();
  const textLayerRef = useRef();
  const isVertical = Math.abs(rotation + pageRotation) % 180 === 0;
  const scaledWidth = pageSize.pageWidth * scale;
  const scaledHeight = pageSize.pageHeight * scale;
  const w = isVertical ? scaledWidth : scaledHeight;
  const h = isVertical ? scaledHeight : scaledWidth;
  const rotationValue = (pageSize.rotation + rotation + pageRotation) % 360;
  const renderQueueKeyRef = useRef(0);

  const determinePageInstance = () => {
    getPage(doc, pageIndex).then((pdfPage) => {
      if (isMounted.current) {
        renderQueueKeyRef.current = renderQueueKey;
        setPage(pdfPage);
      }
    });
  };
  const defaultPageRenderer = (props) => {
    return (
      <>
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}
      </>
    );
    // return createElement(Fragment, null, props.canvasLayer.children, props.textLayer.children, props.annotationLayer.children);
  };
  const renderPageLayer = renderPage || defaultPageRenderer;
  const handleRenderCanvasCompleted = () => {
    if (isMounted.current) {
      setCanvasLayerRendered(true);
    }
  };
  const handleRenderTextCompleted = () => {
    if (isMounted.current) {
      setTextLayerRendered(true);
    }
  };
  useEffect(() => {
    setPage(null);
    setCanvasLayerRendered(false);
    setTextLayerRendered(false);
  }, [pageRotation, rotation, scale]);
  useEffect(
    function () {
      if (shouldRender && isMounted.current && !page) {
        determinePageInstance();
      }
    },
    [shouldRender, page]
  );
  useEffect(() => {
    if (canvasLayerRendered && textLayerRendered) {
      if (renderQueueKey !== renderQueueKeyRef.current) {
        setPage(null);
        setCanvasLayerRendered(false);
        setTextLayerRendered(false);
      } else {
        onRenderCompleted(pageIndex);
      }
    }
  }, [canvasLayerRendered, textLayerRendered]);
  return (
    <div
      ref={measureRef}
      data-testid={`core__page-layer-${pageIndex}`}
      className={`rpv-core__page-layer ${viewMode === ViewMode.DualPage ? "rpv-core__page-layer--dual" : ""} ${viewMode === ViewMode.DualPageWithCover ? "rpv-core__page-layer--dual-cover" : ""} ${viewMode === ViewMode.SinglePage ? "rpv-core__page-layer--single" : ""}`}
      style={{ height: `${h}px`, width: `$wh}px` }}
    >
      {!page ? (
        <Spinner testId={`core__page-layer-loading-${pageIndex}`} />
      ) : (
        <>
          {renderPageLayer({
            annotationLayer: {
              attrs: {},
              children: <AnnotationLayer doc={doc} outlines={outlines} page={page} pageIndex={pageIndex} plugins={plugins} rotation={rotationValue} scale={scale} onExecuteNamedAction={onExecuteNamedAction} onJumpFromLinkAnnotation={onJumpFromLinkAnnotation} onJumpToDest={onJumpToDest} />,
            },
            canvasLayer: {
              attrs: {},
              children: <CanvasLayer canvasLayerRef={canvasLayerRef} height={h} width={w} page={page} pageIndex={pageIndex} plugins={plugins} rotation={rotationValue} scale={scale} onRenderCanvasCompleted={handleRenderCanvasCompleted} />,
            },
            canvasLayerRendered: canvasLayerRendered,
            doc: doc,
            height: h,
            pageIndex: pageIndex,
            rotation: rotationValue,
            scale: scale,
            svgLayer: {
              attrs: {},
              children: <SvgLayer width={w} height={h} page={page} rotation={rotationValue} scale={scale} />,
            },
            textLayer: {
              attrs: {},
              children: <TextLayer containerRef={textLayerRef} page={page} pageIndex={pageIndex} plugins={plugins} rotation={rotationValue} scale={scale} onRenderTextCompleted={handleRenderTextCompleted} />,
            },
            textLayerRendered: textLayerRendered,
            width: w,
            markRendered: onRenderCompleted,
            onRotatePage: function (direction) {
              return onRotatePage(pageIndex, direction);
            },
          })}
          {plugins.map((plugin, idx) => {
            return plugin.renderPageLayer ? (
              <Fragment key={idx}>
                {plugin.renderPageLayer({
                  canvasLayerRef: canvasLayerRef,
                  canvasLayerRendered: canvasLayerRendered,
                  doc: doc,
                  height: h,
                  pageIndex: pageIndex,
                  rotation: rotationValue,
                  scale: scale,
                  textLayerRef: textLayerRef,
                  textLayerRendered: textLayerRendered,
                  width: w,
                })}
              </Fragment>
            ) : (
              <Fragment key={idx} />
            );
          })}
        </>
      )}
    </div>
  );
};

export default PageLayer;
