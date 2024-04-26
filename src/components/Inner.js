import { useState, useMemo, useRef, useCallback, useLayoutEffect, useEffect, useContext, Fragment, createElement } from "react";
import ThemeContext from "../context/ThemeContext";
import LocalizationContext from "../context/LocalizationContext";
import PageLayer from "../Layers/PageLayer";
import useDestination from "../hooks/useDestination";
import usePrevious from "../hooks/usePrevious";
import useOutlines from "../hooks/useOutlines";
import useFullScreen from "../hooks/useFullScreen";
import useRenderQueue from "../hooks/useRenderQueue";
import useVirtual from "../hooks/useVirtual";
import useDebounceCallback from "../hooks/useDebounceCallback";
import useTrackResize from "../hooks/useTrackResize";
import useRunOnce from "../hooks/useRunOnce";
import { FullScreenMode, ScrollMode, SpecialZoomLevel, RotateDirection, ViewMode, TextDirection } from "../enums";
import { chunk, calculateScale, getPage } from "../utils";

var ZERO_OFFSET = {
  left: 0,
  top: 0,
};

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

var classNames = function (classes) {
  var result = [];
  Object.keys(classes).forEach(function (clazz) {
    if (clazz && classes[clazz]) {
      result.push(clazz);
    }
  });
  return result.join(" ");
};

var getFileExt = function (url) {
  var str = url.split(/\./).pop();
  return str ? str.toLowerCase() : "";
};

var DEFAULT_PAGE_LAYOUT = {
  buildPageStyles: function () {
    return {};
  },
  transformSize: function (_a) {
    var size = _a.size;
    return size;
  },
};

var pageOutlinesMap = new Map();
var pagesMap = new Map();

var clearPagesCache = function () {
  pageOutlinesMap.clear();
  pagesMap.clear();
};

const Inner = (props) => {
  const { currentFile, defaultScale, doc, enableSmoothScroll, initialPage, initialRotation, initialScale, pageLayout, pageSizes, plugins, renderPage, scrollMode, setRenderRange, viewMode, viewerState, onDocumentLoad, onOpenFile, onPageChange, onRotate, onRotatePage, onZoom } = props;
  const numPages = doc.numPages;
  const docId = doc.loadingTask.docId;
  const l10n = useContext(LocalizationContext).l10n;
  const themeContext = useContext(ThemeContext);
  const isRtl = themeContext.direction === TextDirection.RightToLeft;
  const containerRef = useRef();
  const pagesRef = useRef();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const mostRecentVisitedRef = useRef(null);
  const destinationManager = useDestination({
    getCurrentPage: () => {
      return stateRef.current.pageIndex;
    },
  });
  const [rotation, setRotation] = useState(initialRotation);
  const previousRotation = usePrevious(rotation);
  const [pagesRotationChanged, setPagesRotationChanged] = useState(false);
  const [pagesRotation, setPagesRotation] = useState(new Map());
  const [currentScrollMode, setCurrentScrollMode] = useState(scrollMode);
  const previousScrollMode = usePrevious(currentScrollMode);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const previousViewMode = usePrevious(currentViewMode);
  const outlines = useOutlines(doc);
  const [scale, setScale] = useState(initialScale);
  const previousScale = usePrevious(scale);
  const stateRef = useRef(viewerState);
  const keepSpecialZoomLevelRef = useRef(typeof defaultScale === "string" ? defaultScale : null);
  const forceTargetFullScreenRef = useRef(-1);
  const forceTargetZoomRef = useRef(-1);
  const forceTargetInitialPageRef = useRef(initialPage);
  const fullScreen = useFullScreen({
    getCurrentPage: function () {
      return stateRef.current.pageIndex;
    },
    getCurrentScrollMode: function () {
      return stateRef.current.scrollMode;
    },
    jumpToPage: function (pageIndex) {
      return jumpToPage(pageIndex);
    },
    targetRef: pagesRef,
  });
  const [renderPageIndex, setRenderPageIndex] = useState(-1);
  const [renderQueueKey, setRenderQueueKey] = useState(0);
  const renderQueue = useRenderQueue({ doc: doc });
  useEffect(() => {
    return () => {
      clearPagesCache();
    };
  }, [docId]);
  const layoutBuilder = useMemo(() => {
    return Object.assign({}, DEFAULT_PAGE_LAYOUT, pageLayout);
  }, []);
  const sizes = useMemo(() => {
    return Array(numPages)
      .fill(0)
      .map((_, pageIndex) => {
        var pageSize = [pageSizes[pageIndex].pageHeight, pageSizes[pageIndex].pageWidth];
        var rect =
          Math.abs(rotation) % 180 === 0
            ? {
                height: pageSize[0],
                width: pageSize[1],
              }
            : {
                height: pageSize[1],
                width: pageSize[0],
              };
        var pageRect = {
          height: rect.height * scale,
          width: rect.width * scale,
        };
        return layoutBuilder.transformSize({
          numPages: numPages,
          pageIndex: pageIndex,
          size: pageRect,
        });
      });
  }, [rotation, scale]);
  console.log("virtual Props ");
  console.log("numPages ", numPages);
  console.log("sizes ", sizes);
  console.log("currentViewMode ", currentViewMode);
  const virtualizer = useVirtual({
    enableSmoothScroll: enableSmoothScroll,
    isRtl: isRtl,
    numberOfItems: numPages,
    parentRef: pagesRef,
    scrollMode: currentScrollMode,
    setRenderRange: setRenderRange,
    sizes: sizes,
    viewMode: currentViewMode,
  });
  const handlePagesResize = useDebounceCallback(() => {
    if (!keepSpecialZoomLevelRef.current || stateRef.current.fullScreenMode !== FullScreenMode.Normal || (initialPage > 0 && forceTargetInitialPageRef.current === initialPage)) {
      return;
    }
    zoom(keepSpecialZoomLevelRef.current);
  }, 200);
  useTrackResize({
    targetRef: pagesRef,
    onResize: handlePagesResize,
  });
  const setViewerState = (viewerState) => {
    let newState = viewerState;
    plugins.forEach((plugin) => {
      if (plugin.onViewerStateChange) {
        newState = plugin.onViewerStateChange(newState);
      }
    });
    stateRef.current = newState;
  };
  const getPagesContainer = () => {
    return pagesRef.current;
  };
  const getViewerState = () => {
    return stateRef.current;
  };
  const handleJumpFromLinkAnnotation = useCallback((destination) => {
    destinationManager.markVisitedDestination(destination);
  }, []);
  const handleJumpToDestination = useCallback((destination) => {
    const pageIndex = destination.pageIndex,
      bottomOffset = destination.bottomOffset,
      leftOffset = destination.leftOffset,
      scaleTo = destination.scaleTo;
    const pagesContainer = pagesRef.current;
    const currentState = stateRef.current;
    if (!pagesContainer || !currentState) {
      return Promise.resolve();
    }
    return new Promise((resolve, _) => {
      getPage(doc, pageIndex).then(function (page) {
        const viewport = page.getViewport({ scale: 1 });
        let top = 0;
        let bottom = (typeof bottomOffset === "function" ? bottomOffset(viewport.width, viewport.height) : bottomOffset) || 0;
        let left = (typeof leftOffset === "function" ? leftOffset(viewport.width, viewport.height) : leftOffset) || 0;
        const updateScale = currentState.scale;
        switch (scaleTo) {
          case SpecialZoomLevel.PageFit:
            top = 0;
            left = 0;
            zoom(SpecialZoomLevel.PageFit);
            break;
          case SpecialZoomLevel.PageWidth:
            updateScale = calculateScale(pagesContainer, pageSizes[pageIndex].pageHeight, pageSizes[pageIndex].pageWidth, SpecialZoomLevel.PageWidth, viewMode, numPages);
            top = (viewport.height - bottom) * updateScale;
            left = left * updateScale;
            zoom(updateScale);
            break;
          default:
            top = (viewport.height - bottom) * updateScale;
            left = left * updateScale;
            break;
        }
        switch (currentState.scrollMode) {
          case ScrollMode.Horizontal:
            virtualizer.scrollToItem(pageIndex, { left: left, top: 0 }).then(function () {
              resolve();
            });
            break;
          case ScrollMode.Vertical:
          default:
            virtualizer.scrollToItem(pageIndex, { left: 0, top: top }).then(function () {
              resolve();
            });
            break;
        }
      });
    });
  }, []);
  const jumpToDestination = useCallback((destination) => {
    destinationManager.markVisitedDestination(destination);
    return handleJumpToDestination(destination);
  }, []);
  const jumpToNextDestination = useCallback(() => {
    var nextDestination = destinationManager.getNextDestination();
    return nextDestination ? handleJumpToDestination(nextDestination) : Promise.resolve();
  }, []);
  const jumpToPreviousDestination = useCallback(() => {
    var lastDestination = destinationManager.getPreviousDestination();
    return lastDestination ? handleJumpToDestination(lastDestination) : Promise.resolve();
  }, []);
  const jumpToNextPage = useCallback(() => {
    return virtualizer.scrollToNextItem(stateRef.current.pageIndex, ZERO_OFFSET);
  }, []);
  const jumpToPage = useCallback((pageIndex) => {
    return 0 <= pageIndex && pageIndex < numPages ? virtualizer.scrollToItem(pageIndex, ZERO_OFFSET) : Promise.resolve();
  }, []);
  const jumpToPreviousPage = useCallback(() => {
    return virtualizer.scrollToPreviousItem(stateRef.current.pageIndex, ZERO_OFFSET);
  }, []);
  const openFile = useCallback(
    (file) => {
      if (getFileExt(file.name).toLowerCase() !== "pdf") {
        return;
      }
      new Promise((resolve) => {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          var bytes = new Uint8Array(reader.result);
          resolve(bytes);
        };
      }).then(function (data) {
        onOpenFile(file.name, data);
      });
    },
    [onOpenFile]
  );
  const rotate = useCallback((direction) => {
    const degrees = direction === RotateDirection.Backward ? -90 : 90;
    const currentRotation = stateRef.current.rotation;
    const updateRotation = currentRotation === 360 || currentRotation === -360 ? degrees : currentRotation + degrees;
    renderQueue.markNotRendered();
    setRotation(updateRotation);
    setViewerState(__assign(__assign({}, stateRef.current), { rotation: updateRotation }));
    onRotate({ direction: direction, doc: doc, rotation: updateRotation });
  }, []);
  const rotatePage = useCallback((pageIndex, direction) => {
    var degrees = direction === RotateDirection.Backward ? -90 : 90;
    var rotations = stateRef.current.pagesRotation;
    var currentPageRotation = rotations.has(pageIndex) ? rotations.get(pageIndex) : initialRotation;
    var finalRotation = currentPageRotation + degrees;
    var updateRotations = rotations.set(pageIndex, finalRotation);
    setPagesRotation(updateRotations);
    setPagesRotationChanged(function (value) {
      return !value;
    });
    setViewerState(
      __assign(__assign({}, stateRef.current), {
        pagesRotation: updateRotations,
        rotatedPage: pageIndex,
      })
    );
    onRotatePage({
      direction: direction,
      doc: doc,
      pageIndex: pageIndex,
      rotation: finalRotation,
    });
    renderQueue.markRendering(pageIndex);
    setRenderPageIndex(pageIndex);
  }, []);
  var switchScrollMode = useCallback(function (scrollMode) {
    setViewerState(__assign(__assign({}, stateRef.current), { scrollMode: scrollMode }));
    setCurrentScrollMode(scrollMode);
  }, []);
  var switchViewMode = useCallback(function (viewMode) {
    setViewerState(__assign(__assign({}, stateRef.current), { viewMode: viewMode }));
    setCurrentViewMode(viewMode);
  }, []);
  var zoom = useCallback(function (newScale) {
    var pagesEle = pagesRef.current;
    var currentPage = stateRef.current.pageIndex;
    if (currentPage < 0 || currentPage >= numPages) {
      return;
    }
    var currentPageHeight = pageSizes[currentPage].pageHeight;
    var currentPageWidth = pageSizes[currentPage].pageWidth;
    var updateScale = pagesEle ? (typeof newScale === "string" ? calculateScale(pagesEle, currentPageHeight, currentPageWidth, newScale, stateRef.current.viewMode, numPages) : newScale) : 1;
    keepSpecialZoomLevelRef.current = typeof newScale === "string" ? newScale : null;
    if (updateScale === stateRef.current.scale) {
      return;
    }
    setRenderQueueKey(function (key) {
      return key + 1;
    });
    renderQueue.markNotRendered();
    setScale(updateScale);
    onZoom({ doc: doc, scale: updateScale });
    setViewerState(__assign(__assign({}, stateRef.current), { scale: updateScale }));
  }, []);
  var enterFullScreenMode = useCallback(function (target) {
    fullScreen.enterFullScreenMode(target);
  }, []);
  var exitFullScreenMode = useCallback(function () {
    fullScreen.exitFullScreenMode();
  }, []);
  useEffect(
    function () {
      setViewerState(
        __assign(__assign({}, stateRef.current), {
          fullScreenMode: fullScreen.fullScreenMode,
        })
      );
    },
    [fullScreen.fullScreenMode]
  );
  useEffect(
    function () {
      var pluginMethods = {
        enterFullScreenMode: enterFullScreenMode,
        exitFullScreenMode: exitFullScreenMode,
        getPagesContainer: getPagesContainer,
        getViewerState: getViewerState,
        jumpToDestination: jumpToDestination,
        jumpToNextDestination: jumpToNextDestination,
        jumpToPreviousDestination: jumpToPreviousDestination,
        jumpToNextPage: jumpToNextPage,
        jumpToPreviousPage: jumpToPreviousPage,
        jumpToPage: jumpToPage,
        openFile: openFile,
        rotate: rotate,
        rotatePage: rotatePage,
        setViewerState: setViewerState,
        switchScrollMode: switchScrollMode,
        switchViewMode: switchViewMode,
        zoom: zoom,
      };
      plugins.forEach(function (plugin) {
        if (plugin.install) {
          plugin.install(pluginMethods);
        }
      });
      return function () {
        plugins.forEach(function (plugin) {
          if (plugin.uninstall) {
            plugin.uninstall(pluginMethods);
          }
        });
      };
    },
    [docId]
  );
  useEffect(
    function () {
      onDocumentLoad({ doc: doc, file: currentFile });
      plugins.forEach(function (plugin) {
        plugin.onDocumentLoad && plugin.onDocumentLoad({ doc: doc, file: currentFile });
      });
    },
    [docId]
  );
  var boundingClientRect = virtualizer.boundingClientRect;
  useRunOnce(function () {
    if (initialPage) {
      jumpToPage(initialPage);
    }
  }, boundingClientRect.height > 0 && boundingClientRect.width > 0);
  useLayoutEffect(
    function () {
      var latestPage = stateRef.current.pageIndex;
      if (latestPage > -1 && previousScrollMode !== currentScrollMode) {
        virtualizer.scrollToItem(latestPage, ZERO_OFFSET).then(function () {
          if (fullScreen.fullScreenMode === FullScreenMode.EnteredCompletely) {
            if (!enableSmoothScroll) {
              renderQueue.markNotRendered();
            }
            forceTargetFullScreenRef.current = -1;
          }
        });
      }
    },
    [currentScrollMode]
  );
  useLayoutEffect(
    function () {
      var latestPage = stateRef.current.pageIndex;
      if (latestPage > -1 && previousRotation !== rotation) {
        virtualizer.scrollToItem(latestPage, ZERO_OFFSET);
      }
    },
    [rotation]
  );
  useLayoutEffect(
    function () {
      if (previousScale != 0 && previousScale != stateRef.current.scale) {
        virtualizer.zoom(stateRef.current.scale / previousScale, stateRef.current.pageIndex).then(function () {
          if (fullScreen.fullScreenMode === FullScreenMode.EnteredCompletely) {
            forceTargetZoomRef.current = -1;
          }
        });
      }
    },
    [scale]
  );
  useLayoutEffect(
    function () {
      if (previousViewMode === stateRef.current.viewMode) {
        return;
      }
      var startPage = virtualizer.startPage,
        endPage = virtualizer.endPage,
        virtualItems = virtualizer.virtualItems;
      renderQueue.markNotRendered();
      renderQueue.setRange(startPage, endPage);
      var _loop_1 = function (i) {
        var item = virtualItems.find(function (item) {
          return item.index === i;
        });
        if (item) {
          renderQueue.setVisibility(i, item.visibility);
        }
      };
      for (var i = startPage; i <= endPage; i++) {
        _loop_1(i);
      }
      renderNextPage();
    },
    [currentViewMode]
  );
  useLayoutEffect(
    function () {
      var latestPage = stateRef.current.pageIndex;
      if (latestPage > -1 && previousViewMode !== currentViewMode) {
        virtualizer.scrollToItem(latestPage, ZERO_OFFSET);
      }
    },
    [currentViewMode]
  );
  useLayoutEffect(
    function () {
      var latestPage = stateRef.current.pageIndex;
      if (latestPage > 0 && latestPage === initialPage && forceTargetInitialPageRef.current === initialPage && keepSpecialZoomLevelRef.current) {
        forceTargetInitialPageRef.current = -1;
        zoom(keepSpecialZoomLevelRef.current);
      }
    },
    [currentPage]
  );
  useEffect(
    function () {
      var isSmoothScrolling = virtualizer.isSmoothScrolling;
      if (isSmoothScrolling) {
        return;
      }
      if (mostRecentVisitedRef.current === null || mostRecentVisitedRef.current !== currentPage) {
        mostRecentVisitedRef.current = currentPage;
        onPageChange({ currentPage: currentPage, doc: doc });
      }
    },
    [currentPage, virtualizer.isSmoothScrolling]
  );
  useEffect(
    function () {
      if (fullScreen.fullScreenMode === FullScreenMode.Entering && stateRef.current.scrollMode === ScrollMode.Page) {
        forceTargetFullScreenRef.current = stateRef.current.pageIndex;
      }
      if (fullScreen.fullScreenMode === FullScreenMode.EnteredCompletely && stateRef.current.scrollMode === ScrollMode.Page && enableSmoothScroll) {
        forceTargetFullScreenRef.current = -1;
      }
      if (fullScreen.fullScreenMode === FullScreenMode.EnteredCompletely && keepSpecialZoomLevelRef.current) {
        forceTargetZoomRef.current = stateRef.current.pageIndex;
        zoom(keepSpecialZoomLevelRef.current);
      }
    },
    [fullScreen.fullScreenMode]
  );
  useEffect(
    function () {
      if (fullScreen.fullScreenMode === FullScreenMode.Entering || fullScreen.fullScreenMode === FullScreenMode.Exitting || virtualizer.isSmoothScrolling) {
        return;
      }
      var startPage = virtualizer.startPage,
        endPage = virtualizer.endPage,
        maxVisbilityIndex = virtualizer.maxVisbilityIndex,
        virtualItems = virtualizer.virtualItems;
      var currentPage = maxVisbilityIndex;
      var isFullScreen = fullScreen.fullScreenMode === FullScreenMode.Entered || fullScreen.fullScreenMode === FullScreenMode.EnteredCompletely;
      if (isFullScreen && currentPage !== forceTargetFullScreenRef.current && forceTargetFullScreenRef.current > -1) {
        return;
      }
      if (isFullScreen && currentPage !== forceTargetZoomRef.current && forceTargetZoomRef.current > -1) {
        return;
      }
      setCurrentPage(currentPage);
      setViewerState(__assign(__assign({}, stateRef.current), { pageIndex: currentPage }));
      renderQueue.setRange(startPage, endPage);
      var _loop_2 = function (i) {
        var item = virtualItems.find(function (item) {
          return item.index === i;
        });
        if (item) {
          renderQueue.setVisibility(i, item.visibility);
        }
      };
      for (var i = startPage; i <= endPage; i++) {
        _loop_2(i);
      }
      renderNextPage();
    },
    [virtualizer.startPage, virtualizer.endPage, virtualizer.isSmoothScrolling, virtualizer.maxVisbilityIndex, fullScreen.fullScreenMode, pagesRotationChanged, rotation, scale]
  );
  var handlePageRenderCompleted = useCallback(
    function (pageIndex) {
      renderQueue.markRendered(pageIndex);
      renderNextPage();
    },
    [renderQueueKey]
  );
  var renderNextPage = function () {
    var nextPage = renderQueue.getHighestPriorityPage();
    if (nextPage > -1 && renderQueue.isInRange(nextPage)) {
      renderQueue.markRendering(nextPage);
      setRenderPageIndex(nextPage);
    }
  };
  var executeNamedAction = function (action) {
    var previousPage = currentPage - 1;
    var nextPage = currentPage + 1;
    switch (action) {
      case "FirstPage":
        jumpToPage(0);
        break;
      case "LastPage":
        jumpToPage(numPages - 1);
        break;
      case "NextPage":
        nextPage < numPages && jumpToPage(nextPage);
        break;
      case "PrevPage":
        previousPage >= 0 && jumpToPage(previousPage);
        break;
    }
  };
  var renderViewer = useCallback(
    function () {
      var virtualItems = virtualizer.virtualItems;
      var chunks = [];
      switch (currentViewMode) {
        case ViewMode.DualPage:
          chunks = chunk(virtualItems, 2);
          break;
        case ViewMode.DualPageWithCover:
          if (virtualItems.length) {
            chunks = virtualItems[0].index === 0 ? [[virtualItems[0]]].concat(chunk(virtualItems.slice(1), 2)) : chunk(virtualItems, 2);
          }
          break;
        case ViewMode.SinglePage:
        default:
          chunks = chunk(virtualItems, 1);
          break;
      }
      var pageLabel = l10n && l10n.core ? l10n.core.pageLabel : "Page {{pageIndex}}";
      var slot = {
        attrs: {
          className: "rpv-core__inner-container",
          "data-testid": "core__inner-container",
          ref: containerRef,
          style: {
            height: "100%",
          },
        },
        children: <Fragment />,
        subSlot: {
          attrs: {
            "data-testid": "core__inner-pages",
            className: classNames({
              "rpv-core__inner-pages": true,
              "rpv-core__inner-pages--horizontal": currentScrollMode === ScrollMode.Horizontal,
              "rpv-core__inner-pages--rtl": isRtl,
              "rpv-core__inner-pages--single": currentScrollMode === ScrollMode.Page,
              "rpv-core__inner-pages--vertical": currentScrollMode === ScrollMode.Vertical,
              "rpv-core__inner-pages--wrapped": currentScrollMode === ScrollMode.Wrapped,
            }),
            ref: pagesRef,
            style: {
              height: "100%",
              position: "relative",
            },
          },
          children: (
            <div
              data-testid={`core__inner-current-page-${currentPage}`}
              style={{
                "--scale-factor": scale,
                ...virtualizer.getContainerStyles(),
              }}
            >
              {chunks.map((items) => (
                <div className={`rpv-core__inner-page-container ${currentScrollMode === ScrollMode.Page ? "rpv-core__inner-page-container--single" : ""}`} style={virtualizer.getItemContainerStyles(items[0])} key={`${items[0].index}-${currentViewMode}`}>
                  {items.map((item) => {
                    const isCover = currentViewMode === ViewMode.DualPageWithCover && (item.index === 0 || (numPages % 2 === 0 && item.index === numPages - 1));
                    return (
                      <div
                        aria-label={pageLabel.replace("{{pageIndex}}", `${item.index + 1}`)}
                        className={`rpv-core__inner-page ${currentViewMode === ViewMode.DualPage && item.index % 2 === 0 ? "rpv-core__inner-page--dual-even" : ""} ${currentViewMode === ViewMode.DualPage && item.index % 2 === 1 ? "rpv-core__inner-page--dual-odd" : ""} ${
                          currentViewMode === ViewMode.DualPageWithCover && !isCover && item.index % 2 === 0 ? "rpv-core__inner-page--dual-cover-even" : ""
                        } ${currentViewMode === ViewMode.DualPageWithCover && !isCover && item.index % 2 === 1 ? "rpv-core__inner-page--dual-cover-odd" : ""} ${currentViewMode === ViewMode.SinglePage && currentScrollMode === ScrollMode.Page ? "rpv-core__inner-page--single" : ""}`}
                        role="region"
                        key={`${item.index}-${currentViewMode}`}
                        style={{
                          ...virtualizer.getItemStyles(item),
                          ...layoutBuilder.buildPageStyles({
                            numPages: numPages,
                            pageIndex: item.index,
                            scrollMode: currentScrollMode,
                            viewMode: currentViewMode,
                          }),
                        }}
                      >
                        <PageLayer
                          doc={doc}
                          measureRef={item.measureRef}
                          outlines={outlines}
                          pageIndex={item.index}
                          pageRotation={pagesRotation.has(item.index) ? pagesRotation.get(item.index) : 0}
                          pageSize={pageSizes[item.index]}
                          plugins={plugins}
                          renderPage={renderPage}
                          renderQueueKey={renderQueueKey}
                          rotation={rotation}
                          scale={scale}
                          shouldRender={renderPageIndex === item.index}
                          viewMode={currentViewMode}
                          onExecuteNamedAction={executeNamedAction}
                          onJumpFromLinkAnnotation={handleJumpFromLinkAnnotation}
                          onJumpToDest={jumpToDestination}
                          onRenderCompleted={handlePageRenderCompleted}
                          onRotatePage={rotatePage}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ),
        },
      };

      plugins.forEach(function (plugin) {
        if (plugin.renderViewer) {
          slot = plugin.renderViewer(
            {
              containerRef: containerRef,
              doc: doc,
              pagesContainerRef: pagesRef,
              pagesRotation: pagesRotation,
              pageSizes: pageSizes,
              rotation: rotation,
              slot: slot,
              themeContext: themeContext,
              jumpToPage: jumpToPage,
              openFile: openFile,
              rotate: rotate,
              rotatePage: rotatePage,
              switchScrollMode: switchScrollMode,
              switchViewMode: switchViewMode,
              zoom: zoom,
            },
            "extra"
          );
        }
      });
      return slot;
    },
    [plugins, virtualizer]
  );
  var renderSlot = useCallback(function (slot) {
    return (
      <div style={slot.attrs?.style || {}} {...slot.attrs}>
        {slot.children}
        {slot.subSlot && renderSlot(slot.subSlot)}
      </div>
    );
  }, []);

  return renderSlot(renderViewer());
};

export default Inner;
